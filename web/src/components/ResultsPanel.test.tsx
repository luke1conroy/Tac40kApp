import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { CombatResult } from '../types/combat';
import { ResultsPanel } from './ResultsPanel';
afterEach(cleanup);
const result: CombatResult = {
  woundOn: 4, effectiveSaveOn: 7, unsavedHitProbability: 0.25, expectedUnsavedHits: 0.25,
  expectedRawDamage: 0.25, expectedAllocatedDamage: 0.25, expectedCasualties: 0.25,
  wipeProbability: 0.25, casualtyDistribution: [
    { count: 0, probability: 0.75 }, { count: 1, probability: 0.25 },
  ],
  mostLikelyCasualties: 0, atLeastOneCasualtyProbability: 0.25,
  expectedSurvivors: 0.75, expectedWastedDamage: 0,
};
describe('ResultsPanel', () => {
  it('keeps most likely casualties distinct from the average', () => {
    render(<ResultsPanel result={result} defenderModelCount={1} />);
    expect(screen.getByText('0 models killed')).toBeTruthy();
    expect(screen.getByText('0.75 of 1')).toBeTruthy();
    expect(screen.getByText('AVERAGE KILLS')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Most likely')).toBeTruthy();
  });
});
