import React, { useState } from 'react';
import { Category, LibraryEntry } from '../../types.ts';
import { X } from 'lucide-react';

interface HomebrewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry: (entry: LibraryEntry) => void;
  initialCategory?: Category;
}

export const HomebrewModal: React.FC<HomebrewModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
  initialCategory = 'monsters',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>(initialCategory);
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  // Stats
  const [ac, setAc] = useState<string>('14');
  const [hp, setHp] = useState<string>('22');
  const [cr, setCr] = useState<string>('1');
  const [spellLevel, setSpellLevel] = useState<number>(1);
  const [school, setSchool] = useState<string>('Evocation');
  const [rarity, setRarity] = useState<string>('Uncommon');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const statsObj: Record<string, any> = {};

    if (category === 'monsters') {
      statsObj.ac = parseInt(ac, 10) || 10;
      statsObj.hp = parseInt(hp, 10) || 10;
      statsObj.cr = cr;
      if (!parsedTags.includes('Monster')) parsedTags.push('Monster');
      if (cr) parsedTags.push(`CR ${cr}`);
    } else if (category === 'spells') {
      statsObj.level = spellLevel;
      statsObj.school = school;
      if (!parsedTags.includes('Spell')) parsedTags.push('Spell');
      parsedTags.push(spellLevel === 0 ? 'Cantrip' : `Level ${spellLevel}`);
    } else if (category === 'items' || category === 'magic_items') {
      statsObj.rarity = rarity;
      if (!parsedTags.includes('Magic Item')) parsedTags.push('Magic Item');
      parsedTags.push(rarity);
    } else if (category === 'equipment') {
      statsObj.rarity = 'Common';
      if (!parsedTags.includes('Equipment')) parsedTags.push('Equipment');
    } else if (category === 'feats') {
      if (!parsedTags.includes('Feat')) parsedTags.push('Feat');
    } else if (category === 'backgrounds') {
      if (!parsedTags.includes('Background')) parsedTags.push('Background');
    }

    const newEntry: LibraryEntry = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      category,
      tags: Array.from(new Set(parsedTags)),
      source: 'Homebrew',
      summary: summary.trim() || undefined,
      content: content.trim() || summary.trim(),
      stats: statsObj,
      custom: true,
      createdAt: Date.now(),
    };

    onSaveEntry(newEntry);
    onClose();
    setName('');
    setTags('');
    setSummary('');
    setContent('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Homebrew Creator Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-100 font-fantasy tracking-wide">
              Create Homebrew Entry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a custom entity to your SRD Library
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Entry Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Shadow Stalker or Orb of Winter"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 select-text"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as Category)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="monsters">Monsters & Animals</option>
                <option value="spells">Spells</option>
                <option value="classes">Classes & Subclasses</option>
                <option value="races">Species & Lineages</option>
                <option value="backgrounds">Backgrounds</option>
                <option value="feats">Feats</option>
                <option value="equipment">Equipment & Gear</option>
                <option value="magic_items">Magic Items</option>
                <option value="actions">Actions</option>
                <option value="rules">Rules & Glossary</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Undead, Boss, Fire"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 select-text"
              />
            </div>
          </div>

          {/* Category-Specific Stats */}
          {category === 'monsters' && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Armor Class
                </label>
                <input
                  type="text"
                  value={ac}
                  onChange={e => setAc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Hit Points
                </label>
                <input
                  type="text"
                  value={hp}
                  onChange={e => setHp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Challenge (CR)
                </label>
                <input
                  type="text"
                  value={cr}
                  onChange={e => setCr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {category === 'spells' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Spell Level
                </label>
                <select
                  value={spellLevel}
                  onChange={e => setSpellLevel(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                >
                  <option value={0}>Cantrip</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  School
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
                />
              </div>
            </div>
          )}

          {(category === 'items' || category === 'magic_items') && (
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Rarity
              </label>
              <select
                value={rarity}
                onChange={e => setRarity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
              >
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Very Rare">Very Rare</option>
                <option value="Legendary">Legendary</option>
                <option value="Artifact">Artifact</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Brief Summary
            </label>
            <input
              type="text"
              placeholder="One line description for quick scanning..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 select-text"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Detailed Statblock / Description
            </label>
            <textarea
              rows={5}
              placeholder="Full markdown statblock or mechanics details..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none font-mono select-text"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-sm"
            >
              Save to Encyclopedia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
