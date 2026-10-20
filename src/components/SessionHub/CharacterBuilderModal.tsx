import React, { useState, useMemo } from 'react';
import { AbilityScores, LibraryEntry, PartyMember } from '../../types.ts';
import {
  SRD_CLASS_BLUEPRINTS,
  SRD_SPECIES_TRAITS,
  buildCharacterFromSrdChoices,
  getAbilityModifier,
  getProficiencyBonus
} from '../../utils/combatMechanics.ts';
import {
  X,
  Dices,
  Sparkles,
  Shield,
  Heart,
  Eye,
  Footprints,
  Swords,
  Award,
  Backpack,
  UserPlus,
  Check
} from 'lucide-react';

interface CharacterBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCharacter: (member: PartyMember) => void;
  library?: LibraryEntry[];
}

const CLASS_OPTIMAL_SCORES: Record<string, AbilityScores> = {
  Artificer: { str: 8, dex: 14, con: 14, int: 16, wis: 12, cha: 10 },
  Barbarian: { str: 16, dex: 14, con: 16, int: 8, wis: 12, cha: 10 },
  Bard: { str: 8, dex: 14, con: 14, int: 12, wis: 10, cha: 16 },
  Cleric: { str: 14, dex: 10, con: 14, int: 10, wis: 16, cha: 12 },
  Druid: { str: 10, dex: 14, con: 14, int: 12, wis: 16, cha: 8 },
  Fighter: { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 },
  Monk: { str: 10, dex: 16, con: 14, int: 10, wis: 16, cha: 8 },
  Paladin: { str: 16, dex: 10, con: 14, int: 8, wis: 12, cha: 16 },
  Ranger: { str: 12, dex: 16, con: 14, int: 10, wis: 14, cha: 8 },
  Rogue: { str: 8, dex: 16, con: 14, int: 14, wis: 12, cha: 10 },
  Sorcerer: { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 16 },
  Warlock: { str: 8, dex: 14, con: 14, int: 12, wis: 10, cha: 16 },
  Wizard: { str: 8, dex: 14, con: 14, int: 17, wis: 12, cha: 10 },
};

const BACKGROUNDS = [
  'Acolyte',
  'Charlatan',
  'Criminal',
  'Entertainer',
  'Folk Hero',
  'Guard',
  'Guild Artisan',
  'Hermit',
  'Merchant',
  'Noble',
  'Sage',
  'Sailor',
  'Scribe',
  'Soldier',
  'Wayfarer',
];

const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
];

const TOKEN_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
];

export const CharacterBuilderModal: React.FC<CharacterBuilderModalProps> = ({
  isOpen,
  onClose,
  onCreateCharacter,
  library = [],
}) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<string>('Elf');
  const [className, setClassName] = useState<string>('Wizard');
  const [subclass, setSubclass] = useState<string>('Evoker');
  const [background, setBackground] = useState<string>('Sage');
  const [alignment, setAlignment] = useState<string>('Neutral Good');
  const [level, setLevel] = useState<number>(3);
  const [color, setColor] = useState<string>('#3b82f6');
  const [abilities, setAbilities] = useState<AbilityScores>({
    ...CLASS_OPTIMAL_SCORES.Wizard,
  });

  const blueprint = SRD_CLASS_BLUEPRINTS[className] || SRD_CLASS_BLUEPRINTS.Wizard;

  const availableSpecies = useMemo(() => {
    const names = new Set<string>(Object.keys(SRD_SPECIES_TRAITS));
    for (const entry of library) {
      if (entry.category === 'races' && entry.name) {
        names.add(entry.name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [library]);

  const availableSubclasses = useMemo(() => {
    const names = new Set<string>(blueprint.defaultSubclasses);
    const prefix = `${className.toLowerCase()}: `;
    for (const entry of library) {
      if (entry.category === 'classes' && entry.tags?.includes('Subclass') && entry.name) {
        const lower = entry.name.toLowerCase();
        if (lower.startsWith(prefix)) {
          names.add(entry.name.slice(prefix.length).trim());
        } else if (entry.tags?.some(t => t.toLowerCase() === className.toLowerCase())) {
          names.add(entry.name);
        }
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [library, className, blueprint]);

  const availableBackgrounds = useMemo(() => {
    const names = new Set<string>(BACKGROUNDS);
    for (const entry of library) {
      if (entry.category === 'backgrounds' && entry.name) {
        names.add(entry.name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [library]);

  const handleSelectClass = (nextClass: string) => {
    setClassName(nextClass);
    const bp = SRD_CLASS_BLUEPRINTS[nextClass];
    if (bp) {
      setSubclass(bp.defaultSubclasses[0] || '');
      if (CLASS_OPTIMAL_SCORES[nextClass]) {
        setAbilities({ ...CLASS_OPTIMAL_SCORES[nextClass] });
      }
    }
  };

  const handleRoll4d6Stats = () => {
    const rollOneStat = () => {
      const rolls = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ].sort((a, b) => b - a);
      return rolls[0] + rolls[1] + rolls[2];
    };
    setAbilities({
      str: rollOneStat(),
      dex: rollOneStat(),
      con: rollOneStat(),
      int: rollOneStat(),
      wis: rollOneStat(),
      cha: rollOneStat(),
    });
  };

  const handleApplyStandardArray = () => {
    if (CLASS_OPTIMAL_SCORES[className]) {
      setAbilities({ ...CLASS_OPTIMAL_SCORES[className] });
    }
  };

  const previewMember = useMemo(() => {
    return buildCharacterFromSrdChoices(
      {
        name: name.trim() || `New ${species} ${className}`,
        species,
        className,
        subclass,
        background,
        alignment,
        level,
        abilities,
        color,
      },
      library
    );
  }, [name, species, className, subclass, background, alignment, level, abilities, color, library]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCharacter(previewMember);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-400 font-fantasy tracking-wide">
                SRD 5.2.1 Character Builder Wizard
              </h2>
              <p className="text-xs text-slate-400">
                Choose Species, Class, Background & Ability Scores — auto-calculates HP, AC, Save DC, Traits, Spells & Gear
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Character Builder"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT COLUMN: Identity, Species, Class, Ability Scores (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Row 1: Name, Level, Token Color */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={`e.g. Lyra Moonwhisper`}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Level (1–20)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={level}
                    onChange={e => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono-numbers text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Token Color
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {TOKEN_COLORS.slice(0, 6).map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={`Select color ${c}`}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Species & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Species / Race ({availableSpecies.length})
                  </label>
                  <select
                    value={species}
                    onChange={e => setSpecies(e.target.value)}
                    aria-label="Species"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {availableSpecies.map(sp => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Class ({Object.keys(SRD_CLASS_BLUEPRINTS).length})
                  </label>
                  <select
                    value={className}
                    onChange={e => handleSelectClass(e.target.value)}
                    aria-label="Class"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {Object.keys(SRD_CLASS_BLUEPRINTS).map(cls => (
                      <option key={cls} value={cls}>
                        {cls} (d{SRD_CLASS_BLUEPRINTS[cls].hitDie})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Subclass, Background, Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Subclass ({availableSubclasses.length})
                  </label>
                  <select
                    value={subclass}
                    onChange={e => setSubclass(e.target.value)}
                    aria-label="Subclass"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {availableSubclasses.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Background ({availableBackgrounds.length})
                  </label>
                  <select
                    value={background}
                    onChange={e => setBackground(e.target.value)}
                    aria-label="Background"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {availableBackgrounds.map(bg => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Alignment
                  </label>
                  <select
                    value={alignment}
                    onChange={e => setAlignment(e.target.value)}
                    aria-label="Alignment"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {ALIGNMENTS.map(al => (
                      <option key={al} value={al}>
                        {al}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Ability Scores Generator */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-fantasy">
                    Ability Scores
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyStandardArray}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700"
                    >
                      Optimal {className} Array
                    </button>
                    <button
                      type="button"
                      onClick={handleRoll4d6Stats}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      <span>Roll 4d6 Drop Lowest</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map(key => {
                    const val = abilities[key];
                    const mod = getAbilityModifier(val);
                    const isPrimary = blueprint.primaryAbility === key;
                    return (
                      <div
                        key={key}
                        className={`rounded-xl p-2 border text-center flex flex-col items-center ${
                          isPrimary
                            ? 'bg-amber-500/10 border-amber-500/50'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {key}
                        </span>
                        <span className="text-base font-extrabold font-mono-numbers text-amber-300 my-0.5">
                          {mod >= 0 ? `+${mod}` : mod}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setAbilities(prev => ({ ...prev, [key]: Math.max(3, prev[key] - 1) }))
                            }
                            aria-label={`Decrease ${key.toUpperCase()}`}
                            className="w-5 h-5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-800"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono-numbers font-bold text-slate-100 w-5">
                            {val}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setAbilities(prev => ({ ...prev, [key]: Math.min(20, prev[key] + 1) }))
                            }
                            aria-label={`Increase ${key.toUpperCase()}`}
                            className="w-5 h-5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-bold border border-slate-800"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Character Sheet Loadout Preview (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: previewMember.color }}
                    />
                    <div>
                      <div className="text-sm font-bold text-slate-100 font-fantasy">
                        {previewMember.name}
                      </div>
                      <div className="text-[11px] text-amber-400">
                        Lvl {previewMember.level} {previewMember.race} {previewMember.characterClass}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    Prof +{getProficiencyBonus(previewMember.level)}
                  </span>
                </div>

                {/* Calculated Vitals */}
                <div className="grid grid-cols-4 gap-2 text-center font-mono-numbers">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <div className="text-[9px] uppercase text-slate-400 flex items-center justify-center gap-1">
                      <Heart className="w-2.5 h-2.5 text-red-400" /> Max HP
                    </div>
                    <div className="text-sm font-bold text-emerald-400">{previewMember.maxHp}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <div className="text-[9px] uppercase text-slate-400 flex items-center justify-center gap-1">
                      <Shield className="w-2.5 h-2.5 text-sky-400" /> AC
                    </div>
                    <div className="text-sm font-bold text-sky-400">{previewMember.ac}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <div className="text-[9px] uppercase text-slate-400 flex items-center justify-center gap-1">
                      <Footprints className="w-2.5 h-2.5 text-emerald-400" /> Speed
                    </div>
                    <div className="text-sm font-bold text-slate-200">{previewMember.speed} ft</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
                    <div className="text-[9px] uppercase text-slate-400 flex items-center justify-center gap-1">
                      <Eye className="w-2.5 h-2.5 text-amber-400" /> Pass. Perc
                    </div>
                    <div className="text-sm font-bold text-amber-400">
                      {previewMember.passivePerception}
                    </div>
                  </div>
                </div>

                {/* Auto-Included Species & Class Features */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <Award className="w-3 h-3" /> Species Traits & Class Features ({previewMember.features?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {previewMember.features?.map((f, i) => (
                      <span
                        key={i}
                        title={f.desc}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-200"
                      >
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Auto-Included Equipment */}
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <Backpack className="w-3 h-3" /> Starting Equipment ({previewMember.equipment?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {previewMember.equipment?.map((eq, i) => (
                      <span
                        key={i}
                        title={eq.desc}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300"
                      >
                        {eq.name} x{eq.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Auto-Included Spells if Spellcaster */}
                {previewMember.spells && previewMember.spells.length > 0 && (
                  <div>
                    <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Prepared Spells ({previewMember.spells.length})
                      </span>
                      <span className="font-mono-numbers">
                        Save DC {previewMember.spellSaveDc} • Atk +{previewMember.spellcasting?.spellAttackBonus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {previewMember.spells.map((sp, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/60 text-[10px] text-purple-200"
                        >
                          {sp.name} (L{sp.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Create & Add to Party</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
