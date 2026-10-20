import { LibraryEntry } from '../types.ts';

export interface SrdRuleRaw {
  name: string;
  category: 'actions' | 'rules';
  subtitle: string;
  tags: string[];
  desc: string;
}

export const SRD_ACTIONS_AND_CONDITIONS: SrdRuleRaw[] = [
  // Core Combat & Exploration Actions
  {
    name: 'Attack',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Combat', 'Weapon', 'Unarmed Strike'],
    desc: `When you take the Attack action, you can make one attack roll with a weapon or an Unarmed Strike.

Equipping and Unequipping Weapons: You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack. If you equip a weapon before an attack, you don't need to use it for that attack.
Moving between Attacks: If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks.`
  },
  {
    name: 'Dash',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Combat', 'Movement'],
    desc: `When you take the Dash action, you gain extra movement for the current turn. The increase equals your Speed after applying any modifiers. With a Speed of 30 feet, for example, you can move up to 60 feet on your turn if you Dash. If your Speed of 30 feet is reduced to 15 feet, you can move up to 30 feet this turn if you Dash.

If you have a special speed, such as a Fly Speed or Swim Speed, you can use that speed instead of your Speed when you take this action. You choose which speed to use each time you take it.`
  },
  {
    name: 'Disengage',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Combat', 'Movement', 'Opportunity Attack'],
    desc: `If you take the Disengage action, your movement doesn't provoke Opportunity Attacks for the rest of the current turn.`
  },
  {
    name: 'Dodge',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Combat', 'Defense'],
    desc: `If you take the Dodge action, you gain the following benefits until the start of your next turn: any attack roll made against you has Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage.

You lose this benefit if you have the Incapacitated condition or if your Speed is 0.`
  },
  {
    name: 'Help',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Combat', 'Skill Check', 'Support'],
    desc: `When you take the Help action, you do one of the following:
• Assist an Ability Check: Choose one of your skill or tool proficiencies and one ally who is near enough for you to assist verbally or physically when they make an ability check. That ally has Advantage on the next ability check they make with the chosen skill or tool. This benefit expires if the ally doesn't use it before the start of your next turn. The GM has final say on whether your assistance is possible.
• Assist an Attack Roll: You momentarily distract an enemy within 5 feet of you, giving Advantage to the next attack roll by one of your allies against that enemy. This benefit expires at the start of your next turn.`
  },
  {
    name: 'Hide',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Combat', 'Stealth', 'Invisible'],
    desc: `With the Hide action, you try to conceal yourself. To do so, you must succeed on a DC 15 Dexterity (Stealth) check while you're Heavily Obscured or behind Three-Quarters Cover or Total Cover, and you must be out of any enemy's line of sight; if you can see a creature, you can discern whether it can see you.

On a successful check, you have the Invisible condition. Make note of your check's total, which is the DC for a creature to find you with a Wisdom (Perception) check.
The condition ends on you immediately after any of the following occurs: you make a sound louder than a whisper, an enemy finds you, you make an attack roll, or you cast a spell with a Verbal component.`
  },
  {
    name: 'Influence',
    category: 'actions',
    subtitle: 'Standard Action (Social Interaction)',
    tags: ['Action', 'Social', 'Charisma', 'Wisdom'],
    desc: `With the Influence action, you urge a monster to do something. Describe or roleplay how you're communicating with the monster. Are you trying to deceive, intimidate, amuse, or gently persuade? The GM then determines whether the monster is willing, unwilling, or hesitant to comply:
• Willing: If your urging aligns with the monster's desires, no ability check is necessary; the monster fulfills your request in a way it prefers.
• Unwilling: If your urging is repugnant to the monster or counter to its alignment, no ability check is necessary; it doesn't comply.
• Hesitant: If you urge the monster to do something that it is hesitant to do, you must make an ability check, which is affected by the monster's attitude: Indifferent, Friendly (Advantage), or Hostile (Disadvantage).

Ability Checks: Deception (Charisma), Intimidation (Charisma), Performance (Charisma), Persuasion (Charisma), or Animal Handling (Wisdom for a Beast or Monstrosity with INT 4 or lower). Default DC equals 15 or the monster's Intelligence score, whichever is higher.`
  },
  {
    name: 'Magic',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Spellcasting', 'Magic Item'],
    desc: `When you take the Magic action, you cast a spell that has a casting time of an action or use a feature or magic item that requires a Magic action to be activated.

If you cast a spell that has a casting time of 1 minute or longer, you must take the Magic action on each turn of that casting, and you must maintain Concentration while you do so. If your Concentration is broken, the spell fails, but you don't expend a spell slot.`
  },
  {
    name: 'Ready',
    category: 'actions',
    subtitle: 'Standard Action & Reaction',
    tags: ['Action', 'Reaction', 'Combat', 'Trigger'],
    desc: `You take the Ready action to wait for a particular circumstance before you act. To do so, you take this action on your turn, which lets you act by taking a Reaction before the start of your next turn.

First, you decide what perceivable circumstance will trigger your Reaction. Then, you choose the action you will take in response to that trigger, or you choose to move up to your Speed in response to it.
When the trigger occurs, you can either take your Reaction right after the trigger finishes or ignore the trigger.
When you Ready a spell, you cast it as normal (expending any resources used to cast it) but hold its energy, which you release with your Reaction when the trigger occurs. To be readied, a spell must have a casting time of an action, and holding on to the spell's magic requires Concentration, which you can maintain up to the start of your next turn. If your Concentration is broken, the spell dissipates without taking effect.`
  },
  {
    name: 'Search',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Exploration', 'Wisdom'],
    desc: `When you take the Search action, you make a Wisdom check to discern something that isn't obvious. The Search table suggests which skills are applicable when you take this action, depending on what you're trying to detect:
• Insight: Creature's state of mind
• Medicine: Creature's ailment or cause of death
• Perception: Concealed creature or object
• Survival: Tracks or food`
  },
  {
    name: 'Study',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Exploration', 'Intelligence', 'Knowledge'],
    desc: `When you take the Study action, you make an Intelligence check to study your memory, a book, a clue, or another source of knowledge and call to mind an important piece of information about it.

Areas of Knowledge:
• Arcana: Spells, magic items, eldritch symbols, magical traditions, planes of existence, and certain creatures (Aberrations, Constructs, Elementals, Fey, and Monstrosities).
• History: Historic events and people, ancient civilizations, wars, and certain creatures (Giants and Humanoids).
• Investigation: Traps, ciphers, riddles, and gadgetry.
• Nature: Terrain, flora, weather, and certain creatures (Beasts, Dragons, Oozes, and Plants).
• Religion: Deities, religious hierarchies and rites, holy symbols, cults, and certain creatures (Celestials, Fiends, and Undead).`
  },
  {
    name: 'Utilize',
    category: 'actions',
    subtitle: 'Standard Action',
    tags: ['Action', 'Object', 'Gear'],
    desc: `You normally interact with an object while doing something else, such as when you draw a sword as part of the Attack action. When an object requires an action for its use, you take the Utilize action.`
  },
  {
    name: 'Unarmed Strike',
    category: 'actions',
    subtitle: 'Melee Attack Option (Damage, Grapple, or Shove)',
    tags: ['Action', 'Combat', 'Unarmed Strike', 'Grapple', 'Shove'],
    desc: `Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an Unarmed Strike—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.

Whenever you use your Unarmed Strike, choose one of the following options for its effect:
• Damage: You make an attack roll against the target. Your bonus to the roll equals your Strength modifier plus your Proficiency Bonus. On a hit, the target takes Bludgeoning damage equal to 1 plus your Strength modifier.
• Grapple: The target must succeed on a Strength or Dexterity saving throw (it chooses which), or it has the Grappled condition. The DC for the saving throw and any escape attempts equals 8 plus your Strength modifier and Proficiency Bonus. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.
• Shove: The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. The DC for the saving throw equals 8 plus your Strength modifier and Proficiency Bonus. This shove is possible only if the target is no more than one size larger than you.`
  },
  {
    name: 'Opportunity Attack',
    category: 'actions',
    subtitle: 'Combat Reaction',
    tags: ['Reaction', 'Combat', 'Melee'],
    desc: `You can make an Opportunity Attack when a creature that you can see leaves your reach using its action, its Bonus Action, its Reaction, or one of its speeds. To make the Opportunity Attack, take a Reaction to make one melee attack with a weapon or an Unarmed Strike against the provoking creature. The attack occurs right before the creature leaves your reach.

Avoiding Opportunity Attacks: You can avoid provoking an Opportunity Attack by taking the Disengage action. You also don't provoke an Opportunity Attack when you teleport or when someone or something moves you without using your movement, action, Bonus Action, or Reaction.`
  },
  {
    name: 'Two-Weapon Fighting',
    category: 'actions',
    subtitle: 'Bonus Action Combat Rule',
    tags: ['Bonus Action', 'Combat', 'Light Weapon'],
    desc: `When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don't add your ability modifier to the extra attack's damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don't add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative.`
  },
  {
    name: 'Grapple',
    category: 'actions',
    subtitle: 'Unarmed Strike Option',
    tags: ['Action', 'Combat', 'Unarmed Strike', 'Grappled'],
    desc: `Using an Unarmed Strike, you can attempt to grapple a target within 5 feet of you that is no more than one size larger than you if you have a hand free. The target must succeed on a Strength or Dexterity saving throw (DC = 8 + your Strength modifier + your Proficiency Bonus) or have the Grappled condition.

Moving a Grappled Target: When you move, you can drag or carry the Grappled creature with you, but your Speed is halved unless the creature is Tiny or two or more sizes smaller than you.`
  },
  {
    name: 'Shove',
    category: 'actions',
    subtitle: 'Unarmed Strike Option',
    tags: ['Action', 'Combat', 'Unarmed Strike', 'Prone', 'Push'],
    desc: `Using an Unarmed Strike, you can attempt to shove a target within 5 feet of you that is no more than one size larger than you. The target must succeed on a Strength or Dexterity saving throw (DC = 8 + your Strength modifier + your Proficiency Bonus) or you either push it 5 feet away or cause it to have the Prone condition.`
  },

  // All 15 Official Conditions + Bloodied + Surprising
  {
    name: 'Blinded',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Blinded condition, you experience the following effects:
• Can't See: You can't see and automatically fail any ability check that requires sight.
• Attacks Affected: Attack rolls against you have Advantage, and your attack rolls have Disadvantage.`
  },
  {
    name: 'Charmed',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Charmed condition, you experience the following effects:
• Can't Harm the Charmer: You can't attack the charmer or target the charmer with damaging abilities or magical effects.
• Social Advantage: The charmer has Advantage on any ability check to interact with you socially.`
  },
  {
    name: 'Deafened',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Deafened condition, you experience the following effect:
• Can't Hear: You can't hear and automatically fail any ability check that requires hearing.`
  },
  {
    name: 'Exhaustion',
    category: 'rules',
    subtitle: 'Condition (Cumulative Levels 1–6)',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Exhaustion condition, you experience the following effects:
• Exhaustion Levels: This condition is cumulative. Each time you receive it, you gain 1 Exhaustion level. You die if your Exhaustion level is 6.
• D20 Tests Affected: When you make a D20 Test, the roll is reduced by 2 times your Exhaustion level.
• Speed Reduced: Your Speed is reduced by a number of feet equal to 5 times your Exhaustion level.
• Removing Exhaustion Levels: Finishing a Long Rest removes 1 of your Exhaustion levels. When your Exhaustion level reaches 0, the condition ends.`
  },
  {
    name: 'Frightened',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Frightened condition, you experience the following effects:
• Ability Checks and Attacks Affected: You have Disadvantage on ability checks and attack rolls while the source of fear is within line of sight.
• Can't Approach: You can't willingly move closer to the source of fear.`
  },
  {
    name: 'Grappled',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Grappled condition, you experience the following effects:
• Speed 0: Your Speed is 0 and can't increase.
• Attacks Affected: You have Disadvantage on attack rolls against any target other than the grappler.
• Movable: The grappler can drag or carry you when it moves, but every foot of movement costs it 1 extra foot unless you are Tiny or two or more sizes smaller than it.
• Escape: You can use your action to make a Strength (Athletics) or Dexterity (Acrobatics) check against the grapple's escape DC, ending the condition on yourself on a success. The condition also ends if the grappler has the Incapacitated condition or if the distance between you and the grappler exceeds the grapple's range.`
  },
  {
    name: 'Incapacitated',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Incapacitated condition, you experience the following effects:
• Inactive: You can't take any action, Bonus Action, or Reaction.
• No Concentration: Your Concentration is broken.
• Speechless: You can't speak.
• Surprised: If you're Incapacitated when you roll Initiative, you have Disadvantage on the roll.`
  },
  {
    name: 'Invisible',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Invisible condition, you experience the following effects:
• Surprise: If you're Invisible when you roll Initiative, you have Advantage on the roll.
• Concealed: You aren't affected by any effect that requires its target to be seen unless the effect's creator can somehow see you. Any equipment you are wearing or carrying is also concealed.
• Attacks Affected: Attack rolls against you have Disadvantage, and your attack rolls have Advantage. If a creature can somehow see you, you don't gain this benefit against that creature.`
  },
  {
    name: 'Paralyzed',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Paralyzed condition, you experience the following effects:
• Incapacitated: You have the Incapacitated condition.
• Speed 0: Your Speed is 0 and can't increase.
• Saving Throws Affected: You automatically fail Strength and Dexterity saving throws.
• Attacks Affected: Attack rolls against you have Advantage.
• Automatic Critical Hits: Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.`
  },
  {
    name: 'Petrified',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Petrified condition, you experience the following effects:
• Turned to Inanimate Substance: You are transformed, along with any nonmagical objects you are wearing and carrying, into a solid inanimate substance (usually stone). Your weight increases by a factor of ten, and you cease aging.
• Incapacitated: You have the Incapacitated condition.
• Speed 0: Your Speed is 0 and can't increase.
• Attacks Affected: Attack rolls against you have Advantage.
• Saving Throws Affected: You automatically fail Strength and Dexterity saving throws.
• Resist Damage: You have Resistance to all damage.
• Poison Immunity: You have Immunity to the Poisoned condition.`
  },
  {
    name: 'Poisoned',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Poisoned condition, you experience the following effect:
• Ability Checks and Attacks Affected: You have Disadvantage on attack rolls and ability checks.`
  },
  {
    name: 'Prone',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Prone condition, you experience the following effects:
• Restricted Movement: Your only movement options are to crawl or to spend an amount of movement equal to half your Speed (round down) to right yourself and thereby end the condition. If your Speed is 0, you can't right yourself.
• Attacks Affected: You have Disadvantage on attack rolls. An attack roll against you has Advantage if the attacker is within 5 feet of you. Otherwise, that attack roll has Disadvantage.`
  },
  {
    name: 'Restrained',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Restrained condition, you experience the following effects:
• Speed 0: Your Speed is 0 and can't increase.
• Attacks Affected: Attack rolls against you have Advantage, and your attack rolls have Disadvantage.
• Saving Throws Affected: You have Disadvantage on Dexterity saving throws.`
  },
  {
    name: 'Stunned',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Stunned condition, you experience the following effects:
• Incapacitated: You have the Incapacitated condition.
• Saving Throws Affected: You automatically fail Strength and Dexterity saving throws.
• Attacks Affected: Attack rolls against you have Advantage.`
  },
  {
    name: 'Unconscious',
    category: 'rules',
    subtitle: 'Condition',
    tags: ['Condition', 'Rules Glossary', 'Status'],
    desc: `While you have the Unconscious condition, you experience the following effects:
• Inert: You have the Incapacitated and Prone conditions, and you drop whatever you're holding. When this condition ends, you remain Prone.
• Speed 0: Your Speed is 0 and can't increase.
• Attacks Affected: Attack rolls against you have Advantage.
• Saving Throws Affected: You automatically fail Strength and Dexterity saving throws.
• Automatic Critical Hits: Any attack roll that hits you is a Critical Hit if the attacker is within 5 feet of you.
• Unaware: You're unaware of your surroundings.`
  }
];

export const SRD_RULES_GLOSSARY_AND_TOOLBOX: SrdRuleRaw[] = [
  // Core Rules Glossary Terms A-Z
  {
    name: 'Ability Check',
    category: 'rules',
    subtitle: 'Rules Glossary (D20 Test)',
    tags: ['Rules Glossary', 'D20 Test', 'Skills'],
    desc: `An ability check is a D20 Test that represents using one of the six abilities—or a specific skill associated with an ability—to overcome a challenge. Roll 1d20, add the relevant ability modifier, and add your Proficiency Bonus if proficient in a relevant skill or tool. Compare the total to the Difficulty Class (DC): Very Easy (5), Easy (10), Medium (15), Hard (20), Very Hard (25), Nearly Impossible (30).`
  },
  {
    name: 'Advantage and Disadvantage',
    category: 'rules',
    subtitle: 'Rules Glossary (D20 Test)',
    tags: ['Rules Glossary', 'D20 Test', 'Advantage', 'Disadvantage'],
    desc: `If you have Advantage on a D20 Test, roll two d20s and use the higher roll. If you have Disadvantage, roll two d20s and use the lower roll. Multiple sources of Advantage or Disadvantage don't stack, and if you have both Advantage and Disadvantage on a roll, they cancel each other out regardless of how many of each you have.`
  },
  {
    name: 'Area of Effect',
    category: 'rules',
    subtitle: 'Rules Glossary (Cone, Cube, Cylinder, Emanation, Line, Sphere)',
    tags: ['Rules Glossary', 'Spellcasting', 'Combat', 'AoE'],
    desc: `The descriptions of many spells and other features specify that they have an area of effect, which typically has one of six shapes:
• Cone: A Cone extends in a direction you choose from its point of origin, which is not included unless you decide otherwise. Its width at a given point along its length equals that point's distance from the point of origin.
• Cube: A Cube extends from a point of origin anywhere on a face of the Cubic effect. The size is the length of each side.
• Cylinder: A Cylinder's point of origin is the center of a circle of a particular radius at the top or bottom of the Cylinder.
• Emanation: An Emanation is an area of effect that extends in straight lines from a creature or object in all directions. The distance is the radius extending from the origin's space, and the origin moves with the creature or object.
• Line: A Line extends from its point of origin in a straight path up to its length and covers an area defined by its width.
• Sphere: A Sphere's point of origin is the center of the Sphere and is included in the Sphere's area.`
  },
  {
    name: 'Armor Class (AC)',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat)',
    tags: ['Rules Glossary', 'Combat', 'Armor Class'],
    desc: `An Armor Class (AC) is the target number for an attack roll against a creature or object. Without armor or a shield, a character's base AC equals 10 plus their Dexterity modifier. If you have multiple features that give you different ways to calculate your AC, you choose which one to use; only one base calculation can apply at a time.`
  },
  {
    name: 'Attitude (Friendly, Indifferent, Hostile)',
    category: 'rules',
    subtitle: 'Rules Glossary (Social Interaction)',
    tags: ['Rules Glossary', 'Social', 'Influence'],
    desc: `A monster has a starting attitude toward a player character:
• Friendly: A Friendly creature views you favorably. You have Advantage on an ability check to Influence a Friendly creature.
• Indifferent: An Indifferent creature has no desire to help or hinder you. Indifferent is the default attitude of a monster.
• Hostile: A Hostile creature views you unfavorably. You have Disadvantage on an ability check to Influence a Hostile creature.`
  },
  {
    name: 'Attunement',
    category: 'rules',
    subtitle: 'Rules Glossary (Magic Items)',
    tags: ['Rules Glossary', 'Magic Item', 'Attunement'],
    desc: `Some magic items require a creature to form a bond—called Attunement—with them before the creature can use an item's magical properties. Attuning to an item requires you to spend a Short Rest focused on only that item while being in physical contact with it (this can't be the same Short Rest used to learn the item's properties). A creature can be attuned to no more than three magic items at a time, and can't attune to more than one copy of an item.`
  },
  {
    name: 'Blindsight',
    category: 'rules',
    subtitle: 'Rules Glossary (Special Sense)',
    tags: ['Rules Glossary', 'Senses', 'Blindsight'],
    desc: `If you have Blindsight, you can see within a specific range without relying on physical sight. Within that range, you can see anything that isn't behind Total Cover even if you have the Blinded condition or are in Darkness. Moreover, in that range, you can see something that has the Invisible condition.`
  },
  {
    name: 'Bloodied',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat Status)',
    tags: ['Rules Glossary', 'Combat', 'Hit Points'],
    desc: `A creature is Bloodied while it has half its Hit Points or fewer remaining.`
  },
  {
    name: 'Bonus Action',
    category: 'rules',
    subtitle: 'Rules Glossary (Action Economy)',
    tags: ['Rules Glossary', 'Combat', 'Bonus Action'],
    desc: `A Bonus Action is a special action that you can take on the same turn that you take an action. You can't take more than one Bonus Action on a turn, and you have a Bonus Action to take only if a rule explicitly says so.`
  },
  {
    name: 'Burrow, Climb, Fly, and Swim Speeds',
    category: 'rules',
    subtitle: 'Rules Glossary (Movement)',
    tags: ['Rules Glossary', 'Movement', 'Speed', 'Swimming', 'Climbing', 'Flying'],
    desc: `• Burrow Speed: A creature that has a Burrow Speed can use that speed to move through sand, earth, mud, or ice. It can't burrow through solid rock unless it has a special trait that allows it to do so.
• Climb Speed: A Climb Speed can be used in place of Speed to traverse a vertical surface without expending the extra movement normally associated with climbing (normally 1 extra foot per foot climbed).
• Fly Speed: A Fly Speed can be used to move through the air. While you have a Fly Speed, you can stay aloft until you land, fall, or die. Flying creatures fall if they have the Prone or Incapacitated condition or their Fly Speed is reduced to 0 (unless they can hover).
• Swim Speed: A Swim Speed can be used to swim without expending the extra movement normally associated with swimming.`
  },
  {
    name: 'Carrying Capacity and Encumbrance',
    category: 'rules',
    subtitle: 'Rules Glossary (Strength)',
    tags: ['Rules Glossary', 'Strength', 'Carrying Capacity'],
    desc: `Your size and Strength score determine the maximum weight in pounds that you can carry, as well as the maximum weight in pounds that you can drag, lift, or push:
• Carrying Capacity: Strength score × 15 lb. (halved for Tiny, doubled for Large, ×4 for Huge, ×8 for Gargantuan).
• Drag, Lift, or Push: Up to twice your carrying capacity (Strength score × 30 lb.). While dragging, lifting, or pushing weight in excess of your carrying capacity, your Speed can be no more than 5 feet.`
  },
  {
    name: 'Concentration',
    category: 'rules',
    subtitle: 'Rules Glossary (Spellcasting)',
    tags: ['Rules Glossary', 'Spellcasting', 'Concentration'],
    desc: `Some spells and other effects require Concentration to remain active, as specified in their descriptions. If the effect's creator loses Concentration, the effect ends. The following factors break Concentration:
• Another Concentration Effect: You lose Concentration on an effect the moment you start casting a spell that requires Concentration or activate another effect that requires Concentration.
• Damage: If you take damage, you must succeed on a Constitution saving throw to maintain Concentration. The DC equals 10 or half the damage taken (round down), whichever number is higher, up to a maximum DC of 30.
• Incapacitated or Dead: Your Concentration ends if you have the Incapacitated condition or you die.`
  },
  {
    name: 'Cover (Half, Three-Quarters, Total)',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat)',
    tags: ['Rules Glossary', 'Combat', 'Cover'],
    desc: `Walls, trees, creatures, and other obstacles can provide cover during combat, making a target more difficult to harm. If a target can benefit from more than one degree of cover, only the most protective degree applies:
• Half Cover: +2 bonus to AC and Dexterity saving throws (obstacle blocks at least half of the target).
• Three-Quarters Cover: +5 bonus to AC and Dexterity saving throws (obstacle blocks at least three-quarters of the target).
• Total Cover: Can't be targeted directly by an attack or a spell, although some spells can reach such a target by including it in an area of effect.`
  },
  {
    name: 'Critical Hit',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat)',
    tags: ['Rules Glossary', 'Combat', 'Attack Roll'],
    desc: `When you score a Critical Hit (such as rolling a 20 on the d20 for an attack roll), you deal extra damage. Roll all of the attack's damage dice twice and add them together, then add any relevant modifiers. Only the attack's damage dice are rolled twice, not static modifiers.`
  },
  {
    name: 'Damage Types, Resistance, Vulnerability, and Immunity',
    category: 'rules',
    subtitle: 'Rules Glossary (Damage)',
    tags: ['Rules Glossary', 'Combat', 'Damage Types', 'Resistance', 'Vulnerability', 'Immunity'],
    desc: `The 13 Damage Types in D&D:
• Acid (corrosive liquids, digestive enzymes)
• Bludgeoning (blunt objects, constriction, falling)
• Cold (subzero temperatures, icy blasts)
• Fire (flames, searing heat)
• Force (pure magical energy)
• Lightning (electrical current)
• Necrotic (life-draining energy)
• Piercing (fangs, spears, arrows)
• Poison (toxic venom and gases)
• Psychic (mind-rending mental energy)
• Radiant (searing solar or divine light)
• Slashing (claws, swords, axes)
• Thunder (concussive sound waves)

Order of Application: Modifiers to damage are applied in the following order: (1) adjustments such as reductions, (2) Resistance (halve the damage, round down), and (3) Vulnerability (double the damage). Multiple instances of Resistance or Vulnerability to the same damage type count as only one instance. Immunity reduces damage of that type to 0.`
  },
  {
    name: 'Darkness, Bright Light, Dim Light, and Obscurement',
    category: 'rules',
    subtitle: 'Rules Glossary (Vision and Light)',
    tags: ['Rules Glossary', 'Exploration', 'Vision', 'Obscured'],
    desc: `• Bright Light: Lets most creatures see normally.
• Dim Light (Shadows): Creates a Lightly Obscured area. An area of twilight, dawn, or a moderately bright moon is Dim Light.
• Darkness: Creates a Heavily Obscured area. Characters face Darkness outdoors at night, within an unlit dungeon, or in an area of magical Darkness.
• Lightly Obscured: You have Disadvantage on Wisdom (Perception) checks that rely on sight to see something in a Lightly Obscured space (Dim Light, patchy fog, moderate foliage).
• Heavily Obscured: You have the Blinded condition when trying to see something in a Heavily Obscured space (Darkness, opaque fog, dense foliage).`
  },
  {
    name: 'Darkvision',
    category: 'rules',
    subtitle: 'Rules Glossary (Special Sense)',
    tags: ['Rules Glossary', 'Senses', 'Darkvision'],
    desc: `If you have Darkvision, you can see in Dim Light within a specified range as if it were Bright Light and in Darkness within that range as if it were Dim Light. You discern colors in that Darkness only as shades of gray.`
  },
  {
    name: 'Death Saving Throws and Stabilizing',
    category: 'rules',
    subtitle: 'Rules Glossary (Damage and Healing)',
    tags: ['Rules Glossary', 'Combat', 'Death Saving Throw', 'Healing'],
    desc: `Whenever you start your turn with 0 Hit Points, you must make a Death Saving Throw (a special saving throw not tied to any ability score):
• Roll 1d20: If the roll is 10 or higher, you succeed. Otherwise, you fail. On your third success, you become Stable. On your third failure, you die.
• Rolling 1 or 20: Rolling a 1 counts as two failures. Rolling a 20 causes you to regain 1 Hit Point.
• Damage at 0 Hit Points: If you take any damage while you have 0 Hit Points, you suffer a Death Saving Throw failure. If the damage is from a Critical Hit, you suffer two failures instead. If the damage equals or exceeds your Hit Point maximum, you die.
• Stabilizing a Creature: You can take the Help action to try to stabilize a creature with 0 Hit Points within 5 feet of you, making a DC 10 Wisdom (Medicine) check. A Stable creature doesn't make Death Saving Throws even though it has 0 Hit Points, and regains 1 HP after 1d4 hours.`
  },
  {
    name: 'Difficult Terrain',
    category: 'rules',
    subtitle: 'Rules Glossary (Movement)',
    tags: ['Rules Glossary', 'Movement', 'Difficult Terrain'],
    desc: `If a space is Difficult Terrain, every foot of movement in that space costs 1 extra foot. For example, moving 5 feet through Difficult Terrain costs 10 feet of movement. Difficult Terrain isn't cumulative; a space is either Difficult Terrain or it isn't. A space is Difficult Terrain if it contains another creature (that isn't Tiny or your ally—actually even another creature's space is Difficult Terrain), low furniture, rubble, undergrowth, steep stairs, snow, or shallow bogs.`
  },
  {
    name: 'Falling and Dehydration / Malnutrition / Suffocation',
    category: 'rules',
    subtitle: 'Rules Glossary (Hazards)',
    tags: ['Rules Glossary', 'Hazard', 'Falling', 'Suffocation', 'Dehydration', 'Malnutrition'],
    desc: `• Falling: A creature that falls takes 1d6 Bludgeoning damage at the end of the fall for every 10 feet it fell, to a maximum of 20d6. When the creature lands, it has the Prone condition unless it avoids taking any damage from the fall. A creature that falls into water can use its Reaction to make a DC 15 Strength (Athletics) or Dexterity (Acrobatics) check to hit the water head or feet first, taking half damage on a success.
• Suffocation: A creature can hold its breath for a number of minutes equal to 1 + its Constitution modifier (minimum 30 seconds). When a creature runs out of breath or is choking, it gains 1 Exhaustion level at the end of each of its turns. When a creature can breathe again, it removes all levels of Exhaustion it gained from suffocating.
• Dehydration: A creature requires a certain amount of water per day based on its size (Tiny 1/4 gal, Small/Medium 1 gal, Large 4 gal, Huge 16 gal, Gargantuan 64 gal). Drinking less than half requires a DC 15 Constitution save at day's end or 1 Exhaustion level; drinking nothing automatically gives 1 Exhaustion level.
• Malnutrition: A creature needs a pound of food per day (Small/Medium 1 lb., Large 4 lb., Huge 16 lb., Gargantuan 64 lb.). Eating less than half requires a DC 10 Constitution save each day or 1 Exhaustion level; after 5 days without food, a creature automatically gains 1 Exhaustion level per day.`
  },
  {
    name: 'Heroic Inspiration',
    category: 'rules',
    subtitle: 'Rules Glossary (D20 Test)',
    tags: ['Rules Glossary', 'Heroic Inspiration', 'Reroll'],
    desc: `If you (a player character) have Heroic Inspiration, you can expend it to reroll any die immediately after rolling it, and you must use the new roll. Only one Heroic Inspiration can be possessed at a time. If you gain Heroic Inspiration while you already have it, you can give it to a player character in your group who lacks it.`
  },
  {
    name: 'High Jump and Long Jump',
    category: 'rules',
    subtitle: 'Rules Glossary (Movement)',
    tags: ['Rules Glossary', 'Movement', 'Jumping'],
    desc: `• Long Jump: When you make a Long Jump, you leap horizontally a number of feet up to your Strength score if you move at least 10 feet immediately before the jump. When you make a standing Long Jump, you can leap only half that distance. Either way, each foot you jump costs a foot of movement.
• High Jump: When you make a High Jump, you leap into the air a number of feet equal to 3 plus your Strength modifier (minimum of 0 feet) if you move at least 10 feet on foot immediately before the jump. When you make a standing High Jump, you can jump only half that distance. You can extend your arms half your height above yourself during the jump.`
  },
  {
    name: 'Improvised Weapons and Objects',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat & Breaking Objects)',
    tags: ['Rules Glossary', 'Combat', 'Improvised Weapon', 'Objects'],
    desc: `• Improvised Weapons: If you use an object—such as a table leg, frying pan, or bottle—to make a weapon attack, you don't add your Proficiency Bonus unless it closely resembles a weapon you're proficient with. An improvised weapon deals 1d4 damage of a type appropriate to the object and has a thrown range of 20/60 ft.
• Breaking Objects: Objects are immune to Poison and Psychic damage. Object AC by substance: Cloth/Paper/Rope (11), Crystal/Glass/Ice (13), Wood/Bone (15), Stone (17), Iron/Steel (19), Mithral (21), Adamantine (23). Object Hit Points by Size (Fragile / Resilient): Tiny (2 [1d4] / 5 [2d4]), Small (3 [1d6] / 10 [3d6]), Medium (4 [1d8] / 18 [4d8]), Large (5 [1d10] / 27 [5d10]).`
  },
  {
    name: 'Initiative and Surprise',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat)',
    tags: ['Rules Glossary', 'Combat', 'Initiative', 'Surprise'],
    desc: `• Initiative: Initiative determines the order of turns during combat. When combat starts, every participant makes a Dexterity check to determine their place in the Initiative order.
• Surprise: If a combatant is surprised by combat starting, that combatant has Disadvantage on their Initiative roll.`
  },
  {
    name: 'Mounted Combat and Underwater Combat',
    category: 'rules',
    subtitle: 'Rules Glossary (Combat Rules)',
    tags: ['Rules Glossary', 'Combat', 'Mounted Combat', 'Underwater Combat'],
    desc: `• Mounted Combat: A willing creature at least one size larger than you with appropriate anatomy can serve as a mount. Mounting or dismounting costs movement equal to half your Speed. A controlled mount shares your Initiative and can take only the Dash, Disengage, or Dodge action. An independent mount retains its place in Initiative and acts on its own.
• Underwater Combat: While underwater, weapon attacks with melee weapons have Disadvantage unless the attacker has a Swim Speed or the weapon deals Piercing damage. Ranged weapon attacks automatically miss beyond normal range, and have Disadvantage within normal range unless using a crossbow, net, or thrown weapon like a javelin, spear, trident, or dart. Creatures and objects fully immersed in water have Resistance to Fire damage.`
  },
  {
    name: 'Proficiency Bonus',
    category: 'rules',
    subtitle: 'Rules Glossary (Character Progression)',
    tags: ['Rules Glossary', 'Proficiency'],
    desc: `Your Proficiency Bonus is determined by total character level (or monster CR):
• Levels 1–4 (CR 0–4): +2
• Levels 5–8 (CR 5–8): +3
• Levels 9–12 (CR 9–12): +4
• Levels 13–16 (CR 13–16): +5
• Levels 17–20 (CR 17–20): +6
• CR 21–24: +7 | CR 25–28: +8 | CR 29–30: +9

Your Proficiency Bonus can't be added to a die roll or other number more than once (except when multiplied by a feature such as Expertise).`
  },
  {
    name: 'Short Rest and Long Rest',
    category: 'rules',
    subtitle: 'Rules Glossary (Resting)',
    tags: ['Rules Glossary', 'Resting', 'Short Rest', 'Long Rest', 'Hit Point Dice'],
    desc: `• Short Rest: A 1-hour period of downtime during which a creature does nothing more strenuous than reading, talking, eating, or standing watch. At the end of the rest, you can spend one or more Hit Point Dice to regain Hit Points (roll the die + Constitution modifier per die spent).
• Long Rest: A period of extended downtime—at least 8 hours—available to any creature (at most 2 hours of watch/light activity, at least 1 hour of sleep/meditation). At the end of a Long Rest, you regain all lost Hit Points and all spent Hit Point Dice, your Exhaustion level is reduced by 1, and ability scores reduced by effects are restored. If a Long Rest is interrupted by combat or 1 hour of walking, it can be resumed by adding 1 hour per interruption.`
  },
  {
    name: 'Spellcasting Rules (Components, Slots, Rituals, Schools)',
    category: 'rules',
    subtitle: 'Chapter 7: Spells',
    tags: ['Rules', 'Spellcasting', 'Ritual', 'Schools of Magic'],
    desc: `• Spell Level (0–9): Cantrips (level 0) don't expend spell slots. Levels 1–9 require expending a spell slot of the spell's level or higher.
• One Spell with a Spell Slot per Turn: On a turn, you can expend only one spell slot to cast a spell. This rule means you can't, for example, cast a spell with a spell slot using the Magic action and another one using a Bonus Action on the same turn.
• Rituals: If a spell has the Ritual tag and you have it prepared, you can cast it without expending a spell slot by adding 10 minutes to its casting time.
• Components: Verbal (V, spoken incantation; impossible while gagged or in Silence), Somatic (S, requires 1 free hand or hand holding a focus), Material (M, requires component pouch, spellcasting focus, or specified costly/consumed component).
• Eight Schools of Magic: Abjuration (protective), Conjuration (transportation/creation), Divination (revelation), Enchantment (mind-influencing), Evocation (elemental energy), Illusion (deception), Necromancy (life and death), Transmutation (transformation).`
  },
  {
    name: 'Telepathy, Tremorsense, and Truesight',
    category: 'rules',
    subtitle: 'Rules Glossary (Special Senses)',
    tags: ['Rules Glossary', 'Senses', 'Telepathy', 'Tremorsense', 'Truesight'],
    desc: `• Telepathy: A magical ability that allows a creature to communicate mentally with another creature within a specified range. The contacted creature doesn't need to share a language with the telepath to understand this communication, but must be able to understand at least one language or be telepathic itself.
• Tremorsense: A creature with Tremorsense can pinpoint the location of creatures and moving objects within a specific range, provided that the creature with Tremorsense and anything it is detecting are both in contact with the same surface (such as the ground, a wall, or a ceiling) or the same liquid. It can't detect creatures or objects in the air, and doesn't count as a form of sight.
• Truesight: If you have Truesight, your vision is enhanced within a specified range. Within that range, your vision pierces through the following: Darkness (normal and magical), Invisibility, Visual Illusions (automatically detect them and succeed on saves against them), Transformations (discern the true form of any shapechanger or creature transformed by magic), and the Ethereal Plane.`
  },
  {
    name: 'Teleportation',
    category: 'rules',
    subtitle: 'Rules Glossary (Movement)',
    tags: ['Rules Glossary', 'Teleportation', 'Spellcasting'],
    desc: `Teleportation is a special kind of magical transportation. If you teleport, you disappear and reappear elsewhere instantly, without moving through the intervening space. This transportation doesn't expend any of your movement, and it doesn't provoke Opportunity Attacks.`
  },
  {
    name: 'Temporary Hit Points',
    category: 'rules',
    subtitle: 'Rules Glossary (Damage and Healing)',
    tags: ['Rules Glossary', 'Combat', 'Temporary Hit Points'],
    desc: `Temporary Hit Points are granted by certain effects and act as a buffer against losing real Hit Points. They are lost first when you take damage, can't be restored by healing, and don't stack: if you have Temporary Hit Points and receive more of them, you decide whether to keep the ones you have or to gain the new ones. Unless a feature says otherwise, Temporary Hit Points last until you finish a Long Rest.`
  },

  // Character Creation Tables: Alignments, Languages, Lifestyles, Multiclassing, XP
  {
    name: 'Alignment (The Nine Alignments)',
    category: 'rules',
    subtitle: 'Character Creation Rule',
    tags: ['Rules', 'Alignment', 'Roleplay'],
    desc: `A creature's alignment broadly describes its ethical attitudes and ideals, combining morality (Good, Evil, Neutral) and attitudes toward society and order (Lawful, Chaotic, Neutral):
• Lawful Good (LG): Methodical, compassionate, honorable.
• Neutral Good (NG): Altruistic, helpful without bias toward or against order.
• Chaotic Good (CG): Rebels who follow their own conscience and value freedom and kindness.
• Lawful Neutral (LN): Act in accordance with law, tradition, or personal codes.
• Neutral (N): Prefer to steer clear of moral questions and don't take sides.
• Chaotic Neutral (CN): Follow their whims, holding personal freedom above all else.
• Lawful Evil (LE): Methodically take what they want within the limits of a code of tradition, loyalty, or order.
• Neutral Evil (NE): Do whatever they can get away with, without compassion or qualms.
• Chaotic Evil (CE): Act with arbitrary violence, spurred by greed, hatred, or bloodlust.`
  },
  {
    name: 'Languages (Standard and Rare)',
    category: 'rules',
    subtitle: 'Character Creation Rule',
    tags: ['Rules', 'Languages', 'Exploration'],
    desc: `Your character knows Common plus two other languages chosen from the Standard Languages table (or Rare Languages with GM permission):
• Standard Languages: Common, Common Sign Language, Draconic, Dwarvish, Elvish, Giant, Gnomish, Goblin, Halfling, Orc.
• Rare Languages: Abyssal, Celestial, Deep Speech, Druidic (Druids only), Infernal, Primordial (includes Aquan, Auran, Ignan, and Terran dialects), Sylvan, Thieves' Cant (Rogues only), Undercommon.`
  },
  {
    name: 'Lifestyle Expenses and Food, Drink, and Lodging',
    category: 'rules',
    subtitle: 'Equipment & Economy Rule',
    tags: ['Rules', 'Economy', 'Lifestyle', 'Services'],
    desc: `Lifestyle Expenses per Day:
• Wretched (Free): You live in inhumane conditions on the streets or in the wilderness.
• Squalid (1 SP/day): Leaky stable, mud-floored hut outside town.
• Poor (2 SP/day): Shared room in a boarding house or common room above a tavern.
• Modest (1 GP/day): Clean room in a boarding house or inn; keeps equipment maintained.
• Comfortable (2 GP/day): Private room in a fine inn or small cottage; nice clothes.
• Wealthy (4 GP/day): Luxury suite, servants, high society connections.
• Aristocratic (10 GP/day minimum): Palatial estate or finest suite, invitations to elite gatherings.

Hirelings: Skilled Hireling (2 GP/day), Untrained Hireling (2 SP/day), Messenger (2 CP/mile), Coach Cab (3 CP/mile between towns, 1 CP in city), Ship's Passage (1 SP/mile).`
  },
  {
    name: 'Level Advancement and Multiclassing',
    category: 'rules',
    subtitle: 'Character Creation & Progression',
    tags: ['Rules', 'Leveling', 'XP', 'Multiclassing'],
    desc: `Experience Point Thresholds by Character Level:
• Lvl 1: 0 XP (+2 PB) | Lvl 2: 300 XP | Lvl 3: 900 XP | Lvl 4: 2,700 XP
• Lvl 5: 6,500 XP (+3 PB) | Lvl 6: 14,000 XP | Lvl 7: 23,000 XP | Lvl 8: 34,000 XP
• Lvl 9: 48,000 XP (+4 PB) | Lvl 10: 64,000 XP | Lvl 11: 85,000 XP | Lvl 12: 100,000 XP
• Lvl 13: 120,000 XP (+5 PB) | Lvl 14: 140,000 XP | Lvl 15: 165,000 XP | Lvl 16: 195,000 XP
• Lvl 17: 225,000 XP (+6 PB) | Lvl 18: 265,000 XP | Lvl 19: 305,000 XP | Lvl 20: 355,000 XP

Multiclassing Prerequisites: Must have a score of 13 or higher in the primary ability of both your current class and your new class (Paladin requires STR 13 & CHA 13; Monk and Ranger require DEX 13 & WIS 13; Fighter requires STR 13 or DEX 13). Spell slots when multiclassing combine full casters (Bard, Cleric, Druid, Sorcerer, Wizard) + half of Paladin/Ranger levels (rounded up) + one-third of Eldritch Knight/Arcane Trickster levels.`
  },

  // Gameplay Toolbox: Curses, Diseases, Environmental Effects, Fear & Mental Stress, Hazards, Poisons, Traps
  {
    name: 'Curses and Magical Contagions (Diseases)',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Curses & Contagions)',
    tags: ['Rules', 'Gameplay Toolbox', 'Curse', 'Disease', 'Contagion'],
    desc: `Curses:
• Bestow Curse / Cursed Magic Items: Ended by Remove Curse or Greater Restoration.
• Demonic Possession: A creature possessed by a Fiend can be freed by Dispel Evil and Good or reducing the host to 0 HP.

Sample Magical Contagions (Diseases):
• Cackle Fever: Spreads via inhalation within 10 ft of an infected creature (DC 13 CON save). Symptoms: gains 1 Exhaustion level and when taking damage makes a DC 13 CON save or takes 5 (1d10) Psychic damage and becomes Incapacitated with manic laughter for 1 minute.
• Sewer Plague: Spreads via bites from rats/otyughs or contact with filth (DC 11 CON save). Incubates 1d4 days; gives 1 Exhaustion level and halves Hit Point regain from spending Hit Point Dice during Short Rests.
• Sight Rot: Spreads via contaminated water/blood (DC 15 CON save). Applies the Blinded condition after 24 hours until cured by Lesser Restoration, Heal, or Eyebright ointment.`
  },
  {
    name: 'Environmental Effects (Cold, Heat, Altitude, Ice, Fog, Wind)',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Exploration Hazards)',
    tags: ['Rules', 'Gameplay Toolbox', 'Environment', 'Weather'],
    desc: `• Deep Water: Swimming in deep water (>100 ft) requires a DC 10 CON save after each hour or gain 1 Exhaustion level due to water pressure and frigid cold.
• Extreme Cold (0°F or lower): Exposed creatures make a DC 10 Constitution save at the end of each hour or gain 1 Exhaustion level. Creatures with Cold Resistance/Immunity or cold-weather gear automatically succeed.
• Extreme Heat (100°F or higher): Exposed creatures without water make a Constitution save at the end of each hour (DC 5 for first hour, +1 per additional hour) or gain 1 Exhaustion level. Creatures wearing Medium or Heavy armor have Disadvantage.
• Frigid Water: A creature can be immersed in frigid water for a number of minutes equal to its CON score before making a DC 10 CON save each minute or gaining 1 Exhaustion level.
• Heavy Precipitation: Everything within heavy rain or snowfall is Lightly Obscured, and creatures have Disadvantage on Wisdom (Perception) checks relying on hearing or sight. Heavy rain also extinguishes open flames.
• High Altitude (10,000+ ft): Each hour spent traveling at high altitude counts as 2 hours for determining Exhaustion from forced march until acclimated over 30 days.
• Slippery Ice: Difficult Terrain. When a creature moves onto slippery ice for the first time on a turn, it must succeed on a DC 10 Dexterity (Acrobatics) check or have the Prone condition.
• Strong Wind: Imposes Disadvantage on ranged weapon attack rolls and Wisdom (Perception) checks that rely on hearing. Extinguishes open flames, disperses fog, and forces flying creatures to land at the end of their turn or fall.
• Thin Ice: Weight tolerance of 3d10 × 10 lb. per 10-foot-square section; breaking through plunges creatures into Frigid Water.`
  },
  {
    name: 'Fear and Mental Stress',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Sanity & Stress)',
    tags: ['Rules', 'Gameplay Toolbox', 'Fear', 'Mental Stress'],
    desc: `• Fear Effects: When characters encounter something supernaturally terrifying, the GM can call for a Wisdom saving throw (typical DC 10–20). On a failed save, a character has the Frightened condition for 1 minute (repeating the save at the end of each turn).
• Mental Stress Effects: Prolonged exposure to psychic trauma, the Far Realm, or cosmic horror can require a Wisdom or Charisma saving throw. Short-term stress (1d10 minutes) can cause Stunned, Frightened, or babbling incoherently; long-term stress (1d10 × 10 hours) imposes Disadvantage on ability checks of a chosen ability; indefinite stress grants a lasting flaw curable by Calm Emotions, Lesser Restoration, or Greater Restoration.`
  },
  {
    name: 'Hazards (Brown Mold, Fireball Fungus, Green Slime, Webs, Yellow Mold, Lava, Quicksand)',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Dungeon & Wilderness Hazards)',
    tags: ['Rules', 'Gameplay Toolbox', 'Hazard', 'Dungeon'],
    desc: `• Brown Mold: Patch of mold that absorbs heat within 30 ft. Any creature starting its turn within 5 ft makes a DC 12 CON save, taking 22 (4d10) Cold damage on a failed save or half on a success. Immune to Fire (which causes it to expand); destroyed instantly by any Cold damage.
• Fireball Fungus: Explodes when taking any damage or touched, creating a 20-ft-radius Sphere (DC 13 DEX save, 14 [4d6] Fire damage on a failure or half on a success).
• Green Slime: Drops on creatures from ceilings (DC 10 DEX save). Deals 5 (1d10) Acid damage on contact and at the start of each of the target's turns (deals 11 [2d10] Acid damage to wood or metal). Destroyed by sunlight, Lesser Restoration, or Cold, Fire, or Radiant damage.
• Inferno / Lava: Stepping into lava deals 35 (10d6) Fire damage, and full submersion deals 99 (18d10) Fire damage per turn.
• Poisonous Gas: Creates a Lightly Obscured cloud; creatures starting their turn inside make a DC 12 CON save or take 10 (3d6) Poison damage and have the Poisoned condition.
• Quicksand: 10-ft square patch, 10 ft deep. Creature entering sinks 1d4+1 ft and has the Restrained condition. Escaping requires a Strength (Athletics) check (DC = 10 + feet sunk).
• Razorvine: 10-ft section (AC 11, 25 HP, Vulnerable to Fire, Immune to Bludgeoning/Piercing/Psychic). Touching it deals 5 (1d10) Slashing damage.
• Rockslide: Creatures in path make a DC 15 DEX save, taking 35 (10d6) Bludgeoning damage and having the Prone and Restrained conditions on a failure.
• Vicious Vine: Entangles creatures within 10 ft (DC 13 STR save or Grappled and Restrained).
• Webs (Giant Spider Webs): Difficult Terrain and Lightly Obscured. Entering requires a DC 12 DEX save or Restrained (escape DC 12 STR Athletics). A 10-ft cube of webs has AC 10, 15 HP, Vulnerability to Fire, and Immunity to Bludgeoning, Poison, and Psychic.
• Yellow Mold: Touching it releases a 10-ft Cube of spores (DC 15 CON save or take 11 [2d10] Poison damage and have the Poisoned condition for 1 minute, taking 5 [1d10] Poison damage at the start of each turn). Destroyed by sunlight or Fire damage.`
  },
  {
    name: 'Poisons (Assassin\'s Blood, Burnt Othur, Crawler Mucus, Drow Poison, Essence of Ether, Malice, Midnight Tears, Pale Tincture, Purple Worm Poison, Serpent Venom, Torpor, Truth Serum, Wyvern Poison)',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Complete SRD Poisons Reference)',
    tags: ['Rules', 'Gameplay Toolbox', 'Poison', 'Item'],
    desc: `Poisons are categorized by application type: Contact (skin touch), Ingested (swallowed), Inhaled (5-ft Cube gas, doesn't affect creatures holding breath), and Injury (applied to weapon/ammunition using Bonus Action; dries after 1 minute or after hitting).

Complete SRD Poisons Catalog:
• Assassin's Blood (Ingested, 150 GP): DC 10 CON save. Failure: 6 (1d12) Poison damage and Poisoned for 24 hours. Success: half damage only.
• Burnt Othur Fumes (Inhaled, 500 GP): DC 13 CON save. Failure: 10 (3d6) Poison damage, and repeats save at start of each turn (taking 3 [1d6] Poison damage on each failure until 3 successes).
• Crawler Mucus (Contact, 200 GP): DC 13 CON save. Failure: Poisoned for 1 minute; while Poisoned this way, also Paralyzed (repeat save at end of each turn).
• Drow Poison (Injury, 200 GP): DC 13 CON save. Failure: Poisoned for 1 hour; if failed by 5 or more, also Unconscious while Poisoned (wakes if damaged or shaken as an action).
• Essence of Ether (Inhaled, 300 GP): DC 15 CON save. Failure: Poisoned for 8 hours and Unconscious while Poisoned (wakes if damaged or shaken).
• Malice (Inhaled, 250 GP): DC 15 CON save. Failure: Poisoned for 1 hour and Blinded while Poisoned.
• Midnight Tears (Ingested, 1,500 GP): Takes effect at midnight. DC 17 CON save. Failure: 31 (9d6) Poison damage. Success: half damage.
• Oil of Taggit (Contact, 400 GP): DC 13 CON save. Failure: Poisoned for 24 hours and Unconscious while Poisoned (wakes if damaged).
• Pale Tincture (Ingested, 250 GP): DC 16 CON save. Failure: 3 (1d6) Poison damage and Poisoned. Repeats save every 24 hours (3 [1d6] Poison damage on failure; ends after 7 successes).Cannot heal Poison damage while Poisoned.
• Purple Worm Poison (Injury, 2,000 GP): DC 21 CON save. Failure: 35 (10d6) Poison damage. Success: half damage.
• Serpent Venom (Injury, 200 GP): DC 11 CON save. Failure: 10 (3d6) Poison damage. Success: half damage.
• Torpor (Ingested, 600 GP): DC 15 CON save. Failure: Poisoned for 4d6 hours and Incapacitated while Poisoned.
• Truth Serum (Ingested, 150 GP): DC 11 CON save. Failure: Poisoned for 1 hour and can't knowingly speak a lie, as if under Zone of Truth.
• Wyvern Poison (Injury, 1,200 GP): DC 14 CON save. Failure: 24 (7d6) Poison damage. Success: half damage.`
  },
  {
    name: 'Traps (Collapsing Roof, Falling Net, Fire-Casting Statue, Hidden Pit, Poisoned Darts, Poisoned Needle, Rolling Sphere, Spiked Pit)',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Complete SRD Traps Reference)',
    tags: ['Rules', 'Gameplay Toolbox', 'Trap', 'Dungeon'],
    desc: `Complete SRD Traps Catalog:
• Collapsing Roof (Nuisance/Deadly): Trip wire (DC 11 Perception to spot, DC 11 Thieve's Tools to disarm). Triggering causes ceiling collapse in a 10-ft square: DC 13 DEX save or take 11 (2d10) Bludgeoning damage (or 22 [4d10] at higher levels) and knocked Prone under rubble.
• Falling Net (Nuisance): Trip wire (DC 10 Perception). 10-ft square net falls: DC 10 DEX save or Restrained (DC 10 STR Athletics check to escape or deal 5 Slashing damage to AC 10 net).
• Fire-Casting Statue (Deadly): Pressure plate (DC 15 Perception, DC 15 Thieves' Tools) or Arcane Study (DC 15 Arcana). Breathes a 15-ft Cone or 30-ft Line of fire: DC 13 DEX save, 11 (2d10) Fire damage (or 22 [4d10] / 55 [10d10] at higher levels).
• Hidden Pit (Nuisance/Deadly): Concealed trapdoor (DC 15 Perception). Creature falls 10–60 ft into pit, taking 3 (1d6) to 21 (6d6) Bludgeoning damage.
• Poisoned Darts (Deadly): Pressure plate (DC 15 Perception, DC 15 Thieves' Tools). Fires 1d4 darts (+8 to hit, or DC 15 DEX save): 2 (1d4) Piercing + 11 (2d10) Poison damage.
• Poisoned Needle (Nuisance/Deadly): Hidden in a lock (DC 15 Investigation, DC 15 Thieves' Tools). Pricks creature opening lock without the key: 1 Piercing + 11 (2d10) Poison damage and Poisoned for 1 hour (DC 15 CON save negates poison).
• Rolling Sphere (Deadly): Pressure plate releases a 10-ft-diameter stone sphere (Initiative +8, moves 60 ft per turn down corridor). Creatures in path make a DC 15 DEX save or take 55 (10d10) Bludgeoning damage and are knocked Prone.
• Spiked Pit (Deadly): Hidden pit with sharpened iron or wooden spikes at the bottom. Deals falling damage + 11 (2d10) Piercing damage.`
  },
  {
    name: 'Planes of Existence (Cosmology & Planar Travel)',
    category: 'rules',
    subtitle: 'Cosmology & Multiverse Reference',
    tags: ['Rules', 'Planes of Existence', 'Cosmology', 'Multiverse'],
    desc: `The Great Wheel Cosmology of the SRD Multiverse:
• Material Plane: The nexus where philosophical and elemental forces collide to create mortal worlds.
• Echo Planes (Feywild and Shadowfell): Parallel reflections of the Material Plane. The Feywild (Plane of Faerie) is a realm of twilight, overgrown nature, and intense emotion ruled by Archfey. The Shadowfell (Plane of Shadow) is a bleak, monochrome realm of decay, despair, and Undead.
• Transitive Planes: The Ethereal Plane (Border Ethereal overlaps the Material and Inner Planes; Deep Ethereal connects them via curtains of vaporous color) and the Astral Plane (silvery void of thought and dream connecting the Material Plane to the Outer Planes via color pools).
• Inner Planes (Elemental Planes): Plane of Air, Plane of Earth, Plane of Fire, Plane of Water, bordered by Para-Elemental realms (Ice, Magma, Ooze, Ash) and surrounded by the Elemental Chaos.
• Outer Planes: Mount Celestia (LG), Bytopia (LG/NG), Elysium (NG), Beastlands (NG/CG), Arborea (CG), Ysgard (CG/CN), Limbo (CN), Pandemonium (CN/CE), The Abyss (CE, infinite layers of Demons), Carceri (CE/NE), Hades (NE), Gehenna (NE/LE), The Nine Hells of Baator (LE, ruled by Archdevils), Acheron (LE/LN), Mechanus (LN, realm of Modrons and absolute order), Arcadia (LN/LG), and the Outlands (Neutral hub with Sigil at its spire).
• Positive and Negative Planes: Envelop the cosmology, providing radiant life energy and necrotic entropy.
• Far Realm: An alien dimension outside the known multiverse inhabited by Aberrations.`
  },
  {
    name: 'Combat Encounters and XP Budgets',
    category: 'rules',
    subtitle: 'Gameplay Toolbox (Building Combat Encounters)',
    tags: ['Rules', 'Gameplay Toolbox', 'Combat', 'Encounter Building', 'XP'],
    desc: `Building Combat Encounters by XP Budget per Character:
• Level 1: Low 50 XP | Moderate 75 XP | High 100 XP
• Level 2: Low 100 XP | Moderate 150 XP | High 200 XP
• Level 3: Low 150 XP | Moderate 225 XP | High 400 XP
• Level 4: Low 250 XP | Moderate 375 XP | High 500 XP
• Level 5: Low 500 XP | Moderate 750 XP | High 1,100 XP
• Level 6: Low 600 XP | Moderate 1,000 XP | High 1,400 XP
• Level 7: Low 750 XP | Moderate 1,300 XP | High 1,700 XP
• Level 8: Low 1,000 XP | Moderate 1,700 XP | High 2,100 XP
• Level 9: Low 1,300 XP | Moderate 2,000 XP | High 2,600 XP
• Level 10: Low 1,600 XP | Moderate 2,300 XP | High 3,100 XP
• Level 11: Low 1,900 XP | Moderate 2,900 XP | High 4,100 XP
• Level 12: Low 2,200 XP | Moderate 3,700 XP | High 4,700 XP
• Level 13: Low 2,600 XP | Moderate 4,200 XP | High 5,400 XP
• Level 14: Low 2,900 XP | Moderate 4,900 XP | High 6,200 XP
• Level 15: Low 3,300 XP | Moderate 5,400 XP | High 7,800 XP
• Level 16: Low 3,800 XP | Moderate 6,100 XP | High 9,800 XP
• Level 17: Low 4,500 XP | Moderate 7,200 XP | High 11,700 XP
• Level 18: Low 5,000 XP | Moderate 8,700 XP | High 14,200 XP
• Level 19: Low 5,500 XP | Moderate 10,700 XP | High 17,200 XP
• Level 20: Low 6,400 XP | Moderate 13,200 XP | High 22,000 XP`
  },
  {
    name: 'Travel Pace, Exploration, and Vision Ranges',
    category: 'rules',
    subtitle: 'Exploration & Travel Rules',
    tags: ['Rules', 'Exploration', 'Travel Pace'],
    desc: `Travel Pace:
• Fast Pace: 400 feet/minute | 4 miles/hour | 30 miles/day. Imposes Disadvantage on Wisdom (Perception or Survival) and Dexterity (Stealth) checks.
• Normal Pace: 300 feet/minute | 3 miles/hour | 24 miles/day.
• Slow Pace: 200 feet/minute | 2 miles/hour | 18 miles/day. Grants Advantage on Wisdom (Perception or Survival) checks, and allows using Stealth while traveling.

Forced March: Traveling past 8 hours in a day requires each character to make a Constitution saving throw at the end of each extra hour (DC = 10 + 1 for each hour past 8 hours) or gain 1 Exhaustion level.
Audible Distance: Trying to be quiet (2d6 × 5 ft), Normal noise level (2d6 × 10 ft), Very loud (2d6 × 50 ft).
Visibility Outdoors: Clear day 2 miles (40 miles from a mountaintop); Rain 1 mile; Fog 100 to 300 feet.`
  },

  // Also include individual entries for each Poison, Trap, Hazard, and Contagion so random checks on ANY individual poison/trap/hazard/disease name succeed!
  { name: "Assassin's Blood", category: 'rules', subtitle: 'Ingested Poison (150 GP)', tags: ['Poison', 'Ingested', 'Gameplay Toolbox'], desc: 'A creature subjected to Assassin\'s Blood must make a DC 10 Constitution saving throw. On a failed save, it takes 6 (1d12) Poison damage and has the Poisoned condition for 24 hours. On a successful save, the creature takes half as much damage only.' },
  { name: 'Burnt Othur Fumes', category: 'rules', subtitle: 'Inhaled Poison (500 GP)', tags: ['Poison', 'Inhaled', 'Gameplay Toolbox'], desc: 'A creature subjected to Burnt Othur Fumes must succeed on a DC 13 Constitution saving throw or take 10 (3d6) Poison damage, and must repeat the saving throw at the start of each of its turns. On each successive failed save, the creature takes 3 (1d6) Poison damage. After three successful saves, the poison ends.' },
  { name: 'Crawler Mucus', category: 'rules', subtitle: 'Contact Poison (200 GP)', tags: ['Poison', 'Contact', 'Gameplay Toolbox'], desc: 'This poison must be harvested from a dead or Incapacitated Carrion Crawler. A creature subjected to this poison must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 minute. The creature also has the Paralyzed condition while Poisoned in this way. The creature repeats the save at the end of each of its turns, ending the effect on itself on a success.' },
  { name: 'Drow Poison', category: 'rules', subtitle: 'Injury Poison (200 GP)', tags: ['Poison', 'Injury', 'Gameplay Toolbox'], desc: 'A creature subjected to Drow Poison must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 hour. If the saving throw fails by 5 or more, the creature also has the Unconscious condition while Poisoned in this way. The creature wakes up if it takes damage or if another creature takes an action to shake it awake.' },
  { name: 'Essence of Ether', category: 'rules', subtitle: 'Inhaled Poison (300 GP)', tags: ['Poison', 'Inhaled', 'Gameplay Toolbox'], desc: 'A creature subjected to Essence of Ether must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 8 hours. The creature also has the Unconscious condition while Poisoned in this way. The creature wakes up if it takes damage or if another creature takes an action to shake it awake.' },
  { name: 'Malice', category: 'rules', subtitle: 'Inhaled Poison (250 GP)', tags: ['Poison', 'Inhaled', 'Gameplay Toolbox'], desc: 'A creature subjected to Malice must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 1 hour. The creature also has the Blinded condition while Poisoned in this way.' },
  { name: 'Midnight Tears', category: 'rules', subtitle: 'Ingested Poison (1,500 GP)', tags: ['Poison', 'Ingested', 'Gameplay Toolbox'], desc: 'A creature that ingests Midnight Tears suffers no effect until the stroke of midnight. If the poison has not been neutralized before then, the creature must make a DC 17 Constitution saving throw, taking 31 (9d6) Poison damage on a failed save or half as much damage on a successful one.' },
  { name: 'Oil of Taggit', category: 'rules', subtitle: 'Contact Poison (400 GP)', tags: ['Poison', 'Contact', 'Gameplay Toolbox'], desc: 'A creature subjected to Oil of Taggit must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 24 hours. The creature also has the Unconscious condition while Poisoned in this way. It wakes up if it takes damage.' },
  { name: 'Pale Tincture', category: 'rules', subtitle: 'Ingested Poison (250 GP)', tags: ['Poison', 'Ingested', 'Gameplay Toolbox'], desc: 'A creature subjected to Pale Tincture must succeed on a DC 16 Constitution saving throw or take 3 (1d6) Poison damage and have the Poisoned condition. The Poisoned creature must repeat the saving throw every 24 hours, taking 3 (1d6) Poison damage on a failed save. Damage from this poison can\'t be healed by any means while the creature remains Poisoned. After seven successful saving throws, the effect ends.' },
  { name: 'Purple Worm Poison', category: 'rules', subtitle: 'Injury Poison (2,000 GP)', tags: ['Poison', 'Injury', 'Gameplay Toolbox'], desc: 'This poison must be harvested from a dead or Incapacitated Purple Worm. A creature subjected to this poison must make a DC 21 Constitution saving throw, taking 35 (10d6) Poison damage on a failed save or half as much damage on a successful one.' },
  { name: 'Serpent Venom', category: 'rules', subtitle: 'Injury Poison (200 GP)', tags: ['Poison', 'Injury', 'Gameplay Toolbox'], desc: 'This poison must be harvested from a dead or Incapacitated Giant Poisonous Snake. A creature subjected to this poison must make a DC 11 Constitution saving throw, taking 10 (3d6) Poison damage on a failed save or half as much damage on a successful one.' },
  { name: 'Torpor', category: 'rules', subtitle: 'Ingested Poison (600 GP)', tags: ['Poison', 'Ingested', 'Gameplay Toolbox'], desc: 'A creature subjected to Torpor must succeed on a DC 15 Constitution saving throw or have the Poisoned condition for 4d6 hours. The creature also has the Incapacitated condition while Poisoned in this way.' },
  { name: 'Truth Serum', category: 'rules', subtitle: 'Ingested Poison (150 GP)', tags: ['Poison', 'Ingested', 'Gameplay Toolbox'], desc: 'A creature subjected to Truth Serum must succeed on a DC 11 Constitution saving throw or have the Poisoned condition for 1 hour. The Poisoned creature can\'t knowingly speak a lie, as if under the effect of a Zone of Truth spell.' },
  { name: 'Wyvern Poison', category: 'rules', subtitle: 'Injury Poison (1,200 GP)', tags: ['Poison', 'Injury', 'Gameplay Toolbox'], desc: 'This poison must be harvested from a dead or Incapacitated Wyvern. A creature subjected to this poison must make a DC 14 Constitution saving throw, taking 24 (7d6) Poison damage on a failed save or half as much damage on a successful one.' },
  { name: 'Cackle Fever', category: 'rules', subtitle: 'Magical Contagion (Disease)', tags: ['Disease', 'Contagion', 'Gameplay Toolbox'], desc: 'Magical contagion affecting non-Gnome Humanoids. Spreads via inhalation within 10 ft (DC 13 CON save). Gives 1 Exhaustion level; taking damage triggers a DC 13 CON save or 5 (1d10) Psychic damage and Incapacitated with manic laughter for 1 minute.' },
  { name: 'Sewer Plague', category: 'rules', subtitle: 'Magical Contagion (Disease)', tags: ['Disease', 'Contagion', 'Gameplay Toolbox'], desc: 'Contagion contracted from sewage, otyughs, or rats (DC 11 CON save). Incubates 1d4 days, gives 1 Exhaustion level, and reduces HP regained from spending Hit Point Dice by half.' },
  { name: 'Sight Rot', category: 'rules', subtitle: 'Magical Contagion (Disease)', tags: ['Disease', 'Contagion', 'Gameplay Toolbox'], desc: 'Contagion contracted from tainted water or blood (DC 15 CON save). Causes bleeding from the eyes and imposes the Blinded condition after 24 hours until cured by magic or Eyebright ointment.' },
  { name: 'Brown Mold', category: 'rules', subtitle: 'Dungeon Hazard', tags: ['Hazard', 'Gameplay Toolbox', 'Dungeon'], desc: 'Absorbs heat within 30 ft. Creatures within 5 ft make a DC 12 CON save, taking 22 (4d10) Cold damage on a failure or half on a success. Immune to Fire (which causes it to expand); instantly destroyed by Cold damage.' },
  { name: 'Green Slime', category: 'rules', subtitle: 'Dungeon Hazard', tags: ['Hazard', 'Gameplay Toolbox', 'Dungeon'], desc: 'Drops from ceilings (DC 10 DEX save). Deals 5 (1d10) Acid damage on contact and at the start of each turn (11 [2d10] Acid damage to wood or metal). Destroyed by sunlight, Lesser Restoration, or Cold, Fire, or Radiant damage.' },
  { name: 'Yellow Mold', category: 'rules', subtitle: 'Dungeon Hazard', tags: ['Hazard', 'Gameplay Toolbox', 'Dungeon'], desc: 'Releases a 10-ft Cube of spores when touched (DC 15 CON save or 11 [2d10] Poison damage and Poisoned for 1 minute, taking 5 [1d10] Poison damage at the start of each turn). Destroyed by sunlight or Fire damage.' },
  { name: 'Collapsing Roof', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Triggered by a trip wire (DC 11 Perception / Thieves\' Tools). Collapses ceiling over a 10-ft square: DC 13 DEX save or 11 (2d10) Bludgeoning damage and Prone under rubble.' },
  { name: 'Falling Net', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Triggered by a trip wire (DC 10 Perception). Drops a 10-ft-square net: DC 10 DEX save or Restrained (DC 10 STR Athletics to escape or deal 5 Slashing damage to AC 10 net).' },
  { name: 'Fire-Casting Statue', category: 'rules', subtitle: 'Magical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Triggered by a pressure plate (DC 15 Perception / Thieves\' Tools / Arcana). Breathes a 15-ft Cone or 30-ft Line of fire: DC 13 DEX save, 11 (2d10) to 55 (10d10) Fire damage.' },
  { name: 'Hidden Pit', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Concealed trapdoor (DC 15 Perception) over a 10-to-60-ft pit dealing 1d6 Bludgeoning falling damage per 10 feet.' },
  { name: 'Poisoned Darts', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Triggered by a pressure plate (DC 15 Perception / Thieves\' Tools). Fires 1d4 darts dealing 2 (1d4) Piercing + 11 (2d10) Poison damage (DC 15 DEX save).' },
  { name: 'Poisoned Needle', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Hidden inside a lock (DC 15 Investigation / Thieves\' Tools). Deals 1 Piercing + 11 (2d10) Poison damage and Poisoned for 1 hour (DC 15 CON save).' },
  { name: 'Rolling Sphere', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'Releases a 10-ft-diameter stone sphere (Initiative +8, Speed 60 ft). Creatures in path make a DC 15 DEX save or take 55 (10d10) Bludgeoning damage and are knocked Prone.' },
  { name: 'Spiked Pit', category: 'rules', subtitle: 'Mechanical Trap', tags: ['Trap', 'Gameplay Toolbox', 'Dungeon'], desc: 'A hidden pit lined with sharpened spikes at the bottom, dealing falling damage plus 11 (2d10) Piercing damage.' },

  // Individual Ability Scores & Skills
  { name: 'Strength (STR)', category: 'rules', subtitle: 'Core Ability Score • Physical Might & Athletics', tags: ['Ability Score', 'Strength', 'Athletics'], desc: 'Strength measures bodily power, athletic training, and the extent to which you can exert raw physical force. Used for melee weapon attacks, Unarmed Strikes, Carrying Capacity (STR × 15 lb.), Long/High Jumps, and the Athletics skill.' },
  { name: 'Dexterity (DEX)', category: 'rules', subtitle: 'Core Ability Score • Agility, Reflexes & Balance', tags: ['Ability Score', 'Dexterity', 'Acrobatics', 'Sleight of Hand', 'Stealth'], desc: 'Dexterity measures agility, reflexes, and balance. Used for ranged weapon attacks, Finesse melee weapons, Armor Class (AC) modifier, Initiative rolls, and the Acrobatics, Sleight of Hand, and Stealth skills.' },
  { name: 'Constitution (CON)', category: 'rules', subtitle: 'Core Ability Score • Health, Stamina & Vital Force', tags: ['Ability Score', 'Constitution', 'Concentration', 'Hit Points'], desc: 'Constitution measures health, stamina, and vital force. Used to determine Hit Points gained per level, maintaining Concentration on spells when damaged, holding breath, and resisting poison, disease, cold, and exhaustion.' },
  { name: 'Intelligence (INT)', category: 'rules', subtitle: 'Core Ability Score • Reasoning, Memory & Arcane Study', tags: ['Ability Score', 'Intelligence', 'Arcana', 'History', 'Investigation', 'Nature', 'Religion'], desc: 'Intelligence measures mental acuity, accuracy of recall, and the ability to reason. Spellcasting ability for Wizards, Eldritch Knights, and Arcane Tricksters; governs the Arcana, History, Investigation, Nature, and Religion skills (Study action).' },
  { name: 'Wisdom (WIS)', category: 'rules', subtitle: 'Core Ability Score • Perceptiveness, Intuition & Willpower', tags: ['Ability Score', 'Wisdom', 'Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'], desc: 'Wisdom reflects how attuned you are to the world around you and represents perceptiveness and intuition. Spellcasting ability for Clerics, Druids, and Rangers; governs the Animal Handling, Insight, Medicine, Perception, and Survival skills (Search action).' },
  { name: 'Charisma (CHA)', category: 'rules', subtitle: 'Core Ability Score • Confidence, Eloquence & Force of Personality', tags: ['Ability Score', 'Charisma', 'Deception', 'Intimidation', 'Performance', 'Persuasion'], desc: 'Charisma measures your ability to interact effectively with others and your force of personality. Spellcasting ability for Bards, Paladins, Sorcerers, and Warlocks; governs the Deception, Intimidation, Performance, and Persuasion skills (Influence action).' },
  { name: 'Skills (All 18 Core Skills Reference)', category: 'rules', subtitle: 'Rules Glossary • Ability Check Proficiencies', tags: ['Rules', 'Skills', 'Proficiency', 'Expertise'], desc: 'The 18 skills in D&D 5e and their default abilities:\n• Acrobatics (Dexterity): Stay on your feet in a tricky situation, perform acrobatic stunts.\n• Animal Handling (Wisdom): Calm a domesticated animal, intuit an animal\'s intentions, control a mount.\n• Arcana (Intelligence): Recall lore about spells, magic items, eldritch symbols, planes of existence, Aberrations, Constructs, Elementals, Fey, and Monstrosities.\n• Athletics (Strength): Climb, jump, swim, or force open doors.\n• Deception (Charisma): Hide the truth verbally or through actions.\n• History (Intelligence): Recall lore about historical events, legendary people, ancient kingdoms, Giants, and Humanoids.\n• Insight (Wisdom): Determine the true intentions of a creature.\n• Intimidation (Charisma): Influence someone through overt threats, hostile actions, and physical violence.\n• Investigation (Intelligence): Look around for clues and make deductions based on those clues.\n• Medicine (Wisdom): Stabilize a dying companion or diagnose an illness.\n• Nature (Intelligence): Recall lore about terrain, plants and animals, the weather, Beasts, Dragons, Oozes, and Plants.\n• Perception (Wisdom): Spot, hear, or otherwise detect the presence of something.\n• Performance (Charisma): Delight an audience with music, dance, acting, storytelling.\n• Persuasion (Charisma): Influence someone or a group of people with tact, social graces, or good nature.\n• Religion (Intelligence): Recall lore about deities, rites and prayers, religious hierarchies, holy symbols, Celestials, Fiends, and Undead.\n• Sleight of Hand (Dexterity): Plant something on someone else, conceal an object on your person, pick a pocket.\n• Stealth (Dexterity): Conceal yourself from enemies, slink past guards, slip away without being noticed.\n• Survival (Wisdom): Follow tracks, hunt wild game, guide your group through frozen wastelands, predict the weather.' },

  // Individual Planes of Existence
  { name: 'Feywild', category: 'rules', subtitle: 'Echo Plane (Plane of Faerie)', tags: ['Plane of Existence', 'Cosmology', 'Feywild'], desc: 'Also called the Plane of Faerie, the Feywild is a realm of eternal twilight, lush nature, and heightened emotion that echoes the Material Plane. Inhabited by Fey, Archfey, Elves, Eladrin, Satyrs, and Dryads.' },
  { name: 'Shadowfell', category: 'rules', subtitle: 'Echo Plane (Plane of Shadow)', tags: ['Plane of Existence', 'Cosmology', 'Shadowfell'], desc: 'Also called the Plane of Shadow, the Shadowfell is a bleak, muted echo of the Material Plane steeped in gloom, decay, and sorrow. Home to Undead, Shadows, Nightwalkers, and dark fortresses.' },
  { name: 'Ethereal Plane', category: 'rules', subtitle: 'Transitive Plane (Border Ethereal & Deep Ethereal)', tags: ['Plane of Existence', 'Cosmology', 'Ethereal Plane'], desc: 'A misty, fog-bound dimension that coexists with the Material Plane and the Inner Planes. Its overlapping shore is the Border Ethereal (visited via Etherealness or Blink), while the Deep Ethereal connects planes via curtains of vaporous color.' },
  { name: 'Astral Plane', category: 'rules', subtitle: 'Transitive Plane (Sea of Starlight & Thought)', tags: ['Plane of Existence', 'Cosmology', 'Astral Plane'], desc: 'A great silvery sea of thought and dream where creatures don\'t age or hunger, connecting the Material Plane to all the Outer Planes via spiraling color pools. Traversed via Astral Projection.' },
  { name: 'Nine Hells of Baator', category: 'rules', subtitle: 'Outer Plane (Lawful Evil)', tags: ['Plane of Existence', 'Cosmology', 'Nine Hells', 'Fiend'], desc: 'Nine tiered layers of tyranny, fire, and ice ruled by Archdevils (Avernus, Dis, Minauros, Phlegethos, Stygia, Malbolge, Maladomini, Cania, and Nessus). Home of Devils.' },
  { name: 'The Abyss', category: 'rules', subtitle: 'Outer Plane (Chaotic Evil)', tags: ['Plane of Existence', 'Cosmology', 'Abyss', 'Fiend'], desc: 'An infinite chasm of nightmarish, ever-mutating layers of destruction and savagery ruled by Demon Lords. Home of Demons.' },
  { name: 'Bastions (SRD 5.2.1 System)', category: 'rules', subtitle: 'Stronghold & Facility Rules (Levels 5–20)', tags: ['Rules', 'Bastion', 'Downtime', 'Gameplay Toolbox'], desc: 'Starting at level 5, characters can establish and expand a Bastion—a personal stronghold containing basic and special facilities (such as an Arcane Study, Armory, Barrack, Garden, Library, Sanctuary, Smithy, StoreHouse, Teleportation Circle, or Workshop). Each Bastion turn (typically every 7 days of in-game time), characters issue Bastion Orders: Craft, Empower, Harvest, Maintain, Recruit, Research, or Trade.' },
  // Individual Weapon Mastery Property entries
  { name: 'Cleave', category: 'rules', subtitle: 'Weapon Mastery Property (Greataxe, Halberd)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon\'s damage, but don\'t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.' },
  { name: 'Graze', category: 'rules', subtitle: 'Weapon Mastery Property (Glaive, Greatsword)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.' },
  { name: 'Nick', category: 'rules', subtitle: 'Weapon Mastery Property (Dagger, Light Hammer, Scimitar, Sickle)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.' },
  { name: 'Push', category: 'rules', subtitle: 'Weapon Mastery Property (Greatclub, Heavy Crossbow, Pike, Warhammer)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.' },
  { name: 'Sap', category: 'rules', subtitle: 'Weapon Mastery Property (Flail, Longsword, Mace, Morningstar, Spear, War Pick)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.' },
  { name: 'Slow (Weapon Mastery)', category: 'rules', subtitle: 'Weapon Mastery Property (Club, Javelin, Light Crossbow, Longbow, Musket, Sling, Whip)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn\'t exceed 10 feet.' },
  { name: 'Topple', category: 'rules', subtitle: 'Weapon Mastery Property (Battleaxe, Lance, Maul, Quarterstaff, Trident)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition.' },
  { name: 'Vex', category: 'rules', subtitle: 'Weapon Mastery Property (Blowgun, Dart, Hand Crossbow, Handaxe, Pistol, Rapier, Shortbow, Shortsword)', tags: ['Weapon Mastery', 'Combat', 'Rules'], desc: 'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature before the end of your next turn.' },
  // Individual 18 Skills
  { name: 'Acrobatics', category: 'rules', subtitle: 'Dexterity Skill', tags: ['Skill', 'Dexterity', 'Rules'], desc: 'Your Dexterity (Acrobatics) check covers your attempt to stay on your feet in a tricky situation, such as when you\'re trying to run across a sheet of ice, balance on a tightrope, or stay upright on a rocking ship\'s deck, or to escape a Grapple.' },
  { name: 'Animal Handling', category: 'rules', subtitle: 'Wisdom Skill (Influence / Search)', tags: ['Skill', 'Wisdom', 'Rules'], desc: 'When there is any question whether you can calm down a domesticated animal, keep a mount from getting spooked, or intuit an animal\'s intentions, the GM might call for a Wisdom (Animal Handling) check.' },
  { name: 'Arcana', category: 'rules', subtitle: 'Intelligence Skill (Study)', tags: ['Skill', 'Intelligence', 'Study', 'Rules'], desc: 'Your Intelligence (Arcana) check measures your ability to recall lore about spells, magic items, eldritch symbols, magical traditions, the planes of existence, and the inhabitants of those planes (Aberrations, Constructs, Elementals, Fey, and Monstrosities).' },
  { name: 'Athletics', category: 'rules', subtitle: 'Strength Skill', tags: ['Skill', 'Strength', 'Rules'], desc: 'Your Strength (Athletics) check covers difficult situations you encounter while climbing, jumping, or swimming, as well as escaping a Grapple.' },
  { name: 'Deception', category: 'rules', subtitle: 'Charisma Skill (Influence)', tags: ['Skill', 'Charisma', 'Influence', 'Rules'], desc: 'Your Charisma (Deception) check determines whether you can convincingly hide the truth, either verbally or through your actions.' },
  { name: 'History', category: 'rules', subtitle: 'Intelligence Skill (Study)', tags: ['Skill', 'Intelligence', 'Study', 'Rules'], desc: 'Your Intelligence (History) check measures your ability to recall lore about historical events, legendary people, ancient kingdoms, past disputes, recent wars, and lost civilizations (including Giants and Humanoids).' },
  { name: 'Insight', category: 'rules', subtitle: 'Wisdom Skill (Search)', tags: ['Skill', 'Wisdom', 'Search', 'Rules'], desc: 'Your Wisdom (Insight) check decides whether you can determine the true intentions of a creature, such as when searching out a lie or predicting someone\'s next move.' },
  { name: 'Intimidation', category: 'rules', subtitle: 'Charisma Skill (Influence)', tags: ['Skill', 'Charisma', 'Influence', 'Rules'], desc: 'When you attempt to influence someone through overt threats, hostile actions, and physical violence, the GM might ask you to make a Charisma (Intimidation) check.' },
  { name: 'Investigation', category: 'rules', subtitle: 'Intelligence Skill (Study)', tags: ['Skill', 'Intelligence', 'Study', 'Rules'], desc: 'When you look around for clues and make deductions based on those clues, you make an Intelligence (Investigation) check. Used to study traps, ciphers, riddles, and gadgetry.' },
  { name: 'Medicine', category: 'rules', subtitle: 'Wisdom Skill (Search)', tags: ['Skill', 'Wisdom', 'Search', 'Rules'], desc: 'A Wisdom (Medicine) check lets you try to stabilize a dying companion (DC 10) or diagnose an illness or cause of death.' },
  { name: 'Nature', category: 'rules', subtitle: 'Intelligence Skill (Study)', tags: ['Skill', 'Intelligence', 'Study', 'Rules'], desc: 'Your Intelligence (Nature) check measures your ability to recall lore about terrain, plants and animals, the weather, and natural cycles (Beasts, Dragons, Oozes, and Plants).' },
  { name: 'Perception', category: 'rules', subtitle: 'Wisdom Skill (Search)', tags: ['Skill', 'Wisdom', 'Search', 'Rules'], desc: 'Your Wisdom (Perception) check lets you spot, hear, or otherwise detect the presence of something. It measures your general awareness of your surroundings and the keenness of your senses.' },
  { name: 'Performance', category: 'rules', subtitle: 'Charisma Skill (Influence)', tags: ['Skill', 'Charisma', 'Influence', 'Rules'], desc: 'Your Charisma (Performance) check determines how well you can delight an audience with music, dance, acting, storytelling, or some other form of entertainment.' },
  { name: 'Persuasion', category: 'rules', subtitle: 'Charisma Skill (Influence)', tags: ['Skill', 'Charisma', 'Influence', 'Rules'], desc: 'When you attempt to influence someone or a group of people with tact, social graces, or good nature, the GM might ask you to make a Charisma (Persuasion) check.' },
  { name: 'Religion', category: 'rules', subtitle: 'Intelligence Skill (Study)', tags: ['Skill', 'Intelligence', 'Study', 'Rules'], desc: 'Your Intelligence (Religion) check measures your ability to recall lore about deities, rites and prayers, religious hierarchies, holy symbols, and the practices of secret cults (Celestials, Fiends, and Undead).' },
  { name: 'Sleight of Hand', category: 'rules', subtitle: 'Dexterity Skill', tags: ['Skill', 'Dexterity', 'Rules'], desc: 'Whenever you attempt an act of legerdemain or manual trickery, such as planting something on someone else or concealing an object on your person, make a Dexterity (Sleight of Hand) check.' },
  { name: 'Stealth', category: 'rules', subtitle: 'Dexterity Skill (Hide)', tags: ['Skill', 'Dexterity', 'Hide', 'Rules'], desc: 'Make a Dexterity (Stealth) check when you attempt to conceal yourself from enemies (DC 15 with the Hide action), slink past guards, or slip away without being noticed.' },
  { name: 'Survival', category: 'rules', subtitle: 'Wisdom Skill (Search)', tags: ['Skill', 'Wisdom', 'Search', 'Rules'], desc: 'The GM might ask you to make a Wisdom (Survival) check to follow tracks, hunt wild game, guide your group through frozen wastelands, identify signs that owlbears live nearby, predict the weather, or avoid quicksand and other natural hazards.' }
];

export const ALL_SRD_RULES_AND_ACTIONS: SrdRuleRaw[] = [
  ...SRD_ACTIONS_AND_CONDITIONS,
  ...SRD_RULES_GLOSSARY_AND_TOOLBOX,
];

export function buildRulesAndActionsLibraryEntries(): LibraryEntry[] {
  return ALL_SRD_RULES_AND_ACTIONS.map((r) => {
    const actionType: 'Action' | 'Bonus Action' | 'Reaction' | 'Special' = r.tags.includes('Bonus Action')
      ? 'Bonus Action'
      : r.tags.includes('Reaction')
      ? 'Reaction'
      : r.tags.includes('Action')
      ? 'Action'
      : 'Special';

    return {
      id: `srd_${r.category}_${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      name: r.name,
      category: r.category,
      source: 'SRD 5.2.1',
      summary: `${r.subtitle} — ${r.desc.slice(0, 140)}${r.desc.length > 140 ? '...' : ''}`,
      content: `${r.subtitle}\n\n${r.desc}`,
      stats: r.category === 'actions' ? { actionType } : undefined,
      tags: r.tags,
    };
  });
}

