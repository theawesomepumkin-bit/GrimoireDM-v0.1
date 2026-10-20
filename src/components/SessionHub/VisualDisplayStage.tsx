import React, { useState } from 'react';
import { HandoutItem } from '../../types.ts';
import { Sparkles, Plus, Image as ImageIcon, Scroll, Trash2 } from 'lucide-react';

interface VisualDisplayStageProps {
  handouts: HandoutItem[];
  activeHandoutId: string | null;
  onSelectHandout: (id: string) => void;
  onAddHandout: (handout: HandoutItem) => void;
  onDeleteHandout: (id: string) => void;
  onOpenPresentation: () => void;
}

export const VisualDisplayStage: React.FC<VisualDisplayStageProps> = ({
  handouts,
  activeHandoutId,
  onSelectHandout,
  onAddHandout,
  onDeleteHandout,
  onOpenPresentation,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'letter' | 'image'>('letter');
  const [newContent, setNewContent] = useState('');
  const [newCaption, setNewCaption] = useState('');

  const activeHandout = handouts.find(h => h.id === activeHandoutId) || handouts[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewContent(reader.result as string);
        if (!newTitle) {
          setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHandout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: HandoutItem = {
      id: `handout_${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      content: newContent.trim(),
      caption: newCaption.trim() || undefined,
    };

    onAddHandout(item);
    onSelectHandout(item.id);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
    setNewCaption('');
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col h-full">
      {/* Stage Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-500 font-fantasy">
            Visual Handout & Scene Stage
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Display scene art, tavern notes, or maps with one-click presentation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Handout</span>
          </button>
          <button
            onClick={onOpenPresentation}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Present to Players</span>
          </button>
        </div>
      </div>

      {/* Handout Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {handouts.map((h) => {
          const isSelected = h.id === activeHandout?.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelectHandout(h.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {h.type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Scroll className="w-3.5 h-3.5" />}
              <span>{h.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Handout Viewer */}
      <div className="flex-1 min-h-[300px] bg-slate-950/80 rounded-xl border border-slate-800/70 p-6 flex flex-col justify-center items-center relative overflow-hidden group">
        {activeHandout ? (
          activeHandout.type === 'image' ? (
            <div className="relative max-h-full flex flex-col items-center justify-center">
              <img
                src={activeHandout.content}
                alt={activeHandout.title}
                referrerPolicy="no-referrer"
                className="max-h-[340px] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
              />
              {activeHandout.caption && (
                <p className="text-xs text-slate-400 italic mt-3 text-center max-w-md">
                  {activeHandout.caption}
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-xl bg-stone-900/60 border border-amber-900/30 rounded-xl p-6 text-stone-200">
              <div className="border-b border-amber-900/30 pb-3 mb-4">
                <h3 className="text-lg font-fantasy font-semibold text-amber-400">
                  {activeHandout.title}
                </h3>
                {activeHandout.caption && (
                  <p className="text-xs text-stone-400 italic mt-0.5">{activeHandout.caption}</p>
                )}
              </div>
              <div className="whitespace-pre-line text-sm text-stone-300 font-sans leading-relaxed max-h-[260px] overflow-y-auto pr-2 select-text">
                {activeHandout.content}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">
            No handouts created yet. Click "Add Handout" to present maps or letters.
          </div>
        )}

        {/* Delete current handout if more than 1 */}
        {activeHandout && handouts.length > 1 && (
          <button
            onClick={() => onDeleteHandout(activeHandout.id)}
            aria-label="Delete this handout"
            className="absolute bottom-3 right-3 p-2 text-slate-500 hover:text-red-400 bg-slate-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Add Handout Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 font-fantasy mb-4">
              Create New Session Handout
            </h3>

            <form onSubmit={handleSaveHandout} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Handout Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Decrees / Dungeon Map"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 select-text"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('letter')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      newType === 'letter'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Text / Parchment Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('image')}
                    className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                      newType === 'image'
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Image / Map Upload
                  </button>
                </div>
              </div>

              {newType === 'letter' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Letter Text / Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write the letter contents, clues, or secret notes..."
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 select-text"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Upload Image / Map or Enter URL
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer mb-2"
                  />
                  <input
                    type="url"
                    placeholder="Or paste an image URL..."
                    value={newContent.startsWith('data:') ? '' : newContent}
                    onChange={e => setNewContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 select-text"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Caption / Atmosphere Subtext (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Inscribed in Dwarvish runes on weathered paper"
                  value={newCaption}
                  onChange={e => setNewCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 select-text"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
                >
                  Save Handout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
