import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from './App';
import { analyseCombat } from './lib/api';
vi.mock('./lib/api', () => ({ analyseCombat: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe('App', () => {
  it('passes current scenario to the API, displays errors, and clears stale errors after edits', async () => {
    vi.mocked(analyseCombat).mockRejectedValue(new Error('Invalid attacks'));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ANALYSE SCENARIO →' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Invalid attacks');
    expect(analyseCombat).toHaveBeenCalledWith(expect.objectContaining({
      attack: expect.objectContaining({ attacks: 10 }),
      defender: expect.objectContaining({ modelCount: 5 }),
    }));
    fireEvent.change(screen.getByLabelText('Number of attacks'), { target: { value: '9' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
