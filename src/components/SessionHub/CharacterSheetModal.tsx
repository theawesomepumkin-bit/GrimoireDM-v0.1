import React, { useState } from 'react';
import { PartyMember, AbilityScores } from '../../types.ts';
import { performShortRest, performLongRest } from '../../utils/combatMechanics.ts';
import {
  X,
  Shield,
  Heart,
  Zap,
  Eye,
  Brain,
  Sparkles,
  Swords,
  Scroll,
  Backpack,
  Edit3,
  Check,
  Footprints,
  Flame,
  Award,
  Moon,
  Sun
} from 'lucide-react';

import { EncyclopediaTooltip } from '../Encyclopedia/EncyclopediaTooltip.tsx';
import { LibraryEntry } from '../../types.ts';

interface CharacterSheetModalProps {
  member: PartyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMember?: (updated: PartyMember) => void;
  library?: LibraryEntry[];
  onOpenEncyclopediaEntry?: (entry: LibraryEntry) => void;
  onViewInEncyclopedia?: (entry: LibraryEntry) => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({
  member,
  isOpen,
  onClose,
  onUpdateMember,
  library = [],
  onOpenEncyclopediaEntry,
  onViewInEncyclopedia,
}) => {
  if (!isOpen || !member) return null;

  const [activeTab, setActiveTab] = useState<'combat' | 'spells' | 'features' | 'equipment'>('combat');
  const [isEditing, setIsEditing] = useState(false);
  const [restFeedback, setRestFeedback] = useState<string | null>(null);

  // Editable local state
  const [name, setName] = useState(member.name);
  const [characterClass, setCharacterClass] = useState(member.characterClass);
  const [level, setLevel] = useState(member.level);
  const [race, setRace] = useState(member.race || 'Human');
  const [hp, setHp] = useState(member.hp);
  const [maxHp, setMaxHp] = useState(member.maxHp);
  const [ac, setAc] = useState(member.ac);
  const [speed, setSpeed] = useState(member.speed || 30);
  const [tempHp, setTempHp] = useState(member.tempHp || 0);
  const [notes, setNotes] = useState(member.notes || '');

  const abilities: AbilityScores = member.abilities || {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleSave = () => {
    if (onUpdateMember) {
      onUpdateMember({
        ...member,
        name,
        characterClass,
        level,
        race,
        hp,
        maxHp,
        ac,
        speed,
        tempHp,
        notes,
      });
    }
    setIsEditing(false);
  };

  const handleSheetShortRest = () => {
    const res = performShortRest(member, 1);
    setHp(res.updatedMember.hp);
    onUpdateMember?.(res.updatedMember);
    setRestFeedback(res.summary);
    setTimeout(() => setRestFeedback(null), 4000);
  };

  const handleSheetLongRest = () => {
    const res = performLongRest(member);
    setHp(res.updatedMember.hp);
    setTempHp(0);
    onUpdateMember?.(res.updatedMember);
    setRestFeedback(res.summary);
    setTimeout(() => setRestFeedback(null), 4000);
  };

  const abilityKeys: Array<{ key: keyof AbilityScores; label: string }> = [
    { key: 'str', label: 'STR' },
    { key: 'dex', label: 'DEX' },
    { key: 'con', label: 'CON' },
    { key: 'int', label: 'INT' },
    { key: 'wis', label: 'WIS' },
    { key: 'cha', label: 'CHA' },
  ];

  const standardActions = [
    { name: 'Attack', type: 'Action', desc: 'Make one melee or ranged weapon attack with equipped weapons.' },
    { name: 'Dash', type: 'Action', desc: 'Gain extra movement equal to your speed for the current turn.' },
    { name: 'Disengage', type: 'Action', desc: 'Your movement does not provoke opportunity attacks for the rest of turn.' },
    { name: 'Dodge', type: 'Action', desc: 'Attackers have disadvantage against you; advantage on DEX saves.' },
    { name: 'Help', type: 'Action', desc: 'Give an ally advantage on their next ability check or attack roll.' },
    { name: 'Hide', type: 'Action', desc: 'Make a Dexterity (Stealth) check to become unseen and unheard.' },
    { name: 'Ready', type: 'Action', desc: 'Prepare an action with a defined trigger to execute via your reaction.' },
    { name: 'Search', type: 'Action', desc: 'Make a Wisdom (Perception) or Intelligence (Investigation) check.' },
    { name: 'Use an Object', type: 'Action', desc: 'Interact with a complex item, mechanism, or second object.' },
  ];

  const hitDiceLeft = member.hitDiceRemaining ?? member.level;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="bg-slate-950/90 border-b border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full ring-2 ring-white/20 shrink-0"
              style={{ backgroundColor: member.color }}
            />
            <div>
              {isEditing ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-sm font-bold text-amber-300"
                  />
                  <input
                    type="text"
                    value={characterClass}
                    onChange={e => setCharacterClass(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300"
                    placeholder="Class"
                  />
                  <input
                    type="number"
                    value={level}
                    onChange={e => setLevel(parseInt(e.target.value, 10) || 1)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-300"
                    placeholder="Lvl"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-slate-100 font-fantasy tracking-wide">
                    {member.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono-numbers">Lvl {member.level}</span>

                  {/* Character Class with Encyclopedia Tooltip */}
                  <EncyclopediaTooltip
                    entryName={member.characterClass.split('(')[0].trim()}
                    category="classes"
                    library={library}
                    onOpenFullEntry={onOpenEncyclopediaEntry}
                  >
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer" title="Hover for class overview, click for Encyclopedia">
                      {member.characterClass}
                    </span>
                  </EncyclopediaTooltip>

                  {/* Character Race with Encyclopedia Tooltip */}
                  {member.race && (
                    <EncyclopediaTooltip
                      entryName={member.race}
                      category="races"
                      library={library}
                      onOpenFullEntry={onOpenEncyclopediaEntry}
                    >
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer" title="Hover for species traits, click to pin">
                        {member.race}
                      </span>
                    </EncyclopediaTooltip>
                  )}
                </div>
              )}
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{member.alignment || 'Neutral'}</span>
                <span>•</span>
                {member.background ? (
                  <EncyclopediaTooltip
                    entryName={member.background}
                    category="backgrounds"
                    library={library}
                    onOpenFullEntry={onOpenEncyclopediaEntry}
                  >
                    <span className="hover:text-amber-400 transition-colors cursor-pointer">
                      {member.background}
                    </span>
                  </EncyclopediaTooltip>
                ) : (
                  <span>Adventurer</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Short Rest & Long Rest Buttons */}
            <button
              onClick={handleSheetShortRest}
              title={`Spend 1 Hit Die (${hitDiceLeft}/${member.level} remaining) to heal & refresh Short Rest abilities`}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Short Rest ({hitDiceLeft} HD)</span>
            </button>
            <button
              onClick={handleSheetLongRest}
              title="Restore full HP, all Spell Slots, and Hit Dice"
              className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Long Rest</span>
            </button>

            {isEditing ? (
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Sheet</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 border border-slate-700"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close Character Sheet"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {restFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-xs font-semibold text-emerald-300 flex items-center justify-between">
            <span>{restFeedback}</span>
            <button onClick={() => setRestFeedback(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Vital Quick Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-950/50 border-b border-slate-800/80 text-center">
          {/* HP */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" /> Hit Points
            </span>
            {isEditing ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={hp}
                  onChange={e => setHp(parseInt(e.target.value, 10) || 0)}
                  className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white"
                />
                <span className="text-slate-500">/</span>
                <input
                  type="number"
                  value={maxHp}
                  onChange={e => setMaxHp(parseInt(e.target.value, 10) || 1)}
                  className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white"
                />
              </div>
            ) : (
              <span className="text-base font-bold font-mono-numbers text-slate-100 mt-0.5">
                {member.hp} <span className="text-xs text-slate-500">/ {member.maxHp}</span>
              </span>
            )}
          </div>

          {/* AC */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" /> Armor Class
            </span>
            {isEditing ? (
              <input
                type="number"
                value={ac}
                onChange={e => setAc(parseInt(e.target.value, 10) || 10)}
                className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white mt-1"
              />
            ) : (
              <span className="text-base font-bold font-mono-numbers text-blue-400 mt-0.5">
                {member.ac}
              </span>
            )}
          </div>

          {/* Speed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Footprints className="w-3 h-3 text-emerald-400" /> Speed
            </span>
            {isEditing ? (
              <input
                type="number"
                value={speed}
                onChange={e => setSpeed(parseInt(e.target.value, 10) || 30)}
                className="w-12 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white mt-1"
              />
            ) : (
              <span className="text-base font-bold font-mono-numbers text-emerald-400 mt-0.5">
                {member.speed || 30} ft
              </span>
            )}
          </div>

          {/* Passives */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Eye className="w-3 h-3 text-amber-400" /> Perception
            </span>
            <span className="text-base font-bold font-mono-numbers text-amber-400 mt-0.5">
              {member.passivePerception}
            </span>
          </div>

          {/* Hit Dice / Spell DC */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> {member.spellSaveDc ? 'Spell DC' : 'Hit Dice'}
            </span>
            <span className="text-base font-bold font-mono-numbers text-purple-300 mt-0.5">
              {member.spellSaveDc ? `DC ${member.spellSaveDc}` : (member.hitDice || `${member.level}d8`)}
            </span>
          </div>
        </div>

        {/* Ability Scores Banner */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 p-3 bg-slate-950/70 border-b border-slate-800">
          {abilityKeys.map(({ key, label }) => {
            const score = abilities[key] || 10;
            const mod = getModifier(score);
            const isProficientSave = Boolean(member.savingThrows?.[key]);

            return (
              <div
                key={key}
                className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center relative shadow-sm"
              >
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {label}
                </span>
                <span className="text-lg font-extrabold font-mono-numbers text-amber-300">
                  {mod}
                </span>
                <span className="text-[10px] font-mono-numbers text-slate-500 bg-slate-950 px-1.5 py-0.2 rounded-full border border-slate-800">
                  {score}
                </span>
                {isProficientSave && (
                  <span
                    title="Proficient in Saving Throw"
                    className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4">
          <button
            onClick={() => setActiveTab('combat')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'combat'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Combat Actions</span>
          </button>
          <button
            onClick={() => setActiveTab('spells')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'spells'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Spells & Magic</span>
            {member.spells && member.spells.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-950 text-purple-300 font-mono-numbers border border-purple-800">
                {member.spells.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'features'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Features & Traits</span>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'equipment'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Backpack className="w-3.5 h-3.5" />
            <span>Inventory & Gear</span>
          </button>
        </div>

        {/* Body Viewport */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Combat Actions */}
          {activeTab === 'combat' && (
            <div className="space-y-4">
              {/* Spellcasting Slots Quick View if present */}
              {member.spellcasting && (
                <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Spell Slots & DCs
                    </span>
                    <span className="text-xs font-mono-numbers text-purple-300 font-semibold">
                      Spell Attack: +{member.spellcasting.spellAttackBonus || 5} • Save DC: {member.spellcasting.spellSaveDc || 14}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.spellcasting.slotsMax?.map((max, lvlIdx) => (
                      <div key={lvlIdx} className="bg-slate-900/90 border border-purple-800/40 rounded-lg px-2.5 py-1 text-xs font-mono-numbers">
                        <span className="text-slate-400">Lvl {lvlIdx + 1}: </span>
                        <span className="text-purple-300 font-bold">
                          {max - (member.spellcasting?.slotsUsed?.[lvlIdx] || 0)} / {max} slots
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Actions in Combat linking to Encyclopedia */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-fantasy">
                    Standard Actions in Combat
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Hover for D&D Beyond tooltip • Click for Encyclopedia
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {standardActions.map(action => (
                    <EncyclopediaTooltip
                      key={action.name}
                      entryName={action.name}
                      category="actions"
                      library={library}
                      onOpenFullEntry={onOpenEncyclopediaEntry}
                      fallbackStats={{ desc: action.desc, actionType: action.type }}
                      className="w-full"
                    >
                      <div className="w-full bg-slate-950/70 hover:bg-slate-950 hover:border-amber-500/50 transition-colors border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between text-left cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-200">
                            {action.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {action.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {action.desc}
                        </p>
                      </div>
                    </EncyclopediaTooltip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Spells & Magic */}
          {activeTab === 'spells' && (
            <div className="space-y-4">
              {/* Spellcasting Slots if present */}
              {member.spellcasting && (
                <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Spellcasting Matrix
                    </span>
                    <span className="text-xs font-mono-numbers text-purple-300 font-semibold">
                      Spell Attack: +{member.spellcasting.spellAttackBonus || 5} • Save DC: {member.spellcasting.spellSaveDc || 14}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {member.spellcasting.slotsMax?.map((max, lvlIdx) => (
                      <div key={lvlIdx} className="bg-slate-900/90 border border-purple-800/40 rounded-lg px-2.5 py-1 text-xs font-mono-numbers">
                        <span className="text-slate-400">Lvl {lvlIdx + 1}: </span>
                        <span className="text-purple-300 font-bold">
                          {max - (member.spellcasting?.slotsUsed?.[lvlIdx] || 0)} / {max} slots
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Known & Prepared Spells */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-fantasy">
                    Known & Prepared Spells
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Hover for D&D Beyond tooltip • Click for Encyclopedia
                  </span>
                </div>

                {member.spells && member.spells.length > 0 ? (
                  <div className="space-y-2">
                    {member.spells.map((spell, idx) => (
                      <EncyclopediaTooltip
                        key={idx}
                        entryName={spell.name}
                        category="spells"
                        library={library}
                        onOpenFullEntry={onOpenEncyclopediaEntry}
                        fallbackStats={{
                          level: spell.level,
                          school: spell.school,
                          damage: spell.damage,
                          damageType: spell.damageType,
                          range: spell.range,
                          actionType: spell.castingTime,
                          desc: spell.desc,
                        }}
                        className="w-full"
                      >
                        <div className="w-full bg-slate-950/70 hover:bg-slate-950 hover:border-purple-500/50 transition-colors border border-slate-800/80 rounded-xl p-3 flex items-start justify-between text-left cursor-pointer">
                          <div className="flex-1 mr-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-100">{spell.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/50">
                                {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                              </span>
                              {spell.school && (
                                <span className="text-[10px] text-slate-400 font-mono-numbers">
                                  {spell.school}
                                </span>
                              )}
                              {spell.castingTime && (
                                <span className="text-[10px] text-amber-400 font-mono-numbers">
                                  • {spell.castingTime}
                                </span>
                              )}
                              {spell.range && (
                                <span className="text-[10px] text-slate-400 font-mono-numbers">
                                  • {spell.range}
                                </span>
                              )}
                            </div>

                            {/* Damage / Effect pill */}
                            {(spell.damage || spell.healing) && (
                              <div className="flex items-center gap-2 mt-1.5 font-mono-numbers">
                                {spell.damage && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800/50 flex items-center gap-1">
                                    <Flame className="w-2.5 h-2.5 text-red-400" />
                                    <span>{spell.damage} {spell.damageType || ''}</span>
                                  </span>
                                )}
                                {spell.healing && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                                    <Heart className="w-2.5 h-2.5 text-emerald-400" />
                                    <span>{spell.healing} Heal</span>
                                  </span>
                                )}
                              </div>
                            )}

                            {spell.desc && (
                              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                                {spell.desc}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-purple-400 bg-purple-950/40 px-2 py-1 rounded-lg border border-purple-900/30">
                            <Sparkles className="w-3 h-3" />
                            <span>Info</span>
                          </div>
                        </div>
                      </EncyclopediaTooltip>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    No spells prepared or recorded for this character.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Features & Traits */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              {member.features && member.features.length > 0 ? (
                member.features.map((feat, idx) => (
                  <EncyclopediaTooltip
                    key={idx}
                    entryName={feat.name}
                    library={library}
                    onOpenFullEntry={onOpenEncyclopediaEntry}
                    fallbackStats={{ desc: feat.desc }}
                    className="w-full"
                  >
                    <div className="w-full bg-slate-950/70 hover:bg-slate-950 hover:border-amber-500/50 transition-colors border border-slate-800 rounded-xl p-3 text-left cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <span>{feat.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          Feature
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </EncyclopediaTooltip>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No custom class features recorded for this character.
                </div>
              )}

              {/* Character Backstory / Notes */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  Character Notes & Biography
                </span>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {member.notes || 'No notes entered yet.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Inventory & Gear */}
          {activeTab === 'equipment' && (
            <div className="space-y-2">
              {member.equipment && member.equipment.length > 0 ? (
                member.equipment.map((item, idx) => (
                  <EncyclopediaTooltip
                    key={idx}
                    entryName={item.name}
                    category="items"
                    library={library}
                    onOpenFullEntry={onOpenEncyclopediaEntry}
                    fallbackStats={{ desc: item.desc }}
                    className="w-full"
                  >
                    <div className="w-full bg-slate-950/70 hover:bg-slate-950 hover:border-amber-500/50 transition-colors border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-left cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-slate-200">
                          {item.name}
                        </span>
                        {item.desc && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono-numbers text-slate-400 shrink-0 ml-3">
                        x{item.quantity}
                      </span>
                    </div>
                  </EncyclopediaTooltip>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  No inventory recorded for this character.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
