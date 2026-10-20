import React from 'react';
import { LibraryEntry } from '../../types.ts';
import { stripWikiLinks } from '../../utils/importer.ts';
import { getSourcebookFullName } from '../../data/seedData.ts';
import {
  X,
  Shield,
  Heart,
  Footprints,
  Plus
} from 'lucide-react';

interface MonsterDetailModalProps {
  entry: LibraryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSendToEncounter?: (entry: LibraryEntry) => void;
}

export const MonsterDetailModal: React.FC<MonsterDetailModalProps> = ({
  entry,
  isOpen,
  onClose,
  onSendToEncounter,
}) => {
  if (!isOpen || !entry) return null;

  const stats = entry.stats || {};
  const abilities = stats.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  const getMod = (val: number) => {
    const m = Math.floor((val - 10) / 2);
    return m >= 0 ? `+${m}` : `${m}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950/90 border-b border-slate-800 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-amber-400 font-fantasy tracking-wide">
                {entry.name}
              </h2>
              {stats.cr !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 text-red-400 border border-red-800/60 font-mono-numbers">
                  CR {stats.cr}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 italic mt-0.5">
              {stats.size || 'Medium'} {stats.type || 'creature'}, {stats.alignment || 'unaligned'}
              {entry.source ? ` • ${entry.source} (${getSourcebookFullName(entry.source)})` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onSendToEncounter && (
              <button
                onClick={() => {
                  onSendToEncounter(entry);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Spawn to Map</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Vitals row */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/50 border-b border-slate-800 text-center font-mono-numbers">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" /> Armor Class
            </span>
            <span className="text-base font-bold text-blue-400 mt-0.5 block">
              {stats.ac ?? 12}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3 text-red-400" /> Hit Points
            </span>
            <span className="text-base font-bold text-red-400 mt-0.5 block">
              {stats.hp ?? 15}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
              <Footprints className="w-3 h-3 text-emerald-400" /> Speed
            </span>
            <span className="text-base font-bold text-emerald-400 mt-0.5 block">
              {stats.speed || '30 ft.'}
            </span>
          </div>
        </div>

        {/* Ability Scores */}
        <div className="grid grid-cols-6 gap-1.5 p-3 bg-slate-950/70 border-b border-slate-800 text-center">
          {[
            { label: 'STR', val: abilities.str },
            { label: 'DEX', val: abilities.dex },
            { label: 'CON', val: abilities.con },
            { label: 'INT', val: abilities.int },
            { label: 'WIS', val: abilities.wis },
            { label: 'CHA', val: abilities.cha },
          ].map(ab => (
            <div key={ab.label} className="bg-slate-900 border border-slate-800 rounded-lg p-1.5">
              <span className="text-[10px] text-slate-400 font-bold block">{ab.label}</span>
              <span className="text-xs font-bold font-mono-numbers text-amber-300 block">{ab.val}</span>
              <span className="text-[10px] font-mono-numbers text-slate-500 block">{getMod(ab.val)}</span>
            </div>
          ))}
        </div>

        {/* Body / Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Traits */}
          {stats.traits && stats.traits.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-fantasy">
                Special Traits
              </h3>
              {stats.traits.map((trait, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-xs font-bold text-amber-300">{trait.name}. </span>
                  <span className="text-xs text-slate-300 leading-relaxed">{stripWikiLinks(trait.desc)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {stats.actions && stats.actions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 font-fantasy">
                Actions
              </h3>
              {stats.actions.map((action, idx) => (
                <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                  <span className="text-xs font-bold text-red-300">{action.name}. </span>
                  <span className="text-xs text-slate-300 leading-relaxed">{stripWikiLinks(action.desc)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Full content if neither traits nor actions parsed */}
          {(!stats.traits || stats.traits.length === 0) && (!stats.actions || stats.actions.length === 0) && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {stripWikiLinks(entry.content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
