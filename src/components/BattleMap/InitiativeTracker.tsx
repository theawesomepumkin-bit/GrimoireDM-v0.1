import React, { useState } from 'react';
import { Combatant, PartyMember, LibraryEntry } from '../../types.ts';
import {
  Shield,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  Info,
  FileText
} from 'lucide-react';

interface InitiativeTrackerProps {
  combatants: Combatant[];
  round: number;
  turnIndex: number;
  onUpdateRound: (round: number) => void;
  onUpdateTurnIndex: (turnIndex: number) => void;
  onUpdateCombatants: (combatants: Combatant[]) => void;
  onSelectCombatantToken?: (tokenId: string) => void;
  party?: PartyMember[];
  library?: LibraryEntry[];
  onOpenCharacterSheet?: (member: PartyMember) => void;
  onOpenEncyclopediaEntry?: (entry: LibraryEntry) => void;
}

const COMMON_CONDITIONS = [
  'Blinded',
  'Charmed',
  'Concentrating',
  'Frightened',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious'
];

export const InitiativeTracker: React.FC<InitiativeTrackerProps> = ({
  combatants,
  round,
  turnIndex,
  onUpdateRound,
  onUpdateTurnIndex,
  onUpdateCombatants,
  onSelectCombatantToken,
  party = [],
  library = [],
  onOpenCharacterSheet,
  onOpenEncyclopediaEntry,
}) => {
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);

  const handleNextTurn = () => {
    if (combatants.length === 0) return;
    const nextTurn = turnIndex + 1;
    if (nextTurn >= combatants.length) {
      onUpdateTurnIndex(0);
      onUpdateRound(round + 1);
    } else {
      onUpdateTurnIndex(nextTurn);
    }
  };

  const handlePrevTurn = () => {
    if (combatants.length === 0) return;
    if (turnIndex === 0) {
      if (round > 1) {
        onUpdateRound(round - 1);
        onUpdateTurnIndex(combatants.length - 1);
      }
    } else {
      onUpdateTurnIndex(turnIndex - 1);
    }
  };

  const handleSortInitiative = () => {
    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
    onUpdateCombatants(sorted);
    onUpdateTurnIndex(0);
  };

  const handleAdjustHp = (id: string, delta: number) => {
    const updated = combatants.map(c => {
      if (c.id === id) {
        const nextHp = Math.max(0, Math.min(c.maxHp, c.hp + delta));
        return { ...c, hp: nextHp };
      }
      return c;
    });
    onUpdateCombatants(updated);
  };

  const handleUpdateInitiativeValue = (id: string, val: number) => {
    const updated = combatants.map(c => {
      if (c.id === id) {
        return { ...c, initiative: val };
      }
      return c;
    });
    onUpdateCombatants(updated);
  };

  const handleToggleCondition = (combatantId: string, cond: string) => {
    const updated = combatants.map(c => {
      if (c.id === combatantId) {
        const hasCond = c.conditions.includes(cond);
        const nextConds = hasCond
          ? c.conditions.filter(x => x !== cond)
          : [...c.conditions, cond];
        return { ...c, conditions: nextConds };
      }
      return c;
    });
    onUpdateCombatants(updated);
  };

  const handleDeleteCombatant = (id: string) => {
    const updated = combatants.filter(c => c.id !== id);
    onUpdateCombatants(updated);
    if (turnIndex >= updated.length) {
      onUpdateTurnIndex(Math.max(0, updated.length - 1));
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
      {/* Initiative Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 font-fantasy">
            Live Initiative Tracker
          </h3>
          <div className="text-sm font-bold font-mono-numbers text-slate-200 mt-0.5">
            Round {round} · Turn {(combatants.length > 0 ? turnIndex + 1 : 0)} of {combatants.length}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSortInitiative}
            title="Sort by Initiative High to Low"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Sort</span>
          </button>
          <button
            onClick={handlePrevTurn}
            title="Previous Turn"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextTurn}
            title="Next Turn"
            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Combatant Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[300px] max-h-[520px]">
        {combatants.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No active combatants. Send monsters from the Encyclopedia or click "+ Add Token" on the battle map.
          </div>
        ) : (
          combatants.map((combatant, idx) => {
            const isCurrent = idx === turnIndex;
            const hpPercent = Math.round((combatant.hp / combatant.maxHp) * 100);

            return (
              <div
                key={combatant.id}
                className={`p-3 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10'
                    : 'border-slate-800/80 bg-slate-950/70 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: combatant.color || (combatant.isPlayer ? '#3b82f6' : '#ef4444') }}
                    />
                    <button
                      onClick={() => combatant.tokenId && onSelectCombatantToken?.(combatant.tokenId)}
                      className="text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors text-left"
                    >
                      {combatant.name}
                    </button>

                    {/* Clickable More Info Button for Character Sheet or Compendium */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (combatant.isPlayer) {
                          const matched = party.find(p => p.name.toLowerCase() === combatant.name.toLowerCase());
                          if (matched && onOpenCharacterSheet) {
                            onOpenCharacterSheet(matched);
                          } else if (onOpenCharacterSheet) {
                            onOpenCharacterSheet({
                              id: combatant.id,
                              name: combatant.name,
                              characterClass: 'Adventurer',
                              level: 1,
                              hp: combatant.hp,
                              maxHp: combatant.maxHp,
                              ac: combatant.ac,
                              passivePerception: 10,
                              passiveInsight: 10,
                              color: combatant.color || '#3b82f6',
                            });
                          }
                        } else {
                          const matched = library.find(entry => entry.name.toLowerCase() === combatant.name.toLowerCase() || combatant.name.toLowerCase().startsWith(entry.name.toLowerCase()));
                          if (matched && onOpenEncyclopediaEntry) {
                            onOpenEncyclopediaEntry(matched);
                          } else if (onOpenEncyclopediaEntry) {
                            onOpenEncyclopediaEntry({
                              id: `entry_${combatant.id}`,
                              name: combatant.name,
                              category: 'monsters',
                              source: 'Active Encounter',
                              tags: ['Combatant', 'Monster'],
                              content: `### ${combatant.name}\n\n- **Armor Class:** ${combatant.ac}\n- **Hit Points:** ${combatant.hp}/${combatant.maxHp}\n- **Initiative:** ${combatant.initiative}\n- **Conditions:** ${combatant.conditions.join(', ') || 'None'}`,
                              stats: { hp: combatant.hp, ac: combatant.ac },
                              pinned: false,
                            });
                          }
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title={combatant.isPlayer ? "More Info: View Character Sheet" : "More Info: View Compendium Page"}
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Initiative input + AC */}
                  <div className="flex items-center gap-2 text-xs font-mono-numbers">
                    <div className="flex items-center gap-1 text-slate-400" title="Armor Class">
                      <Shield className="w-3 h-3 text-blue-400" />
                      <span>{combatant.ac}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
                      <span className="text-[10px] text-slate-500 uppercase">Init:</span>
                      <input
                        type="number"
                        value={combatant.initiative}
                        onChange={e => handleUpdateInitiativeValue(combatant.id, parseInt(e.target.value, 10) || 0)}
                        className="w-8 bg-transparent text-center font-bold text-amber-400 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteCombatant(combatant.id)}
                      title="Remove from initiative"
                      className="text-slate-600 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* HP & Quick Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[11px] font-mono-numbers mb-0.5">
                      <span className="text-slate-500">HP</span>
                      <span className="font-semibold text-slate-300">
                        {combatant.hp} / {combatant.maxHp}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-150 ${
                          hpPercent > 50
                            ? 'bg-emerald-500'
                            : hpPercent > 20
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, hpPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => handleAdjustHp(combatant.id, -5)}
                      className="px-1.5 py-0.5 text-[10px] font-mono-numbers rounded bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 border border-slate-700/60"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleAdjustHp(combatant.id, -1)}
                      className="p-1 rounded bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 border border-slate-700/60"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleAdjustHp(combatant.id, 1)}
                      className="p-1 rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-400 border border-slate-700/60"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleAdjustHp(combatant.id, 5)}
                      className="px-1.5 py-0.5 text-[10px] font-mono-numbers rounded bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-400 border border-slate-700/60"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Condition tags and add button */}
                <div className="flex flex-wrap items-center gap-1 mt-2">
                  {combatant.conditions.map(cond => (
                    <span
                      key={cond}
                      onClick={() => handleToggleCondition(combatant.id, cond)}
                      className="text-[10px] bg-red-950/60 border border-red-800/60 text-red-300 px-1.5 py-0.5 rounded cursor-pointer hover:bg-red-900/60"
                      title="Click to remove condition"
                    >
                      {cond} ×
                    </span>
                  ))}
                  <button
                    onClick={() => setEditingConditionId(editingConditionId === combatant.id ? null : combatant.id)}
                    className="text-[10px] text-slate-500 hover:text-amber-400 px-1 py-0.5 rounded border border-dashed border-slate-800 hover:border-amber-500/50"
                  >
                    + Condition
                  </button>
                </div>

                {/* Condition picker dropdown */}
                {editingConditionId === combatant.id && (
                  <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-lg grid grid-cols-2 gap-1 text-[10px]">
                    {COMMON_CONDITIONS.map(c => {
                      const active = combatant.conditions.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => handleToggleCondition(combatant.id, c)}
                          className={`px-1.5 py-1 rounded text-left transition-colors ${
                            active
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
