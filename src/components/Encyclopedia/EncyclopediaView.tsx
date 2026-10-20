import React, { useState, useMemo, useEffect } from 'react';
import { Category, LibraryEntry, PartyMember } from '../../types.ts';
import { filterEntries, buildCrossReferenceIndex } from '../../utils/importer.ts';
import { FIVE_E_TOOLS_SOURCEBOOKS, getSourcebookFullName } from '../../data/seedData.ts';
import { ImportLibraryModal } from './ImportLibraryModal.tsx';
import { HomebrewModal } from './HomebrewModal.tsx';
import { RichCompendiumContent } from './RichCompendiumContent.tsx';
import {
  Search,
  Upload,
  Plus,
  Bookmark,
  Trash2,
  Swords,
  Sparkles,
  BookOpen,
  RefreshCw,
  Tag,
  ArrowLeft,
  UserPlus,
  FileText,
  X,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Library
} from 'lucide-react';

interface EncyclopediaViewProps {
  entries: LibraryEntry[];
  onAddEntry: (entry: LibraryEntry) => void;
  onAddBulkEntries: (entries: LibraryEntry[]) => void;
  onDeleteEntry: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSendToEncounter?: (entry: LibraryEntry) => void;
  onUpdateEntry?: (entry: LibraryEntry) => void;
  onForceSyncSRD?: () => Promise<void>;
  party?: PartyMember[];
  onGrantToPartyMember?: (memberId: string, entry: LibraryEntry) => void;
  onSendToNotes?: (entry: LibraryEntry) => void;
  initialSelectedEntryId?: string | null;
}

const LIBRARY_CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All Entities' },
  { id: 'classes', label: 'Classes & Subclasses' },
  { id: 'races', label: 'Species' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'feats', label: 'Feats' },
  { id: 'spells', label: 'Spells' },
  { id: 'monsters', label: 'Monsters & Animals' },
  { id: 'equipment', label: 'Equipment' },
  { id: 'magic_items', label: 'Magic Items' },
  { id: 'actions', label: 'Actions' },
  { id: 'rules', label: 'Rules & Glossary' },
];

const ACTION_FILTERS = ['all', 'Action', 'Bonus Action', 'Reaction'] as const;

const SPELL_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const MONSTER_TYPES = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
];

// Core SRD terms that are automatically cross-referenced inside entry descriptions
const CROSS_REFERENCE_TERMS = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Exhaustion',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Concentration',
  'Advantage',
  'Disadvantage',
  'Difficult Terrain',
  'Bloodied',
  'Heroic Inspiration',
  'Opportunity Attack',
  'Darkvision',
  'Blindsight',
  'Truesight',
  'Tremorsense',
  'Half Cover',
  'Three-Quarters Cover',
  'Total Cover',
  'Short Rest',
  'Long Rest',
  'Death Saving Throw',
  'Unarmed Strike',
  'Cleave',
  'Graze',
  'Nick',
  'Push',
  'Sap',
  'Slow',
  'Topple',
  'Vex',
  'Dash',
  'Disengage',
  'Dodge',
  'Help',
  'Hide',
  'Influence',
  'Magic',
  'Ready',
  'Search',
  'Study',
  'Utilize',
];

function parseCrNumeric(cr: string | number | undefined): number {
  if (cr === undefined || cr === null) return -1;
  const s = String(cr).trim();
  if (s === '1/8') return 0.125;
  if (s === '1/4') return 0.25;
  if (s === '1/2') return 0.5;
  const n = parseFloat(s);
  return isNaN(n) ? -1 : n;
}

function formatCategoryLabel(cat: Category): string {
  switch (cat) {
    case 'classes':
      return 'Class / Subclass';
    case 'races':
      return 'Species';
    case 'backgrounds':
      return 'Background';
    case 'feats':
      return 'Feat';
    case 'spells':
      return 'Spell';
    case 'monsters':
      return 'Monster';
    case 'equipment':
      return 'Equipment';
    case 'magic_items':
      return 'Magic Item';
    case 'items':
      return 'Item';
    case 'actions':
      return 'Action';
    case 'rules':
      return 'Rule / Glossary';
    default:
      return cat;
  }
}

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({
  entries,
  onAddEntry,
  onAddBulkEntries,
  onDeleteEntry,
  onTogglePin,
  onSendToEncounter,
  onUpdateEntry,
  onForceSyncSRD,
  party = [],
  onGrantToPartyMember,
  onSendToNotes,
  initialSelectedEntryId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [activeActionType, setActiveActionType] = useState<string>('all');
  const [filterCr, setFilterCr] = useState('all');
  const [filterMonsterType, setFilterMonsterType] = useState('all');
  const [filterSpellLevel, setFilterSpellLevel] = useState('all');
  const [filterSchool, setFilterSchool] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterTag, setFilterTag] = useState('all');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'cr_asc' | 'cr_desc' | 'level_asc' | 'pinned'>('name_asc');
  const [visibleLimit, setVisibleLimit] = useState(200);

  // Master-detail selection & cross-reference breadcrumb history
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(initialSelectedEntryId || null);
  const [readingHistory, setReadingHistory] = useState<string[]>([]);

  // Modals & Popovers
  const [showImportModal, setShowImportModal] = useState(false);
  const [showHomebrewModal, setShowHomebrewModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showGrantMenu, setShowGrantMenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTagInput, setShowAddTagInput] = useState(false);

  // Build fast cross-reference index across all sourcebooks and entities
  const crossRefIndex = useMemo(() => buildCrossReferenceIndex(entries), [entries]);

  // Available sourcebooks with counts
  const availableSources = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      const src = (e.source || 'XPHB').trim();
      counts.set(src, (counts.get(src) || 0) + 1);
    }
    const PRIORITY_BOOKS = ['XPHB', 'XMM', 'XDMG', 'PHB', 'MM', 'DMG', 'TCE', 'XGE', 'MPMM', 'FTD', 'BGG', 'BMT', 'ERLW', 'EGW', 'GGR', 'MOT', 'SCC', 'VRGR', 'VGM', 'MTF', 'SCAG'];
    return Array.from(counts.entries())
      .map(([code, count]) => ({
        code,
        name: FIVE_E_TOOLS_SOURCEBOOKS[code] || code,
        count,
      }))
      .sort((a, b) => {
        const idxA = PRIORITY_BOOKS.indexOf(a.code);
        const idxB = PRIORITY_BOOKS.indexOf(b.code);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.code.localeCompare(b.code);
      });
  }, [entries]);

  // Compute category counts for tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: entries.length,
      classes: 0,
      races: 0,
      backgrounds: 0,
      feats: 0,
      spells: 0,
      monsters: 0,
      equipment: 0,
      magic_items: 0,
      actions: 0,
      rules: 0,
    };

    for (const e of entries) {
      if (e.category === 'classes' || (e.category === 'races_classes' && e.tags.includes('Class'))) {
        counts.classes++;
      } else if (e.category === 'races' || (e.category === 'races_classes' && e.tags.includes('Race'))) {
        counts.races++;
      } else if (e.category === 'backgrounds' || e.tags.includes('Background')) {
        counts.backgrounds++;
      } else if (e.category === 'feats' || e.tags.includes('Feat')) {
        counts.feats++;
      } else if (e.category === 'spells') {
        counts.spells++;
      } else if (e.category === 'monsters') {
        counts.monsters++;
      } else if (e.category === 'equipment' || (e.category === 'items' && !e.tags.includes('Magic Item'))) {
        counts.equipment++;
      } else if (e.category === 'magic_items' || (e.category === 'items' && e.tags.includes('Magic Item'))) {
        counts.magic_items++;
      } else if (e.category === 'actions') {
        counts.actions++;
      } else {
        counts.rules++;
      }
    }
    return counts;
  }, [entries]);

  // Collect all unique tags for the tag filter dropdown
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    for (const e of entries) {
      for (const t of e.tags) {
        if (t && !t.startsWith('CR ') && !t.startsWith('Level ')) {
          set.add(t);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    const base = filterEntries(entries, {
      query: searchQuery,
      category: activeCategory,
      source: filterSource === 'all' ? undefined : filterSource,
      actionType: activeActionType === 'all' ? undefined : activeActionType,
      cr: activeCategory === 'monsters' || activeCategory === 'all' ? filterCr : undefined,
      monsterType: activeCategory === 'monsters' || activeCategory === 'all' ? filterMonsterType : undefined,
      spellLevel: activeCategory === 'spells' || activeCategory === 'all' ? filterSpellLevel : undefined,
      school: activeCategory === 'spells' || activeCategory === 'all' ? filterSchool : undefined,
      rarity:
        activeCategory === 'magic_items' || activeCategory === 'equipment' || activeCategory === 'all'
          ? filterRarity
          : undefined,
      tag: filterTag === 'all' ? undefined : filterTag,
      bookmarkedOnly,
    });

    return [...base].sort((a, b) => {
      if (sortBy === 'pinned') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
      } else if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name);
      } else if (sortBy === 'cr_asc') {
        const crA = parseCrNumeric(a.stats?.cr);
        const crB = parseCrNumeric(b.stats?.cr);
        if (crA !== crB) return crA - crB;
      } else if (sortBy === 'cr_desc') {
        const crA = parseCrNumeric(a.stats?.cr);
        const crB = parseCrNumeric(b.stats?.cr);
        if (crA !== crB) return crB - crA;
      } else if (sortBy === 'level_asc') {
        const lvlA = a.stats?.level ?? 99;
        const lvlB = b.stats?.level ?? 99;
        if (lvlA !== lvlB) return lvlA - lvlB;
      }
      return a.name.localeCompare(b.name);
    });
  }, [
    entries,
    searchQuery,
    activeCategory,
    filterSource,
    activeActionType,
    filterCr,
    filterMonsterType,
    filterSpellLevel,
    filterSchool,
    filterRarity,
    filterTag,
    bookmarkedOnly,
    sortBy,
  ]);

  // Sync when navigated from outside (e.g., Session Hub, Battle Map, or Character Sheet)
  useEffect(() => {
    if (initialSelectedEntryId) {
      const target = entries.find(e => e.id === initialSelectedEntryId);
      if (target) {
        setSelectedEntryId(target.id);
        setActiveCategory('all');
        setFilterSource('all');
        setSearchQuery('');
      }
    }
  }, [initialSelectedEntryId, entries]);

  // Keep a valid selected entry whenever filtered list changes
  const activeEntry = useMemo(() => {
    if (selectedEntryId) {
      const exact = entries.find(e => e.id === selectedEntryId);
      if (exact) return exact;
    }
    return filteredEntries[0] || entries[0] || null;
  }, [selectedEntryId, entries, filteredEntries]);

  // Reset visible window when filters change
  useEffect(() => {
    setVisibleLimit(200);
  }, [
    searchQuery,
    activeCategory,
    filterSource,
    activeActionType,
    filterCr,
    filterMonsterType,
    filterSpellLevel,
    filterSchool,
    filterRarity,
    filterTag,
    bookmarkedOnly,
  ]);

  const handleSelectEntry = (entry: LibraryEntry, pushHistory = false) => {
    if (pushHistory && activeEntry && activeEntry.id !== entry.id) {
      setReadingHistory(prev => [...prev.slice(-8), activeEntry.id]);
    } else if (!pushHistory) {
      setReadingHistory([]);
    }
    setSelectedEntryId(entry.id);
    setShowGrantMenu(false);
    setShowAddTagInput(false);
  };

  const handleStepBack = () => {
    if (readingHistory.length === 0) return;
    const prevId = readingHistory[readingHistory.length - 1];
    setReadingHistory(prev => prev.slice(0, -1));
    setSelectedEntryId(prevId);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setFilterSource('all');
    setActiveActionType('all');
    setFilterCr('all');
    setFilterMonsterType('all');
    setFilterSpellLevel('all');
    setFilterSchool('all');
    setFilterRarity('all');
    setFilterTag('all');
    setBookmarkedOnly(false);
  };

  const handleSyncClick = async () => {
    if (!onForceSyncSRD) return;
    setIsSyncing(true);
    try {
      await onForceSyncSRD();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntry || !newTagInput.trim() || !onUpdateEntry) return;
    const clean = newTagInput.trim();
    if (!activeEntry.tags.includes(clean)) {
      onUpdateEntry({
        ...activeEntry,
        tags: [...activeEntry.tags, clean],
      });
    }
    setNewTagInput('');
    setShowAddTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeEntry || !onUpdateEntry) return;
    onUpdateEntry({
      ...activeEntry,
      tags: activeEntry.tags.filter(t => t !== tagToRemove),
    });
  };

  // Build concise, unboxed middot metadata line for master index row
  const getRowMetadataLine = (entry: LibraryEntry): string => {
    const parts: string[] = [formatCategoryLabel(entry.category)];
    const st = entry.stats || {};

    if (entry.category === 'spells') {
      parts.push(st.level === 0 ? 'Cantrip' : `Level ${st.level ?? 1}`);
      if (st.school) parts.push(st.school);
      if (st.castingTime) parts.push(st.castingTime);
      if (st.damage) parts.push(`${st.damage} ${st.damageType || ''}`.trim());
    } else if (entry.category === 'monsters') {
      if (st.size || st.type) parts.push(`${st.size || ''} ${st.type || ''}`.trim());
      if (st.cr !== undefined) parts.push(`CR ${st.cr}`);
      if (st.ac !== undefined) parts.push(`AC ${st.ac}`);
      if (st.hp !== undefined) parts.push(`HP ${st.hp}`);
    } else if (entry.category === 'equipment' || entry.category === 'magic_items' || entry.category === 'items') {
      if (st.itemType) parts.push(st.itemType);
      if (st.rarity && st.rarity !== 'Common') parts.push(st.rarity);
      if (st.cost) parts.push(st.cost);
      if (st.damage) parts.push(`${st.damage} ${st.damageType || ''}`.trim());
      if (st.ac) parts.push(`AC ${st.ac}`);
      if (st.mastery) parts.push(`Mastery: ${st.mastery}`);
    } else if (entry.category === 'feats' || entry.category === 'backgrounds' || entry.category === 'classes' || entry.category === 'races') {
      if (entry.summary) {
        const firstPart = entry.summary.split('•')[0].trim();
        if (firstPart && firstPart !== entry.name) parts.push(firstPart);
      }
    } else if (st.actionType) {
      parts.push(st.actionType);
    }

    return parts.slice(0, 4).join(' · ');
  };

  // Find other sourcebook printings of the currently selected entity (e.g. XPHB vs PHB, XMM vs MM)
  const activeEntrySourceVariants = useMemo(() => {
    if (!activeEntry) return [];
    return crossRefIndex.getSourceVariants(activeEntry);
  }, [activeEntry, crossRefIndex]);

  // Find related cross-referenced entries mentioned in the active entry
  const relatedEntries = useMemo(() => {
    if (!activeEntry) return [];
    const contentText = activeEntry.content || '';
    const found: LibraryEntry[] = [];
    const seen = new Set<string>([activeEntry.id]);

    // 1. Extract explicit [[Target|Source|Display]] 5etools links
    const wikiMatches = contentText.matchAll(/\[\[([^\]|]+)(?:\|([^\]|]*))?(?:\|([^\]]*))?\]\]/g);
    for (const m of wikiMatches) {
      const targetName = (m[1] || '').trim();
      const targetSrc = (m[2] || '').trim();
      const target = crossRefIndex.resolveLink(targetName, targetSrc, activeEntry.source);
      if (target && !seen.has(target.id)) {
        seen.add(target.id);
        found.push(target);
      }
      if (found.length >= 24) break;
    }

    // 2. Fallback check for core SRD terms if fewer than 12 links
    if (found.length < 12) {
      const lowerText = `${activeEntry.summary || ''}\n${contentText}`.toLowerCase();
      for (const term of CROSS_REFERENCE_TERMS) {
        const lowerTerm = term.toLowerCase();
        if (lowerText.includes(lowerTerm)) {
          const target = crossRefIndex.resolveLink(term, undefined, activeEntry.source);
          if (target && !seen.has(target.id)) {
            seen.add(target.id);
            found.push(target);
          }
        }
        if (found.length >= 24) break;
      }
    }
    return found;
  }, [activeEntry, crossRefIndex]);

  const visibleEntries = filteredEntries.slice(0, visibleLimit);

  return (
    <div className="space-y-4">
      {/* Top Library Command Header */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-fantasy tracking-wide">
                5etools Complete Compendium
              </h1>
              <span className="text-xs font-mono tabular-nums text-amber-400">
                {entries.length.toLocaleString()} Total Entities · {availableSources.length} Sourcebooks · {filteredEntries.length.toLocaleString()} Matching
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete 5etools Multi-Sourcebook Library (XPHB, PHB, TCE, XGE, MPMM, FTD, BGG, BMT, XMM, MM, XDMG, DMG &amp; 120+ more) with full cross-linked Spells, Classes, Subclasses, Species, Backgrounds, Feats, Monsters, Items &amp; Rules
            </p>
          </div>

          {/* Primary Library Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onForceSyncSRD && (
              <button
                onClick={handleSyncClick}
                disabled={isSyncing}
                title="Force-refresh library with all 12,000+ 5etools entities across all sourcebooks"
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing 5etools...' : 'Sync 5etools Library'}</span>
              </button>
            )}

            <button
              onClick={() => setShowHomebrewModal(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>New Homebrew</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Compendium</span>
            </button>
          </div>
        </div>

        {/* Dedicated Granular SRD Category Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {LIBRARY_CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            const count = categoryCounts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-950/80 text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-800/80'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`font-mono tabular-nums text-[11px] ${
                    isSelected ? 'text-slate-950/80 font-bold' : 'text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Contextual Faceted Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Live Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search any 5etools spell, monster, feat, class, subclass, species, item, or rule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                title="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sourcebook Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 max-w-[260px]">
            <Library className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              aria-label="Filter by Sourcebook"
              className="bg-slate-950 text-xs text-slate-200 focus:outline-none truncate w-full"
            >
              <option value="all">All Sourcebooks ({availableSources.length})</option>
              {availableSources.map(src => (
                <option key={src.code} value={src.code}>
                  {src.code} — {src.name} ({src.count})
                </option>
              ))}
            </select>
          </div>

          {/* Bookmarks Filter Toggle */}
          <button
            onClick={() => setBookmarkedOnly(prev => !prev)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              bookmarkedOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarked</span>
          </button>

          {/* Action Economy Segmented Filter */}
          {(activeCategory === 'all' || activeCategory === 'actions' || activeCategory === 'spells' || activeCategory === 'classes') && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {ACTION_FILTERS.map(act => (
                <button
                  key={act}
                  onClick={() => setActiveActionType(act)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeActionType === act
                      ? 'bg-slate-800 text-amber-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {act === 'all' ? 'Any Action' : act}
                </button>
              ))}
            </div>
          )}

          {/* Monster CR & Type Filters */}
          {(activeCategory === 'monsters' || activeCategory === 'all') && (
            <>
              <select
                value={filterCr}
                onChange={e => setFilterCr(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-mono tabular-nums"
              >
                <option value="all">All CRs</option>
                <option value="0">CR 0</option>
                <option value="1/8">CR 1/8</option>
                <option value="1/4">CR 1/4</option>
                <option value="1/2">CR 1/2</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 30].map(c => (
                  <option key={c} value={String(c)}>
                    CR {c}
                  </option>
                ))}
              </select>

              <select
                value={filterMonsterType}
                onChange={e => setFilterMonsterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Creature Types</option>
                {MONSTER_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Spell Level & School Filters */}
          {(activeCategory === 'spells' || activeCategory === 'all') && (
            <>
              <select
                value={filterSpellLevel}
                onChange={e => setFilterSpellLevel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-mono tabular-nums"
              >
                <option value="all">All Spell Levels</option>
                <option value="0">Cantrip (0)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                  <option key={l} value={String(l)}>
                    Level {l}
                  </option>
                ))}
              </select>

              <select
                value={filterSchool}
                onChange={e => setFilterSchool(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Schools</option>
                {SPELL_SCHOOLS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Item Rarity Filter */}
          {(activeCategory === 'magic_items' || activeCategory === 'equipment' || activeCategory === 'all') && (
            <select
              value={filterRarity}
              onChange={e => setFilterRarity(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Uncommon">Uncommon</option>
              <option value="Rare">Rare</option>
              <option value="Very Rare">Very Rare</option>
              <option value="Legendary">Legendary</option>
              <option value="Artifact">Artifact</option>
            </select>
          )}

          {/* Custom / Compendium Tag Filter */}
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 max-w-[160px]"
          >
            <option value="all">All Tags</option>
            {allUniqueTags.map(t => (
              <option key={t} value={t}>
                Tag: {t}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="name_asc">Sort: Name (A–Z)</option>
              <option value="name_desc">Sort: Name (Z–A)</option>
              <option value="pinned">Sort: Bookmarked First</option>
              <option value="cr_asc">Sort: CR (Low to High)</option>
              <option value="cr_desc">Sort: CR (High to Low)</option>
              <option value="level_asc">Sort: Spell Level (0–9)</option>
            </select>
          </div>

          {(searchQuery ||
            activeCategory !== 'all' ||
            filterSource !== 'all' ||
            activeActionType !== 'all' ||
            filterCr !== 'all' ||
            filterMonsterType !== 'all' ||
            filterSpellLevel !== 'all' ||
            filterSchool !== 'all' ||
            filterRarity !== 'all' ||
            filterTag !== 'all' ||
            bookmarkedOnly) && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-2 rounded-lg text-xs text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Split Master-Detail Workspace */}
      {filteredEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200 font-fantasy">
            No Matching Library Entities Found
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No entries matched your current search or filter criteria. Reset your active filters or sync the complete SRD 5.2.1 compendium.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
            {onForceSyncSRD && (
              <button
                onClick={handleSyncClick}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                Sync Complete SRD
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT PANE: High-Density Master Entity Index (5 cols on lg, 4 cols on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col lg:h-[calc(100vh-250px)] lg:min-h-[640px]">
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">
                Showing <span className="text-slate-200 font-mono tabular-nums">{visibleEntries.length}</span> of{' '}
                <span className="text-amber-400 font-mono tabular-nums">{filteredEntries.length}</span> entities
              </span>
              {filteredEntries.length > visibleLimit && (
                <button
                  onClick={() => setVisibleLimit(filteredEntries.length)}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Show All ({filteredEntries.length})
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {visibleEntries.map(entry => {
                const isSelected = activeEntry?.id === entry.id;
                const metaLine = getRowMetadataLine(entry);

                return (
                  <div
                    key={entry.id}
                    onClick={() => handleSelectEntry(entry, false)}
                    className={`px-4 py-3 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/12 text-slate-100'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-amber-400' : 'text-slate-100'
                          }`}
                        >
                          {entry.name}
                        </span>
                        {entry.source && (
                          <span
                            title={getSourcebookFullName(entry.source)}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/90 text-slate-400 border border-slate-800 shrink-0"
                          >
                            {entry.source}
                          </span>
                        )}
                        {entry.custom && (
                          <span className="text-[10px] text-amber-400/90 font-mono shrink-0">
                            Homebrew
                          </span>
                        )}
                      </div>
                      {/* Zero-Pill Metadata Discipline: Clean unboxed text with middot separators */}
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono tabular-nums">
                        {metaLine}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onTogglePin(entry.id);
                        }}
                        title={entry.pinned ? 'Remove Bookmark' : 'Bookmark Entry'}
                        className={`p-1 rounded transition-colors ${
                          entry.pinned
                            ? 'text-amber-400 hover:text-amber-300'
                            : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}

              {filteredEntries.length > visibleLimit && (
                <div className="p-3 bg-slate-950/50 text-center flex items-center justify-center gap-3">
                  <button
                    onClick={() => setVisibleLimit(prev => prev + 250)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    Load 250 More
                  </button>
                  <button
                    onClick={() => setVisibleLimit(filteredEntries.length)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                  >
                    Load All ({filteredEntries.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: Live Entry Reader & Interactive Session Dispatcher (7 cols on lg, 8 cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col lg:h-[calc(100vh-250px)] lg:min-h-[640px]">
            {activeEntry ? (
              <>
                {/* Breadcrumb History Trail (when navigating cross-references) */}
                {readingHistory.length > 0 && (
                  <div className="px-5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <button
                        onClick={handleStepBack}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back</span>
                      </button>
                      <span className="text-slate-500">Trail:</span>
                      {readingHistory.map((histId, idx) => {
                        const histEntry = entries.find(e => e.id === histId);
                        if (!histEntry) return null;
                        return (
                          <React.Fragment key={`${histId}_${idx}`}>
                            <button
                              onClick={() => {
                                setReadingHistory(prev => prev.slice(0, idx));
                                setSelectedEntryId(histId);
                              }}
                              className="text-slate-400 hover:text-amber-400 truncate max-w-[140px] cursor-pointer"
                            >
                              {histEntry.name}
                            </button>
                            <span className="text-slate-600">/</span>
                          </React.Fragment>
                        );
                      })}
                      <span className="text-amber-400 font-semibold truncate">{activeEntry.name}</span>
                    </div>
                    <button
                      onClick={() => setReadingHistory([])}
                      className="text-[11px] text-slate-500 hover:text-slate-300 shrink-0 cursor-pointer"
                    >
                      Clear Trail
                    </button>
                  </div>
                )}

                {/* Reader Header & Session Dispatch Toolbar */}
                <div className="p-5 sm:p-6 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    {/* Clean unboxed metadata kicker */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-mono tabular-nums">
                      <span>{formatCategoryLabel(activeEntry.category)}</span>
                      <span aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={() => activeEntry.source && setFilterSource(activeEntry.source)}
                        title="Click to filter library by this sourcebook"
                        className="text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        {activeEntry.source || 'XPHB'} ({getSourcebookFullName(activeEntry.source)})
                      </button>
                      {activeEntry.stats?.actionType && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-400">{activeEntry.stats.actionType}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 font-fantasy tracking-wide">
                      {activeEntry.name}
                    </h2>
                    {activeEntry.summary && (
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                        {activeEntry.summary}
                      </p>
                    )}

                    {/* Multi-Sourcebook Version Switcher (e.g. XPHB 2024 vs PHB 2014, XMM vs MM, MPMM vs VGM) */}
                    {activeEntrySourceVariants.length > 1 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 mr-1">
                          Sourcebook Printings:
                        </span>
                        {activeEntrySourceVariants.map(variant => {
                          const isCurrent = variant.id === activeEntry.id;
                          const srcCode = variant.source || 'XPHB';
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => handleSelectEntry(variant, true)}
                              title={getSourcebookFullName(srcCode)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                              }`}
                            >
                              {srcCode}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Interactive Dispatch & Bookmark Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 relative">
                    {/* 1. Monsters: Spawn in Encounter */}
                    {activeEntry.category === 'monsters' && onSendToEncounter && (
                      <button
                        onClick={() => onSendToEncounter(activeEntry)}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Spawn in Encounter</span>
                      </button>
                    )}

                    {/* 2. Spells, Equipment, Magic Items, Feats, Classes: Grant to Party Member */}
                    {activeEntry.category !== 'monsters' && party.length > 0 && onGrantToPartyMember && (
                      <div className="relative">
                        <button
                          onClick={() => setShowGrantMenu(prev => !prev)}
                          className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>
                            {activeEntry.category === 'spells'
                              ? 'Add to PC Spellbook'
                              : activeEntry.category === 'equipment' || activeEntry.category === 'magic_items' || activeEntry.category === 'items'
                              ? 'Give Item to PC'
                              : 'Grant to PC Sheet'}
                          </span>
                        </button>

                        {showGrantMenu && (
                          <div className="absolute right-0 mt-1.5 w-56 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1">
                            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                              Select Party Member
                            </div>
                            {party.map(member => (
                              <button
                                key={member.id}
                                onClick={() => {
                                  onGrantToPartyMember(member.id, activeEntry);
                                  setShowGrantMenu(false);
                                }}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-amber-500 hover:text-slate-950 font-medium flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>{member.name}</span>
                                <span className="text-[10px] opacity-75 font-mono">
                                  Lv{member.level} {member.characterClass}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Send to Session Scratchpad Notes */}
                    {onSendToNotes && (
                      <button
                        onClick={() => onSendToNotes(activeEntry)}
                        title="Append this entry to your Session Scratchpad notes"
                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Send to Notes</span>
                      </button>
                    )}

                    {/* 4. Bookmark / Pin Toggle */}
                    <button
                      onClick={() => onTogglePin(activeEntry.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeEntry.pinned
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                      <span>{activeEntry.pinned ? 'Bookmarked' : 'Bookmark'}</span>
                    </button>

                    {/* 5. Delete Custom Entry */}
                    {activeEntry.custom && (
                      <button
                        onClick={() => onDeleteEntry(activeEntry.id)}
                        title="Delete custom homebrew entry"
                        className="p-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable Reader Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                  {/* MONSTER STRUCTURED STATBLOCK GRID */}
                  {activeEntry.category === 'monsters' && activeEntry.stats && (
                    <div className="space-y-4 border-b border-slate-800/80 pb-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Armor Class</div>
                          <div className="text-base font-bold text-slate-100 mt-0.5">
                            {activeEntry.stats.ac ?? 10}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Hit Points</div>
                          <div className="text-base font-bold text-emerald-400 mt-0.5">
                            {activeEntry.stats.hp ?? 10}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Challenge Rating</div>
                          <div className="text-base font-bold text-amber-400 mt-0.5">
                            CR {activeEntry.stats.cr ?? '0'}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Speed</div>
                          <div className="text-xs font-semibold text-slate-200 mt-1 truncate" title={activeEntry.stats.speed}>
                            {activeEntry.stats.speed || '30 ft.'}
                          </div>
                        </div>
                      </div>

                      {activeEntry.stats.abilities && (
                        <div className="grid grid-cols-6 gap-2 font-mono tabular-nums text-center">
                          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(statKey => {
                            const score = activeEntry.stats?.abilities?.[statKey] ?? 10;
                            const mod = Math.floor((score - 10) / 2);
                            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                            return (
                              <div
                                key={statKey}
                                className="p-2.5 bg-slate-950 border border-slate-800/80 rounded-lg"
                              >
                                <div className="text-[10px] font-bold uppercase text-slate-400">
                                  {statKey}
                                </div>
                                <div className="text-sm font-bold text-slate-100 mt-0.5">
                                  {score}
                                </div>
                                <div className="text-[11px] text-amber-400">{modStr}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SPELL STRUCTURED METADATA GRID */}
                  {activeEntry.category === 'spells' && activeEntry.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums border-b border-slate-800/80 pb-5">
                      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                        <div className="text-[11px] text-slate-400">Level &amp; School</div>
                        <div className="text-xs font-bold text-amber-400 mt-1">
                          {activeEntry.stats.level === 0
                            ? `${activeEntry.stats.school || ''} Cantrip`
                            : `Level ${activeEntry.stats.level ?? 1} ${activeEntry.stats.school || ''}`}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                        <div className="text-[11px] text-slate-400">Casting Time</div>
                        <div className="text-xs font-bold text-slate-100 mt-1">
                          {activeEntry.stats.castingTime || 'Action'}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                        <div className="text-[11px] text-slate-400">Range &amp; Area</div>
                        <div className="text-xs font-bold text-slate-100 mt-1">
                          {activeEntry.stats.range || 'Self'}
                          {activeEntry.stats.areaOfEffect ? ` (${activeEntry.stats.areaOfEffect})` : ''}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                        <div className="text-[11px] text-slate-400">Duration</div>
                        <div className="text-xs font-bold text-slate-100 mt-1">
                          {activeEntry.stats.duration || 'Instantaneous'}
                        </div>
                      </div>
                      {(activeEntry.stats.damage || activeEntry.stats.healing || activeEntry.stats.saveType || activeEntry.stats.components) && (
                        <div className="col-span-2 sm:col-span-4 flex flex-wrap items-center gap-4 px-3 py-2 bg-slate-950/60 border border-slate-800/60 rounded-lg text-xs">
                          {activeEntry.stats.components && (
                            <span>
                              <strong className="text-slate-400">Components:</strong>{' '}
                              <span className="text-slate-200">{activeEntry.stats.components}</span>
                            </span>
                          )}
                          {activeEntry.stats.damage && (
                            <span>
                              <strong className="text-slate-400">Damage:</strong>{' '}
                              <span className="text-red-400 font-semibold">
                                {activeEntry.stats.damage} {activeEntry.stats.damageType || ''}
                              </span>
                            </span>
                          )}
                          {activeEntry.stats.healing && (
                            <span>
                              <strong className="text-slate-400">Healing:</strong>{' '}
                              <span className="text-emerald-400 font-semibold">
                                {activeEntry.stats.healing}
                              </span>
                            </span>
                          )}
                          {activeEntry.stats.saveType && (
                            <span>
                              <strong className="text-slate-400">Save / Attack:</strong>{' '}
                              <span className="text-amber-300 font-semibold">
                                {activeEntry.stats.saveType}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* EQUIPMENT & MAGIC ITEM STRUCTURED METADATA GRID */}
                  {(activeEntry.category === 'equipment' ||
                    activeEntry.category === 'magic_items' ||
                    activeEntry.category === 'items') &&
                    activeEntry.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums border-b border-slate-800/80 pb-5">
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Type</div>
                          <div className="text-xs font-bold text-slate-100 mt-1">
                            {activeEntry.stats.itemType || 'Equipment'}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Rarity / Cost</div>
                          <div className="text-xs font-bold text-amber-400 mt-1">
                            {activeEntry.stats.cost || activeEntry.stats.rarity || 'Common'}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Damage / Armor Class</div>
                          <div className="text-xs font-bold text-slate-100 mt-1">
                            {activeEntry.stats.damage
                              ? `${activeEntry.stats.damage} ${activeEntry.stats.damageType || ''}`
                              : activeEntry.stats.ac
                              ? `AC ${activeEntry.stats.ac}`
                              : '—'}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                          <div className="text-[11px] text-slate-400">Mastery / Weight</div>
                          <div className="text-xs font-bold text-slate-100 mt-1">
                            {activeEntry.stats.mastery
                              ? `Mastery: ${activeEntry.stats.mastery}`
                              : activeEntry.stats.weight || (activeEntry.stats.attunement ? 'Requires Attunement' : '—')}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Full Unabridged Entry Content with Interactive Cross-Reference Links & Markdown Tables */}
                  <div className="text-sm leading-relaxed max-w-[78ch]">
                    <RichCompendiumContent
                      content={activeEntry.content || activeEntry.summary || ''}
                      activeEntry={activeEntry}
                      crossRefIndex={crossRefIndex}
                      onSelectEntry={target => handleSelectEntry(target, true)}
                    />
                  </div>

                  {/* Quick Jump Bar for Referenced Compendium Entities */}
                  {relatedEntries.length > 0 && (
                    <div className="pt-4 border-t border-slate-800/80 space-y-2">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Linked Compendium Entities in this Entry ({relatedEntries.length})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {relatedEntries.map(rel => (
                          <button
                            key={rel.id}
                            onClick={() => handleSelectEntry(rel, true)}
                            title={`${rel.name} (${getSourcebookFullName(rel.source)})`}
                            className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-amber-500/15 text-xs text-amber-400 border border-slate-800 hover:border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{rel.name}</span>
                            {rel.source && (
                              <span className="text-[10px] font-mono text-slate-500">
                                {rel.source}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Homebrew & Bookmark Tag Manager */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        <span>Entry Tags &amp; Custom Organization</span>
                      </div>
                      {onUpdateEntry && !showAddTagInput && (
                        <button
                          onClick={() => setShowAddTagInput(true)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Tag</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {activeEntry.tags.map((tag, i) => (
                        <span key={`${tag}_${i}`} className="inline-flex items-center gap-1 text-slate-300">
                          <button
                            onClick={() => setFilterTag(tag)}
                            title={`Filter Library by tag: ${tag}`}
                            className="hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                          {onUpdateEntry && (
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              title={`Remove tag ${tag}`}
                              className="text-slate-600 hover:text-red-400"
                            >
                              ×
                            </button>
                          )}
                          {i < activeEntry.tags.length - 1 && (
                            <span className="text-slate-700 ml-1" aria-hidden="true">
                              ·
                            </span>
                          )}
                        </span>
                      ))}
                    </div>

                    {showAddTagInput && (
                      <form onSubmit={handleAddCustomTag} className="flex items-center gap-2 pt-1 max-w-xs">
                        <input
                          type="text"
                          placeholder="New custom tag..."
                          value={newTagInput}
                          onChange={e => setNewTagInput(e.target.value)}
                          autoFocus
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTagInput(false);
                            setNewTagInput('');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-500 text-xs">
                Select any entity from the left index to inspect its full SRD 5.2.1 entry.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Library Modal */}
      <ImportLibraryModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportEntries={onAddBulkEntries}
      />

      {/* Homebrew Creator Modal */}
      <HomebrewModal
        isOpen={showHomebrewModal}
        onClose={() => setShowHomebrewModal(false)}
        onSaveEntry={onAddEntry}
        initialCategory={activeCategory === 'all' ? 'monsters' : activeCategory}
      />
    </div>
  );
};
