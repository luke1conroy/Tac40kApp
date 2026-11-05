import { useState, type FormEvent } from 'react';

type Attack = { attacks: number; hitOn: number; strength: number; armourPenetration: number; damage: number };
type Defender = { toughness: number; armourSave: number; invulnerableSave: number | null; woundsPerModel: number; modelCount: number };
type Result = {
  woundOn: number;
  effectiveSaveOn: number;
  unsavedHitProbability: number;
  expectedUnsavedHits: number;
  expectedRawDamage: number;
  expectedAllocatedDamage: number;
  expectedCasualties: number;
  wipeProbability: number;
  casualtyDistribution: { count: number; probability: number }[];
};
const presets = {
  balanced: {
    attack: { attacks: 10, hitOn: 3, strength: 5, armourPenetration: -1, damage: 2 },
    defender: { toughness: 5, armourSave: 3, invulnerableSave: null, woundsPerModel: 3, modelCount: 5 },
  },
  swarm: {
    attack: { attacks: 22, hitOn: 4, strength: 4, armourPenetration: 0, damage: 1 },
    defender: { toughness: 3, armourSave: 5, invulnerableSave: null, woundsPerModel: 1, modelCount: 12 },
  },
};
const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const numberFormat = (v: number) => v.toFixed(2);
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

export function App() {
  const [attack, setAttack] = useState<Attack>({ ...presets.balanced.attack });
  const [defender, setDefender] = useState<Defender>({ ...presets.balanced.defender });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function choosePreset(choice: keyof typeof presets) {
    setAttack({ ...presets[choice].attack });
    setDefender({ ...presets[choice].defender });
    setResult(null);
    setError(null);
  }

  async function analyse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/analyse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack, defender }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const issue = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
          ? payload.error : 'Check the input values and try again.';
        throw new Error(issue);
      }
      setResult(payload as Result);
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : 'Analysis failed.');
    } finally {
      setBusy(false);
    }
  }

  function attackField(label: string, key: keyof Attack, min: number, max: number) {
    return <label className="field" key={key}><span>{label}</span>
      <input type="number" min={min} max={max} step={1} value={attack[key]}
        onChange={e => setAttack(old => ({ ...old, [key]: e.currentTarget.valueAsNumber }))} required />
    </label>;
  }
  function defenderField(label: string, key: Exclude<keyof Defender, 'invulnerableSave'>, min: number, max: number) {
    return <label className="field" key={key}><span>{label}</span>
      <input type="number" min={min} max={max} step={1} value={defender[key]}
        onChange={e => setDefender(old => ({ ...old, [key]: e.currentTarget.valueAsNumber }))} required />
    </label>;
  }
  return <div className="page">
    <header className="masthead">
      <div className="brand"><div className="brand-mark">∑</div><div><strong>COMBAT / LAB</strong><small>Open-source probability explorer</small></div></div>
      <span className="github">Community edition</span>
    </header>
    <main>
      <div className="intro">
        <p className="eyebrow">DETERMINISTIC PROBABILITY ENGINE</p>
        <h1>Build a scenario.<br /><em>See the odds.</em></h1>
        <p>Explore a fictional tabletop encounter using exact six-sided-dice probabilities. No proprietary game data, subscriptions or accounts.</p>
      </div>
      <div className="preset-row" aria-label="Sample scenarios">
        <span>TRY A SCENARIO</span>
        <button type="button" onClick={() => choosePreset('balanced')}>Balanced clash</button>
        <button type="button" onClick={() => choosePreset('swarm')}>Against a swarm</button>
      </div>
      <form onSubmit={analyse} className="workspace">
        <section className="panel">
          <div className="panel-heading"><span className="number">01</span><div><h2>Attacking profile</h2><p>How the fictional attacker behaves</p></div></div>
          <div className="fields">
            {attackField('Number of attacks', 'attacks', 0, 200)}
            {attackField('Hit roll needed (2–6)', 'hitOn', 2, 6)}
            {attackField('Attack strength', 'strength', 1, 1000)}
            {attackField('Armour penetration (−20 to 0)', 'armourPenetration', -20, 0)}
            {attackField('Damage per unsaved hit', 'damage', 1, 1000)}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading"><span className="number">02</span><div><h2>Defending profile</h2><p>What the fictional target can withstand</p></div></div>
          <div className="fields">
            {defenderField('Toughness', 'toughness', 1, 1000)}
            {defenderField('Armour save (2–7)', 'armourSave', 2, 7)}
            <label className="field"><span>Alternate save (optional)</span>
              <select value={defender.invulnerableSave ?? 'none'} onChange={e => setDefender(old => ({ ...old, invulnerableSave: e.currentTarget.value === 'none' ? null : Number(e.currentTarget.value) }))}>
                <option value="none">None</option>{[2,3,4,5,6].map(x => <option key={x} value={x}>{x}+</option>)}
              </select>
            </label>
            {defenderField('Wounds per model', 'woundsPerModel', 1, 1000)}
            {defenderField('Number of models', 'modelCount', 1, 100)}
          </div>
        </section>
        <div className="run-row"><div><strong>One attack sequence</strong><p>Independent hits, fixed damage, no damage spill between models.</p></div><button className="run" type="submit" disabled={busy}>{busy ? 'CALCULATING…' : 'ANALYSE SCENARIO →'}</button></div>
      </form>
      {error && <div role="alert" className="alert">{error} <span>Make sure the .NET API is running on port 5080.</span></div>}
      {result ? <section className="results" aria-live="polite">
        <div className="results-heading"><div><p className="eyebrow">EXACT RESULTS</p><h2>Outcome breakdown</h2></div><span className="pill">No simulation variance</span></div>
        <div className="metrics">
          <div className="metric"><small>EXPECTED CASUALTIES</small><strong>{numberFormat(result.expectedCasualties)}</strong><span>Models removed, on average</span></div>
          <div className="metric"><small>FULL WIPE CHANCE</small><strong>{pct(result.wipeProbability)}</strong><span>Probability all models are removed</span></div>
          <div className="metric"><small>ALLOCATED DAMAGE</small><strong>{numberFormat(result.expectedAllocatedDamage)}</strong><span>Excludes overkill and post-wipe attacks</span></div>
          <div className="metric"><small>UNSAVED HITS</small><strong>{numberFormat(result.expectedUnsavedHits)}</strong><span>From {pct(result.unsavedHitProbability)} chance per attack</span></div>
        </div>
        <div className="distribution"><h3>Casualty probability distribution</h3><p>Exactly how likely each possible model-loss count is.</p>
          <div className="bars" role="list">{result.casualtyDistribution.map(point => <div className="bar-row" role="listitem" key={point.count}>
            <span className="bar-label">{point.count} {point.count === 1 ? 'model' : 'models'}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${(point.probability * 100).toFixed(4)}%` }} /></div>
            <strong>{pct(point.probability)}</strong>
          </div>)}</div>
          <p className="fineprint">Wound roll needed: {result.woundOn}+ · Effective save: {result.effectiveSaveOn === 7 ? 'none' : `${result.effectiveSaveOn}+`} · Expected raw damage: {numberFormat(result.expectedRawDamage)}</p>
        </div>
      </section> : <div className="empty-state">Enter a matchup and run the analysis to see its exact casualty distribution.</div>}
    </main>
    <footer>Community-owned example · Fictional profiles only · Not affiliated with any tabletop game publisher</footer>
  </div>;
}
