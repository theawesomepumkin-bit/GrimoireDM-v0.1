/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LibraryEntry,
  PartyMember,
  Token,
  Combatant,
  HandoutItem,
  MapConfig,
  SavedEncounter
} from './types.ts';
import {
  loadLibrary,
  saveLibraryEntry,
  saveAllLibraryEntries,
  deleteLibraryEntry,
  forceSyncSeedLibrary,
  loadSession,
  saveSession,
  SessionData,
  DEFAULT_SAVED_ENCOUNTERS
} from './utils/storage.ts';
import { HeaderNav, ActiveTab } from './components/HeaderNav.tsx';
import { VisualDisplayStage } from './components/SessionHub/VisualDisplayStage.tsx';
import { SoundboardHub } from './components/SessionHub/SoundboardHub.tsx';
import { SessionScratchpad } from './components/SessionHub/SessionScratchpad.tsx';
import { EncyclopediaView } from './components/Encyclopedia/EncyclopediaView.tsx';
import { TacticalMapModule } from './components/BattleMap/TacticalMapModule.tsx';
import { PresentationModal } from './components/PresentationModal.tsx';
import { BackupModal } from './components/BackupModal.tsx';
import { CharacterSheetModal } from './components/SessionHub/CharacterSheetModal.tsx';
import { EncyclopediaEntryModal } from './components/Encyclopedia/EncyclopediaEntryModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('session');
  const [isLoaded, setIsLoaded] = useState(false);

  // Encyclopedia Library state
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [navigatedEncyclopediaEntryId, setNavigatedEncyclopediaEntryId] = useState<string | null>(null);

  // Character Sheet & Compendium Entry Inspection Modals
  const [selectedSheetMember, setSelectedSheetMember] = useState<PartyMember | null>(null);
  const [selectedEncyclopediaModalEntry, setSelectedEncyclopediaModalEntry] = useState<LibraryEntry | null>(null);

  // Session state
  const [notes, setNotes] = useState<string>('');
  const [round, setRound] = useState<number>(1);
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [party, setParty] = useState<PartyMember[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [handouts, setHandouts] = useState<HandoutItem[]>([]);
  const [activeHandoutId, setActiveHandoutId] = useState<string | null>(null);
  const [mapConfig, setMapConfig] = useState<MapConfig>({
    gridSize: 52,
    gridOpacity: 0.35,
    gridColor: '#94a3b8',
    snapToGrid: true,
    feetPerSquare: 5,
    backgroundImageUrl: 'dungeon_crypt',
    backgroundName: 'Ancient Crypt Hall',
    showGrid: true,
  });
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>(DEFAULT_SAVED_ENCOUNTERS);

  // Presentation & Backup Modals
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Notification Toast for actions (e.g. sent monster to encounter)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(curr => (curr === msg ? null : curr));
    }, 3000);
  };

  // Initial Data Load
  const reloadData = async () => {
    const lib = await loadLibrary();
    const sess = await loadSession();

    setLibrary(lib);
    setNotes(sess.notes);
    setRound(sess.round);
    setTurnIndex(sess.turnIndex);
    setParty(sess.party);
    setTokens(sess.tokens);
    setCombatants(sess.combatants);
    setHandouts(sess.handouts);
    setActiveHandoutId(sess.activeHandoutId || sess.handouts[0]?.id || null);
    if (sess.mapConfig) setMapConfig(sess.mapConfig);
    if (sess.savedEncounters) setSavedEncounters(sess.savedEncounters);
    setIsLoaded(true);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Debounced auto-save session
  const saveTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (!isLoaded) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const dataToSave: SessionData = {
        notes,
        round,
        turnIndex,
        party,
        tokens,
        combatants,
        handouts,
        activeHandoutId,
        mapConfig,
        savedEncounters,
      };
      saveSession(dataToSave);
    }, 400);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [notes, round, turnIndex, party, tokens, combatants, handouts, activeHandoutId, mapConfig, savedEncounters, isLoaded]);

  // Library Handlers
  const handleAddLibraryEntry = async (entry: LibraryEntry) => {
    await saveLibraryEntry(entry);
    setLibrary(prev => [entry, ...prev]);
    showToast(`Saved "${entry.name}" to Library`);
  };

  const handleUpdateLibraryEntry = async (updatedEntry: LibraryEntry) => {
    await saveLibraryEntry(updatedEntry);
    setLibrary(prev => prev.map(e => (e.id === updatedEntry.id ? updatedEntry : e)));
    showToast(`Updated "${updatedEntry.name}" in Library`);
  };

  const handleAddBulkEntries = async (entries: LibraryEntry[]) => {
    const nextList = [...entries, ...library];
    await saveAllLibraryEntries(nextList);
    setLibrary(nextList);
    showToast(`Successfully imported ${entries.length} entries to Library!`);
  };

  const handleDeleteLibraryEntry = async (id: string) => {
    await deleteLibraryEntry(id);
    setLibrary(prev => prev.filter(e => e.id !== id));
    showToast('Entry removed from Library');
  };

  const handleTogglePinEntry = async (id: string) => {
    const target = library.find(e => e.id === id);
    if (!target) return;
    const updatedEntry = { ...target, pinned: !target.pinned };
    await saveLibraryEntry(updatedEntry);
    setLibrary(prev => prev.map(e => (e.id === id ? updatedEntry : e)));
  };

  const handleForceSyncSRD = async () => {
    const synced = await forceSyncSeedLibrary(library);
    setLibrary(synced);
    showToast(`Synced ${synced.length.toLocaleString()} 5etools entities across all sourcebooks to Library!`);
  };

  const handleGrantToPartyMember = (memberId: string, entry: LibraryEntry) => {
    const targetMember = party.find(p => p.id === memberId);
    if (!targetMember) return;

    const updatedParty = party.map(p => {
      if (p.id !== memberId) return p;

      if (entry.category === 'spells') {
        const currentSpells = p.spells || [];
        if (currentSpells.some(s => s.name.toLowerCase() === entry.name.toLowerCase())) {
          return p;
        }
        return {
          ...p,
          spells: [
            ...currentSpells,
            {
              name: entry.name,
              level: entry.stats?.level ?? 1,
              school: entry.stats?.school || 'Evocation',
              desc: entry.summary || entry.content?.slice(0, 200),
              damage: entry.stats?.damage,
              damageType: entry.stats?.damageType,
              healing: entry.stats?.healing,
              range: entry.stats?.range,
              castingTime: entry.stats?.castingTime,
            },
          ],
        };
      }

      if (entry.category === 'equipment' || entry.category === 'magic_items' || entry.category === 'items') {
        const currentEquip = p.equipment || [];
        const existingIdx = currentEquip.findIndex(item => item.name.toLowerCase() === entry.name.toLowerCase());
        if (existingIdx >= 0) {
          const nextEquip = [...currentEquip];
          nextEquip[existingIdx] = {
            ...nextEquip[existingIdx],
            quantity: nextEquip[existingIdx].quantity + 1,
          };
          return { ...p, equipment: nextEquip };
        }
        return {
          ...p,
          equipment: [
            ...currentEquip,
            {
              name: entry.name,
              quantity: 1,
              desc: entry.summary || entry.content?.slice(0, 180),
            },
          ],
        };
      }

      // Feats, Class Features, Species traits, Backgrounds
      const currentFeatures = p.features || [];
      if (currentFeatures.some(f => f.name.toLowerCase() === entry.name.toLowerCase())) {
        return p;
      }
      return {
        ...p,
        features: [
          ...currentFeatures,
          {
            name: entry.name,
            desc: entry.summary || entry.content?.slice(0, 240) || '',
          },
        ],
      };
    });

    setParty(updatedParty);
    showToast(`Added "${entry.name}" to ${targetMember.name}'s Character Sheet!`);
  };

  const handleSendToNotes = (entry: LibraryEntry) => {
    const snippet = `\n\n### ${entry.name} (${entry.source || 'SRD 5.2.1'})\n${entry.summary || ''}\n${(entry.content || '').slice(0, 500)}`;
    setNotes(prev => `${prev.trim()}${snippet}`);
    showToast(`Appended "${entry.name}" to Session Scratchpad!`);
  };

  // Interactivity: Send Monster to Active Encounter
  const handleSendToEncounter = (entry: LibraryEntry) => {
    const hpVal = typeof entry.stats?.hp === 'number' ? entry.stats.hp : 15;
    const acVal = typeof entry.stats?.ac === 'number' ? entry.stats.ac : 13;
    const s = entry.stats?.size?.toLowerCase() || '';
    const sizeVal = s.includes('gargantuan') ? 4 : s.includes('huge') ? 3 : s.includes('large') ? 2 : 1;

    const count = tokens.filter(t => t.name.startsWith(entry.name)).length;
    const tokenName = count > 0 ? `${entry.name} ${count + 1}` : entry.name;

    const newToken: Token = {
      id: `tok_${Date.now()}`,
      name: tokenName,
      gridX: Math.floor(Math.random() * 5) + 10,
      gridY: Math.floor(Math.random() * 5) + 5,
      size: sizeVal as any,
      hp: hpVal,
      maxHp: hpVal,
      ac: acVal,
      color: '#ef4444',
      type: 'enemy',
      conditions: [],
      libraryEntryId: entry.id,
    };

    const newCombatant: Combatant = {
      id: `comb_${Date.now()}`,
      tokenId: newToken.id,
      name: tokenName,
      initiative: Math.floor(Math.random() * 20) + 1,
      hp: hpVal,
      maxHp: hpVal,
      ac: acVal,
      conditions: [],
      isPlayer: false,
      color: '#ef4444',
    };

    setTokens(prev => [...prev, newToken]);
    setCombatants(prev => [...prev, newCombatant]);
    setActiveTab('battlemap');
    showToast(`Spawned "${tokenName}" in Encounter!`);
  };

  // Handout Stage Handlers
  const handleAddHandout = (item: HandoutItem) => {
    setHandouts(prev => [item, ...prev]);
    setActiveHandoutId(item.id);
  };

  const handleDeleteHandout = (id: string) => {
    const updated = handouts.filter(h => h.id !== id);
    setHandouts(updated);
    if (activeHandoutId === id) {
      setActiveHandoutId(updated[0]?.id || null);
    }
  };

  const activeHandout = handouts.find(h => h.id === activeHandoutId) || handouts[0] || null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-500 font-fantasy text-lg">
        Preparing GrimoireDM Tabletop...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 3-Zone Header Nav Bar */}
      <HeaderNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPresentation={() => setShowPresentationModal(true)}
        onOpenBackup={() => setShowBackupModal(true)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main
        className={
          activeTab === 'battlemap'
            ? 'flex-1 w-full p-2 sm:p-3 flex flex-col'
            : 'flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8'
        }
      >
        {/* Module 1: Main Session Hub */}
        {activeTab === 'session' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Handout Stage (6 cols) */}
              <div className="lg:col-span-6">
                <VisualDisplayStage
                  handouts={handouts}
                  activeHandoutId={activeHandoutId}
                  onSelectHandout={setActiveHandoutId}
                  onAddHandout={handleAddHandout}
                  onDeleteHandout={handleDeleteHandout}
                  onOpenPresentation={() => setShowPresentationModal(true)}
                />
              </div>

              {/* Audio Hub & Soundboard (6 cols) */}
              <div className="lg:col-span-6">
                <SoundboardHub />
              </div>
            </div>

            {/* Session Scratchpad & Party Passives */}
            <SessionScratchpad
              notes={notes}
              onUpdateNotes={setNotes}
              party={party}
              onUpdateParty={setParty}
              round={round}
              onUpdateRound={setRound}
              turnIndex={turnIndex}
              onUpdateTurnIndex={setTurnIndex}
              library={library}
              onOpenEncyclopediaEntry={(entry) => setSelectedEncyclopediaModalEntry(entry)}
              onViewInEncyclopedia={(entry) => {
                setNavigatedEncyclopediaEntryId(entry.id);
                setActiveTab('encyclopedia');
              }}
            />
          </div>
        )}

        {/* Module 2: Comprehensive SRD 5.2.1 Library */}
        {activeTab === 'encyclopedia' && (
          <EncyclopediaView
            entries={library}
            onAddEntry={handleAddLibraryEntry}
            onAddBulkEntries={handleAddBulkEntries}
            onDeleteEntry={handleDeleteLibraryEntry}
            onTogglePin={handleTogglePinEntry}
            onSendToEncounter={handleSendToEncounter}
            onUpdateEntry={handleUpdateLibraryEntry}
            onForceSyncSRD={handleForceSyncSRD}
            party={party}
            onGrantToPartyMember={handleGrantToPartyMember}
            onSendToNotes={handleSendToNotes}
            initialSelectedEntryId={navigatedEncyclopediaEntryId}
          />
        )}

        {/* Module 3: Encounter View (Baldur's Gate 3 Tactical HUD & Battle Map) */}
        {activeTab === 'battlemap' && (
          <TacticalMapModule
            tokens={tokens}
            mapConfig={mapConfig}
            combatants={combatants}
            party={party}
            library={library}
            round={round}
            turnIndex={turnIndex}
            savedEncounters={savedEncounters}
            onUpdateSavedEncounters={setSavedEncounters}
            onUpdateTokens={setTokens}
            onUpdateMapConfig={setMapConfig}
            onUpdateCombatants={setCombatants}
            onUpdateParty={setParty}
            onUpdateRound={setRound}
            onUpdateTurnIndex={setTurnIndex}
            onOpenCharacterSheet={setSelectedSheetMember}
            onOpenEncyclopediaEntry={setSelectedEncyclopediaModalEntry}
          />
        )}
      </main>

      {/* Player Character Sheet Modal (accessible from Session Hub & Tactical Encounter) */}
      <CharacterSheetModal
        member={selectedSheetMember}
        isOpen={Boolean(selectedSheetMember)}
        onClose={() => setSelectedSheetMember(null)}
        onUpdateMember={(updated) => {
          setParty(party.map(p => p.id === updated.id ? updated : p));
          setSelectedSheetMember(updated);
        }}
        library={library}
        onOpenEncyclopediaEntry={(entry) => {
          setSelectedEncyclopediaModalEntry(entry);
        }}
        onViewInEncyclopedia={(entry) => {
          setNavigatedEncyclopediaEntryId(entry.id);
          setActiveTab('encyclopedia');
          setSelectedSheetMember(null);
          setSelectedEncyclopediaModalEntry(null);
        }}
      />

      {/* Monster & Rules Compendium Modal (accessible from Battle Map & Initiative Tracker) */}
      <EncyclopediaEntryModal
        entry={selectedEncyclopediaModalEntry}
        isOpen={Boolean(selectedEncyclopediaModalEntry)}
        onClose={() => setSelectedEncyclopediaModalEntry(null)}
        library={library}
        onSelectEntry={setSelectedEncyclopediaModalEntry}
        onSendToEncounter={handleSendToEncounter}
        onViewInEncyclopedia={(entry) => {
          setNavigatedEncyclopediaEntryId(entry.id);
          setActiveTab('encyclopedia');
          setSelectedEncyclopediaModalEntry(null);
        }}
      />

      {/* Player Presentation Mode Frameless View */}
      {showPresentationModal && (
        <PresentationModal
          handout={activeHandout}
          onClose={() => setShowPresentationModal(false)}
        />
      )}

      {/* Backup & JSON Sync Modal */}
      <BackupModal
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onRefreshData={reloadData}
      />
    </div>
  );
}
