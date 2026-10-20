import React, { useMemo } from 'react';
import { LibraryEntry } from '../../types.ts';
import { buildCrossReferenceIndex } from '../../utils/importer.ts';
import { getSourcebookFullName } from '../../data/seedData.ts';
import { RichCompendiumContent } from './RichCompendiumContent.tsx';
import {
  X,
  Shield,
  Heart,
  Swords,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  Flame,
  Crosshair
} from 'lucide-react';

interface EncyclopediaEntryModalProps {
  entry: LibraryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  library?: LibraryEntry[];
  onSelectEntry?: (entry: LibraryEntry) => void;
  onSendToEncounter?: (entry: LibraryEntry) => void;
  onViewInEncyclopedia?: (entry: LibraryEntry) => void;
}

export const EncyclopediaEntryModal: React.FC<EncyclopediaEntryModalProps> = ({
  entry,
  isOpen,
  onClose,
  library = [],
  onSelectEntry,
  onSendToEncounter,
  onViewInEncyclopedia,
}) => {
  const crossRefIndex = useMemo(() => buildCrossReferenceIndex(library), [library]);
  const sourceVariants = useMemo(
    () => (entry ? crossRefIndex.getSourceVariants(entry) : []),
    [entry, crossRefIndex]
  );

  if (!isOpen || !entry) return null;

  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'monsters':
        return 'Monster & NPC';
      case 'spells':
        return 'Spell';
      case 'items':
        return 'Magic Item';
      case 'classes':
        return 'Character Class';
      case 'races':
        return 'Character Race';
      case 'actions':
        return 'Combat Action';
      case 'rules':
        return 'Core Rule';
      default:
        return cat;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 font-mono-numbers">
                {formatCategory(entry.category)}
              </span>
              {entry.source && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-300 font-mono-numbers">
                    {entry.source} ({getSourcebookFullName(entry.source)})
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-amber-400 font-fantasy mt-0.5">
              {entry.name}
            </h2>
            {sourceVariants.length > 1 && onSelectEntry && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Printings:</span>
                {sourceVariants.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectEntry(v)}
                    title={getSourcebookFullName(v.source)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                      v.id === entry.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {v.source}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {entry.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Quick Stats Grid if present */}
          {entry.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              {entry.stats.ac !== undefined && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Armor Class</div>
                    <div className="font-bold text-slate-200 font-mono-numbers">{entry.stats.ac}</div>
                  </div>
                </div>
              )}
              {entry.stats.hp !== undefined && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Hit Points</div>
                    <div className="font-bold text-slate-200 font-mono-numbers">{entry.stats.hp}</div>
                  </div>
                </div>
              )}
              {entry.stats.cr && (
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Challenge (CR)</div>
                    <div className="font-bold text-amber-400 font-mono-numbers">{entry.stats.cr}</div>
                  </div>
                </div>
              )}
              {entry.stats.speed && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Speed</div>
                    <div className="font-bold text-slate-200">{entry.stats.speed}</div>
                  </div>
                </div>
              )}
              {entry.stats.level !== undefined && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Spell Level</div>
                    <div className="font-bold text-slate-200">
                      {entry.stats.level === 0 ? 'Cantrip' : `Level ${entry.stats.level}`}
                    </div>
                  </div>
                </div>
              )}
              {entry.stats.damage && (
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Damage / Effect</div>
                    <div className="font-bold text-red-300 font-mono-numbers">
                      {entry.stats.damage} {entry.stats.damageType || ''}
                    </div>
                  </div>
                </div>
              )}
              {entry.stats.healing && (
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Healing</div>
                    <div className="font-bold text-emerald-300 font-mono-numbers">{entry.stats.healing}</div>
                  </div>
                </div>
              )}
              {entry.stats.saveType && (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Saving Throw</div>
                    <div className="font-bold text-purple-300">{entry.stats.saveType}</div>
                  </div>
                </div>
              )}
              {entry.stats.range && (
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Range / Reach</div>
                    <div className="font-bold text-slate-200">{entry.stats.range}</div>
                  </div>
                </div>
              )}
              {entry.stats.school && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">School</div>
                    <div className="font-bold text-slate-200">{entry.stats.school}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {entry.summary && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-200/90 leading-relaxed italic">
              {entry.summary}
            </div>
          )}

          {/* Full Markdown/Text Content with Interactive 5etools Links */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl font-sans text-xs leading-relaxed text-slate-300 select-text">
            <RichCompendiumContent
              content={entry.content || entry.summary || ''}
              activeEntry={entry}
              crossRefIndex={crossRefIndex}
              onSelectEntry={onSelectEntry || onViewInEncyclopedia}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60">
          <div>
            {onViewInEncyclopedia && (
              <button
                onClick={() => {
                  onViewInEncyclopedia(entry);
                  onClose();
                }}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View Full Library Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {entry.category === 'monsters' && onSendToEncounter && (
              <button
                onClick={() => {
                  onSendToEncounter(entry);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Spawn in Encounter</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
