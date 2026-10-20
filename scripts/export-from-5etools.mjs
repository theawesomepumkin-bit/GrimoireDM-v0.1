import fs from 'fs';
import path from 'path';
import './js/parser.js';
import './js/utils.js';
import './js/utils-ui.js';
import './js/utils-config.js';
import './js/utils-dataloader.js';
import './js/utils-brew.js';
import './js/hist.js';
import './js/render.js';
import './js/render-dice.js';
import './js/render-markdown.js';
import * as ut from './node/util.js';

const LINK_TAGS = new Set([
  '@spell', '@creature', '@item', '@condition', '@status', '@action',
  '@feat', '@background', '@race', '@class', '@classFeature', '@subclassFeature',
  '@optfeature', '@variantrule', '@sense', '@skill', '@disease', '@hazard',
  '@trap', '@reward', '@deity', '@facility', '@object', '@vehicle',
  '@charoption', '@cult', '@boon', '@psionic', '@itemProperty', '@itemMastery',
  '@language'
]);

const origRenderTag = RendererMarkdown.prototype._renderString_renderTag;
RendererMarkdown.prototype._renderString_renderTag = function (textStack, meta, options, tag, text) {
  if (LINK_TAGS.has(tag)) {
    const parts = Renderer.splitTagByPipe(text);
    let rawTarget = (parts[0] || '').trim();
    let targetSource = '';
    if (tag === '@classFeature') {
      const clsName = (parts[1] || '').trim();
      targetSource = (parts[2] || parts[4] || '').trim();
      if (clsName) rawTarget = `${rawTarget} (${clsName})`;
    } else if (tag === '@subclassFeature') {
      const scShort = (parts[3] || parts[1] || '').trim();
      targetSource = (parts[4] || parts[2] || '').trim();
      if (scShort) rawTarget = scShort;
    } else if (tag === '@deity') {
      const pantheon = (parts[1] || '').trim();
      targetSource = (parts[2] || '').trim();
      if (pantheon) rawTarget = `${rawTarget} (${pantheon})`;
    } else if (tag === '@language') {
      targetSource = (parts[1] || 'XPHB').trim();
      rawTarget = `${rawTarget} (Language)`;
    } else if (tag === '@itemProperty') {
      const propCode = rawTarget;
      const src = (parts[1] || 'XPHB').trim();
      const fullProp = Renderer.item.getProperty(`${propCode}|${src}`)?.name || Renderer.stripTags(`{${tag} ${text}}`).trim();
      rawTarget = fullProp;
      targetSource = src;
    } else if (tag === '@itemMastery') {
      targetSource = (parts[1] || 'XPHB').trim();
    } else {
      targetSource = (parts[1] || '').trim();
    }
    const display = Renderer.stripTags(`{${tag} ${text}}`).trim();
    if (rawTarget) {
      const srcUp = targetSource.toUpperCase();
      if (display.toLowerCase() === rawTarget.toLowerCase()) {
        textStack[0] += srcUp ? `[[${rawTarget}|${srcUp}]]` : `[[${rawTarget}]]`;
      } else {
        textStack[0] += `[[${rawTarget}|${srcUp}|${display}]]`;
      }
      return;
    }
  }
  return origRenderTag.call(this, textStack, meta, options, tag, text);
};

function stripWikiLinks(str) {
  if (!str) return '';
  return str
    .replace(/\[\[([^\]|]+)(?:\|([^\]|]*))?(?:\|([^\]]*))?\]\]/g, (_, target, _src, display) => display || target)
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanRenderedMarkdown(md, entityName) {
  if (!md) return '';
  let lines = md
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(l => l.replace(/^>\s?/, ''));

  while (lines.length > 0 && (!lines[0].trim() || /^[-_]{3,}$/.test(lines[0].trim()))) {
    lines.shift();
  }
  if (lines.length > 0 && /^#{1,4}\s+/.test(lines[0].trim())) {
    const hText = lines[0].trim().replace(/^#{1,4}\s+/, '').trim();
    if (hText.toLowerCase() === (entityName || '').toLowerCase()) {
      lines.shift();
    }
  }
  while (lines.length > 0 && (!lines[0].trim() || /^[-_]{3,}$/.test(lines[0].trim()))) {
    lines.shift();
  }

  lines = lines.filter(l => !/^[-_]{3,}$/.test(l.trim()));

  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function makeSlug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function renderEntriesMarkdown(entries) {
  if (!entries) return '';
  return RendererMarkdown.get().render({ entries }, 0, { _typeStack: [] }).trim();
}

async function generateAll() {
  ut.patchLoadJson();

  const sourceMap = {};
  const registerSource = (src) => {
    if (!src) return 'XPHB';
    const clean = String(src).trim();
    if (!sourceMap[clean]) {
      let full = clean;
      try {
        full = Parser.sourceJsonToFull(clean) || clean;
      } catch {}
      sourceMap[clean] = full;
    }
    return clean;
  };

  // Load all datasets
  const spellsRaw = await DataUtil.spell.pLoadAll();
  const monstersRaw = await DataUtil.monster.pLoadAll();
  const classesMerged = await DataUtil.class.loadJSON();
  const classesRaw = await DataUtil.class.loadRawJSON();
  const racesMerged = await DataUtil.race.loadJSON();
  const backgroundsData = await DataUtil.loadJSON('./data/backgrounds.json');
  const featsData = await DataUtil.loadJSON('./data/feats.json');
  const optFeaturesData = await DataUtil.loadJSON('./data/optionalfeatures.json');
  const itemsBuilt = await Renderer.item.pBuildList({ isAddGroups: true });
  const itemsBaseData = await DataUtil.loadJSON('./data/items-base.json');
  const objectsData = await DataUtil.loadJSON('./data/objects.json');
  const vehiclesData = await DataUtil.loadJSON('./data/vehicles.json');
  const actionsData = await DataUtil.loadJSON('./data/actions.json');
  const condsData = await DataUtil.loadJSON('./data/conditionsdiseases.json');
  const vrulesData = await DataUtil.variantrule.loadJSON();
  const sensesData = await DataUtil.loadJSON('./data/senses.json');
  const skillsData = await DataUtil.loadJSON('./data/skills.json');
  const trapsData = await DataUtil.loadJSON('./data/trapshazards.json');
  const bastionsData = await DataUtil.loadJSON('./data/bastions.json');
  const rewardsData = await DataUtil.loadJSON('./data/rewards.json');
  const cultsData = await DataUtil.loadJSON('./data/cultsboons.json');
  const charOptsData = await DataUtil.loadJSON('./data/charcreationoptions.json');
  const deitiesData = await DataUtil.loadJSON('./data/deities.json');
  const languagesData = await DataUtil.loadJSON('./data/languages.json');

  const classSpellsByLevel = new Map();
  const subclassSpellsMap = new Map();
  const raceSpellsMap = new Map();

  // =========================================================================
  // 1. SPELLS
  // =========================================================================
  const spellEntries = [];
  for (const sp of spellsRaw) {
    const src = registerSource(sp.source);
    const school = Parser.spSchoolAbvToFull(sp.school) || 'Evocation';
    const castingTime = Parser.spTimeListToFull(sp.time, sp.meta) || '1 Action';
    const range = Parser.spRangeToFull(sp.range) || 'Self';
    const components = Parser.spComponentsToFull(sp.components, sp.level, { isPlainText: true }) || '';
    const duration = Parser.spDurationToFull(sp.duration, { isPlainText: true }) || 'Instantaneous';
    const level = sp.level ?? 0;

    const ctLower = castingTime.toLowerCase();
    const actionType = ctLower.includes('bonus action')
      ? 'Bonus Action'
      : ctLower.includes('reaction')
      ? 'Reaction'
      : ctLower.includes('action')
      ? 'Action'
      : 'Special';

    let bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.spell.getCompactRenderedString(sp, { meta: { _typeStack: [] } }),
      sp.name
    );
    bodyMd = bodyMd.replace(/\n*\*\*Classes:\*\*[^\n]*$/i, '').trim();

    const spellLinkToken = `[[${sp.name}|${src}]]`;
    const classLinks = [];
    const classTagSet = new Set();
    const fromClassList = [
      ...(sp.classes?.fromClassList || []),
      ...(sp.classes?.fromClassListVariant || []),
    ];
    const seenClassLink = new Set();
    for (const c of fromClassList) {
      const cKey = `${c.name}|${c.source}`;
      if (!seenClassLink.has(cKey)) {
        seenClassLink.add(cKey);
        classLinks.push(`[[${c.name}|${c.source}]] (${c.source})`);
        classTagSet.add(c.name);
        if (!classSpellsByLevel.has(cKey)) classSpellsByLevel.set(cKey, new Map());
        const lvlMap = classSpellsByLevel.get(cKey);
        if (!lvlMap.has(level)) lvlMap.set(level, new Set());
        lvlMap.get(level).add(spellLinkToken);
      }
    }

    const subclassLinks = [];
    const seenSubLink = new Set();
    for (const sc of sp.classes?.fromSubclass || []) {
      const scName = sc.subclass?.name || '';
      const scShort = sc.subclass?.shortName || scName;
      const scSrc = sc.subclass?.source || '';
      const cName = sc.class?.name || '';
      const subKey = `${cName}|${scName}|${scSrc}`;
      if (scName && !seenSubLink.has(subKey)) {
        seenSubLink.add(subKey);
        subclassLinks.push(`[[${scName}|${scSrc}]] ([[${cName}|${sc.class?.source || scSrc}]])`);
        const lookupKey = `${cName.toLowerCase()}|${scShort.toLowerCase()}|${scSrc.toLowerCase()}`;
        if (!subclassSpellsMap.has(lookupKey)) subclassSpellsMap.set(lookupKey, new Set());
        subclassSpellsMap.get(lookupKey).add(spellLinkToken);
      }
    }

    const raceLinks = [];
    for (const r of sp.races || []) {
      raceLinks.push(`[[${r.name}|${r.source}]]`);
      const rKey = `${r.name.toLowerCase()}|${r.source.toLowerCase()}`;
      if (!raceSpellsMap.has(rKey)) raceSpellsMap.set(rKey, new Set());
      raceSpellsMap.get(rKey).add(spellLinkToken);
    }

    const featLinks = (sp.feats || []).map(f => `[[${f.name}|${f.source}]]`);
    const bgLinks = (sp.backgrounds || []).map(b => `[[${b.name}|${b.source}]]`);
    const optLinks = (sp.optionalfeatures || []).map(o => `[[${o.name}|${o.source}]]`);

    const sourceLinksBlock = [];
    if (classLinks.length > 0) sourceLinksBlock.push(`**Classes:** ${classLinks.join(', ')}`);
    if (subclassLinks.length > 0) sourceLinksBlock.push(`**Subclasses:** ${subclassLinks.slice(0, 20).join(', ')}`);
    if (raceLinks.length > 0) sourceLinksBlock.push(`**Species / Races:** ${raceLinks.join(', ')}`);
    if (featLinks.length > 0) sourceLinksBlock.push(`**Feats:** ${featLinks.join(', ')}`);
    if (bgLinks.length > 0) sourceLinksBlock.push(`**Backgrounds:** ${bgLinks.join(', ')}`);
    if (optLinks.length > 0) sourceLinksBlock.push(`**Optional Features:** ${optLinks.join(', ')}`);

    if (sourceLinksBlock.length > 0) {
      bodyMd += `\n\n${sourceLinksBlock.join('\n')}`;
    }

    const plainBody = stripWikiLinks(bodyMd);
    let damage = undefined;
    let damageType = undefined;
    const dmgMatch = plainBody.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+(acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)\s+damage/i);
    if (dmgMatch) {
      damage = dmgMatch[1];
      damageType = dmgMatch[2].charAt(0).toUpperCase() + dmgMatch[2].slice(1).toLowerCase();
    } else if (sp.damageInflict?.length) {
      const diceM = plainBody.match(/(\d+d\d+(?:\s*[+-]\s*\d+)?)/);
      if (diceM) damage = diceM[1];
      damageType = sp.damageInflict[0].charAt(0).toUpperCase() + sp.damageInflict[0].slice(1);
    }

    let healing = undefined;
    const healMatch = plainBody.match(/(?:regains?|restores?|healing\s+equal\s+to)\s+(?:hit\s+points\s+equal\s+to\s+)?(\d+d\d+(?:\s*[+-]\s*\d+)?|\d+)\s*(?:hit\s+points|HP)?/i);
    if (healMatch && (sp.miscTags?.includes('HL') || /regains?\s+.*hit\s+points/i.test(plainBody))) {
      healing = healMatch[1];
    }

    let saveType = undefined;
    if (sp.savingThrow?.length) {
      saveType = `${sp.savingThrow[0].slice(0, 3).toUpperCase()} Save`;
    }

    let attackType = undefined;
    if (sp.spellAttack?.length) {
      attackType = sp.spellAttack.includes('M') ? 'Melee Spell Attack' : sp.spellAttack.includes('R') ? 'Ranged Spell Attack' : undefined;
    }

    let areaOfEffect = undefined;
    const aoeMatch = plainBody.match(/(\d+[- ]foot(?:-radius)?\s+(?:Sphere|Cone|Line|Cube|Cylinder|Emanation|Square))/i);
    if (aoeMatch) areaOfEffect = aoeMatch[1];

    const levelLabel = level === 0 ? `${school} Cantrip` : `Level ${level} ${school}`;
    const firstSentence = stripWikiLinks(renderEntriesMarkdown(sp.entries)).slice(0, 150);

    const tags = [
      'Spell',
      src,
      school,
      level === 0 ? 'Cantrip' : `Level ${level}`,
      actionType,
      ...(sp.meta?.ritual ? ['Ritual'] : []),
      ...(duration.toLowerCase().includes('concentration') ? ['Concentration'] : []),
      ...Array.from(classTagSet),
      ...(damageType ? [`${damageType} Damage`, damageType] : []),
      ...(healing ? ['Healing'] : []),
    ];

    spellEntries.push({
      id: `5et_spell_${makeSlug(sp.name)}_${makeSlug(src)}`,
      name: sp.name,
      category: 'spells',
      source: src,
      summary: `${levelLabel} • ${castingTime} • ${range} — ${firstSentence}`,
      content: bodyMd,
      stats: {
        level,
        school,
        castingTime,
        range,
        components,
        duration,
        actionType,
        damage,
        damageType,
        healing,
        saveType,
        attackType,
        areaOfEffect,
      },
      tags: Array.from(new Set(tags)),
    });
  }

  // =========================================================================
  // 2. CLASSES, SUBCLASSES, CLASS FEATURES & OPTIONAL FEATURES
  // =========================================================================
  const classEntries = [];
  // Group unique subclasses by className
  const subclassesByClassName = new Map();
  const uniqueSubclasses = [];
  const seenSubclassKey = new Set();

  for (const sc of classesMerged.subclass) {
    if (sc._copy && sc.classSource === 'XPHB' && sc.source !== 'XPHB') continue;
    const key = `${sc.className}|${sc.name}|${sc.source}`.toLowerCase();
    if (seenSubclassKey.has(key)) continue;
    seenSubclassKey.add(key);
    uniqueSubclasses.push(sc);
    if (!subclassesByClassName.has(sc.className)) subclassesByClassName.set(sc.className, []);
    subclassesByClassName.get(sc.className).push(sc);
  }

  for (const cls of classesMerged.class) {
    const src = registerSource(cls.source);
    const hd = cls.hd ? `d${cls.hd.faces}` : 'd8';
    const saves = (cls.proficiency || []).map(p => Parser.attAbvToFull(p)).join(', ');
    const spellAbil = cls.spellcastingAbility ? Parser.attAbvToFull(cls.spellcastingAbility) : null;

    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.class.getCompactRenderedString(cls, { meta: { _typeStack: [] } }),
        cls.name
      );
    } catch {
      bodyMd = '';
    }

    const headerLines = [
      `**Hit Point Die:** ${hd} per ${cls.name} level`,
      saves ? `**Saving Throw Proficiencies:** ${saves}` : '',
      spellAbil ? `**Spellcasting Ability:** ${spellAbil}` : '',
    ].filter(Boolean);

    const subs = subclassesByClassName.get(cls.name) || [];
    if (subs.length > 0) {
      const subLinks = subs.map(s => `[[${s.name}|${s.source}]] (${s.source})`);
      headerLines.push(`**${cls.subclassTitle || 'Subclasses'} (${subs.length}):** ${subLinks.join(', ')}`);
    }

    const cKey = `${cls.name}|${src}`;
    const spellLvlMap = classSpellsByLevel.get(cKey) || classSpellsByLevel.get(`${cls.name}|XPHB`) || classSpellsByLevel.get(`${cls.name}|PHB`);
    let spellListSection = '';
    if (spellLvlMap && spellLvlMap.size > 0) {
      const lvlLines = [`### ${cls.name} Spell List`];
      const sortedLvls = Array.from(spellLvlMap.keys()).sort((a, b) => a - b);
      for (const lvl of sortedLvls) {
        const spLinks = Array.from(spellLvlMap.get(lvl)).sort();
        lvlLines.push(`- **${lvl === 0 ? 'Cantrips (Level 0)' : `Level ${lvl}`}:** ${spLinks.join(', ')}`);
      }
      spellListSection = `\n\n${lvlLines.join('\n')}`;
    }

    const fullContent = `${headerLines.join('\n')}\n\n${bodyMd}${spellListSection}`.trim();
    const subtitle = `Core Class (${src}) • ${hd} Hit Die${saves ? ` • Saves: ${saves}` : ''}${spellAbil ? ` • Spellcasting: ${spellAbil}` : ''}`;

    classEntries.push({
      id: `5et_class_${makeSlug(cls.name)}_${makeSlug(src)}`,
      name: cls.name,
      category: 'classes',
      source: src,
      summary: subtitle,
      content: fullContent,
      stats: {
        subtypes: subs.map(s => s.name),
      },
      tags: Array.from(new Set(['Class', cls.name, src, ...(spellAbil ? ['Spellcaster'] : ['Martial'])])),
    });
  }

  for (const sc of uniqueSubclasses) {
    const src = registerSource(sc.source);
    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.subclass.getCompactRenderedString(sc, { meta: { _typeStack: [] } }),
        sc.name
      );
    } catch {
      bodyMd = '';
    }

    const lookupKey = `${sc.className.toLowerCase()}|${(sc.shortName || sc.name).toLowerCase()}|${src.toLowerCase()}`;
    const bonusSpells = subclassSpellsMap.get(lookupKey);
    const headerLines = [
      `**Parent Class:** [[${sc.className}|${sc.classSource || src}]]`,
      bonusSpells && bonusSpells.size > 0 ? `**Subclass Spells:** ${Array.from(bonusSpells).join(', ')}` : '',
    ].filter(Boolean);

    const fullContent = `${headerLines.join('\n')}\n\n${bodyMd}`.trim();
    const subtitle = `${sc.className} Subclass (${src}) — ${stripWikiLinks(bodyMd).slice(0, 120)}`;

    classEntries.push({
      id: `5et_subclass_${makeSlug(sc.className)}_${makeSlug(sc.name)}_${makeSlug(src)}`,
      name: sc.name,
      category: 'classes',
      source: src,
      summary: subtitle,
      content: fullContent,
      tags: Array.from(new Set(['Subclass', sc.className, sc.name, src])),
    });
  }

  // Optional Features (Invocations, Metamagic, Fighting Styles, Maneuvers, Infusions, Runes, etc.)
  for (const opt of optFeaturesData.optionalfeature || []) {
    const src = registerSource(opt.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.optionalfeature.getCompactRenderedString(opt, { meta: { _typeStack: [] } }),
      opt.name
    );
    const ftTypes = (opt.featureType || []).map(ft => Parser.optFeatureTypeToFull(ft));
    const primaryType = ftTypes[0] || 'Optional Feature';
    const summary = `${primaryType} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`;

    classEntries.push({
      id: `5et_optfeat_${makeSlug(opt.name)}_${makeSlug(src)}`,
      name: opt.name,
      category: 'classes',
      source: src,
      summary,
      content: bodyMd,
      tags: Array.from(new Set(['Class Feature', 'Optional Feature', ...ftTypes, src])),
    });
  }

  // Named Core Class Features
  const seenCfKey = new Set();
  for (const cf of classesRaw.classFeature || []) {
    const cleanName = (cf.name || '').trim();
    if (!cleanName || /^(ability score improvement|subclass|epic boon|feat)$/i.test(cleanName)) continue;
    if (cleanName.includes('Subclass Feature')) continue;
    const src = registerSource(cf.source);
    const key = `${cleanName.toLowerCase()}|${cf.className.toLowerCase()}|${src.toLowerCase()}`;
    if (seenCfKey.has(key)) continue;
    seenCfKey.add(key);

    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(cf.entries), cleanName);
    if (!bodyMd) continue;

    const fullContent = `**Class:** [[${cf.className}|${cf.classSource || src}]] (Level ${cf.level || 1})\n\n${bodyMd}`;
    const summary = `${cf.className} Level ${cf.level || 1} Feature (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`;

    classEntries.push({
      id: `5et_cf_${makeSlug(cf.className)}_${makeSlug(cleanName)}_${makeSlug(src)}`,
      name: `${cleanName} (${cf.className})`,
      category: 'classes',
      source: src,
      summary,
      content: fullContent,
      tags: Array.from(new Set(['Class Feature', cf.className, cleanName, src])),
    });
  }

  // =========================================================================
  // 3. RACES / SPECIES / SUBRACES / LINEAGES
  // =========================================================================
  const raceEntries = [];
  const subracesByBase = new Map();
  for (const r of racesMerged.race || []) {
    if (r._isSubRace && r.baseName) {
      const bKey = `${r.baseName}|${r.baseSource || r.source}`;
      if (!subracesByBase.has(bKey)) subracesByBase.set(bKey, []);
      subracesByBase.get(bKey).push(`[[${r.name}|${r.source}]]`);
    }
  }

  for (const r of racesMerged.race || []) {
    const src = registerSource(r.source);
    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.race.getCompactRenderedString(r, { meta: { _typeStack: [] } }),
        r.name
      );
    } catch {
      bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(r.entries), r.name);
    }

    const extraLinks = [];
    if (r._isSubRace && r.baseName) {
      extraLinks.push(`**Base Species / Race:** [[${r.baseName}|${r.baseSource || src}]]`);
    }
    const bKey = `${r.name}|${src}`;
    const subs = subracesByBase.get(bKey);
    if (subs && subs.length > 0) {
      extraLinks.push(`**Subraces & Variants:** ${subs.join(', ')}`);
    }
    const rSpells = raceSpellsMap.get(`${r.name.toLowerCase()}|${src.toLowerCase()}`);
    if (rSpells && rSpells.size > 0) {
      extraLinks.push(`**Innate / Lineage Spells:** ${Array.from(rSpells).join(', ')}`);
    }

    const fullContent = extraLinks.length > 0 ? `${extraLinks.join('\n')}\n\n${bodyMd}` : bodyMd;
    const speedStr = r.speed ? Parser.getSpeedString(r) : '30 ft.';
    const sizeStr = (r.size || ['M']).map(s => Parser.sizeAbvToFull(s)).join('/');
    const summary = `Species / Race (${src}) • ${sizeStr} • Speed: ${speedStr} — ${stripWikiLinks(bodyMd).slice(0, 130)}`;

    raceEntries.push({
      id: `5et_race_${makeSlug(r.name)}_${makeSlug(src)}`,
      name: r.name,
      category: 'races',
      source: src,
      summary,
      content: fullContent,
      stats: {
        size: sizeStr,
        speed: speedStr,
      },
      tags: Array.from(new Set(['Race', 'Species', r.name, ...(r.baseName ? [r.baseName, 'Subrace'] : []), src])),
    });
  }

  // =========================================================================
  // 4. BACKGROUNDS
  // =========================================================================
  const backgroundEntries = [];
  for (const bg of backgroundsData.background || []) {
    const src = registerSource(bg.source);
    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.background.getCompactRenderedString(bg, { meta: { _typeStack: [] } }),
        bg.name
      );
    } catch {
      bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(bg.entries), bg.name);
    }

    // Link origin feats if present
    if (bg.feats?.length) {
      const featLinks = [];
      for (const fObj of bg.feats) {
        for (const k of Object.keys(fObj)) {
          const [fName, fSrc] = k.split('|');
          const cleanFName = fName.split(';')[0].trim().toTitleCase();
          featLinks.push(`[[${cleanFName}|${(fSrc || src).toUpperCase()}]]`);
        }
      }
      if (featLinks.length > 0) {
        bodyMd = `**Granted Feat:** ${featLinks.join(', ')}\n\n${bodyMd}`;
      }
    }

    const summary = `Background (${src}) — ${stripWikiLinks(bodyMd).slice(0, 145)}`;
    backgroundEntries.push({
      id: `5et_bg_${makeSlug(bg.name)}_${makeSlug(src)}`,
      name: bg.name,
      category: 'backgrounds',
      source: src,
      summary,
      content: bodyMd,
      tags: Array.from(new Set(['Background', bg.name, src])),
    });
  }

  // =========================================================================
  // 5. FEATS
  // =========================================================================
  const featEntries = [];
  for (const ft of featsData.feat || []) {
    const src = registerSource(ft.source);
    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.feat.getCompactRenderedString(ft, { meta: { _typeStack: [] } }),
        ft.name
      );
    } catch {
      bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(ft.entries), ft.name);
    }

    const catTag = ft.category ? Parser.featCategoryToFull(ft.category) : 'General Feat';
    const summary = `${catTag} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 145)}`;

    featEntries.push({
      id: `5et_feat_${makeSlug(ft.name)}_${makeSlug(src)}`,
      name: ft.name,
      category: 'feats',
      source: src,
      summary,
      content: bodyMd,
      tags: Array.from(new Set(['Feat', catTag, ft.name, src])),
    });
  }

  // =========================================================================
  // 6. MONSTERS
  // =========================================================================
  const monsterEntries = [];
  for (const m of monstersRaw) {
    const src = registerSource(m.source);
    const sizeStr = (m.size || ['M']).map(s => Parser.sizeAbvToFull(s)).join('/');
    let typeStr = 'Creature';
    try {
      typeStr = Parser.monTypeToFullObj(m.type).asText;
      typeStr = typeStr.charAt(0).toUpperCase() + typeStr.slice(1);
    } catch {}
    let alignStr = 'Unaligned';
    try {
      alignStr = m.alignment ? Parser.alignmentListToFull(m.alignment) : 'Unaligned';
    } catch {}

    let acNum = 10;
    let acFull = '10';
    try {
      acFull = Parser.acToFull(m.ac, { isPlainText: true }) || '10';
      const firstAc = Array.isArray(m.ac) ? m.ac[0] : m.ac;
      acNum = typeof firstAc === 'number' ? firstAc : (firstAc?.ac ?? 10);
    } catch {}

    const hpNum = m.hp?.average ?? 10;
    const hpFormula = m.hp?.formula ? ` (${m.hp.formula})` : '';
    let speedStr = '30 ft.';
    try {
      speedStr = Parser.getSpeedString(m) || '30 ft.';
    } catch {}

    let crStr = '0';
    try {
      const rawCr = typeof m.cr === 'object' ? m.cr.cr : m.cr;
      crStr = rawCr !== undefined && rawCr !== null ? String(rawCr) : '0';
    } catch {}

    const abilities = {
      str: m.str ?? 10,
      dex: m.dex ?? 10,
      con: m.con ?? 10,
      int: m.int ?? 10,
      wis: m.wis ?? 10,
      cha: m.cha ?? 10,
    };

    // Extract structured traits and actions for MonsterDetailModal and monsterCombatParser
    const traits = [];
    for (const tr of m.trait || []) {
      const desc = renderEntriesMarkdown(tr.entries);
      traits.push({ name: stripWikiLinks(tr.name || 'Trait'), desc });
    }
    for (const sc of m.spellcasting || []) {
      const scLines = [];
      if (sc.headerEntries) scLines.push(renderEntriesMarkdown(sc.headerEntries));
      if (sc.will) scLines.push(`At will: ${sc.will.map(s => RendererMarkdown.get().render(s)).join(', ')}`);
      if (sc.daily) {
        for (const [k, list] of Object.entries(sc.daily)) {
          const perDay = k.replace('e', '/day each:').replace(/^(\d+)$/, '$1/day:');
          scLines.push(`${perDay} ${list.map(s => RendererMarkdown.get().render(s)).join(', ')}`);
        }
      }
      if (sc.spells) {
        for (const [lvl, spObj] of Object.entries(sc.spells)) {
          const label = lvl === '0' ? 'Cantrips (at will):' : `Level ${lvl} (${spObj.slots ?? 1} slots):`;
          scLines.push(`${label} ${(spObj.spells || []).map(s => RendererMarkdown.get().render(s)).join(', ')}`);
        }
      }
      if (sc.footerEntries) scLines.push(renderEntriesMarkdown(sc.footerEntries));
      traits.push({
        name: stripWikiLinks(sc.name || 'Spellcasting'),
        desc: scLines.join('\n'),
      });
    }

    const actions = [];
    for (const act of m.action || []) {
      actions.push({
        name: stripWikiLinks(act.name || 'Action'),
        desc: renderEntriesMarkdown(act.entries),
      });
    }
    for (const bon of m.bonus || []) {
      actions.push({
        name: `Bonus Action: ${stripWikiLinks(bon.name || 'Bonus Action')}`,
        desc: renderEntriesMarkdown(bon.entries),
      });
    }
    for (const rea of m.reaction || []) {
      actions.push({
        name: `Reaction: ${stripWikiLinks(rea.name || 'Reaction')}`,
        desc: renderEntriesMarkdown(rea.entries),
      });
    }
    for (const leg of m.legendary || []) {
      actions.push({
        name: `Legendary: ${stripWikiLinks(leg.name || 'Legendary Action')}`,
        desc: renderEntriesMarkdown(leg.entries),
      });
    }
    for (const myth of m.mythic || []) {
      actions.push({
        name: `Mythic: ${stripWikiLinks(myth.name || 'Mythic Action')}`,
        desc: renderEntriesMarkdown(myth.entries),
      });
    }

    // Build clean, link-rich content
    const saveStr = m.save
      ? Object.entries(m.save).map(([k, v]) => `${k.toUpperCase()} ${v}`).join(', ')
      : '';
    const skillStr = m.skill
      ? Object.entries(m.skill)
          .filter(([k]) => k !== 'other')
          .map(([k, v]) => `[[${k.toTitleCase()}|XPHB]] ${v}`)
          .join(', ')
      : '';
    const resStr = m.resist ? Parser.getFullImmRes(m.resist, { isPlainText: true }) : '';
    const immStr = m.immune ? Parser.getFullImmRes(m.immune, { isPlainText: true }) : '';
    const condImmStr = m.conditionImmune
      ? m.conditionImmune
          .map(c => (typeof c === 'string' ? `[[${c.toTitleCase()}|XPHB]]` : Parser.getFullCondImm([c], { isPlainText: true })))
          .join(', ')
      : '';
    const sensesStr = [
      ...(m.senses || []),
      `Passive Perception ${m.passive ?? 10}`,
    ].join(', ');
    const langStr = (m.languages || []).join(', ') || 'None';
    const gearStr = (m.gear || [])
      .map(g => {
        const itemStr = typeof g === 'string' ? g : g.item || '';
        const [iName, iSrc] = itemStr.split('|');
        return iName ? `[[${iName.toTitleCase()}|${(iSrc || src).toUpperCase()}]]` : '';
      })
      .filter(Boolean)
      .join(', ');

    const contentLines = [
      `*${sizeStr} ${typeStr}, ${alignStr}*`,
      `Armor Class: ${acFull} | Hit Points: ${hpNum}${hpFormula} | Speed: ${speedStr}`,
      saveStr ? `**Saving Throws:** ${saveStr}` : '',
      skillStr ? `**Skills:** ${skillStr}` : '',
      resStr ? `Damage Resistances: ${resStr}` : '',
      immStr ? `Immunities: ${immStr}${condImmStr ? `; ${condImmStr}` : ''}` : condImmStr ? `Immunities: ${condImmStr}` : '',
      gearStr ? `**Gear:** ${gearStr}` : '',
      `Senses: ${sensesStr}`,
      `Languages: ${langStr}`,
      `Challenge: ${crStr}`,
    ].filter(Boolean);

    if (traits.length > 0) {
      contentLines.push('', '### Traits');
      for (const tr of traits) {
        contentLines.push(`***${tr.name}.*** ${tr.desc}`);
      }
    }
    if (actions.length > 0) {
      contentLines.push('', '### Actions');
      for (const act of actions) {
        contentLines.push(`***${act.name}.*** ${act.desc}`);
      }
    }

    const baseTypeTag = typeStr.split('(')[0].replace(/^Swarm of \w+\s+/i, '').trim();
    monsterEntries.push({
      id: `5et_mon_${makeSlug(m.name)}_${makeSlug(src)}`,
      name: m.name,
      category: 'monsters',
      source: src,
      summary: `${sizeStr} ${typeStr}, ${alignStr} • AC ${acNum} • HP ${hpNum}${hpFormula} • CR ${crStr}`,
      content: contentLines.join('\n'),
      stats: {
        ac: acNum,
        hp: hpNum,
        cr: crStr,
        speed: speedStr,
        size: sizeStr,
        type: typeStr,
        alignment: alignStr,
        abilities,
        traits: traits.length > 0 ? traits : undefined,
        actions: actions.length > 0 ? actions : undefined,
      },
      tags: Array.from(new Set(['Monster', src, sizeStr, baseTypeTag, `CR ${crStr}`])),
    });
  }

  // =========================================================================
  // 7. EQUIPMENT & MAGIC ITEMS (+ OBJECTS & VEHICLES)
  // =========================================================================
  const itemEntries = [];
  const nonSpecificItems = itemsBuilt.filter(i => i._category !== 'Specific Variant');
  const seenItemKeys = new Set();

  for (const it of nonSpecificItems) {
    const src = registerSource(it.source);
    const key = `${it.name.toLowerCase()}|${src.toLowerCase()}`;
    if (seenItemKeys.has(key)) continue;
    seenItemKeys.add(key);

    const rarityRaw = (it.rarity || 'none').toLowerCase();
    const isMagic =
      it._category === 'Generic Variant' ||
      Boolean(it.wondrous || it.reqAttune || it.staff || it.wand || it.rod || it.ring) ||
      (rarityRaw !== 'none' && rarityRaw !== 'unknown');

    const category = isMagic ? 'magic_items' : 'equipment';
    const rarity =
      rarityRaw === 'none' || rarityRaw === 'unknown'
        ? 'Common'
        : it.rarity.charAt(0).toUpperCase() + it.rarity.slice(1);

    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.item.getCompactRenderedString(it, { meta: { _typeStack: [] } }),
        it.name
      );
    } catch {
      bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(it.entries), it.name);
    }

    if (it.attachedSpells?.length && Array.isArray(it.attachedSpells)) {
      const spLinks = it.attachedSpells
        .filter(s => typeof s === 'string')
        .map(s => {
          const [sName, sSrc] = s.split('#')[0].split('|');
          return `[[${sName.toTitleCase()}|${(sSrc || src).toUpperCase()}]]`;
        });
      if (spLinks.length > 0) {
        bodyMd += `\n\n**Attached Spells:** ${spLinks.join(', ')}`;
      }
    }

    const masteryList = (it.mastery || []).map(m => String(m).split('|')[0]);
    const masteryLinks = (it.mastery || []).map(m => {
      const [mName, mSrc] = String(m).split('|');
      return `[[${mName}|${(mSrc || src).toUpperCase()}]]`;
    });
    if (masteryLinks.length > 0 && !bodyMd.includes('[[') ) {
      bodyMd = `**Weapon Mastery:** ${masteryLinks.join(', ')}\n\n${bodyMd}`;
    }

    const dmg1 = it.dmg1 || undefined;
    const dmgType = it.dmgType ? Parser.dmgTypeToFull(it.dmgType).toTitleCase() : undefined;
    const cost = it.value ? Parser.itemValueToFullMultiCurrency(it) : undefined;
    const weight = it.weight ? `${it.weight} lb.` : undefined;
    const itemType = it._typeListText ? it._typeListText.join(', ').toTitleCase() : isMagic ? 'Wondrous Item' : 'Adventuring Gear';

    const summary = `${itemType} (${src})${isMagic ? ` • ${rarity}` : ''}${cost ? ` • ${cost}` : ''}${dmg1 ? ` • ${dmg1} ${dmgType || ''}` : ''} — ${stripWikiLinks(bodyMd).slice(0, 120)}`;

    itemEntries.push({
      id: `5et_item_${makeSlug(it.name)}_${makeSlug(src)}`,
      name: it.name,
      category,
      source: src,
      summary,
      content: bodyMd,
      stats: {
        rarity,
        itemType,
        attunement: Boolean(it.reqAttune),
        cost,
        weight,
        damage: dmg1,
        damageType: dmgType,
        ac: it.ac,
        mastery: masteryList[0] || undefined,
      },
      tags: Array.from(
        new Set([
          isMagic ? 'Magic Item' : 'Equipment',
          src,
          rarity,
          ...(it.weapon ? ['Weapon'] : []),
          ...(it.armor || it.shield ? ['Armor'] : []),
          ...(it.reqAttune ? ['Attunement'] : []),
          ...masteryList,
        ])
      ),
    });
  }

  for (const obj of objectsData.object || []) {
    const src = registerSource(obj.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.object.getCompactRenderedString(obj, { meta: { _typeStack: [] } }),
      obj.name
    );
    itemEntries.push({
      id: `5et_obj_${makeSlug(obj.name)}_${makeSlug(src)}`,
      name: obj.name,
      category: 'equipment',
      source: src,
      summary: `Object / Siege Equipment (${src}) — ${stripWikiLinks(bodyMd).slice(0, 130)}`,
      content: bodyMd,
      stats: { itemType: 'Object / Siege', ac: obj.ac, hp: obj.hp },
      tags: ['Equipment', 'Object', src],
    });
  }

  for (const veh of vehiclesData.vehicle || []) {
    const src = registerSource(veh.source);
    let bodyMd = '';
    try {
      bodyMd = cleanRenderedMarkdown(
        RendererMarkdown.vehicle.getCompactRenderedString(veh, { meta: { _typeStack: [] } }),
        veh.name
      );
    } catch {
      bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(veh.entries), veh.name);
    }
    itemEntries.push({
      id: `5et_veh_${makeSlug(veh.name)}_${makeSlug(src)}`,
      name: veh.name,
      category: 'equipment',
      source: src,
      summary: `Vehicle (${src}) — ${stripWikiLinks(bodyMd).slice(0, 130)}`,
      content: bodyMd,
      stats: { itemType: 'Vehicle' },
      tags: ['Equipment', 'Vehicle', src],
    });
  }

  // =========================================================================
  // 8. ACTIONS
  // =========================================================================
  const actionEntries = [];
  for (const act of actionsData.action || []) {
    const src = registerSource(act.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.action.getCompactRenderedString(act, { meta: { _typeStack: [] } }),
      act.name
    );
    const timeStr = act.time ? act.time.map(t => (typeof t === 'string' ? t : `${t.number ?? 1} ${t.unit}`)).join(', ') : 'Action';
    const tLower = timeStr.toLowerCase();
    const actionType = tLower.includes('bonus') ? 'Bonus Action' : tLower.includes('reaction') ? 'Reaction' : 'Action';

    actionEntries.push({
      id: `5et_action_${makeSlug(act.name)}_${makeSlug(src)}`,
      name: act.name,
      category: 'actions',
      source: src,
      summary: `${actionType} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      stats: { actionType },
      tags: ['Combat Action', actionType, src],
    });
  }

  // =========================================================================
  // 9. RULES, CONDITIONS, GLOSSARY, SENSES, SKILLS, MASTERIES, TRAPS, BASTIONS, REWARDS, DEITIES
  // =========================================================================
  const ruleEntries = [];

  for (const c of [...(condsData.condition || []), ...(condsData.disease || []), ...(condsData.status || [])]) {
    const src = registerSource(c.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(c.entries), c.name);
    const kind = c.__prop === 'disease' ? 'Disease / Contagion' : c.__prop === 'status' ? 'Status' : 'Condition';
    ruleEntries.push({
      id: `5et_cond_${makeSlug(c.name)}_${makeSlug(src)}`,
      name: c.name,
      category: 'rules',
      source: src,
      summary: `${kind} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', kind, c.name, src],
    });
  }

  for (const vr of vrulesData.variantrule || []) {
    const src = registerSource(vr.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(vr.entries), vr.name);
    const ruleType = vr.ruleType ? Parser.ruleTypeToFull(vr.ruleType) : 'Rules Glossary';
    ruleEntries.push({
      id: `5et_vrule_${makeSlug(vr.name)}_${makeSlug(src)}`,
      name: vr.name,
      category: 'rules',
      source: src,
      summary: `${ruleType} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', ruleType, src],
    });
  }

  for (const sn of sensesData.sense || []) {
    const src = registerSource(sn.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(sn.entries), sn.name);
    ruleEntries.push({
      id: `5et_sense_${makeSlug(sn.name)}_${makeSlug(src)}`,
      name: sn.name,
      category: 'rules',
      source: src,
      summary: `Special Sense (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Sense', sn.name, src],
    });
  }

  for (const sk of skillsData.skill || []) {
    const src = registerSource(sk.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(sk.entries), sk.name);
    const abil = sk.ability ? Parser.attAbvToFull(sk.ability) : '';
    ruleEntries.push({
      id: `5et_skill_${makeSlug(sk.name)}_${makeSlug(src)}`,
      name: sk.name,
      category: 'rules',
      source: src,
      summary: `Skill${abil ? ` (${abil})` : ''} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Skill', sk.name, src],
    });
  }

  for (const mast of itemsBaseData.itemMastery || []) {
    const src = registerSource(mast.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(mast.entries), mast.name);
    ruleEntries.push({
      id: `5et_mastery_${makeSlug(mast.name)}_${makeSlug(src)}`,
      name: mast.name,
      category: 'rules',
      source: src,
      summary: `Weapon Mastery Property (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Weapon Mastery', mast.name, src],
    });
  }

  for (const prop of itemsBaseData.itemProperty || []) {
    const pName = prop.name || (prop.entries?.[0]?.name) || prop.abbreviation;
    if (!pName) continue;
    const src = registerSource(prop.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(prop.entries), pName);
    if (!bodyMd) continue;
    ruleEntries.push({
      id: `5et_itemprop_${makeSlug(pName)}_${makeSlug(src)}`,
      name: pName,
      category: 'rules',
      source: src,
      summary: `Weapon / Item Property (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Weapon Property', pName, src],
    });
  }

  for (const th of [...(trapsData.trap || []), ...(trapsData.hazard || [])]) {
    const src = registerSource(th.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.traphazard.getCompactRenderedString(th, { meta: { _typeStack: [] } }),
      th.name
    );
    const kind = th.__prop === 'hazard' ? 'Hazard' : 'Trap';
    ruleEntries.push({
      id: `5et_${kind.toLowerCase()}_${makeSlug(th.name)}_${makeSlug(src)}`,
      name: th.name,
      category: 'rules',
      source: src,
      summary: `${kind} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', kind, src],
    });
  }

  for (const fac of bastionsData.facility || []) {
    const src = registerSource(fac.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.facility.getCompactRenderedString(fac, { meta: { _typeStack: [] } }),
      fac.name
    );
    ruleEntries.push({
      id: `5et_bastion_${makeSlug(fac.name)}_${makeSlug(src)}`,
      name: fac.name,
      category: 'rules',
      source: src,
      summary: `Bastion Facility (Level ${fac.level || 5} • ${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Bastion Facility', src],
    });
  }

  for (const rw of rewardsData.reward || []) {
    const src = registerSource(rw.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.reward.getCompactRenderedString(rw, { meta: { _typeStack: [] } }),
      rw.name
    );
    const rType = rw.type || 'Supernatural Gift';
    ruleEntries.push({
      id: `5et_reward_${makeSlug(rw.name)}_${makeSlug(src)}`,
      name: rw.name,
      category: 'rules',
      source: src,
      summary: `${rType} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Supernatural Gift', rType, src],
    });
  }

  for (const cb of [...(cultsData.cult || []), ...(cultsData.boon || [])]) {
    const src = registerSource(cb.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(cb.entries), cb.name);
    const kind = cb.__prop === 'cult' ? 'Cult' : 'Demonic Boon';
    ruleEntries.push({
      id: `5et_${makeSlug(kind)}_${makeSlug(cb.name)}_${makeSlug(src)}`,
      name: cb.name,
      category: 'rules',
      source: src,
      summary: `${kind} (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', kind, src],
    });
  }

  for (const co of charOptsData.charoption || []) {
    const src = registerSource(co.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.charoption.getCompactRenderedString(co, { meta: { _typeStack: [] } }),
      co.name
    );
    ruleEntries.push({
      id: `5et_charopt_${makeSlug(co.name)}_${makeSlug(src)}`,
      name: co.name,
      category: 'rules',
      source: src,
      summary: `Character Option (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Character Option', src],
    });
  }

  for (const dt of deitiesData.deity || []) {
    const src = registerSource(dt.source);
    const bodyMd = cleanRenderedMarkdown(
      RendererMarkdown.deity.getCompactRenderedString(dt, { meta: { _typeStack: [] } }),
      dt.name
    );
    const dTitle = dt.pantheon ? `${dt.name} (${dt.pantheon})` : dt.name;
    ruleEntries.push({
      id: `5et_deity_${makeSlug(dTitle)}_${makeSlug(src)}`,
      name: dTitle,
      category: 'rules',
      source: src,
      summary: `Deity • ${dt.pantheon || 'Pantheon'} (${src})${dt.domains ? ` • Domains: ${dt.domains.join(', ')}` : ''}`,
      content: bodyMd,
      tags: ['Core Rules', 'Deity', ...(dt.pantheon ? [dt.pantheon] : []), src],
    });
  }

  for (const lg of languagesData.language || []) {
    const src = registerSource(lg.source);
    const bodyMd = cleanRenderedMarkdown(renderEntriesMarkdown(lg.entries), lg.name) || `${lg.type || 'Standard'} language${lg.typicalSpeakers ? ` spoken by ${lg.typicalSpeakers.map(s => Renderer.stripTags(s)).join(', ')}` : ''}.`;
    ruleEntries.push({
      id: `5et_lang_${makeSlug(lg.name)}_${makeSlug(src)}`,
      name: `${lg.name} (Language)`,
      category: 'rules',
      source: src,
      summary: `Language (${src}) — ${stripWikiLinks(bodyMd).slice(0, 140)}`,
      content: bodyMd,
      tags: ['Core Rules', 'Language', src],
    });
  }

  // Ensure globally unique IDs across all generated entries
  const usedIds = new Set();
  const ensureUnique = (list) => {
    for (const item of list) {
      let baseId = item.id;
      let candidate = baseId;
      let counter = 2;
      while (usedIds.has(candidate)) {
        candidate = `${baseId}_${counter++}`;
      }
      usedIds.add(candidate);
      item.id = candidate;
    }
    return list;
  };

  ensureUnique(spellEntries);
  ensureUnique(classEntries);
  ensureUnique(raceEntries);
  ensureUnique(backgroundEntries);
  ensureUnique(featEntries);
  ensureUnique(monsterEntries);
  ensureUnique(itemEntries);
  ensureUnique(actionEntries);
  ensureUnique(ruleEntries);

  const outDir = 'c:/Users/ecasl/Desktop/eren/Google Antigravity/grimoireDM-main/src/data';

  const writeTsDataFile = (fileName, exportName, entriesArray) => {
    const jsonLiteral = JSON.stringify(JSON.stringify(entriesArray));
    const fileContent = `import type { LibraryEntry } from '../types.ts';\n\nexport const ${exportName}: LibraryEntry[] = JSON.parse(${jsonLiteral});\n`;
    fs.writeFileSync(path.join(outDir, fileName), fileContent, 'utf8');
  };

  // Write Sourcebooks map
  const sortedSourceCodes = Object.keys(sourceMap).sort((a, b) => a.localeCompare(b));
  const sortedSourceObj = {};
  for (const code of sortedSourceCodes) {
    sortedSourceObj[code] = sourceMap[code];
  }
  fs.writeFileSync(
    path.join(outDir, 'fiveEToolsSourcebooks.ts'),
    `export const FIVE_E_TOOLS_SOURCEBOOKS: Record<string, string> = ${JSON.stringify(sortedSourceObj, null, 2)};\n`,
    'utf8'
  );

  writeTsDataFile('fiveEToolsSpells.ts', 'FIVE_E_TOOLS_SPELLS', spellEntries);
  writeTsDataFile('fiveEToolsClassesAndFeatures.ts', 'FIVE_E_TOOLS_CLASSES', classEntries);
  writeTsDataFile(
    'fiveEToolsRacesBgFeats.ts',
    'FIVE_E_TOOLS_RACES_BG_FEATS',
    [...raceEntries, ...backgroundEntries, ...featEntries]
  );
  writeTsDataFile('fiveEToolsItems.ts', 'FIVE_E_TOOLS_ITEMS', itemEntries);
  writeTsDataFile(
    'fiveEToolsRulesAndActions.ts',
    'FIVE_E_TOOLS_RULES_AND_ACTIONS',
    [...actionEntries, ...ruleEntries]
  );

  const midMonster = Math.ceil(monsterEntries.length / 2);
  writeTsDataFile('fiveEToolsMonsters1.ts', 'FIVE_E_TOOLS_MONSTERS_1', monsterEntries.slice(0, midMonster));
  writeTsDataFile('fiveEToolsMonsters2.ts', 'FIVE_E_TOOLS_MONSTERS_2', monsterEntries.slice(midMonster));

  const statsReport = {
    spells: spellEntries.length,
    classes: classEntries.length,
    races: raceEntries.length,
    backgrounds: backgroundEntries.length,
    feats: featEntries.length,
    monsters: monsterEntries.length,
    items: itemEntries.length,
    actions: actionEntries.length,
    rules: ruleEntries.length,
    totalEntities:
      spellEntries.length +
      classEntries.length +
      raceEntries.length +
      backgroundEntries.length +
      featEntries.length +
      monsterEntries.length +
      itemEntries.length +
      actionEntries.length +
      ruleEntries.length,
    totalSourcebooks: Object.keys(sourceMap).length,
  };

  console.log(JSON.stringify(statsReport, null, 2));
  ut.unpatchLoadJson();
}

generateAll();
