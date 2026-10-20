import React, { useState } from 'react';
import { HandoutItem } from '../types.ts';
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

interface PresentationModalProps {
  handout: HandoutItem | null;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({ handout, onClose }) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!handout) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Player Presentation View"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 text-slate-100 select-none overflow-hidden"
    >
      {/* Top minimal control bar - auto dims on idle */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold">
            Player Presentation View
          </span>
          <span className="text-slate-600">·</span>
          <h2 className="text-base font-medium font-fantasy text-slate-200 tracking-wide">
            {handout.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.2))}
            aria-label="Zoom out"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono-numbers px-2 text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
            aria-label="Zoom in"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors ml-2"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            aria-label="Close Presentation"
            className="p-2 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/50 transition-colors ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main presentation canvas */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
          className="max-w-4xl w-full flex flex-col items-center justify-center"
        >
          {handout.type === 'image' ? (
            <div className="relative rounded-xl overflow-hidden border border-amber-900/40 shadow-2xl shadow-black/80">
              <img
                src={handout.content}
                alt={handout.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="w-full max-w-2xl bg-stone-900/90 border border-amber-600/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md text-stone-200 font-serif leading-relaxed">
              <div className="border-b border-amber-600/30 pb-4 mb-6 text-center">
                <h1 className="text-2xl font-fantasy font-bold text-amber-400 tracking-wider">
                  {handout.title}
                </h1>
                {handout.caption && (
                  <p className="text-xs text-stone-400 italic mt-1 font-sans">{handout.caption}</p>
                )}
              </div>
              <div className="whitespace-pre-line text-base text-stone-300 font-sans leading-relaxed select-text">
                {handout.content}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Minimal caption footer if image */}
      {handout.type === 'image' && handout.caption && (
        <div className="text-center py-3 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-sm text-slate-400 italic max-w-xl mx-auto px-4">{handout.caption}</p>
        </div>
      )}
    </div>
  );
};
