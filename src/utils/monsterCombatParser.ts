import type { LibraryEntry } from '../types.ts';
import type { ActiveTargetingAction } from '../components/BattleMap/BattleMapGrid.tsx';
import { stripWikiLinks } from './importer.ts';

export interface MonsterMovementMode {
  mode: 'Walk' | 'Fly' | 'Swim' | 'Climb' | 'Burrow';
  speed: number;
}

export interface MonsterInventoryItem {
  name: string;
  quantity: number;
  desc: string;
  isWeapon?: boolean;
  isPotion?: boolean;
  action?: ActiveTargetingAction;
}

export interface MonsterFeatureItem {
  name: string;
  desc: string;
  badge?: string;
  action?: ActiveTargetingAction;
}

export interface ParsedMonsterCombatProfile {
  baseWalkSpeed: number;
  maxSpeed: number;
  movementModes: MonsterMovementMode[];
  actions: ActiveTargetingAction[];
  legendaryActions: ActiveTargetingAction[];
  spells: ActiveTargetingAction[];
  items: MonsterInventoryItem[];
  features: MonsterFeatureItem[];
}

/**
 * Splits text by `.` or `;` only when outside parentheses `()` and brackets `[]`,
 * and avoids splitting after abbreviations like `ft.` or `min.`.
 */
export function splitTopLevelClauses(text: string, allowSemicolon = false): string[] {
  if (!text) return [];
  const results: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(' || ch === '[') {
      depth++;
    } else if (ch === ')' || ch === ']') {
      depth = Math.max(0, depth - 1);
    }

    const isDelimiter = ch === '.' || (allowSemicolon && ch === ';');
    if (depth === 0 && isDelimiter) {
      // Check if preceded by common abbreviation like "ft." or "min."
      const prevWordMatch = current.match(/(\b(?:ft|min|hr|vs|dc|no|st|nd|rd|th))$/i);
      const nextChar = text.slice(i + 1).match(/^\s*([a-z])/);
      if (ch === '.' && prevWordMatch && nextChar) {
        current += ch;
        continue;
      }

      const trimmed = current.trim();
      if (trimmed) results.push(trimmed);
      current = '';
    } else {
      current += ch;
    }
  }

  const tail = current.trim();
  if (tail) results.push(tail);
  return results;
}

/**
 * Parses a single monster action or legendary action clause into an ActiveTargetingAction.
 */
function parseActionClause(
  clause: string,
  defaultReachFeet: number,
  isLegendary = false,
  explicitName?: string,
  explicitDesc?: string
): ActiveTargetingAction | null {
  let working = stripWikiLinks(clause).trim().replace(/^[-•*]\s*/, '');
  if (!working && !explicitName) return null;

  let actionCost: ActiveTargetingAction['actionCost'] = 'Action';
  let rawName = explicitName ? stripWikiLinks(explicitName).trim() : '';
  let detail = explicitDesc ? stripWikiLinks(explicitDesc).trim() : '';

  if (!explicitName) {
    if (/^Bonus Action:\s*/i.test(working)) {
      actionCost = 'Bonus Action';
      working = working.replace(/^Bonus Action:\s*/i, '').trim();
    } else if (/^Reaction:\s*/i.test(working)) {
      actionCost = 'Reaction';
      working = working.replace(/^Reaction:\s*/i, '').trim();
    }

    const nameDetailMatch = working.match(/^([^(]+?)(?:\s*\(([\s\S]+)\))?$/);
    rawName = (nameDetailMatch ? nameDetailMatch[1] : working).trim();
    detail = (nameDetailMatch && nameDetailMatch[2] ? nameDetailMatch[2] : working).trim();
  } else {
    if (/^Bonus Action:\s*/i.test(rawName)) {
      actionCost = 'Bonus Action';
      rawName = rawName.replace(/^Bonus Action:\s*/i, '').trim();
    } else if (/^Reaction:\s*/i.test(rawName)) {
      actionCost = 'Reaction';
      rawName = rawName.replace(/^Reaction:\s*/i, '').trim();
    } else if (/^Legendary:\s*/i.test(rawName) || /^Mythic:\s*/i.test(rawName)) {
      rawName = rawName.replace(/^(?:Legendary|Mythic):\s*/i, '').trim();
    }
  }

  if (!rawName || /^spellcasting$/i.test(rawName)) {
    return null;
  }

  if (/^bonus action:/i.test(detail)) {
    actionCost = 'Bonus Action';
  } else if (/^reaction:/i.test(detail)) {
    actionCost = 'Reaction';
  }

  // Extract bracketed dice formulas like "16 [2d8+7] Slashing + 5 [1d10] Lightning"
  const diceFormulas: string[] = [];
  const damageTypes: string[] = [];
  const bracketMatches = Array.from(
    detail.matchAll(/\[(\d+d\d+(?:\s*[+-]\s*\d+)?)\]\s*([A-Za-z]+)?/g)
  );

  for (const m of bracketMatches) {
    diceFormulas.push(m[1].replace(/\s+/g, ''));
    if (m[2] && !['hp', 'hit', 'to', 'dc', 'ft', 'or', 'and'].includes(m[2].toLowerCase())) {
      if (!damageTypes.includes(m[2])) damageTypes.push(m[2]);
    }
  }

  // Fallback to unbracketed dice formulas if no bracketed dice found
  if (diceFormulas.length === 0) {
    const plainMatches = Array.from(
      detail.matchAll(
        /(\d+d\d+(?:\s*[+-]\s*\d+)?)\s*(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder)?/gi
      )
    );
    for (const m of plainMatches) {
      // Avoid matching Recharge dice or turn duration dice like "in 5d10 days"
      const afterText = detail.slice((m.index || 0) + m[0].length, (m.index || 0) + m[0].length + 12);
      if (/^\s*(?:days|hours|minutes|rounds|turns|ft)/i.test(afterText)) continue;
      diceFormulas.push(m[1].replace(/\s+/g, ''));
      if (m[2] && !damageTypes.includes(m[2])) {
        damageTypes.push(m[2]);
      }
    }
  }

  // Determine AoE shape & size
  let aoeShape: ActiveTargetingAction['aoeShape'] = 'circle';
  let aoeSizeFeet = 5;
  let rangeFeet = defaultReachFeet;

  const lineMatch = detail.match(/(\d+)\s*-\s*(?:ft|foot)\s+line/i);
  const coneMatch = detail.match(/(\d+)\s*-\s*(?:ft|foot)\s+cone/i);
  const sphereMatch = detail.match(/(\d+)\s*-\s*(?:ft|foot)(?:\s+radius)?\s+(?:sphere|emanation)/i);
  const cubeMatch = detail.match(/(\d+)\s*-\s*(?:ft|foot)\s+cube/i);

  const rangeMatch =
    detail.match(/range\s+(\d+)(?:\/\d+)?\s*ft/i) ||
    detail.match(/ranged\s+(\d+)\s*ft/i) ||
    detail.match(/within\s+(\d+)\s*ft/i);
  const reachMatch = detail.match(/reach\s+(\d+)\s*ft/i);

  if (rangeMatch) {
    rangeFeet = parseInt(rangeMatch[1], 10);
  } else if (reachMatch) {
    rangeFeet = parseInt(reachMatch[1], 10);
  }

  if (lineMatch) {
    aoeShape = 'line';
    aoeSizeFeet = parseInt(lineMatch[1], 10);
    rangeFeet = Math.max(rangeFeet, aoeSizeFeet);
  } else if (coneMatch) {
    aoeShape = 'cone';
    aoeSizeFeet = parseInt(coneMatch[1], 10);
    rangeFeet = Math.max(rangeFeet, aoeSizeFeet);
  } else if (sphereMatch) {
    aoeShape = 'sphere';
    aoeSizeFeet = parseInt(sphereMatch[1], 10);
    rangeFeet = rangeMatch ? parseInt(rangeMatch[1], 10) : Math.max(30, aoeSizeFeet);
  } else if (cubeMatch) {
    aoeShape = 'cube';
    aoeSizeFeet = parseInt(cubeMatch[1], 10);
    rangeFeet = rangeMatch ? parseInt(rangeMatch[1], 10) : Math.max(30, aoeSizeFeet);
  } else if (
    /^(?:invisibility|enlarge|parry|defensive stance|cunning action|uncanny dodge|aim|deadly aim|misty step|teleport)$/i.test(
      rawName
    )
  ) {
    if (/teleport|misty step/i.test(rawName)) {
      aoeShape = 'circle';
      aoeSizeFeet = 5;
      rangeFeet = rangeMatch ? parseInt(rangeMatch[1], 10) : 60;
    } else {
      aoeShape = 'self';
      aoeSizeFeet = 0;
      rangeFeet = 0;
    }
  }

  // Enrich well-known shorthand Legendary Actions that lack explicit numbers
  const lowerName = rawName.toLowerCase();
  if (diceFormulas.length === 0) {
    if (lowerName.includes('guiding light') || lowerName.includes('blazing light')) {
      diceFormulas.push('4d6');
      damageTypes.push('Radiant');
      rangeFeet = 60;
      aoeShape = 'circle';
    } else if (lowerName.includes('thunderclap') || lowerName.includes('sonic boom')) {
      diceFormulas.push('3d8');
      damageTypes.push('Thunder');
      rangeFeet = 30;
      aoeShape = 'sphere';
      aoeSizeFeet = 15;
    } else if (lowerName.includes('scorching sands') || lowerName.includes('fiery rays')) {
      diceFormulas.push('4d6');
      damageTypes.push('Fire');
      rangeFeet = 60;
      aoeShape = 'sphere';
      aoeSizeFeet = 10;
    } else if (lowerName.includes('tail swipe')) {
      diceFormulas.push('2d8+6');
      damageTypes.push('Bludgeoning');
      rangeFeet = 15;
      aoeShape = 'circle';
    } else if (lowerName.includes('mind jolt') || lowerName.includes('weight of years')) {
      diceFormulas.push('3d8');
      damageTypes.push('Psychic');
      rangeFeet = 60;
      aoeShape = 'circle';
    }
  }

  // Check if healing
  let healing: string | undefined;
  const healMatch = detail.match(/(?:heal|regains?)\s+(?:\d+\s*\[)?(\d+d\d+(?:\s*[+-]\s*\d+)?|\d+)/i);
  if (healMatch && diceFormulas.length === 0) {
    healing = healMatch[1].replace(/\s+/g, '');
  }

  const saveMatch2014 = detail.match(/DC\s+(\d+)\s+([A-Za-z]{3,12})\s+(?:saving\s+throw|save)/i);
  const saveMatch2024 = detail.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+Saving\s+Throw:\*?\s*DC\s*(\d+)/i);
  const saveDcVal = saveMatch2014
    ? parseInt(saveMatch2014[1], 10)
    : saveMatch2024
    ? parseInt(saveMatch2024[2], 10)
    : undefined;
  const saveAbilStr = saveMatch2014
    ? saveMatch2014[2].slice(0, 3).toUpperCase()
    : saveMatch2024
    ? saveMatch2024[1].slice(0, 3).toUpperCase()
    : undefined;
  const formattedSaveType = saveDcVal && saveAbilStr ? `DC ${saveDcVal} ${saveAbilStr} save` : undefined;

  const attackBonusMatch =
    detail.match(/([+-]\d+)\s+to\s+hit/i) ||
    detail.match(/Attack\s+Roll:\*?\s*([+-]\d+)/i);
  const rechargeMatch = detail.match(/Recharge\s+(\d+)(?:\s*[-–]\s*6)?/i) || rawName.match(/Recharge\s+(\d+)(?:\s*[-–]\s*6)?/i);

  return {
    name: isLegendary ? `${rawName}` : rawName,
    actionCost,
    rangeFeet,
    aoeShape,
    aoeSizeFeet,
    damage: diceFormulas.length > 0 ? diceFormulas.join('+') : undefined,
    damageType: damageTypes.length > 0 ? damageTypes.join(' + ') : undefined,
    healing,
    saveType: formattedSaveType,
    saveDc: saveDcVal,
    attackBonus: attackBonusMatch ? parseInt(attackBonusMatch[1], 10) : undefined,
    rechargeMin: rechargeMatch ? parseInt(rechargeMatch[1], 10) : undefined,
    desc: detail || working,
  };
}

/**
 * Extracts a complete, playable combat profile from any Monster LibraryEntry.
 */
export function parseMonsterCombatProfile(
  entry: LibraryEntry | null | undefined,
  library: LibraryEntry[] = []
): ParsedMonsterCombatProfile | null {
  if (!entry) return null;

  const content = entry.content || '';
  const sizeStr = (entry.stats?.size || '').toLowerCase();
  const defaultReachFeet =
    sizeStr.includes('gargantuan')
      ? 15
      : sizeStr.includes('huge') || sizeStr.includes('large')
      ? 10
      : 5;

  // 1. Parse Speed & Movement Modes
  const speedText =
    entry.stats?.speed ||
    content.match(/Speed:\s*([^\n|]+)/i)?.[1]?.trim() ||
    '30 ft.';

  const walkMatch = speedText.match(/(?:^|,\s*)(\d+)\s*ft/i);
  const flyMatch = speedText.match(/Fly\s+(\d+)\s*ft/i);
  const swimMatch = speedText.match(/Swim\s+(\d+)\s*ft/i);
  const climbMatch = speedText.match(/Climb\s+(\d+)\s*ft/i);
  const burrowMatch = speedText.match(/Burrow\s+(\d+)\s*ft/i);

  const baseWalkSpeed = walkMatch ? parseInt(walkMatch[1], 10) : 30;
  const movementModes: MonsterMovementMode[] = [{ mode: 'Walk', speed: baseWalkSpeed }];
  if (flyMatch) movementModes.push({ mode: 'Fly', speed: parseInt(flyMatch[1], 10) });
  if (swimMatch) movementModes.push({ mode: 'Swim', speed: parseInt(swimMatch[1], 10) });
  if (climbMatch) movementModes.push({ mode: 'Climb', speed: parseInt(climbMatch[1], 10) });
  if (burrowMatch) movementModes.push({ mode: 'Burrow', speed: parseInt(burrowMatch[1], 10) });

  const maxSpeed = Math.max(...movementModes.map(m => m.speed), 30);

  // 2. Locate Raw Sections from content & stats
  const traitsSectionMatch = content.match(/Traits:\n([\s\S]*?)(?=\n\nActions:|\nActions:|$)/i);
  const actionsSectionMatch = content.match(
    /Actions:\n([\s\S]*?)(?=\n\nLegendary Actions:|\nLegendary Actions:|$)/i
  );
  const legendarySectionMatch = content.match(/Legendary Actions:\n([\s\S]*?)$/i);

  const rawTraitsText =
    traitsSectionMatch?.[1]?.trim() ||
    entry.stats?.traits?.map(t => (t.name === 'Traits' ? t.desc : `${t.name} (${t.desc})`)).join('. ') ||
    '';

  const rawActionsText =
    actionsSectionMatch?.[1]?.trim() ||
    entry.stats?.actions
      ?.map(a => (a.name === 'Actions' ? a.desc.split(/\n+Legendary Actions:/i)[0] : `${a.name} (${a.desc})`))
      .join('. ') ||
    '';

  const rawLegendaryText =
    legendarySectionMatch?.[1]?.trim() ||
    entry.stats?.actions
      ?.find(a => /Legendary Actions:/i.test(a.desc))
      ?.desc.split(/Legendary Actions:\s*/i)[1] ||
    '';

  // 3. Parse Actions & Legendary Actions
  const hasStructuredActions =
    Array.isArray(entry.stats?.actions) &&
    entry.stats!.actions!.length > 0 &&
    entry.stats!.actions![0].name !== 'Actions';

  const parsedActions: ActiveTargetingAction[] = [];
  const parsedLegendaryActions: ActiveTargetingAction[] = [];

  if (hasStructuredActions) {
    for (const actObj of entry.stats!.actions!) {
      const isLeg = /^(?:Legendary|Mythic):/i.test(actObj.name);
      const parsed = parseActionClause('', defaultReachFeet, isLeg, actObj.name, actObj.desc);
      if (parsed) {
        if (isLeg) {
          parsedLegendaryActions.push(parsed);
        } else {
          parsedActions.push(parsed);
        }
      }
    }
  } else {
    const actionClauses = splitTopLevelClauses(rawActionsText, false);
    for (const clause of actionClauses) {
      const parsed = parseActionClause(clause, defaultReachFeet, false);
      if (parsed) {
        parsedActions.push(parsed);
      }
    }
  }

  // Link Multiattack to primary attack damage & range so Multiattack is directly targetable
  const primaryAttack = parsedActions.find(
    a => a.name.toLowerCase() !== 'multiattack' && Boolean(a.damage)
  );
  for (const act of parsedActions) {
    if (act.name.toLowerCase().startsWith('multiattack') && !act.damage && primaryAttack) {
      const countMatch = act.desc?.match(/(\d+|two|three|four)\s+/i);
      const wordToNum: Record<string, number> = { two: 2, three: 3, four: 4 };
      const rawCount = countMatch
        ? wordToNum[countMatch[1].toLowerCase()] || parseInt(countMatch[1], 10) || 2
        : 2;
      const count = Math.min(5, Math.max(2, rawCount));
      const repeatedFormula = Array(count).fill(primaryAttack.damage).join('+');
      act.damage = repeatedFormula;
      act.damageType = primaryAttack.damageType;
      act.rangeFeet = primaryAttack.rangeFeet;
      act.aoeShape = primaryAttack.aoeShape;
      act.aoeSizeFeet = primaryAttack.aoeSizeFeet;
      act.attackBonus = primaryAttack.attackBonus;
    }
  }

  if (!hasStructuredActions) {
    const legendaryClauses = splitTopLevelClauses(rawLegendaryText, true);
    for (const clause of legendaryClauses) {
      const parsed = parseActionClause(clause, defaultReachFeet, true);
      if (parsed) {
        parsedLegendaryActions.push(parsed);
      }
    }
  }

  for (const parsed of parsedLegendaryActions) {
    if (!parsed.damage && /pounce|claw|rend|bite|slam|strike|lash|attack/i.test(parsed.name) && primaryAttack) {
      parsed.damage = primaryAttack.damage;
      parsed.damageType = primaryAttack.damageType;
      parsed.rangeFeet = primaryAttack.rangeFeet;
      parsed.attackBonus = primaryAttack.attackBonus;
    }
  }

  // 4. Parse Spells (from Spellcasting traits/actions + Breath/Magical/Legendary abilities)
  const parsedSpells: ActiveTargetingAction[] = [];
  const addedSpellNames = new Set<string>();

  const addSpellByName = (spellName: string) => {
    const clean = spellName.trim().replace(/[.;]+$/, '');
    if (!clean || addedSpellNames.has(clean.toLowerCase())) return;

    const libSpell = library.find(
      e => e.category === 'spells' && e.name.toLowerCase() === clean.toLowerCase()
    );

    if (libSpell) {
      addedSpellNames.add(clean.toLowerCase());
      const rangeNum = parseInt(libSpell.stats?.range || '60', 10) || 60;
      const isSelf = (libSpell.stats?.range || '').toLowerCase().includes('self');
      const isCone = (libSpell.content || '').toLowerCase().includes('cone');
      const isLine = (libSpell.content || '').toLowerCase().includes('line');
      const isSphere =
        (libSpell.content || '').toLowerCase().includes('sphere') ||
        libSpell.name.toLowerCase().includes('fireball');

      parsedSpells.push({
        name: libSpell.name,
        actionCost: (libSpell.stats?.castingTime || '').toLowerCase().includes('bonus')
          ? 'Bonus Action'
          : (libSpell.stats?.castingTime || '').toLowerCase().includes('reaction')
          ? 'Reaction'
          : 'Action',
        rangeFeet: isSelf ? 0 : rangeNum,
        aoeShape: isSelf ? 'self' : isCone ? 'cone' : isLine ? 'line' : isSphere ? 'sphere' : 'circle',
        aoeSizeFeet: isCone || isLine ? 30 : isSphere ? 20 : 5,
        damage: libSpell.stats?.damage,
        damageType: libSpell.stats?.damageType,
        healing: libSpell.stats?.healing,
        spellLevel: libSpell.stats?.level ?? 1,
        desc: libSpell.summary || libSpell.content.slice(0, 220),
      });
    }
  };

  // Extract explicit [[SpellName|Source]] links from traits, actions, and full content (5etools format)
  const combinedText = `${rawTraitsText}\n${rawActionsText}\n${rawLegendaryText}\n${content}`;
  const wikiSpellLinks = Array.from(combinedText.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g));
  for (const m of wikiSpellLinks) {
    addSpellByName(m[1]);
  }

  // Extract explicit Spellcasting (...) lists from traits and actions
  const spellcastingMatches = Array.from(combinedText.matchAll(/Spellcasting\s*\(([^)]+)\)/gi));
  for (const m of spellcastingMatches) {
    const inside = m[1];
    const afterColon = inside.includes(':') ? inside.split(':').slice(1).join(':') : inside;
    const candidates = afterColon.split(/[,;]/);
    for (const c of candidates) {
      const cleaned = c
        .replace(/\b(?:at will|1\/day|2\/day|3\/day|bonus action)\b/gi, '')
        .trim();
      addSpellByName(cleaned);
    }
  }

  // Also scan parenthetical spell references in Legendary Actions / Actions (e.g., "Commanding Presence (Command)")
  const parenRefs = Array.from(combinedText.matchAll(/\(([A-Za-z\s']+?)\)/g));
  for (const m of parenRefs) {
    addSpellByName(m[1]);
  }

  // Also include Breath Weapons, Gaze, Roar, Ray, and Magical Legendary Actions in the Spells/Abilities tab
  // without matching mundane weapons like "Light Crossbow" or "Light Hammer"
  const supernaturalNameRegex =
    /\b(?:breath|ray|rays|gaze|roar|guiding light|blazing light|thunderclap|sonic boom|cloud|miasma|hex|curse|void|arcane burst|radiant burst|radiant flame|blinding flash|majestic song|cacophonous crescendo|holy word|hurl flame|acid spray|whirlwind|spore bomb|mind jolt|weight of years|scorching sands|cloaked flight|banish)\b/i;

  for (const act of [...parsedActions, ...parsedLegendaryActions]) {
    if (supernaturalNameRegex.test(act.name) && !addedSpellNames.has(act.name.toLowerCase())) {
      addedSpellNames.add(act.name.toLowerCase());
      parsedSpells.push(act);
    }
  }

  // 5. Build Monster Equipment / Inventory Items (Weapons + Armor + Natural Weapons)
  const items: MonsterInventoryItem[] = [];
  const addedItemNames = new Set<string>();

  // Add armor / shield from Armor Class line
  const acLineMatch = content.match(/Armor Class:\s*\d+\s*\(([^)]+)\)/i);
  const acNote = acLineMatch?.[1]?.trim();
  if (acNote) {
    const parts = acNote.split(',').map(p => p.trim());
    for (const part of parts) {
      const formattedName = part
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      if (!addedItemNames.has(formattedName.toLowerCase())) {
        addedItemNames.add(formattedName.toLowerCase());
        items.push({
          name: formattedName,
          quantity: 1,
          desc: `Equipped Defense (${entry.name} • AC ${entry.stats?.ac || 13})`,
        });
      }
    }
  }

  // Add weapons & natural attacks from parsedActions (excluding non-weapon tactical stances/reactions)
  const nonItemActionRegex =
    /^(?:multiattack|cunning action|uncanny dodge|parry|defensive stance|aim|deadly aim|absorb body|teleport)$/i;

  for (const act of parsedActions) {
    if (nonItemActionRegex.test(act.name.trim())) continue;
    if (!addedItemNames.has(act.name.toLowerCase())) {
      addedItemNames.add(act.name.toLowerCase());
      items.push({
        name: act.name,
        quantity: 1,
        desc: act.desc || `${act.damage || ''} ${act.damageType || ''} (${act.rangeFeet} ft)`,
        isWeapon: true,
        action: act,
      });
    }
  }

  // 6. Build Monster Features & Traits (Traits + Defenses + Senses + Languages + Legendary/Tactical Actions)
  const features: MonsterFeatureItem[] = [];
  if (Array.isArray(entry.stats?.traits) && entry.stats!.traits!.length > 0 && entry.stats!.traits![0].name !== 'Traits') {
    for (const tr of entry.stats!.traits!) {
      features.push({
        name: stripWikiLinks(tr.name),
        desc: stripWikiLinks(tr.desc),
        badge: 'Trait',
      });
    }
  } else {
    const traitClauses = splitTopLevelClauses(rawTraitsText, false);
    for (const clause of traitClauses) {
      const m = clause.match(/^([^(]+?)(?:\s*\(([\s\S]+)\))?$/);
      const tName = stripWikiLinks((m ? m[1] : clause).trim());
      const tDesc = stripWikiLinks((m && m[2] ? m[2] : clause).trim());
      if (!tName) continue;
      features.push({
        name: tName,
        desc: tDesc,
        badge: 'Trait',
      });
    }
  }

  // Include tactical Bonus Actions / Reactions (like Cunning Action, Parry, Uncanny Dodge) in Features too
  for (const act of parsedActions) {
    if (act.actionCost === 'Bonus Action' || act.actionCost === 'Reaction') {
      features.push({
        name: act.name,
        desc: act.desc || `${act.actionCost}`,
        badge: act.actionCost,
        action: act,
      });
    }
  }

  // Add Resistances, Immunities, Senses, Languages from content so all Stat Block traits are visible
  const immMatch = content.match(/Immunities:\s*([^\n]+)/i);
  if (immMatch) {
    features.push({
      name: `Immunities: ${immMatch[1].trim()}`,
      desc: `${entry.name} is immune to ${immMatch[1].trim()}.`,
      badge: 'Defense',
    });
  }

  const resMatch = content.match(/Damage Resistances:\s*([^\n]+)/i);
  if (resMatch) {
    features.push({
      name: `Resistances: ${resMatch[1].trim()}`,
      desc: `${entry.name} has resistance to ${resMatch[1].trim()}.`,
      badge: 'Defense',
    });
  }

  const sensesMatch = content.match(/Senses:\s*([^\n]+)/i);
  if (sensesMatch) {
    features.push({
      name: `Senses: ${sensesMatch[1].trim()}`,
      desc: sensesMatch[1].trim(),
      badge: 'Senses',
    });
  }

  const langMatch = content.match(/Languages:\s*([^\n]+)/i);
  if (langMatch) {
    features.push({
      name: `Languages: ${langMatch[1].trim()}`,
      desc: `Speaks/understands ${langMatch[1].trim()}.`,
      badge: 'Trait',
    });
  }

  // Include Legendary Actions in Features as well with interactive targeting
  for (const leg of parsedLegendaryActions) {
    features.push({
      name: `Legendary: ${leg.name}`,
      desc: leg.desc || 'Legendary Action',
      badge: 'Legendary',
      action: leg,
    });
  }

  return {
    baseWalkSpeed,
    maxSpeed,
    movementModes,
    actions: [...parsedActions, ...parsedLegendaryActions],
    legendaryActions: parsedLegendaryActions,
    spells: parsedSpells,
    items,
    features,
  };
}
