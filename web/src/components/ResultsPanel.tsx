import type { CombatResult } from '../types/combat';
import { OutcomeHero } from './OutcomeHero';
import { MetricGrid } from './MetricGrid';
import { CasualtyDistribution } from './CasualtyDistribution';
import './ResultsPanel.css';

type ResultsPanelProps = {
  result: CombatResult;
  defenderModelCount: number;
};

export function ResultsPanel({ result, defenderModelCount }: ResultsPanelProps) {
  return (
    <section className="results" aria-live="polite">
      <div className="results-heading">
        <div><p className="eyebrow">EXACT RESULTS</p><h2>Outcome breakdown</h2></div>
        <span className="pill">No simulation variance</span>
      </div>
      <OutcomeHero result={result} defenderModelCount={defenderModelCount} />
      <MetricGrid result={result} />
      <CasualtyDistribution result={result} />
    </section>
  );
}
