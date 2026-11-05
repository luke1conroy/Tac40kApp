import type { CombatResult } from '../types/combat';
import { numberFormat, pct } from '../lib/format';

type OutcomeHeroProps = {
  result: CombatResult;
  defenderModelCount: number;
};

export function OutcomeHero({ result, defenderModelCount }: OutcomeHeroProps) {
  return (
    <div className="outcome-hero">
      <div className="outcome-main">
        <span className="eyebrow">MOST LIKELY OUTCOME</span>
        <strong>
          {result.mostLikelyCasualties}{' '}
          {result.mostLikelyCasualties === 1 ? 'model killed' : 'models killed'}
        </strong>
        <p>This is the most probable whole-number outcome, <em>not</em> the rounded average.</p>
      </div>
      <div className="outcome-context">
        <span>Chance of at least one kill</span>
        <strong>{pct(result.atLeastOneCasualtyProbability)}</strong>
        <span>Average models remaining</span>
        <strong>{numberFormat(result.expectedSurvivors)} of {defenderModelCount}</strong>
      </div>
    </div>
  );
}
