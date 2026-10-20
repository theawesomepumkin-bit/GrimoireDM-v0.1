import React from 'react';
import { Sparkles } from 'lucide-react';

export type ActiveTab = 'session' | 'encyclopedia' | 'battlemap';

interface HeaderNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenPresentation: () => void;
  onOpenBackup: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenPresentation,
  onOpenBackup,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xl font-bold font-fantasy tracking-wider text-amber-500 whitespace-nowrap">
          GrimoireDM
        </span>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-400 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectTab('session')}
          className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
            activeTab === 'session'
              ? 'text-amber-400 border-amber-500 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Session Hub
        </button>
        <button
          onClick={() => onSelectTab('encyclopedia')}
          className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
            activeTab === 'encyclopedia'
              ? 'text-amber-400 border-amber-500 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Library
        </button>
        <button
          onClick={() => onSelectTab('battlemap')}
          className={`transition-colors whitespace-nowrap py-1 border-b-2 ${
            activeTab === 'battlemap'
              ? 'text-amber-400 border-amber-500 font-semibold'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          Encounter
        </button>
        <button
          onClick={onOpenBackup}
          className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap py-1 border-b-2 border-transparent"
        >
          Backup & Sync
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenPresentation}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-amber-500/20 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Presentation View</span>
        </button>
      </div>
    </header>
  );
};
