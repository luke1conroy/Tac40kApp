import type { CombatRequest, CombatResult } from '../types/combat';

const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export async function analyseCombat(request: CombatRequest): Promise<CombatResult> {
  const response = await fetch(apiBase + '/api/analyse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const payload: unknown = await response.json();
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      && typeof payload.error === 'string'
      ? payload.error
      : 'Check the input values and try again.';
    throw new Error(message);
  }

  return payload as CombatResult;
}
