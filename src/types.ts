export type Category = 'monsters' | 'spells' | 'items' | 'equipment' | 'magic_items' | 'races' | 'classes' | 'backgrounds' | 'feats' | 'actions' | 'rules' | 'races_classes';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface LibraryEntry {
  id: string;
  name: string;
  category: Category;
  tags: string[];
  source?: string;
  summary?: string;
  content?: string;
  stats?: {
    // Monster
    cr?: string | number;
    size?: string;
    type?: string;
    alignment?: string;
    ac?: number | string;
    hp?: number | string;
    speed?: string;
    abilities?: AbilityScores;
    traits?: Array<{ name: string; desc: string }>;
    actions?: Array<{ name: string; desc: string }>;
    // Spell
    level?: number;
    school?: string;
    castingTime?: string;
    range?: string;
    components?: string;
    duration?: string;
    // Action / Rule
    actionType?: 'Action' | 'Bonus Action' | 'Reaction' | 'Special';
    // Spell / Action Damage & Healing
    damage?: string;
    damageType?: string;
    healing?: string;
    saveType?: string;
    attackType?: string;
    areaOfEffect?: string;
    // Equipment & Magic Item
    rarity?: string;
    itemType?: string;
    attunement?: boolean;
    cost?: string;
    weight?: string;
    mastery?: string;
    properties?: string;
    // Race/Class
    subtypes?: string[];
  };
  custom?: boolean;
  pinned?: boolean;
  createdAt?: number;
}

export interface PartyMember {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  passivePerception: number;
  passiveInsight: number;
  spellSaveDc?: number;
  color: string;
  avatar?: string;
  // Full Character Sheet Attributes
  race?: string;
  alignment?: string;
  background?: string;
  speed?: number; // default 30
  hitDice?: string; // e.g. "1d10"
  hitDiceRemaining?: number;
  tempHp?: number;
  abilities?: AbilityScores;
  savingThrows?: Partial<Record<keyof AbilityScores, boolean>>;
  skills?: Record<string, boolean>;
  equipment?: Array<{ name: string; quantity: number; desc?: string }>;
  features?: Array<{ name: string; desc: string }>;
  spellcasting?: {
    spellSaveDc?: number;
    spellAttackBonus?: number;
    slotsMax?: number[];
    slotsUsed?: number[];
  };
  spells?: Array<{
    name: string;
    level: number;
    school?: string;
    desc?: string;
    damage?: string;
    damageType?: string;
    healing?: string;
    range?: string;
    castingTime?: string;
  }>;
  notes?: string;
}

export type TokenSizeType = 1 | 2 | 3 | 4; // 1 = Medium/Small (1x1), 2 = Large (2x2), 3 = Huge (3x3), 4 = Gargantuan (4x4)

export interface Token {
  id: string;
  name: string;
  gridX: number;
  gridY: number;
  size: TokenSizeType;
  hp: number;
  maxHp: number;
  ac: number;
  color: string;
  type: 'player' | 'enemy' | 'ally' | 'neutral';
  conditions: string[];
  initiative?: number;
  libraryEntryId?: string;
  // Tactical Movement & Action tracking
  speed?: number;
  dashing?: boolean;
  movementFeetUsed?: number;
  lastTurnX?: number;
  lastTurnY?: number;
}

export interface Combatant {
  id: string;
  tokenId?: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[];
  isPlayer: boolean;
  color?: string;
  libraryEntryId?: string;
}

export type AoeShape = 'sphere' | 'cone' | 'line' | 'cube' | 'circle' | 'self';

export interface CombatActionDef {
  name: string;
  type: string;
  desc: string;
  rangeFeet: number;
  aoeShape?: AoeShape;
  aoeSizeFeet?: number;
  damage?: string;
  damageType?: string;
  healing?: string;
  saveType?: string;
  libraryEntryId?: string;
}

export interface AoeOverlay {
  active: boolean;
  shape: AoeShape;
  sizeFeet: number;
  rangeFeet?: number;
  originX: number; // in grid coordinates
  originY: number;
  targetX?: number; // for cone / line direction
  targetY?: number;
  color: string;
  casterTokenId?: string;
  casterRangeFeet?: number;
  actionName?: string;
}

export interface RulerMeasurement {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  distanceFeet: number;
  straightFeet?: number;
  diagonalFeet?: number;
}

export type TerrainCellType = 'difficult' | 'cover' | 'hazard';

export type ArchitectureCellType = 'wall' | 'door_closed' | 'door_open';

export type MapLayerMode = 'tokens' | 'background' | 'architecture';

export interface EncounterLootItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  desc?: string;
  gridX?: number;
  gridY?: number;
}

export interface MapConfig {
  gridSize: number; // pixels per 5ft cell, e.g. 52
  gridCols?: number; // number of horizontal grid squares, default 28
  gridRows?: number; // number of vertical grid squares, default 20
  gridOffsetX?: number; // px offset for aligning grid lines to map image, default 0
  gridOffsetY?: number; // px offset for aligning grid lines to map image, default 0
  gridOpacity: number;
  gridColor: string;
  snapToGrid: boolean;
  feetPerSquare: number;
  backgroundImageUrl: string;
  backgroundName: string;
  showGrid: boolean;
  mapFitMode?: 'fit_grid' | 'cover' | 'contain';
  mapScaleX?: number; // percentage, default 100
  mapScaleY?: number; // percentage, default 100
  mapOffsetX?: number; // px offset, default 0
  mapOffsetY?: number; // px offset, default 0
  imageNaturalWidth?: number;
  imageNaturalHeight?: number;
  diagonalRule?: 'dnd5e' | 'standard';
  fogOfWarEnabled?: boolean;
  dynamicLosEnabled?: boolean; // when true, walls & closed doors dynamically cast Fog of War
  fogCells?: string[]; // array of "x,y" shrouded cells
  terrainCells?: Record<string, TerrainCellType>; // map of "x,y" -> terrain type
  architectureCells?: Record<string, ArchitectureCellType>; // map of "x,y" -> 'wall' | 'door_closed' | 'door_open'
  showTerrainInPlayMode?: boolean; // normally false so architecture/terrain layer is invisible during play
  lootItems?: EncounterLootItem[]; // items/treasure placed in this encounter
}

export interface SavedEncounter {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  mapConfig: MapConfig;
  tokens: Token[];
  combatants: Combatant[];
  lootItems: EncounterLootItem[];
  round: number;
  turnIndex: number;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  round: number;
  category: 'attack' | 'save' | 'heal' | 'concentration' | 'recharge' | 'turn' | 'dice' | 'rest' | 'utility';
  title: string;
  detail: string;
  outcome?: 'hit' | 'crit' | 'miss' | 'save_fail' | 'save_pass' | 'info';
}

export interface HandoutItem {
  id: string;
  title: string;
  type: 'image' | 'letter';
  content: string; // Image URL or letter parchment text
  caption?: string;
}

export interface SoundboardPad {
  id: string;
  label: string;
  soundType: 'dice' | 'sword' | 'magic' | 'roar' | 'heal' | 'thunder' | 'whisper' | 'tavern' | 'horn' | 'shield';
  category: 'combat' | 'magic' | 'ambient';
  customAudioUrl?: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  library: LibraryEntry[];
  party: PartyMember[];
  tokens: Token[];
  combatants: Combatant[];
  notes: string;
  handouts: HandoutItem[];
  round: number;
  turnIndex: number;
  mapConfig: MapConfig;
  savedEncounters?: SavedEncounter[];
}

