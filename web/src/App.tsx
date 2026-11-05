import { useState, type FormEvent } from 'react';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { ResultsPanel } from './components/ResultsPanel';
import { analyseCombat } from './lib/api';
import { presets, type PresetName } from './lib/presets';
import type { Attack, Defender, CombatResult } from './types/combat';

export function App() {
  const [attack, setAttack] = useState<Attack>({ ...presets.balanced.attack });
  const [defender, setDefender] = useState<Defender>({ ...presets.balanced.defender });
  const [result, setResult] = useState<CombatResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function invalidateResult() {
    setResult(null);
    setError(null);
  }

  function choosePreset(name: PresetName) {
    setAttack({ ...presets[name].attack });
    setDefender({ ...presets[name].defender });
    invalidateResult();
  }

  function updateAttack(field: keyof Attack, value: number) {
    setAttack((current) => ({ ...current, [field]: value }));
    invalidateResult();
  }

  function updateDefender(field: keyof Defender, value: number | null) {
    setDefender((current) => ({ ...current, [field]: value }));
    invalidateResult();
  }

  async function analyse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await analyseCombat({ attack, defender }));
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : 'Analysis failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="brand">
          <div className="brand-mark">∑</div>
          <div><strong>COMBAT / LAB</strong><small>Open-source probability explorer</small></div>
        </div>
        <span className="github">Community edition</span>
      </header>
      <main>
        <div className="intro">
          <p className="eyebrow">DETERMINISTIC PROBABILITY ENGINE</p>
          <h1>Build a scenario.<br /><em>See the odds.</em></h1>
          <p>Explore a fictional tabletop encounter using exact six-sided-dice probabilities. No proprietary game data, subscriptions or accounts.</p>
        </div>
        <ScenarioBuilder
          attack={attack}
          defender={defender}
          busy={busy}
          onPresetSelect={choosePreset}
          onAttackChange={updateAttack}
          onDefenderChange={updateDefender}
          onSubmit={analyse}
        />
        {error && (
          <div role="alert" className="alert">
            {error} <span>Make sure the .NET API is running on port 5080.</span>
          </div>
        )}
        {result
          ? <ResultsPanel result={result} defenderModelCount={defender.modelCount} />
          : <div className="empty-state">Enter a matchup and run the analysis to see its exact casualty distribution.</div>}
      </main>
      <footer>Community-owned example · Fictional profiles only · Not affiliated with any tabletop game publisher</footer>
    </div>
  );
}
