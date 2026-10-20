import type { LibraryEntry, PartyMember, HandoutItem } from '../types.ts';
import { FIVE_E_TOOLS_SOURCEBOOKS } from './fiveEToolsSourcebooks.ts';
import { FIVE_E_TOOLS_SPELLS } from './fiveEToolsSpells.ts';
import { FIVE_E_TOOLS_CLASSES } from './fiveEToolsClassesAndFeatures.ts';
import { FIVE_E_TOOLS_RACES_BG_FEATS } from './fiveEToolsRacesBgFeats.ts';
import { FIVE_E_TOOLS_ITEMS } from './fiveEToolsItems.ts';
import { FIVE_E_TOOLS_RULES_AND_ACTIONS } from './fiveEToolsRulesAndActions.ts';
import { FIVE_E_TOOLS_MONSTERS_1 } from './fiveEToolsMonsters1.ts';
import { FIVE_E_TOOLS_MONSTERS_2 } from './fiveEToolsMonsters2.ts';

export { FIVE_E_TOOLS_SOURCEBOOKS };

export function getSourcebookFullName(sourceCode?: string): string {
  if (!sourceCode) return 'Core Rules';
  const clean = sourceCode.trim();
  return FIVE_E_TOOLS_SOURCEBOOKS[clean] || clean;
}

function buildCompleteSeedLibrary(): LibraryEntry[] {
  return [
    ...FIVE_E_TOOLS_CLASSES,
    ...FIVE_E_TOOLS_RACES_BG_FEATS,
    ...FIVE_E_TOOLS_SPELLS,
    ...FIVE_E_TOOLS_ITEMS,
    ...FIVE_E_TOOLS_RULES_AND_ACTIONS,
    ...FIVE_E_TOOLS_MONSTERS_1,
    ...FIVE_E_TOOLS_MONSTERS_2,
  ];
}

// Comprehensive 5etools library covering all 133+ sourcebooks across classes, subclasses, class features, optional features, species/races/subraces, backgrounds, feats, spells, monsters, equipment, magic items, vehicles, objects, actions, conditions, rules glossary, senses, skills, weapon masteries, traps, hazards, bastions, supernatural gifts, cults, boons, deities, and languages
export const SEED_LIBRARY: LibraryEntry[] = buildCompleteSeedLibrary();


export const DEFAULT_PARTY: PartyMember[] = [
  {
    id: 'party_1',
    name: 'Thorgar Ironfist',
    characterClass: 'Fighter (Champion)',
    level: 5,
    race: 'Mountain Dwarf',
    alignment: 'Neutral Good',
    background: 'Soldier',
    hp: 44,
    maxHp: 44,
    tempHp: 0,
    ac: 18,
    speed: 25,
    hitDice: '5d10',
    passivePerception: 13,
    passiveInsight: 11,
    color: '#ef4444',
    abilities: { str: 18, dex: 12, con: 16, int: 10, wis: 12, cha: 8 },
    savingThrows: { str: true, con: true },
    skills: { Athletics: true, Intimidation: true, Survival: true },
    equipment: [
      { name: 'Plate Armor', quantity: 1, desc: 'AC 18' },
      { name: 'Greataxe', quantity: 1, desc: '1d12+4 slashing, heavy, two-handed' },
      { name: 'Handaxes', quantity: 2, desc: '1d6+4 slashing, thrown (20/60)' },
      { name: 'Healing Potion', quantity: 2, desc: 'Heals 2d4+2 HP' }
    ],
    features: [
      { name: 'Action Surge', desc: 'Take one additional action on your turn (1/short rest).' },
      { name: 'Second Wind', desc: 'Bonus action to regain 1d10+5 HP (1/short rest).' },
      { name: 'Improved Critical', desc: 'Weapon attacks score critical hits on 19 or 20.' },
      { name: 'Dwarven Resilience', desc: 'Advantage on saves vs poison, resistance to poison damage.' }
    ],
    notes: 'Veteran of the Siege of Redkeep. Loyal to the party above all else.'
  },
  {
    id: 'party_2',
    name: 'Elyndra Moonwhisper',
    characterClass: 'Wizard (Evocation)',
    level: 5,
    race: 'High Elf',
    alignment: 'Chaotic Good',
    background: 'Sage',
    hp: 28,
    maxHp: 28,
    tempHp: 0,
    ac: 12,
    speed: 30,
    hitDice: '5d6',
    passivePerception: 14,
    passiveInsight: 12,
    spellSaveDc: 15,
    color: '#3b82f6',
    abilities: { str: 8, dex: 14, con: 13, int: 18, wis: 12, cha: 10 },
    savingThrows: { int: true, wis: true },
    skills: { Arcana: true, History: true, Investigation: true, Perception: true },
    spellcasting: {
      spellSaveDc: 15,
      spellAttackBonus: 7,
      slotsMax: [4, 3, 2],
      slotsUsed: [1, 0, 1]
    },
    equipment: [
      { name: 'Arcane Focus (Crystal Wand)', quantity: 1, desc: 'Spell focus' },
      { name: 'Dagger', quantity: 1, desc: '1d4+2 piercing, finesse, light' },
      { name: 'Spellbook', quantity: 1, desc: 'Contains Fireball, Magic Missile, Shield, Misty Step' },
      { name: 'Scholar Pack', quantity: 1 }
    ],
    features: [
      { name: 'Sculpt Spells', desc: 'Protect 1+spell level allies from evocation spell damage.' },
      { name: 'Arcane Recovery', desc: 'Regain spell slots up to level 3 during a short rest (1/day).' },
      { name: 'Fey Ancestry', desc: 'Advantage on saves vs charm; magic cannot put you to sleep.' }
    ],
    spells: [
      { name: 'Fireball', level: 3, school: 'Evocation', damage: '8d6', damageType: 'Fire', range: '150 ft', castingTime: '1 Action', desc: 'A bright streak blossoms into a 20-ft radius sphere. 8d6 fire damage, DEX save for half.' },
      { name: 'Magic Missile', level: 1, school: 'Evocation', damage: '3d4+3', damageType: 'Force', range: '120 ft', castingTime: '1 Action', desc: 'Three glowing darts of magical force strike automatically for 1d4+1 force damage each.' },
      { name: 'Misty Step', level: 2, school: 'Conjuration', range: 'Self', castingTime: '1 Bonus Action', desc: 'Teleport up to 30 feet to an unoccupied space you can see.' },
      { name: 'Shield', level: 1, school: 'Abjuration', range: 'Self', castingTime: '1 Reaction', desc: '+5 bonus to AC until the start of your next turn; negates magic missile.' }
    ],
    notes: 'Apprentice to the Grand Arcanist of Silverpeak; seeking the ancient Netherese relics.'
  },
  {
    id: 'party_3',
    name: 'Roderick Vane',
    characterClass: 'Rogue (Arcane Trickster)',
    level: 5,
    race: 'Human',
    alignment: 'Chaotic Neutral',
    background: 'Criminal',
    hp: 35,
    maxHp: 35,
    tempHp: 0,
    ac: 16,
    speed: 30,
    hitDice: '5d8',
    passivePerception: 17,
    passiveInsight: 14,
    color: '#10b981',
    abilities: { str: 10, dex: 18, con: 14, int: 14, wis: 12, cha: 12 },
    savingThrows: { dex: true, int: true },
    skills: { Stealth: true, SleightOfHand: true, Acrobatics: true, Deception: true, Perception: true },
    equipment: [
      { name: 'Studded Leather Armor', quantity: 1, desc: 'AC 12+Dex' },
      { name: 'Rapier', quantity: 1, desc: '1d8+4 piercing, finesse' },
      { name: 'Shortbow', quantity: 1, desc: '1d6+4 piercing, range 80/320' },
      { name: 'Thieves Tools', quantity: 1, desc: '+7 to pick locks/disarm traps' }
    ],
    features: [
      { name: 'Sneak Attack', desc: 'Extra 3d6 damage once per turn with advantage or adjacent ally.' },
      { name: 'Cunning Action', desc: 'Bonus action to Dash, Disengage, or Hide.' },
      { name: 'Mage Hand Legerdemain', desc: 'Invisible Mage Hand that can pick locks and disarm traps.' },
      { name: 'Uncanny Dodge', desc: 'Reaction to halve incoming attack damage you can see.' }
    ],
    notes: 'Ex-guild thief with quick fingers and an eye for hidden treasure.'
  },
  {
    id: 'party_4',
    name: 'Brother Alden',
    characterClass: 'Cleric (Life Domain)',
    level: 5,
    race: 'Human',
    alignment: 'Lawful Good',
    background: 'Acolyte',
    hp: 38,
    maxHp: 38,
    tempHp: 0,
    ac: 18,
    speed: 30,
    hitDice: '5d8',
    passivePerception: 16,
    passiveInsight: 16,
    spellSaveDc: 14,
    color: '#f59e0b',
    abilities: { str: 14, dex: 10, con: 15, int: 10, wis: 18, cha: 12 },
    savingThrows: { wis: true, cha: true },
    skills: { Insight: true, Religion: true, Medicine: true, Persuasion: true },
    spellcasting: {
      spellSaveDc: 14,
      spellAttackBonus: 6,
      slotsMax: [4, 3, 2],
      slotsUsed: [0, 1, 0]
    },
    equipment: [
      { name: 'Chain Mail & Shield', quantity: 1, desc: 'AC 18' },
      { name: 'Warhammer', quantity: 1, desc: '1d8+2 bludgeoning (versatile 1d10)' },
      { name: 'Holy Symbol (Sun Amulet)', quantity: 1 },
      { name: 'Potion of Greater Healing', quantity: 1, desc: 'Heals 4d4+4 HP' }
    ],
    features: [
      { name: 'Disciple of Life', desc: 'Healing spells restore an additional 2 + spell level HP.' },
      { name: 'Channel Divinity: Preserve Life', desc: 'Heal up to 25 HP split among creatures below half HP.' },
      { name: 'Destroy Undead', desc: 'CR 1/2 or lower undead failing Turn Undead are destroyed.' }
    ],
    spells: [
      { name: 'Cure Wounds', level: 1, school: 'Evocation', healing: '1d8 + 3', range: 'Touch', castingTime: '1 Action', desc: 'A creature you touch regains hit points equal to 1d8 + your spellcasting modifier.' },
      { name: 'Healing Word', level: 1, school: 'Evocation', healing: '1d4 + 3', range: '60 ft', castingTime: '1 Bonus Action', desc: 'A creature of your choice you can see within range regains 1d4 + mod hit points.' },
      { name: 'Bless', level: 1, school: 'Enchantment', range: '30 ft', castingTime: '1 Action', desc: 'Bless up to three creatures. Targets add 1d4 to attack rolls and saving throws.' },
      { name: 'Spiritual Weapon', level: 2, school: 'Evocation', damage: '1d8 + 3', damageType: 'Force', range: '60 ft', castingTime: '1 Bonus Action', desc: 'Create a floating spectral weapon that makes melee spell attacks as a bonus action.' }
    ],
    notes: 'Devoted cleric of the Dawnbringer, staunch protector of his comrades.'
  }
];

export const DEFAULT_HANDOUTS: HandoutItem[] = [
  {
    id: 'handout_tavern',
    title: 'The Gilded Flagon Tavern',
    type: 'letter',
    caption: 'Cozy hearth, smell of roasted boar and spiced mead.',
    content: `**NOTICE TO TRAVELERS & ADVENTURERS**

The Gilded Flagon welcomes all honest wanderers seeking refuge from the cold Whispering Woods.

*Rules of the Hearth:*
1. No drawn blades past the threshold.
2. Magic that tampers with the bartender's measure will be met with iron cudgels.
3. Inquire with Master Corven regarding the strange lights spotted atop Weeping Crag. A reward of 150 gold pieces is offered for proof of their origin.

*— Corven Hallowell, Proprietor*`
  },
  {
    id: 'handout_crypt',
    title: 'The Tomb of the Ash King',
    type: 'letter',
    caption: 'Ancient rune-inscribed warning parchment discovered at the crypt entrance.',
    content: `**DWELLERS IN LIGHT, TREAD NO FURTHER**

Beneath this threshold sleeps Malakor, the Ash King, bound by three seals of runic silver.

*He who breaks the chain shall drink the ember,*
*He who disturbs the dust shall feed the flame.*

Only the bearer of the Sunlit Seal may pass without igniting the guardian pyres.`
  }
];
