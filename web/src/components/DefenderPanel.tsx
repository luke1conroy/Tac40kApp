import type { Defender } from '../types/combat';
import { NumberField } from './NumberField';

type DefenderPanelProps = {
  defender: Defender;
  onChange: (field: keyof Defender, value: number | null) => void;
};

export function DefenderPanel({ defender, onChange }: DefenderPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="number">02</span>
        <div><h2>Defending profile</h2><p>What the fictional target can withstand</p></div>
      </div>
      <div className="fields">
        <NumberField label="Toughness" min={1} max={1000} value={defender.toughness}
          onChange={(value) => onChange('toughness', value)} />
        <NumberField label="Armour save (2–7)" min={2} max={7} value={defender.armourSave}
          onChange={(value) => onChange('armourSave', value)} />
        <label className="field">
          <span>Alternate save (optional)</span>
          <select value={defender.invulnerableSave ?? 'none'}
            onChange={(event) => onChange('invulnerableSave',
              event.currentTarget.value === 'none' ? null : Number(event.currentTarget.value))}>
            <option value="none">None</option>
            {[2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>{value}+</option>
            ))}
          </select>
        </label>
        <NumberField label="Wounds per model" min={1} max={1000} value={defender.woundsPerModel}
          onChange={(value) => onChange('woundsPerModel', value)} />
        <NumberField label="Number of models" min={1} max={100} value={defender.modelCount}
          onChange={(value) => onChange('modelCount', value)} />
      </div>
    </section>
  );
}
