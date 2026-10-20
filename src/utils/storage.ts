import { LibraryEntry, PartyMember, Token, Combatant, HandoutItem, MapConfig, BackupData } from '../types.ts';
import { SEED_LIBRARY, DEFAULT_PARTY, DEFAULT_HANDOUTS } from '../data/seedData.ts';

import { sanitizeExistingEntries } from './importer.ts';

const DB_NAME = 'GrimoireDM_DB';
const DB_VERSION = 1;
const STORE_LIBRARY = 'library';
const STORE_STATE = 'state';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_LIBRARY)) {
        db.createObjectStore(STORE_LIBRARY, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback localStorage keys
const LS_LIBRARY_KEY = 'grimoiredm_library_deltas_v10';
const LS_SEED_VERSION_KEY = 'grimoiredm_srd_seed_version';
export const CURRENT_SRD_SEED_VERSION = '5etools-complete-v10';
const LS_SESSION_KEY = 'grimoiredm_session_v1';

const SEED_ID_MAP = new Map<string, LibraryEntry>(SEED_LIBRARY.map(s => [s.id, s]));
const SEED_COMPOSITE_SET = new Set<string>(
  SEED_LIBRARY.map(s => `${s.category}:${s.name.toLowerCase().trim()}:${(s.source || '').toLowerCase().trim()}`)
);

function getUserDeltas(entries: LibraryEntry[]): LibraryEntry[] {
  return entries.filter(e => {
    if (!e || !e.id) return false;
    if (e.custom || e.pinned) return true;
    const seed = SEED_ID_MAP.get(e.id);
    if (!seed) return true;
    if (e.tags && seed.tags && e.tags.length !== seed.tags.length) return true;
    return false;
  });
}

export function mergeWithSeedLibrary(existing: LibraryEntry[] | null | undefined): LibraryEntry[] {
  const existingList = existing || [];
  const pinnedIds = new Set<string>();
  const pinnedCompositeKeys = new Set<string>();
  const extraTagsById = new Map<string, string[]>();
  const extraTagsByComposite = new Map<string, string[]>();
  const customEntries: LibraryEntry[] = [];

  for (const item of existingList) {
    if (!item || !item.name) continue;
    const lowerName = item.name.toLowerCase().trim();
    const lowerSource = (item.source || '').toLowerCase().trim();
    const compositeKey = `${item.category}:${lowerName}:${lowerSource}`;
    if (item.pinned) {
      pinnedIds.add(item.id);
      pinnedCompositeKeys.add(compositeKey);
    }
    if (Array.isArray(item.tags) && item.tags.length > 0) {
      extraTagsById.set(item.id, item.tags);
      extraTagsByComposite.set(compositeKey, item.tags);
    }
    if (item.custom && !SEED_ID_MAP.has(item.id) && !SEED_COMPOSITE_SET.has(compositeKey)) {
      customEntries.push(item);
    }
  }

  const hasAnyOverrides =
    pinnedIds.size > 0 ||
    pinnedCompositeKeys.size > 0 ||
    extraTagsById.size > 0 ||
    extraTagsByComposite.size > 0;

  const upgradedSeed = hasAnyOverrides
    ? SEED_LIBRARY.map(seed => {
        const lowerName = seed.name.toLowerCase().trim();
        const lowerSource = (seed.source || '').toLowerCase().trim();
        const compositeKey = `${seed.category}:${lowerName}:${lowerSource}`;
        const isPinned = Boolean(
          seed.pinned || pinnedIds.has(seed.id) || pinnedCompositeKeys.has(compositeKey)
        );
        const savedTags = extraTagsById.get(seed.id) || extraTagsByComposite.get(compositeKey);
        const mergedTags =
          savedTags && savedTags.length > seed.tags.length
            ? Array.from(new Set([...seed.tags, ...savedTags]))
            : seed.tags;
        if (!isPinned && mergedTags === seed.tags) return seed;
        return {
          ...seed,
          pinned: isPinned,
          tags: mergedTags,
        };
      })
    : SEED_LIBRARY;

  if (customEntries.length === 0) {
    return upgradedSeed;
  }
  return [...sanitizeExistingEntries(customEntries), ...upgradedSeed];
}

export async function forceSyncSeedLibrary(currentEntries?: LibraryEntry[]): Promise<LibraryEntry[]> {
  const merged = mergeWithSeedLibrary(currentEntries || []);
  await saveAllLibraryEntries(merged);
  try {
    localStorage.setItem(LS_SEED_VERSION_KEY, CURRENT_SRD_SEED_VERSION);
  } catch {}
  return merged;
}

export async function loadLibrary(): Promise<LibraryEntry[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LIBRARY, 'readonly');
      const store = tx.objectStore(STORE_LIBRARY);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as LibraryEntry[];
        const merged = mergeWithSeedLibrary(results);
        const savedVersion = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_SEED_VERSION_KEY) : null;
        if (savedVersion !== CURRENT_SRD_SEED_VERSION) {
          saveAllLibraryEntries(merged).catch(() => {});
          try {
            localStorage.setItem(LS_SEED_VERSION_KEY, CURRENT_SRD_SEED_VERSION);
          } catch {}
        }
        resolve(merged);
      };
      req.onerror = () => {
        resolve(loadLibraryFromLS());
      };
    });
  } catch {
    return loadLibraryFromLS();
  }
}

function loadLibraryFromLS(): LibraryEntry[] {
  try {
    const data = localStorage.getItem(LS_LIBRARY_KEY);
    if (data) {
      const parsed: LibraryEntry[] = JSON.parse(data);
      return mergeWithSeedLibrary(parsed);
    }
  } catch {}
  return mergeWithSeedLibrary([]);
}

export async function saveLibraryEntry(entry: LibraryEntry): Promise<void> {
  const isDelta = getUserDeltas([entry]).length > 0;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_LIBRARY, 'readwrite');
      const store = tx.objectStore(STORE_LIBRARY);
      if (isDelta) {
        store.put(entry);
      } else {
        store.delete(entry.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}

  try {
    const raw = localStorage.getItem(LS_LIBRARY_KEY);
    const currentDeltas: LibraryEntry[] = raw ? JSON.parse(raw) : [];
    const filtered = currentDeltas.filter(e => e.id !== entry.id);
    if (isDelta) {
      filtered.unshift(entry);
    }
    localStorage.setItem(LS_LIBRARY_KEY, JSON.stringify(filtered));
  } catch {}
}

export async function saveAllLibraryEntries(entries: LibraryEntry[]): Promise<void> {
  const deltas = getUserDeltas(entries);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_LIBRARY, 'readwrite');
      const store = tx.objectStore(STORE_LIBRARY);
      store.clear();
      for (const entry of deltas) {
        store.put(entry);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}

  try {
    localStorage.setItem(LS_LIBRARY_KEY, JSON.stringify(deltas));
  } catch {}
}

export async function deleteLibraryEntry(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_LIBRARY, 'readwrite');
      const store = tx.objectStore(STORE_LIBRARY);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}

  try {
    const raw = localStorage.getItem(LS_LIBRARY_KEY);
    if (raw) {
      const currentDeltas: LibraryEntry[] = JSON.parse(raw);
      const updated = currentDeltas.filter(e => e.id !== id);
      localStorage.setItem(LS_LIBRARY_KEY, JSON.stringify(updated));
    }
  } catch {}
}

export interface SessionData {
  notes: string;
  round: number;
  turnIndex: number;
  party: PartyMember[];
  tokens: Token[];
  combatants: Combatant[];
  handouts: HandoutItem[];
  activeHandoutId: string | null;
  mapConfig: MapConfig;
  savedEncounters?: SavedEncounter[];
}

export const DEFAULT_SAVED_ENCOUNTERS: SavedEncounter[] = [
  {
    id: 'enc_crypt_ambush',
    name: 'Crypt of the Ash King (Walls & Doors)',
    description: 'Chamber divided by stone walls and a closed dungeon door at (9,7) with goblins & treasure inside.',
    updatedAt: '2026-10-18T00:00:00.000Z',
    round: 1,
    turnIndex: 0,
    mapConfig: {
      gridSize: 52,
      gridCols: 28,
      gridRows: 20,
      gridOffsetX: 0,
      gridOffsetY: 0,
      gridOpacity: 0.35,
      gridColor: '#94a3b8',
      snapToGrid: true,
      feetPerSquare: 5,
      backgroundImageUrl: 'dungeon_crypt',
      backgroundName: 'Ancient Crypt Hall',
      showGrid: true,
      mapFitMode: 'fit_grid',
      mapScaleX: 100,
      mapScaleY: 100,
      mapOffsetX: 0,
      mapOffsetY: 0,
      fogOfWarEnabled: true,
      dynamicLosEnabled: true,
      showTerrainInPlayMode: false,
      architectureCells: {
        '9,3': 'wall',
        '9,4': 'wall',
        '9,5': 'wall',
        '9,6': 'wall',
        '9,7': 'door_closed',
        '9,8': 'wall',
        '9,9': 'wall',
        '9,10': 'wall',
        '9,11': 'wall',
        '10,3': 'wall',
        '11,3': 'wall',
        '12,3': 'wall',
        '13,3': 'wall',
        '14,3': 'wall',
        '15,3': 'wall',
        '10,11': 'wall',
        '11,11': 'wall',
        '12,11': 'wall',
        '13,11': 'wall',
        '14,11': 'wall',
        '15,11': 'wall',
      },
      terrainCells: {
        '7,6': 'cover',
        '7,9': 'cover',
        '11,6': 'difficult',
        '11,8': 'difficult',
        '13,7': 'cover',
      },
      lootItems: [
        { id: 'loot_1', name: 'Potion of Healing', quantity: 2, category: 'equipment', desc: 'Heals 2d4 + 2 HP when consumed.' },
        { id: 'loot_2', name: 'Longsword +1', quantity: 1, category: 'magic_items', desc: '1d8+4 slashing, magical.' },
      ],
    },
    tokens: [
      { id: 'tok_thorgar', name: 'Thorgar', gridX: 6, gridY: 7, size: 1, hp: 44, maxHp: 44, ac: 18, color: '#ef4444', type: 'player', conditions: [] },
      { id: 'tok_elyndra', name: 'Elyndra', gridX: 5, gridY: 8, size: 1, hp: 28, maxHp: 28, ac: 12, color: '#3b82f6', type: 'player', conditions: ['Concentrating'] },
      { id: 'tok_roderick', name: 'Roderick', gridX: 7, gridY: 8, size: 1, hp: 35, maxHp: 35, ac: 16, color: '#10b981', type: 'player', conditions: [] },
      { id: 'tok_goblin1', name: 'Goblin Scout', gridX: 12, gridY: 6, size: 1, hp: 7, maxHp: 7, ac: 15, color: '#f97316', type: 'enemy', conditions: [] },
      { id: 'tok_goblin2', name: 'Goblin Archer', gridX: 13, gridY: 8, size: 1, hp: 7, maxHp: 7, ac: 15, color: '#f97316', type: 'enemy', conditions: [] },
    ],
    combatants: [
      { id: 'comb_thorgar', tokenId: 'tok_thorgar', name: 'Thorgar', initiative: 19, hp: 44, maxHp: 44, ac: 18, conditions: [], isPlayer: true, color: '#ef4444' },
      { id: 'comb_roderick', tokenId: 'tok_roderick', name: 'Roderick', initiative: 18, hp: 35, maxHp: 35, ac: 16, conditions: [], isPlayer: true, color: '#10b981' },
      { id: 'comb_gob1', tokenId: 'tok_goblin1', name: 'Goblin Scout', initiative: 14, hp: 7, maxHp: 7, ac: 15, conditions: [], isPlayer: false, color: '#f97316' },
      { id: 'comb_elyndra', tokenId: 'tok_elyndra', name: 'Elyndra', initiative: 11, hp: 28, maxHp: 28, ac: 12, conditions: ['Concentrating'], isPlayer: true, color: '#3b82f6' },
      { id: 'comb_gob2', tokenId: 'tok_goblin2', name: 'Goblin Archer', initiative: 9, hp: 7, maxHp: 7, ac: 15, conditions: [], isPlayer: false, color: '#f97316' },
    ],
    lootItems: [
      { id: 'loot_1', name: 'Potion of Healing', quantity: 2, category: 'equipment', desc: 'Heals 2d4 + 2 HP when consumed.' },
      { id: 'loot_2', name: 'Longsword +1', quantity: 1, category: 'magic_items', desc: '1d8+4 slashing, magical.' },
    ],
  },
  {
    id: 'enc_volcanic_sanctum',
    name: 'Volcanic Dragon Sanctum',
    description: 'Obsidian gatehouse with dual doors, lava hazards, basalt cover pillars, and an Adult Bronze Dragon.',
    updatedAt: '2026-10-18T00:00:00.000Z',
    round: 1,
    turnIndex: 0,
    mapConfig: {
      gridSize: 52,
      gridCols: 28,
      gridRows: 20,
      gridOffsetX: 0,
      gridOffsetY: 0,
      gridOpacity: 0.35,
      gridColor: '#94a3b8',
      snapToGrid: true,
      feetPerSquare: 5,
      backgroundImageUrl: 'volcanic_lair',
      backgroundName: 'Volcanic Dragon Lair',
      showGrid: true,
      mapFitMode: 'fit_grid',
      mapScaleX: 100,
      mapScaleY: 100,
      mapOffsetX: 0,
      mapOffsetY: 0,
      fogOfWarEnabled: false,
      dynamicLosEnabled: false,
      showTerrainInPlayMode: false,
      architectureCells: {
        '10,5': 'wall',
        '10,6': 'door_open',
        '10,7': 'door_open',
        '10,8': 'wall',
      },
      terrainCells: {
        '8,5': 'cover',
        '8,8': 'cover',
        '12,4': 'hazard',
        '12,9': 'hazard',
      },
      lootItems: [
        { id: 'loot_drg_1', name: 'Ring of Protection', quantity: 1, category: 'magic_items', desc: '+1 bonus to AC and saving throws while wearing this ring.' },
        { id: 'loot_drg_2', name: 'Potion of Healing', quantity: 3, category: 'equipment', desc: 'Heals 2d4 + 2 HP.' },
      ],
    },
    tokens: [
      { id: 'tok_thorgar', name: 'Thorgar', gridX: 6, gridY: 6, size: 1, hp: 44, maxHp: 44, ac: 18, color: '#ef4444', type: 'player', conditions: [] },
      { id: 'tok_elyndra', name: 'Elyndra', gridX: 5, gridY: 7, size: 1, hp: 28, maxHp: 28, ac: 12, color: '#3b82f6', type: 'player', conditions: [] },
      { id: 'tok_roderick', name: 'Roderick', gridX: 6, gridY: 8, size: 1, hp: 35, maxHp: 35, ac: 16, color: '#10b981', type: 'player', conditions: [] },
      { id: 'tok_dragon', name: 'Adult Bronze Dragon', gridX: 14, gridY: 6, size: 3, hp: 212, maxHp: 212, ac: 19, color: '#ef4444', type: 'enemy', conditions: [] },
    ],
    combatants: [
      { id: 'comb_thorgar', tokenId: 'tok_thorgar', name: 'Thorgar', initiative: 19, hp: 44, maxHp: 44, ac: 18, conditions: [], isPlayer: true, color: '#ef4444' },
      { id: 'comb_dragon', tokenId: 'tok_dragon', name: 'Adult Bronze Dragon', initiative: 16, hp: 212, maxHp: 212, ac: 19, conditions: [], isPlayer: false, color: '#ef4444' },
      { id: 'comb_roderick', tokenId: 'tok_roderick', name: 'Roderick', initiative: 14, hp: 35, maxHp: 35, ac: 16, conditions: [], isPlayer: true, color: '#10b981' },
      { id: 'comb_elyndra', tokenId: 'tok_elyndra', name: 'Elyndra', initiative: 12, hp: 28, maxHp: 28, ac: 12, conditions: [], isPlayer: true, color: '#3b82f6' },
    ],
    lootItems: [
      { id: 'loot_drg_1', name: 'Ring of Protection', quantity: 1, category: 'magic_items', desc: '+1 bonus to AC and saving throws while wearing this ring.' },
      { id: 'loot_drg_2', name: 'Potion of Healing', quantity: 3, category: 'equipment', desc: 'Heals 2d4 + 2 HP.' },
    ],
  },
];

const DEFAULT_SESSION: SessionData = {
  notes: `# Session Scratchpad\n\n- The party entered the Whispering Woods toward the Crypt of the Ash King.\n- Rumors: Corven at the tavern offered 150gp to investigate the strange lights.\n- Watch order: Thorgar first watch, Roderick second, Elyndra last.\n- Target: Find the three runic seals before midnight.`,
  round: 1,
  turnIndex: 0,
  party: DEFAULT_PARTY,
  tokens: [
    {
      id: 'tok_thorgar',
      name: 'Thorgar',
      gridX: 6,
      gridY: 7,
      size: 1,
      hp: 44,
      maxHp: 44,
      ac: 18,
      color: '#ef4444',
      type: 'player',
      conditions: []
    },
    {
      id: 'tok_elyndra',
      name: 'Elyndra',
      gridX: 5,
      gridY: 8,
      size: 1,
      hp: 28,
      maxHp: 28,
      ac: 12,
      color: '#3b82f6',
      type: 'player',
      conditions: ['Concentrating']
    },
    {
      id: 'tok_roderick',
      name: 'Roderick',
      gridX: 7,
      gridY: 8,
      size: 1,
      hp: 35,
      maxHp: 35,
      ac: 16,
      color: '#10b981',
      type: 'player',
      conditions: []
    },
    {
      id: 'tok_goblin1',
      name: 'Goblin Scout',
      gridX: 11,
      gridY: 5,
      size: 1,
      hp: 7,
      maxHp: 7,
      ac: 15,
      color: '#f97316',
      type: 'enemy',
      conditions: []
    },
    {
      id: 'tok_goblin2',
      name: 'Goblin Archer',
      gridX: 12,
      gridY: 7,
      size: 1,
      hp: 7,
      maxHp: 7,
      ac: 15,
      color: '#f97316',
      type: 'enemy',
      conditions: []
    }
  ],
  combatants: [
    { id: 'comb_thorgar', tokenId: 'tok_thorgar', name: 'Thorgar', initiative: 19, hp: 44, maxHp: 44, ac: 18, conditions: [], isPlayer: true, color: '#ef4444' },
    { id: 'comb_roderick', tokenId: 'tok_roderick', name: 'Roderick', initiative: 18, hp: 35, maxHp: 35, ac: 16, conditions: [], isPlayer: true, color: '#10b981' },
    { id: 'comb_gob1', tokenId: 'tok_goblin1', name: 'Goblin Scout', initiative: 14, hp: 7, maxHp: 7, ac: 15, conditions: [], isPlayer: false, color: '#f97316' },
    { id: 'comb_elyndra', tokenId: 'tok_elyndra', name: 'Elyndra', initiative: 11, hp: 28, maxHp: 28, ac: 12, conditions: ['Concentrating'], isPlayer: true, color: '#3b82f6' },
    { id: 'comb_gob2', tokenId: 'tok_goblin2', name: 'Goblin Archer', initiative: 9, hp: 7, maxHp: 7, ac: 15, conditions: [], isPlayer: false, color: '#f97316' },
  ],
  handouts: DEFAULT_HANDOUTS,
  activeHandoutId: 'handout_tavern',
  mapConfig: {
    gridSize: 52,
    gridCols: 28,
    gridRows: 20,
    gridOffsetX: 0,
    gridOffsetY: 0,
    gridOpacity: 0.35,
    gridColor: '#94a3b8',
    snapToGrid: true,
    feetPerSquare: 5,
    backgroundImageUrl: 'dungeon_crypt',
    backgroundName: 'Ancient Crypt Hall',
    showGrid: true,
    architectureCells: {
      '9,4': 'wall',
      '9,5': 'wall',
      '9,6': 'wall',
      '9,7': 'door_closed',
      '9,8': 'wall',
      '9,9': 'wall',
      '9,10': 'wall',
    },
    terrainCells: {
      '7,6': 'cover',
      '11,6': 'difficult',
    },
    lootItems: [
      { id: 'loot_init_1', name: 'Potion of Healing', quantity: 2, category: 'equipment', desc: 'Heals 2d4 + 2 HP.' },
    ],
  },
  savedEncounters: DEFAULT_SAVED_ENCOUNTERS,
};

export async function loadSession(): Promise<SessionData> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_STATE, 'readonly');
      const store = tx.objectStore(STORE_STATE);
      const req = store.get('current_session');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const loaded = req.result.data as SessionData;
          if (!loaded.savedEncounters || loaded.savedEncounters.length === 0) {
            loaded.savedEncounters = DEFAULT_SAVED_ENCOUNTERS;
          }
          resolve(loaded);
        } else {
          saveSession(DEFAULT_SESSION).then(() => resolve(DEFAULT_SESSION));
        }
      };
      req.onerror = () => resolve(loadSessionFromLS());
    });
  } catch {
    return loadSessionFromLS();
  }
}

function loadSessionFromLS(): SessionData {
  try {
    const raw = localStorage.getItem(LS_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionData;
      if (!parsed.savedEncounters || parsed.savedEncounters.length === 0) {
        parsed.savedEncounters = DEFAULT_SAVED_ENCOUNTERS;
      }
      return parsed;
    }
  } catch {}
  return DEFAULT_SESSION;
}

export async function saveSession(data: SessionData): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_STATE, 'readwrite');
      const store = tx.objectStore(STORE_STATE);
      store.put({ key: 'current_session', data });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}

  try {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Creates full JSON export bundle
 */
export async function createFullExport(): Promise<string> {
  const library = await loadLibrary();
  const session = await loadSession();

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    library,
    party: session.party,
    tokens: session.tokens,
    combatants: session.combatants,
    notes: session.notes,
    handouts: session.handouts,
    round: session.round,
    turnIndex: session.turnIndex,
    mapConfig: session.mapConfig,
    savedEncounters: session.savedEncounters || DEFAULT_SAVED_ENCOUNTERS,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Restores all data from JSON backup
 */
export async function restoreFromBackup(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.library && !data.party && !data.tokens) {
      return false;
    }

    if (Array.isArray(data.library)) {
      await saveAllLibraryEntries(data.library);
    }

    const session: SessionData = {
      notes: typeof data.notes === 'string' ? data.notes : DEFAULT_SESSION.notes,
      round: typeof data.round === 'number' ? data.round : 1,
      turnIndex: typeof data.turnIndex === 'number' ? data.turnIndex : 0,
      party: Array.isArray(data.party) ? data.party : DEFAULT_SESSION.party,
      tokens: Array.isArray(data.tokens) ? data.tokens : DEFAULT_SESSION.tokens,
      combatants: Array.isArray(data.combatants) ? data.combatants : DEFAULT_SESSION.combatants,
      handouts: Array.isArray(data.handouts) ? data.handouts : DEFAULT_SESSION.handouts,
      activeHandoutId: data.handouts?.[0]?.id || null,
      mapConfig: data.mapConfig || DEFAULT_SESSION.mapConfig,
      savedEncounters: Array.isArray(data.savedEncounters) ? data.savedEncounters : DEFAULT_SAVED_ENCOUNTERS,
    };

    await saveSession(session);
    return true;
  } catch (err) {
    console.error('Backup restore failed:', err);
    return false;
  }
}

export async function resetDatabaseToDefaults(): Promise<void> {
  await saveAllLibraryEntries(SEED_LIBRARY);
  await saveSession(DEFAULT_SESSION);
}
