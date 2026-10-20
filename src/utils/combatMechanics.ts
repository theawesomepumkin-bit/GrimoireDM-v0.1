import type { AbilityScores, LibraryEntry, PartyMember } from '../types.ts';
import { stripWikiLinks } from './importer.ts';

export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface D20RollResult {
  natural: number;
  rolls: number[];
  isCrit: boolean;
  isCritMiss: boolean;
  mode: RollMode;
}

export interface DiceFormulaResult {
  total: number;
  breakdown: string;
  isCriticalHit: boolean;
}

export interface AttackResolutionResult {
  hit: boolean;
  isCrit: boolean;
  isCritMiss: boolean;
  d20: D20RollResult;
  attackBonus: number;
  attackTotal: number;
  targetAc: number;
  damageTotal: number;
  damageBreakdown: string;
  damageType: string;
  summary: string;
}

export interface SaveResolutionResult {
  saved: boolean;
  abilityKey: keyof AbilityScores;
  abilityLabel: string;
  d20: D20RollResult;
  saveModifier: number;
  saveTotal: number;
  dc: number;
  fullDamage: number;
  appliedDamage: number;
  damageBreakdown: string;
  damageType: string;
  summary: string;
}

export interface ConcentrationCheckResult {
  passed: boolean;
  dc: number;
  d20: D20RollResult;
  conModifier: number;
  rollTotal: number;
  summary: string;
}

export interface RechargeRollResult {
  recharged: boolean;
  roll: number;
  minNeeded: number;
  summary: string;
}

export function getAbilityModifier(score: number = 10): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number = 1): number {
  return Math.max(2, Math.floor((Math.max(1, level) - 1) / 4) + 2);
}

/**
 * Rolls 1d20 with Normal, Advantage, or Disadvantage.
 */
export function rollD20(
  mode: RollMode = 'normal',
  rng: () => number = Math.random
): D20RollResult {
  const r1 = Math.min(20, Math.max(1, Math.floor(rng() * 20) + 1));
  if (mode === 'normal') {
    return {
      natural: r1,
      rolls: [r1],
      isCrit: r1 === 20,
      isCritMiss: r1 === 1,
      mode,
    };
  }

  const r2 = Math.min(20, Math.max(1, Math.floor(rng() * 20) + 1));
  const natural = mode === 'advantage' ? Math.max(r1, r2) : Math.min(r1, r2);
  return {
    natural,
    rolls: [r1, r2],
    isCrit: natural === 20,
    isCritMiss: natural === 1,
    mode,
  };
}

/**
 * Evaluates single or compound dice formulas such as "2d8+7+1d10" or "8d6".
 * When isCriticalHit is true, all dice counts are doubled (5e Critical Hit rule),
 * while flat modifiers are added once.
 */
export function rollDiceFormula(
  formula: string,
  isCriticalHit: boolean = false,
  rng: () => number = Math.random
): DiceFormulaResult {
  const clean = (formula || '1d6').toLowerCase().replace(/\s+/g, '');
  const terms = Array.from(clean.matchAll(/([+-]?\d+)d(\d+)|([+-]?\d+)/g));
  if (terms.length === 0) {
    const flat = parseInt(clean, 10);
    const val = !isNaN(flat) ? Math.max(1, flat) : 6;
    return { total: val, breakdown: `${val}`, isCriticalHit };
  }

  let total = 0;
  const parts: string[] = [];

  for (const term of terms) {
    if (term[1] !== undefined && term[2] !== undefined) {
      const rawCount = parseInt(term[1], 10);
      const sign = rawCount < 0 ? -1 : 1;
      const baseCount = Math.min(40, Math.abs(rawCount));
      const count = isCriticalHit ? baseCount * 2 : baseCount;
      const sides = Math.max(1, parseInt(term[2], 10));
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        rolls.push(Math.min(sides, Math.max(1, Math.floor(rng() * sides) + 1)));
      }
      const sub = rolls.reduce((a, b) => a + b, 0) * sign;
      total += sub;
      parts.push(`${sign < 0 ? '-' : parts.length > 0 ? '+' : ''}[${rolls.join(',')}]`);
    } else if (term[3] !== undefined) {
      const mod = parseInt(term[3], 10);
      total += mod;
      parts.push(`${mod >= 0 && parts.length > 0 ? `+${mod}` : `${mod}`}`);
    }
  }

  return {
    total: Math.max(1, total),
    breakdown: parts.join(''),
    isCriticalHit,
  };
}

/**
 * Resolves a 5e Attack Roll against Target AC, including Critical Hit (Nat 20 doubles dice)
 * and Critical Miss (Nat 1 always misses).
 */
export function resolveAttackRoll(params: {
  attackerName: string;
  targetName: string;
  actionName: string;
  attackBonus: number;
  targetAc: number;
  damageFormula: string;
  damageType?: string;
  rollMode?: RollMode;
  rng?: () => number;
}): AttackResolutionResult {
  const {
    attackerName,
    targetName,
    actionName,
    attackBonus,
    targetAc,
    damageFormula,
    damageType = 'Physical',
    rollMode = 'normal',
    rng = Math.random,
  } = params;

  const d20 = rollD20(rollMode, rng);
  const attackTotal = d20.natural + attackBonus;
  const hit = d20.isCrit ? true : d20.isCritMiss ? false : attackTotal >= targetAc;

  let damageTotal = 0;
  let damageBreakdown = '';
  if (hit && damageFormula) {
    const dmg = rollDiceFormula(damageFormula, d20.isCrit, rng);
    damageTotal = dmg.total;
    damageBreakdown = dmg.breakdown;
  }

  const modeTag =
    rollMode === 'advantage'
      ? ` (Adv [${d20.rolls.join(',')}])`
      : rollMode === 'disadvantage'
      ? ` (Dis [${d20.rolls.join(',')}])`
      : '';

  const bonusStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;

  if (d20.isCrit) {
    return {
      hit: true,
      isCrit: true,
      isCritMiss: false,
      d20,
      attackBonus,
      attackTotal,
      targetAc,
      damageTotal,
      damageBreakdown,
      damageType,
      summary: `${attackerName} CRIT ${targetName} with ${actionName}! (Nat 20${modeTag} ${bonusStr} = ${attackTotal} vs AC ${targetAc}) → ${damageTotal} ${damageType} dmg ${damageBreakdown}`,
    };
  }

  if (!hit) {
    return {
      hit: false,
      isCrit: false,
      isCritMiss: d20.isCritMiss,
      d20,
      attackBonus,
      attackTotal,
      targetAc,
      damageTotal: 0,
      damageBreakdown: '',
      damageType,
      summary: `${attackerName} MISSED ${targetName} with ${actionName} (${
        d20.isCritMiss ? 'Nat 1' : `${d20.natural}${modeTag}${bonusStr} = ${attackTotal}`
      } vs AC ${targetAc})`,
    };
  }

  return {
    hit: true,
    isCrit: false,
    isCritMiss: false,
    d20,
    attackBonus,
    attackTotal,
    targetAc,
    damageTotal,
    damageBreakdown,
    damageType,
    summary: `${attackerName} HIT ${targetName} with ${actionName} (${d20.natural}${modeTag}${bonusStr} = ${attackTotal} vs AC ${targetAc}) → ${damageTotal} ${damageType} dmg ${damageBreakdown}`,
  };
}

/**
 * Parses a save string like "DC 19 DEX save" or "CON Save" into { dc, abilityKey }.
 */
export function parseSavingThrowSpec(
  saveType?: string,
  fallbackDc: number = 14
): { dc: number; abilityKey: keyof AbilityScores; abilityLabel: string } {
  const raw = saveType || 'DEX Save';
  const dcMatch = raw.match(/DC\s*(\d+)/i);
  const dc = dcMatch ? parseInt(dcMatch[1], 10) : fallbackDc;

  const upper = raw.toUpperCase();
  let abilityKey: keyof AbilityScores = 'dex';
  if (upper.includes('STR')) abilityKey = 'str';
  else if (upper.includes('CON')) abilityKey = 'con';
  else if (upper.includes('INT')) abilityKey = 'int';
  else if (upper.includes('WIS')) abilityKey = 'wis';
  else if (upper.includes('CHA')) abilityKey = 'cha';

  return {
    dc,
    abilityKey,
    abilityLabel: abilityKey.toUpperCase(),
  };
}

/**
 * Resolves a 5e Saving Throw against a Spell or Breath Weapon DC.
 * Applies full damage on a failed save and half damage (floored) on a successful save.
 */
export function resolveSavingThrow(params: {
  casterName: string;
  targetName: string;
  actionName: string;
  saveType: string;
  fallbackDc?: number;
  targetAbilities?: AbilityScores;
  targetProficientSaves?: Partial<Record<keyof AbilityScores, boolean>>;
  targetLevel?: number;
  damageFormula?: string;
  damageType?: string;
  preRolledDamage?: DiceFormulaResult;
  rollMode?: RollMode;
  rng?: () => number;
}): SaveResolutionResult {
  const {
    targetName,
    actionName,
    saveType,
    fallbackDc = 14,
    targetAbilities,
    targetProficientSaves,
    targetLevel = 3,
    damageFormula,
    damageType = 'Magical',
    preRolledDamage,
    rollMode = 'normal',
    rng = Math.random,
  } = params;

  const { dc, abilityKey, abilityLabel } = parseSavingThrowSpec(saveType, fallbackDc);
  const score = targetAbilities?.[abilityKey] ?? 12;
  const baseMod = getAbilityModifier(score);
  const profBonus = targetProficientSaves?.[abilityKey] ? getProficiencyBonus(targetLevel) : 0;
  const saveModifier = baseMod + profBonus;

  const d20 = rollD20(rollMode, rng);
  const saveTotal = d20.natural + saveModifier;
  const saved = saveTotal >= dc;

  let fullDamage = 0;
  let damageBreakdown = '';
  if (preRolledDamage) {
    fullDamage = preRolledDamage.total;
    damageBreakdown = preRolledDamage.breakdown;
  } else if (damageFormula) {
    const rolled = rollDiceFormula(damageFormula, false, rng);
    fullDamage = rolled.total;
    damageBreakdown = rolled.breakdown;
  }

  const appliedDamage = fullDamage > 0 ? (saved ? Math.floor(fullDamage / 2) : fullDamage) : 0;
  const modStr = saveModifier >= 0 ? `+${saveModifier}` : `${saveModifier}`;

  const summary =
    fullDamage > 0
      ? `${targetName} ${saved ? 'SAVED' : 'FAILED'} ${abilityLabel} Save vs ${actionName} (${d20.natural}${modStr} = ${saveTotal} vs DC ${dc}) → ${appliedDamage} ${damageType} dmg${
          saved ? ' (half)' : ''
        }`
      : `${targetName} ${saved ? 'SAVED' : 'FAILED'} ${abilityLabel} Save vs ${actionName} (${d20.natural}${modStr} = ${saveTotal} vs DC ${dc})`;

  return {
    saved,
    abilityKey,
    abilityLabel,
    d20,
    saveModifier,
    saveTotal,
    dc,
    fullDamage,
    appliedDamage,
    damageBreakdown,
    damageType,
    summary,
  };
}

/**
 * Resolves a 5e Concentration check when a concentrating creature takes damage.
 * DC = max(10, floor(damageTaken / 2)).
 */
export function resolveConcentrationCheck(params: {
  characterName: string;
  damageTaken: number;
  conScore?: number;
  isProficientInConSave?: boolean;
  level?: number;
  rollMode?: RollMode;
  rng?: () => number;
}): ConcentrationCheckResult {
  const {
    characterName,
    damageTaken,
    conScore = 14,
    isProficientInConSave = false,
    level = 5,
    rollMode = 'normal',
    rng = Math.random,
  } = params;

  const dc = Math.max(10, Math.floor(damageTaken / 2));
  const conModifier =
    getAbilityModifier(conScore) + (isProficientInConSave ? getProficiencyBonus(level) : 0);
  const d20 = rollD20(rollMode, rng);
  const rollTotal = d20.natural + conModifier;
  const passed = rollTotal >= dc;
  const modStr = conModifier >= 0 ? `+${conModifier}` : `${conModifier}`;

  return {
    passed,
    dc,
    d20,
    conModifier,
    rollTotal,
    summary: `${characterName} Concentration Check (${d20.natural}${modStr} = ${rollTotal} vs DC ${dc}): ${
      passed ? 'MAINTAINED Concentration!' : 'LOST Concentration!'
    }`,
  };
}

/**
 * Extracts a Recharge threshold from action name or description (e.g. "Recharge 5–6" -> 5).
 */
export function parseRechargeMin(text?: string): number | null {
  if (!text) return null;
  const m = text.match(/Recharge\s+(\d+)(?:\s*[-–]\s*6)?/i);
  if (!m) return null;
  const val = parseInt(m[1], 10);
  return val >= 2 && val <= 6 ? val : null;
}

/**
 * Rolls 1d6 at the start of a monster's turn to test if an expended Recharge ability recharges.
 */
export function rollMonsterRecharge(
  actionName: string,
  minNeeded: number,
  rng: () => number = Math.random
): RechargeRollResult {
  const roll = Math.min(6, Math.max(1, Math.floor(rng() * 6) + 1));
  const recharged = roll >= minNeeded;
  const rangeLabel = minNeeded === 6 ? '6' : `${minNeeded}–6`;
  return {
    recharged,
    roll,
    minNeeded,
    summary: `${actionName} Recharge Roll (d6 = ${roll}, needs ${rangeLabel}): ${
      recharged ? 'RECHARGED!' : 'Still recharging'
    }`,
  };
}

/**
 * Performs a Short Rest for a PartyMember: spends Hit Dice to heal (Hit Die + CON mod per die)
 * and restores Pact Magic / Short Rest resources.
 */
export function performShortRest(
  member: PartyMember,
  diceToSpend: number = 1,
  rng: () => number = Math.random
): { updatedMember: PartyMember; healedHp: number; diceSpent: number; summary: string } {
  const maxDice = member.level || 1;
  const currentRemaining = member.hitDiceRemaining ?? maxDice;
  const actualSpend = Math.max(0, Math.min(currentRemaining, diceToSpend));

  const dieSidesMatch = (member.hitDice || '1d8').match(/d(\d+)/i);
  const dieSides = dieSidesMatch ? parseInt(dieSidesMatch[1], 10) : 8;
  const conMod = getAbilityModifier(member.abilities?.con ?? 12);

  let totalHeal = 0;
  const rolls: number[] = [];
  for (let i = 0; i < actualSpend; i++) {
    const r = Math.min(dieSides, Math.max(1, Math.floor(rng() * dieSides) + 1));
    const dieHeal = Math.max(1, r + conMod);
    rolls.push(dieHeal);
    totalHeal += dieHeal;
  }

  // If Warlock (Pact Magic), Short Rest also resets spell slots
  const isWarlock = member.characterClass.toLowerCase().includes('warlock');
  const nextSpellcasting =
    isWarlock && member.spellcasting
      ? {
          ...member.spellcasting,
          slotsUsed: (member.spellcasting.slotsMax || []).map(() => 0),
        }
      : member.spellcasting;

  const nextHp = Math.min(member.maxHp, member.hp + totalHeal);
  const actualHealed = nextHp - member.hp;

  const updatedMember: PartyMember = {
    ...member,
    hp: nextHp,
    hitDiceRemaining: Math.max(0, currentRemaining - actualSpend),
    spellcasting: nextSpellcasting,
  };

  return {
    updatedMember,
    healedHp: actualHealed,
    diceSpent: actualSpend,
    summary:
      actualSpend > 0
        ? `${member.name} took a Short Rest (spent ${actualSpend}d${dieSides}, healed +${actualHealed} HP → ${nextHp}/${member.maxHp} HP)`
        : `${member.name} took a Short Rest (Short-rest features refreshed)`,
  };
}

/**
 * Performs a Long Rest for a PartyMember: restores full HP, all Spell Slots, and Hit Dice.
 */
export function performLongRest(member: PartyMember): {
  updatedMember: PartyMember;
  summary: string;
} {
  const maxDice = member.level || 1;
  const nextSpellcasting = member.spellcasting
    ? {
        ...member.spellcasting,
        slotsUsed: (member.spellcasting.slotsMax || []).map(() => 0),
      }
    : undefined;

  const updatedMember: PartyMember = {
    ...member,
    hp: member.maxHp,
    tempHp: 0,
    hitDiceRemaining: maxDice,
    spellcasting: nextSpellcasting,
  };

  return {
    updatedMember,
    summary: `${member.name} completed a Long Rest (Full HP ${member.maxHp}/${member.maxHp}, all Spell Slots & Hit Dice restored)`,
  };
}

/**
 * SRD 5.2.1 Class Blueprint table for the Character Builder Wizard
 */
export interface ClassBlueprint {
  name: string;
  hitDie: number;
  primaryAbility: keyof AbilityScores;
  savingThrows: Array<keyof AbilityScores>;
  defaultSubclasses: string[];
  isSpellcaster: boolean;
  spellcastingAbility?: keyof AbilityScores;
  baseAcCalculation: (abilities: AbilityScores) => number;
  defaultEquipment: Array<{ name: string; quantity: number; desc: string }>;
  defaultSpells: string[];
  coreFeatures: Array<{ name: string; desc: string }>;
}

export const SRD_CLASS_BLUEPRINTS: Record<string, ClassBlueprint> = {
  Artificer: {
    name: 'Artificer',
    hitDie: 8,
    primaryAbility: 'int',
    savingThrows: ['con', 'int'],
    defaultSubclasses: ['Alchemist', 'Armorer', 'Artillerist', 'Battle Smith'],
    isSpellcaster: true,
    spellcastingAbility: 'int',
    baseAcCalculation: ab => 14 + Math.min(2, getAbilityModifier(ab.dex)) + 2,
    defaultEquipment: [
      { name: 'Light Crossbow', quantity: 1, desc: 'Ranged (range 80/320 ft), 1d8+2 Piercing' },
      { name: 'Scale Mail & Shield', quantity: 1, desc: 'Medium Armor + Shield (AC 18)' },
      { name: "Thieves' Tools & Tinker's Tools", quantity: 1, desc: 'Artificer Spellcasting Focus' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Fire Bolt', 'Mending', 'Cure Wounds', 'Faerie Fire', 'Shatter'],
    coreFeatures: [
      { name: 'Magical Tinkering', desc: 'Imbue tiny nonmagical objects with minor magical properties.' },
      { name: 'Infuse Item', desc: 'Imbue mundane items with Artificer infusions to turn them into magic items.' },
    ],
  },
  Barbarian: {
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    defaultSubclasses: ['Path of the Berserker', 'Path of the Wild Heart'],
    isSpellcaster: false,
    baseAcCalculation: ab => 10 + getAbilityModifier(ab.dex) + getAbilityModifier(ab.con),
    defaultEquipment: [
      { name: 'Greataxe', quantity: 1, desc: 'Heavy, Two-Handed, 1d12+3 Slashing (Cleave)' },
      { name: 'Handaxe', quantity: 2, desc: 'Light, Thrown (range 20/60 ft), 1d6+3 Slashing (Vex)' },
      { name: 'Potion of Healing', quantity: 2, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: [],
    coreFeatures: [
      { name: 'Rage', desc: 'Bonus Action: Resistance to Bludgeoning, Piercing, and Slashing damage; bonus Rage damage on STR attacks.' },
      { name: 'Unarmored Defense', desc: 'While not wearing armor, your AC equals 10 + DEX modifier + CON modifier.' },
      { name: 'Reckless Attack', desc: 'Gain Advantage on melee STR attack rolls this turn, but attack rolls against you have Advantage.' },
    ],
  },
  Bard: {
    name: 'Bard',
    hitDie: 8,
    primaryAbility: 'cha',
    savingThrows: ['dex', 'cha'],
    defaultSubclasses: ['College of Lore', 'College of Valor'],
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    baseAcCalculation: ab => 12 + getAbilityModifier(ab.dex),
    defaultEquipment: [
      { name: 'Rapier', quantity: 1, desc: 'Finesse, 1d8+3 Piercing (Vex)' },
      { name: 'Dagger', quantity: 1, desc: 'Finesse, Light, Thrown (range 20/60 ft), 1d4+3 Piercing' },
      { name: 'Studded Leather Armor', quantity: 1, desc: 'Light Armor (AC 12 + DEX)' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Vicious Mockery', 'Healing Word', 'Thunderwave', 'Hold Person'],
    coreFeatures: [
      { name: 'Bardic Inspiration', desc: 'Bonus Action: Grant a creature within 60 ft a Bardic Inspiration die (d6/d8) to add to an ability check, attack roll, or saving throw.' },
      { name: 'Jack of All Trades', desc: 'Add half your Proficiency Bonus to any ability check that does not already include your Proficiency Bonus.' },
    ],
  },
  Cleric: {
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: 'wis',
    savingThrows: ['wis', 'cha'],
    defaultSubclasses: ['Life Domain', 'Light Domain', 'War Domain'],
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    baseAcCalculation: ab => 14 + Math.min(2, getAbilityModifier(ab.dex)) + 2,
    defaultEquipment: [
      { name: 'Mace', quantity: 1, desc: 'Simple Melee, 1d6+2 Bludgeoning (Sap)' },
      { name: 'Scale Mail & Shield', quantity: 1, desc: 'Medium Armor + Shield (AC 18)' },
      { name: 'Potion of Healing', quantity: 2, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Sacred Flame', 'Cure Wounds', 'Healing Word', 'Guiding Bolt', 'Spirit Guardians'],
    coreFeatures: [
      { name: 'Channel Divinity', desc: 'Channel divine energy directly from the Outer Planes to fuel Turn Undead, Divine Spark, or Domain effects.' },
      { name: 'Disciple of Life', desc: 'Your healing spells restore additional Hit Points equal to 2 + the spell level.' },
    ],
  },
  Druid: {
    name: 'Druid',
    hitDie: 8,
    primaryAbility: 'wis',
    savingThrows: ['int', 'wis'],
    defaultSubclasses: ['Circle of the Land', 'Circle of the Moon'],
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    baseAcCalculation: ab => 12 + Math.min(2, getAbilityModifier(ab.dex)) + 2,
    defaultEquipment: [
      { name: 'Quarterstaff', quantity: 1, desc: 'Versatile, 1d8+2 Bludgeoning (Shillelagh)' },
      { name: 'Hide Armor & Wooden Shield', quantity: 1, desc: 'Medium Armor + Shield (AC 16)' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Produce Flame', 'Cure Wounds', 'Entangle', 'Thunderwave', 'Call Lightning'],
    coreFeatures: [
      { name: 'Wild Shape', desc: 'Bonus Action: Magically assume the shape of a beast that you have learned.' },
      { name: 'Druidic', desc: 'You know Druidic, the secret language of druids, and always have Speak with Animals prepared.' },
    ],
  },
  Fighter: {
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: 'str',
    savingThrows: ['str', 'con'],
    defaultSubclasses: ['Champion', 'Battle Master', 'Eldritch Knight'],
    isSpellcaster: false,
    baseAcCalculation: () => 18,
    defaultEquipment: [
      { name: 'Longsword', quantity: 1, desc: 'Versatile, 1d8+4 Slashing (Sap)' },
      { name: 'Heavy Crossbow', quantity: 1, desc: 'Ranged (range 100/400 ft), 1d10+2 Piercing (Push)' },
      { name: 'Chain Mail & Shield', quantity: 1, desc: 'Heavy Armor + Shield (AC 18)' },
      { name: 'Potion of Healing', quantity: 2, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: [],
    coreFeatures: [
      { name: 'Second Wind', desc: 'Bonus Action: Regain 1d10 + Fighter level Hit Points.' },
      { name: 'Action Surge', desc: 'Take one additional Action on your turn (1/Short Rest).' },
      { name: 'Weapon Mastery', desc: 'Use the mastery properties of three kinds of Simple or Martial weapons.' },
    ],
  },
  Monk: {
    name: 'Monk',
    hitDie: 8,
    primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    defaultSubclasses: ['Warrior of the Open Hand', 'Warrior of Shadow'],
    isSpellcaster: false,
    baseAcCalculation: ab => 10 + getAbilityModifier(ab.dex) + getAbilityModifier(ab.wis),
    defaultEquipment: [
      { name: 'Quarterstaff', quantity: 1, desc: 'Monk Weapon, 1d8+4 Bludgeoning' },
      { name: 'Dart', quantity: 5, desc: 'Finesse, Thrown (range 20/60 ft), 1d4+4 Piercing' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: [],
    coreFeatures: [
      { name: 'Martial Arts & Flurry of Blows', desc: 'Make an Unarmed Strike as a Bonus Action, or spend 1 Focus Point for two Unarmed Strikes.' },
      { name: 'Unarmored Defense', desc: 'While wearing no armor and no shield, your AC equals 10 + DEX modifier + WIS modifier.' },
      { name: 'Deflect Attacks', desc: 'Reaction: Reduce incoming attack damage by 1d10 + DEX modifier + Monk level.' },
    ],
  },
  Paladin: {
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: 'str',
    savingThrows: ['wis', 'cha'],
    defaultSubclasses: ['Oath of Devotion', 'Oath of Vengeance'],
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    baseAcCalculation: () => 18,
    defaultEquipment: [
      { name: 'Warhammer', quantity: 1, desc: 'Versatile, 1d8+4 Bludgeoning (Push)' },
      { name: 'Javelin', quantity: 4, desc: 'Thrown (range 30/120 ft), 1d6+4 Piercing (Slow)' },
      { name: 'Chain Mail & Shield', quantity: 1, desc: 'Heavy Armor + Shield (AC 18)' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Cure Wounds', 'Divine Smite', 'Bless', 'Shield of Faith'],
    coreFeatures: [
      { name: 'Lay on Hands', desc: 'Bonus Action: Restore Hit Points from a healing pool equal to 5 × Paladin level.' },
      { name: 'Divine Smite', desc: 'Bonus Action after hitting with a melee weapon: Deal an extra 2d8 Radiant damage.' },
    ],
  },
  Ranger: {
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    defaultSubclasses: ['Hunter', 'Beast Master'],
    isSpellcaster: true,
    spellcastingAbility: 'wis',
    baseAcCalculation: ab => 14 + Math.min(2, getAbilityModifier(ab.dex)),
    defaultEquipment: [
      { name: 'Longbow', quantity: 1, desc: 'Ranged (range 150/600 ft), 1d8+4 Piercing (Slow)' },
      { name: 'Shortsword', quantity: 2, desc: 'Finesse, Light, 1d6+4 Piercing (Vex)' },
      { name: 'Scale Mail', quantity: 1, desc: 'Medium Armor (AC 14 + DEX max 2)' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ["Hunter's Mark", 'Cure Wounds', 'Entangle'],
    coreFeatures: [
      { name: 'Favored Enemy', desc: "You always have Hunter's Mark prepared and can cast it multiple times without expending a spell slot." },
      { name: 'Deft Explorer', desc: 'Gain Expertise in one skill of your choice and two bonus languages.' },
    ],
  },
  Rogue: {
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: 'dex',
    savingThrows: ['dex', 'int'],
    defaultSubclasses: ['Thief', 'Assassin', 'Arcane Trickster'],
    isSpellcaster: false,
    baseAcCalculation: ab => 12 + getAbilityModifier(ab.dex),
    defaultEquipment: [
      { name: 'Shortsword', quantity: 1, desc: 'Finesse, Light, 1d6+4 Piercing (Vex)' },
      { name: 'Shortbow', quantity: 1, desc: 'Ranged (range 80/320 ft), 1d6+4 Piercing' },
      { name: 'Dagger', quantity: 2, desc: 'Finesse, Light, Thrown (range 20/60 ft), 1d4+4 Piercing (Nick)' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: [],
    coreFeatures: [
      { name: 'Sneak Attack', desc: 'Once per turn, deal extra 2d6 damage when you hit with a Finesse or Ranged weapon with Advantage or an ally within 5 ft.' },
      { name: 'Cunning Action', desc: 'Bonus Action: Take the Dash, Disengage, or Hide action.' },
      { name: 'Uncanny Dodge', desc: 'Reaction: Halve the damage of an attack that hits you from an attacker you can see.' },
    ],
  },
  Sorcerer: {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: 'cha',
    savingThrows: ['con', 'cha'],
    defaultSubclasses: ['Draconic Sorcery', 'Wild Magic Sorcery'],
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    baseAcCalculation: ab => 13 + getAbilityModifier(ab.dex),
    defaultEquipment: [
      { name: 'Quarterstaff', quantity: 1, desc: 'Arcane Focus, 1d6+1 Bludgeoning' },
      { name: 'Dagger', quantity: 2, desc: 'Finesse, Thrown (range 20/60 ft), 1d4+2 Piercing' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Fire Bolt', 'Magic Missile', 'Burning Hands', 'Misty Step', 'Fireball'],
    coreFeatures: [
      { name: 'Innate Sorcery', desc: 'Bonus Action: For 1 minute, your Sorcerer spell save DC increases by 1 and you have Advantage on Sorcerer spell attack rolls.' },
      { name: 'Font of Magic & Metamagic', desc: 'Spend Sorcery Points to twist spells with Careful, Distant, Empowered, Quickened, or Twinned Spell.' },
    ],
  },
  Warlock: {
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: 'cha',
    savingThrows: ['wis', 'cha'],
    defaultSubclasses: ['Fiend Patron', 'Archfey Patron', 'Great Old One'],
    isSpellcaster: true,
    spellcastingAbility: 'cha',
    baseAcCalculation: ab => 12 + getAbilityModifier(ab.dex),
    defaultEquipment: [
      { name: 'Rod of the Pact Keeper', quantity: 1, desc: 'Arcane Focus, 1d6+2 Bludgeoning' },
      { name: 'Dagger', quantity: 2, desc: 'Finesse, Thrown (range 20/60 ft), 1d4+2 Piercing' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Eldritch Blast', 'Hex', 'Hellish Rebuke', 'Misty Step', 'Fireball'],
    coreFeatures: [
      { name: 'Pact Magic', desc: 'Regain all expended Pact Magic spell slots when you finish a Short or Long Rest.' },
      { name: 'Eldritch Invocations', desc: 'Agonizing Blast: Add your Charisma modifier to the damage rolls of your Eldritch Blast.' },
    ],
  },
  Wizard: {
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: 'int',
    savingThrows: ['int', 'wis'],
    defaultSubclasses: ['Evoker', 'Abjurer', 'Diviner'],
    isSpellcaster: true,
    spellcastingAbility: 'int',
    baseAcCalculation: ab => 13 + getAbilityModifier(ab.dex),
    defaultEquipment: [
      { name: 'Arcane Quarterstaff', quantity: 1, desc: 'Versatile, 1d6+1 Bludgeoning' },
      { name: 'Spellbook & Component Pouch', quantity: 1, desc: 'Contains prepared Wizard incantations' },
      { name: 'Potion of Healing', quantity: 1, desc: 'Bonus Action: Heals 2d4+2 HP' },
    ],
    defaultSpells: ['Fire Bolt', 'Magic Missile', 'Burning Hands', 'Misty Step', 'Fireball'],
    coreFeatures: [
      { name: 'Arcane Recovery', desc: 'Once per day during a Short Rest, recover expended spell slots with a combined level up to half your Wizard level.' },
      { name: 'Sculpt Spells', desc: 'Create pockets of safety within your Evocation spells so chosen allies automatically succeed on their saves and take no damage.' },
    ],
  },
};

export const SRD_SPECIES_TRAITS: Record<string, { speed: number; traits: Array<{ name: string; desc: string }> }> = {
  Dragonborn: {
    speed: 30,
    traits: [
      { name: 'Breath Weapon', desc: 'Replace one attack with a 15-ft Cone or 30-ft Line exhalation of elemental energy (1d10/2d10 damage).' },
      { name: 'Damage Resistance', desc: 'Resistance to the damage type of your Draconic Ancestry.' },
      { name: 'Darkvision', desc: 'See in dim light within 60 ft as if it were bright light.' },
    ],
  },
  Dwarf: {
    speed: 30,
    traits: [
      { name: 'Dwarven Resilience', desc: 'Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition.' },
      { name: 'Dwarven Toughness', desc: 'Your Hit Point maximum increases by 1 for each character level.' },
      { name: 'Stonecunning', desc: 'Bonus Action: Gain Tremorsense with a range of 60 ft for 10 minutes on stone surfaces.' },
    ],
  },
  Elf: {
    speed: 30,
    traits: [
      { name: 'Fey Ancestry', desc: 'You have Advantage on saving throws you make to avoid or end the Charmed condition.' },
      { name: 'Darkvision', desc: 'See in dim light within 60 ft as if it were bright light.' },
      { name: 'Keen Senses', desc: 'Proficiency in the Insight, Perception, or Survival skill.' },
    ],
  },
  Gnome: {
    speed: 30,
    traits: [
      { name: 'Gnomish Cunning', desc: 'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.' },
      { name: 'Darkvision', desc: 'See in dim light within 60 ft as if it were bright light.' },
    ],
  },
  Goliath: {
    speed: 35,
    traits: [
      { name: 'Giant Ancestry', desc: 'Call upon the supernatural boon of your giant progenitors (Stone Endurance, Fire Burn, or Frost Chill).' },
      { name: 'Large Form', desc: 'Bonus Action (Level 5+): Become Large for 10 minutes with Advantage on Strength checks and +10 ft Speed.' },
    ],
  },
  Halfling: {
    speed: 30,
    traits: [
      { name: 'Luck', desc: 'When you roll a 1 on the d20 of a D20 Test, you can reroll the die and must use the new roll.' },
      { name: 'Brave', desc: 'You have Advantage on saving throws you make to avoid or end the Frightened condition.' },
      { name: 'Halfling Nimbleness', desc: 'You can move through the space of any creature that is a size larger than yours.' },
    ],
  },
  Human: {
    speed: 30,
    traits: [
      { name: 'Resourceful', desc: 'You gain Heroic Inspiration whenever you finish a Long Rest.' },
      { name: 'Versatile', desc: 'Gain proficiency in one skill of your choice and an Origin Feat.' },
    ],
  },
  Orc: {
    speed: 30,
    traits: [
      { name: 'Adrenaline Rush', desc: 'Bonus Action: Take the Dash action and gain Temporary Hit Points equal to your Proficiency Bonus.' },
      { name: 'Relentless Endurance', desc: 'When reduced to 0 HP but not killed outright, drop to 1 HP instead (1/Long Rest).' },
      { name: 'Darkvision', desc: 'See in dim light within 120 ft as if it were bright light.' },
    ],
  },
  Tiefling: {
    speed: 30,
    traits: [
      { name: 'Fiendish Legacy', desc: 'Know Thaumaturgy and innate Abyssal, Chthonic, or Infernal spells; Resistance to Fire, Necrotic, or Poison.' },
      { name: 'Darkvision', desc: 'See in dim light within 60 ft as if it were bright light.' },
    ],
  },
};

/**
 * Builds a complete, ready-to-play PartyMember from SRD 5.2.1 Character Builder choices.
 */
export function buildCharacterFromSrdChoices(
  params: {
    name: string;
    species: string;
    className: string;
    subclass?: string;
    background: string;
    alignment?: string;
    level: number;
    abilities: AbilityScores;
    color?: string;
    selectedSpellNames?: string[];
  },
  library: LibraryEntry[] = []
): PartyMember {
  const {
    name,
    species,
    className,
    subclass,
    background,
    alignment = 'Neutral Good',
    level = 3,
    abilities,
    color = '#3b82f6',
    selectedSpellNames,
  } = params;

  const blueprint = SRD_CLASS_BLUEPRINTS[className] || SRD_CLASS_BLUEPRINTS.Fighter;
  const fallbackSpeciesInfo = SRD_SPECIES_TRAITS[species] || SRD_SPECIES_TRAITS.Human;
  const libSpecies = library.find(
    e => e.category === 'races' && e.name.toLowerCase() === species.toLowerCase()
  );
  const libSpeedNum = libSpecies?.stats?.speed
    ? parseInt(String(libSpecies.stats.speed), 10) || 30
    : fallbackSpeciesInfo.speed;
  const libSpeciesTraits =
    libSpecies?.stats?.traits && libSpecies.stats.traits.length > 0
      ? libSpecies.stats.traits.slice(0, 4).map(t => ({
          name: t.name,
          desc: stripWikiLinks(t.text).slice(0, 220),
        }))
      : SRD_SPECIES_TRAITS[species]
        ? SRD_SPECIES_TRAITS[species].traits
        : libSpecies
          ? [{ name: `${libSpecies.name} Traits`, desc: stripWikiLinks(libSpecies.summary || '').slice(0, 220) }]
          : fallbackSpeciesInfo.traits;

  const profBonus = getProficiencyBonus(level);
  const conMod = getAbilityModifier(abilities.con);
  const wisMod = getAbilityModifier(abilities.wis);

  // Calculate Max HP: Level 1 = max Hit Die + CON mod; subsequent levels = average (hitDie/2 + 1) + CON mod
  const perLevelAvg = Math.floor(blueprint.hitDie / 2) + 1;
  const dwarfBonus = species.toLowerCase().includes('dwarf') ? level : 0;
  const maxHp = Math.max(
    level * 3,
    blueprint.hitDie + conMod + (level - 1) * (perLevelAvg + conMod) + dwarfBonus
  );

  const ac = Math.max(10, blueprint.baseAcCalculation(abilities));
  const passivePerception = 10 + wisMod + profBonus;
  const passiveInsight = 10 + wisMod + (className === 'Cleric' || className === 'Druid' ? profBonus : 0);

  const savingThrows: Partial<Record<keyof AbilityScores, boolean>> = {};
  for (const st of blueprint.savingThrows) {
    savingThrows[st] = true;
  }

  // Build Features from Species Traits + Class Features + Subclass + Background
  const features: Array<{ name: string; desc: string }> = [
    ...libSpeciesTraits,
    ...blueprint.coreFeatures,
  ];

  const chosenSub = subclass || blueprint.defaultSubclasses[0] || '';
  if (chosenSub) {
    const libSubclass = library.find(
      e =>
        (e.category === 'classes' && e.tags?.includes('Subclass')) &&
        (e.name.toLowerCase() === chosenSub.toLowerCase() ||
          e.name.toLowerCase() === `${className.toLowerCase()}: ${chosenSub.toLowerCase()}`)
    );
    if (libSubclass) {
      features.push({
        name: chosenSub,
        desc: stripWikiLinks(libSubclass.summary || libSubclass.content?.slice(0, 200) || `${chosenSub} specialization.`),
      });
    }
  }

  const libBg = library.find(
    e => e.category === 'backgrounds' && e.name.toLowerCase() === background.toLowerCase()
  );
  if (libBg) {
    features.push({
      name: `Background: ${libBg.name}`,
      desc: stripWikiLinks(libBg.summary || libBg.content?.slice(0, 200) || `${libBg.name} background.`),
    });
  }

  // Build Spellcasting & Spells if spellcaster
  let spellcasting: PartyMember['spellcasting'] | undefined;
  let spells: PartyMember['spells'] | undefined;

  if (blueprint.isSpellcaster && blueprint.spellcastingAbility) {
    const spellAbilMod = getAbilityModifier(abilities[blueprint.spellcastingAbility]);
    const spellSaveDc = 8 + profBonus + spellAbilMod;
    const spellAttackBonus = profBonus + spellAbilMod;
    const slotsMax =
      level >= 5 ? [4, 3, 2] : level >= 3 ? [4, 2] : [2];

    spellcasting = {
      spellSaveDc,
      spellAttackBonus,
      slotsMax,
      slotsUsed: slotsMax.map(() => 0),
    };

    const spellNamesToUse =
      selectedSpellNames && selectedSpellNames.length > 0
        ? selectedSpellNames
        : blueprint.defaultSpells;

    spells = spellNamesToUse.map(spName => {
      const libMatch = library.find(
        e => e.category === 'spells' && e.name.toLowerCase() === spName.toLowerCase()
      );
      if (libMatch) {
        return {
          name: libMatch.name,
          level: libMatch.stats?.level ?? 1,
          school: libMatch.stats?.school || 'Evocation',
          desc: stripWikiLinks(libMatch.summary || libMatch.content?.slice(0, 180) || ''),
          damage: libMatch.stats?.damage,
          damageType: libMatch.stats?.damageType,
          healing: libMatch.stats?.healing,
          range: libMatch.stats?.range || '60 ft',
          castingTime: libMatch.stats?.castingTime || '1 Action',
        };
      }
      // Fallback for standard spells if library isn't passed
      const lower = spName.toLowerCase();
      return {
        name: spName,
        level: lower.includes('bolt') || lower.includes('flame') || lower.includes('mockery') || lower.includes('blast') ? 0 : lower.includes('fireball') || lower.includes('spirit') || lower.includes('lightning') ? 3 : 1,
        school: 'Evocation',
        desc: `SRD 5.2.1 ${spName}`,
        damage: lower.includes('fireball') ? '8d6' : lower.includes('cure') || lower.includes('healing') ? undefined : '2d8',
        damageType: lower.includes('fire') ? 'Fire' : 'Force',
        healing: lower.includes('cure') ? '1d8+3' : lower.includes('healing word') ? '1d4+3' : undefined,
        range: lower.includes('cure') ? '5 ft' : '60 ft',
        castingTime: lower.includes('healing word') || lower.includes('misty step') || lower.includes('hex') ? '1 Bonus Action' : '1 Action',
      };
    });
  }

  const formattedClass = chosenSub ? `${className} (${chosenSub})` : className;

  return {
    id: `party_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: name.trim() || `${species} ${className}`,
    characterClass: formattedClass,
    level,
    hp: maxHp,
    maxHp,
    ac,
    passivePerception,
    passiveInsight,
    spellSaveDc: spellcasting?.spellSaveDc,
    color,
    race: species,
    alignment,
    background,
    speed: libSpeedNum,
    hitDice: `${level}d${blueprint.hitDie}`,
    hitDiceRemaining: level,
    tempHp: 0,
    abilities,
    savingThrows,
    equipment: blueprint.defaultEquipment.map(item => ({ ...item })),
    features,
    spellcasting,
    spells,
    notes: `${species} ${formattedClass} • ${background} Background`,
  };
}
