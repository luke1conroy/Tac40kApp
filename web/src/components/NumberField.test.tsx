import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NumberField } from './NumberField';
afterEach(cleanup);
describe('NumberField', () => {
  it('accepts a change with accessible label and numeric bounds', () => {
    const onChange = vi.fn();
    render(<NumberField label="Number of attacks" value={10} min={0} max={200} onChange={onChange} />);
    const input = screen.getByLabelText('Number of attacks') as HTMLInputElement;
    expect(input.value).toBe('10');
    expect(input.min).toBe('0');
    expect(input.max).toBe('200');
    fireEvent.change(input, { target: { value: '14' } });
    expect(onChange).toHaveBeenCalledWith(14);
  });
});
