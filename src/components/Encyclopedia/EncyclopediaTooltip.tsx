import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { LibraryEntry, Category } from '../../types.ts';
import { stripWikiLinks } from '../../utils/importer.ts';
import { getSourcebookFullName } from '../../data/seedData.ts';
import {
  Flame,
  Heart,
  Shield,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Info,
  X,
  Pin
} from 'lucide-react';

// ============================================================================
// GLOBAL SINGLETON TOOLTIP BUS
// Ensures only ONE tooltip is ever open on screen at a time, eliminating
// accidental multi-tooltip crowding when moving the cursor across spells/items.
// ============================================================================
type TooltipListener = (activeId: string | null, pinnedId: string | null) => void;
let currentActiveTooltipId: string | null = null;
let currentPinnedTooltipId: string | null = null;
const tooltipListeners = new Set<TooltipListener>();

function notifyTooltipListeners() {
  for (const listener of tooltipListeners) {
    listener(currentActiveTooltipId, currentPinnedTooltipId);
  }
}

function requestOpenTooltip(id: string, pin = false) {
  if (pin) {
    currentPinnedTooltipId = id;
    currentActiveTooltipId = id;
  } else {
    // If another tooltip is currently pinned, don't override it on mere hover;
    // OR replace any unpinned tooltip immediately so only 1 is open at a time.
    if (currentPinnedTooltipId && currentPinnedTooltipId !== id) {
      return;
    }
    currentActiveTooltipId = id;
  }
  notifyTooltipListeners();
}

function requestPinToggleTooltip(id: string) {
  if (currentPinnedTooltipId === id) {
    currentPinnedTooltipId = null;
  } else {
    currentPinnedTooltipId = id;
    currentActiveTooltipId = id;
  }
  notifyTooltipListeners();
}

function requestCloseTooltip(id: string, forceUnpin = false) {
  if (currentPinnedTooltipId === id && !forceUnpin) {
    return;
  }
  if (currentPinnedTooltipId === id && forceUnpin) {
    currentPinnedTooltipId = null;
  }
  if (currentActiveTooltipId === id) {
    currentActiveTooltipId = null;
  }
  notifyTooltipListeners();
}

interface EncyclopediaTooltipProps {
  entry?: LibraryEntry | null;
  entryId?: string;
  entryName?: string;
  category?: Category;
  library?: LibraryEntry[];
  fallbackStats?: {
    damage?: string;
    damageType?: string;
    healing?: string;
    saveType?: string;
    range?: string;
    actionType?: string;
    level?: number;
    school?: string;
    desc?: string;
  };
  children?: React.ReactNode;
  onOpenFullEntry?: (entry: LibraryEntry) => void;
  className?: string;
  showIcon?: boolean;
}

function normalizeLookupName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const COMMON_NAME_ALIASES: Record<string, string> = {
  'healing potion': 'potion of healing',
  'handaxes': 'handaxe',
  'thieves tools': "thieves' tools",
  'scholar pack': "scholar's pack",
  'chain mail & shield': 'chain mail',
  'arcane focus (crystal wand)': 'arcane focus',
  'holy symbol (sun amulet)': 'holy symbol',
  'evocation': 'evoker (school of evocation)',
};

export const EncyclopediaTooltip: React.FC<EncyclopediaTooltipProps> = ({
  entry: initialEntry,
  entryId,
  entryName,
  category,
  library = [],
  fallbackStats,
  children,
  onOpenFullEntry,
  className = '',
  showIcon = false,
}) => {
  const instanceId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    placeAbove: true,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeGraceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to global singleton tooltip state
  useEffect(() => {
    const listener: TooltipListener = (activeId, pinnedId) => {
      setIsOpen(activeId === instanceId);
      setIsPinned(pinnedId === instanceId);
    };
    tooltipListeners.add(listener);
    return () => {
      tooltipListeners.delete(listener);
      if (currentActiveTooltipId === instanceId) {
        currentActiveTooltipId = null;
      }
      if (currentPinnedTooltipId === instanceId) {
        currentPinnedTooltipId = null;
      }
    };
  }, [instanceId]);

  // Resolve matching library entry with category prioritization and alias normalization
  const resolvedEntry = React.useMemo<LibraryEntry | null>(() => {
    if (initialEntry) return initialEntry;
    if (entryId) {
      const found = library.find(e => e.id === entryId);
      if (found) return found;
    }
    if (entryName) {
      const rawLower = entryName.toLowerCase().trim();
      const aliased = COMMON_NAME_ALIASES[rawLower] || rawLower;
      const targetNorm = normalizeLookupName(aliased);
      const strippedParens = normalizeLookupName(aliased.replace(/\([^)]*\)/g, '').trim());
      const singularNorm = targetNorm.endsWith('s') ? targetNorm.slice(0, -1) : targetNorm;

      const matchesCategory = (e: LibraryEntry) => {
        if (!category || category === 'all') return true;
        if (category === 'items') {
          return e.category === 'equipment' || e.category === 'magic_items' || e.category === 'items';
        }
        return e.category === category;
      };

      // 1. Exact match within requested category
      if (category) {
        const catExact = library.find(
          e =>
            matchesCategory(e) &&
            (normalizeLookupName(e.name) === targetNorm ||
              normalizeLookupName(e.name) === strippedParens ||
              normalizeLookupName(e.name) === singularNorm)
        );
        if (catExact) return catExact;
      }

      // 2. Exact match across any category
      const anyExact = library.find(
        e =>
          normalizeLookupName(e.name) === targetNorm ||
          normalizeLookupName(e.name) === strippedParens ||
          normalizeLookupName(e.name) === singularNorm
      );
      if (anyExact) return anyExact;

      // 3. Prefix/substring match within requested category
      if (category) {
        const catStarts = library.find(
          e =>
            matchesCategory(e) &&
            (normalizeLookupName(e.name).startsWith(targetNorm) ||
              (strippedParens.length >= 3 && normalizeLookupName(e.name).startsWith(strippedParens)))
        );
        if (catStarts) return catStarts;
      }

      // 4. Prefix match across any category
      const anyStarts = library.find(
        e =>
          normalizeLookupName(e.name).startsWith(targetNorm) ||
          (strippedParens.length >= 4 && normalizeLookupName(e.name).includes(strippedParens))
      );
      if (anyStarts) return anyStarts;
    }
    return null;
  }, [initialEntry, entryId, entryName, category, library]);

  const displayEntry: LibraryEntry = resolvedEntry || {
    id: entryId || `synth_${(entryName || 'entry').toLowerCase().replace(/\s+/g, '_')}`,
    name: entryName || initialEntry?.name || 'Rules Reference',
    category: category || 'rules',
    tags: [fallbackStats?.actionType || 'Reference'].filter(Boolean),
    content: fallbackStats?.desc || 'Core 5th Edition SRD 5.2.1 rules reference.',
    summary: fallbackStats?.desc || 'Core 5th Edition SRD 5.2.1 rules reference.',
    stats: {
      damage: fallbackStats?.damage,
      damageType: fallbackStats?.damageType,
      healing: fallbackStats?.healing,
      saveType: fallbackStats?.saveType,
      range: fallbackStats?.range,
      actionType: (fallbackStats?.actionType as any) || undefined,
      level: fallbackStats?.level,
      school: fallbackStats?.school,
    },
    source: 'SRD 5.2.1',
  };

  const stats = displayEntry.stats || {};
  const damage = stats.damage || fallbackStats?.damage;
  const damageType = stats.damageType || fallbackStats?.damageType;
  const healing = stats.healing || fallbackStats?.healing;
  const saveType = stats.saveType || fallbackStats?.saveType;
  const range = stats.range || fallbackStats?.range;
  const actionType =
    stats.actionType ||
    fallbackStats?.actionType ||
    displayEntry.tags.find(t => t.includes('Action') || t === 'Reaction');

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeightEstimate = 250;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(12, Math.min(window.innerWidth - tooltipWidth - 12, left));

    let top = rect.top - 8;
    let placeAbove = true;

    if (rect.top < tooltipHeightEstimate + 20) {
      top = rect.bottom + 8;
      placeAbove = false;
    }

    setCoords({ top, left, placeAbove });
  }, []);

  const clearTimers = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
    if (closeGraceTimerRef.current) {
      clearTimeout(closeGraceTimerRef.current);
      closeGraceTimerRef.current = null;
    }
  }, []);

  const handleMouseEnter = () => {
    clearTimers();
    // If another tooltip is pinned, do not steal focus on hover
    if (currentPinnedTooltipId && currentPinnedTooltipId !== instanceId) {
      return;
    }
    hoverIntentTimerRef.current = setTimeout(() => {
      updatePosition();
      requestOpenTooltip(instanceId, false);
    }, 160);
  };

  const handleMouseLeave = () => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
    if (!isPinned) {
      closeGraceTimerRef.current = setTimeout(() => {
        requestCloseTooltip(instanceId, false);
      }, 180);
    }
  };

  // Keyboard shortcut 'p' to pin/unpin while open, Escape to close, or outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        requestCloseTooltip(instanceId, true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        requestCloseTooltip(instanceId, true);
      } else if (
        (e.key === 'p' || e.key === 'P') &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)
      ) {
        e.preventDefault();
        requestPinToggleTooltip(instanceId);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, instanceId, updatePosition]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleOpenFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    requestCloseTooltip(instanceId, true);
    if (onOpenFullEntry) {
      onOpenFullEntry(displayEntry);
    }
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    requestPinToggleTooltip(instanceId);
  };

  const handleCloseManual = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimers();
    requestCloseTooltip(instanceId, true);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Area: Hover previews, Click pins or opens */}
      <span
        onClick={e => {
          e.stopPropagation();
          clearTimers();
          updatePosition();
          if (isOpen && isPinned) {
            requestCloseTooltip(instanceId, true);
          } else {
            requestOpenTooltip(instanceId, true);
          }
        }}
        className="inline-flex items-center gap-1 cursor-pointer hover:text-amber-400 transition-colors select-none w-full"
      >
        {children}
        {showIcon && (
          <Info className="w-3 h-3 text-slate-400 hover:text-amber-400 transition-colors inline-block shrink-0" />
        )}
      </span>

      {/* Singleton Floating Tooltip rendered via Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={tooltipRef}
            onClick={e => e.stopPropagation()}
            onMouseEnter={() => {
              if (closeGraceTimerRef.current) {
                clearTimeout(closeGraceTimerRef.current);
                closeGraceTimerRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
            style={{
              position: 'fixed',
              left: `${coords.left}px`,
              top: coords.placeAbove ? 'auto' : `${coords.top}px`,
              bottom: coords.placeAbove ? `${window.innerHeight - coords.top}px` : 'auto',
              zIndex: 99999,
              width: '320px',
            }}
            className={`bg-slate-950/95 border rounded-xl p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-left cursor-default text-xs ring-1 ring-black/70 pointer-events-auto ${
              isPinned ? 'border-amber-400/80' : 'border-slate-700/90'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400">
                  <span className="font-semibold text-amber-400 uppercase tracking-wider font-mono-numbers">
                    {displayEntry.category === 'spells'
                      ? stats.level !== undefined
                        ? stats.level === 0
                          ? 'Cantrip'
                          : `Level ${stats.level} ${stats.school || 'Spell'}`
                        : 'Spell'
                      : displayEntry.category.replace('_', ' ')}
                  </span>
                  {actionType && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-300 font-medium">{actionType}</span>
                    </>
                  )}
                  {displayEntry.source && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 font-mono" title={getSourcebookFullName(displayEntry.source)}>
                        {displayEntry.source}
                      </span>
                    </>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-100 font-fantasy mt-0.5 truncate">
                  {displayEntry.name}
                </h4>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleTogglePin}
                  title={isPinned ? 'Unpin tooltip (P)' : 'Pin tooltip (Click or press P)'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPinned
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                {onOpenFullEntry && (
                  <button
                    onClick={handleOpenFull}
                    title="Open full entry in Library"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleCloseManual}
                  title="Close tooltip (Esc)"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Combat stats metadata row */}
            {(damage || healing || saveType || range || stats.areaOfEffect) && (
              <div className="flex flex-wrap items-center gap-2 mb-2 text-[11px] font-mono-numbers text-slate-300">
                {damage && (
                  <span className="text-red-300 font-semibold inline-flex items-center gap-1">
                    <Flame className="w-3 h-3 text-red-400" />
                    {damage} {damageType || ''}
                  </span>
                )}
                {healing && (
                  <span className="text-emerald-300 font-semibold inline-flex items-center gap-1">
                    <Heart className="w-3 h-3 text-emerald-400" />
                    {healing} Heal
                  </span>
                )}
                {saveType && (
                  <span className="text-purple-300 font-semibold inline-flex items-center gap-1">
                    <Shield className="w-3 h-3 text-purple-400" />
                    {saveType}
                  </span>
                )}
                {range && <span className="text-slate-400">Range: {range}</span>}
                {stats.areaOfEffect && <span className="text-amber-300">{stats.areaOfEffect}</span>}
              </div>
            )}

            {/* Description */}
            <p className="text-[11px] text-slate-300 line-clamp-4 leading-relaxed mb-2.5">
              {stripWikiLinks(
                displayEntry.content && displayEntry.content !== displayEntry.summary
                  ? displayEntry.content.replace(displayEntry.summary || '', '').trim().slice(0, 260)
                  : displayEntry.summary || 'Details available in Library.'
              )}
            </p>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {onOpenFullEntry ? (
                <button
                  onClick={handleOpenFull}
                  className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-amber-500/15 text-amber-400 border border-slate-800 hover:border-amber-500/40 flex items-center gap-1.5 font-semibold text-[11px] transition-colors"
                >
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  <span>Open in Library</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              ) : (
                <span className="text-[10px] text-slate-500">{displayEntry.source || 'SRD 5.2.1'}</span>
              )}

              <button
                onClick={handleTogglePin}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                  isPinned
                    ? 'text-amber-300 bg-amber-500/15 border border-amber-500/30 font-semibold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Pin className="w-2.5 h-2.5" />
                <span>{isPinned ? 'Pinned (Click to unpin)' : 'Click or press P to pin'}</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
