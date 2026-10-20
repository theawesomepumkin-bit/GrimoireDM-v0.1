import test from 'node:test';
import assert from 'node:assert/strict';
import {
  rollD20,
  rollDiceFormula,
  resolveAttackRoll,
  resolveSavingThrow,
  resolveConcentrationCheck,
  parseRechargeMin,
  rollMonsterRecharge,
  performShortRest,
  performLongRest,
  buildCharacterFromSrdChoices
} from './combatMechanics.ts';

test('rollD20 supports normal, advantage, and disadvantage deterministically', () => {
  const seq = [0.1, 0.85]; // -> 3, 18
  let idx = 0;
  const rng = () => seq[idx++ % seq.length];

  const adv = rollD20('advantage', rng);
  assert.equal(adv.natural, 18);
  assert.deepEqual(adv.rolls, [3, 18]);

  idx = 0;
  const dis = rollD20('disadvantage', rng);
  assert.equal(dis.natural, 3);
  assert.deepEqual(dis.rolls, [3, 18]);
});

test('rollDiceFormula doubles dice on critical hit while keeping flat bonus once', () => {
  // Always roll max value (0.99)
  const rng = () => 0.99;
  const normal = rollDiceFormula('2d8+5', false, rng);
  assert.equal(normal.total, 16 + 5);

  const crit = rollDiceFormula('2d8+5', true, rng);
  assert.equal(crit.total, 32 + 5);
  assert.equal(crit.isCriticalHit, true);
});

test('resolveAttackRoll handles hits, misses, and natural 20 critical hits against AC', () => {
  // Roll 20 (0.99) then max damage on 1d8+4
  const critRes = resolveAttackRoll({
    attackerName: 'Vaelen',
    targetName: 'Bandit',
    actionName: 'Longsword',
    attackBonus: 6,
    targetAc: 25, // Even high AC is hit by Nat 20
    damageFormula: '1d8+4',
    damageType: 'Slashing',
    rng: () => 0.99,
  });
  assert.equal(critRes.hit, true);
  assert.equal(critRes.isCrit, true);
  assert.equal(critRes.damageTotal, 20); // 2d8 (16) + 4 = 20

  // Roll 1 (0.0) misses even low AC
  const missRes = resolveAttackRoll({
    attackerName: 'Vaelen',
    targetName: 'Goblin',
    actionName: 'Longsword',
    attackBonus: 15,
    targetAc: 10,
    damageFormula: '1d8+4',
    rng: () => 0.0,
  });
  assert.equal(missRes.hit, false);
  assert.equal(missRes.isCritMiss, true);
  assert.equal(missRes.damageTotal, 0);
});

test('resolveSavingThrow applies half damage on successful save and full damage on failed save', () => {
  // Roll 19 on save (0.94 -> 19) +2 DEX mod = 21 vs DC 19 -> SAVED -> half of 50 = 25
  const savedRes = resolveSavingThrow({
    casterName: 'Adult Bronze Dragon',
    targetName: 'Vaelen',
    actionName: 'Lightning Breath',
    saveType: 'DC 19 DEX save',
    targetAbilities: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 10 },
    preRolledDamage: { total: 50, breakdown: '[50]', isCriticalHit: false },
    damageType: 'Lightning',
    rng: () => 0.94,
  });
  assert.equal(savedRes.saved, true);
  assert.equal(savedRes.appliedDamage, 25);

  // Roll 4 on save (0.18 -> 4) +2 DEX mod = 6 vs DC 19 -> FAILED -> full 50
  const failedRes = resolveSavingThrow({
    casterName: 'Adult Bronze Dragon',
    targetName: 'Vaelen',
    actionName: 'Lightning Breath',
    saveType: 'DC 19 DEX save',
    targetAbilities: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 10 },
    preRolledDamage: { total: 50, breakdown: '[50]', isCriticalHit: false },
    damageType: 'Lightning',
    rng: () => 0.18,
  });
  assert.equal(failedRes.saved, false);
  assert.equal(failedRes.appliedDamage, 50);
});

test('resolveConcentrationCheck calculates DC = max(10, floor(damage / 2))', () => {
  // 28 damage -> DC 14
  const check = resolveConcentrationCheck({
    characterName: 'Ekyndra',
    damageTaken: 28,
    conScore: 14, // +2
    isProficientInConSave: true,
    level: 5, // +3 prof -> +5 total
    rng: () => 0.5, // d20 = 11 + 5 = 16 >= 14
  });
  assert.equal(check.dc, 14);
  assert.equal(check.passed, true);
});

test('parseRechargeMin and rollMonsterRecharge handle Recharge 5-6', () => {
  const min = parseRechargeMin('Recharge 5–6: 90-ft Line, DC 19 DEX save');
  assert.equal(min, 5);
  const res = rollMonsterRecharge('Lightning Breath', 5, () => 0.9); // d6 = 6
  assert.equal(res.recharged, true);
  assert.equal(res.roll, 6);
});

test('buildCharacterFromSrdChoices and Short/Long Rest lifecycle work end-to-end', () => {
  const wizard = buildCharacterFromSrdChoices({
    name: 'Lyra Starweaver',
    species: 'Elf',
    className: 'Wizard',
    subclass: 'Evoker',
    background: 'Sage',
    level: 5,
    abilities: { str: 8, dex: 14, con: 14, int: 18, wis: 12, cha: 10 },
  });

  assert.equal(wizard.name, 'Lyra Starweaver');
  assert.equal(wizard.race, 'Elf');
  assert.ok(wizard.maxHp > 20);
  assert.equal(wizard.spellSaveDc, 8 + 3 + 4); // 15
  assert.ok(wizard.features?.some(f => f.name === 'Fey Ancestry'));
  assert.ok(wizard.features?.some(f => f.name === 'Sculpt Spells'));

  // Simulate taking damage and spending a spell slot
  const damaged = {
    ...wizard,
    hp: 10,
    spellcasting: {
      ...wizard.spellcasting!,
      slotsUsed: [2, 1, 1],
    },
  };

  const shortRested = performShortRest(damaged, 2, () => 0.8);
  assert.ok(shortRested.updatedMember.hp > 10);
  assert.equal(shortRested.updatedMember.hitDiceRemaining, 3);

  const longRested = performLongRest(shortRested.updatedMember);
  assert.equal(longRested.updatedMember.hp, wizard.maxHp);
  assert.equal(longRested.updatedMember.hitDiceRemaining, 5);
  assert.deepEqual(longRested.updatedMember.spellcasting?.slotsUsed, [0, 0, 0]);
});
