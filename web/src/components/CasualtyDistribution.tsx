import type { CombatResult } from '../types/combat';
import { numberFormat, pct } from '../lib/format';

type CasualtyDistributionProps = { result: CombatResult };

export function CasualtyDistribution({ result }: CasualtyDistributionProps) {
  return (
    <div className="distribution">
      <h3>How many models are killed?</h3>
      <p>Chance of losing <strong>exactly</strong> this many models. Each row is one possible outcome.</p>
      <div className="bars" role="list">
        {result.casualtyDistribution.map((point) => (
          <div className={point.count === result.mostLikelyCasualties
            ? 'bar-row bar-row-featured' : 'bar-row'} role="listitem" key={point.count}>
            <span className="bar-label">
              {point.count} {point.count === 1 ? 'kill' : 'kills'}
              {point.count === result.mostLikelyCasualties
                && <span className="likely-marker">Most likely</span>}
            </span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: pct(point.probability) }} />
            </div>
            <strong>{pct(point.probability)}</strong>
          </div>
        ))}
      </div>
      <p className="distribution-note">
        Expected unsaved attacks: {numberFormat(result.expectedUnsavedHits)}
        {' · '}Unsaved attack chance: {pct(result.unsavedHitProbability)}
      </p>
      <p className="fineprint">
        Wound roll needed: {result.woundOn}+ {' · '}
        Effective save: {result.effectiveSaveOn === 7 ? 'none' : result.effectiveSaveOn + '+'}
        {' · '}Expected raw damage: {numberFormat(result.expectedRawDamage)}
      </p>
    </div>
  );
}
