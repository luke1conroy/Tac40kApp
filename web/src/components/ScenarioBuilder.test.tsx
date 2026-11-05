import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { presets } from '../lib/presets';
import { ScenarioBuilder } from './ScenarioBuilder';
afterEach(cleanup);
describe('ScenarioBuilder', () => {
  it('reports attacks, alternate saves, and preset selection', () => {
    const onAttackChange = vi.fn(), onDefenderChange = vi.fn(), onPresetSelect = vi.fn();
    render(<ScenarioBuilder attack={presets.balanced.attack} defender={presets.balanced.defender}
      busy={false} onAttackChange={onAttackChange} onDefenderChange={onDefenderChange}
      onPresetSelect={onPresetSelect} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Number of attacks'), { target: { value: '13' } });
    fireEvent.change(screen.getByLabelText('Alternate save (optional)'), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Against a swarm' }));
    expect(onAttackChange).toHaveBeenCalledWith('attacks', 13);
    expect(onDefenderChange).toHaveBeenCalledWith('invulnerableSave', 4);
    expect(onPresetSelect).toHaveBeenCalledWith('swarm');
  });
  it('disables submit while calculating', () => {
    render(<ScenarioBuilder attack={presets.balanced.attack} defender={presets.balanced.defender}
      busy onAttackChange={vi.fn()} onDefenderChange={vi.fn()} onPresetSelect={vi.fn()} onSubmit={vi.fn()} />);
    expect((screen.getByRole('button', { name: 'CALCULATING…' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
