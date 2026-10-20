import { SrdClassOrRaceRaw } from './srdClassesAndRaces.ts';

export const SRD_CLASS_AND_SUBCLASS_FEATURES: SrdClassOrRaceRaw[] = [
  // ==========================================
  // WIZARD & EVOKER (SCHOOL OF EVOCATION)
  // ==========================================
  {
    name: 'Sculpt Spells',
    category: 'classes',
    subtitle: 'Evoker (School of Evocation) Level 3 Subclass Feature • Wizard',
    tags: ['Subclass Feature', 'Class Feature', 'Wizard', 'Evoker', 'School of Evocation', 'Sculpt Spells'],
    desc: `When you cast an Evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 plus the spell's level. The chosen creatures automatically succeed on their saving throws against the spell, and they take no damage if they would normally take half damage on a successful save.`
  },
  {
    name: 'Potent Cantrip',
    category: 'classes',
    subtitle: 'Evoker (School of Evocation) Level 3 Subclass Feature • Wizard',
    tags: ['Subclass Feature', 'Class Feature', 'Wizard', 'Evoker', 'School of Evocation'],
    desc: `Your damaging cantrips affect even creatures that avoid the brunt of the effect. When you cast a cantrip at a creature and you miss with the attack roll or the target succeeds on a saving throw against the cantrip, the target takes half the cantrip's damage (if any) but suffers no additional effect from the cantrip.`
  },
  {
    name: 'Evocation Savant',
    category: 'classes',
    subtitle: 'Evoker (School of Evocation) Level 3 Subclass Feature • Wizard',
    tags: ['Subclass Feature', 'Class Feature', 'Wizard', 'Evoker', 'School of Evocation'],
    desc: `Choose two Wizard spells from the Evocation school, each of which must be no higher than level 2, and add them to your spellbook for free. In addition, whenever you gain access to a new level of spell slots in this class, you can add one Wizard spell from the Evocation school to your spellbook for free.`
  },
  {
    name: 'Empowered Evocation',
    category: 'classes',
    subtitle: 'Evoker (School of Evocation) Level 10 Subclass Feature • Wizard',
    tags: ['Subclass Feature', 'Class Feature', 'Wizard', 'Evoker', 'School of Evocation'],
    desc: `Whenever you cast a Wizard spell from the Evocation school, you can add your Intelligence modifier to one damage roll of that spell.`
  },
  {
    name: 'Overchannel',
    category: 'classes',
    subtitle: 'Evoker (School of Evocation) Level 14 Subclass Feature • Wizard',
    tags: ['Subclass Feature', 'Class Feature', 'Wizard', 'Evoker', 'School of Evocation'],
    desc: `You can increase the power of your simpler spells. When you cast a Wizard spell with a spell slot of levels 1–5 that deals damage, you can deal maximum damage with that spell on the turn you cast it. The first time you do so, you suffer no adverse effect. If you use this feature again before you finish a Long Rest, you take 2d12 Necrotic damage for each level of the spell slot immediately after you cast it (increasing by 1d12 per level each additional time).`
  },
  {
    name: 'Scholar',
    category: 'classes',
    subtitle: 'Wizard Level 2 Class Feature • Expertise in Academic Skill',
    tags: ['Class Feature', 'Wizard', 'Expertise'],
    desc: `While studying magic, you also specialized in another field of study. Choose one of the following skills in which you have proficiency: Arcana, History, Investigation, Medicine, Nature, or Religion. You have Expertise in the chosen skill.`
  },
  {
    name: 'Memorize Spell',
    category: 'classes',
    subtitle: 'Wizard Level 5 Class Feature • Swap Prepared Spell on Short Rest',
    tags: ['Class Feature', 'Wizard', 'Spellcasting'],
    desc: `Whenever you finish a Short Rest, you can study your spellbook and replace one of the level 1+ Wizard spells you have prepared for your Spellcasting feature with another level 1+ spell from the book.`
  },
  {
    name: 'Spell Mastery',
    category: 'classes',
    subtitle: 'Wizard Level 18 Class Feature • Cast Level 1 & 2 Spells at Will',
    tags: ['Class Feature', 'Wizard', 'Spellcasting'],
    desc: `You have achieved such mastery over certain spells that you can cast them at will. Choose a level 1 and a level 2 spell in your spellbook that have a casting time of an action. You always have those spells prepared, and you can cast them at their lowest level without expending a spell slot.`
  },
  {
    name: 'Signature Spells',
    category: 'classes',
    subtitle: 'Wizard Level 20 Class Feature • Two Level 3 Spells Always Prepared',
    tags: ['Class Feature', 'Wizard', 'Spellcasting'],
    desc: `Choose two level 3 Wizard spells in your spellbook as your signature spells. You always have these spells prepared, they don't count against the number of spells you have prepared, and you can cast each of them once at level 3 without expending a spell slot (regaining after a Short or Long Rest).`
  },

  // ==========================================
  // FIGHTER & CHAMPION / BATTLE MASTER / ELDRITCH KNIGHT
  // ==========================================
  {
    name: 'Improved Critical',
    category: 'classes',
    subtitle: 'Champion Level 3 Subclass Feature • Fighter',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Champion', 'Critical Hit'],
    desc: `Your attack rolls with weapons and Unarmed Strikes can score a Critical Hit on a roll of 19 or 20 on the d20.`
  },
  {
    name: 'Remarkable Athlete',
    category: 'classes',
    subtitle: 'Champion Level 3 Subclass Feature • Fighter',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Champion'],
    desc: `Thanks to your athleticism, you have Advantage on Initiative rolls and Strength (Athletics) checks. In addition, immediately after you score a Critical Hit, you can move up to half your Speed without provoking Opportunity Attacks.`
  },
  {
    name: 'Heroic Warrior',
    category: 'classes',
    subtitle: 'Champion Level 10 Subclass Feature • Fighter',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Champion'],
    desc: `The thrill of battle drives you toward victory. During combat, you can give yourself Heroic Inspiration whenever you start your turn without it.`
  },
  {
    name: 'Superior Critical',
    category: 'classes',
    subtitle: 'Champion Level 15 Subclass Feature • Fighter',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Champion', 'Critical Hit'],
    desc: `Your attack rolls with weapons and Unarmed Strikes can now score a Critical Hit on a roll of 18–20 on the d20.`
  },
  {
    name: 'Survivor',
    category: 'classes',
    subtitle: 'Champion Level 18 Subclass Feature • Fighter',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Champion', 'Healing'],
    desc: `You attain the pinnacle of resilience in battle: Defy Death grants Advantage on Death Saving Throws (and 18–20 counts as rolling a 20), and Heroic Rally restores 5 + your Constitution modifier HP at the start of each of your turns when you are Bloodied and have at least 1 HP.`
  },
  {
    name: 'Extra Attack',
    category: 'classes',
    subtitle: 'Level 5 Martial Class Feature • Barbarian, Fighter, Monk, Paladin, Ranger',
    tags: ['Class Feature', 'Fighter', 'Barbarian', 'Monk', 'Paladin', 'Ranger', 'Combat'],
    desc: `You can attack twice instead of once whenever you take the Attack action on your turn. Fighters gain Two Extra Attacks (three total) at level 11 and Three Extra Attacks (four total) at level 20.`
  },
  {
    name: 'Tactical Mind',
    category: 'classes',
    subtitle: 'Fighter Level 2 Class Feature • Expend Second Wind to Boost Ability Check',
    tags: ['Class Feature', 'Fighter'],
    desc: `You have a mind for tactics on and off the battlefield. When you fail an ability check, you can expend a use of your Second Wind to push yourself toward success. Rather than regaining Hit Points, you roll 1d10 and add the number rolled to the ability check, potentially turning it into a success. If the check still fails, this use of Second Wind isn't expended.`
  },
  {
    name: 'Tactical Shift',
    category: 'classes',
    subtitle: 'Fighter Level 5 Class Feature • Disengage Movement on Second Wind',
    tags: ['Class Feature', 'Fighter', 'Movement'],
    desc: `Whenever you activate your Second Wind with a Bonus Action, you can move up to half your Speed without provoking Opportunity Attacks.`
  },
  {
    name: 'Tactical Master',
    category: 'classes',
    subtitle: 'Fighter Level 9 Class Feature • Swap Weapon Mastery Property on Attack',
    tags: ['Class Feature', 'Fighter', 'Weapon Mastery'],
    desc: `When you attack with a weapon whose mastery property you can use, you can replace that property with the Push, Sap, or Slow property for that attack.`
  },
  {
    name: 'Indomitable',
    category: 'classes',
    subtitle: 'Fighter Level 9 Class Feature • Reroll Failed Saving Throw + Fighter Level Bonus',
    tags: ['Class Feature', 'Fighter', 'Saving Throw'],
    desc: `If you fail a saving throw, you can reroll it with a bonus equal to your Fighter level. You must use the new roll, and you can't use this feature again until you finish a Long Rest (2 uses at level 13, 3 uses at level 17).`
  },
  {
    name: 'Studied Attacks',
    category: 'classes',
    subtitle: 'Fighter Level 13 Class Feature • Advantage After Missing Attack',
    tags: ['Class Feature', 'Fighter', 'Combat'],
    desc: `You study your opponents and learn from each attack you make. If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn.`
  },
  {
    name: 'Combat Superiority',
    category: 'classes',
    subtitle: 'Battle Master Level 3 Subclass Feature • Superiority Dice & Maneuvers',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Battle Master'],
    desc: `You learn three Maneuvers of your choice and gain four d8 Superiority Dice (expended when you use a Maneuver, regained on a Short or Long Rest). Your Maneuver save DC equals 8 + your Strength or Dexterity modifier + your Proficiency Bonus.`
  },
  {
    name: 'War Magic',
    category: 'classes',
    subtitle: 'Eldritch Knight Level 7 Subclass Feature • Replace Attack with Cantrip',
    tags: ['Subclass Feature', 'Class Feature', 'Fighter', 'Eldritch Knight'],
    desc: `When you take the Attack action on your turn, you can replace one of the attacks with a casting of one of your Wizard cantrips that has a casting time of an action.`
  },

  // ==========================================
  // ROGUE & THIEF / ARCANE TRICKSTER / ASSASSIN
  // ==========================================
  {
    name: 'Mage Hand Legerdemain',
    category: 'classes',
    subtitle: 'Arcane Trickster Level 3 Subclass Feature • Rogue',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Arcane Trickster', 'Mage Hand'],
    desc: `When you cast Mage Hand, you can make the spectral hand Invisible, and you can control the hand as a Bonus Action. Through the hand, you can stow or retrieve objects worn or carried by another creature, or use Thieves' Tools to pick locks and disarm traps at range without being noticed if you succeed on a Dexterity (Sleight of Hand) check.`
  },
  {
    name: 'Magical Ambush',
    category: 'classes',
    subtitle: 'Arcane Trickster Level 9 Subclass Feature • Rogue',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Arcane Trickster'],
    desc: `If you have the Invisible condition when you cast a spell on a creature, it has Disadvantage on any saving throw it makes against the spell on the same turn.`
  },
  {
    name: 'Versatile Trickster',
    category: 'classes',
    subtitle: 'Arcane Trickster Level 13 Subclass Feature • Rogue',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Arcane Trickster'],
    desc: `You gain the ability to distract targets with your Mage Hand. As a Bonus Action on your turn, you can designate a creature within 5 feet of the spectral hand created by the spell. Doing so gives you Advantage on attack rolls against that creature until the end of the turn.`
  },
  {
    name: 'Spell Thief',
    category: 'classes',
    subtitle: 'Arcane Trickster Level 17 Subclass Feature • Rogue',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Arcane Trickster'],
    desc: `Immediately after a creature casts a spell that targets you or includes you in its area of effect, you can take a Reaction to force the creature to make an Intelligence saving throw. On a failed save, you negate the spell's effect against you, and you steal the knowledge of the spell if it is at least level 1 and of a level you can cast.`
  },
  {
    name: 'Steady Aim',
    category: 'classes',
    subtitle: 'Rogue Level 3 Class Feature (Bonus Action)',
    tags: ['Class Feature', 'Rogue', 'Bonus Action', 'Combat'],
    desc: `As a Bonus Action, you give yourself Advantage on your next attack roll on the current turn. You can use this feature only if you haven't moved during this turn, and after you use it, your Speed is 0 until the end of the current turn.`
  },
  {
    name: 'Cunning Strike',
    category: 'classes',
    subtitle: 'Rogue Level 5 Class Feature • Forgo Sneak Attack Dice for Tactical Effects',
    tags: ['Class Feature', 'Rogue', 'Combat'],
    desc: `When you deal Sneak Attack damage, you can forgo 1d6 of the Sneak Attack dice to apply one of the following Cunning Strike effects (DC = 8 + DEX mod + Prof): Poison (CON save or Poisoned for 1 minute), Trip (DEX save or knocked Prone), or Withdraw (move up to half your Speed without provoking Opportunity Attacks).`
  },
  {
    name: 'Reliable Talent',
    category: 'classes',
    subtitle: 'Rogue Level 7 Class Feature • Minimum 10 on Proficient Ability Checks',
    tags: ['Class Feature', 'Rogue', 'Skills'],
    desc: `Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a d20 roll of 9 or lower as a 10.`
  },
  {
    name: 'Devious Strikes',
    category: 'classes',
    subtitle: 'Rogue Level 14 Class Feature • Daze, Knock Out, and Obscure Options',
    tags: ['Class Feature', 'Rogue', 'Combat'],
    desc: `You gain new Cunning Strike options: Daze (forgo 2d6: CON save or only move or take an action/bonus action next turn), Knock Out (forgo 6d6: CON save or Unconscious for 1 minute), and Obscure (forgo 3d6: DEX save or Blinded until the end of its next turn).`
  },
  {
    name: 'Slippery Mind',
    category: 'classes',
    subtitle: 'Rogue Level 15 Class Feature • Wisdom & Charisma Save Proficiency',
    tags: ['Class Feature', 'Rogue', 'Saving Throw'],
    desc: `Your cunning mind is exceptionally difficult to control. You gain saving throw proficiency in Wisdom and Charisma.`
  },
  {
    name: 'Elusive',
    category: 'classes',
    subtitle: 'Rogue Level 18 Class Feature • No Attack Roll Has Advantage Against You',
    tags: ['Class Feature', 'Rogue', 'Defense'],
    desc: `You're so evasive that attackers rarely gain the upper hand against you. No attack roll can have Advantage against you unless you have the Incapacitated condition.`
  },
  {
    name: 'Stroke of Luck',
    category: 'classes',
    subtitle: 'Rogue Level 20 Class Feature • Turn Failed D20 Test into a 20',
    tags: ['Class Feature', 'Rogue', 'Luck'],
    desc: `You have a marvelous knack for succeeding when you need to. If you fail a D20 Test, you can turn the roll into a 20. Once you use this feature, you can't use it again until you finish a Short or Long Rest.`
  },
  {
    name: 'Fast Hands',
    category: 'classes',
    subtitle: 'Thief Level 3 Subclass Feature • Rogue (Bonus Action)',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Thief', 'Bonus Action'],
    desc: `As a Bonus Action, you can make a Dexterity (Sleight of Hand) check to pick a lock or disarm a trap with Thieves' Tools or to pick a pocket, or take the Utilize action, or take the Magic action to use a magic item that requires that action.`
  },
  {
    name: 'Second-Story Work',
    category: 'classes',
    subtitle: 'Thief Level 3 Subclass Feature • Rogue (Climb Speed & DEX Jump)',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Thief', 'Movement'],
    desc: `You gain a Climb Speed equal to your Speed, and you can determine your jump distance using your Dexterity rather than your Strength.`
  },
  {
    name: 'Supreme Sneak',
    category: 'classes',
    subtitle: 'Thief Level 9 Subclass Feature • Rogue',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Thief', 'Stealth'],
    desc: `You gain the Stealth Attack Cunning Strike option (forgo 1d6 Sneak Attack die: if you have the Invisible condition from Hide, this attack doesn't end the condition if you end the turn behind Three-Quarters or Total Cover).`
  },
  {
    name: 'Use Magic Device',
    category: 'classes',
    subtitle: 'Thief Level 13 Subclass Feature • Rogue',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Thief', 'Magic Items'],
    desc: `You can attune to up to four magic items at once, have a 1-in-6 chance not to expend a charge when using a magic item property, and can use any Spell Scroll using Intelligence as your spellcasting ability.`
  },
  {
    name: "Thief's Reflexes",
    category: 'classes',
    subtitle: 'Thief Level 17 Subclass Feature • Rogue (Two Turns in First Round)',
    tags: ['Subclass Feature', 'Class Feature', 'Rogue', 'Thief'],
    desc: `You are adept at laying ambushes and quickly escaping danger. You can take two turns during the first round of any combat: you take your first turn at your normal Initiative and your second turn at your Initiative minus 10 (1/Short or Long Rest).`
  },

  // ==========================================
  // CLERIC & LIFE DOMAIN
  // ==========================================
  {
    name: 'Disciple of Life',
    category: 'classes',
    subtitle: 'Life Domain Level 3 Subclass Feature • Cleric',
    tags: ['Subclass Feature', 'Class Feature', 'Cleric', 'Life Domain', 'Healing'],
    desc: `When a spell you cast with a spell slot restores Hit Points to a creature, that creature regains additional Hit Points on the turn you cast the spell. The additional Hit Points equal 2 plus the spell slot's level.`
  },
  {
    name: 'Channel Divinity: Preserve Life',
    category: 'classes',
    subtitle: 'Life Domain Level 3 Subclass Feature • Cleric (Magic Action)',
    tags: ['Subclass Feature', 'Class Feature', 'Cleric', 'Life Domain', 'Channel Divinity', 'Healing'],
    desc: `As a Magic action, present your Holy Symbol and expend a use of Channel Divinity to evoke healing energy that can restore a number of Hit Points equal to 5 times your Cleric level. Choose Bloodied creatures within 30 feet of yourself (which can include you), and divide those Hit Points among them. This feature can restore a creature to no more than half its Hit Point maximum.`
  },
  {
    name: 'Preserve Life',
    category: 'classes',
    subtitle: 'Life Domain Level 3 Channel Divinity Feature • Cleric',
    tags: ['Subclass Feature', 'Class Feature', 'Cleric', 'Life Domain', 'Channel Divinity', 'Healing'],
    desc: `As a Magic action, present your Holy Symbol and expend a use of Channel Divinity to restore Hit Points equal to 5 times your Cleric level, divided among Bloodied creatures within 30 feet (up to half their Hit Point maximum).`
  },
  {
    name: 'Blessed Healer',
    category: 'classes',
    subtitle: 'Life Domain Level 6 Subclass Feature • Cleric',
    tags: ['Subclass Feature', 'Class Feature', 'Cleric', 'Life Domain', 'Healing'],
    desc: `The healing spells you cast on others heal you as well. Immediately after you cast a spell with a spell slot that restores Hit Points to one or more creatures other than yourself, you regain Hit Points equal to 2 plus the spell slot's level.`
  },
  {
    name: 'Supreme Healing',
    category: 'classes',
    subtitle: 'Life Domain Level 17 Subclass Feature • Cleric',
    tags: ['Subclass Feature', 'Class Feature', 'Cleric', 'Life Domain', 'Healing'],
    desc: `When you would normally roll one or more dice to restore Hit Points to a creature with a spell or Channel Divinity, don't roll those dice for the healing; instead use the highest number possible for each die.`
  },
  {
    name: 'Destroy Undead',
    category: 'classes',
    subtitle: 'Cleric Level 5 Class Feature (5.1) / Sear Undead (5.2.1)',
    tags: ['Class Feature', 'Cleric', 'Turn Undead', 'Undead'],
    desc: `When an Undead fails its saving throw against your Turn Undead feature, the creature is instantly destroyed if its Challenge Rating is at or below a certain threshold (CR 1/2 at Lv 5, CR 1 at Lv 8, CR 2 at Lv 11, CR 3 at Lv 14, CR 4 at Lv 17). In SRD 5.2.1 (Sear Undead), whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier and deal that much Radiant damage to each Undead that fails the save.`
  },
  {
    name: 'Sear Undead',
    category: 'classes',
    subtitle: 'Cleric Level 5 Class Feature • Radiant Damage on Turn Undead',
    tags: ['Class Feature', 'Cleric', 'Turn Undead', 'Undead', 'Radiant'],
    desc: `Whenever you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier (minimum of 1d8) and add the rolls together. Each Undead that fails its saving throw against that use of Turn Undead takes Radiant damage equal to the roll's total. This damage doesn't end the turn effect.`
  },
  {
    name: 'Turn Undead',
    category: 'classes',
    subtitle: 'Cleric Level 2 Channel Divinity Feature (Magic Action)',
    tags: ['Class Feature', 'Cleric', 'Channel Divinity', 'Undead'],
    desc: `As a Magic action, present your Holy Symbol and censure Undead. Each Undead of your choice within 30 feet of you must make a Wisdom saving throw. If the creature fails its save, it has the Frightened and Incapacitated conditions for 1 minute and tries to move as far from you as it can on its turns. This effect ends early on the creature if it takes any damage (except from Sear Undead), if you have the Incapacitated condition, or if you die.`
  },
  {
    name: 'Divine Spark',
    category: 'classes',
    subtitle: 'Cleric Level 2 Channel Divinity Feature (Magic Action)',
    tags: ['Class Feature', 'Cleric', 'Channel Divinity', 'Healing', 'Radiant'],
    desc: `As a Magic action, point your Holy Symbol at another creature you can see within 30 feet and focus divine energy at it. Roll 1d8 and add your Wisdom modifier (2d8 at level 7, 3d8 at level 13, 4d8 at level 18). You either restore Hit Points to the creature equal to that total or force the creature to make a Constitution saving throw (taking Necrotic or Radiant damage equal to the total on a failed save, or half on a success).`
  },
  {
    name: 'Divine Order',
    category: 'classes',
    subtitle: 'Cleric Level 1 Class Feature • Protector or Thaumaturge',
    tags: ['Class Feature', 'Cleric'],
    desc: `You have dedicated yourself to one of the following sacred roles: Protector (proficiency with Martial weapons and training with Heavy armor) or Thaumaturge (know one extra Cleric cantrip and add your Wisdom modifier to Intelligence [Arcana or Religion] checks).`
  },
  {
    name: 'Blessed Strikes',
    category: 'classes',
    subtitle: 'Cleric Level 7 Class Feature • Divine Strike or Potent Spellcasting',
    tags: ['Class Feature', 'Cleric'],
    desc: `Divine power infuses you in battle. Choose one option: Divine Strike (once on each of your turns when you hit a creature with an attack roll using a weapon, cause the target to take an extra 1d8 Necrotic or Radiant damage, increasing to 2d8 at level 14) or Potent Spellcasting (add your Wisdom modifier to the damage you deal with any Cleric cantrip).`
  },
  {
    name: 'Divine Intervention',
    category: 'classes',
    subtitle: 'Cleric Level 10 Class Feature • Cast Level 5 or Lower Cleric Spell Without Slot',
    tags: ['Class Feature', 'Cleric', 'Spellcasting'],
    desc: `You can call on your deity or pantheon to intervene on your behalf. As a Magic action, choose any Cleric spell of level 5 or lower that doesn't require a Reaction to cast. As part of the same action, you cast that spell without expending a spell slot or needing Material components (1/Long Rest). At level 20 (Greater Divine Intervention), you can choose the Wish spell.`
  },

  // ==========================================
  // BARBARIAN, BARD, DRUID, MONK, PALADIN, RANGER, SORCERER, WARLOCK
  // ==========================================
  {
    name: 'Unarmored Defense',
    category: 'classes',
    subtitle: 'Barbarian & Monk Level 1 Class Feature • AC Calculation Without Armor',
    tags: ['Class Feature', 'Barbarian', 'Monk', 'Armor Class'],
    desc: `While you aren't wearing any armor, your base Armor Class equals 10 + your Dexterity modifier + your Constitution modifier (for a Barbarian, who can also use a Shield) or 10 + your Dexterity modifier + your Wisdom modifier (for a Monk, without a Shield).`
  },
  {
    name: 'Danger Sense',
    category: 'classes',
    subtitle: 'Barbarian Level 2 Class Feature • Advantage on Dexterity Saving Throws',
    tags: ['Class Feature', 'Barbarian', 'Saving Throw'],
    desc: `You gain an uncanny sense of when things aren't as they should be, giving you an edge when you dodge perils. You have Advantage on Dexterity saving throws unless you have the Incapacitated condition.`
  },
  {
    name: 'Brutal Strike',
    category: 'classes',
    subtitle: 'Barbarian Level 9 Class Feature • Forgo Reckless Advantage for +1d10 & Tactical Blow',
    tags: ['Class Feature', 'Barbarian', 'Combat'],
    desc: `If you use Reckless Attack, you can forgo any Advantage on one Strength-based attack roll of your choice on your turn. On a hit, the target takes an extra 1d10 damage (2d10 at level 17) and you can apply Forceful Blow (push 15 ft and move half Speed toward target) or Hamstring Blow (-15 ft Speed until start of your next turn).`
  },
  {
    name: 'Frenzy',
    category: 'classes',
    subtitle: 'Path of the Berserker Level 3 Subclass Feature • Barbarian',
    tags: ['Subclass Feature', 'Class Feature', 'Barbarian', 'Path of the Berserker'],
    desc: `If you use Reckless Attack while your Rage is active, you deal extra damage to the first target you hit on your turn with a Strength-based attack. To determine the extra damage, roll a number of d6s equal to your Rage Damage bonus (2d6 at level 3, 3d6 at level 9, 4d6 at level 16), and add them together.`
  },
  {
    name: 'Mindless Rage',
    category: 'classes',
    subtitle: 'Path of the Berserker Level 6 Subclass Feature • Barbarian',
    tags: ['Subclass Feature', 'Class Feature', 'Barbarian', 'Path of the Berserker'],
    desc: `You have Immunity to the Charmed and Frightened conditions while your Rage is active. If you're Charmed or Frightened when you enter your Rage, the condition ends on you.`
  },
  {
    name: 'Jack of All Trades',
    category: 'classes',
    subtitle: 'Bard Level 2 Class Feature • Add Half Proficiency Bonus to Non-Proficient Checks',
    tags: ['Class Feature', 'Bard', 'Skills'],
    desc: `You can add half your Proficiency Bonus (round down) to any ability check you make that uses a skill proficiency you lack and that doesn't otherwise use your Proficiency Bonus.`
  },
  {
    name: 'Expertise',
    category: 'classes',
    subtitle: 'Bard, Rogue & Ranger Class Feature • Double Proficiency Bonus on Chosen Skills',
    tags: ['Class Feature', 'Bard', 'Rogue', 'Ranger', 'Skills'],
    desc: `You gain Expertise in two of your skill proficiencies of your choice. Your Proficiency Bonus is doubled for any ability check you make that uses either of the chosen proficiencies.`
  },
  {
    name: 'Cutting Words',
    category: 'classes',
    subtitle: 'College of Lore Level 3 Subclass Feature • Bard (Reaction)',
    tags: ['Subclass Feature', 'Class Feature', 'Bard', 'College of Lore', 'Reaction'],
    desc: `You learn to use your wit to supernaturally distract, confuse, and otherwise sap the confidence and competence of others. When a creature that you can see within 60 feet of yourself makes a damage roll or succeeds on an ability check or attack roll, you can take a Reaction to expend one use of your Bardic Inspiration; roll your Bardic Inspiration die, and subtract the number rolled from the creature's roll.`
  },
  {
    name: 'Magical Secrets',
    category: 'classes',
    subtitle: 'Bard Level 10 Class Feature • Prepare Spells from Bard, Cleric, Druid & Wizard Lists',
    tags: ['Class Feature', 'Bard', 'Spellcasting'],
    desc: `You'veplundered magical knowledge from a wide spectrum of disciplines. Whenever you reach a Bard level (including level 10) and the Prepared Spells number in the Bard Features table increases, you can choose any of your new prepared spells from the Bard, Cleric, Druid, and Wizard spell lists, and the chosen spells count as Bard spells for you.`
  },
  {
    name: 'Martial Arts',
    category: 'classes',
    subtitle: 'Monk Level 1 Class Feature • DEX Unarmed Strikes, Martial Arts Die & Bonus Unarmed Strike',
    tags: ['Class Feature', 'Monk', 'Unarmed Strike'],
    desc: `While you are unarmed or wielding only Monk weapons and not wearing armor or wielding a Shield, you can make an Unarmed Strike as a Bonus Action, roll your Martial Arts die (d6 at Lv 1, d8 at Lv 5, d10 at Lv 11, d12 at Lv 17) in place of normal damage, and use Dexterity instead of Strength for attack and damage rolls.`
  },
  {
    name: 'Patient Defense',
    category: 'classes',
    subtitle: 'Monk Level 2 Focus Feature (Bonus Action)',
    tags: ['Class Feature', 'Monk', 'Bonus Action'],
    desc: `You can take the Disengage action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dodge actions as a Bonus Action.`
  },
  {
    name: 'Step of the Wind',
    category: 'classes',
    subtitle: 'Monk Level 2 Focus Feature (Bonus Action)',
    tags: ['Class Feature', 'Monk', 'Bonus Action', 'Movement'],
    desc: `You can take the Dash action as a Bonus Action. Alternatively, you can expend 1 Focus Point to take both the Disengage and the Dash actions as a Bonus Action, and your jump distance is doubled for the turn.`
  },
  {
    name: 'Deflect Attacks',
    category: 'classes',
    subtitle: 'Monk Level 3 Class Feature (Reaction) • Reduce Incoming Attack Damage',
    tags: ['Class Feature', 'Monk', 'Reaction'],
    desc: `When an attack roll hits you and its damage includes Bludgeoning, Piercing, or Slashing damage, you can take a Reaction to reduce the attack's total damage against you by 1d10 + your Dexterity modifier + your Monk level. If you reduce the damage to 0, you can expend 1 Focus Point to redirect the attack's force at a creature within 5 ft (melee) or 60 ft (ranged).`
  },
  {
    name: 'Aura of Protection',
    category: 'classes',
    subtitle: 'Paladin Level 6 Class Feature • +Charisma Modifier to Saving Throws Within 10 Feet',
    tags: ['Class Feature', 'Paladin', 'Saving Throw', 'Aura'],
    desc: `You radiate a protective, unseeable aura in a 10-foot Emanation that originates from you (30-foot Emanation at level 18). While you are conscious, you and your allies in the aura gain a bonus to saving throws equal to your Charisma modifier (minimum bonus of +1).`
  },
  {
    name: 'Sacred Weapon',
    category: 'classes',
    subtitle: 'Oath of Devotion Level 3 Channel Divinity Feature • Paladin',
    tags: ['Subclass Feature', 'Class Feature', 'Paladin', 'Oath of Devotion', 'Channel Divinity'],
    desc: `When you take the Attack action, you can expend one use of your Channel Divinity to imbue one Melee weapon that you are holding with positive energy. For 10 minutes, you add your Charisma modifier to attack rolls you make with that weapon (minimum bonus of +1), you can cause the weapon to deal Radiant damage or its normal damage type, and the weapon emits Bright Light in a 20-foot radius.`
  },
  {
    name: 'Favored Enemy',
    category: 'classes',
    subtitle: 'Ranger Level 1 Class Feature • Hunter\'s Mark Always Prepared & Free Castings',
    tags: ['Class Feature', 'Ranger', 'Hunter\'s Mark'],
    desc: `You always have the Hunter's Mark spell prepared, and you can cast it a number of times without expending a spell slot equal to 2 (scaling up to 6 at level 17), regaining all expended uses when you finish a Long Rest.`
  },
  {
    name: 'Colossus Slayer',
    category: 'classes',
    subtitle: 'Hunter Level 3 Subclass Feature (Hunter\'s Prey) • Ranger',
    tags: ['Subclass Feature', 'Class Feature', 'Ranger', 'Hunter'],
    desc: `Your tenacity can wear down the most potent foes. When you hit a creature with a weapon, the weapon deals an extra 1d8 damage to the target if it's missing any of its Hit Points. You can deal this extra damage only once per turn.`
  },
  {
    name: 'Font of Magic',
    category: 'classes',
    subtitle: 'Sorcerer Level 2 Class Feature • Sorcery Points & Spell Slot Conversion',
    tags: ['Class Feature', 'Sorcerer', 'Sorcery Points'],
    desc: `You can tap into the wellspring of magic within yourself, represented by Sorcery Points (equal to your Sorcerer level, regained on a Long Rest). You can expend a spell slot to gain Sorcery Points equal to the slot's level (no action required), or take a Bonus Action to convert Sorcery Points into a spell slot (Level 1 = 2 SP, Level 2 = 3 SP, Level 3 = 5 SP, Level 4 = 6 SP, Level 5 = 7 SP).`
  },
  {
    name: 'Innate Sorcery',
    category: 'classes',
    subtitle: 'Sorcerer Level 1 Class Feature (Bonus Action)',
    tags: ['Class Feature', 'Sorcerer', 'Bonus Action'],
    desc: `As a Bonus Action, unleash the simmering magic within you for 1 minute (2 uses per Long Rest): the spell save DC of your Sorcerer spells increases by 1, and you have Advantage on the attack rolls of Sorcerer spells you cast.`
  },
  {
    name: 'Draconic Resilience',
    category: 'classes',
    subtitle: 'Draconic Sorcery Level 3 Subclass Feature • Sorcerer',
    tags: ['Subclass Feature', 'Class Feature', 'Sorcerer', 'Draconic Sorcery'],
    desc: `Magic in your body manifests physical traits of your draconic gift. Your Hit Point maximum increases by 3, plus 1 whenever you gain another Sorcerer level. In addition, while you aren't wearing armor, your base Armor Class equals 10 + your Dexterity modifier + your Charisma modifier.`
  },
  {
    name: "Dark One's Blessing",
    category: 'classes',
    subtitle: 'Fiend Patron Level 3 Subclass Feature • Warlock',
    tags: ['Subclass Feature', 'Class Feature', 'Warlock', 'Fiend Patron', 'Temporary HP'],
    desc: `When you reduce an enemy to 0 Hit Points, you gain Temporary Hit Points equal to your Charisma modifier + your Warlock level (minimum of 1 Temporary Hit Point). You also gain this benefit if someone else reduces an enemy within 10 feet of you to 0 Hit Points.`
  },
  {
    name: 'Hurl Through Hell',
    category: 'classes',
    subtitle: 'Fiend Patron Level 14 Subclass Feature • Warlock',
    tags: ['Subclass Feature', 'Class Feature', 'Warlock', 'Fiend Patron', 'Psychic'],
    desc: `Once per turn when you hit a creature with an attack roll, you can try to instantly transport the target through the Lower Planes. The target must succeed on a Charisma saving throw against your spell save DC, or it disappears and hurtles through a nightmare landscape, returning at the end of your next turn and taking 8d10 Psychic damage if it isn't a Fiend (1/Long Rest or expend a Pact Magic slot).`
  }
];

export const SRD_SPECIES_TRAITS: SrdClassOrRaceRaw[] = [
  // ==========================================
  // ELF & HIGH ELF / WOOD ELF / DROW TRAITS
  // ==========================================
  {
    name: 'Fey Ancestry',
    category: 'races',
    subtitle: 'Elf Species Trait • Advantage on Saving Throws vs Charmed',
    tags: ['Species Trait', 'Racial Trait', 'Elf', 'High Elf', 'Wood Elf', 'Drow', 'Half-Elf', 'Fey Ancestry'],
    desc: `You have Advantage on saving throws you make to avoid or end the Charmed condition on yourself. (In SRD 5.1, magic also cannot put you to sleep.)`
  },
  {
    name: 'Darkvision',
    category: 'races',
    subtitle: 'Species Trait & Special Sense • See in Dim Light & Darkness (60 ft or 120 ft)',
    tags: ['Species Trait', 'Racial Trait', 'Senses', 'Darkvision', 'Elf', 'Dwarf', 'Gnome', 'Orc', 'Tiefling', 'Dragonborn'],
    desc: `You have Darkvision with a range of 60 feet (or 120 feet for Drow, Duergar, Deep Gnome, and Dwarf in SRD 5.2.1). Within a specified range, a creature with Darkvision can see in Dim Light as if it were Bright Light and in Darkness as if it were Dim Light, discerning colors in Darkness only as shades of gray.`
  },
  {
    name: 'Keen Senses',
    category: 'races',
    subtitle: 'Elf Species Trait • Proficiency in Insight, Perception, or Survival',
    tags: ['Species Trait', 'Racial Trait', 'Elf', 'Keen Senses'],
    desc: `You have proficiency in the Insight, Perception, or Survival skill.`
  },
  {
    name: 'Trance',
    category: 'races',
    subtitle: 'Elf Species Trait • 4-Hour Meditative Long Rest & Cannot Be Put to Sleep by Magic',
    tags: ['Species Trait', 'Racial Trait', 'Elf', 'Trance', 'Long Rest'],
    desc: `You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.`
  },
  {
    name: 'Elven Lineage',
    category: 'races',
    subtitle: 'Elf Species Trait • Drow, High Elf, or Wood Elf Innate Magic & Benefits',
    tags: ['Species Trait', 'Racial Trait', 'Elf', 'High Elf', 'Wood Elf', 'Drow'],
    desc: `You are part of a lineage that grants you supernatural abilities:
• Drow: Darkvision 120 ft, Dancing Lights cantrip, Faerie Fire (Level 3), Darkness (Level 5).
• High Elf: Prestidigitation (or any Wizard cantrip, swappable on Long Rest), Detect Magic (Level 3), Misty Step (Level 5).
• Wood Elf: Speed increases to 35 feet, Druidcraft cantrip, Longstrider (Level 3), Pass without Trace (Level 5).`
  },

  // ==========================================
  // DWARF TRAITS
  // ==========================================
  {
    name: 'Dwarven Resilience',
    category: 'races',
    subtitle: 'Dwarf Species Trait • Poison Resistance & Advantage vs Poisoned',
    tags: ['Species Trait', 'Racial Trait', 'Dwarf', 'Mountain Dwarf', 'Hill Dwarf', 'Dwarven Resilience'],
    desc: `You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.`
  },
  {
    name: 'Dwarven Toughness',
    category: 'races',
    subtitle: 'Dwarf Species Trait • +1 Hit Point Maximum Per Character Level',
    tags: ['Species Trait', 'Racial Trait', 'Dwarf', 'Hill Dwarf', 'Hit Points'],
    desc: `Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.`
  },
  {
    name: 'Stonecunning',
    category: 'races',
    subtitle: 'Dwarf Species Trait • Tremorsense 60 ft on Stone Surfaces (Bonus Action)',
    tags: ['Species Trait', 'Racial Trait', 'Dwarf', 'Stonecunning', 'Tremorsense'],
    desc: `As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes while you are on a stone surface or touching a stone surface (uses equal to your Proficiency Bonus per Long Rest). In SRD 5.1, you also add double your Proficiency Bonus to Intelligence (History) checks related to the origin of stonework.`
  },

  // ==========================================
  // DRAGONBORN TRAITS
  // ==========================================
  {
    name: 'Draconic Ancestry',
    category: 'races',
    subtitle: 'Dragonborn Species Trait • Chromatic or Metallic Dragon Lineage & Damage Type',
    tags: ['Species Trait', 'Racial Trait', 'Dragonborn', 'Draconic Ancestry'],
    desc: `Your lineage stems from a dragon progenitor. Choose the kind of dragon from the Draconic Ancestors table (Black/Copper: Acid; Blue/Bronze: Lightning; Brass/Gold/Red: Fire; Green: Poison; Silver/White: Cold). Your choice affects your Breath Weapon and Damage Resistance traits.`
  },
  {
    name: 'Breath Weapon',
    category: 'races',
    subtitle: 'Dragonborn Species Trait • 15-ft Cone or 30-ft Line Elemental Breath',
    tags: ['Species Trait', 'Racial Trait', 'Dragonborn', 'Breath Weapon'],
    desc: `When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide. Each creature in that area must make a Dexterity saving throw (DC 8 + CON mod + Prof), taking 1d10 damage of your Draconic Ancestry type on a failed save or half on a success (scales to 2d10 at Lv 5, 3d10 at Lv 11, 4d10 at Lv 17; uses equal to Proficiency Bonus per Long Rest).`
  },
  {
    name: 'Draconic Flight',
    category: 'races',
    subtitle: 'Dragonborn Level 5 Species Trait (Bonus Action) • Spectral Wings Fly Speed',
    tags: ['Species Trait', 'Racial Trait', 'Dragonborn', 'Fly Speed'],
    desc: `When you reach character level 5, you can channel draconic magic to give yourself temporary flight. As a Bonus Action, you sprout spectral wings on your back that last for 10 minutes, granting a Fly Speed equal to your Speed (1/Long Rest).`
  },

  // ==========================================
  // GNOME, GOLIATH, HALFLING, HUMAN, ORC & TIEFLING TRAITS
  // ==========================================
  {
    name: 'Gnome Cunning',
    category: 'races',
    subtitle: 'Gnome Species Trait • Advantage on INT, WIS, and CHA Saving Throws',
    tags: ['Species Trait', 'Racial Trait', 'Gnome', 'Gnome Cunning', 'Saving Throw'],
    desc: `You have Advantage on Intelligence, Wisdom, and Charisma saving throws.`
  },
  {
    name: 'Gnomish Lineage',
    category: 'races',
    subtitle: 'Gnome Species Trait • Forest Gnome or Rock Gnome Magic',
    tags: ['Species Trait', 'Racial Trait', 'Gnome', 'Forest Gnome', 'Rock Gnome'],
    desc: `You are part of a lineage that grants you supernatural abilities:
• Forest Gnome: Minor Illusion cantrip and Speak with Animals always prepared (free casts equal to Proficiency Bonus per Long Rest).
• Rock Gnome: Mending and Prestidigitation cantrips, and can spend 10 minutes to create Tiny clockwork devices.`
  },
  {
    name: 'Giant Ancestry',
    category: 'races',
    subtitle: 'Goliath Species Trait • Cloud, Fire, Frost, Hill, Stone, or Storm Giant Boon',
    tags: ['Species Trait', 'Racial Trait', 'Goliath', 'Giant Ancestry'],
    desc: `You are descended from Giants. Choose one supernatural boon from your ancestry (usable a number of times equal to your Proficiency Bonus per Long Rest): Cloud's Jaunt (Bonus Action 30 ft teleport), Fire's Burn (+1d10 Fire damage on hit), Frost's Chill (+1d6 Cold damage and -10 ft Speed on hit), Hill's Tumble (knock Large or smaller target Prone on hit), Stone's Endurance (Reaction to reduce damage by 1d12 + CON mod), or Storm's Thunder (Reaction to deal 1d8 Thunder damage to attacker within 60 ft).`
  },
  {
    name: 'Large Form',
    category: 'races',
    subtitle: 'Goliath Level 5 Species Trait (Bonus Action) • Become Large Size for 10 Minutes',
    tags: ['Species Trait', 'Racial Trait', 'Goliath', 'Large Form'],
    desc: `Starting at character level 5, you can change your size to Large as a Bonus Action if you're in a big enough space. This transformation lasts for 10 minutes, granting you Advantage on Strength checks and increasing your Speed by 10 feet (1/Long Rest).`
  },
  {
    name: 'Powerful Build',
    category: 'races',
    subtitle: 'Goliath & Orc Species Trait • Advantage vs Grappled & Count as One Size Larger for Carrying',
    tags: ['Species Trait', 'Racial Trait', 'Goliath', 'Orc', 'Powerful Build'],
    desc: `You have Advantage on any ability check you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity.`
  },
  {
    name: 'Brave',
    category: 'races',
    subtitle: 'Halfling Species Trait • Advantage on Saving Throws vs Frightened',
    tags: ['Species Trait', 'Racial Trait', 'Halfling', 'Brave'],
    desc: `You have Advantage on saving throws you make to avoid or end the Frightened condition.`
  },
  {
    name: 'Halfling Nimbleness',
    category: 'races',
    subtitle: 'Halfling Species Trait • Move Through Spaces of Larger Creatures',
    tags: ['Species Trait', 'Racial Trait', 'Halfling', 'Halfling Nimbleness'],
    desc: `You can move through the space of any creature that is a size larger than you, but you can't stop in the same space.`
  },
  {
    name: 'Luck (Halfling)',
    category: 'races',
    subtitle: 'Halfling Species Trait • Reroll a 1 on the d20 for Any D20 Test',
    tags: ['Species Trait', 'Racial Trait', 'Halfling', 'Luck'],
    desc: `When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.`
  },
  {
    name: 'Naturally Stealthy',
    category: 'races',
    subtitle: 'Halfling Species Trait • Hide When Obscured by a Larger Creature',
    tags: ['Species Trait', 'Racial Trait', 'Halfling', 'Stealth'],
    desc: `You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.`
  },
  {
    name: 'Resourceful',
    category: 'races',
    subtitle: 'Human Species Trait • Gain Heroic Inspiration After Every Long Rest',
    tags: ['Species Trait', 'Racial Trait', 'Human', 'Heroic Inspiration'],
    desc: `You gain Heroic Inspiration whenever you finish a Long Rest.`
  },
  {
    name: 'Adrenaline Rush',
    category: 'races',
    subtitle: 'Orc Species Trait (Bonus Action) • Dash + Gain Temporary Hit Points',
    tags: ['Species Trait', 'Racial Trait', 'Orc', 'Bonus Action'],
    desc: `You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus (uses equal to your Proficiency Bonus per Short or Long Rest).`
  },
  {
    name: 'Relentless Endurance',
    category: 'races',
    subtitle: 'Orc & Half-Orc Species Trait • Drop to 1 HP Instead of 0 HP (1/Long Rest)',
    tags: ['Species Trait', 'Racial Trait', 'Orc', 'Half-Orc', 'Relentless Endurance'],
    desc: `When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can't do so again until you finish a Long Rest.`
  },
  {
    name: 'Savage Attacks',
    category: 'races',
    subtitle: 'Half-Orc Species Trait (5.1) / Savage Attacker • Extra Weapon Damage Die on Critical Hit',
    tags: ['Species Trait', 'Racial Trait', 'Half-Orc', 'Critical Hit'],
    desc: `When you score a Critical Hit with a melee weapon attack, you can roll one of the weapon's damage dice one additional time and add it to the extra damage of the Critical Hit.`
  },
  {
    name: 'Fiendish Legacy',
    category: 'races',
    subtitle: 'Tiefling Species Trait • Abyssal, Chthonic, or Infernal Resistance & Spells',
    tags: ['Species Trait', 'Racial Trait', 'Tiefling', 'Fiendish Legacy'],
    desc: `You are the recipient of a legacy that grants you supernatural abilities:
• Abyssal: Resistance to Poison damage; Poison Spray cantrip, Ray of Sickness (Level 3), Hold Person (Level 5).
• Chthonic: Resistance to Necrotic damage; Chill Touch cantrip, False Life (Level 3), Ray of Enfeeblement (Level 5).
• Infernal: Resistance to Fire damage; Fire Bolt cantrip, Hellish Rebuke (Level 3), Darkness (Level 5).`
  },
  {
    name: 'Hellish Resistance',
    category: 'races',
    subtitle: 'Tiefling Species Trait • Resistance to Fire Damage',
    tags: ['Species Trait', 'Racial Trait', 'Tiefling', 'Fire Resistance'],
    desc: `You have Resistance to Fire damage.`
  }
];
