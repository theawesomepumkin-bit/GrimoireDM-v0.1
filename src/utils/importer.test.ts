import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMarkdownOrText,
  parseJsonImport,
  filterEntries,
  sanitizeExistingEntries,
} from './importer.ts';

test('parseMarkdownOrText accurately extracts Dwarf traits matching user sample', () => {
  const sampleMarkdown = `
# Dwarf

### Dwarf Traits

Your dwarf character has an assortment of inborn abilities, part and parcel of dwarven nature.

***Ability Score Increase***. Your Constitution score increases by 2.

***Age***. Dwarves mature at the same rate as humans, but they're considered young until they reach the age of 50. On average, they live about 350 years.

***Size***. Dwarves stand between 4 and 5 feet tall and average about 150 pounds. Your size is Medium.

***Speed***. Your base walking speed is 25 feet. Your speed is not reduced by wearing heavy armor.

***Darkvision***. Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.

***Dwarven Resilience***. You have advantage on saving throws against poison, and you have resistance against poison damage.
`;

  const entries = parseMarkdownOrText(sampleMarkdown);
  assert.equal(entries.length, 1);
  const dwarf = entries[0];
  assert.equal(dwarf.name, 'Dwarf');
  assert.equal(dwarf.category, 'races_classes');
  assert.ok(dwarf.stats?.traits);
  assert.equal(dwarf.stats.traits.length, 6);
  assert.equal(dwarf.stats.traits[0].name, 'Ability Score Increase');
  assert.ok(dwarf.stats.traits[0].desc.includes('Constitution score increases by 2'));
  assert.equal(dwarf.stats.traits[5].name, 'Dwarven Resilience');
  // Statblock extraction guard: NO monster stats on race
  assert.equal(dwarf.stats.ac, undefined);
  assert.equal(dwarf.stats.hp, undefined);
  assert.equal(dwarf.stats.cr, undefined);
});

test('Section-aware state machine correctly tracks chapters and ignores meta headers', () => {
  const fullDocument = `
# Legal & Attribution
System Reference Document 5.1 is provided under the Open Game License.

# Rules of Gameplay

# Beyond 1st Level
As your character goes on adventures and overcomes challenges, they gain experience.

# Ability Checks
An ability check tests a character's or monster's innate talent and training.

# The Environment
Subterranean adventures can take characters through caverns and dungeons.

# Character Races

# Dwarf
### Dwarf Traits
***Ability Score Increase***. Your Constitution score increases by 2.

# Character Classes

# Barbarian
A fierce warrior of primitive background who can enter a battle rage.

# Monsters & Creatures

# Modifying Monsters
This section provides guidance on tweaking existing monster stat blocks.

# Goblin
Small humanoid (goblinoid), neutral evil
Armor Class 15
Hit Points 7 (2d6)
Speed 30 ft.
STR 8 (-1) DEX 14 (+2) CON 10 (+0) INT 10 (+0) WIS 8 (-1) CHA 8 (-1)
Challenge 1/4 (50 XP)

# Treasure & Magic Items

# Bag of Holding
Wondrous Item, uncommon
This bag has an interior space considerably larger than its outside dimensions.

# Spellcasting & Spells

# Fireball
3rd-level evocation
Casting Time: 1 action
Range: 150 feet
Duration: Instantaneous
A bright streak flashes to a point and blossoms into fire.
`;

  const entries = parseMarkdownOrText(fullDocument);

  // 1. Meta header "# Legal & Attribution" must NOT create an entry
  assert.equal(entries.some(e => e.name === 'Legal & Attribution'), false);
  assert.equal(entries.some(e => e.name === 'Rules of Gameplay'), false);
  assert.equal(entries.some(e => e.name === 'Character Races'), false);
  assert.equal(entries.some(e => e.name === 'Character Classes'), false);
  assert.equal(entries.some(e => e.name === 'Monsters & Creatures'), false);
  assert.equal(entries.some(e => e.name === 'Treasure & Magic Items'), false);
  assert.equal(entries.some(e => e.name === 'Spellcasting & Spells'), false);

  // 2. Rules under # Rules of Gameplay must be categorized as 'rules'
  const beyond1st = entries.find(e => e.name === 'Beyond 1st Level');
  assert.ok(beyond1st, 'Beyond 1st Level entry exists');
  assert.equal(beyond1st.category, 'rules');
  assert.equal(beyond1st.stats?.ac, undefined);
  assert.equal(beyond1st.stats?.hp, undefined);
  assert.equal(beyond1st.stats?.cr, undefined);

  const abilityChecks = entries.find(e => e.name === 'Ability Checks');
  assert.ok(abilityChecks, 'Ability Checks entry exists');
  assert.equal(abilityChecks.category, 'rules');
  assert.equal(abilityChecks.stats?.ac, undefined);

  const environment = entries.find(e => e.name === 'The Environment');
  assert.ok(environment, 'The Environment entry exists');
  assert.equal(environment.category, 'rules');
  assert.equal(environment.stats?.ac, undefined);

  // 3. Races and Classes under their chapter headers (now separated)
  const dwarf = entries.find(e => e.name === 'Dwarf');
  assert.ok(dwarf);
  assert.equal(dwarf.category, 'races');
  assert.equal(dwarf.stats?.ac, undefined);

  const barbarian = entries.find(e => e.name === 'Barbarian');
  assert.ok(barbarian);
  assert.equal(barbarian.category, 'classes');
  assert.equal(barbarian.stats?.ac, undefined);

  // 4. In # Monsters & Creatures: "Modifying Monsters" has NO statblock, so it must default to 'rules'
  const modifyingMonsters = entries.find(e => e.name === 'Modifying Monsters');
  assert.ok(modifyingMonsters);
  assert.equal(modifyingMonsters.category, 'rules');
  assert.equal(modifyingMonsters.stats?.ac, undefined);

  // 5. Goblin has actual statblock -> 'monsters'
  const goblin = entries.find(e => e.name === 'Goblin');
  assert.ok(goblin);
  assert.equal(goblin.category, 'monsters');
  assert.equal(goblin.stats?.ac, 15);
  assert.equal(goblin.stats?.hp, 7);
  assert.equal(goblin.stats?.cr, '1/4');

  // 6. Magic Item under Treasure
  const bag = entries.find(e => e.name === 'Bag of Holding');
  assert.ok(bag);
  assert.equal(bag.category, 'items');
  assert.equal(bag.stats?.rarity, 'Uncommon');
  assert.equal(bag.stats?.ac, undefined);

  // 7. Spell under Spellcasting
  const fireball = entries.find(e => e.name === 'Fireball');
  assert.ok(fireball);
  assert.equal(fireball.category, 'spells');
  assert.equal(fireball.stats?.level, 3);
  assert.equal(fireball.stats?.ac, undefined);
});

test('Standalone entries without chapter headers default to rules unless explicit stats present', () => {
  const genericRule = `
# Combat Movement
On your turn, you can move a distance up to your speed.
`;
  const entries = parseMarkdownOrText(genericRule);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].name, 'Combat Movement');
  assert.equal(entries[0].category, 'rules');
  assert.equal(entries[0].stats?.ac, undefined);
  assert.equal(entries[0].stats?.hp, undefined);
});

test('sanitizeExistingEntries fixes previously miscategorized rules stored as monsters', () => {
  const badStoredEntries = [
    {
      id: 'bad1',
      name: 'Beyond 1st Level',
      category: 'monsters' as const,
      tags: ['Monster'],
      content: 'As your character goes on adventures...',
      stats: { ac: undefined, hp: undefined, cr: undefined }
    },
    {
      id: 'bad2',
      name: 'Ability Checks',
      category: 'monsters' as const,
      tags: ['Monster'],
      content: 'To make an ability check...',
      stats: {}
    },
    {
      id: 'good_monster',
      name: 'Goblin',
      category: 'monsters' as const,
      tags: ['Monster', 'CR 1/4'],
      content: 'Armor Class 15\nHit Points 7\nChallenge 1/4',
      stats: { ac: 15, hp: 7, cr: '1/4' }
    }
  ];

  const cleaned = sanitizeExistingEntries(badStoredEntries as any);
  assert.equal(cleaned[0].name, 'Beyond 1st Level');
  assert.equal(cleaned[0].category, 'rules');
  assert.equal(cleaned[0].stats?.ac, undefined);

  assert.equal(cleaned[1].name, 'Ability Checks');
  assert.equal(cleaned[1].category, 'rules');

  assert.equal(cleaned[2].name, 'Goblin');
  assert.equal(cleaned[2].category, 'monsters');
  assert.equal(cleaned[2].stats?.ac, 15);
});

test('parseJsonImport parses valid JSON array and guards monster stats', () => {
  const jsonStr = JSON.stringify([
    {
      name: 'Fireball',
      category: 'spells',
      tags: ['Evocation', 'Level 3'],
      stats: { level: 3, school: 'Evocation', ac: 10 } // ac should be stripped on non-monster
    }
  ]);

  const items = parseJsonImport(jsonStr);
  assert.equal(items.length, 1);
  assert.equal(items[0].name, 'Fireball');
  assert.equal(items[0].category, 'spells');
  assert.equal(items[0].stats?.level, 3);
  assert.equal(items[0].stats?.ac, undefined);
});

test('filterEntries correctly filters by category and search text including races_classes', () => {
  const list = [
    {
      id: '1',
      name: 'Goblin',
      category: 'monsters' as const,
      tags: ['Goblinoid'],
      stats: { cr: '1/4' }
    },
    {
      id: '2',
      name: 'Dwarf',
      category: 'races_classes' as const,
      tags: ['Race'],
      stats: {}
    },
    {
      id: '3',
      name: 'Fireball',
      category: 'spells' as const,
      tags: ['Evocation'],
      stats: { level: 3 }
    }
  ];

  const racesOnly = filterEntries(list as any, { category: 'races' });
  assert.equal(racesOnly.length, 1);
  assert.equal(racesOnly[0].name, 'Dwarf');

  const searched = filterEntries(list as any, { query: 'gob' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].name, 'Goblin');
});

test('parseMarkdownOrText processes full SRD compendium with all categories and strict stat isolation', async () => {
  const { SRD_COMPLETE_MARKDOWN } = await import('../data/srdDocumentText.ts');
  const entries = parseMarkdownOrText(SRD_COMPLETE_MARKDOWN);

  assert.ok(entries.length >= 190, `Expected at least 190 entries, got ${entries.length}`);

  const monsters = entries.filter(e => e.category === 'monsters');
  assert.ok(monsters.length >= 35, `Expected >= 35 monsters, got ${monsters.length}`);
  for (const m of monsters) {
    assert.ok(m.stats?.ac !== undefined, `Monster ${m.name} must have AC`);
    assert.ok(m.stats?.hp !== undefined, `Monster ${m.name} must have HP`);
    assert.ok(m.stats?.cr !== undefined, `Monster ${m.name} must have CR`);
  }

  const spells = entries.filter(e => e.category === 'spells');
  assert.ok(spells.length >= 50, `Expected >= 50 spells, got ${spells.length}`);
  const fireball = spells.find(s => s.name === 'Fireball');
  assert.ok(fireball);
  assert.equal(fireball.stats?.level, 3);
  assert.equal(fireball.stats?.school, 'Evocation');
  assert.equal(fireball.stats?.ac, undefined);
  assert.ok(fireball.tags.includes('Action'));

  const items = entries.filter(e => e.category === 'items' || e.category === 'equipment' || e.category === 'magic_items');
  assert.ok(items.length >= 40, `Expected >= 40 items, got ${items.length}`);
  const bag = items.find(i => i.name === 'Bag of Holding');
  assert.ok(bag);
  assert.equal(bag.stats?.rarity, 'Uncommon');
  assert.equal(bag.stats?.ac, undefined);

  // Races and Classes separated
  const races = entries.filter(e => e.category === 'races');
  assert.ok(races.length >= 8, `Expected >= 8 races, got ${races.length}`);
  const dwarf = races.find(r => r.name === 'Dwarf');
  assert.ok(dwarf);
  assert.ok(dwarf.stats?.traits && dwarf.stats.traits.length > 0);
  assert.equal(dwarf.stats.ac, undefined);

  const classes = entries.filter(e => e.category === 'classes');
  assert.ok(classes.length >= 10, `Expected >= 10 classes, got ${classes.length}`);
  const wizard = classes.find(c => c.name === 'Wizard');
  assert.ok(wizard);
  assert.equal(wizard.stats?.ac, undefined);

  // Actions category
  const actions = entries.filter(e => e.category === 'actions');
  assert.ok(actions.length >= 10, `Expected >= 10 actions, got ${actions.length}`);
  const dash = actions.find(a => a.name.includes('Dash'));
  assert.ok(dash);
  assert.ok(dash.tags.includes('Action'));
  const hide = actions.find(a => a.name === 'Hide');
  assert.ok(hide);
  assert.ok(hide.tags.includes('Action'));

  const rules = entries.filter(e => e.category === 'rules');
  assert.ok(rules.length >= 15, `Expected >= 15 rules, got ${rules.length}`);
  const combat = rules.find(r => r.name === 'COMBAT');
  assert.ok(combat);
  assert.equal(combat.stats?.ac, undefined);
});

test('5etools SEED_LIBRARY contains all sourcebooks, categories, cross-reference links, and monster profiles', async () => {
  const { SEED_LIBRARY, FIVE_E_TOOLS_SOURCEBOOKS, getSourcebookFullName } = await import('../data/seedData.ts');
  const { buildCrossReferenceIndex } = await import('./importer.ts');
  const { parseMonsterCombatProfile } = await import('./monsterCombatParser.ts');
  const { buildCharacterFromSrdChoices } = await import('./combatMechanics.ts');

  assert.ok(SEED_LIBRARY.length >= 12000, `Expected >= 12000 5etools entries, got ${SEED_LIBRARY.length}`);
  assert.ok(Object.keys(FIVE_E_TOOLS_SOURCEBOOKS).length >= 130, 'Expected >= 130 sourcebooks');
  assert.ok(getSourcebookFullName('XPHB').includes('Handbook (2024)'), 'XPHB full title resolved');
  assert.ok(getSourcebookFullName('TCE').includes('Tasha'), 'TCE full title resolved');

  // Verify sourcebook filtering works across books (e.g., TCE, XGE, MPMM, XPHB)
  const tceEntries = filterEntries(SEED_LIBRARY, { source: 'TCE' });
  assert.ok(tceEntries.length >= 150, `Expected >= 150 TCE entries, got ${tceEntries.length}`);
  const xgeEntries = filterEntries(SEED_LIBRARY, { source: 'XGE' });
  assert.ok(xgeEntries.length >= 150, `Expected >= 150 XGE entries, got ${xgeEntries.length}`);

  // Verify cross-reference index resolves links with and without explicit sourcebook
  const { resolveLink, getSourceVariants } = buildCrossReferenceIndex(SEED_LIBRARY);
  const fireballXphb = resolveLink('Fireball', 'XPHB');
  assert.ok(fireballXphb, 'Resolved Fireball|XPHB');
  assert.equal(fireballXphb.source, 'XPHB');
  assert.ok(fireballXphb.content?.includes('[['), 'Fireball has cross-reference links to classes/subclasses');

  const fireballVariants = getSourceVariants(fireballXphb);
  assert.ok(fireballVariants.length >= 2, 'Fireball has multiple sourcebook printings (XPHB & PHB)');

  const fireballPhb = resolveLink('Fireball', 'PHB');
  assert.ok(fireballPhb, 'Resolved Fireball|PHB');
  assert.equal(fireballPhb.source, 'PHB');

  const wizardXphb = resolveLink('Wizard', 'XPHB');
  assert.ok(wizardXphb, 'Resolved Wizard|XPHB');
  assert.ok(wizardXphb.content?.includes('Subclass'), 'Wizard includes Subclasses cross-reference section');
  assert.ok(wizardXphb.content?.includes('Wizard Spell List'), 'Wizard includes Wizard Spell List cross-reference section');

  // Verify 2024 & 2014 monster combat parser works on 5etools monsters
  const lichXmm = resolveLink('Lich', 'XMM') || resolveLink('Lich');
  assert.ok(lichXmm, 'Resolved Lich monster');
  const lichProfile = parseMonsterCombatProfile(lichXmm, SEED_LIBRARY);
  assert.ok(lichProfile.actions.length > 0, 'Parsed Lich combat actions');
  assert.ok(lichProfile.spells.length > 0, 'Extracted Lich spell cross-references');

  // Verify Character Builder works with 5etools Artificer and 5etools species/backgrounds
  const artificerChar = buildCharacterFromSrdChoices(
    {
      name: 'Tinker',
      species: 'Warforged',
      className: 'Artificer',
      subclass: 'Battle Smith',
      background: 'Guild Artisan',
      level: 5,
      abilities: { str: 10, dex: 14, con: 14, int: 18, wis: 12, cha: 10 },
    },
    SEED_LIBRARY
  );
  assert.equal(artificerChar.race, 'Warforged');
  assert.ok(artificerChar.characterClass.includes('Artificer'));
  assert.ok(artificerChar.features && artificerChar.features.length > 0);
});
