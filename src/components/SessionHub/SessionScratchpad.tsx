import React, { useState } from 'react';
import { PartyMember, LibraryEntry } from '../../types.ts';
import { CharacterSheetModal } from './CharacterSheetModal.tsx';
import { CharacterBuilderModal } from './CharacterBuilderModal.tsx';
import { EncyclopediaTooltip } from '../Encyclopedia/EncyclopediaTooltip.tsx';
import { performShortRest, performLongRest } from '../../utils/combatMechanics.ts';
import {
  FileText,
  Users,
  Shield,
  Eye,
  Brain,
  Plus,
  Minus,
  RotateCcw,
  ChevronRight,
  UserPlus,
  Sun,
  Moon
} from 'lucide-react';

interface SessionScratchpadProps {
  notes: string;
  onUpdateNotes: (notes: string) => void;
  party: PartyMember[];
  onUpdateParty: (party: PartyMember[]) => void;
  round: number;
  onUpdateRound: (round: number) => void;
  turnIndex: number;
  onUpdateTurnIndex: (turnIndex: number) => void;
  library?: LibraryEntry[];
  onOpenEncyclopediaEntry?: (entry: LibraryEntry) => void;
  onViewInEncyclopedia?: (entry: LibraryEntry) => void;
}

export const SessionScratchpad: React.FC<SessionScratchpadProps> = ({
  notes,
  onUpdateNotes,
  party,
  onUpdateParty,
  round,
  onUpdateRound,
  turnIndex,
  onUpdateTurnIndex,
  library = [],
  onOpenEncyclopediaEntry,
  onViewInEncyclopedia,
}) => {
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [selectedSheetMember, setSelectedSheetMember] = useState<PartyMember | null>(null);
  const [restBanner, setRestBanner] = useState<string | null>(null);

  const triggerRestBanner = (msg: string) => {
    setRestBanner(msg);
    setTimeout(() => {
      setRestBanner(curr => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleAdjustHp = (memberId: string, amount: number) => {
    const updated = party.map(m => {
      if (m.id === memberId) {
        const nextHp = Math.max(0, Math.min(m.maxHp, m.hp + amount));
        return { ...m, hp: nextHp };
      }
      return m;
    });
    onUpdateParty(updated);
  };

  const handlePartyShortRest = () => {
    let totalHealed = 0;
    const nextParty = party.map(member => {
      const res = performShortRest(member, 1);
      totalHealed += res.healedHp;
      return res.updatedMember;
    });
    onUpdateParty(nextParty);
    triggerRestBanner(`Party Short Rest complete! Spent 1 Hit Die per adventurer (+${totalHealed} total HP healed).`);
  };

  const handlePartyLongRest = () => {
    const nextParty = party.map(member => performLongRest(member).updatedMember);
    onUpdateParty(nextParty);
    triggerRestBanner('Party Long Rest complete! Full HP, all Spell Slots, and Hit Dice restored for all members.');
  };

  const handleNextTurn = () => {
    if (party.length === 0) {
      onUpdateRound(round + 1);
      return;
    }
    const nextTurn = turnIndex + 1;
    if (nextTurn >= party.length) {
      onUpdateTurnIndex(0);
      onUpdateRound(round + 1);
    } else {
      onUpdateTurnIndex(nextTurn);
    }
  };

  const handleResetCombat = () => {
    onUpdateRound(1);
    onUpdateTurnIndex(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Party Vitals & Round Tracker (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {/* Turn & Round Tracker Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Encounter Round
              </span>
              <div className="text-xl font-bold font-mono-numbers text-amber-400">
                Round {round}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Current Actor
              </span>
              <div className="text-sm font-semibold text-slate-200">
                {party[turnIndex]?.name || 'Turn 1'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetCombat}
              title="Reset Round Counter"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs flex items-center gap-1 border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleNextTurn}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1 shadow-sm transition-colors"
            >
              <span>Next Turn</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Party Passive Stat Tracker */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500 font-fantasy">
                Active Party Vitals & Passives
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handlePartyShortRest}
                title="Party Short Rest: Roll 1 Hit Die per member to heal & refresh short-rest abilities"
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Short Rest</span>
              </button>
              <button
                onClick={handlePartyLongRest}
                title="Party Long Rest: Restore full HP, all Spell Slots, and Hit Dice"
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Long Rest</span>
              </button>
              <button
                onClick={() => setShowAddPartyModal(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                <span>Character Builder</span>
              </button>
            </div>
          </div>

          {restBanner && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              {restBanner}
            </div>
          )}

          <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1">
            {party.map((member, idx) => {
              const isCurrentTurn = idx === turnIndex;
              const hpPercent = Math.round((member.hp / Math.max(1, member.maxHp)) * 100);
              return (
                <div
                  key={member.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrentTurn
                      ? 'border-amber-500/70 bg-amber-500/10'
                      : 'border-slate-800/80 bg-slate-950/70 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: member.color }}
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-200">
                          {member.name}
                        </span>
                        <EncyclopediaTooltip
                          entryName={member.characterClass.split('(')[0].trim()}
                          category="classes"
                          library={library}
                          onOpenFullEntry={onOpenEncyclopediaEntry}
                          className="ml-2"
                        >
                          <span className="text-xs text-amber-500/90 hover:text-amber-400 cursor-pointer font-medium underline decoration-dotted decoration-amber-500/40" title="Click or hover for class details">
                            {member.characterClass}
                          </span>
                        </EncyclopediaTooltip>
                      </div>
                    </div>

                    {/* Passive stats badges & Character Sheet More Info Button */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono-numbers">
                      <button
                        onClick={() => setSelectedSheetMember(member)}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-sans text-[11px] font-semibold transition-colors shadow-sm"
                        title="View & Edit Character Sheet"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Sheet</span>
                      </button>
                      <div className="flex items-center gap-1" title="Armor Class">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span>{member.ac}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Passive Perception">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>{member.passivePerception}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Passive Insight">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>{member.passiveInsight}</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Bar & Quick +/- Buttons */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-mono-numbers">
                        <span className="text-slate-400">Hit Points</span>
                        <span className="font-semibold text-slate-200">
                          {member.hp} / {member.maxHp}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
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

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleAdjustHp(member.id, -5)}
                        title="-5 HP"
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 text-xs font-mono-numbers border border-slate-700/60"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleAdjustHp(member.id, -1)}
                        title="-1 HP"
                        className="p-1 rounded bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 border border-slate-700/60"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjustHp(member.id, 1)}
                        title="+1 HP"
                        className="p-1 rounded bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-300 text-slate-400 border border-slate-700/60"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjustHp(member.id, 5)}
                        title="+5 HP"
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-900/50 hover:text-emerald-300 text-slate-400 text-xs font-mono-numbers border border-slate-700/60"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Floating DM Quick-Notes Scratchpad (5 cols) */}
      <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col h-full min-h-[420px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500 font-fantasy">
              DM Session Scratchpad
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono-numbers">
            Auto-saved locally
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-2">
          Jot down initiative notes, combat events, secret passive perception cues, or loot.
        </p>

        <textarea
          value={notes}
          onChange={e => onUpdateNotes(e.target.value)}
          placeholder="Session scratchpad notes..."
          className="flex-1 w-full bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/80 resize-none font-sans leading-relaxed select-text shadow-inner"
        />
      </div>

      {/* SRD 5.2.1 Character Builder Wizard Modal */}
      <CharacterBuilderModal
        isOpen={showAddPartyModal}
        onClose={() => setShowAddPartyModal(false)}
        library={library}
        onCreateCharacter={newMember => {
          onUpdateParty([...party, newMember]);
          triggerRestBanner(`Created ${newMember.name} (Lvl ${newMember.level} ${newMember.race} ${newMember.characterClass})!`);
        }}
      />

      {/* Full Party Member Character Sheet Modal */}
      <CharacterSheetModal
        member={selectedSheetMember}
        isOpen={Boolean(selectedSheetMember)}
        onClose={() => setSelectedSheetMember(null)}
        onUpdateMember={updated => {
          onUpdateParty(party.map(p => (p.id === updated.id ? updated : p)));
          setSelectedSheetMember(updated);
        }}
        library={library}
        onOpenEncyclopediaEntry={onOpenEncyclopediaEntry}
        onViewInEncyclopedia={onViewInEncyclopedia}
      />
    </div>
  );
};
