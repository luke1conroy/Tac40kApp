import type { FormEvent } from 'react';
import type { Attack, Defender } from '../types/combat';
import type { PresetName } from '../lib/presets';
import { AttackPanel } from './AttackPanel';
import { DefenderPanel } from './DefenderPanel';
import './ScenarioBuilder.css';

type ScenarioBuilderProps = {
  attack: Attack;
  defender: Defender;
  busy: boolean;
  onPresetSelect: (name: PresetName) => void;
  onAttackChange: (field: keyof Attack, value: number) => void;
  onDefenderChange: (field: keyof Defender, value: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ScenarioBuilder({
  attack, defender, busy, onPresetSelect, onAttackChange, onDefenderChange, onSubmit,
}: ScenarioBuilderProps) {
  return (
    <>
      <div className="preset-row" aria-label="Sample scenarios">
        <span>TRY A SCENARIO</span>
        <button type="button" onClick={() => onPresetSelect('balanced')}>Balanced clash</button>
        <button type="button" onClick={() => onPresetSelect('swarm')}>Against a swarm</button>
      </div>
      <form onSubmit={onSubmit} className="workspace">
        <AttackPanel attack={attack} onChange={onAttackChange} />
        <DefenderPanel defender={defender} onChange={onDefenderChange} />
        <div className="run-row">
          <div>
            <strong>One attack sequence</strong>
            <p>Independent hits, fixed damage, no damage spill between models.</p>
          </div>
          <button className="run" type="submit" disabled={busy}>
            {busy ? 'CALCULATING…' : 'ANALYSE SCENARIO →'}
          </button>
        </div>
      </form>
    </>
  );
}
