import type { CombatRequest } from '../types/combat';

export const presets = {
  balanced: {
    attack: { attacks: 10, hitOn: 3, strength: 5, armourPenetration: -1, damage: 2 },
    defender: { toughness: 5, armourSave: 3, invulnerableSave: null, woundsPerModel: 3, modelCount: 5 },
  },
  swarm: {
    attack: { attacks: 22, hitOn: 4, strength: 4, armourPenetration: 0, damage: 1 },
    defender: { toughness: 3, armourSave: 5, invulnerableSave: null, woundsPerModel: 1, modelCount: 12 },
  },
} satisfies Record<string, CombatRequest>;

export type PresetName = keyof typeof presets;
