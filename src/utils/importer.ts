import type { Category, LibraryEntry } from '../types.ts';

// Recognized Chapter Headers that drive the state machine
const CHAPTER_DEFINITIONS: Array<{
  pattern: RegExp;
  category: Category | 'meta';
}> = [
  // Meta headers to ignore (no compendium entry created)
  {
    pattern: /^(legal\s*(&|and)\s*attribution|table\s*of\s*contents|open\s*game\s*license|ogl|system\s*reference\s*document|srd(\s*5\.?1)?)$/i,
    category: 'meta',
  },
  // Character Races -> races
  {
    pattern: /^(character\s*races|races)$/i,
    category: 'races',
  },
  // Character Classes -> classes
  {
    pattern: /^(character\s*classes|classes)$/i,
    category: 'classes',
  },
  // Combined legacy races and classes
  {
    pattern: /^(races\s*(&|and)\s*classes)$/i,
    category: 'races_classes',
  },
  // Actions in Combat / Non-spell actions -> actions
  {
    pattern: /^(actions\s*in\s*combat|combat\s*actions|non[- ]spell\s*actions|actions)$/i,
    category: 'actions',
  },
  // Spellcasting & Spells -> spells
  {
    pattern: /^(spellcasting\s*(&|and)\s*spells|spells\s*(&|and)\s*spellcasting|spells|spellcasting)$/i,
    category: 'spells',
  },
  // Monsters & Creatures -> monsters
  {
    pattern: /^(monsters\s*(&|and)\s*creatures|creatures\s*(&|and)\s*monsters|monsters|bestiary|creatures)$/i,
    category: 'monsters',
  },
  // Treasure, Equipment & Magic Items -> items
  {
    pattern: /^(treasure\s*(&|and)\s*magic\s*items|magic\s*items\s*(&|and)\s*treasure|equipment\s*(&|and)\s*expenses|magic\s*items|equipment|treasure|items)$/i,
    category: 'items',
  },
  // Rules of Gameplay, Gamemastering, Backgrounds -> rules
  {
    pattern: /^(rules\s*of\s*gameplay|gameplay\s*rules|gamemastering|character\s*customization\s*(&|and)\s*backgrounds|customization\s*(&|and)\s*backgrounds|core\s*rules|rules|appendix)$/i,
    category: 'rules',
  },
];

/**
 * Checks if a heading title corresponds to a Chapter/Section header in the state machine.
 */
function matchChapterHeader(rawHeading: string): Category | 'meta' | null {
  const clean = rawHeading
    .replace(/^#+\s*/, '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  for (const def of CHAPTER_DEFINITIONS) {
    if (def.pattern.test(clean)) {
      return def.category;
    }
  }
  return null;
}

/**
 * Checks if text contains indicators of a genuine Monster Statblock
 */
export function hasMonsterStatblock(text: string): boolean {
  const lower = text.toLowerCase();
  const hasAc = lower.includes('armor class');
  const hasHp = lower.includes('hit points');
  const hasChallenge = lower.includes('challenge') || lower.includes('cr ');
  const hasAbilities = /str\s+\d+/i.test(text) && /dex\s+\d+/i.test(text);

  return (hasAc && hasHp) || (hasAc && hasChallenge) || (hasHp && hasAbilities);
}

// Subheadings that commonly appear inside a single monster statblock and should NOT be split into separate entries
const STATBLOCK_INTERNAL_SUBSECTIONS = /^(actions|reactions|legendary actions|bonus actions|traits|description|lair actions|special traits)$/i;

interface RawSection {
  heading: string;
  chapterCategory: Category | null;
  body: string;
}

/**
 * Parses markdown or plain text with a section-aware state machine.
 * Tracks active chapter category across top-level headers (# Chapter).
 * Defaults ambiguous entries to 'rules' (never 'monsters').
 * Strictly guards statblock extraction so AC, HP, and CR are only parsed for 'monsters'.
 */
export function parseMarkdownOrText(text: string): LibraryEntry[] {
  if (!text || !text.trim()) return [];

  // Remove markdown span artifacts and HTML anchor tags
  const cleaned = text
    .replace(/\[span_\d+\]\((?:start|end)_span\)/g, '')
    .replace(/<a\s+id="[^"]*">\s*<\/a>/gi, '')
    .trim();
  const lines = cleaned.split('\n');

  let activeChapterCategory: Category | null = null;
  const rawSections: RawSection[] = [];

  let currentHeading = '';
  let currentLines: string[] = [];

  const flushCurrent = () => {
    if (currentHeading && currentLines.length > 0) {
      rawSections.push({
        heading: currentHeading,
        chapterCategory: activeChapterCategory,
        body: currentLines.join('\n').trim(),
      });
    }
    currentHeading = '';
    currentLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headerMatch) {
      const level = headerMatch[1].length;
      const headingText = headerMatch[2].trim();

      // Check if this is a chapter/meta header
      const chapterMatch = level <= 2 ? matchChapterHeader(headingText) : null;

      if (chapterMatch !== null) {
        // This is a Chapter Header! Flush previous entry and update state machine
        flushCurrent();

        if (chapterMatch === 'meta') {
          // Meta section: do not create an entry and deactivate chapter category
          activeChapterCategory = null;
        } else {
          // Active chapter updated
          activeChapterCategory = chapterMatch;
        }
        continue;
      }

      // Determine if this header starts a new compendium entry
      let startsNewEntry = false;

      if (activeChapterCategory === 'spells') {
        // Under spellcasting, every #, ##, ### heading is a distinct spell
        startsNewEntry = true;
      } else if (activeChapterCategory === 'monsters') {
        // Under monsters, each heading that is not an internal subsection (like Actions) is a creature entry
        if (!STATBLOCK_INTERNAL_SUBSECTIONS.test(headingText)) {
          startsNewEntry = true;
        }
      } else if (activeChapterCategory === 'items') {
        // Under items, # Magic Items or # Sentient Magic are overview entries, ## and ### are items
        startsNewEntry = true;
      } else if (activeChapterCategory === 'races_classes' || activeChapterCategory === 'rules') {
        // Under races/classes or rules, each top-level # heading is an entry (e.g. # Dwarf, # Barbarian, # ABILITIES),
        // whereas ## and ### (like ### Dwarf Traits, ## Hill Dwarf, ### Rage) are subsections of that entry.
        if (level === 1) {
          startsNewEntry = true;
        }
      } else {
        // Standalone or unknown chapter
        if (level === 1) {
          startsNewEntry = true;
        } else if (!STATBLOCK_INTERNAL_SUBSECTIONS.test(headingText)) {
          // Look ahead to see if it's a spell or monster or magic item
          const nextLines = lines.slice(i + 1, i + 6).join('\n').toLowerCase();
          const isSpell = nextLines.includes('casting time') || nextLines.includes('cantrip') || /\d(?:st|nd|rd|th)-level/i.test(nextLines);
          const isMonster = nextLines.includes('armor class') || nextLines.includes('hit points');
          const isItem = nextLines.includes('wondrous item') || nextLines.includes('weapon (') || nextLines.includes('armor (') || nextLines.includes('rarity');
          if (isSpell || isMonster || isItem) {
            startsNewEntry = true;
          }
        }
      }

      if (startsNewEntry) {
        flushCurrent();
        currentHeading = headingText;
        continue;
      }
    }

    if (currentHeading) {
      currentLines.push(line);
    } else if (line.trim().length > 0 && !line.startsWith('---') && !line.startsWith('<a id=')) {
      // Content before first entry heading
      currentHeading = line.trim();
    }
  }

  flushCurrent();

  // Fallback splitting by '---' if still empty
  if (rawSections.length === 0 && cleaned.includes('---')) {
    const chunks = cleaned.split(/\n\s*---\s*\n/);
    for (const chunk of chunks) {
      const chunkTrimmed = chunk.trim();
      if (!chunkTrimmed) continue;
      const chunkLines = chunkTrimmed.split('\n');
      const firstLine = chunkLines[0].replace(/^#+\s*/, '').trim();
      rawSections.push({
        heading: firstLine,
        chapterCategory: null,
        body: chunkLines.slice(1).join('\n').trim(),
      });
    }
  }

  // If still empty and text exists, treat entire text as a single entry
  if (rawSections.length === 0 && cleaned.length > 0) {
    const firstLine = lines[0].replace(/^#+\s*/, '').trim();
    rawSections.push({
      heading: firstLine || 'Untitled Entry',
      chapterCategory: null,
      body: lines.slice(1).join('\n').trim(),
    });
  }

  const results: LibraryEntry[] = [];

  for (const section of rawSections) {
    const entry = processSectionEntry(section);
    if (entry) {
      results.push(entry);
    }
  }

  return results;
}

function processSectionEntry(sec: RawSection): LibraryEntry | null {
  const name = sec.heading.trim();
  if (!name) return null;

  const fullContent = `# ${name}\n\n${sec.body}`.trim();
  const lower = fullContent.toLowerCase();

  let category: Category = 'rules'; // Safe default: NEVER default to monsters!
  const tags: string[] = [];
  const stats: Record<string, any> = {};

  // 1. Determine Category via Chapter State Machine or Content
  if (sec.chapterCategory) {
    if (sec.chapterCategory === 'monsters') {
      // Under # Monsters & Creatures: ONLY assign 'monsters' if it actually contains a stat block!
      if (hasMonsterStatblock(fullContent)) {
        category = 'monsters';
      } else {
        // An intro or lore section under monsters without stats defaults to Core Rules
        category = 'rules';
      }
    } else {
      category = sec.chapterCategory;
    }
  } else {
    // Standalone entry without chapter header
    if (hasMonsterStatblock(fullContent)) {
      category = 'monsters';
    } else if (
      lower.includes('casting time') ||
      lower.includes('spell level') ||
      lower.includes('cantrip') ||
      lower.includes('evocation') ||
      lower.includes('abjuration') ||
      lower.includes('transmutation') ||
      lower.includes('conjuration') ||
      lower.includes('necromancy') ||
      lower.includes('enchantment') ||
      lower.includes('divination') ||
      lower.includes('illusion')
    ) {
      category = 'spells';
    } else if (
      lower.includes('traits') ||
      lower.includes('ability score increase') ||
      lower.includes('dwarven resilience') ||
      lower.includes('class features')
    ) {
      category = 'races_classes';
    } else if (
      lower.includes('wondrous item') ||
      lower.includes('weapon (') ||
      lower.includes('armor (') ||
      lower.includes('potion of') ||
      lower.includes('scroll of') ||
      lower.includes('rarity')
    ) {
      category = 'items';
    } else {
      category = 'rules'; // Guaranteed safe fallback
    }
  }

  // 2. Assign Baseline Tags
  if (category === 'races') {
    tags.push('Race');
  } else if (category === 'classes') {
    tags.push('Class');
  } else if (category === 'races_classes') {
    tags.push('Race/Class');
  } else if (category === 'actions') {
    tags.push('Combat Action');
    if (lower.includes('bonus action')) {
      tags.push('Bonus Action');
      stats.actionType = 'Bonus Action';
    } else if (lower.includes('reaction')) {
      tags.push('Reaction');
      stats.actionType = 'Reaction';
    } else {
      tags.push('Action');
      stats.actionType = 'Action';
    }
  } else if (category === 'monsters') {
    tags.push('Monster');
  } else if (category === 'spells') {
    tags.push('Spell');
  } else if (category === 'items') {
    tags.push('Magic Item');
  } else {
    tags.push('Core Rules');
  }

  // 3. STATBLOCK EXTRACTION GUARD:
  // "Only attempt to parse AC, HP, and CR if the entry's category is explicitly 'monsters'.
  // Leave them completely hidden/unset for rules, races, and items."
  if (category === 'monsters') {
    // Parse Size, Type, Alignment: e.g. "Large aberration, lawful evil" or "Medium humanoid (any race), any alignment"
    const sizeTypeMatch = sec.body.match(/^(Tiny|Small|Medium|Large|Huge|Gargantuan)\s+([^,\n]+),\s*([^\n]+)/im);
    if (sizeTypeMatch) {
      stats.size = sizeTypeMatch[1].trim();
      stats.type = sizeTypeMatch[2].trim();
      stats.alignment = sizeTypeMatch[3].trim();
      tags.push(stats.size);
      if (stats.type.includes('dragon')) tags.push('Dragon');
      else if (stats.type.includes('undead')) tags.push('Undead');
      else if (stats.type.includes('elemental')) tags.push('Elemental');
      else if (stats.type.includes('humanoid')) tags.push('Humanoid');
      else if (stats.type.includes('monstrosity')) tags.push('Monstrosity');
      else if (stats.type.includes('aberration')) tags.push('Aberration');
    }

    // Parse AC
    const acMatch = fullContent.match(/Armor Class\s+([0-9]+)/i);
    if (acMatch) stats.ac = parseInt(acMatch[1], 10);

    // Parse HP
    const hpMatch = fullContent.match(/Hit Points\s+([0-9]+)(?:\s*\(([^)]+)\))?/i);
    if (hpMatch) stats.hp = parseInt(hpMatch[1], 10);

    // Parse Speed
    const speedMatch = fullContent.match(/Speed\s+([^\n]+)/i);
    if (speedMatch) stats.speed = speedMatch[1].trim();

    // Parse CR
    const crMatch = fullContent.match(/Challenge\s+([0-9/]+)/i);
    if (crMatch) {
      stats.cr = crMatch[1];
      tags.push(`CR ${crMatch[1]}`);
    }

    // Parse Ability Scores
    const statsMatch = fullContent.match(
      /STR\s+(\d+)\s*\(([-+]?\d+)\)\s*DEX\s+(\d+)\s*\(([-+]?\d+)\)\s*CON\s+(\d+)\s*\(([-+]?\d+)\)\s*INT\s+(\d+)\s*\(([-+]?\d+)\)\s*WIS\s+(\d+)\s*\(([-+]?\d+)\)\s*CHA\s+(\d+)\s*\(([-+]?\d+)\)/i
    );
    if (statsMatch) {
      stats.abilities = {
        str: parseInt(statsMatch[1], 10),
        dex: parseInt(statsMatch[3], 10),
        con: parseInt(statsMatch[5], 10),
        int: parseInt(statsMatch[7], 10),
        wis: parseInt(statsMatch[9], 10),
        cha: parseInt(statsMatch[11], 10),
      };
    }

    // Extract Monster Traits & Actions
    const traitRegex = /\*\*\*([^*]+)\*\*\*\.?\s*([^\n*]+(?:\n(?!\*\*\*|\n)[^\n*]+)*)/g;
    const traits: Array<{ name: string; desc: string }> = [];
    let tMatch;
    while ((tMatch = traitRegex.exec(fullContent)) !== null) {
      traits.push({
        name: tMatch[1].trim(),
        desc: tMatch[2].trim(),
      });
    }
    if (traits.length > 0) {
      stats.traits = traits;
    }

    // Actions match
    const actionsMatch = fullContent.match(/Actions:?\s*([^\n]+(?:\n(?!#|\*\*\*)[^\n]+)*)/i);
    if (actionsMatch) {
      stats.actions = [{ name: 'Actions', desc: actionsMatch[1].trim() }];
    }
  }

  // 4. Category-Specific Trait / Spell / Item Extraction
  if (category === 'races_classes' || category === 'races' || category === 'classes') {
    const traitRegex = /\*\*\*([^*]+)\*\*\*\.?\s*([^\n*]+(?:\n(?!\*\*\*|\n)[^\n*]+)*)/g;
    const traits: Array<{ name: string; desc: string }> = [];
    let match;
    while ((match = traitRegex.exec(fullContent)) !== null) {
      traits.push({
        name: match[1].trim(),
        desc: match[2].trim(),
      });
    }
    if (traits.length > 0) {
      stats.traits = traits;
    }
  } else if (category === 'spells') {
    // Spell level and school: e.g. "*2nd-level evocation*" or "3rd-level evocation" or "*Conjuration cantrip*"
    const levelSchoolMatch = fullContent.match(/\*?([0-9])(?:st|nd|rd|th)?[- ]level\s+([^*|\n]+)\*?/i);
    if (levelSchoolMatch) {
      stats.level = parseInt(levelSchoolMatch[1], 10);
      const schoolRaw = levelSchoolMatch[2].replace(/\(ritual\)/i, '').trim();
      stats.school = schoolRaw.charAt(0).toUpperCase() + schoolRaw.slice(1).toLowerCase();
      tags.push(`Level ${stats.level}`, stats.school);
      if (lower.includes('(ritual)')) tags.push('Ritual');
    } else {
      const cantripMatch = fullContent.match(/\*?([a-z]+)\s+cantrip\*?/i);
      if (cantripMatch) {
        stats.level = 0;
        stats.school = cantripMatch[1].charAt(0).toUpperCase() + cantripMatch[1].slice(1).toLowerCase();
        tags.push('Cantrip', stats.school);
      }
    }

    const castingTimeMatch = fullContent.match(/Casting Time:?\s*([^|\n]+)/i);
    if (castingTimeMatch) {
      stats.castingTime = castingTimeMatch[1].trim();
      const ctLower = stats.castingTime.toLowerCase();
      if (ctLower.includes('bonus action')) {
        tags.push('Bonus Action');
        stats.actionType = 'Bonus Action';
      } else if (ctLower.includes('reaction')) {
        tags.push('Reaction');
        stats.actionType = 'Reaction';
      } else if (ctLower.includes('action')) {
        tags.push('Action');
        stats.actionType = 'Action';
      }
    }

    const rangeMatch = fullContent.match(/Range:?\s*([^|\n]+)/i);
    if (rangeMatch) stats.range = rangeMatch[1].trim();

    const componentsMatch = fullContent.match(/Components:?\s*([^|\n]+)/i);
    if (componentsMatch) stats.components = componentsMatch[1].trim();

    const durationMatch = fullContent.match(/Duration:?\s*([^|\n]+)/i);
    if (durationMatch) stats.duration = durationMatch[1].trim();

    // Damage / Healing / Saving Throw / Attack extraction
    const damageMatch = fullContent.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+(fire|cold|lightning|acid|poison|radiant|necrotic|force|psychic|thunder|slashing|piercing|bludgeoning)\s+damage/i);
    if (damageMatch) {
      stats.damage = damageMatch[1];
      stats.damageType = damageMatch[2].charAt(0).toUpperCase() + damageMatch[2].slice(1).toLowerCase();
      tags.push(`${stats.damageType} Damage`);
    } else {
      const generalDmg = fullContent.match(/takes?\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+damage/i);
      if (generalDmg) {
        stats.damage = generalDmg[1];
      }
    }

    const healingMatch = fullContent.match(/(?:regains?|restores?)\s+(?:hit\s+points\s+equal\s+to\s+)?(\d+d\d+(?:\s*[+-]\s*[^.\n]+)?|\d+)\s*(?:hit\s+points|HP)/i);
    if (healingMatch) {
      stats.healing = healingMatch[1].trim();
      tags.push('Healing');
    }

    const saveMatch = fullContent.match(/(Dexterity|Constitution|Wisdom|Strength|Intelligence|Charisma)\s+(?:saving\s+throw|save)/i);
    if (saveMatch) {
      stats.saveType = `${saveMatch[1].slice(0, 3).toUpperCase()} Save`;
    }

    const attackMatch = fullContent.match(/(melee\s+spell\s+attack|ranged\s+spell\s+attack|melee\s+weapon\s+attack|ranged\s+weapon\s+attack)/i);
    if (attackMatch) {
      stats.attackType = attackMatch[1].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const aoeMatch = fullContent.match(/(\d+[- ]foot[- ]radius\s+(?:sphere|circle)|\d+[- ]foot\s+(?:cone|line|cube|square|radius))/i);
    if (aoeMatch) {
      stats.areaOfEffect = aoeMatch[1].trim();
    }
  } else if (category === 'actions') {
    stats.actionType = 'Action';
    if (lower.includes('bonus action') || tags.includes('Bonus Action')) {
      stats.actionType = 'Bonus Action';
    } else if (lower.includes('reaction') || tags.includes('Reaction')) {
      stats.actionType = 'Reaction';
    }

    const actionLower = name.toLowerCase();
    if (actionLower.includes('attack')) {
      stats.damage = 'Weapon Damage + Mod (e.g. 1d8+STR)';
      stats.attackType = 'Melee or Ranged Weapon Attack';
      stats.range = '5 ft reach or ranged';
    } else if (actionLower.includes('dash')) {
      stats.range = 'Self';
      stats.damage = 'Extra movement equal to Speed';
    } else if (actionLower.includes('disengage')) {
      stats.range = 'Self';
      stats.damage = 'Movement prevents opportunity attacks';
    } else if (actionLower.includes('dodge')) {
      stats.range = 'Self';
      stats.saveType = 'Advantage on DEX saves, attackers have disadvantage';
    } else if (actionLower.includes('help')) {
      stats.range = '5 feet';
      stats.damage = 'Advantage on ally check or attack';
    } else if (actionLower.includes('hide')) {
      stats.range = 'Self';
      stats.saveType = 'Dexterity (Stealth) vs Passive Perception';
    } else if (actionLower.includes('grapple')) {
      stats.range = '5 feet';
      stats.saveType = 'Athletics vs Athletics/Acrobatics (Grappled)';
    } else if (actionLower.includes('shove')) {
      stats.range = '5 feet';
      stats.saveType = 'Athletics vs Athletics/Acrobatics (Prone/Push)';
    } else if (actionLower.includes('opportunity attack')) {
      stats.range = '5 ft reach';
      stats.attackType = 'Melee Weapon Attack (Reaction)';
      stats.damage = '1 Melee Weapon Attack';
    } else if (actionLower.includes('two-weapon fighting')) {
      stats.range = '5 ft';
      stats.attackType = 'Melee Weapon Attack (Bonus Action)';
      stats.damage = 'Off-hand light weapon attack (no ability mod)';
    }
  } else if (category === 'items') {
    const rarityRegex = /\b(common|uncommon|very rare|rare|legendary|artifact)\b/i;
    const match = fullContent.match(rarityRegex);
    if (match) {
      stats.rarity = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      tags.push(stats.rarity);
    }
    if (lower.includes('requires attunement')) {
      stats.attunement = true;
      tags.push('Attunement');
    }
    if (lower.includes('weapon')) tags.push('Weapon');
    else if (lower.includes('armor') || lower.includes('shield')) tags.push('Armor');
    else if (lower.includes('potion')) tags.push('Potion');
    else if (lower.includes('ring')) tags.push('Ring');
    else if (lower.includes('rod') || lower.includes('wand') || lower.includes('staff')) tags.push('Focus/Rod');
  }

  // Summary extraction: first non-header, non-trait line
  let summary = '';
  const bodyLines = sec.body.split('\n');
  for (const line of bodyLines) {
    const l = line.trim();
    if (l && !l.startsWith('#') && !l.startsWith('***') && !l.startsWith('---') && !l.startsWith('<a')) {
      summary = l;
      break;
    }
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return {
    id: `srd_${slug || Math.random().toString(36).substring(2, 7)}`,
    name,
    category,
    tags: Array.from(new Set(tags)),
    summary: summary.slice(0, 200),
    content: fullContent,
    stats,
    source: 'SRD 5.1',
    custom: false,
    createdAt: Date.now(),
  };
}

/**
 * Sanitizes existing database entries to fix previously miscategorized entries
 * (e.g. rules like "Beyond 1st Level" defaulting to monsters with null AC/HP,
 * or legacy races_classes combining races and classes together).
 */
export function sanitizeExistingEntries(entries: LibraryEntry[]): LibraryEntry[] {
  const CLASS_NAMES = new Set([
    'barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk',
    'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
  ]);

  return entries.map(entry => {
    if (entry.id && entry.id.startsWith('5et_')) {
      return entry;
    }
    let category = entry.category;
    let tags = [...entry.tags];
    let stats = entry.stats ? { ...entry.stats } : {};

    // 1. If an entry is marked as monster but has no AC, no HP, and doesn't match a stat block
    if (category === 'monsters') {
      const hasStats = (stats.ac !== undefined && stats.ac !== null) ||
                        (stats.hp !== undefined && stats.hp !== null);
      const isActualMonster = hasStats || hasMonsterStatblock(entry.content || '');

      if (!isActualMonster) {
        // Recategorize as rules and clear empty monster stats
        delete stats.ac;
        delete stats.hp;
        delete stats.cr;
        delete stats.speed;
        delete stats.abilities;
        category = 'rules';
        tags = tags.filter(t => t !== 'Monster' && !t.startsWith('CR '));
        if (!tags.includes('Core Rules')) tags.push('Core Rules');
      }
    }

    // 2. Separate legacy races_classes into distinct races vs classes
    if (category === 'races_classes') {
      const isClass = CLASS_NAMES.has(entry.name.toLowerCase().trim()) || tags.includes('Class');
      if (isClass) {
        category = 'classes';
        tags = tags.filter(t => t !== 'Race/Class').concat('Class');
      } else {
        category = 'races';
        tags = tags.filter(t => t !== 'Race/Class').concat('Race');
      }
    }

    // 3. Ensure spells have Action Economy tags, Damage, Healing, and Saves
    if (category === 'spells') {
      const ct = (stats.castingTime || entry.content || '').toLowerCase();
      if (ct.includes('bonus action')) {
        if (!tags.includes('Bonus Action')) tags.push('Bonus Action');
        stats.actionType = 'Bonus Action';
      } else if (ct.includes('reaction')) {
        if (!tags.includes('Reaction')) tags.push('Reaction');
        stats.actionType = 'Reaction';
      } else if (ct.includes('action')) {
        if (!tags.includes('Action')) tags.push('Action');
        stats.actionType = 'Action';
      }

      if (!stats.damage && entry.content) {
        const dmgMatch = entry.content.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+(fire|cold|lightning|acid|poison|radiant|necrotic|force|psychic|thunder|slashing|piercing|bludgeoning)\s+damage/i);
        if (dmgMatch) {
          stats.damage = dmgMatch[1];
          stats.damageType = dmgMatch[2].charAt(0).toUpperCase() + dmgMatch[2].slice(1).toLowerCase();
          tags.push(`${stats.damageType} Damage`);
        } else {
          const genDmg = entry.content.match(/takes?\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+damage/i);
          if (genDmg) stats.damage = genDmg[1];
        }
      }

      if (!stats.healing && entry.content) {
        const healMatch = entry.content.match(/(?:regains?|restores?)\s+(?:hit\s+points\s+equal\s+to\s+)?(\d+d\d+(?:\s*[+-]\s*[^.\n]+)?|\d+)\s*(?:hit\s+points|HP)/i);
        if (healMatch) {
          stats.healing = healMatch[1].trim();
          tags.push('Healing');
        }
      }

      if (!stats.saveType && entry.content) {
        const sMatch = entry.content.match(/(Dexterity|Constitution|Wisdom|Strength|Intelligence|Charisma)\s+(?:saving\s+throw|save)/i);
        if (sMatch) stats.saveType = `${sMatch[1].slice(0, 3).toUpperCase()} Save`;
      }
    }

    // 4. Ensure actions have Action Economy tags & damage
    if (category === 'actions') {
      const lower = (entry.name + ' ' + (entry.content || '')).toLowerCase();
      if (lower.includes('bonus action')) {
        if (!tags.includes('Bonus Action')) tags.push('Bonus Action');
        stats.actionType = 'Bonus Action';
      } else if (lower.includes('reaction')) {
        if (!tags.includes('Reaction')) tags.push('Reaction');
        stats.actionType = 'Reaction';
      } else {
        if (!tags.includes('Action')) tags.push('Action');
        stats.actionType = 'Action';
      }

      const actionLower = entry.name.toLowerCase();
      if (!stats.damage) {
        if (actionLower.includes('attack')) stats.damage = 'Weapon Damage + Mod (e.g. 1d8+STR)';
        else if (actionLower.includes('dash')) stats.damage = 'Extra movement equal to Speed';
        else if (actionLower.includes('disengage')) stats.damage = 'Prevents opportunity attacks';
        else if (actionLower.includes('help')) stats.damage = 'Advantage on ally check or attack';
        else if (actionLower.includes('grapple')) stats.damage = 'Inflicts Grappled condition';
        else if (actionLower.includes('shove')) stats.damage = 'Knock prone or push 5 ft';
        else if (actionLower.includes('opportunity attack')) stats.damage = '1 Melee Weapon Attack';
        else if (actionLower.includes('two-weapon fighting')) stats.damage = 'Off-hand weapon attack (no mod)';
      }
      if (!stats.saveType) {
        if (actionLower.includes('dodge')) stats.saveType = 'Advantage on DEX saves';
        else if (actionLower.includes('hide')) stats.saveType = 'Stealth vs Passive Perception';
        else if (actionLower.includes('grapple') || actionLower.includes('shove')) stats.saveType = 'Athletics vs Athletics/Acrobatics';
      }
    }

    // 5. Upgrade legacy 'items' into 'equipment' or 'magic_items', and legacy Feat/Background rules
    if (category === 'items') {
      const isMagic =
        tags.includes('Magic Item') ||
        (stats.rarity && stats.rarity !== 'Common') ||
        (entry.summary || '').toLowerCase().includes('wondrous item') ||
        (entry.summary || '').toLowerCase().includes('requires attunement');
      category = isMagic ? 'magic_items' : 'equipment';
    } else if (category === 'rules') {
      if (tags.includes('Feat') || tags.includes('Origin Feat') || tags.includes('General Feat') || tags.includes('Epic Boon') || tags.includes('Fighting Style')) {
        category = 'feats';
      } else if (tags.includes('Background')) {
        category = 'backgrounds';
      }
    }

    return {
      ...entry,
      category,
      tags: Array.from(new Set(tags)),
      stats,
    };
  });
}

/**
 * Parses JSON strings which could be an array of LibraryEntry or a single object.
 */
export function parseJsonImport(rawJson: string): LibraryEntry[] {
  if (!rawJson || !rawJson.trim()) return [];

  try {
    const parsed = JSON.parse(rawJson);
    const items = Array.isArray(parsed) ? parsed : [parsed];

    return items
      .filter((item): item is Record<string, any> => item && typeof item === 'object')
      .map(item => {
        let category: Category = (
          ['monsters', 'spells', 'items', 'equipment', 'magic_items', 'races', 'classes', 'backgrounds', 'feats', 'actions', 'rules', 'races_classes'].includes(item.category)
            ? item.category
            : 'rules'
        ) as Category;

        // Statblock guard on JSON import as well
        const stats: Record<string, any> = item.stats && typeof item.stats === 'object' ? { ...item.stats } : {};
        if (category !== 'monsters' && category !== 'equipment') {
          delete stats.ac;
          delete stats.hp;
          delete stats.cr;
        }

        return {
          id: item.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: String(item.name || 'Untitled Entry').trim(),
          category,
          tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
          source: item.source ? String(item.source) : 'Imported',
          summary: item.summary ? String(item.summary) : '',
          content: item.content ? String(item.content) : JSON.stringify(item, null, 2),
          stats,
          custom: true,
          pinned: Boolean(item.pinned),
          createdAt: item.createdAt || Date.now(),
        };
      });
  } catch {
    return [];
  }
}

export function stripWikiLinks(text: string | undefined): string {
  if (!text) return '';
  return text.replace(
    /\[\[([^\]|]+)(?:\|([^\]|]*))?(?:\|([^\]]*))?\]\]/g,
    (_, target, _src, display) => (display || target).trim()
  );
}

export interface CrossReferenceIndex {
  resolveLink: (
    targetName: string,
    targetSource?: string,
    activeEntrySource?: string
  ) => LibraryEntry | undefined;
  getSourceVariants: (entry: LibraryEntry) => LibraryEntry[];
}

const SOURCE_PRIORITY: Record<string, number> = {
  xphb: 1,
  xmm: 2,
  xdmg: 3,
  phb: 4,
  mm: 5,
  dmg: 6,
  tce: 7,
  xge: 8,
  mpmm: 9,
  ftd: 10,
  bgg: 11,
  bmt: 12,
};

export function buildCrossReferenceIndex(entries: LibraryEntry[]): CrossReferenceIndex {
  const byNameAndSource = new Map<string, LibraryEntry>();
  const byNameList = new Map<string, LibraryEntry[]>();
  const byCategoryAndExactName = new Map<string, LibraryEntry[]>();

  const addNameCandidate = (key: string, entry: LibraryEntry) => {
    if (!key) return;
    let list = byNameList.get(key);
    if (!list) {
      list = [];
      byNameList.set(key, list);
    }
    list.push(entry);
  };

  for (const e of entries) {
    if (!e || !e.name) continue;
    const lowerName = e.name.toLowerCase().trim();
    const lowerSrc = (e.source || '').toLowerCase().trim();
    const stripped = lowerName.replace(/\s*[\[(].*?[\])]\s*$/, '').trim();

    const exactCatKey = `${e.category}:${lowerName}`;
    let varList = byCategoryAndExactName.get(exactCatKey);
    if (!varList) {
      varList = [];
      byCategoryAndExactName.set(exactCatKey, varList);
    }
    varList.push(e);

    if (lowerSrc) {
      const nsKey = `${lowerName}|${lowerSrc}`;
      if (!byNameAndSource.has(nsKey)) {
        byNameAndSource.set(nsKey, e);
      }
      if (stripped && stripped !== lowerName) {
        const strippedNsKey = `${stripped}|${lowerSrc}`;
        if (!byNameAndSource.has(strippedNsKey)) {
          byNameAndSource.set(strippedNsKey, e);
        }
      }
    }

    addNameCandidate(lowerName, e);
    if (stripped && stripped !== lowerName) {
      addNameCandidate(stripped, e);
    }
  }

  const pickBest = (candidates: LibraryEntry[] | undefined, preferredSrc?: string): LibraryEntry | undefined => {
    if (!candidates || candidates.length === 0) return undefined;
    if (candidates.length === 1) return candidates[0];
    if (preferredSrc) {
      const pLower = preferredSrc.toLowerCase().trim();
      const exactSrc = candidates.find(c => (c.source || '').toLowerCase().trim() === pLower);
      if (exactSrc) return exactSrc;
    }
    return [...candidates].sort((a, b) => {
      const pA = SOURCE_PRIORITY[(a.source || '').toLowerCase()] ?? 50;
      const pB = SOURCE_PRIORITY[(b.source || '').toLowerCase()] ?? 50;
      return pA - pB;
    })[0];
  };

  const resolveLink = (
    targetName: string,
    targetSource?: string,
    activeEntrySource?: string
  ): LibraryEntry | undefined => {
    const cleanTarget = targetName.toLowerCase().split('#')[0].trim();
    if (!cleanTarget) return undefined;
    const cleanSrc = (targetSource || '').toLowerCase().trim();
    const fallbackSrc = (activeEntrySource || '').toLowerCase().trim();

    if (cleanSrc) {
      const exact = byNameAndSource.get(`${cleanTarget}|${cleanSrc}`);
      if (exact) return exact;
    }
    if (fallbackSrc) {
      const sameBook = byNameAndSource.get(`${cleanTarget}|${fallbackSrc}`);
      if (sameBook) return sameBook;
    }

    const byName = pickBest(byNameList.get(cleanTarget), cleanSrc || fallbackSrc);
    if (byName) return byName;

    // Plural fallback (e.g. "goblins" -> "goblin", "harPIES" -> "harpy")
    if (cleanTarget.endsWith('ies') && cleanTarget.length > 4) {
      const singularY = `${cleanTarget.slice(0, -3)}y`;
      const foundY = pickBest(byNameList.get(singularY), cleanSrc || fallbackSrc);
      if (foundY) return foundY;
    }
    if (cleanTarget.endsWith('s') && cleanTarget.length > 3) {
      const singular = cleanTarget.slice(0, -1);
      const foundS = pickBest(byNameList.get(singular), cleanSrc || fallbackSrc);
      if (foundS) return foundS;
    }
    if (cleanTarget.endsWith('es') && cleanTarget.length > 4) {
      const singularEs = cleanTarget.slice(0, -2);
      const foundEs = pickBest(byNameList.get(singularEs), cleanSrc || fallbackSrc);
      if (foundEs) return foundEs;
    }

    return undefined;
  };

  const getSourceVariants = (entry: LibraryEntry): LibraryEntry[] => {
    const exactCatKey = `${entry.category}:${entry.name.toLowerCase().trim()}`;
    const list = byCategoryAndExactName.get(exactCatKey) || [entry];
    return [...list].sort((a, b) => {
      const pA = SOURCE_PRIORITY[(a.source || '').toLowerCase()] ?? 50;
      const pB = SOURCE_PRIORITY[(b.source || '').toLowerCase()] ?? 50;
      if (pA !== pB) return pA - pB;
      return (a.source || '').localeCompare(b.source || '');
    });
  };

  return { resolveLink, getSourceVariants };
}

/**
 * Fuzzy search and filter entries by category, sourcebook, action economy, search query, CR, Spell level, school, rarity, tags, and bookmarks
 */
export function filterEntries(
  entries: LibraryEntry[],
  options: {
    query?: string;
    category?: Category | 'all';
    source?: string;
    actionType?: string;
    cr?: string;
    spellLevel?: string;
    school?: string;
    rarity?: string;
    monsterType?: string;
    tag?: string;
    bookmarkedOnly?: boolean;
  }
): LibraryEntry[] {
  const filtered = entries.filter(entry => {
    // Bookmark filter
    if (options.bookmarkedOnly && !entry.pinned) {
      return false;
    }

    // Sourcebook filter
    if (options.source && options.source !== 'all') {
      if ((entry.source || '').toLowerCase() !== options.source.toLowerCase()) {
        return false;
      }
    }

    // Tag filter
    if (options.tag && options.tag !== 'all') {
      const targetTag = options.tag.toLowerCase();
      if (!entry.tags.some(t => t.toLowerCase() === targetTag)) {
        return false;
      }
    }

    // Category filter:
    if (options.category && options.category !== 'all') {
      if (options.category === 'races') {
        const isRace = entry.category === 'races' || (entry.category === 'races_classes' && entry.tags.includes('Race'));
        if (!isRace) return false;
      } else if (options.category === 'classes') {
        const isClass = entry.category === 'classes' || (entry.category === 'races_classes' && entry.tags.includes('Class'));
        if (!isClass) return false;
      } else if (options.category === 'races_classes') {
        const isEither = entry.category === 'races' || entry.category === 'classes' || entry.category === 'races_classes';
        if (!isEither) return false;
      } else if (options.category === 'items') {
        const isItem = entry.category === 'items' || entry.category === 'equipment' || entry.category === 'magic_items';
        if (!isItem) return false;
      } else if (options.category === 'equipment') {
        const isEquip = entry.category === 'equipment' || (entry.category === 'items' && !entry.tags.includes('Magic Item'));
        if (!isEquip) return false;
      } else if (options.category === 'magic_items') {
        const isMagic = entry.category === 'magic_items' || (entry.category === 'items' && entry.tags.includes('Magic Item'));
        if (!isMagic) return false;
      } else if (options.category === 'feats') {
        const isFeat = entry.category === 'feats' || entry.tags.includes('Feat');
        if (!isFeat) return false;
      } else if (options.category === 'backgrounds') {
        const isBg = entry.category === 'backgrounds' || entry.tags.includes('Background');
        if (!isBg) return false;
      } else if (entry.category !== options.category) {
        return false;
      }
    }

    // Action Economy tag filter (e.g. "Action", "Bonus Action", "Reaction")
    if (options.actionType && options.actionType !== 'all') {
      const targetType = options.actionType.toLowerCase();
      const hasMatchingTag = entry.tags.some(t => t.toLowerCase() === targetType);
      const hasMatchingStat = (entry.stats?.actionType || '').toLowerCase() === targetType;
      const hasInCastingTime = (entry.stats?.castingTime || '').toLowerCase().includes(targetType);
      if (!hasMatchingTag && !hasMatchingStat && !hasInCastingTime) {
        return false;
      }
    }

    // Query filter (name, summary, tags, content)
    if (options.query && options.query.trim()) {
      const q = options.query.toLowerCase().trim();
      const inName = entry.name.toLowerCase().includes(q);
      const inSummary = (entry.summary || '').toLowerCase().includes(q);
      const inTags = entry.tags.some(t => t.toLowerCase().includes(q));
      const inContent = (entry.content || '').toLowerCase().includes(q);
      if (!inName && !inSummary && !inTags && !inContent) {
        return false;
      }
    }

    // Specific filters
    if (options.cr && options.cr !== 'all') {
      if (String(entry.stats?.cr) !== options.cr) return false;
    }

    if (options.monsterType && options.monsterType !== 'all') {
      const mType = (entry.stats?.type || '').toLowerCase();
      const hasTag = entry.tags.some(t => t.toLowerCase() === options.monsterType!.toLowerCase());
      if (!mType.includes(options.monsterType.toLowerCase()) && !hasTag) return false;
    }

    if (options.spellLevel !== undefined && options.spellLevel !== 'all') {
      const lvl = parseInt(options.spellLevel, 10);
      if (entry.stats?.level !== lvl) return false;
    }

    if (options.school && options.school !== 'all') {
      const sSchool = (entry.stats?.school || '').toLowerCase();
      if (sSchool !== options.school.toLowerCase()) return false;
    }

    if (options.rarity && options.rarity !== 'all') {
      if (
        (entry.stats?.rarity || '').toLowerCase() !== options.rarity.toLowerCase()
      ) {
        return false;
      }
    }

    return true;
  });

  if (options.query && options.query.trim()) {
    const q = options.query.toLowerCase().trim();
    const scoreEntry = (e: LibraryEntry): number => {
      const n = e.name.toLowerCase().trim();
      if (n === q) return 0;
      if (n.startsWith(q)) return 1;
      if (n.includes(q)) return 2;
      if (e.tags.some(t => t.toLowerCase() === q)) return 3;
      if ((e.summary || '').toLowerCase().includes(q)) return 4;
      return 5;
    };
    return [...filtered].sort((a, b) => {
      const diff = scoreEntry(a) - scoreEntry(b);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }

  return filtered;
}
