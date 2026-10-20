import { LibraryEntry } from '../types.ts';

export interface SrdClassOrRaceRaw {
  name: string;
  category: 'classes' | 'races' | 'rules' | 'spells';
  subtitle: string;
  tags: string[];
  desc: string;
}

export const SRD_CLASSES_AND_SUBCLASSES: SrdClassOrRaceRaw[] = [
  {
    name: 'Barbarian',
    category: 'classes',
    subtitle: 'Core Class • d12 Hit Die • Primary: Strength • Saves: Strength, Constitution',
    tags: ['Class', 'Barbarian', 'Martial', 'Primal'],
    desc: `Hit Point Die: d12 per Barbarian level (12 + CON at 1st level, 7 + CON per level after)
Saving Throw Proficiencies: Strength, Constitution
Skill Proficiencies: Choose 2: Animal Handling, Athletics, Intimidation, Nature, Perception, Survival
Weapon Proficiencies: Simple and Martial weapons
Armor Training: Light and Medium armor, Shields

Level 1: Rage (2–6 uses, +2 to +4 Rage Damage, Resistance to Bludgeoning/Piercing/Slashing, Advantage on Strength checks/saves, lasts up to 10 minutes), Unarmored Defense (AC = 10 + DEX + CON, can use Shield), Weapon Mastery (2–4 weapons).
Level 2: Danger Sense (Advantage on DEX saves unless Incapacitated), Reckless Attack (Advantage on Strength attack rolls for the turn, attacks against you have Advantage).
Level 3: Barbarian Subclass (Path of the Berserker), Primal Knowledge (gain proficiency in another Barbarian skill; while Raging, can use Strength for Acrobatics, Intimidation, Perception, Stealth, or Survival).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Extra Attack (attack twice), Fast Movement (+10 ft Speed while not wearing Heavy armor).
Level 7: Feral Instinct (Advantage on Initiative), Instinctive Pounce (move up to half Speed as part of Bonus Action to enter Rage).
Level 9: Brutal Strike (forgo Reckless Attack Advantage on one attack to deal +1d10 damage and apply Forceful Blow [push 15 ft + move half Speed] or Hamstring Blow [-15 ft Speed]).
Level 11: Relentless Rage (DC 10 CON save when dropping to 0 HP while Raging to drop to 2x Barbarian level HP instead; DC +5 each time).
Level 13: Improved Brutal Strike (adds Staggering Blow [Disadvantage on next save, no Opportunity Attacks] and Sundering Blow [+5 to next ally's attack roll]).
Level 15: Persistent Rage (regain all Rage uses when rolling Initiative once per Long Rest; Rage lasts 10 minutes without needing to attack/extend).
Level 17: Brutal Strike damage increases to 2d10 and applies two effects.
Level 18: Indomitable Might (if Strength check/save total is less than Strength score, use Strength score).
Level 19: Epic Boon.
Level 20: Primal Champion (+4 Strength and +4 Constitution, maximum 25).`
  },
  {
    name: 'Path of the Berserker',
    category: 'classes',
    subtitle: 'Barbarian Subclass • Primal Path of Untrammeled Fury',
    tags: ['Subclass', 'Barbarian', 'Path of the Berserker'],
    desc: `Barbarians who walk the Path of the Berserker direct their Rage primarily toward violence.
Level 3: Frenzy — If you use Reckless Attack while your Rage is active, you deal extra damage to the first target you hit on your turn with a Strength-based attack equal to a number of d6s equal to your Rage Damage bonus (2d6 at level 3, 3d6 at level 9, 4d6 at level 16). (In 5.1: Bonus Action melee weapon attack while raging).
Level 6: Mindless Rage — You have Immunity to the Charmed and Frightened conditions while your Rage is active. If you're Charmed or Frightened when you enter your Rage, the condition ends on you.
Level 10: Retaliation — When you take damage from a creature that is within 5 feet of you, you can take a Reaction to make one melee attack against that creature, using a weapon or an Unarmed Strike.
Level 14: Intimidating Presence — As a Bonus Action, unleash terrifying menace in a 30-foot Emanation. Each creature of your choice makes a Wisdom save (DC 8 + STR + Prof) or has the Frightened condition for 1 minute (1/Long Rest or expend a Rage use to restore).`
  },
  {
    name: 'Bard',
    category: 'classes',
    subtitle: 'Core Class • d8 Hit Die • Primary: Charisma • Saves: Dexterity, Charisma',
    tags: ['Class', 'Bard', 'Spellcaster', 'Arcane'],
    desc: `Hit Point Die: d8 per Bard level (8 + CON at 1st level, 5 + CON per level after)
Saving Throw Proficiencies: Dexterity, Charisma
Skill Proficiencies: Choose any 3 skills
Tool Proficiencies: Choose 3 Musical Instruments
Weapon Proficiencies: Simple weapons
Armor Training: Light armor

Level 1: Bardic Inspiration (Bonus Action to grant ally within 60 ft a Bardic Inspiration die: d6 at level 1, d8 at level 5, d10 at level 10, d12 at level 15; lasts 1 hour, expend on failed D20 Test to add roll; CHA mod uses), Spellcasting (Charisma; Musical Instrument focus; Cantrips & Prepared Spells).
Level 2: Expertise (2 skills at level 2, 2 more at level 9), Jack of All Trades (add half Proficiency Bonus rounded down to any ability check without proficiency).
Level 3: Bard Subclass (College of Lore).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Font of Inspiration (Bardic Inspiration recovers on Short or Long Rest; can expend a spell slot to regain a use).
Level 7: Countercharm (Reaction when you or creature within 30 ft fails a save vs Charmed or Frightened to grant immediate reroll with Advantage).
Level 10: Magical Secrets (whenever you reach a Bard level that grants prepared spells, you can choose your new prepared spells from the Bard, Cleric, Druid, and Wizard spell lists).
Level 18: Superior Inspiration (when rolling Initiative with fewer than 2 Bardic Inspiration uses, regain uses until you have 2).
Level 19: Epic Boon.
Level 20: Words of Creation (always have Power Word Heal and Power Word Kill prepared; can target a second creature within 10 ft of the first).`
  },
  {
    name: 'College of Lore',
    category: 'classes',
    subtitle: 'Bard Subclass • Plumb the Depths of Magical Knowledge',
    tags: ['Subclass', 'Bard', 'College of Lore'],
    desc: `Bards of the College of Lore collect spells and secrets from diverse sources.
Level 3: Bonus Proficiencies — You gain proficiency with three skills of your choice.
Level 3: Cutting Words — When a creature you can see within 60 feet makes a damage roll or succeeds on an ability check or attack roll, you can take a Reaction to expend one use of Bardic Inspiration, roll the die, and subtract the number rolled from the creature's roll.
Level 6: Magical Discoveries — You learn two spells of your choice from the Cleric, Druid, or Wizard spell list (level 1–3), which are always prepared.
Level 14: Peerless Skill — When you make an ability check or attack roll and fail, you can expend one use of Bardic Inspiration, roll the die, and add it to the d20, only expending the die if the roll succeeds.`
  },
  {
    name: 'Cleric',
    category: 'classes',
    subtitle: 'Core Class • d8 Hit Die • Primary: Wisdom • Saves: Wisdom, Charisma',
    tags: ['Class', 'Cleric', 'Spellcaster', 'Divine'],
    desc: `Hit Point Die: d8 per Cleric level (8 + CON at 1st level, 5 + CON per level after)
Saving Throw Proficiencies: Wisdom, Charisma
Skill Proficiencies: Choose 2: History, Insight, Medicine, Persuasion, Religion
Weapon Proficiencies: Simple weapons
Armor Training: Light and Medium armor, Shields

Level 1: Spellcasting (Wisdom; Holy Symbol focus; Ritual casting), Divine Order (choose Protector [Martial weapons & Heavy armor] or Thaumaturge [+1 cantrip & +WIS mod to Arcana/Religion checks]).
Level 2: Channel Divinity (2–4 uses, regain 1 on Short Rest, all on Long Rest):
  • Divine Spark (Magic action, 30 ft: heal or deal Necrotic/Radiant damage equal to 1d8 + WIS [scales to 2d8, 3d8, 4d8], CON save for half damage).
  • Turn Undead (Magic action, 30 ft Emanation: Undead make WIS save or are Frightened and Incapacitated and must move away for 1 minute).
Level 3: Cleric Subclass (Life Domain).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Sear Undead (whenever you use Turn Undead, Undead that fail the save take WIS mod d8s of Radiant damage, which doesn't end Turn Undead).
Level 7: Blessed Strikes (choose Divine Strike [+1d8 Radiant or Necrotic damage once per turn on weapon hit, 2d8 at level 14] or Potent Spellcasting [+WIS mod to Cleric cantrip damage]).
Level 10: Divine Intervention (Magic action to cast any Cleric spell of level 5 or lower that doesn't require a Reaction without expending a spell slot or needing Material components, 1/Long Rest).
Level 14: Improved Blessed Strikes (Divine Strike becomes 2d8; Potent Spellcasting grants 2x WIS mod Temporary HP to a creature within 60 ft).
Level 19: Epic Boon.
Level 20: Greater Divine Intervention (can choose Wish when using Divine Intervention; 2d4 Long Rest cooldown if Wish is chosen).`
  },
  {
    name: 'Life Domain',
    category: 'classes',
    subtitle: 'Cleric Subclass • Soothe the Hurts of the World',
    tags: ['Subclass', 'Cleric', 'Life Domain', 'Healer'],
    desc: `The Life Domain focuses on the vibrant positive energy—one of the fundamental forces of the universe—that sustains all life.
Level 3: Disciple of Life — When a spell you cast with a spell slot restores Hit Points to a creature, that creature regains additional Hit Points on the turn you cast the spell equal to 2 plus the spell slot's level.
Level 3: Life Domain Spells — Always prepared: Aid, Bless, Cure Wounds, Lesser Restoration (3rd); Mass Healing Word, Revivify (5th); Aura of Life, Death Ward (7th); Greater Restoration, Mass Cure Wounds (9th).
Level 3: Preserve Life — Channel Divinity (Magic action): Restore Hit Points equal to 5 times your Cleric level, divided among Bloodied creatures within 30 feet (up to half their HP maximum).
Level 6: Blessed Healer — Whenever you cast a spell with a spell slot that restores Hit Points to another creature, you regain Hit Points equal to 2 plus the spell slot's level.
Level 17: Supreme Healing — When you would normally roll one or more dice to restore Hit Points to a creature with a spell or Channel Divinity, don't roll those dice; instead use the highest number possible for each die.`
  },
  {
    name: 'Druid',
    category: 'classes',
    subtitle: 'Core Class • d8 Hit Die • Primary: Wisdom • Saves: Intelligence, Wisdom',
    tags: ['Class', 'Druid', 'Spellcaster', 'Primal'],
    desc: `Hit Point Die: d8 per Druid level (8 + CON at 1st level, 5 + CON per level after)
Saving Throw Proficiencies: Intelligence, Wisdom
Skill Proficiencies: Choose 2: Animal Handling, Arcana, Insight, Medicine, Nature, Perception, Religion, Survival
Tool Proficiencies: Herbalism Kit
Weapon Proficiencies: Simple weapons
Armor Training: Light armor, Shields

Level 1: Spellcasting (Wisdom; Druidic Focus), Druidic (secret language & always have Speak with Animals prepared), Primal Order (choose Magician [+1 cantrip & +WIS mod to Arcana/Nature checks] or Warden [Medium armor & Martial weapons]).
Level 2: Wild Shape (Bonus Action, 2–4 uses, regain 1 on Short Rest, all on Long Rest; shape-shift into a known Beast form for up to half Druid level hours, gaining Temporary HP equal to Druid level; Max CR 1/4 no Fly at level 2, CR 1/2 at level 4, CR 1 with Fly at level 8), Wild Companion (expend a spell slot or Wild Shape use to cast Find Familiar as a Fey).
Level 3: Druid Subclass (Circle of the Land).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Wild Resurgence (once on each turn, if you have no Wild Shape uses left, expend a spell slot to gain one use; or expend a Wild Shape use to regain a level 1 spell slot 1/Long Rest).
Level 7: Elemental Fury (choose Potent Spellcasting [+WIS mod to Druid cantrip damage] or Primal Strike [+1d8 Cold, Fire, Lightning, or Thunder damage once per turn on weapon/Beast hit, 2d8 at level 15]).
Level 18: Beast Spells (cast spells while in Wild Shape, except those with costly/consumed Material components).
Level 19: Epic Boon.
Level 20: Archdruid (Evergreen Wild Shape: regain 1 use on Initiative if you have 0; Nature Magician: convert Wild Shape uses into a single spell slot up to 1/Long Rest; Longevity: age 1 year per 10 years).`
  },
  {
    name: 'Circle of the Land',
    category: 'classes',
    subtitle: 'Druid Subclass • Celebrate Connection to the Natural World',
    tags: ['Subclass', 'Druid', 'Circle of the Land'],
    desc: `The Circle of the Land comprises mystics and sages who safeguard ancient knowledge and rites.
Level 3: Circle of the Land Spells — Choose a land type whenever you finish a Long Rest:
  • Arid Land: Blur, Burning Hands, Fire Bolt (3rd); Fireball (5th); Blight (7th); Wall of Stone (9th).
  • Polar Land: Fog Cloud, Hold Person, Ray of Frost (3rd); Sleet Storm (5th); Ice Storm (7th); Cone of Cold (9th).
  • Temperate Land: Misty Step, Shocking Grasp, Sleep (3rd); Lightning Bolt (5th); Freedom of Movement (7th); Tree Stride (9th).
  • Tropical Land: Acid Splash, Ray of Sickness, Web (3rd); Stinking Cloud (5th); Polymorph (7th); Insect Plague (9th).
Level 3: Land's Aid — Magic action (expend a Wild Shape use): 10-foot-radius Sphere within 60 ft deals 2d6 Necrotic damage to enemies (CON save for half) and heals one ally for 2d6 HP (scales to 3d6 at 10th, 4d6 at 14th).
Level 6: Natural Recovery — Cast one of your Circle Spells without a slot (1/Long Rest), and regain spell slots totaling up to half your Druid level during a Short Rest (1/Long Rest).
Level 10: Nature's Ward — Immune to Poisoned condition, and Resistance to the damage type of your current land choice (Fire/Cold/Lightning/Poison).
Level 14: Nature's Sanctuary — Magic action (expend Wild Shape use): spectral trees and vines in a 15-foot Cube grant Half Cover to you and allies and current land Resistance.`
  },
  {
    name: 'Fighter',
    category: 'classes',
    subtitle: 'Core Class • d10 Hit Die • Primary: Strength or Dexterity • Saves: Strength, Constitution',
    tags: ['Class', 'Fighter', 'Martial', 'Warrior'],
    desc: `Hit Point Die: d10 per Fighter level (10 + CON at 1st level, 6 + CON per level after)
Saving Throw Proficiencies: Strength, Constitution
Skill Proficiencies: Choose 2: Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Persuasion, Perception, Survival
Weapon Proficiencies: Simple and Martial weapons
Armor Training: Light, Medium, and Heavy armor, Shields

Level 1: Fighting Style (gain a Fighting Style feat), Second Wind (Bonus Action to regain 1d10 + Fighter level HP; 2–4 uses, regain 1 on Short Rest, all on Long Rest), Weapon Mastery (3–6 weapons).
Level 2: Action Surge (take one additional action on your turn except Magic action; 1/Short or Long Rest, 2 uses at level 17), Tactical Mind (when you fail an ability check, expend a Second Wind use to add 1d10 to the roll; only expended if it succeeds).
Level 3: Fighter Subclass (Champion).
Level 4: Ability Score Improvement (4, 6, 8, 12, 14, 16).
Level 5: Extra Attack (attack twice; 3 times at level 11, 4 times at level 20), Tactical Shift (whenever you activate Second Wind, move up to half your Speed without provoking Opportunity Attacks).
Level 9: Indomitable (reroll a failed saving throw with a bonus equal to your Fighter level; 1 use at 9, 2 at 13, 3 at 17), Tactical Master (replace a weapon's Mastery property with Push, Sap, or Slow on an attack).
Level 11: Two Extra Attacks (three attacks per Attack action).
Level 13: Studied Attacks (if you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn).
Level 19: Epic Boon.
Level 20: Three Extra Attacks (four attacks per Attack action).`
  },
  {
    name: 'Champion',
    category: 'classes',
    subtitle: 'Fighter Subclass • Pursue Physical Excellence in Combat',
    tags: ['Subclass', 'Fighter', 'Champion'],
    desc: `A Champion focuses on the development of martial prowess in a relentless pursuit of victory.
Level 3: Improved Critical — Your attack rolls with weapons and Unarmed Strikes can score a Critical Hit on a roll of 19 or 20 on the d20.
Level 3: Remarkable Athlete — You have Advantage on Initiative rolls and Strength (Athletics) checks. In addition, immediately after you score a Critical Hit, you can move up to half your Speed without provoking Opportunity Attacks.
Level 7: Additional Fighting Style — You gain another Fighting Style feat of your choice.
Level 10: Heroic Warrior — During combat, you can give yourself Heroic Inspiration at the start of your turn if you don't have it.
Level 15: Superior Critical — Your attack rolls with weapons and Unarmed Strikes can now score a Critical Hit on a roll of 18–20 on the d20.
Level 18: Survivor — Defy Death (Advantage on Death Saving Throws, and 18–20 on a Death Save counts as a 20); Heroic Rally (at the start of each turn, regain 5 + CON modifier HP if you are Bloodied and have at least 1 HP).`
  },
  {
    name: 'Monk',
    category: 'classes',
    subtitle: 'Core Class • d8 Hit Die • Primary: Dexterity & Wisdom • Saves: Strength, Dexterity',
    tags: ['Class', 'Monk', 'Martial', 'Focus'],
    desc: `Hit Point Die: d8 per Monk level (8 + CON at 1st level, 5 + CON per level after)
Saving Throw Proficiencies: Strength, Dexterity
Skill Proficiencies: Choose 2: Acrobatics, Athletics, History, Insight, Religion, Stealth
Weapon Proficiencies: Simple weapons and Martial weapons with the Light property
Armor Training: None

Level 1: Martial Arts (while unarmored and without a Shield: Bonus Unarmed Strike as Bonus Action; Martial Arts die d6 [scales to d8 at 5, d10 at 11, d12 at 17]; Dexterous Attacks using DEX for Unarmed Strikes, Monk weapons, and Grapple/Shove DC), Unarmored Defense (AC = 10 + DEX + WIS).
Level 2: Monk's Focus (Focus Points equal to Monk level, recover on Short/Long Rest):
  • Flurry of Blows (1 Focus Point: make 2 Unarmed Strikes as a Bonus Action).
  • Patient Defense (Disengage as Bonus Action; or spend 1 Focus Point to Disengage AND Dodge as Bonus Action).
  • Step of the Wind (Dash as Bonus Action; or spend 1 Focus Point to Disengage AND Dash as Bonus Action with doubled jump distance).
Level 2: Unarmored Movement (+10 ft to +30 ft Speed while unarmored), Uncanny Metabolism (when rolling Initiative, regain all expended Focus Points and heal 1 Martial Arts die + Monk level HP, 1/Long Rest).
Level 3: Deflect Attacks (Reaction when hit by Bludgeoning/Piercing/Slashing attack to reduce damage by 1d10 + DEX + Monk level; if reduced to 0, spend 1 Focus Point to redirect for 2 Martial Arts dice + DEX Force damage), Monk Subclass (Warrior of the Open Hand).
Level 4: Ability Score Improvement (4, 8, 12, 16), Slow Fall (Reaction to reduce falling damage by 5x Monk level).
Level 5: Extra Attack, Stunning Strike (once per turn on Monk weapon/Unarmed hit, spend 1 Focus Point: target makes CON save or is Stunned until start of your next turn; on save, Speed halved and next attack against it has Advantage).
Level 6: Empowered Strikes (Unarmed Strikes can deal Force damage).
Level 7: Evasion (DEX saves for half damage deal 0 on success and half on failure).
Level 9: Acrobatic Movement (move along vertical surfaces and across liquids on your turn without falling).
Level 10: Heightened Focus (Flurry of Blows makes 3 Unarmed Strikes; Patient Defense grants 2 Martial Arts dice Temporary HP; Step of the Wind can carry a willing creature), Self-Restoration (end Charmed, Frightened, or Poisoned at end of turn; 1 Exhaustion removed on Short Rest).
Level 13: Deflect Energy (Deflect Attacks works against any damage type).
Level 14: Disciplined Survivor (proficiency in all saving throws; spend 1 Focus Point to reroll a failed save).
Level 15: Perfect Focus (regain up to 4 Focus Points when rolling Initiative with fewer than 4).
Level 18: Superior Defense (spend 3 Focus Points at start of turn for Resistance to all damage except Force for 1 minute).
Level 19: Epic Boon.
Level 20: Body and Mind (+4 Dexterity and +4 Wisdom, maximum 25).`
  },
  {
    name: 'Warrior of the Open Hand',
    category: 'classes',
    subtitle: 'Monk Subclass (Way of the Open Hand) • Master Unarmed Combat Techniques',
    tags: ['Subclass', 'Monk', 'Warrior of the Open Hand', 'Way of the Open Hand'],
    desc: `Warriors of the Open Hand are masters of unarmed combat.
Level 3: Open Hand Technique — Whenever you hit a creature with an attack granted by your Flurry of Blows, you can impose one of the following effects on that target:
  • Addle: The target can't make Opportunity Attacks until the start of its next turn.
  • Push: The target must succeed on a Strength saving throw or be pushed up to 15 feet away from you.
  • Topple: The target must succeed on a Dexterity saving throw or have the Prone condition.
Level 6: Wholeness of Body — As a Bonus Action, roll your Martial Arts die and regain Hit Points equal to the number rolled plus your Wisdom modifier (uses = Wisdom modifier per Long Rest).
Level 11: Fleet Step — Whenever you take a Bonus Action other than Step of the Wind, you can also use Step of the Wind immediately as part of that Bonus Action.
Level 17: Quivering Palm — Hit with Unarmed Strike and expend 4 Focus Points to set up lethal vibrations lasting up to Monk level days. Take an action to end vibrations: target makes a CON save, taking 10d12 Force damage on a failed save or half on a success.`
  },
  {
    name: 'Paladin',
    category: 'classes',
    subtitle: 'Core Class • d10 Hit Die • Primary: Strength & Charisma • Saves: Wisdom, Charisma',
    tags: ['Class', 'Paladin', 'Martial', 'Divine', 'Spellcaster'],
    desc: `Hit Point Die: d10 per Paladin level (10 + CON at 1st level, 6 + CON per level after)
Saving Throw Proficiencies: Wisdom, Charisma
Skill Proficiencies: Choose 2: Athletics, Insight, Intimidation, Medicine, Persuasion, Religion
Weapon Proficiencies: Simple and Martial weapons
Armor Training: Light, Medium, and Heavy armor, Shields

Level 1: Lay on Hands (Bonus Action healing pool = 5 x Paladin level; spend 5 HP from pool to remove Poisoned condition), Spellcasting (Charisma; Holy Symbol focus), Weapon Mastery (2 weapons).
Level 2: Fighting Style (choose a Fighting Style feat or Blessed Warrior [2 Cleric cantrips]), Paladin's Smite (always have Divine Smite prepared, and can cast it once per Long Rest without expending a spell slot).
Level 3: Channel Divinity (2–3 uses, regain 1 on Short Rest, all on Long Rest; Divine Sense: Bonus Action to detect Celestials, Fiends, Undead, and consecrated/desecrated places within 60 ft for 10 minutes), Paladin Subclass (Oath of Devotion).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Extra Attack, Faithful Steed (always have Find Steed prepared, and can cast it once per Long Rest without expending a spell slot).
Level 6: Aura of Protection (10-foot Emanation [30 ft at level 18]: you and allies in the aura gain a bonus to saving throws equal to your Charisma modifier, minimum +1).
Level 9: Abjure Foes (Magic action, expend Channel Divinity: CHA mod creatures within 60 ft make WIS save or are Frightened for 1 minute and can only move or take an action on their turns).
Level 10: Aura of Courage (you and allies in your Aura of Protection have Immunity to the Frightened condition).
Level 11: Radiant Strikes (your melee weapon and Unarmed Strike hits deal an extra 1d8 Radiant damage).
Level 14: Restoring Touch (when using Lay on Hands, you can also spend 5 HP per condition to remove Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned).
Level 18: Aura Expansion (Aura of Protection becomes a 30-foot Emanation).
Level 19: Epic Boon.`
  },
  {
    name: 'Divine Smite',
    category: 'spells',
    subtitle: 'Level 1 Paladin Evocation Spell (and Core Feature)',
    tags: ['Spell', 'Paladin', 'Evocation', 'Radiant', 'Smite'],
    desc: `Level 1 Evocation (Paladin)
Casting Time: Bonus Action, which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike
Range: Self | Components: V | Duration: Instantaneous
Damage: 2d8 Radiant (+1d8 vs Fiends and Undead)
As you hit the target, your strike flares with divine power. The target takes an extra 2d8 Radiant damage from the attack. The damage increases by 1d8 if the target is a Fiend or an Undead. Higher Levels: +1d8 Radiant damage per spell slot level above 1.`
  },
  {
    name: 'Oath of Devotion',
    category: 'classes',
    subtitle: 'Paladin Subclass • Uphold the Ideals of Justice and Order',
    tags: ['Subclass', 'Paladin', 'Oath of Devotion'],
    desc: `The Oath of Devotion binds a Paladin to the loftiest ideals of justice and order.
Level 3: Oath of Devotion Spells — Always prepared: Protection from Evil and Good, Shield of Faith (3rd); Aid, Zone of Truth (5th); Beacon of Hope, Dispel Magic (9th); Freedom of Movement, Guardian of Faith (13th); Commune, Flame Strike (17th).
Level 3: Sacred Weapon — When you take the Attack action, you can expend one use of Channel Divinity to imbue one Melee weapon you are holding with positive energy for 10 minutes: add your Charisma modifier to attack rolls (minimum +1), deal Radiant or normal damage, and emit Bright Light in a 20-foot radius.
Level 7: Aura of Devotion — You and your allies have Immunity to the Charmed condition while in your Aura of Protection.
Level 15: Smite of Protection — Your magical smite radiates protective energy: whenever you cast Divine Smite, you and allies in your Aura of Protection have Half Cover until the start of your next turn.
Level 20: Holy Nimbus — Bonus Action (1/Long Rest or expend a level 5 spell slot) to imbue your Aura of Protection with holy power for 10 minutes: Advantage on saves vs Fiends/Undead, Sunlight in aura, and 10 + CHA mod Radiant damage to enemies starting their turn in the aura.`
  },
  {
    name: 'Ranger',
    category: 'classes',
    subtitle: 'Core Class • d10 Hit Die • Primary: Dexterity & Wisdom • Saves: Strength, Dexterity',
    tags: ['Class', 'Ranger', 'Martial', 'Primal', 'Spellcaster'],
    desc: `Hit Point Die: d10 per Ranger level (10 + CON at 1st level, 6 + CON per level after)
Saving Throw Proficiencies: Strength, Dexterity
Skill Proficiencies: Choose 3: Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival
Weapon Proficiencies: Simple and Martial weapons
Armor Training: Light and Medium armor, Shields

Level 1: Spellcasting (Wisdom; Druidic Focus), Favored Enemy (always have Hunter's Mark prepared, and can cast it 2–6 times per Long Rest without expending a spell slot), Weapon Mastery (2 weapons).
Level 2: Deft Explorer (Expertise in one skill and learn two languages), Fighting Style (choose a Fighting Style feat or Druidic Warrior [2 Druid cantrips]).
Level 3: Ranger Subclass (Hunter).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Extra Attack.
Level 6: Roving (+10 ft Speed while not wearing Heavy armor, and gain Climb Speed and Swim Speed equal to your Speed).
Level 9: Expertise (gain Expertise in two more skills).
Level 10: Tireless (Temporary Hit Points: Magic action to gain 1d8 + WIS mod Temp HP, WIS mod uses/Long Rest; Decrease Exhaustion: Short Rest reduces Exhaustion level by 1).
Level 13: Relentless Hunter (taking damage can't break your Concentration on Hunter's Mark).
Level 14: Nature's Veil (Bonus Action to give yourself the Invisible condition until the end of your next turn; WIS mod uses/Long Rest).
Level 17: Precise Hunter (you have Advantage on attack rolls against the creature currently marked by your Hunter's Mark).
Level 18: Feral Senses (you gain Blindsight with a range of 30 feet).
Level 19: Epic Boon.
Level 20: Foe Slayer (the damage die of your Hunter's Mark is a d10 rather than a d6).`
  },
  {
    name: 'Hunter',
    category: 'classes',
    subtitle: 'Ranger Subclass • Protect Nature and People from Destruction',
    tags: ['Subclass', 'Ranger', 'Hunter'],
    desc: `You stalk prey in the wilds and elsewhere, using your abilities as a Hunter to protect nature and people everywhere.
Level 3: Hunter's Lore — While a creature is marked by your Hunter's Mark, you know whether that creature has any Immunities, Resistances, or Vulnerabilities, and if the creature has any, you know what they are.
Level 3: Hunter's Prey — Choose one option (can swap on Short/Long Rest):
  • Colossus Slayer: Once per turn when you hit a creature with a weapon, deal an extra 1d8 damage if it is missing any of its Hit Points.
  • Horde Breaker: Once on each of your turns when you make a weapon attack, you can make another attack with the same weapon against a different creature within 5 feet of the original target.
Level 7: Defensive Tactics — Choose Escape the Horde (Opportunity Attacks against you have Disadvantage) or Multiattack Defense (when a creature hits you, it has Disadvantage on all other attack rolls against you this turn).
Level 11: Superior Hunter's Prey — Once per turn when you deal Hunter's Mark damage to a target, you can also deal that spell's extra damage to a different creature you can see within 30 feet of the first target.
Level 15: Superior Hunter's Defense — Reaction when you take damage to give yourself Resistance to that damage and any other damage of the same type until the end of the current turn.`
  },
  {
    name: 'Rogue',
    category: 'classes',
    subtitle: 'Core Class • d8 Hit Die • Primary: Dexterity • Saves: Dexterity, Intelligence',
    tags: ['Class', 'Rogue', 'Martial', 'Expert'],
    desc: `Hit Point Die: d8 per Rogue level (8 + CON at 1st level, 5 + CON per level after)
Saving Throw Proficiencies: Dexterity, Intelligence
Skill Proficiencies: Choose 4: Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Persuasion, Sleight of Hand, Stealth
Tool Proficiencies: Thieves' Tools
Weapon Proficiencies: Simple weapons and Martial weapons that have the Finesse or Light property
Armor Training: Light armor

Level 1: Expertise (Thieves' Tools or 2 skills at level 1, 2 more at level 6), Sneak Attack (once per turn, deal +1d6 to +10d6 extra damage on Finesse or Ranged weapon hit with Advantage or adjacent ally), Thieves' Cant (secret language + 1 language), Weapon Mastery (2 weapons).
Level 2: Cunning Action (Bonus Action on each turn to take the Dash, Disengage, or Hide action).
Level 3: Rogue Subclass (Thief), Steady Aim (Bonus Action to give yourself Advantage on your next attack roll on the current turn if you haven't moved; sets Speed to 0).
Level 4: Ability Score Improvement (4, 8, 10, 12, 16).
Level 5: Cunning Strike (forgo Sneak Attack dice to apply tactical effects: Poison [1d6, CON save or Poisoned 1 min], Trip [1d6, DEX save or Prone], Withdraw [1d6, move half Speed without Opportunity Attacks]), Uncanny Dodge (Reaction when an attacker you can see hits you with an attack roll to halve the attack's damage).
Level 7: Evasion (DEX saves for half damage deal 0 on success and half on failure), Reliable Talent (whenever you make an ability check using a skill or tool proficiency, treat a d20 roll of 9 or lower as a 10).
Level 11: Improved Cunning Strike (can use up to two Cunning Strike effects per Sneak Attack).
Level 14: Devious Strikes (adds Daze [2d6, CON save or only move/action/bonus action], Knock Out [6d6, CON save or Unconscious 1 min], Obscure [3d6, DEX save or Blinded 1 turn]).
Level 15: Slippery Mind (gain proficiency in Wisdom and Charisma saving throws).
Level 18: Elusive (no attack roll has Advantage against you unless you are Incapacitated).
Level 19: Epic Boon.
Level 20: Stroke of Luck (if you fail a D20 Test, you can turn the roll into a 20; 1/Short or Long Rest).`
  },
  {
    name: 'Thief',
    category: 'classes',
    subtitle: 'Rogue Subclass • Hunt for Treasure as a Classic Adventurer',
    tags: ['Subclass', 'Rogue', 'Thief'],
    desc: `A mix of burglar, treasure hunter, and explorer, you are the epitome of an adventurer.
Level 3: Fast Hands — As a Bonus Action, you can do one of the following:
  • Sleight of Hand: Make a Dexterity (Sleight of Hand) check to pick a lock or disarm a trap with Thieves' Tools or to pick a pocket.
  • Use an Object: Take the Utilize action, or take the Magic action to use a magic item that requires that action.
Level 3: Second-Story Work — You gain a Climb Speed equal to your Speed, and you can determine your jump distance using your Dexterity rather than your Strength.
Level 9: Supreme Sneak — Gain the Stealth Attack Cunning Strike option (Cost: 1d6; if you have the Invisible condition from Hide, this attack doesn't end the condition if you end your turn behind Three-Quarters or Total Cover).
Level 13: Use Magic Device — You can attune to up to 4 magic items at once; whenever you use a magic item property that expends charges, roll 1d6 and on a 6 it doesn't expend the charges; and you can use any Spell Scroll using Intelligence as your spellcasting ability.
Level 17: Thief's Reflexes — You can take two turns during the first round of any combat (your first turn at your normal Initiative, and your second turn at Initiative minus 10).`
  },
  {
    name: 'Sorcerer',
    category: 'classes',
    subtitle: 'Core Class • d6 Hit Die • Primary: Charisma • Saves: Constitution, Charisma',
    tags: ['Class', 'Sorcerer', 'Spellcaster', 'Arcane'],
    desc: `Hit Point Die: d6 per Sorcerer level (6 + CON at 1st level, 4 + CON per level after)
Saving Throw Proficiencies: Constitution, Charisma
Skill Proficiencies: Choose 2: Arcana, Deception, Insight, Intimidation, Persuasion, Religion
Weapon Proficiencies: Simple weapons
Armor Training: None

Level 1: Spellcasting (Charisma; Arcane Focus), Innate Sorcery (Bonus Action for 1 minute: Sorcerer spell save DC increases by +1, and you have Advantage on attack rolls of Sorcerer spells you cast; 2 uses/Long Rest).
Level 2: Font of Magic (Sorcery Points equal to Sorcerer level; convert Spell Slots to Sorcery Points as a free action or Sorcery Points to Spell Slots as a Bonus Action: Lv1=2, Lv2=3, Lv3=5, Lv4=6, Lv5=7), Metamagic (learn 2 options at level 2, 2 more at level 10, 2 more at level 17):
  • Careful Spell (1 SP: up to CHA mod creatures automatically succeed on save and take no damage from half-damage spell).
  • Distant Spell (1 SP: double range of 5+ ft spell, or make Touch spell 30 ft).
  • Empowered Spell (1 SP: reroll up to CHA mod damage dice; can combine with other Metamagic).
  • Extended Spell (1 SP: double duration of 1+ min spell up to 24 hrs, and gain Advantage on Concentration saves).
  • Heightened Spell (2 SP: one target has Disadvantage on its saves against the spell).
  • Quickened Spell (2 SP: change casting time of 1 action spell to Bonus Action).
  • Seeking Spell (1 SP: reroll a missed spell attack roll; can combine with other Metamagic).
  • Subtle Spell (1 SP: cast a spell without Verbal, Somatic, or non-costly/non-consumed Material components).
  • Transmuted Spell (1 SP: change Acid, Cold, Fire, Lightning, Poison, or Thunder damage to another of those types).
  • Twinned Spell (1 SP: increase a spell's effective level by 1 when it can target an additional creature at higher levels).
Level 3: Sorcerer Subclass (Draconic Sorcery / Draconic Bloodline).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Sorcerous Restoration (regain Sorcery Points equal to half your Sorcerer level on a Short Rest, 1/Long Rest).
Level 7: Sorcery Incarnate (spend 2 SP to use Innate Sorcery when out of uses; while Innate Sorcery is active, you can use up to two Metamagic options on each spell you cast).
Level 19: Epic Boon.
Level 20: Arcane Apotheosis (while Innate Sorcery is active, you can use one Metamagic option on each of your turns without spending Sorcery Points on it).`
  },
  {
    name: 'Draconic Sorcery',
    category: 'classes',
    subtitle: 'Sorcerer Subclass (Draconic Bloodline) • Breathe the Magic of Dragons',
    tags: ['Subclass', 'Sorcerer', 'Draconic Sorcery', 'Draconic Bloodline'],
    desc: `Your innate magic comes from the gift of a dragon.
Level 3: Draconic Resilience — Your Hit Point maximum increases by 3 and by 1 whenever you gain another Sorcerer level. In addition, while you aren't wearing armor, your base AC equals 10 plus your Dexterity and Charisma modifiers.
Level 3: Draconic Spells — Always prepared: Alter Self, Chromatic Orb, Command, Dragon's Breath (3rd); Fear, Fly (5th); Arcane Eye, Charm Monster (7th); Legend Lore, Summon Dragon (9th).
Level 6: Elemental Affinity — Choose Acid, Cold, Fire, Lightning, or Poison. You have Resistance to that damage type, and when you cast a spell that deals damage of that type, you can add your Charisma modifier to one damage roll of that spell.
Level 14: Dragon Wings — Bonus Action to sprout draconic wings on your back, gaining a Fly Speed of 60 feet for 1 hour (1/Long Rest or spend 3 Sorcery Points to restore).
Level 18: Dragon Companion — You can cast Summon Dragon without a Material component, and can cast it once per Long Rest without a spell slot; when you cast it, you can modify it so it doesn't require Concentration for 1 minute.`
  },
  {
    name: 'Warlock',
    category: 'classes',
    subtitle: 'Core Class • d8 Hit Die • Primary: Charisma • Saves: Wisdom, Charisma',
    tags: ['Class', 'Warlock', 'Spellcaster', 'Arcane', 'Pact Magic'],
    desc: `Hit Point Die: d8 per Warlock level (8 + CON at 1st level, 5 + CON per level after)
Saving Throw Proficiencies: Wisdom, Charisma
Skill Proficiencies: Choose 2: Arcana, Deception, History, Intimidation, Investigation, Nature, Religion
Weapon Proficiencies: Simple weapons
Armor Training: Light armor

Level 1: Eldritch Invocations (1 at level 1, scaling up to 10 at level 18):
  • Pact of the Blade (Bonus Action to conjure a bond melee weapon using CHA for attack and damage, dealing Necrotic, Psychic, or Radiant damage).
  • Pact of the Chain (learn Find Familiar, cast without slot; can choose Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite, or Venomous Snake, and command it to attack).
  • Pact of the Tome (conjure Book of Shadows granting 3 cantrips and 2 level 1 Ritual spells from any class list).
  • Agonizing Blast (Level 2+: add CHA modifier to damage rolls of a chosen damaging Warlock cantrip).
  • Armor of Shadows (cast Mage Armor on yourself at will).
  • Devil's Sight (Level 2+: see normally in Dim Light and Darkness—magical and nonmagical—within 120 feet).
  • Eldritch Mind (Advantage on Constitution saving throws to maintain Concentration).
  • Eldritch Smite (Level 5+, Pact of the Blade: expend a Pact Magic slot on weapon hit for +1d8 Force damage per slot level +1d8 and knock Huge or smaller target Prone).
  •Eldritch Spear (Level 2+: increase a damaging Warlock cantrip's range by 30 x Warlock level feet).
  • Fiendish Vigor (Level 2+: cast False Life at will using maximum possible dice rolls).
  • Gaze of Two Minds (Level 5+: Bonus Action to perceive through a willing creature's senses and cast spells from its space).
  • Gift of the Protectors (Level 9+, Pact of the Tome: creatures who write their name in your Book of Shadows drop to 1 HP instead of 0 HP 1/Long Rest).
  • Investment of the Chain Master (Level 5+, Pact of the Chain: familiar gains Fly/Swim 40 ft, Bonus Action attack, Radiant/Necrotic damage, uses your spell save DC, and Reaction to grant Resistance).
  • Lessons of the First Ones (Level 2+: gain an Origin feat of your choice).
  • Lifedrinker (Level 9+, Pact of the Blade: once per turn on Pact weapon hit, deal +1d6 Necrotic/Psychic/Radiant damage and can expend a Hit Point Die to heal).
  • Mask of Many Faces (Level 2+: cast Disguise Self at will).
  • Master of Myriad Forms (Level 5+: cast Alter Self at will).
  • Misty Visions (Level 2+: cast Silent Image at will).
  • One with Shadows (Level 5+: cast Invisibility on yourself at will while in Dim Light or Darkness).
  • Otherworldly Leap (Level 2+: cast Jump on yourself at will).
  • Repelling Blast (Level 2+: push Large or smaller creature up to 10 feet straight away on chosen cantrip hit).
  • Thirsting Blade (Level 5+, Pact of the Blade: attack twice with your pact weapon; Devouring Blade at Level 12+: attack three times).
  • Visions of Distant Realms (Level 9+: cast Arcane Eye at will).
  • Whispers of the Grave (Level 7+: cast Speak with Dead at will).
  • Witch Sight (Level 15+: gain Truesight with a range of 30 feet).
Level 1: Pact Magic (1–4 spell slots of levels 1–5 that recover on a Short or Long Rest; Charisma spellcasting ability).
Level 2: Magical Cunning (perform a 1-minute esoteric rite to regain expended Pact Magic spell slots up to half your maximum rounded up, 1/Long Rest).
Level 3: Warlock Subclass (Fiend Patron / The Fiend).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 9: Contact Patron (always have Contact Other Plane prepared; cast 1/Long Rest without slot and automatically succeed on save).
Level 11: Mystic Arcanum (gain a level 6 spell at 11th, level 7 at 13th, level 8 at 15th, and level 9 at 17th, each castable 1/Long Rest without a slot).
Level 19: Epic Boon.
Level 20: Eldritch Master (when you use Magical Cunning, you regain all your expended Pact Magic spell slots).`
  },
  {
    name: 'Fiend Patron',
    category: 'classes',
    subtitle: 'Warlock Subclass (The Fiend) • Make a Deal with the Lower Planes',
    tags: ['Subclass', 'Warlock', 'Fiend Patron', 'The Fiend'],
    desc: `Your pact draws on the Lower Planes, the realms of perdition.
Level 3: Dark One's Blessing — When you reduce an enemy to 0 Hit Points, or when an enemy within 10 feet of you is reduced to 0 Hit Points, you gain Temporary Hit Points equal to your Charisma modifier plus your Warlock level (minimum 1).
Level 3: Fiend Spells — Always prepared: Burning Hands, Command, Scorching Ray, Suggestion (3rd); Fireball, Stinking Cloud (5th); Fire Shield, Wall of Fire (7th); Geas, Insect Plague (9th).
Level 6: Dark One's Own Luck — When you make an ability check or a saving throw, you can add 1d10 to the roll after seeing the roll (CHA mod uses per Long Rest).
Level 10: Fiendish Resilience — Choose one damage type other than Force whenever you finish a Short or Long Rest; you have Resistance to that damage type until you choose a different one.
Level 14: Hurl Through Hell — Once per turn when you hit a creature with an attack roll, force it to make a Charisma saving throw: on a failed save, it disappears through the Lower Planes until the end of your next turn and takes 8d10 Psychic damage (1/Long Rest or expend a Pact Magic slot to restore).`
  },
  {
    name: 'Wizard',
    category: 'classes',
    subtitle: 'Core Class • d6 Hit Die • Primary: Intelligence • Saves: Intelligence, Wisdom',
    tags: ['Class', 'Wizard', 'Spellcaster', 'Arcane'],
    desc: `Hit Point Die: d6 per Wizard level (6 + CON at 1st level, 4 + CON per level after)
Saving Throw Proficiencies: Intelligence, Wisdom
Skill Proficiencies: Choose 2: Arcana, History, Insight, Investigation, Medicine, Nature, Religion
Weapon Proficiencies: Simple weapons
Armor Training: None

Level 1: Spellcasting (Intelligence; Arcane Focus or Spellbook; can cast any spell in Spellbook with the Ritual tag as a Ritual even if not prepared), Ritual Adept, Arcane Recovery (on a Short Rest 1/Long Rest, recover expended spell slots totaling up to half your Wizard level rounded up, none level 6+).
Level 2: Scholar (gain Expertise in one of your proficient skills: Arcana, History, Investigation, Medicine, Nature, or Religion).
Level 3: Wizard Subclass (Evoker / School of Evocation).
Level 4: Ability Score Improvement (4, 8, 12, 16).
Level 5: Memorize Spell (whenever you finish a Short Rest, you can study your spellbook and replace one prepared Wizard spell with another spell from your spellbook).
Level 18: Spell Mastery (choose one level 1 and one level 2 Wizard spell with a casting time of an action; you always have them prepared and can cast them at their lowest level at will without expending a spell slot).
Level 19: Epic Boon.
Level 20: Signature Spells (choose two level 3 Wizard spells in your spellbook; you always have them prepared and can cast each once at level 3 without expending a spell slot per Short or Long Rest).`
  },
  {
    name: 'Evoker',
    category: 'classes',
    subtitle: 'Wizard Subclass (School of Evocation) • Create Explosive Elemental Effects',
    tags: ['Subclass', 'Wizard', 'Evoker', 'School of Evocation'],
    desc: `Your studies focus on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid.
Level 3: Evocation Savant — Choose two Wizard Evocation spells (level 1–2) to add to your spellbook for free, and add one more free Evocation spell whenever you gain access to a new level of spell slots.
Level 3: Potent Cantrip — Your damaging cantrips affect even creatures that avoid the brunt of the effect: when you cast a cantrip at a creature and miss with the attack roll or the target succeeds on a saving throw against the cantrip, the target takes half the cantrip's damage (if any) but suffers no additional effect.
Level 6: Sculpt Spells — When you cast an Evocation spell that affects other creatures you can see, you can choose a number of them equal to 1 plus the spell's level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.
Level 10: Empowered Evocation — Whenever you cast a Wizard Evocation spell, you can add your Intelligence modifier to one damage roll of that spell.
Level 14: Overchannel — When you cast a Wizard spell of levels 1–5 that deals damage, you can deal maximum damage with that spell on the turn you cast it (first use per Long Rest has no drawback; subsequent uses deal 2d12 Necrotic damage per spell level to you, increasing by 1d12 each time).`
  }
];

export const SRD_SPECIES_AND_RACES: SrdClassOrRaceRaw[] = [
  {
    name: 'Dragonborn',
    category: 'races',
    subtitle: 'Humanoid Species • Medium • Speed 30 ft • Draconic Ancestry & Breath Weapon',
    tags: ['Species', 'Race', 'Dragonborn', 'Draconic'],
    desc: `Creature Type: Humanoid | Size: Medium (about 5–7 feet tall) | Speed: 30 feet
• Draconic Ancestry: Choose a dragon lineage: Black (Acid), Blue (Lightning), Brass (Fire), Bronze (Lightning), Copper (Acid), Gold (Fire), Green (Poison), Red (Fire), Silver (Cold), or White (Cold).
• Breath Weapon: When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide. Each creature in that area must make a Dexterity saving throw (DC 8 + CON modifier + Proficiency Bonus), taking 1d10 damage of your Draconic Ancestry type on a failed save or half as much on a successful one (increases to 2d10 at level 5, 3d10 at level 11, and 4d10 at level 17; Proficiency Bonus uses per Long Rest).
• Damage Resistance: You have Resistance to the damage type determined by your Draconic Ancestry.
• Darkvision: You have Darkvision with a range of 60 feet.
• Draconic Flight: When you reach character level 5, you can channel draconic magic to give yourself temporary flight. As a Bonus Action, you sprout spectral wings on your back that last for 10 minutes, granting a Fly Speed equal to your Speed (1/Long Rest).`
  },
  {
    name: 'Dwarf',
    category: 'races',
    subtitle: 'Humanoid Species • Medium • Speed 30 ft (25 ft in 5.1) • Darkvision 120 ft & Dwarven Toughness',
    tags: ['Species', 'Race', 'Dwarf', 'Hill Dwarf', 'Mountain Dwarf'],
    desc: `Creature Type: Humanoid | Size: Medium (about 4–5 feet tall) | Speed: 30 feet (25 ft in 5.1, not reduced by Heavy armor)
• Darkvision: You have Darkvision with a range of 120 feet.
• Dwarven Resilience: You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.
• Dwarven Toughness: Your Hit Point maximum increases by 1, and it increases by 1 every time you gain a level.
• Stonecunning: As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes while you are on a stone surface or touching a stone surface (Proficiency Bonus uses per Long Rest; in 5.1: double proficiency bonus on History checks related to stonework).
• 5.1 Subraces: Hill Dwarf (+1 WIS, Dwarven Toughness +1 HP/level) and Mountain Dwarf (+2 STR, Dwarven Armor Training with Light and Medium armor).`
  },
  {
    name: 'Hill Dwarf',
    category: 'races',
    subtitle: 'Dwarf Subrace • Keen Senses, Deep Intuition, and Remarkable Resilience',
    tags: ['Race', 'Subrace', 'Dwarf', 'Hill Dwarf'],
    desc: `As a Hill Dwarf, you have keen senses, deep intuition, and remarkable resilience.
• Ability Score Increase (5.1): Your Constitution score increases by 2, and your Wisdom score increases by 1.
• Dwarven Toughness: Your Hit Point maximum increases by 1, and it increases by 1 every time you gain a level.
• Base Dwarf Traits: Darkvision, Dwarven Resilience (Advantage vs Poison, Resistance to Poison damage), Dwarven Combat Training, Stonecunning.`
  },
  {
    name: 'Mountain Dwarf',
    category: 'races',
    subtitle: 'Dwarf Subrace • Strong and Hardy, Accustomed to Rugged Terrain',
    tags: ['Race', 'Subrace', 'Dwarf', 'Mountain Dwarf'],
    desc: `As a Mountain Dwarf, you're strong and hardy, accustomed to a difficult life in rugged terrain.
• Ability Score Increase (5.1): Your Constitution score increases by 2, and your Strength score increases by 2.
• Dwarven Armor Training: You have proficiency with light and medium armor.
• Base Dwarf Traits: Darkvision, Dwarven Resilience (Advantage vs Poison, Resistance to Poison damage), Dwarven Combat Training, Stonecunning.`
  },
  {
    name: 'Elf',
    category: 'races',
    subtitle: 'Humanoid Species • Medium • Speed 30 ft • Drow, High Elf, and Wood Elf Lineages',
    tags: ['Species', 'Race', 'Elf', 'High Elf', 'Wood Elf', 'Drow'],
    desc: `Creature Type: Humanoid | Size: Medium (about 5–6 feet tall) | Speed: 30 feet
• Darkvision: You have Darkvision with a range of 60 feet (120 feet for Drow).
• Elven Lineage: Choose a lineage:
  - Drow: Darkvision 120 ft; Dancing Lights cantrip (Lv 1), Faerie Fire (Lv 3), Darkness (Lv 5).
  - High Elf: Prestidigitation cantrip (swappable with any Wizard cantrip on Long Rest; Lv 1), Detect Magic (Lv 3), Misty Step (Lv 5).
  - Wood Elf: Speed increases to 35 feet; Druidcraft cantrip (Lv 1), Longstrider (Lv 3), Pass without Trace (Lv 5).
• Fey Ancestry: You have Advantage on saving throws you make to avoid or end the Charmed condition, and magic can't put you to sleep.
• Keen Senses: You have proficiency in the Insight, Perception, or Survival skill.
• Trance: You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.`
  },
  {
    name: 'High Elf',
    category: 'races',
    subtitle: 'Elven Lineage / Subrace • Arcane Mastery and Fey Grace',
    tags: ['Species', 'Race', 'Subrace', 'Elf', 'High Elf'],
    desc: `High Elves are infused with the magic of crossings between the Feywild and Material Plane.
• High Elf Lineage: You know the Prestidigitation cantrip (can replace it with any Wizard cantrip after a Long Rest). At level 3 you always have Detect Magic prepared, and at level 5 you always have Misty Step prepared (each castable 1/Long Rest without a slot).
• Base Elf Traits: Darkvision 60 ft, Fey Ancestry, Keen Senses, Trance (4-hour Long Rest).`
  },
  {
    name: 'Wood Elf',
    category: 'races',
    subtitle: 'Elven Lineage / Subrace • Fleet of Foot and Stealthy in Primeval Forests',
    tags: ['Species', 'Race', 'Subrace', 'Elf', 'Wood Elf'],
    desc: `Wood Elves carry the swiftness and camouflage of primeval forests.
• Wood Elf Lineage: Your Speed increases to 35 feet. You know the Druidcraft cantrip. At level 3 you always have Longstrider prepared, and at level 5 you always have Pass without Trace prepared (each castable 1/Long Rest without a slot).
• Base Elf Traits: Darkvision 60 ft, Fey Ancestry, Keen Senses, Trance (4-hour Long Rest).`
  },
  {
    name: 'Drow',
    category: 'races',
    subtitle: 'Elven Lineage / Dark Elf • Superior Darkvision 120 ft & Shadow Magic',
    tags: ['Species', 'Race', 'Subrace', 'Elf', 'Drow', 'Dark Elf'],
    desc: `Drow carry the magic of the Underdark and twilight realms.
• Drow Lineage: Your Darkvision has a range of 120 feet. You know the Dancing Lights cantrip. At level 3 you always have Faerie Fire prepared, and at level 5 you always have Darkness prepared (each castable 1/Long Rest without a slot).
• Base Elf Traits: Fey Ancestry, Keen Senses, Trance (4-hour Long Rest).`
  },
  {
    name: 'Gnome',
    category: 'races',
    subtitle: 'Humanoid Species • Small • Speed 30 ft (25 ft in 5.1) • Gnome Cunning & Lineages',
    tags: ['Species', 'Race', 'Gnome', 'Forest Gnome', 'Rock Gnome'],
    desc: `Creature Type: Humanoid | Size: Small (about 3–4 feet tall) | Speed: 30 feet (25 ft in 5.1)
• Darkvision: You have Darkvision with a range of 60 feet.
• Gnome Cunning: You have Advantage on Intelligence, Wisdom, and Charisma saving throws.
• Gnomish Lineage: Choose a lineage:
  - Forest Gnome: You know the Minor Illusion cantrip, and you always have the Speak with Animals spell prepared (can cast it without a spell slot Proficiency Bonus times per Long Rest).
  - Rock Gnome: You know the Mending and Prestidigitation cantrips, and can spend 10 minutes casting Prestidigitation to create Tiny clockwork devices (Tinker).`
  },
  {
    name: 'Forest Gnome',
    category: 'races',
    subtitle: 'Gnomish Lineage / Subrace • Natural Illusionists and Animal Speakers',
    tags: ['Species', 'Race', 'Subrace', 'Gnome', 'Forest Gnome'],
    desc: `Forest Gnomes have a natural knack for illusion and a close bond with small woodland beasts.
• Forest Gnome Lineage: You know the Minor Illusion cantrip, and always have Speak with Animals prepared.
• Base Gnome Traits: Small size, Darkvision 60 ft, Gnome Cunning (Advantage on INT, WIS, CHA saves).`
  },
  {
    name: 'Rock Gnome',
    category: 'races',
    subtitle: 'Gnomish Lineage / Subrace • Inventive Tinkers and Artificers',
    tags: ['Species', 'Race', 'Subrace', 'Gnome', 'Rock Gnome'],
    desc: `Rock Gnomes are famous for their curiosity, inventiveness, and clockwork contraptions.
• Rock Gnome Lineage: You know the Mending and Prestidigitation cantrips and can create Tiny clockwork devices (Clockwork Toy, Fire Starter, Music Box).
• Base Gnome Traits: Small size, Darkvision 60 ft, Gnome Cunning (Advantage on INT, WIS, CHA saves).`
  },
  {
    name: 'Goliath',
    category: 'races',
    subtitle: 'Humanoid Species • Medium (7–8 ft) • Speed 35 ft • Giant Ancestry & Large Form',
    tags: ['Species', 'Race', 'Goliath', 'Giant'],
    desc: `Creature Type: Humanoid | Size: Medium (about 7–8 feet tall) | Speed: 35 feet
• Giant Ancestry: Choose one supernatural boon from your ancestors (Proficiency Bonus uses per Long Rest):
  - Cloud's Jaunt (Cloud Giant): Bonus Action to magically teleport up to 30 feet to an unoccupied space you can see.
  - Fire's Burn (Fire Giant): Deal an extra 1d10 Fire damage on a hit.
  - Frost's Chill (Frost Giant): Deal an extra 1d6 Cold damage on a hit and reduce target's Speed by 10 feet.
  - Hill's Tumble (Hill Giant): Knock a Large or smaller creature Prone when you hit it with an attack roll.
  - Stone's Endurance (Stone Giant): Reaction when taking damage to reduce the damage by 1d12 + CON modifier.
  - Storm's Thunder (Storm Giant): Reaction when damaged by a creature within 60 feet to deal 1d8 Thunder damage to it.
• Large Form: Starting at character level 5, you can change your size to Large as a Bonus Action for 10 minutes (Advantage on Strength checks and +10 ft Speed, 1/Long Rest).
• Powerful Build: You have Advantage on any ability check you make to end the Grappled condition, and you count as one size larger when determining your carrying capacity.`
  },
  {
    name: 'Halfling',
    category: 'races',
    subtitle: 'Humanoid Species • Small • Speed 30 ft (25 ft in 5.1) • Luck, Brave & Nimbleness',
    tags: ['Species', 'Race', 'Halfling', 'Lightfoot Halfling', 'Stout Halfling'],
    desc: `Creature Type: Humanoid | Size: Small (about 2–3 feet tall) | Speed: 30 feet (25 ft in 5.1)
• Brave: You have Advantage on saving throws you make to avoid or end the Frightened condition.
• Halfling Nimbleness: You can move through the space of any creature that is of a size larger than yours, but you can't stop in the same space.
• Luck: When you roll a 1 on the d20 of a D20 Test (attack roll, ability check, or saving throw), you can reroll the die, and you must use the new roll.
• Naturally Stealthy: You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.
• 5.1 Subraces: Lightfoot Halfling (+1 CHA, Naturally Stealthy) and Stout Halfling (+1 CON, Stout Resilience: Advantage on saves vs Poison and Resistance to Poison damage).`
  },
  {
    name: 'Lightfoot Halfling',
    category: 'races',
    subtitle: 'Halfling Subrace • Naturally Stealthy and Affable',
    tags: ['Race', 'Subrace', 'Halfling', 'Lightfoot Halfling'],
    desc: `As a Lightfoot Halfling, you can easily hide from notice, even using other people as cover.
• Naturally Stealthy: You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.
• Base Halfling Traits: Small size, Lucky (reroll 1s on d20), Brave (Advantage vs Frightened), Halfling Nimbleness.`
  },
  {
    name: 'Human',
    category: 'races',
    subtitle: 'Humanoid Species • Medium or Small • Speed 30 ft • Resourceful, Skillful & Versatile',
    tags: ['Species', 'Race', 'Human'],
    desc: `Creature Type: Humanoid | Size: Medium (4–7 feet tall) or Small (2–4 feet tall) | Speed: 30 feet
• Resourceful: You gain Heroic Inspiration whenever you finish a Long Rest.
• Skillful: You gain proficiency in one skill of your choice.
• Versatile: You gain an Origin feat of your choice (or in 5.1: +1 to all six ability scores).`
  },
  {
    name: 'Orc',
    category: 'races',
    subtitle: 'Humanoid Species • Medium • Speed 30 ft • Adrenaline Rush & Relentless Endurance',
    tags: ['Species', 'Race', 'Orc', 'Half-Orc'],
    desc: `Creature Type: Humanoid | Size: Medium (about 6–7 feet tall) | Speed: 30 feet
• Adrenaline Rush: You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus (Proficiency Bonus uses per Short or Long Rest).
• Darkvision: You have Darkvision with a range of 120 feet.
• Relentless Endurance: When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead (1/Long Rest).`
  },
  {
    name: 'Half-Elf',
    category: 'races',
    subtitle: 'Humanoid Race (5.1 SRD) • Medium • Speed 30 ft • Fey Ancestry & Skill Versatility',
    tags: ['Race', 'Half-Elf'],
    desc: `Creature Type: Humanoid | Size: Medium (5–6 feet tall) | Speed: 30 feet
• Ability Score Increase: Your Charisma score increases by 2, and two other ability scores of your choice increase by 1.
• Darkvision: You have Darkvision with a range of 60 feet.
• Fey Ancestry: You have Advantage on saving throws against being Charmed, and magic can't put you to sleep.
• Skill Versatility: You gain proficiency in two skills of your choice.
• Languages: Common, Elvish, and one extra language of your choice.`
  },
  {
    name: 'Half-Orc',
    category: 'races',
    subtitle: 'Humanoid Race (5.1 SRD) • Medium • Speed 30 ft • Relentless Endurance & Savage Attacks',
    tags: ['Race', 'Half-Orc', 'Orc'],
    desc: `Creature Type: Humanoid | Size: Medium (5–7 feet tall) | Speed: 30 feet
• Ability Score Increase: Your Strength score increases by 2, and your Constitution score increases by 1.
• Darkvision: You have Darkvision with a range of 60 feet.
• Menacing: You gain proficiency in the Intimidation skill.
• Relentless Endurance: When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead (1/Long Rest).
• Savage Attacks: When you score a Critical Hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the critical hit.`
  },
  {
    name: 'Tiefling',
    category: 'races',
    subtitle: 'Humanoid Species • Medium or Small • Speed 30 ft • Fiendish Legacy & Otherworldly Presence',
    tags: ['Species', 'Race', 'Tiefling', 'Fiendish'],
    desc: `Creature Type: Humanoid | Size: Medium (4–7 feet tall) or Small (3–4 feet tall) | Speed: 30 feet
• Darkvision: You have Darkvision with a range of 60 feet.
• Fiendish Legacy: Choose a legacy connecting you to the Lower Planes:
  - Abyssal: Resistance to Poison damage; Poison Spray cantrip (Lv 1), Ray of Sickness (Lv 3), Hold Person (Lv 5).
  - Chthonic: Resistance to Necrotic damage; Chill Touch cantrip (Lv 1), False Life (Lv 3), Ray of Enfeeblement (Lv 5).
  - Infernal: Resistance to Fire damage; Fire Bolt cantrip (Lv 1), Hellish Rebuke (Lv 3), Darkness (Lv 5).
• Otherworldly Presence: You know the Thaumaturgy cantrip.`
  }
];

export const SRD_BACKGROUNDS_AND_FEATS: SrdClassOrRaceRaw[] = [
  {
    name: 'Acolyte',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: INT, WIS, CHA • Feat: Magic Initiate (Cleric)',
    tags: ['Background', 'Acolyte', 'Origin'],
    desc: `Ability Scores: Intelligence, Wisdom, Charisma
Feat: Magic Initiate (Cleric)
Skill Proficiencies: Insight and Religion
Tool Proficiency: Calligrapher's Supplies
Equipment: Calligrapher's Supplies, Book (prayers), Holy Symbol, Parchment (10 sheets), Robe, 8 GP (5.1 Feature: Shelter of the Faithful).`
  },
  {
    name: 'Criminal',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: DEX, CON, INT • Feat: Alert',
    tags: ['Background', 'Criminal', 'Origin'],
    desc: `Ability Scores: Dexterity, Constitution, Intelligence
Feat: Alert
Skill Proficiencies: Sleight of Hand and Stealth
Tool Proficiency: Thieves' Tools
Equipment: 2 Daggers, Thieves' Tools, Crowbar, 2 Pouches, Traveler's Clothes, 16 GP.`
  },
  {
    name: 'Sage',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: CON, INT, WIS • Feat: Magic Initiate (Wizard)',
    tags: ['Background', 'Sage', 'Origin'],
    desc: `Ability Scores: Constitution, Intelligence, Wisdom
Feat: Magic Initiate (Wizard)
Skill Proficiencies: Arcana and History
Tool Proficiency: Calligrapher's Supplies
Equipment: Quarterstaff, Calligrapher's Supplies, Book (history), Parchment (8 sheets), Robe, 8 GP.`
  },
  {
    name: 'Soldier',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, DEX, CON • Feat: Savage Attacker',
    tags: ['Background', 'Soldier', 'Origin'],
    desc: `Ability Scores: Strength, Dexterity, Constitution
Feat: Savage Attacker
Skill Proficiencies: Athletics and Intimidation
Tool Proficiency: Choose one kind of Gaming Set
Equipment: Spear, Shortbow, 20 Arrows, Gaming Set, Healer's Kit, Quiver, Traveler's Clothes, 14 GP.`
  },
  {
    name: 'Customizing a Background',
    category: 'backgrounds',
    subtitle: 'Character Creation Rule • Choose 3 Ability Scores, 1 Origin Feat, 2 Skills, 1 Tool & 50 GP Equipment',
    tags: ['Background', 'Origin', 'Character Creation'],
    desc: `Parts of a Background (SRD 5.2.1):
• Ability Scores: A background lists three of your character's ability scores. Increase one by 2 and another one by 1, or increase all three by 1 (maximum 20).
• Feat: A background gives your character a specified Origin feat.
• Skill Proficiencies: A background gives your character proficiency in two specified skills.
• Tool Proficiency: Each background gives a character proficiency with one tool—either a specific tool or one chosen from the Artisan's Tools category.
• Equipment: Each background offers a choice between a package of equipment and 50 GP.`
  },
  {
    name: 'Charlatan',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: DEX, CON, CHA • Feat: Skilled',
    tags: ['Background', 'Charlatan', 'Origin'],
    desc: `Ability Scores: Dexterity, Constitution, Charisma | Feat: Skilled | Skill Proficiencies: Deception and Sleight of Hand | Tool Proficiency: Forgery Kit | Equipment: Forgery Kit, Costume, Fine Clothes, 15 GP.`
  },
  {
    name: 'Entertainer',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, DEX, CHA • Feat: Musician',
    tags: ['Background', 'Entertainer', 'Origin'],
    desc: `Ability Scores: Strength, Dexterity, Charisma | Feat: Musician | Skill Proficiencies: Acrobatics and Performance | Tool Proficiency: Musical Instrument | Equipment: Musical Instrument, 2 Costumes, Mirror, Perfume, Traveler's Clothes, 11 GP.`
  },
  {
    name: 'Folk Hero',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, CON, WIS • Feat: Tough',
    tags: ['Background', 'Folk Hero', 'Origin'],
    desc: `Ability Scores: Strength, Constitution, Wisdom | Feat: Tough | Skill Proficiencies: Animal Handling and Survival | Tool Proficiency: Artisan's Tools | Equipment: Artisan's Tools, Shovel, Iron Pot, Traveler's Clothes, 10 GP.`
  },
  {
    name: 'Guild Artisan',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, DEX, INT • Feat: Crafter',
    tags: ['Background', 'Guild Artisan', 'Origin'],
    desc: `Ability Scores: Strength, Dexterity, Intelligence | Feat: Crafter | Skill Proficiencies: Insight and Persuasion | Tool Proficiency: Artisan's Tools | Equipment: Artisan's Tools, 2 Pouches, Traveler's Clothes, 32 GP.`
  },
  {
    name: 'Hermit',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: CON, WIS, CHA • Feat: Healer',
    tags: ['Background', 'Hermit', 'Origin'],
    desc: `Ability Scores: Constitution, Wisdom, Charisma | Feat: Healer | Skill Proficiencies: Medicine and Religion | Tool Proficiency: Herbalism Kit | Equipment: Quarterstaff, Herbalism Kit, Bedroll, Book, Lamp, 3 Oil flasks, Traveler's Clothes, 16 GP.`
  },
  {
    name: 'Noble',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, INT, CHA • Feat: Skilled',
    tags: ['Background', 'Noble', 'Origin'],
    desc: `Ability Scores: Strength, Intelligence, Charisma | Feat: Skilled | Skill Proficiencies: History and Persuasion | Tool Proficiency: Gaming Set | Equipment: Gaming Set, Fine Clothes, Perfume, Signet Ring, 29 GP.`
  },
  {
    name: 'Outlander',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, DEX, WIS • Feat: Tough',
    tags: ['Background', 'Outlander', 'Origin'],
    desc: `Ability Scores: Strength, Dexterity, Wisdom | Feat: Tough | Skill Proficiencies: Athletics and Survival | Tool Proficiency: Musical Instrument | Equipment: Staff, Hunting Trap, Trophy, Traveler's Clothes, 10 GP.`
  },
  {
    name: 'Sailor',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: STR, DEX, WIS • Feat: Tavern Brawler',
    tags: ['Background', 'Sailor', 'Origin'],
    desc: `Ability Scores: Strength, Dexterity, Wisdom | Feat: Tavern Brawler | Skill Proficiencies: Acrobatics and Perception | Tool Proficiency: Navigator's Tools | Equipment: Dagger, Navigator's Tools, Rope, Traveler's Clothes, 20 GP.`
  },
  {
    name: 'Urchin',
    category: 'backgrounds',
    subtitle: 'Character Background • Ability Scores: DEX, WIS, CHA • Feat: Lucky',
    tags: ['Background', 'Urchin', 'Origin'],
    desc: `Ability Scores: Dexterity, Wisdom, Charisma | Feat: Lucky | Skill Proficiencies: Sleight of Hand and Stealth | Tool Proficiency: Disguise Kit and Thieves' Tools | Equipment: 2 Daggers, Thieves' Tools, Pouch, Traveler's Clothes, 10 GP.`
  },
  {
    name: 'Ability Score Improvement',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, Repeatable) • Increase One Ability Score by 2 or Two by 1',
    tags: ['Feat', 'General Feat', 'Ability Score Improvement', 'ASI'],
    desc: `General Feat (Prerequisite: Level 4+, Repeatable)
Increase one ability score of your choice by 2, or increase two ability scores of your choice by 1. This feat can't increase an ability score above 20.`
  },
  {
    name: 'Alert',
    category: 'feats',
    subtitle: 'Origin Feat • Initiative Proficiency & Initiative Swap',
    tags: ['Feat', 'Origin Feat', 'Alert'],
    desc: `Origin Feat
• Initiative Proficiency: When you roll Initiative, you can add your Proficiency Bonus to the roll.
• Initiative Swap: Immediately after you roll Initiative, you can swap your Initiative with the Initiative of one willing ally in the same combat (can't make this swap if you or the ally has the Incapacitated condition).
(In 5.1: +5 bonus to Initiative, can't be surprised while conscious, and unseen attackers don't gain Advantage against you).`
  },
  {
    name: 'Grappler',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, STR or DEX 13+) • Punch and Grab, Attack Advantage & Fast Wrestler',
    tags: ['Feat', 'General Feat', 'Grappler'],
    desc: `General Feat (Prerequisite: Level 4+, Strength or Dexterity 13+)
• Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.
• Punch and Grab: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can use both the Damage and the Grapple option. You can use this benefit only once per turn.
• Attack Advantage: You have Advantage on attack rolls against a creature Grappled by you.
• Fast Wrestler: You don't have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller.`
  },
  {
    name: 'Magic Initiate',
    category: 'feats',
    subtitle: 'Origin Feat • Two Cantrips & One Level 1 Spell (Cleric, Druid, or Wizard)',
    tags: ['Feat', 'Origin Feat', 'Magic Initiate', 'Spellcasting'],
    desc: `Origin Feat (Repeatable across different spell lists: Cleric, Druid, or Wizard)
• Two Cantrips: You learn two cantrips of your choice from the chosen spell list (Intelligence, Wisdom, or Charisma is your spellcasting ability).
• Level 1 Spell: Choose a level 1 spell from the same list. You always have that spell prepared. You can cast it once without a spell slot per Long Rest, and can also cast it using any spell slots you have.
• Spell Change: Whenever you gain a new level, you can replace one of the spells you chose for this feat with a different spell of the same level from the chosen list.`
  },
  {
    name: 'Savage Attacker',
    category: 'feats',
    subtitle: 'Origin Feat • Roll Weapon Damage Dice Twice Once Per Turn',
    tags: ['Feat', 'Origin Feat', 'Savage Attacker'],
    desc: `Origin Feat
You've trained to deal particularly damaging strikes. Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target.`
  },
  {
    name: 'Skilled',
    category: 'feats',
    subtitle: 'Origin Feat (Repeatable) • Gain Proficiency in Three Skills or Tools',
    tags: ['Feat', 'Origin Feat', 'Skilled'],
    desc: `Origin Feat (Repeatable)
You gain proficiency in any combination of three skills or tools of your choice.`
  },
  {
    name: 'Crafter',
    category: 'feats',
    subtitle: 'Origin Feat • Tool Proficiency (3 Artisan\'s Tools), 20% Discount & Fast Crafting',
    tags: ['Feat', 'Origin Feat', 'Crafter'],
    desc: `Origin Feat
• Tool Proficiency: Gain proficiency with three different Artisan's Tools of your choice.
• Discount: Whenever you buy a nonmagical item, you receive a 20 percent discount on it.
• Fast Crafting: When you finish a Long Rest, you can craft one piece of gear given your tools, lasting until you finish another Long Rest.`
  },
  {
    name: 'Musician',
    category: 'feats',
    subtitle: 'Origin Feat • 3 Musical Instrument Proficiencies & Encouraging Song (Heroic Inspiration)',
    tags: ['Feat', 'Origin Feat', 'Musician'],
    desc: `Origin Feat
• Instrument Training: Gain proficiency with three Musical Instruments of your choice.
• Encouraging Song: As you finish a Short or Long Rest, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to allies who hear the song (up to your Proficiency Bonus).`
  },
  {
    name: 'Tavern Brawler',
    category: 'feats',
    subtitle: 'Origin Feat • Enhanced Unarmed Strike (1d4 + STR), Damage Rerolls, Improvised Weaponry & Push',
    tags: ['Feat', 'Origin Feat', 'Tavern Brawler'],
    desc: `Origin Feat
• Enhanced Unarmed Strike: When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d4 plus your Strength modifier instead of the normal damage.
• Damage Rerolls: Whenever you roll a damage die for your Unarmed Strike, you can reroll the die if it rolls a 1, and you must use the new roll.
• Improvised Weaponry: You have proficiency with improvised weapons.
• Push: When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also push it 5 feet away from you (once per turn).`
  },
  {
    name: 'Tough',
    category: 'feats',
    subtitle: 'Origin Feat • +2 Hit Point Maximum Per Character Level',
    tags: ['Feat', 'Origin Feat', 'Tough'],
    desc: `Origin Feat
Your Hit Point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a character level thereafter, your Hit Point maximum increases by an additional 2 Hit Points.`
  },
  {
    name: 'Healer',
    category: 'feats',
    subtitle: 'Origin Feat • Battle Medic with Healer\'s Kit & Healing Rerolls',
    tags: ['Feat', 'Origin Feat', 'Healer'],
    desc: `Origin Feat
• Battle Medic: If you have a Healer's Kit, you can expend one use of it and tend to a creature within 5 feet of yourself as a Utilize action. That creature can expend one of its Hit Point Dice, and you roll that die. The creature regains a number of Hit Points equal to the roll plus your Proficiency Bonus.
• Healing Rerolls: Whenever you roll a die to determine the number of Hit Points you restore with a spell or with this feat's Battle Medic benefit, you can reroll the die if it rolls a 1, and you must use the new roll.`
  },
  {
    name: 'Lucky',
    category: 'feats',
    subtitle: 'Origin Feat • Luck Points to Gain Advantage or Impose Disadvantage',
    tags: ['Feat', 'Origin Feat', 'Lucky'],
    desc: `Origin Feat
• Luck Points: You have a number of Luck Points equal to your Proficiency Bonus and regain expended Luck Points when you finish a Long Rest.
• Advantage: Whenever you roll a d20 for a D20 Test, you can spend 1 Luck Point to give yourself Advantage on the roll.
• Disadvantage: When a creature rolls a d20 for an attack roll against you, you can spend 1 Luck Point to impose Disadvantage on that roll.`
  },
  {
    name: 'Great Weapon Master',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, STR 13+) • Heavy Weapon Mastery & Hew',
    tags: ['Feat', 'General Feat', 'Great Weapon Master'],
    desc: `General Feat (Prerequisite: Level 4+, Strength 13+)
• Ability Score Increase: Increase your Strength score by 1, to a maximum of 20.
• Heavy Weapon Mastery: When you hit a creature with a weapon that has the Heavy property as part of the Attack action on your turn, you can cause the weapon to deal extra damage to the target equal to your Proficiency Bonus.
• Hew: Immediately after you score a Critical Hit with a Melee weapon or reduce a creature to 0 Hit Points with one, you can make one attack with the same weapon as a Bonus Action.`
  },
  {
    name: 'Sharpshooter',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, DEX 13+) • Bypass Cover, Firing in Melee & Long Shots',
    tags: ['Feat', 'General Feat', 'Sharpshooter'],
    desc: `General Feat (Prerequisite: Level 4+, Dexterity 13+)
• Ability Score Increase: Increase your Dexterity score by 1, to a maximum of 20.
• Bypass Cover: Your ranged attacks with weapons ignore Half Cover and Three-Quarters Cover.
• Firing in Melee: Being within 5 feet of an enemy doesn't impose Disadvantage on your attack rolls with Ranged weapons.
• Long Shots: Attacking at long range doesn't impose Disadvantage on your attack rolls with Ranged weapons.`
  },
  {
    name: 'War Caster',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, Spellcasting) • Concentration, Reactive Spell & Somatic Components',
    tags: ['Feat', 'General Feat', 'War Caster'],
    desc: `General Feat (Prerequisite: Level 4+, Spellcasting or Pact Magic Feature)
• Ability Score Increase: Increase your Intelligence, Wisdom, or Charisma score by 1, to a maximum of 20.
• Concentration: You have Advantage on Constitution saving throws that you make to maintain Concentration.
• Reactive Spell: When a creature provokes an Opportunity Attack from you by leaving your reach, you can take a Reaction to cast a spell at the creature rather than making an Opportunity Attack (casting time of 1 action, targets only that creature).
• Somatic Components: You can perform the Somatic components of spells even when you have weapons or a Shield in one or both hands.`
  },
  {
    name: 'Polearm Master',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, STR or DEX 13+) • Pole Strike & Reactive Strike',
    tags: ['Feat', 'General Feat', 'Polearm Master'],
    desc: `General Feat (Prerequisite: Level 4+, Strength or Dexterity 13+)
• Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.
• Pole Strike: Immediately after you take the Attack action and attack with a Quarterstaff, a Spear, or a weapon that has the Heavy and Reach properties, you can use a Bonus Action to make a melee attack with the opposite end of the weapon (1d4 Bludgeoning damage).
• Reactive Strike: While you're holding a Quarterstaff, a Spear, or a weapon that has the Heavy and Reach properties, you can take a Reaction to make one melee attack against a creature that enters the reach you have with that weapon.`
  },
  {
    name: 'Sentinel',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+, STR or DEX 13+) • Guardian, Halt & Opportunist',
    tags: ['Feat', 'General Feat', 'Sentinel'],
    desc: `General Feat (Prerequisite: Level 4+, Strength or Dexterity 13+)
• Ability Score Increase: Increase your Strength or Dexterity score by 1, to a maximum of 20.
• Guardian: Immediately after a creature within 5 feet of you takes the Disengage action or hits a target other than you with an attack, you can make an Opportunity Attack against that creature.
• Halt: When you hit a creature with an Opportunity Attack, the creature's Speed becomes 0 for the rest of the current turn.`
  },
  {
    name: 'Resilient',
    category: 'feats',
    subtitle: 'General Feat (Prerequisite: Level 4+) • +1 Ability Score & Saving Throw Proficiency',
    tags: ['Feat', 'General Feat', 'Resilient'],
    desc: `General Feat (Prerequisite: Level 4+)
• Ability Score Increase: Choose one ability in which you lack saving throw proficiency. Increase the chosen ability score by 1, to a maximum of 20.
• Saving Throw Proficiency: You gain saving throw proficiency with the chosen ability.`
  },
  { name: 'Actor', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, CHA 13+) • +1 CHA, Impersonation & Mimicry', tags: ['Feat', 'General Feat', 'Actor'], desc: '+1 Charisma (max 20). Advantage on Charisma (Deception and Performance) checks to pass yourself off as a different person, and can mimic sounds or speech.' },
  { name: 'Athlete', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, STR or DEX 13+) • +1 STR/DEX, Climb Speed & Standing Up', tags: ['Feat', 'General Feat', 'Athlete'], desc: '+1 Strength or Dexterity (max 20). Gain a Climb Speed equal to your Speed, stand up from Prone with only 5 feet of movement, and make running jumps after moving only 5 feet.' },
  { name: 'Charger', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, STR or DEX 13+) • +1 STR/DEX, Improved Dash & Charge Attack', tags: ['Feat', 'General Feat', 'Charger'], desc: '+1 Strength or Dexterity (max 20). +10 feet Speed when taking the Dash action; when moving at least 10 feet in a straight line before hitting with a melee attack, add +1d8 damage or push target 10 feet.' },
  { name: 'Crossbow Expert', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, DEX 13+) • +1 DEX, Ignore Loading, Firing in Melee & Dual Wielding', tags: ['Feat', 'General Feat', 'Crossbow Expert'], desc: '+1 Dexterity (max 20). Ignore the Loading property of crossbows, no Disadvantage on ranged crossbow attacks within 5 feet of an enemy, and add ability modifier to Light crossbow extra attack.' },
  { name: 'Defensive Duelist', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, DEX 13+) • +1 DEX & Parry Reaction (+Proficiency Bonus to AC)', tags: ['Feat', 'General Feat', 'Defensive Duelist'], desc: '+1 Dexterity (max 20). While holding a Finesse weapon, when another creature hits you with a melee attack, take a Reaction to add your Proficiency Bonus to your AC against melee attacks until the start of your next turn.' },
  { name: 'Dual Wielder', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, STR or DEX 13+) • +1 STR/DEX, Enhanced Dual Wielding & Quick Draw', tags: ['Feat', 'General Feat', 'Dual Wielder'], desc: '+1 Strength or Dexterity (max 20). When you take the Attack action and attack with a weapon that has the Light property, you can make one extra attack as a Bonus Action with a different Melee weapon that lacks the Two-Handed property; draw or stow two weapons at once.' },
  { name: 'Dungeon Delver', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • Advantage to Detect Secret Doors & Resist Trap Damage', tags: ['Feat', 'General Feat', 'Dungeon Delver'], desc: 'Advantage on Perception and Investigation checks made to detect secret doors; Advantage on saving throws to avoid or resist traps; Resistance to damage dealt by traps.' },
  { name: 'Durable', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 CON, Defy Death (Advantage on Death Saves) & Speedy Recovery', tags: ['Feat', 'General Feat', 'Durable'], desc: '+1 Constitution (max 20). Advantage on Death Saving Throws, and as a Bonus Action you can expend one Hit Point Die to roll it and regain that many Hit Points.' },
  { name: 'Elemental Adept', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, Spellcasting, Repeatable) • +1 INT/WIS/CHA & Energy Mastery', tags: ['Feat', 'General Feat', 'Elemental Adept'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Choose Acid, Cold, Fire, Lightning, or Thunder: spells you cast ignore Resistance to damage of the chosen type, and treat any 1 on a damage die of that type as a 2.' },
  { name: 'Fey Touched', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 INT/WIS/CHA, Misty Step & One Level 1 Divination/Enchantment Spell', tags: ['Feat', 'General Feat', 'Fey Touched'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Learn Misty Step and one level 1 Divination or Enchantment spell; cast each once per Long Rest without a spell slot or using spell slots.' },
  { name: 'Heavy Armor Master', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, Heavy Armor Training) • +1 CON/STR & Damage Reduction', tags: ['Feat', 'General Feat', 'Heavy Armor Master'], desc: '+1 Constitution or Strength (max 20). When you\'re hit by an attack while wearing Heavy armor, any Bludgeoning, Piercing, and Slashing damage dealt to you by that attack is reduced by an amount equal to your Proficiency Bonus.' },
  { name: 'Inspiring Leader', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, WIS or CHA 13+) • +1 WIS/CHA & Bolstering Performance (Temp HP)', tags: ['Feat', 'General Feat', 'Inspiring Leader'], desc: '+1 Wisdom or Charisma (max 20). When you finish a Short or Long Rest, give a bolstering performance to up to 6 allies within 30 feet, granting each Temporary Hit Points equal to your character level + your WIS or CHA modifier.' },
  { name: 'Keen Mind', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, INT 13+) • +1 INT, Lore Knowledge (Expertise) & Quick Study', tags: ['Feat', 'General Feat', 'Keen Mind'], desc: '+1 Intelligence (max 20). Gain proficiency or Expertise in Arcana, History, Investigation, Nature, or Religion, and take the Study action as a Bonus Action.' },
  { name: 'Lightly Armored', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 STR/DEX & Light Armor + Shield Training', tags: ['Feat', 'General Feat', 'Lightly Armored'], desc: '+1 Strength or Dexterity (max 20). Gain Armor Training with Light armor and Shields.' },
  { name: 'Mage Slayer', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 STR/DEX, Concentration Breaker & Guarded Mind', tags: ['Feat', 'General Feat', 'Mage Slayer'], desc: '+1 Strength or Dexterity (max 20). When you damage a creature that is Concentrating, it has Disadvantage on the saving throw to maintain Concentration; and 1/Short or Long Rest you can choose to succeed on a failed INT, WIS, or CHA save.' },
  { name: 'Martial Adept', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • Two Battle Master Maneuvers & One d6 Superiority Die', tags: ['Feat', 'General Feat', 'Martial Adept'], desc: 'Learn two maneuvers from the Battle Master archetype and gain one d6 Superiority Die (recovered on a Short or Long Rest).' },
  { name: 'Medium Armor Master', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, Medium Armor Training) • +1 STR/DEX & +3 DEX Bonus to AC', tags: ['Feat', 'General Feat', 'Medium Armor Master'], desc: '+1 Strength or Dexterity (max 20). While wearing Medium armor, you can add 3, rather than 2, to your AC if you have a Dexterity score of 16 or higher.' },
  { name: 'Mobile (Speedy)', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, DEX or CON 13+) • +1 DEX/CON, +10 ft Speed, Dash Across Difficult Terrain & Agile Movement', tags: ['Feat', 'General Feat', 'Mobile', 'Speedy'], desc: '+1 Dexterity or Constitution (max 20). Your Speed increases by 10 feet, Difficult Terrain doesn\'t cost you extra movement when you Dash, and Opportunity Attacks have Disadvantage against you.' },
  { name: 'Moderately Armored', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, Light Armor Training) • +1 STR/DEX & Medium Armor Training', tags: ['Feat', 'General Feat', 'Moderately Armored'], desc: '+1 Strength or Dexterity (max 20). Gain Armor Training with Medium armor.' },
  { name: 'Mounted Combatant', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 STR/DEX/WIS, Mounted Strike, Leap Aside & Veer', tags: ['Feat', 'General Feat', 'Mounted Combatant'], desc: '+1 Strength, Dexterity, or Wisdom (max 20). While mounted, gain Advantage on melee attack rolls against unmounted creatures smaller than your mount, grant Evasion to your mount, and redirect attacks targeting your mount to yourself.' },
  { name: 'Observant', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, INT or WIS 13+) • +1 INT/WIS, Keen Observer & Quick Search', tags: ['Feat', 'General Feat', 'Observant'], desc: '+1 Intelligence or Wisdom (max 20). Gain proficiency or Expertise in Insight, Investigation, or Perception, and take the Search action as a Bonus Action.' },
  { name: 'Poisoner', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 DEX/INT, Ignore Poison Resistance & Brew Potent Poison', tags: ['Feat', 'General Feat', 'Poisoner'], desc: '+1 Dexterity or Intelligence (max 20). Damage rolls you make ignore Resistance to Poison damage; gain Poisoner\'s Kit proficiency, brew potent poison (2d8 Poison + Poisoned condition), and apply poison as a Bonus Action.' },
  { name: 'Ritual Caster', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, INT, WIS, or CHA 13+) • +1 INT/WIS/CHA, Ritual Spells & Quick Ritual', tags: ['Feat', 'General Feat', 'Ritual Caster'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Always have a number of level 1 Ritual spells prepared equal to your Proficiency Bonus, and cast a Ritual spell using its normal casting time once per Long Rest.' },
  { name: 'Shadow Touched', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 INT/WIS/CHA, Invisibility & One Level 1 Illusion/Necromancy Spell', tags: ['Feat', 'General Feat', 'Shadow Touched'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Learn Invisibility and one level 1 Illusion or Necromancy spell; cast each once per Long Rest without a spell slot or using spell slots.' },
  { name: 'Shield Master', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, Shield Training) • +1 STR, Shield Bash & Interpose Shield', tags: ['Feat', 'General Feat', 'Shield Master'], desc: '+1 Strength (max 20). When you hit a creature with a melee attack as part of the Attack action while holding a Shield, bash it to push 5 ft or knock Prone (STR save); and use Reaction on succeeded DEX save to take no damage.' },
  { name: 'Skill Expert', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 Ability Score, Skill Proficiency & Skill Expertise', tags: ['Feat', 'General Feat', 'Skill Expert'], desc: '+1 to any ability score (max 20). Gain proficiency in one skill of your choice, and gain Expertise in one skill in which you have proficiency.' },
  { name: 'Skulker', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, DEX 13+) • +1 DEX, Blindsight 10 ft, Fog of War & Sniper', tags: ['Feat', 'General Feat', 'Skulker'], desc: '+1 Dexterity (max 20). Gain Blindsight 10 ft, Advantage on Stealth checks to Hide in combat, and missing a ranged attack while Hidden doesn\'t reveal your location.' },
  { name: 'Slasher', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 STR/DEX, Hamstring (-10 ft Speed) & Enhanced Critical', tags: ['Feat', 'General Feat', 'Slasher'], desc: '+1 Strength or Dexterity (max 20). Once per turn when you hit with an attack dealing Slashing damage, reduce the target\'s Speed by 10 feet; on a Critical Hit with Slashing damage, target has Disadvantage on attack rolls until your next turn.' },
  { name: 'Spell Sniper', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+, Spellcasting) • +1 INT/WIS/CHA, Bypass Cover, Casting in Melee & +60 ft Range', tags: ['Feat', 'General Feat', 'Spell Sniper'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Attack rolls for spells ignore Half and Three-Quarters Cover, casting within 5 feet of an enemy doesn\'t impose Disadvantage on spell attack rolls, and ranged attack spells with 10+ ft range gain +60 ft range.' },
  { name: 'Telekinetic', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 INT/WIS/CHA, Minor Telekinesis (Mage Hand) & Telekinetic Shove', tags: ['Feat', 'General Feat', 'Telekinetic'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Learn Mage Hand (invisible, no V/S components, +30 ft range) and take a Bonus Action to telekinetically shove a creature within 30 feet 5 feet toward or away from you (STR save).' },
  { name: 'Telepathic', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 INT/WIS/CHA, Telepathic Utterance (60 ft) & Detect Thoughts', tags: ['Feat', 'General Feat', 'Telepathic'], desc: '+1 Intelligence, Wisdom, or Charisma (max 20). Speak telepathically to any creature you can see within 60 feet, and always have Detect Thoughts prepared (1 free casting per Long Rest).' },
  { name: 'Weapon Master', category: 'feats', subtitle: 'General Feat (Prerequisite: Level 4+) • +1 STR/DEX & Weapon Mastery Property', tags: ['Feat', 'General Feat', 'Weapon Master'], desc: '+1 Strength or Dexterity (max 20). Unlock the mastery property of one kind of Simple or Martial weapon of your choice, changeable on a Long Rest.' },
  {
    name: 'Fighting Styles',
    category: 'feats',
    subtitle: 'Fighting Style Feats • Archery, Defense, Dueling, Great Weapon Fighting, Protection & Two-Weapon Fighting',
    tags: ['Feat', 'Fighting Style', 'Fighter', 'Paladin', 'Ranger'],
    desc: `Fighting Style Feats (Prerequisite: Fighting Style Feature)
• Archery: You gain a +2 bonus to attack rolls you make with Ranged weapons.
• Blind Fighting: You have Blindsight with a range of 10 feet.
• Defense: While you're wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.
• Dueling: When you're holding a Melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.
• Great Weapon Fighting: When you roll damage for an attack you make with a Melee weapon that you are holding with two hands (Two-Handed or Versatile), you can treat any 1 or 2 on a damage die as a 3.
• Interception: Reaction to reduce attack damage to ally within 5 ft by 1d10 + Proficiency Bonus.
• Protection: When a creature you can see attacks a target other than you that is within 5 feet of you, you can take a Reaction to interpose your Shield and impose Disadvantage on attack rolls against the target until the start of your next turn.
• Thrown Weapon Fighting: +2 bonus to damage rolls with ranged attacks using Thrown weapons.
• Two-Weapon Fighting: When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack.
• Unarmed Fighting: Unarmed Strikes deal 1d6 + STR (or 1d8 + STR with two free hands) Bludgeoning damage, plus 1d4 to a Grappled creature at the start of your turn.`
  },
  {
    name: 'Epic Boons',
    category: 'feats',
    subtitle: 'Level 19+ Epic Boon Feats • Combat Prowess, Dimensional Travel, Fate, Irresistible Offense, Night Spirit & Truesight',
    tags: ['Feat', 'Epic Boon', 'Level 19'],
    desc: `Epic Boon Feats (Prerequisite: Level 19+; all grant +1 to an Ability Score up to a maximum of 30)
• Boon of Combat Prowess: When you miss with an attack roll, you can hit instead (once per turn).
• Boon of Dimensional Travel: Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see.
• Boon of Energy Resistance: Gain Resistance to two damage types (Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, or Thunder; swappable on Long Rest) and Reaction to redirect damage (2d12 + CON mod within 60 ft).
• Boon of Fate: When you or another creature within 60 feet succeeds on or fails a D20 Test, you can roll 2d4 and apply the total as a bonus or penalty to the d20 roll (recovers on Initiative or Short/Long Rest).
• Boon of Fortitude: Your Hit Point maximum increases by 40, and once per turn when you regain Hit Points, you can regain additional Hit Points equal to your Constitution modifier.
• Boon of Irresistible Offense: Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance; and when you roll a 20 on the d20 for an attack roll, deal extra damage equal to the ability score increased by this feat.
• Boon of Recovery: Drop to 1 HP instead of 0 HP and heal half your HP maximum (1/Long Rest); plus gain a pool of ten d10s to heal as a Bonus Action.
• Boon of Skill: Gain proficiency in all skills and Expertise in one skill of your choice.
• Boon of Speed: Escape Artist (Bonus Action to end Grappled/Restrained) and +30 feet to your Speed.
• Boon of Spell Recall: Whenever you cast a spell with a level 1–4 spell slot, roll 1d4; if the number rolled equals the slot's level, the slot isn't expended.
• Boon of the Night Spirit: Bonus Action to gain the Invisible condition while in Dim Light or Darkness; and Resistance to all damage except Psychic and Radiant while in Dim Light or Darkness.
• Boon of Truesight: You have Truesight with a range of 60 feet.`
  },
  // Individual Epic Boons
  { name: 'Boon of Combat Prowess', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Combat'], desc: '+1 to any ability score (max 30). Peerless Aim: When you miss with an attack roll, you can hit instead. Once you use this benefit, you can\'t use it again until the start of your next turn.' },
  { name: 'Boon of Dimensional Travel', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Teleportation'], desc: '+1 to any ability score (max 30). Blink Steps: Immediately after you take the Attack action or the Magic action, you can teleport up to 30 feet to an unoccupied space you can see.' },
  { name: 'Boon of Energy Resistance', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Defense'], desc: '+1 to any ability score (max 30). Energy Resistances: Gain Resistance to two damage types (Acid, Cold, Fire, Lightning, Necrotic, Poison, Psychic, Radiant, or Thunder), changeable on a Long Rest. Energy Redirection: When you take damage of one of the chosen types, take a Reaction to direct damage of the same type toward another creature within 60 feet (DEX save or 2d12 + CON mod damage).' },
  { name: 'Boon of Fate', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Luck'], desc: '+1 to any ability score (max 30). Improve Fate: When you or another creature within 60 feet of you succeeds on or fails a D20 Test, you can roll 2d4 and apply the total rolled as a bonus or penalty to the d20 roll (1/Initiative or Short/Long Rest).' },
  { name: 'Boon of Fortitude', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Hit Points'], desc: '+1 to any ability score (max 30). Fortified Health: Your Hit Point maximum increases by 40. In addition, once per turn whenever you regain Hit Points, you can regain additional Hit Points equal to your Constitution modifier.' },
  { name: 'Boon of Irresistible Offense', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Combat'], desc: '+1 Strength or Dexterity (max 30). Overcome Defenses: The Bludgeoning, Piercing, and Slashing damage you deal always ignores Resistance. Overwhelming Strike: When you roll a 20 on the d20 for an attack roll, you can deal extra damage to the target equal to the ability score increased by this feat.' },
  { name: 'Boon of Recovery', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Healing'], desc: '+1 to any ability score (max 30). Last Stand: When you would be reduced to 0 Hit Points, you can drop to 1 Hit Point instead and regain Hit Points equal to half your Hit Point maximum (1/Long Rest). Recover Vitality: Pool of ten d10s; take a Bonus Action to expend dice from the pool and heal yourself.' },
  { name: 'Boon of Skill', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Skills'], desc: '+1 to any ability score (max 30). All-Around Adept: You gain proficiency in all skills. Expertise: Choose one skill in which you lack Expertise; you gain Expertise in it.' },
  { name: 'Boon of Speed', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Movement'], desc: '+1 to any ability score (max 30). Escape Artist: As a Bonus Action, you can end the Grappled or Restrained condition on yourself. Quickness: Your Speed increases by 30 feet.' },
  { name: 'Boon of Spell Recall', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+, Spellcasting)', tags: ['Feat', 'Epic Boon', 'Spellcasting'], desc: '+1 Intelligence, Wisdom, or Charisma (max 30). Free Casting: Whenever you cast a spell with a level 1–4 spell slot, roll 1d4. If the number you roll is the same as the slot\'s level, the slot isn\'t expended.' },
  { name: 'Boon of the Night Spirit', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Stealth'], desc: '+1 to any ability score (max 30). Merge with Shadows: While within Dim Light or Darkness, you can give yourself the Invisible condition as a Bonus Action. Shadowy Form: While within Dim Light or Darkness, you have Resistance to all damage except Psychic and Radiant.' },
  { name: 'Boon of Truesight', category: 'feats', subtitle: 'Epic Boon Feat (Prerequisite: Level 19+)', tags: ['Feat', 'Epic Boon', 'Senses'], desc: '+1 to any ability score (max 30). Truesight: You have Truesight with a range of 60 feet.' },

  // Individual Fighting Style Feats
  { name: 'Archery', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Ranged'], desc: 'You gain a +2 bonus to attack rolls you make with Ranged weapons.' },
  { name: 'Blind Fighting', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Blindsight'], desc: 'You have Blindsight with a range of 10 feet.' },
  { name: 'Defense', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Armor Class'], desc: 'While you\'re wearing Light, Medium, or Heavy armor, you gain a +1 bonus to Armor Class.' },
  { name: 'Dueling', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Melee'], desc: 'When you\'re holding a Melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.' },
  { name: 'Great Weapon Fighting', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Melee'], desc: 'When you roll damage for an attack you make with a Melee weapon that you are holding with two hands (Two-Handed or Versatile property), you can treat any 1 or 2 on a damage die as a 3.' },
  { name: 'Interception', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Reaction'], desc: 'When a creature you can see hits another creature within 5 feet of you with an attack roll, you can take a Reaction to reduce the damage dealt to the target by 1d10 + your Proficiency Bonus (requires holding a Shield or a Simple or Martial weapon).' },
  { name: 'Protection', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Reaction', 'Shield'], desc: 'When a creature you can see attacks a target other than you that is within 5 feet of you, you can take a Reaction to interpose your Shield if you\'re holding one, imposing Disadvantage on attack rolls against the target until the start of your next turn.' },
  { name: 'Thrown Weapon Fighting', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Thrown'], desc: 'When you hit with a ranged attack roll using a weapon that has the Thrown property, you gain a +2 bonus to the damage roll.' },
  { name: 'Two-Weapon Fighting', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Melee', 'Light'], desc: 'When you make an extra attack as a result of using a weapon that has the Light property, you can add your ability modifier to the damage of that attack.' },
  { name: 'Unarmed Fighting', category: 'feats', subtitle: 'Fighting Style Feat', tags: ['Feat', 'Fighting Style', 'Unarmed Strike'], desc: 'When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d6 + your Strength modifier (or 1d8 + STR if you aren\'t holding any weapons or a Shield). At the start of each of your turns, you can deal 1d4 Bludgeoning damage to one creature Grappled by you.' },

  // Individual Weapon Mastery Properties
  { name: 'Weapon Mastery Properties', category: 'rules', subtitle: 'Equipment Rule (Cleave, Graze, Nick, Push, Sap, Slow, Topple, Vex)', tags: ['Weapon Mastery', 'Combat', 'Equipment'], desc: 'Each weapon has a Mastery property usable by characters with a Weapon Mastery feature (Barbarian, Fighter, Paladin, Ranger, Rogue): Cleave, Graze, Nick, Push, Sap, Slow, Topple, and Vex.' },
  { name: 'Cleave', category: 'rules', subtitle: 'Weapon Mastery Property (Greataxe, Halberd)', tags: ['Weapon Mastery', 'Combat', 'Cleave'], desc: 'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon\'s damage, but don\'t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.' },
  { name: 'Graze', category: 'rules', subtitle: 'Weapon Mastery Property (Glaive, Greatsword)', tags: ['Weapon Mastery', 'Combat', 'Graze'], desc: 'If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.' },
  { name: 'Nick', category: 'rules', subtitle: 'Weapon Mastery Property (Dagger, Light Hammer, Scimitar, Sickle)', tags: ['Weapon Mastery', 'Combat', 'Nick'], desc: 'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.' },
  { name: 'Push', category: 'rules', subtitle: 'Weapon Mastery Property (Greatclub, Heavy Crossbow, Pike, Warhammer)', tags: ['Weapon Mastery', 'Combat', 'Push'], desc: 'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.' },
  { name: 'Sap', category: 'rules', subtitle: 'Weapon Mastery Property (Flail, Longsword, Mace, Morningstar, Spear, War Pick)', tags: ['Weapon Mastery', 'Combat', 'Sap'], desc: 'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.' },
  { name: 'Slow', category: 'rules', subtitle: 'Weapon Mastery Property (Club, Javelin, Light Crossbow, Longbow, Musket, Sling, Whip)', tags: ['Weapon Mastery', 'Combat', 'Slow'], desc: 'If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn\'t exceed 10 feet.' },
  { name: 'Topple', category: 'rules', subtitle: 'Weapon Mastery Property (Battleaxe, Lance, Maul, Quarterstaff, Trident)', tags: ['Weapon Mastery', 'Combat', 'Topple'], desc: 'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 + the ability modifier used to make the attack roll + your Proficiency Bonus). On a failed save, the creature has the Prone condition.' },
  { name: 'Vex', category: 'rules', subtitle: 'Weapon Mastery Property (Blowgun, Dart, Hand Crossbow, Handaxe, Pistol, Rapier, Shortbow, Shortsword)', tags: ['Weapon Mastery', 'Combat', 'Vex'], desc: 'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn.' },

  // Individual Eldritch Invocations & Metamagic
  { name: 'Eldritch Invocations', category: 'classes', subtitle: 'Warlock Class Feature Options', tags: ['Class Feature', 'Warlock', 'Eldritch Invocation'], desc: 'Eldritch Invocations are fragments of forbidden knowledge that imbue a Warlock with an abiding magical ability or other lessons: Agonizing Blast (add CHA mod to cantrip damage), Armor of Shadows (Mage Armor at will), Ascendant Step (Levitate at will), Devil\'s Sight (see in magical and nonmagical Darkness 120 ft), Devouring Blade (2 extra attacks with Pact Blade at Lv 12+), Eldritch Mind (Advantage on Concentration saves), Eldritch Smite (expend slot for +1d8 Force per slot level and knock Prone), Eldritch Spear (increase cantrip range by 30 × Warlock level ft), Fiendish Vigor (False Life at will at max roll), Gaze of Two Minds, Gift of the Depths,Gift of the Protectors, Investment of the Chain Master, Lessons of the First Ones (gain an Origin feat), Lifedrinker (+1d6 Necrotic/Psychic/Radiant + heal), Mask of Many Faces (Disguise Self at will), Master of Myriad Forms (Alter Self at will), Misty Visions (Silent Image at will), One with Shadows (Invisibility in Dim Light/Darkness), Otherworldly Leap (Jump at will), Pact of the Blade, Pact of the Chain, Pact of the Tome, Repelling Blast (push 10 ft on cantrip hit), Thirsting Blade (Extra Attack with Pact Blade at Lv 5+), Visions of Distant Realms (Arcane Eye at will), Whispers of the Grave (Speak with Dead at will), Witch Sight (Truesight 30 ft at Lv 15+).' },
  { name: 'Agonizing Blast', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock, a Warlock Cantrip that Deals Damage)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Choose one of your known Warlock cantrips that deals damage (such as Eldritch Blast). You can add your Charisma modifier to the spell\'s damage rolls.' },
  { name: "Devil's Sight", category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock)', tags: ['Eldritch Invocation', 'Warlock', 'Darkvision'], desc: 'You can see normally in Dim Light and Darkness—both magical and nonmagical—within 120 feet of yourself.' },
  { name: 'Pact of the Blade', category: 'classes', subtitle: 'Eldritch Invocation (Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'As a Bonus Action, conjure a pact melee weapon in your hand or bond with a magic weapon. You have proficiency with it, can use it as a Spellcasting Focus, can use your Charisma modifier for attack and damage rolls with it, and can cause it to deal Necrotic, Psychic, or Radiant damage.' },
  { name: 'Pact of the Chain', category: 'classes', subtitle: 'Eldritch Invocation (Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You learn the Find Familiar spell and can cast it as a Magic action without expending a spell slot. You can choose an Imp, Pseudodragon, Quasit, Skeleton, Slaad Tadpole, Sphinx of Wonder, Sprite, or Venomous Snake as your familiar, and can forgo one of your attacks to let your familiar attack with its Reaction.' },
  { name: 'Pact of the Tome', category: 'classes', subtitle: 'Eldritch Invocation (Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Stitch together a Book of Shadows during a Short or Long Rest. While the book is on your person, you have three chosen cantrips and two chosen level 1 Ritual spells from any class\'s spell list prepared, and the book serves as a Spellcasting Focus.' },
  { name: 'Metamagic', category: 'classes', subtitle: 'Sorcerer Class Feature Options', tags: ['Class Feature', 'Sorcerer', 'Metamagic'], desc: 'Metamagic options allow a Sorcerer to twist spells to suit their needs using Sorcery Points: Careful Spell (1 SP: chosen creatures auto-succeed save), Distant Spell (1 SP: double spell range or make Touch range 30 ft), Empowered Spell (1 SP: reroll up to CHA mod damage dice), Extended Spell (1 SP: double spell duration up to 24 hrs and Advantage on Concentration saves), Heightened Spell (2 SP: target has Disadvantage on saves against the spell), Quickened Spell (2 SP: change 1-Action spell to Bonus Action), Seeking Spell (1 SP: reroll missed spell attack roll), Subtle Spell (1 SP: cast without Verbal, Somatic, or non-costly Material components), Transmuted Spell (1 SP: change elemental damage type among Acid, Cold, Fire, Lightning, Poison, Thunder), Twinned Spell (1 SP: increase spell\'s effective level by 1 to target a second creature if the spell can target an additional creature at higher levels).' },
  { name: 'Deep Gnome (Svirfneblin)', category: 'races', subtitle: 'Gnome Subrace • Underdark Stealth and Superior Darkvision 120 ft', tags: ['Race', 'Subrace', 'Gnome', 'Deep Gnome', 'Svirfneblin'], desc: 'Guarded and stealthy inhabitants of the Underdark. Grants Superior Darkvision (120 feet), Gnome Cunning (Advantage on INT, WIS, and CHA saves), and Stone Camouflage (Advantage on Dexterity Stealth checks to hide in rocky terrain).' },
  { name: 'Svirfneblin Magic', category: 'feats', subtitle: 'Racial Feat (Prerequisite: Gnome — Deep Gnome)', tags: ['Feat', 'Gnome', 'Deep Gnome', 'Svirfneblin Magic'], desc: 'You have inherited the innate spellcasting ability of your ancestors. You can cast Nondetection on yourself at will without a material component, and you can also cast each of the following spells once per Long Rest without expending a spell slot: Blindness/Deafness, Blur, and Disguise Self.' },
  // Remaining Eldritch Invocations
  { name: 'Armor of Shadows', category: 'classes', subtitle: 'Eldritch Invocation (Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Mage Armor on yourself without expending a spell slot.' },
  { name: 'Ascendant Step', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Levitate on yourself without expending a spell slot.' },
  { name: 'Devouring Blade', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 12+ Warlock, Thirsting Blade)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'The Extra Attack of your Thirsting Blade invocation confers two extra attacks rather than one when using your pact weapon.' },
  { name: 'Eldritch Mind', category: 'classes', subtitle: 'Eldritch Invocation (Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You have Advantage on Constitution saving throws that you make to maintain Concentration.' },
  { name: 'Eldritch Smite', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock, Pact of the Blade)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Once per turn when you hit a creature with your pact weapon, you can expend a Pact Magic spell slot to deal an extra 1d8 Force damage to the target, plus another 1d8 per level of the spell slot, and you can give the target the Prone condition if it is Huge or smaller.' },
  { name: 'Eldritch Spear', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock, a Warlock Cantrip that Deals Damage)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Choose one of your known Warlock cantrips that deals damage and has a range of 10+ feet. When you cast that spell, its range increases by a number of feet equal to 30 times your Warlock level.' },
  { name: 'Fiendish Vigor', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast False Life on yourself without expending a spell slot. When you cast the spell with this feature, you don\'t roll the die for the Temporary Hit Points; you automatically get the highest number on the die (12 Temporary HP).' },
  { name: 'Gaze of Two Minds', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can take a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn, and you can cast spells as if you were in your space or the other creature\'s space.' },
  { name: 'Gift of the Depths', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can breathe underwater, you gain a Swim Speed equal to your Speed, and you can cast Water Breathing once per Long Rest without expending a spell slot.' },
  { name: 'Gift of the Protectors', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 9+ Warlock, Pact of the Tome)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'A creature whose name is inscribed in your Book of Shadows drops to 1 Hit Point instead of 0 Hit Points when reduced to 0 HP (1/Long Rest).' },
  { name: 'Investment of the Chain Master', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock, Pact of the Chain)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Your familiar gains a Fly or Swim Speed of 40 ft, can attack as a Bonus Action, deals Radiant or Necrotic damage, uses your spell save DC, and you can use a Reaction to grant it Resistance to damage.' },
  { name: 'Lessons of the First Ones', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock)', tags: ['Eldritch Invocation', 'Warlock', 'Feat'], desc: 'You have received knowledge from an elder entity of the multiverse, allowing you to gain one Origin feat of your choice (repeatable).' },
  { name: 'Lifedrinker', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 9+ Warlock, Pact of the Blade)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Once per turn when you hit a creature with your pact weapon, you can deal an extra 1d6 Necrotic, Psychic, or Radiant damage to the creature, and you can expend one of your Hit Point Dice to roll it and regain Hit Points.' },
  { name: 'Mask of Many Faces', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Disguise Self without expending a spell slot.' },
  { name: 'Master of Myriad Forms', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Alter Self without expending a spell slot.' },
  { name: 'Misty Visions', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Silent Image without expending a spell slot.' },
  { name: 'One with Shadows', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'While you\'re in an area of Dim Light or Darkness, you can cast Invisibility on yourself without expending a spell slot.' },
  { name: 'Otherworldly Leap', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Jump on yourself without expending a spell slot.' },
  { name: 'Repelling Blast', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 2+ Warlock, a Warlock Cantrip that Deals Damage via Attack Roll)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'Choose one of your known Warlock cantrips that requires an attack roll. When you hit a Large or smaller creature with that cantrip, you can push the creature up to 10 feet straight away from you.' },
  { name: 'Thirsting Blade', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 5+ Warlock, Pact of the Blade)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You gain the Extra Attack feature for your pact weapon only. With that feature, you can attack twice with the weapon instead of once when you take the Attack action on your turn.' },
  { name: 'Visions of Distant Realms', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 9+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Arcane Eye without expending a spell slot.' },
  { name: 'Whispers of the Grave', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 7+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You can cast Speak with Dead without expending a spell slot.' },
  { name: 'Witch Sight', category: 'classes', subtitle: 'Eldritch Invocation (Prerequisite: Level 15+ Warlock)', tags: ['Eldritch Invocation', 'Warlock'], desc: 'You have Truesight with a range of 30 feet.' },

  // Individual Metamagic Options
  { name: 'Careful Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell\'s full force by spending 1 Sorcery Point and choosing up to your Charisma modifier of them: chosen creatures automatically succeed on their saving throws against the spell, and take no damage if they would normally take half damage on a successful save.' },
  { name: 'Distant Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell that has a range of at least 5 feet, you can spend 1 Sorcery Point to double the spell\'s range. Or when you cast a spell that has a range of Touch, you can spend 1 Sorcery Point to make the spell\'s range 30 feet.' },
  { name: 'Empowered Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you roll damage for a spell, you can spend 1 Sorcery Point to reroll a number of the damage dice up to your Charisma modifier (minimum of one), and you must use the new rolls. You can use Empowered Spell even if you\'ve already used a different Metamagic option during the casting of the spell.' },
  { name: 'Extended Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell that has a duration of 1 minute or longer, you can spend 1 Sorcery Point to double its duration to a maximum duration of 24 hours. If the affected spell requires Concentration, you have Advantage on any saving throw you make to maintain that Concentration.' },
  { name: 'Heightened Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 2 Sorcery Points)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell that forces a creature to make a saving throw, you can spend 2 Sorcery Points to give one target of the spell Disadvantage on saves against the spell.' },
  { name: 'Quickened Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 2 Sorcery Points)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell that has a casting time of an action, you can spend 2 Sorcery Points to change the casting time to a Bonus Action for this casting. You can\'t modify a spell in this way if you\'ve already cast a level 1+ spell on the current turn, nor can you cast a level 1+ spell on this turn after modifying a spell in this way.' },
  { name: 'Seeking Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'If you make an attack roll for a spell and miss, you can spend 1 Sorcery Point to reroll the d20, and you must use the new roll. You can use Seeking Spell even if you\'ve already used a different Metamagic option during the casting of the spell.' },
  { name: 'Subtle Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell, you can spend 1 Sorcery Point to cast it without any Verbal, Somatic, or Material components, except Material components that are consumed by the spell or that have a cost specified in the spell.' },
  { name: 'Transmuted Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell that deals a type of damage from the following list, you can spend 1 Sorcery Point to change that damage type to one of the other listed types: Acid, Cold, Fire, Lightning, Poison, Thunder.' },
  { name: 'Twinned Spell', category: 'classes', subtitle: 'Metamagic Option (Sorcerer • 1 Sorcery Point)', tags: ['Metamagic', 'Sorcerer'], desc: 'When you cast a spell, such as Charm Person, that can be cast with a higher-level spell slot to target an additional creature, you can spend 1 Sorcery Point to increase the spell\'s effective level by 1.' },

  // Iconic Core Class Features
  { name: 'Rage', category: 'classes', subtitle: 'Barbarian Level 1 Class Feature (Bonus Action)', tags: ['Class Feature', 'Barbarian', 'Bonus Action'], desc: 'As a Bonus Action, enter a Rage for up to 10 minutes (if not wearing Heavy armor): Resistance to Bludgeoning, Piercing, and Slashing damage; Rage Damage bonus (+2 to +4) on Strength attacks; Advantage on Strength checks and Strength saving throws; no Concentration or spellcasting while raging.' },
  { name: 'Reckless Attack', category: 'classes', subtitle: 'Barbarian Level 2 Class Feature', tags: ['Class Feature', 'Barbarian'], desc: 'When you make your first attack roll on your turn, you can decide to attack recklessly: you have Advantage on attack rolls using Strength until the start of your next turn, and attack rolls against you have Advantage during that time.' },
  { name: 'Bardic Inspiration', category: 'classes', subtitle: 'Bard Level 1 Class Feature (Bonus Action)', tags: ['Class Feature', 'Bard', 'Bonus Action'], desc: 'As a Bonus Action, inspire another creature within 60 feet that can see or hear you with a Bardic Inspiration die (d6 at Lv 1, d8 at Lv 5, d10 at Lv 10, d12 at Lv 15). Within 1 hour, the creature can add the die to one D20 Test after rolling.' },
  { name: 'Channel Divinity', category: 'classes', subtitle: 'Cleric Level 2 & Paladin Level 3 Class Feature', tags: ['Class Feature', 'Cleric', 'Paladin'], desc: 'Channel divine energy directly from the Outer Planes to fuel magical effects such as Divine Spark, Turn Undead, Preserve Life (Life Domain), or Sacred Weapon (Oath of Devotion).' },
  { name: 'Wild Shape', category: 'classes', subtitle: 'Druid Level 2 Class Feature (Bonus Action)', tags: ['Class Feature', 'Druid', 'Bonus Action'], desc: 'As a Bonus Action, assume the form of a Beast you have learned for a number of hours equal to half your Druid level. You gain Temporary Hit Points equal to your Druid level, retain your INT, WIS, and CHA scores and personality, and use the Beast\'s game statistics.' },
  { name: 'Action Surge', category: 'classes', subtitle: 'Fighter Level 2 Class Feature', tags: ['Class Feature', 'Fighter'], desc: 'On your turn, you can take one additional action, except the Magic action. Regains after a Short or Long Rest (2 uses at Level 17).' },
  { name: 'Second Wind', category: 'classes', subtitle: 'Fighter Level 1 Class Feature (Bonus Action)', tags: ['Class Feature', 'Fighter', 'Bonus Action', 'Healing'], desc: 'As a Bonus Action, draw upon a limited well of physical and mental stamina to regain Hit Points equal to 1d10 plus your Fighter level (2–4 uses per Long Rest, regains 1 use on a Short Rest).' },
  { name: 'Flurry of Blows', category: 'classes', subtitle: 'Monk Level 2 Focus Feature (Bonus Action • 1 Focus Point)', tags: ['Class Feature', 'Monk', 'Bonus Action'], desc: 'You can expend 1 Focus Point to make two Unarmed Strikes as a Bonus Action (three Unarmed Strikes at Level 10 with Heightened Focus).' },
  { name: 'Stunning Strike', category: 'classes', subtitle: 'Monk Level 5 Class Feature (1 Focus Point)', tags: ['Class Feature', 'Monk', 'Stunned'], desc: 'Once per turn when you hit a creature with a Monk weapon or an Unarmed Strike, you can expend 1 Focus Point to force the target to make a Constitution saving throw: on a failed save, it has the Stunned condition until the start of your next turn; on a successful save, its Speed is halved and the next attack against it has Advantage.' },
  { name: 'Divine Smite', category: 'classes', subtitle: 'Paladin Smite Spell & Class Feature (Bonus Action)', tags: ['Class Feature', 'Paladin', 'Bonus Action', 'Radiant'], desc: 'Immediately after hitting a target with a Melee weapon or Unarmed Strike, deal an extra 2d8 Radiant damage (+1d8 per spell slot level above 1, and +1d8 if the target is a Fiend or Undead).' },
  { name: 'Lay on Hands', category: 'classes', subtitle: 'Paladin Level 1 Class Feature (Bonus Action)', tags: ['Class Feature', 'Paladin', 'Bonus Action', 'Healing'], desc: 'You have a pool of healing power equal to 5 times your Paladin level that replenishes on a Long Rest. As a Bonus Action, touch a creature to restore Hit Points from the pool, or expend 5 HP from the pool to remove the Poisoned condition.' },
  { name: 'Sneak Attack', category: 'classes', subtitle: 'Rogue Level 1 Class Feature', tags: ['Class Feature', 'Rogue', 'Combat'], desc: 'Once per turn, you can deal an extra 1d6 damage (up to 10d6 at Level 19) to one creature you hit with an attack roll if you have Advantage on the roll and the attack uses a Finesse or a Ranged weapon (or if an ally is within 5 feet of the target and you don\'t have Disadvantage).' },
  { name: 'Cunning Action', category: 'classes', subtitle: 'Rogue Level 2 Class Feature (Bonus Action)', tags: ['Class Feature', 'Rogue', 'Bonus Action'], desc: 'On your turn, you can take a Bonus Action to take the Dash, Disengage, or Hide action.' },
  { name: 'Uncanny Dodge', category: 'classes', subtitle: 'Rogue Level 5 Class Feature (Reaction)', tags: ['Class Feature', 'Rogue', 'Reaction'], desc: 'When an attacker that you can see hits you with an attack roll, you can take a Reaction to halve the attack\'s damage against you (round down).' },
  { name: 'Evasion', category: 'classes', subtitle: 'Rogue Level 7 & Monk Level 7 Class Feature', tags: ['Class Feature', 'Rogue', 'Monk'], desc: 'When you\'re subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw and only half damage if you fail (if not Incapacitated).' },
  { name: 'Arcane Recovery', category: 'classes', subtitle: 'Wizard Level 1 Class Feature', tags: ['Class Feature', 'Wizard'], desc: 'When you finish a Short Rest, you can choose expended spell slots to recover. The spell slots can have a combined level equal to no more than half your Wizard level (round up), and none of the slots can be level 6 or higher (1/Long Rest).' }
];

import { SRD_CLASS_AND_SUBCLASS_FEATURES, SRD_SPECIES_TRAITS } from './srdFeaturesAndTraits.ts';

export function buildClassAndRaceLibraryEntries(): LibraryEntry[] {
  const all = [
    ...SRD_CLASSES_AND_SUBCLASSES,
    ...SRD_SPECIES_AND_RACES,
    ...SRD_BACKGROUNDS_AND_FEATS,
    ...SRD_CLASS_AND_SUBCLASS_FEATURES,
    ...SRD_SPECIES_TRAITS,
  ];
  return all.map((entry) => ({
    id: `srd_${entry.category}_${entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name: entry.name,
    category: entry.category,
    source: 'SRD 5.2.1',
    summary: entry.subtitle,
    content: `${entry.subtitle}\n\n${entry.desc}`,
    tags: entry.tags,
  }));
}

