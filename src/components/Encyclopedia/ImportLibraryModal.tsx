import React, { useState, useMemo } from 'react';
import { LibraryEntry } from '../../types.ts';
import { parseMarkdownOrText, parseJsonImport } from '../../utils/importer.ts';
import { SEED_LIBRARY } from '../../data/seedData.ts';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface ImportLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (entries: LibraryEntry[]) => void;
  onImportEntries?: (entries: LibraryEntry[]) => void;
}

export const ImportLibraryModal: React.FC<ImportLibraryModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  onImportEntries,
}) => {
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewEntries, setPreviewEntries] = useState<LibraryEntry[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runParse = (content: string) => {
    setParseError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setPreviewEntries([]);
      return;
    }

    let results: LibraryEntry[] = [];
    if (trimmed.startsWith('[') || (trimmed.startsWith('{') && trimmed.includes('"name"'))) {
      results = parseJsonImport(trimmed);
    } else {
      results = parseMarkdownOrText(trimmed);
    }

    if (results.length === 0) {
      setParseError('Could not recognize any valid D&D entries. Please check formatting.');
      setPreviewEntries([]);
    } else {
      setPreviewEntries(results);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    runParse(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setInputText(text);
        runParse(text);
      };
      reader.readAsText(file);
    }
  };

  const loadSampleDwarf = () => {
    const sample = `# Dwarf

### Dwarf Traits

Your dwarf character has an assortment of inborn abilities, part and parcel of dwarven nature.

***Ability Score Increase***. Your Constitution score increases by 2.

***Age***. Dwarves mature at the same rate as humans, but they're considered young until they reach the age of 50. On average, they live about 350 years.

***Size***. Dwarves stand between 4 and 5 feet tall and average about 150 pounds. Your size is Medium.

***Speed***. Your base walking speed is 25 feet. Your speed is not reduced by wearing heavy armor.

***Darkvision***. Accustomed to life underground, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.

***Dwarven Resilience***. You have advantage on saving throws against poison, and you have resistance against poison damage.

---

# Bugbear
Medium humanoid (goblinoid), chaotic evil
Armor Class 16 (hide armor, shield)
Hit Points 27 (5d8 + 5)
Speed 30 ft.
STR 15 (+2) DEX 14 (+2) CON 13 (+1) INT 8 (-1) WIS 11 (+0) CHA 9 (-1)
Challenge 1 (200 XP)
Brute. A melee weapon deals one extra die of its damage when the bugbear hits with it.
Surprise Attack. If the bugbear surprises a creature, it deals an extra 7 (2d6) damage on the first hit.
`;
    setInputText(sample);
    setFileName('sample_dwarf_and_bugbear.txt');
    runParse(sample);
  };

  const loadSampleSpells = () => {
    const sample = JSON.stringify(
      [
        {
          name: 'Lightning Bolt',
          category: 'spells',
          tags: ['Spell', 'Evocation', 'Level 3'],
          summary: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blast out from you in a direction you choose.',
          stats: {
            level: 3,
            school: 'Evocation',
            castingTime: '1 action',
            range: 'Self (100-foot line)',
            components: 'V, S, M (a bit of fur and a rod of amber, crystal, or glass)',
            duration: 'Instantaneous'
          },
          content: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you. Each creature in the line must make a Dex save (8d6 lightning damage or half).'
        },
        {
          name: 'Shield',
          category: 'spells',
          tags: ['Spell', 'Abjuration', 'Level 1'],
          summary: 'An invisible barrier of magical force appears and protects you (+5 AC until start of your next turn).',
          stats: {
            level: 1,
            school: 'Abjuration',
            castingTime: '1 reaction',
            range: 'Self',
            components: 'V, S',
            duration: '1 round'
          },
          content: 'An invisible barrier of magical force appears and protects you. +5 bonus to AC, including against triggering attack, and you take no damage from magic missile.'
        }
      ],
      null,
      2
    );
    setInputText(sample);
    setFileName('sample_spells.json');
    runParse(sample);
  };

  const loadCompleteSRD = () => {
    setFileName('dnd_5e_complete_srd_compendium.json');
    setParseError(null);
    setInputText(`Loaded ${SEED_LIBRARY.length} complete SRD 5.2.1 & 5.1 Compendium entries across Classes, Subclasses, Species/Races, Backgrounds, Feats, Equipment, Magic Items, Spells, Monsters, Conditions, Actions, and Rules Glossary.`);
    setPreviewEntries(SEED_LIBRARY);
  };

  const previewCounts = useMemo(() => {
    return previewEntries.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [previewEntries]);

  const handleCommitImport = () => {
    if (previewEntries.length > 0) {
      if (onImportEntries) onImportEntries(previewEntries);
      if (onImportComplete) onImportComplete(previewEntries);
      onClose();
      setInputText('');
      setPreviewEntries([]);
      setFileName(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Import Library Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 font-fantasy tracking-wide">
              Bulk Document & Data Importer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingest plain text, Markdown statblocks, or JSON into your persistent IndexedDB library
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Pre-fill Buttons */}
        <div className="flex flex-wrap items-center gap-2 py-3">
          <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={loadCompleteSRD}
            className="px-2.5 py-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Complete SRD (186 Entries)</span>
          </button>
          <button
            type="button"
            onClick={loadSampleDwarf}
            className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg transition-colors"
          >
            Dwarf & Bugbear
          </button>
          <button
            type="button"
            onClick={loadSampleSpells}
            className="px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-blue-400 border border-blue-500/30 rounded-lg transition-colors"
          >
            Spells (JSON)
          </button>
        </div>

        {/* Input & File Upload Area */}
        <div className="flex-1 flex flex-col gap-3 min-h-[180px] overflow-hidden">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              Paste Text / Markdown / JSON, or Upload File:
            </label>
            <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg cursor-pointer border border-slate-700">
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>Choose .txt / .json</span>
              <input type="file" accept=".txt,.json,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={inputText}
            onChange={handleTextChange}
            placeholder="Paste raw markdown statblock or JSON entries here..."
            className="w-full flex-1 min-h-[140px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono resize-none focus:outline-none focus:border-amber-500 select-text"
          />

          {/* Feedback & Preview Summary */}
          {parseError && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{parseError}</span>
            </div>
          )}

          {previewEntries.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready to import {previewEntries.length} valid {previewEntries.length === 1 ? 'entry' : 'entries'}:</span>
                </div>
                {fileName && <span className="text-slate-500 text-[11px]">{fileName}</span>}
              </div>

              {/* Category Breakdown Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {previewCounts['spells'] ? (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-purple-950/70 text-purple-300 border border-purple-800/40">
                    {previewCounts['spells']} Spells
                  </span>
                ) : null}
                {previewCounts['monsters'] ? (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-red-950/70 text-red-300 border border-red-800/40">
                    {previewCounts['monsters']} Monsters
                  </span>
                ) : null}
                {previewCounts['items'] ? (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-amber-950/70 text-amber-300 border border-amber-800/40">
                    {previewCounts['items']} Items
                  </span>
                ) : null}
                {previewCounts['races_classes'] ? (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-blue-950/70 text-blue-300 border border-blue-800/40">
                    {previewCounts['races_classes']} Races & Classes
                  </span>
                ) : null}
                {previewCounts['rules'] ? (
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                    {previewCounts['rules']} Rules
                  </span>
                ) : null}
              </div>

              <div className="space-y-1.5">
                {previewEntries.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{e.name}</span>
                      <span className="text-[11px] text-slate-500 capitalize">· {e.category}</span>
                    </div>
                    <div className="text-[11px] text-amber-500/90 font-mono-numbers">
                      {e.tags.slice(0, 3).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={previewEntries.length === 0}
            onClick={handleCommitImport}
            className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              previewEntries.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Import {previewEntries.length > 0 ? `(${previewEntries.length})` : ''} to Library
          </button>
        </div>
      </div>
    </div>
  );
};
