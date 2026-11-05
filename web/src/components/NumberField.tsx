type NumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export function NumberField({ label, value, min, max, onChange }: NumberFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        required
      />
    </label>
  );
}
