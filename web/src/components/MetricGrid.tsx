import type { CombatResult } from '../types/combat';
import { numberFormat, pct } from '../lib/format';

type MetricGridProps = { result: CombatResult };

export function MetricGrid({ result }: MetricGridProps) {
  return (
    <div className="metrics" aria-label="Combat outcome summary">
      <div className="metric">
        <small>AVERAGE KILLS</small>
        <strong>{numberFormat(result.expectedCasualties)}</strong>
        <span>Expected models removed, across all outcomes</span>
      </div>
      <div className="metric">
        <small>FULL WIPE CHANCE</small>
        <strong>{pct(result.wipeProbability)}</strong>
        <span>Probability every defending model is removed</span>
      </div>
      <div className="metric">
        <small>ALLOCATED DAMAGE</small>
        <strong>{numberFormat(result.expectedAllocatedDamage)}</strong>
        <span>Damage that actually reduces defender wounds</span>
      </div>
      <div className="metric">
        <small>WASTED DAMAGE</small>
        <strong>{numberFormat(result.expectedWastedDamage)}</strong>
        <span>Overkill or hits after the target is destroyed</span>
      </div>
    </div>
  );
}
