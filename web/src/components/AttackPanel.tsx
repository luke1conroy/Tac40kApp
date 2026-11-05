import type { Attack } from '../types/combat';
import { NumberField } from './NumberField';

type AttackPanelProps = {
  attack: Attack;
  onChange: (field: keyof Attack, value: number) => void;
};

export function AttackPanel({ attack, onChange }: AttackPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="number">01</span>
        <div><h2>Attacking profile</h2><p>How the fictional attacker behaves</p></div>
      </div>
      <div className="fields">
        <NumberField label="Number of attacks" min={0} max={200} value={attack.attacks}
          onChange={(value) => onChange('attacks', value)} />
        <NumberField label="Hit roll needed (2–6)" min={2} max={6} value={attack.hitOn}
          onChange={(value) => onChange('hitOn', value)} />
        <NumberField label="Attack strength" min={1} max={1000} value={attack.strength}
          onChange={(value) => onChange('strength', value)} />
        <NumberField label="Armour penetration (−20 to 0)" min={-20} max={0} value={attack.armourPenetration}
          onChange={(value) => onChange('armourPenetration', value)} />
        <NumberField label="Damage per unsaved hit" min={1} max={1000} value={attack.damage}
          onChange={(value) => onChange('damage', value)} />
      </div>
    </section>
  );
}
