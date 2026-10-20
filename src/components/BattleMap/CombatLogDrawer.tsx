import React, { useState } from 'react';
import { CombatLogEntry } from '../../types.ts';
import { RollMode, rollD20, rollDiceFormula } from '../../utils/combatMechanics.ts';
import { playSFX } from '../../utils/audioEngine.ts';
import {
  Dices,
  ScrollText,
  Trash2,
  X,
  Swords,
  Shield,
  Heart,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface CombatLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CombatLogEntry[];
  onClearEntries: () => void;
  onAddLogEntry: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;
  round: number;
  rollMode: RollMode;
  onChangeRollMode: (mode: RollMode) => void;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;

export const CombatLogDrawer: React.FC<CombatLogDrawerProps> = ({
  isOpen,
  onClose,
  entries,
  onClearEntries,
  onAddLogEntry,
  round,
  rollMode,
  onChangeRollMode,
}) => {
  const [diceCount, setDiceCount] = useState<number>(1);
  const [diceMod, setDiceMod] = useState<number>(0);

  if (!isOpen) return null;

  const handleQuickRoll = (sides: number) => {
    try {
      playSFX('dice');
    } catch {}

    if (sides === 20 && diceCount === 1) {
      const d20 = rollD20(rollMode);
      const total = d20.natural + diceMod;
      const modStr = diceMod > 0 ? `+${diceMod}` : diceMod < 0 ? `${diceMod}` : '';
      const modeStr =
        rollMode === 'advantage'
          ? ` (Adv [${d20.rolls.join(', ')}])`
          : rollMode === 'disadvantage'
          ? ` (Dis [${d20.rolls.join(', ')}])`
          : '';
      onAddLogEntry({
        round,
        category: 'dice',
        title: `Rolled 1d20${modStr} — Total: ${total}`,
        detail: `Natural ${d20.natural}${modeStr}${modStr ? ` ${modStr} = ${total}` : ''}${
          d20.isCrit ? ' • CRITICAL 20!' : d20.isCritMiss ? ' • NATURAL 1!' : ''
        }`,
        outcome: d20.isCrit ? 'crit' : d20.isCritMiss ? 'miss' : 'info',
      });
      return;
    }

    const formula = `${diceCount}d${sides}${diceMod > 0 ? `+${diceMod}` : diceMod < 0 ? `${diceMod}` : ''}`;
    const rolled = rollDiceFormula(formula, false);
    onAddLogEntry({
      round,
      category: 'dice',
      title: `Rolled ${formula} — Total: ${rolled.total}`,
      detail: `Breakdown: ${rolled.breakdown} = ${rolled.total}`,
      outcome: 'info',
    });
  };

  const getBadgeStyle = (entry: CombatLogEntry) => {
    switch (entry.outcome) {
      case 'crit':
        return 'bg-amber-500 text-slate-950 font-extrabold';
      case 'hit':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50';
      case 'miss':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      case 'save_pass':
        return 'bg-sky-500/20 text-sky-300 border border-sky-500/50';
      case 'save_fail':
        return 'bg-red-500/20 text-red-300 border border-red-500/50';
      default:
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
    }
  };

  const getBadgeLabel = (entry: CombatLogEntry) => {
    switch (entry.outcome) {
      case 'crit':
        return 'CRIT 20';
      case 'hit':
        return 'HIT';
      case 'miss':
        return 'MISS';
      case 'save_pass':
        return 'SAVED';
      case 'save_fail':
        return 'FAILED';
      default:
        return entry.category.toUpperCase();
    }
  };

  return (
    <div className="bg-slate-950/95 border border-slate-800/90 backdrop-blur-2xl rounded-2xl p-3 shadow-2xl w-84 sm:w-96 text-xs flex flex-col gap-3 max-h-[calc(100vh-14rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-400 font-fantasy text-sm">
            Combat Log & Dice Tray
          </span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono-numbers text-slate-400">
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <button
              onClick={onClearEntries}
              title="Clear Combat Log"
              aria-label="Clear Combat Log"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            title="Close Combat Log"
            aria-label="Close Combat Log"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Instant Dice Tray */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
            <Dices className="w-3 h-3 text-amber-400" /> Quick Dice Roller
          </span>

          {/* Advantage / Normal / Disadvantage Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(['advantage', 'normal', 'disadvantage'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => onChangeRollMode(m)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  rollMode === m
                    ? m === 'advantage'
                      ? 'bg-emerald-500 text-slate-950'
                      : m === 'disadvantage'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'advantage' ? 'ADV' : m === 'disadvantage' ? 'DIS' : 'NORM'}
              </button>
            ))}
          </div>
        </div>

        {/* Count & Modifier controls */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-mono-numbers">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Dice:</span>
            <button
              type="button"
              onClick={() => setDiceCount(c => Math.max(1, c - 1))}
              className="px-1 text-slate-300 hover:text-amber-400"
            >
              -
            </button>
            <span className="font-bold text-amber-300">{diceCount}</span>
            <button
              type="button"
              onClick={() => setDiceCount(c => Math.min(12, c + 1))}
              className="px-1 text-slate-300 hover:text-amber-400"
            >
              +
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Mod:</span>
            <button
              type="button"
              onClick={() => setDiceMod(m => m - 1)}
              className="px-1 text-slate-300 hover:text-amber-400"
            >
              -
            </button>
            <span className="font-bold text-sky-300">
              {diceMod >= 0 ? `+${diceMod}` : diceMod}
            </span>
            <button
              type="button"
              onClick={() => setDiceMod(m => m + 1)}
              className="px-1 text-slate-300 hover:text-amber-400"
            >
              +
            </button>
          </div>
        </div>

        {/* Die Buttons (d4 .. d100) */}
        <div className="grid grid-cols-7 gap-1 font-mono-numbers">
          {DICE_TYPES.map(sides => (
            <button
              key={sides}
              type="button"
              onClick={() => handleQuickRoll(sides)}
              className="py-1.5 rounded-lg bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-800 hover:border-amber-400 font-bold text-[11px] transition-colors shadow-sm"
            >
              d{sides}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Combat Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-72">
        {entries.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            No rolls or combat actions recorded yet. Attack a target, cast a spell, or roll a die above!
          </div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2 space-y-1"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider ${getBadgeStyle(entry)}`}>
                  {getBadgeLabel(entry)}
                </span>
                <span className="text-[9px] font-mono-numbers text-slate-500">
                  R{entry.round} • {entry.timestamp}
                </span>
              </div>
              <div className="font-semibold text-slate-100 leading-snug">{entry.title}</div>
              {entry.detail && (
                <div className="text-[11px] text-slate-400 font-mono-numbers leading-snug">
                  {entry.detail}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
