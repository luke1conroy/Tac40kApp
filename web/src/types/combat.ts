export type Attack = {
  attacks: number;
  hitOn: number;
  strength: number;
  armourPenetration: number;
  damage: number;
};

export type Defender = {
  toughness: number;
  armourSave: number;
  invulnerableSave: number | null;
  woundsPerModel: number;
  modelCount: number;
};

export type CombatRequest = { attack: Attack; defender: Defender };

export type CombatResult = {
  woundOn: number;
  effectiveSaveOn: number;
  unsavedHitProbability: number;
  expectedUnsavedHits: number;
  expectedRawDamage: number;
  expectedAllocatedDamage: number;
  expectedCasualties: number;
  wipeProbability: number;
  casualtyDistribution: { count: number; probability: number }[];
  mostLikelyCasualties: number;
  atLeastOneCasualtyProbability: number;
  expectedSurvivors: number;
  expectedWastedDamage: number;
};
