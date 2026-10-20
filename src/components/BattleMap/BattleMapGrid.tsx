import React, { useState, useRef, useMemo } from 'react';
import {
  Token,
  MapConfig,
  AoeOverlay,
  RulerMeasurement,
  CombatActionDef,
  TerrainCellType,
  ArchitectureCellType,
  MapLayerMode
} from '../../types.ts';
import {
  calculateDistanceFeet,
  calculateDndDistanceBreakdown,
  isTokenInRadius,
  isTokenInCone,
  isTokenInCube,
  isTokenInLine,
  checkPathObstruction,
  isCellPassable,
  computeDynamicLosFogCells
} from '../../utils/battleMath.ts';

export interface ActiveTargetingAction {
  name: string;
  actionCost: 'Action' | 'Bonus Action' | 'Reaction' | 'Free';
  rangeFeet: number;
  aoeShape?: 'circle' | 'sphere' | 'cone' | 'line' | 'cube' | 'self';
  aoeSizeFeet?: number;
  damage?: string;
  damageType?: string;
  healing?: string;
  saveType?: string;
  saveDc?: number;
  attackBonus?: number;
  rechargeMin?: number;
  spellLevel?: number;
  itemIndex?: number;
  desc?: string;
}

export type MapBrushMode =
  | 'none'
  | 'wall'
  | 'door_closed'
  | 'door_open'
  | 'fog_shroud'
  | 'fog_reveal'
  | 'difficult'
  | 'cover'
  | 'hazard'
  | 'erase_terrain';

export const BATTLEGROUND_PRESETS = [
  { id: 'dungeon_crypt', name: 'Ancient Crypt Hall', subtitle: 'Torchlit slate flagstones' },
  { id: 'forest_road', name: 'Sunlit Forest Road', subtitle: 'Emerald canopy & dirt trail' },
  { id: 'volcanic_lair', name: 'Volcanic Dragon Lair', subtitle: 'Obsidian basalt & magma veins' },
  { id: 'tavern_inn', name: 'Oak & Barrel Tavern', subtitle: 'Timber floorboards & hearth' },
  { id: 'astral_sanctum', name: 'Arcane Astral Sanctum', subtitle: 'Cosmic void & leyline sigils' },
  { id: 'frozen_pass', name: 'Frozen Mountain Pass', subtitle: 'Glacial ice & snowdrifts' },
] as const;

interface BattleMapGridProps {
  tokens: Token[];
  mapConfig: MapConfig;
  onUpdateTokens: (tokens: Token[]) => void;
  onUpdateMapConfig: (config: MapConfig) => void;
  // The token currently being "played" in the bottom BG3 HUD
  playingTokenId: string | null;
  // The token currently inspected in the right-side interaction menu
  inspectedTokenId: string | null;
  onSelectInspectedToken: (id: string | null) => void;
  // Movement budget for the currently playing token
  movementRemaining: number;
  totalSpeed: number;
  isCurrentlyDashing: boolean;
  onSpendMovement: (tokenId: string, feetSpent: number) => void;
  // Active layer, tool & targeting
  activeLayer?: MapLayerMode;
  activeTool: 'move' | 'ruler' | 'target' | 'pan' | 'brush';
  activeBrush?: MapBrushMode;
  targetingAction: ActiveTargetingAction | null;
  onExecuteTargetedAction: (targetTokenIds: string[], targetPoint: { x: number; y: number }) => void;
  onCancelTargeting: () => void;
  onToggleDoor?: (gx: number, gy: number, nextState: 'door_open' | 'door_closed') => void;
  onBlockedMovement?: (reason: string) => void;
  zoom: number;
  onChangeZoom: (nextZoom: number) => void;
  pan: { x: number; y: number };
  onChangePan: (nextPan: { x: number; y: number }) => void;
  activeTurnTokenId?: string | null;
}

export const CORE_COMBAT_ACTIONS: CombatActionDef[] = [
  {
    name: 'Attack',
    type: 'Action',
    desc: 'Make a melee or ranged weapon attack against a target within reach or range.',
    rangeFeet: 5,
    aoeShape: 'circle',
    aoeSizeFeet: 5,
    damage: '1d8 + 3',
    damageType: 'Slashing',
  },
  {
    name: 'Dash',
    type: 'Action',
    desc: 'Gain extra movement for the current turn equal to your speed.',
    rangeFeet: 0,
    aoeShape: 'self',
    aoeSizeFeet: 0,
  },
  {
    name: 'Disengage',
    type: 'Action',
    desc: 'Your movement does not provoke opportunity attacks for the rest of the turn.',
    rangeFeet: 0,
    aoeShape: 'self',
    aoeSizeFeet: 0,
  },
  {
    name: 'Dodge',
    type: 'Action',
    desc: 'Attackers have disadvantage against you; advantage on DEX saving throws.',
    rangeFeet: 0,
    aoeShape: 'self',
    aoeSizeFeet: 0,
  },
  {
    name: 'Help',
    type: 'Action',
    desc: 'Assist an ally within 5 ft to give advantage on their next ability check or attack roll.',
    rangeFeet: 5,
    aoeShape: 'circle',
    aoeSizeFeet: 5,
  },
  {
    name: 'Hide',
    type: 'Action',
    desc: 'Make a Dexterity (Stealth) check in an attempt to become Hidden.',
    rangeFeet: 0,
    aoeShape: 'self',
    aoeSizeFeet: 0,
  },
  {
    name: 'Ready',
    type: 'Action',
    desc: 'Prepare an action with a defined trigger to execute using your Reaction.',
    rangeFeet: 0,
    aoeShape: 'self',
    aoeSizeFeet: 0,
  },
  {
    name: 'Search',
    type: 'Action',
    desc: 'Devote your attention to finding something (Wisdom Perception or Intelligence Investigation).',
    rangeFeet: 30,
    aoeShape: 'circle',
    aoeSizeFeet: 10,
  },
  {
    name: 'Fireball',
    type: 'Action',
    desc: 'Bright streak flashes to a point within 150 ft and blossoms into a 20-ft radius sphere.',
    rangeFeet: 150,
    aoeShape: 'sphere',
    aoeSizeFeet: 20,
    damage: '8d6',
    damageType: 'Fire',
    saveType: 'DEX Save',
  },
  {
    name: 'Burning Hands',
    type: 'Action',
    desc: 'Thin sheet of flames erupts from fingertips in a 15-ft cone from the caster.',
    rangeFeet: 15,
    aoeShape: 'cone',
    aoeSizeFeet: 15,
    damage: '3d6',
    damageType: 'Fire',
    saveType: 'DEX Save',
  },
  {
    name: 'Cone of Cold',
    type: 'Action',
    desc: 'A blast of cold air erupts from your hands in a 60-ft cone from the caster.',
    rangeFeet: 60,
    aoeShape: 'cone',
    aoeSizeFeet: 60,
    damage: '8d8',
    damageType: 'Cold',
    saveType: 'CON Save',
  },
  {
    name: 'Lightning Bolt',
    type: 'Action',
    desc: 'A stroke of lightning forming a line 100 ft long and 5 ft wide blasts from the caster.',
    rangeFeet: 100,
    aoeShape: 'line',
    aoeSizeFeet: 100,
    damage: '8d6',
    damageType: 'Lightning',
    saveType: 'DEX Save',
  },
  {
    name: 'Thunderwave',
    type: 'Action',
    desc: 'A wave of thunderous force sweeps out in a 15-ft cube originating from you.',
    rangeFeet: 15,
    aoeShape: 'cube',
    aoeSizeFeet: 15,
    damage: '2d8',
    damageType: 'Thunder',
    saveType: 'CON Save',
  },
  {
    name: 'Cure Wounds',
    type: 'Action',
    desc: 'A creature you touch regains hit points equal to 1d8 + spellcasting modifier.',
    rangeFeet: 5,
    aoeShape: 'circle',
    aoeSizeFeet: 5,
    healing: '1d8 + 3',
  },
  {
    name: 'Healing Word',
    type: 'Bonus Action',
    desc: 'A creature of your choice that you can see within 60 ft regains hit points.',
    rangeFeet: 60,
    aoeShape: 'circle',
    aoeSizeFeet: 5,
    healing: '1d4 + 3',
  },
];

export const BattleMapGrid: React.FC<BattleMapGridProps> = ({
  tokens,
  mapConfig,
  onUpdateTokens,
  onUpdateMapConfig,
  playingTokenId,
  inspectedTokenId,
  onSelectInspectedToken,
  movementRemaining,
  totalSpeed,
  isCurrentlyDashing,
  onSpendMovement,
  activeLayer = 'tokens',
  activeTool,
  activeBrush = 'none',
  targetingAction,
  onExecuteTargetedAction,
  onCancelTargeting,
  onToggleDoor,
  onBlockedMovement,
  zoom,
  onChangeZoom,
  pan,
  onChangePan,
  activeTurnTokenId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingBackground, setIsDraggingBackground] = useState(false);
  const [bgDragStart, setBgDragStart] = useState<{
    clientX: number;
    clientY: number;
    origMapX: number;
    origMapY: number;
    origGridX: number;
    origGridY: number;
    moveGridInstead: boolean;
  } | null>(null);
  const [isPaintingBrush, setIsPaintingBrush] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredGridCell, setHoveredGridCell] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPixelPoint, setHoveredPixelPoint] = useState<{ x: number; y: number } | null>(null);
  const pointerDownPosRef = useRef<{ clientX: number; clientY: number; gridX: number; gridY: number } | null>(null);

  // Dragging token state
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [dragOriginCoords, setDragOriginCoords] = useState<{ x: number; y: number } | null>(null);

  // 5ft Ruler state
  const [ruler, setRuler] = useState<RulerMeasurement>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    distanceFeet: 0,
  });

  // Grid dimensions (configurable via mapConfig, defaults to 28x20)
  const gridCols = Math.max(6, Math.min(80, mapConfig.gridCols || 28));
  const gridRows = Math.max(6, Math.min(80, mapConfig.gridRows || 20));
  const cellSize = mapConfig.gridSize || 52;
  const gridOffsetX = mapConfig.gridOffsetX || 0;
  const gridOffsetY = mapConfig.gridOffsetY || 0;
  const gridWidth = gridCols * cellSize;
  const gridHeight = gridRows * cellSize;

  const playingToken = useMemo(
    () => tokens.find(t => t.id === playingTokenId) || null,
    [tokens, playingTokenId]
  );

  const terrainMap = useMemo(() => mapConfig.terrainCells || {}, [mapConfig.terrainCells]);
  const architectureMap = useMemo(() => mapConfig.architectureCells || {}, [mapConfig.architectureCells]);

  // Dynamic + Manual Fog of War calculation
  // When walls or closed doors exist and fogOfWarEnabled (or dynamicLosEnabled) is active,
  // compute Line-of-Sight raycast shadows from player tokens (or playingToken) so walls and closed doors obstruct vision!
  const effectiveFogCells = useMemo(() => {
    const manualSet = new Set(mapConfig.fogCells || []);
    const hasArchitecture = Object.keys(architectureMap).length > 0;
    if (mapConfig.dynamicLosEnabled || (mapConfig.fogOfWarEnabled && hasArchitecture)) {
      const observers = tokens.filter(t => t.type === 'player');
      const activeObservers = observers.length > 0 ? observers : playingToken ? [playingToken] : [];
      if (activeObservers.length > 0) {
        const losFog = computeDynamicLosFogCells(gridCols, gridRows, activeObservers, architectureMap, 24);
        for (const c of losFog) {
          manualSet.add(c);
        }
      }
    }
    return Array.from(manualSet);
  }, [mapConfig.fogCells, mapConfig.fogOfWarEnabled, mapConfig.dynamicLosEnabled, architectureMap, tokens, playingToken, gridCols, gridRows]);

  const fogSet = useMemo(() => new Set(effectiveFogCells), [effectiveFogCells]);

  // Apply brush to a grid cell (x, y) in Architecture / Terrain / Fog authoring mode
  const applyBrushAtCell = (gx: number, gy: number) => {
    const key = `${gx},${gy}`;
    if (activeBrush === 'wall' || activeBrush === 'door_closed' || activeBrush === 'door_open') {
      if (architectureMap[key] !== activeBrush) {
        onUpdateMapConfig({
          ...mapConfig,
          // Automatically enable dynamic LOS fog when drawing walls or closed doors
          fogOfWarEnabled: mapConfig.fogOfWarEnabled ?? true,
          dynamicLosEnabled: mapConfig.dynamicLosEnabled ?? true,
          architectureCells: { ...architectureMap, [key]: activeBrush as ArchitectureCellType },
        });
      }
    } else if (activeBrush === 'fog_shroud') {
      if (!(mapConfig.fogCells || []).includes(key)) {
        onUpdateMapConfig({
          ...mapConfig,
          fogOfWarEnabled: true,
          fogCells: [...(mapConfig.fogCells || []), key],
        });
      }
    } else if (activeBrush === 'fog_reveal') {
      if ((mapConfig.fogCells || []).includes(key)) {
        onUpdateMapConfig({
          ...mapConfig,
          fogCells: (mapConfig.fogCells || []).filter(k => k !== key),
        });
      }
    } else if (activeBrush === 'difficult' || activeBrush === 'cover' || activeBrush === 'hazard') {
      if (terrainMap[key] !== activeBrush) {
        onUpdateMapConfig({
          ...mapConfig,
          terrainCells: { ...terrainMap, [key]: activeBrush as TerrainCellType },
        });
      }
    } else if (activeBrush === 'erase_terrain') {
      if (terrainMap[key] || architectureMap[key]) {
        const nextTerrain = { ...terrainMap };
        const nextArch = { ...architectureMap };
        delete nextTerrain[key];
        delete nextArch[key];
        onUpdateMapConfig({
          ...mapConfig,
          terrainCells: nextTerrain,
          architectureCells: nextArch,
        });
      }
    }
  };

  // Dynamic AoE overlay computed from playingToken + targetingAction + hovered cursor
  const aoe = useMemo<AoeOverlay>(() => {
    const originX = playingToken ? playingToken.gridX + playingToken.size / 2 : 8;
    const originY = playingToken ? playingToken.gridY + playingToken.size / 2 : 8;
    const targetX = hoveredPixelPoint ? hoveredPixelPoint.x / cellSize : originX + 3;
    const targetY = hoveredPixelPoint ? hoveredPixelPoint.y / cellSize : originY;

    if (!targetingAction || activeTool !== 'target') {
      return {
        active: false,
        shape: 'sphere',
        sizeFeet: 5,
        originX,
        originY,
        targetX,
        targetY,
        color: '#ef4444',
      };
    }

    return {
      active: true,
      shape: (targetingAction.aoeShape || 'circle') as any,
      sizeFeet: targetingAction.aoeSizeFeet || 5,
      rangeFeet: targetingAction.rangeFeet || 5,
      originX,
      originY,
      targetX,
      targetY,
      color: targetingAction.healing ? '#10b981' : '#ef4444',
      casterTokenId: playingToken?.id,
    };
  }, [playingToken, targetingAction, activeTool, hoveredPixelPoint, cellSize]);

  // Determine affected tokens by current AoE / target hover
  const affectedTokens = useMemo(() => {
    if (!aoe.active || activeTool !== 'target') return new Set<string>();

    const affected = new Set<string>();
    const casterX = aoe.originX;
    const casterY = aoe.originY;
    const targetX = aoe.targetX ?? casterX;
    const targetY = aoe.targetY ?? casterY;

    tokens.forEach(tok => {
      let isInside = false;
      if (aoe.shape === 'self') {
        isInside = tok.id === playingToken?.id;
      } else if (aoe.shape === 'sphere' || aoe.shape === 'circle') {
        isInside = isTokenInRadius(
          tok,
          { x: targetX, y: targetY },
          Math.max(2.5, aoe.sizeFeet),
          mapConfig.feetPerSquare
        );
      } else if (aoe.shape === 'cone') {
        if (tok.id === playingToken?.id) return;
        isInside = isTokenInCone(
          tok,
          { x: casterX, y: casterY },
          { x: targetX, y: targetY },
          aoe.sizeFeet,
          mapConfig.feetPerSquare,
          53
        );
      } else if (aoe.shape === 'line') {
        if (tok.id === playingToken?.id) return;
        isInside = isTokenInLine(
          tok,
          { x: casterX, y: casterY },
          { x: targetX, y: targetY },
          aoe.sizeFeet,
          5,
          mapConfig.feetPerSquare
        );
      } else if (aoe.shape === 'cube') {
        isInside = isTokenInCube(
          tok,
          { x: targetX, y: targetY },
          aoe.sizeFeet,
          mapConfig.feetPerSquare
        );
      }
      if (isInside) {
        affected.add(tok.id);
      }
    });
    return affected;
  }, [tokens, aoe, activeTool, mapConfig.feetPerSquare, playingToken]);

  const getGridCoordsFromPointer = (e: React.PointerEvent) => {
    if (!containerRef.current) return { pixelX: 0, pixelY: 0, gridX: 0, gridY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const pixelX = (e.clientX - rect.left - pan.x) / zoom - gridOffsetX;
    const pixelY = (e.clientY - rect.top - pan.y) / zoom - gridOffsetY;
    return {
      pixelX,
      pixelY,
      gridX: Math.max(0, Math.min(gridCols - 1, Math.floor(pixelX / cellSize))),
      gridY: Math.max(0, Math.min(gridRows - 1, Math.floor(pixelY / cellSize))),
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Right-click cancels targeting
    if (e.button === 2 && activeTool === 'target') {
      e.preventDefault();
      onCancelTargeting();
      return;
    }

    if (e.button === 1 || activeTool === 'pan') {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    // BACKGROUND LAYER: Left-drag directly moves the background image (or Shift+drag moves the grid offset)
    if (activeLayer === 'background' && e.button === 0 && activeTool !== 'ruler') {
      e.preventDefault();
      setIsDraggingBackground(true);
      setBgDragStart({
        clientX: e.clientX,
        clientY: e.clientY,
        origMapX: mapConfig.mapOffsetX || 0,
        origMapY: mapConfig.mapOffsetY || 0,
        origGridX: mapConfig.gridOffsetX || 0,
        origGridY: mapConfig.gridOffsetY || 0,
        moveGridInstead: e.shiftKey,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    const { gridX, gridY } = getGridCoordsFromPointer(e);

    // ARCHITECTURE LAYER or active brush tool: paint walls, doors, terrain, or fog
    if ((activeLayer === 'architecture' || activeTool === 'brush') && activeBrush !== 'none' && e.button === 0) {
      e.preventDefault();
      setIsPaintingBrush(true);
      applyBrushAtCell(gridX, gridY);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    pointerDownPosRef.current = { clientX: e.clientX, clientY: e.clientY, gridX, gridY };

    if (activeTool === 'ruler') {
      setRuler({
        active: true,
        startX: gridX,
        startY: gridY,
        currentX: gridX,
        currentY: gridY,
        distanceFeet: 0,
      });
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    if (e.button === 0) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { gridX, gridY, pixelX, pixelY } = getGridCoordsFromPointer(e);
    setHoveredGridCell({ x: gridX, y: gridY });
    setHoveredPixelPoint({ x: pixelX, y: pixelY });

    // Moving background image or grid offset in 'background' layer
    if (isDraggingBackground && bgDragStart) {
      const dx = Math.round((e.clientX - bgDragStart.clientX) / zoom);
      const dy = Math.round((e.clientY - bgDragStart.clientY) / zoom);
      if (bgDragStart.moveGridInstead) {
        onUpdateMapConfig({
          ...mapConfig,
          gridOffsetX: bgDragStart.origGridX + dx,
          gridOffsetY: bgDragStart.origGridY + dy,
        });
      } else {
        onUpdateMapConfig({
          ...mapConfig,
          mapOffsetX: bgDragStart.origMapX + dx,
          mapOffsetY: bgDragStart.origMapY + dy,
        });
      }
      return;
    }

    if (isPaintingBrush && (activeLayer === 'architecture' || activeTool === 'brush') && activeBrush !== 'none') {
      applyBrushAtCell(gridX, gridY);
      return;
    }

    if (isPanning) {
      onChangePan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (pointerDownPosRef.current && !draggingTokenId && activeTool !== 'ruler' && activeTool !== 'brush' && activeLayer === 'tokens') {
      const dragDist = Math.hypot(
        e.clientX - pointerDownPosRef.current.clientX,
        e.clientY - pointerDownPosRef.current.clientY
      );
      if (dragDist > 8) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }
    }

    if (activeTool === 'ruler' && ruler.active) {
      const dist = calculateDistanceFeet(
        { x: ruler.startX, y: ruler.startY },
        { x: gridX, y: gridY },
        mapConfig.feetPerSquare
      );
      setRuler(prev => ({
        ...prev,
        currentX: gridX,
        currentY: gridY,
        distanceFeet: dist,
      }));
      return;
    }

    if (draggingTokenId) {
      const newTokens = tokens.map(t => {
        if (t.id === draggingTokenId) {
          const clampedX = Math.max(0, Math.min(gridCols - t.size, gridX));
          const clampedY = Math.max(0, Math.min(gridRows - t.size, gridY));

          // Prevent dragging token into a solid wall or closed door
          if (!isCellPassable(clampedX, clampedY, architectureMap)) {
            return t;
          }

          if (dragOriginCoords && (dragOriginCoords.x !== clampedX || dragOriginCoords.y !== clampedY)) {
            const obs = checkPathObstruction(dragOriginCoords, { x: clampedX, y: clampedY }, architectureMap);
            if (obs.obstructed) {
              return t;
            }
            const baseDist = calculateDistanceFeet(
              dragOriginCoords,
              { x: clampedX, y: clampedY },
              mapConfig.feetPerSquare
            );
            const isDiffTerrain = terrainMap[`${clampedX},${clampedY}`] === 'difficult';
            const movedDist = isDiffTerrain ? baseDist * 2 : baseDist;
            onSpendMovement(t.id, movedDist);
            setDragOriginCoords({ x: clampedX, y: clampedY });
          }

          return {
            ...t,
            gridX: clampedX,
            gridY: clampedY,
          };
        }
        return t;
      });
      onUpdateTokens(newTokens);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (isDraggingBackground) {
      setIsDraggingBackground(false);
      setBgDragStart(null);
      pointerDownPosRef.current = null;
      return;
    }

    if (isPaintingBrush) {
      setIsPaintingBrush(false);
      pointerDownPosRef.current = null;
      return;
    }

    if (isPanning) {
      setIsPanning(false);
      pointerDownPosRef.current = null;
      return;
    }

    if (activeTool === 'ruler' && ruler.active) {
      setRuler(prev => ({ ...prev, active: false }));
      pointerDownPosRef.current = null;
      return;
    }

    const { gridX, gridY } = getGridCoordsFromPointer(e);

    if (pointerDownPosRef.current) {
      const moveDistancePx = Math.hypot(
        e.clientX - pointerDownPosRef.current.clientX,
        e.clientY - pointerDownPosRef.current.clientY
      );

      if (moveDistancePx < 8) {
        const cellKey = `${gridX},${gridY}`;
        const archAtCell = architectureMap[cellKey];

        // 0. If clicking a Door cell in Tokens/Play mode (or Architecture mode without a brush), toggle Door Open / Closed!
        if (
          (archAtCell === 'door_closed' || archAtCell === 'door_open') &&
          activeTool !== 'target' &&
          (activeLayer === 'tokens' || activeBrush === 'none')
        ) {
          const nextDoorState = archAtCell === 'door_closed' ? 'door_open' : 'door_closed';
          onUpdateMapConfig({
            ...mapConfig,
            architectureCells: {
              ...architectureMap,
              [cellKey]: nextDoorState,
            },
          });
          onToggleDoor?.(gridX, gridY, nextDoorState);
          pointerDownPosRef.current = null;
          return;
        }

        // 1. If in Target / Cast mode -> execute action on affected tokens
        if (activeTool === 'target' && targetingAction) {
          onExecuteTargetedAction(Array.from(affectedTokens), { x: gridX, y: gridY });
          pointerDownPosRef.current = null;
          return;
        }

        // 2. If in Move mode with a playingToken -> Click-to-Move within movement budget (respecting Walls & Closed Doors!)
        if (activeLayer === 'tokens' && activeTool === 'move' && playingToken && !draggingTokenId) {
          const baseDistFeet = calculateDistanceFeet(
            { x: playingToken.gridX, y: playingToken.gridY },
            { x: gridX, y: gridY },
            mapConfig.feetPerSquare
          );
          const isDiffTerrain = terrainMap[`${gridX},${gridY}`] === 'difficult';
          const distFeet = isDiffTerrain ? baseDistFeet + 5 : baseDistFeet;

          // Check if another token occupies that exact square
          const clickedToken = tokens.find(
            t =>
              gridX >= t.gridX &&
              gridX < t.gridX + t.size &&
              gridY >= t.gridY &&
              gridY < t.gridY + t.size
          );

          if (clickedToken) {
            onSelectInspectedToken(clickedToken.id);
          } else if (distFeet > 0 && distFeet <= movementRemaining) {
            const clampedX = Math.max(0, Math.min(gridCols - playingToken.size, gridX));
            const clampedY = Math.max(0, Math.min(gridRows - playingToken.size, gridY));

            const obstruction = checkPathObstruction(
              { x: playingToken.gridX, y: playingToken.gridY },
              { x: clampedX, y: clampedY },
              architectureMap
            );

            if (obstruction.obstructed) {
              onBlockedMovement?.(
                obstruction.blockerType === 'door_closed'
                  ? `Path blocked by a Closed Door at (${obstruction.blockerCoord}) — click the door to open it first!`
                  : `Path obstructed by a Wall at (${obstruction.blockerCoord})!`
              );
            } else {
              const nextTokens = tokens.map(t =>
                t.id === playingToken.id ? { ...t, gridX: clampedX, gridY: clampedY } : t
              );
              onUpdateTokens(nextTokens);
              onSpendMovement(playingToken.id, distFeet);
            }
          }
        }
      }
    }

    if (draggingTokenId) {
      setDraggingTokenId(null);
      setDragOriginCoords(null);
    }
    pointerDownPosRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // In Background Layer (without Ctrl/Alt), mouse wheel scales the background image so you can match its grid!
    if (activeLayer === 'background' && !e.ctrlKey && !e.metaKey) {
      const deltaScale = e.deltaY < 0 ? 1 : -1;
      const nextScaleX = Math.max(25, Math.min(300, (mapConfig.mapScaleX ?? 100) + deltaScale));
      const nextScaleY = Math.max(25, Math.min(300, (mapConfig.mapScaleY ?? 100) + deltaScale));
      onUpdateMapConfig({
        ...mapConfig,
        mapScaleX: nextScaleX,
        mapScaleY: nextScaleY,
      });
      return;
    }
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    onChangeZoom(Math.max(0.45, Math.min(2.6, zoom * factor)));
  };

  const handleTokenPointerDown = (e: React.PointerEvent, token: Token) => {
    // In Background or Architecture authoring layer, let pointer events pass through to the layer canvas
    if (activeLayer !== 'tokens') return;

    e.stopPropagation();

    // If we are in targeting mode, clicking a token executes the targeted action on it!
    if (activeTool === 'target' && targetingAction) {
      const targets = affectedTokens.size > 0 ? Array.from(affectedTokens) : [token.id];
      if (!targets.includes(token.id)) targets.push(token.id);
      onExecuteTargetedAction(targets, { x: token.gridX, y: token.gridY });
      return;
    }

    // Select token for right-hand inspection menu
    onSelectInspectedToken(token.id);

    // Allow dragging if it's the playing token (or DM repositioning any token)
    if (e.button === 0 && activeTool !== 'brush') {
      setDraggingTokenId(token.id);
      setDragOriginCoords({ x: token.gridX, y: token.gridY });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const rulerBreakdown = useMemo(() => {
    if (!ruler.active) return '';
    const breakdown = calculateDndDistanceBreakdown(
      { x: ruler.startX, y: ruler.startY },
      { x: ruler.currentX, y: ruler.currentY },
      mapConfig.feetPerSquare
    );
    return `${breakdown.totalFeet} ft`;
  }, [ruler, mapConfig.feetPerSquare]);

  // Render procedural battleground preset or uploaded image
  const renderBattlegroundBackdrop = () => {
    const preset = mapConfig.backgroundImageUrl || 'dungeon_crypt';

    if (
      preset.startsWith('data:image') ||
      preset.startsWith('http://') ||
      preset.startsWith('https://')
    ) {
      const fitMode = mapConfig.mapFitMode || 'fit_grid';
      const objectFitClass =
        fitMode === 'fit_grid'
          ? 'object-fill'
          : fitMode === 'contain'
          ? 'object-contain'
          : 'object-cover';

      return (
        <img
          src={preset}
          alt={mapConfig.backgroundName || 'Encounter Battleground'}
          referrerPolicy="no-referrer"
          onLoad={e => {
            const imgEl = e.currentTarget;
            if (
              imgEl.naturalWidth > 0 &&
              imgEl.naturalHeight > 0 &&
              (mapConfig.imageNaturalWidth !== imgEl.naturalWidth ||
                mapConfig.imageNaturalHeight !== imgEl.naturalHeight)
            ) {
              onUpdateMapConfig({
                ...mapConfig,
                imageNaturalWidth: imgEl.naturalWidth,
                imageNaturalHeight: imgEl.naturalHeight,
              });
            }
          }}
          className={`w-full h-full ${objectFitClass} select-none pointer-events-none`}
        />
      );
    }

    if (preset === 'forest_road') {
      return (
        <div
          className="w-full h-full relative"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #143321 0%, #091c12 100%)',
          }}
        >
          <svg width="100%" height="100%" className="opacity-55">
            {/* Winding dirt road across clearing */}
            <path
              d={`M 0,${gridHeight * 0.55} Q ${gridWidth * 0.35},${gridHeight * 0.35} ${gridWidth * 0.65},${gridHeight * 0.55} T ${gridWidth},${gridHeight * 0.45}`}
              fill="none"
              stroke="#45301c"
              strokeWidth={cellSize * 2.8}
              strokeLinecap="round"
            />
            <path
              d={`M 0,${gridHeight * 0.55} Q ${gridWidth * 0.35},${gridHeight * 0.35} ${gridWidth * 0.65},${gridHeight * 0.55} T ${gridWidth},${gridHeight * 0.45}`}
              fill="none"
              stroke="#5c4028"
              strokeWidth={cellSize * 1.8}
              strokeDasharray="18 12"
            />
            {/* Forest Canopy Clusters */}
            {[
              [3, 3, 72],
              [8, 2, 64],
              [19, 3, 85],
              [24, 4, 70],
              [4, 15, 80],
              [13, 16, 68],
              [22, 15, 88],
            ].map(([cx, cy, r], i) => (
              <g key={i}>
                <circle cx={cx * cellSize} cy={cy * cellSize} r={r} fill="#0d291a" stroke="#1e4d32" strokeWidth="3" />
                <circle cx={cx * cellSize - 12} cy={cy * cellSize - 10} r={r * 0.65} fill="#153d26" />
              </g>
            ))}
          </svg>
        </div>
      );
    }

    if (preset === 'volcanic_lair') {
      return (
        <div
          className="w-full h-full relative"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #2a0f0c 0%, #0f0606 100%)',
          }}
        >
          <svg width="100%" height="100%" className="opacity-65">
            {/* Glowing Magma Rivers */}
            <path
              d={`M ${cellSize * 2},0 Q ${gridWidth * 0.3},${gridHeight * 0.5} ${cellSize * 6},${gridHeight}`}
              fill="none"
              stroke="#ea580c"
              strokeWidth={cellSize * 1.1}
            />
            <path
              d={`M ${cellSize * 2},0 Q ${gridWidth * 0.3},${gridHeight * 0.5} ${cellSize * 6},${gridHeight}`}
              fill="none"
              stroke="#fde047"
              strokeWidth={cellSize * 0.35}
              strokeDasharray="14 8"
            />
            <path
              d={`M ${gridWidth - cellSize * 4},0 Q ${gridWidth * 0.72},${gridHeight * 0.55} ${gridWidth - cellSize * 3},${gridHeight}`}
              fill="none"
              stroke="#ea580c"
              strokeWidth={cellSize * 1.2}
            />
            <circle
              cx={gridWidth * 0.5}
              cy={gridHeight * 0.5}
              r={cellSize * 3.5}
              fill="none"
              stroke="#f97316"
              strokeWidth="3"
              strokeDasharray="10 6"
            />
          </svg>
        </div>
      );
    }

    if (preset === 'tavern_inn') {
      return (
        <div
          className="w-full h-full relative"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #2e1d11 0%, #170d07 100%)',
          }}
        >
          <svg width="100%" height="100%" className="opacity-45">
            <defs>
              <pattern id="tavernPlanks" width={cellSize * 2} height={cellSize} patternUnits="userSpaceOnUse">
                <rect width={cellSize * 2} height={cellSize} fill="#29190e" />
                <path
                  d={`M 0,0 L ${cellSize * 2},0 M 0,${cellSize / 2} L ${cellSize * 2},${cellSize / 2} M ${cellSize},0 L ${cellSize},${cellSize / 2} M ${cellSize / 2},${cellSize / 2} L ${cellSize / 2},${cellSize}`}
                  stroke="#3d2616"
                  strokeWidth="2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tavernPlanks)" />
            {/* Tavern Tables & Hearth */}
            {[
              [6, 5],
              [12, 5],
              [18, 5],
              [6, 12],
              [12, 12],
              [18, 12],
            ].map(([tx, ty], i) => (
              <rect
                key={i}
                x={tx * cellSize}
                y={ty * cellSize}
                width={cellSize * 2}
                height={cellSize * 2}
                rx="10"
                fill="#4a2c18"
                stroke="#784727"
                strokeWidth="2.5"
              />
            ))}
          </svg>
        </div>
      );
    }

    if (preset === 'astral_sanctum') {
      return (
        <div
          className="w-full h-full relative"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #090617 100%)',
          }}
        >
          <svg width="100%" height="100%" className="opacity-55">
            <circle
              cx={gridWidth / 2}
              cy={gridHeight / 2}
              r={cellSize * 5}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
            />
            <circle
              cx={gridWidth / 2}
              cy={gridHeight / 2}
              r={cellSize * 3.5}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            <polygon
              points={`${gridWidth / 2},${gridHeight / 2 - cellSize * 4.5} ${gridWidth / 2 + cellSize * 4},${gridHeight / 2 + cellSize * 2.5} ${gridWidth / 2 - cellSize * 4},${gridHeight / 2 + cellSize * 2.5}`}
              fill="none"
              stroke="#818cf8"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      );
    }

    if (preset === 'frozen_pass') {
      return (
        <div
          className="w-full h-full relative"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #163047 0%, #081524 100%)',
          }}
        >
          <svg width="100%" height="100%" className="opacity-50">
            <path
              d={`M 0,${gridHeight * 0.3} L ${gridWidth * 0.4},${gridHeight * 0.5} L ${gridWidth * 0.7},${gridHeight * 0.35} L ${gridWidth},${gridHeight * 0.6}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
            />
            <path
              d={`M ${gridWidth * 0.2},0 L ${gridWidth * 0.45},${gridHeight}`}
              fill="none"
              stroke="#7dd3fc"
              strokeWidth="2.5"
              strokeDasharray="10 6"
            />
          </svg>
        </div>
      );
    }

    // Default: Ancient Crypt Hall (dungeon_crypt)
    return (
      <div
        className="w-full h-full"
        style={{
          backgroundColor: '#0c1322',
          backgroundImage: `
            radial-gradient(circle at 50% 45%, rgba(30, 41, 59, 0.88), rgba(9, 13, 24, 0.98)),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 0, transparent 52px)
          `,
        }}
      >
        <svg width="100%" height="100%" className="opacity-35">
          <defs>
            <pattern id="bg3StoneTile" width={cellSize * 2} height={cellSize * 2} patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width={cellSize * 2} height={cellSize * 2} fill="#162032" />
              <path
                d={`M 0,0 L ${cellSize * 2},0 M 0,${cellSize} L ${cellSize * 2},${cellSize} M 0,${cellSize * 2} L ${cellSize * 2},${cellSize * 2} M ${cellSize},0 L ${cellSize},${cellSize * 2}`}
                stroke="#293548"
                strokeWidth="1.5"
              />
              <circle cx={cellSize} cy={cellSize} r="2.5" fill="#334155" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg3StoneTile)" />
        </svg>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={e => {
        if (activeTool === 'target') {
          e.preventDefault();
          onCancelTargeting();
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
      className={`w-full h-full bg-slate-950 relative overflow-hidden select-none ${
        activeTool === 'target' || activeTool === 'brush'
          ? 'cursor-crosshair'
          : activeTool === 'pan' || isPanning
          ? 'cursor-grabbing'
          : 'cursor-default'
      }`}
    >
      {/* Transformable Map Stage */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
        }}
        className="absolute left-6 top-6 transition-transform duration-75"
      >
        {/* Dungeon Floor / Map Backdrop */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-900">
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: `translate(${mapConfig.mapOffsetX || 0}px, ${mapConfig.mapOffsetY || 0}px) scale(${(mapConfig.mapScaleX ?? 100) / 100}, ${(mapConfig.mapScaleY ?? 100) / 100})`,
              transformOrigin: 'center center',
            }}
            className="w-full h-full transition-transform duration-150"
          >
            {renderBattlegroundBackdrop()}
          </div>
        </div>

        {/* 5ft Tactical Grid Lines (Supports gridOffsetX & gridOffsetY for lining up with map image grids!) */}
        <svg width={gridWidth} height={gridHeight} className="absolute inset-0 pointer-events-none">
          <defs>
            <pattern
              id="encounterGridPattern"
              x={gridOffsetX}
              y={gridOffsetY}
              width={cellSize}
              height={cellSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                fill="none"
                stroke={activeLayer === 'background' ? '#fbbf24' : mapConfig.gridColor || '#94a3b8'}
                strokeWidth={activeLayer === 'background' ? '1.5' : '1'}
                strokeOpacity={
                  activeLayer === 'background'
                    ? Math.max(0.65, mapConfig.gridOpacity ?? 0.35)
                    : mapConfig.showGrid !== false
                    ? mapConfig.gridOpacity ?? 0.35
                    : 0
                }
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#encounterGridPattern)" />
        </svg>

        {/* ====================================================================
            LAYER 2: ARCHITECTURE (WALLS & DOORS) & TERRAIN LAYER
            Normally invisible during Play ('tokens') mode except for interactive Doors
            (or if showTerrainInPlayMode is enabled). Fully visible in 'architecture' layer!
        ==================================================================== */}
        {(activeLayer === 'architecture' || mapConfig.showTerrainInPlayMode) &&
          Object.keys(terrainMap).length > 0 && (
            <svg width={gridWidth} height={gridHeight} className="absolute inset-0 pointer-events-none z-5">
              {Object.entries(terrainMap).map(([coord, tType]) => {
                const [gx, gy] = coord.split(',').map(Number);
                if (isNaN(gx) || isNaN(gy)) return null;
                const px = gx * cellSize + gridOffsetX;
                const py = gy * cellSize + gridOffsetY;
                if (tType === 'difficult') {
                  return (
                    <g key={coord}>
                      <rect
                        x={px + 2}
                        y={py + 2}
                        width={cellSize - 4}
                        height={cellSize - 4}
                        rx="6"
                        fill="rgba(245, 158, 11, 0.22)"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <text
                        x={px + cellSize / 2}
                        y={py + cellSize - 6}
                        textAnchor="middle"
                        fill="#fbbf24"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        2x MOVE
                      </text>
                    </g>
                  );
                }
                if (tType === 'cover') {
                  return (
                    <g key={coord}>
                      <rect
                        x={px + 2}
                        y={py + 2}
                        width={cellSize - 4}
                        height={cellSize - 4}
                        rx="6"
                        fill="rgba(56, 189, 248, 0.22)"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                      />
                      <text
                        x={px + cellSize / 2}
                        y={py + cellSize - 6}
                        textAnchor="middle"
                        fill="#7dd3fc"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        +2 AC
                      </text>
                    </g>
                  );
                }
                if (tType === 'hazard') {
                  return (
                    <g key={coord}>
                      <rect
                        x={px + 2}
                        y={py + 2}
                        width={cellSize - 4}
                        height={cellSize - 4}
                        rx="6"
                        fill="rgba(239, 68, 68, 0.3)"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                      />
                      <text
                        x={px + cellSize / 2}
                        y={py + cellSize - 6}
                        textAnchor="middle"
                        fill="#fca5a5"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        HAZARD
                      </text>
                    </g>
                  );
                }
                return null;
              })}
            </svg>
          )}

        {/* Walls & Openable Doors Overlay */}
        {Object.keys(architectureMap).length > 0 && (
          <svg width={gridWidth} height={gridHeight} className="absolute inset-0 pointer-events-none z-15">
            {Object.entries(architectureMap).map(([coord, archType]) => {
              const [gx, gy] = coord.split(',').map(Number);
              if (isNaN(gx) || isNaN(gy)) return null;
              const px = gx * cellSize + gridOffsetX;
              const py = gy * cellSize + gridOffsetY;

              // Walls are normally invisible in Play ('tokens') mode unless showTerrainInPlayMode is true,
              // but always visible in 'architecture' authoring mode!
              if (archType === 'wall') {
                if (activeLayer !== 'architecture' && !mapConfig.showTerrainInPlayMode) {
                  return null;
                }
                return (
                  <g key={coord}>
                    <rect
                      x={px + 1}
                      y={py + 1}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      rx="4"
                      fill="rgba(15, 23, 42, 0.85)"
                      stroke="#f43f5e"
                      strokeWidth="2"
                    />
                    <line
                      x1={px + 4}
                      y1={py + 4}
                      x2={px + cellSize - 4}
                      y2={py + cellSize - 4}
                      stroke="rgba(244, 63, 94, 0.45)"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={px + cellSize - 4}
                      y1={py + 4}
                      x2={px + 4}
                      y2={py + cellSize - 4}
                      stroke="rgba(244, 63, 94, 0.45)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={px + cellSize / 2}
                      y={py + cellSize / 2 + 3}
                      textAnchor="middle"
                      fill="#fda4af"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      WALL
                    </text>
                  </g>
                );
              }

              // Doors ('door_closed' and 'door_open') are visible and interactive in both Play and Architecture modes!
              if (archType === 'door_closed') {
                return (
                  <g key={coord}>
                    <rect
                      x={px + 3}
                      y={py + 3}
                      width={cellSize - 6}
                      height={cellSize - 6}
                      rx="6"
                      fill="rgba(120, 53, 15, 0.82)"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <rect
                      x={px + 8}
                      y={py + cellSize / 2 - 4}
                      width={cellSize - 16}
                      height={8}
                      rx="2"
                      fill="#b45309"
                      stroke="#fde68a"
                      strokeWidth="1.25"
                    />
                    <text
                      x={px + cellSize / 2}
                      y={py + cellSize - 6}
                      textAnchor="middle"
                      fill="#fef3c7"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      DOOR (CLOSED)
                    </text>
                  </g>
                );
              }

              if (archType === 'door_open') {
                return (
                  <g key={coord}>
                    <rect
                      x={px + 3}
                      y={py + 3}
                      width={cellSize - 6}
                      height={cellSize - 6}
                      rx="6"
                      fill="rgba(16, 185, 129, 0.14)"
                      stroke="#10b981"
                      strokeWidth="1.75"
                      strokeDasharray="5 3"
                    />
                    <text
                      x={px + cellSize / 2}
                      y={py + cellSize - 6}
                      textAnchor="middle"
                      fill="#6ee7b7"
                      fontSize="7.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      DOOR (OPEN)
                    </text>
                  </g>
                );
              }

              return null;
            })}
          </svg>
        )}

        {/* Baldur's Gate 3 Movement Range Ring & Hover Path Trajectory for Playing Character */}
        {playingToken && activeLayer === 'tokens' && activeTool === 'move' && (
          <svg width={gridWidth} height={gridHeight} className="absolute inset-0 pointer-events-none z-10">
            {movementRemaining > 0 && (
              <g>
                <circle
                  cx={(playingToken.gridX + playingToken.size / 2) * cellSize + gridOffsetX}
                  cy={(playingToken.gridY + playingToken.size / 2) * cellSize + gridOffsetY}
                  r={(movementRemaining / mapConfig.feetPerSquare) * cellSize}
                  fill="rgba(16, 185, 129, 0.07)"
                  stroke="#10b981"
                  strokeWidth="1.75"
                  strokeDasharray="6 4"
                  opacity={0.85}
                />
                {isCurrentlyDashing && (
                  <circle
                    cx={(playingToken.gridX + playingToken.size / 2) * cellSize + gridOffsetX}
                    cy={(playingToken.gridY + playingToken.size / 2) * cellSize + gridOffsetY}
                    r={(totalSpeed / mapConfig.feetPerSquare) * cellSize}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1.25"
                    strokeDasharray="4 4"
                    opacity={0.5}
                  />
                )}
              </g>
            )}

            {/* Path Trajectory Line to Hovered Square (Checks Walls & Closed Doors!) */}
            {hoveredGridCell &&
              (hoveredGridCell.x !== playingToken.gridX || hoveredGridCell.y !== playingToken.gridY) &&
              (() => {
                const baseDistFeet = calculateDistanceFeet(
                  { x: playingToken.gridX, y: playingToken.gridY },
                  { x: hoveredGridCell.x, y: hoveredGridCell.y },
                  mapConfig.feetPerSquare
                );
                const isDiff = terrainMap[`${hoveredGridCell.x},${hoveredGridCell.y}`] === 'difficult';
                const distFeet = isDiff ? baseDistFeet + 5 : baseDistFeet;
                if (distFeet === 0 || distFeet > totalSpeed + 30) return null;

                const obstruction = checkPathObstruction(
                  { x: playingToken.gridX, y: playingToken.gridY },
                  { x: hoveredGridCell.x, y: hoveredGridCell.y },
                  architectureMap
                );
                const hoveredDoor = architectureMap[`${hoveredGridCell.x},${hoveredGridCell.y}`];
                const isHoveringDoorToToggle = hoveredDoor === 'door_closed' || hoveredDoor === 'door_open';

                const isReachable = distFeet <= movementRemaining && !obstruction.obstructed;
                const startPxX = (playingToken.gridX + playingToken.size / 2) * cellSize + gridOffsetX;
                const startPxY = (playingToken.gridY + playingToken.size / 2) * cellSize + gridOffsetY;
                const destPxX = (hoveredGridCell.x + playingToken.size / 2) * cellSize + gridOffsetX;
                const destPxY = (hoveredGridCell.y + playingToken.size / 2) * cellSize + gridOffsetY;

                const badgeLabel = isHoveringDoorToToggle
                  ? hoveredDoor === 'door_closed'
                    ? 'OPEN DOOR'
                    : 'CLOSE DOOR'
                  : obstruction.obstructed
                  ? obstruction.blockerType === 'door_closed'
                    ? 'DOOR SHUT'
                    : 'BLOCKED'
                  : `${distFeet} ft`;

                const strokeCol = isHoveringDoorToToggle
                  ? '#f59e0b'
                  : isReachable
                  ? '#10b981'
                  : '#ef4444';

                return (
                  <g>
                    <line
                      x1={startPxX}
                      y1={startPxY}
                      x2={destPxX}
                      y2={destPxY}
                      stroke={strokeCol}
                      strokeWidth="2.25"
                      strokeDasharray="5 3"
                    />
                    <circle
                      cx={destPxX}
                      cy={destPxY}
                      r={cellSize * (playingToken.size / 2) - 4}
                      fill={
                        isHoveringDoorToToggle
                          ? 'rgba(245, 158, 11, 0.25)'
                          : isReachable
                          ? 'rgba(16, 185, 129, 0.22)'
                          : 'rgba(239, 68, 68, 0.2)'
                      }
                      stroke={strokeCol}
                      strokeWidth="2"
                    />
                    <g transform={`translate(${destPxX}, ${destPxY - 14})`}>
                      <rect
                        x="-34"
                        y="-10"
                        width="68"
                        height="19"
                        rx="5"
                        fill="#020617"
                        stroke={strokeCol}
                        strokeWidth="1.25"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={strokeCol}
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {badgeLabel}
                      </text>
                    </g>
                  </g>
                );
              })()}
          </svg>
        )}

        {/* Active Targeting & AoE Visualization */}
        {aoe.active && activeTool === 'target' && targetingAction && (
          <svg width={gridWidth} height={gridHeight} className="absolute inset-0 pointer-events-none z-20">
            {targetingAction.rangeFeet > 0 && (
              <circle
                cx={aoe.originX * cellSize + gridOffsetX}
                cy={aoe.originY * cellSize + gridOffsetY}
                r={(targetingAction.rangeFeet / mapConfig.feetPerSquare) * cellSize}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                opacity={0.55}
              />
            )}

            {(aoe.shape === 'sphere' || aoe.shape === 'circle') && (
              <g>
                <line
                  x1={aoe.originX * cellSize + gridOffsetX}
                  y1={aoe.originY * cellSize + gridOffsetY}
                  x2={(aoe.targetX || aoe.originX) * cellSize + gridOffsetX}
                  y2={(aoe.targetY || aoe.originY) * cellSize + gridOffsetY}
                  stroke={aoe.color}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
                <circle
                  cx={(aoe.targetX || aoe.originX) * cellSize + gridOffsetX}
                  cy={(aoe.targetY || aoe.originY) * cellSize + gridOffsetY}
                  r={Math.max(cellSize * 0.5, (aoe.sizeFeet / mapConfig.feetPerSquare) * cellSize)}
                  fill={targetingAction.healing ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}
                  stroke={aoe.color}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </g>
            )}

            {aoe.shape === 'cube' && (
              <g>
                <rect
                  x={((aoe.targetX || aoe.originX) - aoe.sizeFeet / mapConfig.feetPerSquare / 2) * cellSize + gridOffsetX}
                  y={((aoe.targetY || aoe.originY) - aoe.sizeFeet / mapConfig.feetPerSquare / 2) * cellSize + gridOffsetY}
                  width={(aoe.sizeFeet / mapConfig.feetPerSquare) * cellSize}
                  height={(aoe.sizeFeet / mapConfig.feetPerSquare) * cellSize}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              </g>
            )}

            {aoe.shape === 'cone' && (
              <g>
                {(() => {
                  const ox = aoe.originX * cellSize + gridOffsetX;
                  const oy = aoe.originY * cellSize + gridOffsetY;
                  const tx = (aoe.targetX || aoe.originX + 1) * cellSize + gridOffsetX;
                  const ty = (aoe.targetY || aoe.originY) * cellSize + gridOffsetY;
                  const lenPx = (aoe.sizeFeet / mapConfig.feetPerSquare) * cellSize;
                  const angle = Math.atan2(ty - oy, tx - ox);
                  const halfSpread = (53 * Math.PI) / 360;
                  const p1x = ox + Math.cos(angle - halfSpread) * lenPx;
                  const p1y = oy + Math.sin(angle - halfSpread) * lenPx;
                  const p2x = ox + Math.cos(angle + halfSpread) * lenPx;
                  const p2y = oy + Math.sin(angle + halfSpread) * lenPx;
                  return (
                    <path
                      d={`M ${ox} ${oy} L ${p1x} ${p1y} A ${lenPx} ${lenPx} 0 0 1 ${p2x} ${p2y} Z`}
                      fill="rgba(59, 130, 246, 0.28)"
                      stroke="#3b82f6"
                      strokeWidth="2.25"
                    />
                  );
                })()}
              </g>
            )}

            {aoe.shape === 'line' && (
              <g>
                {(() => {
                  const ox = aoe.originX * cellSize + gridOffsetX;
                  const oy = aoe.originY * cellSize + gridOffsetY;
                  const tx = (aoe.targetX || aoe.originX + 1) * cellSize + gridOffsetX;
                  const ty = (aoe.targetY || aoe.originY) * cellSize + gridOffsetY;
                  const angle = Math.atan2(ty - oy, tx - ox);
                  const lenPx = (aoe.sizeFeet / mapConfig.feetPerSquare) * cellSize;
                  const halfWidthPx = ((5 / mapConfig.feetPerSquare) * cellSize) / 2;
                  const perpAngle = angle + Math.PI / 2;
                  const dx = Math.cos(perpAngle) * halfWidthPx;
                  const dy = Math.sin(perpAngle) * halfWidthPx;
                  const lx = Math.cos(angle) * lenPx;
                  const ly = Math.sin(angle) * lenPx;
                  return (
                    <polygon
                      points={`${ox + dx},${oy + dy} ${ox + lx + dx},${oy + ly + dy} ${ox + lx - dx},${oy + ly - dy} ${ox - dx},${oy - dy}`}
                      fill="rgba(168, 85, 247, 0.3)"
                      stroke="#a855f7"
                      strokeWidth="2"
                    />
                  );
                })()}
              </g>
            )}
          </svg>
        )}

        {/* 5ft Ruler Overlay */}
        {ruler.active && (
          <svg width={gridWidth} height={gridHeight} className="absolute inset-0 pointer-events-none z-30">
            <line
              x1={(ruler.startX + 0.5) * cellSize + gridOffsetX}
              y1={(ruler.startY + 0.5) * cellSize + gridOffsetY}
              x2={(ruler.currentX + 0.5) * cellSize + gridOffsetX}
              y2={(ruler.currentY + 0.5) * cellSize + gridOffsetY}
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="6 3"
            />
            <circle cx={(ruler.startX + 0.5) * cellSize + gridOffsetX} cy={(ruler.startY + 0.5) * cellSize + gridOffsetY} r="4.5" fill="#f59e0b" />
            <circle cx={(ruler.currentX + 0.5) * cellSize + gridOffsetX} cy={(ruler.currentY + 0.5) * cellSize + gridOffsetY} r="5.5" fill="#f59e0b" />
            <g
              transform={`translate(${((ruler.startX + ruler.currentX) / 2 + 0.5) * cellSize + gridOffsetX}, ${
                ((ruler.startY + ruler.currentY) / 2 + 0.5) * cellSize + gridOffsetY - 16
              })`}
            >
              <rect x="-28" y="-11" width="56" height="22" rx="6" fill="#020617" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                {rulerBreakdown}
              </text>
            </g>
          </svg>
        )}

        {/* Tokens on Map */}
        {tokens.map(token => {
          const isPlaying = playingTokenId === token.id;
          const isInspected = inspectedTokenId === token.id;
          const isTurnActive = activeTurnTokenId === token.id;
          const isTargeted = affectedTokens.has(token.id);
          const tokenPxSize = token.size * cellSize;
          const tokenLeft = token.gridX * cellSize + gridOffsetX;
          const tokenTop = token.gridY * cellSize + gridOffsetY;
          const hpPercent = Math.max(0, Math.min(100, Math.round((token.hp / Math.max(1, token.maxHp)) * 100)));
          const hasCover = terrainMap[`${token.gridX},${token.gridY}`] === 'cover';

          // Hide enemy tokens that are inside Fog of War during Play ('tokens') mode
          const isInFog = mapConfig.fogOfWarEnabled && fogSet.has(`${token.gridX},${token.gridY}`);
          if (isInFog && token.type === 'enemy' && activeLayer === 'tokens') {
            return null;
          }

          return (
            <div
              key={token.id}
              onPointerDown={e => handleTokenPointerDown(e, token)}
              style={{
                width: `${tokenPxSize}px`,
                height: `${tokenPxSize}px`,
                transform: `translate(${tokenLeft}px, ${tokenTop}px)`,
                transition: draggingTokenId === token.id ? 'none' : 'transform 0.12s ease-out',
              }}
              className={`absolute left-0 top-0 rounded-full flex flex-col items-center justify-center z-10 select-none ${
                activeLayer !== 'tokens' ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
              } ${
                isTargeted
                  ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-slate-950 scale-105'
                  : isPlaying
                  ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-slate-950 shadow-xl'
                  : isInspected
                  ? 'ring-3 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-xl'
                  : isTurnActive
                  ? 'ring-2 ring-amber-300/80 shadow-lg'
                  : 'shadow-md'
              }`}
            >
              {/* Active "Playing" Crown/Indicator */}
              {isPlaying && (
                <div className="absolute -top-4 px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold text-[8px] uppercase tracking-wider shadow">
                  Playing
                </div>
              )}

              {/* Circular Token Body */}
              <div
                style={{ backgroundColor: token.color || '#3b82f6' }}
                className={`w-full h-full rounded-full border-2 border-slate-950/90 flex flex-col items-center justify-center relative overflow-hidden shadow-inner ${
                  token.hp === 0 ? 'opacity-45 grayscale' : ''
                }`}
              >
                <span className="text-[11px] font-bold text-white drop-shadow-md text-center px-1 truncate max-w-full">
                  {token.name.split(' ')[0]}
                </span>

                {/* AC mini badge (+2 if standing on Cover) */}
                <div className="absolute top-0.5 right-0.5 bg-slate-950/90 text-[8px] font-mono-numbers text-sky-300 font-bold px-1 rounded-full border border-sky-500/40">
                  {token.ac + (hasCover ? 2 : 0)}
                </div>

                {/* Condition Dots */}
                {token.conditions.length > 0 && (
                  <div className="absolute bottom-1 flex items-center gap-0.5">
                    {token.conditions.slice(0, 3).map((c, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-300 ring-1 ring-black" title={c} />
                    ))}
                  </div>
                )}
              </div>

              {/* Token Floating Health Bar */}
              <div className="absolute -bottom-2 left-1 right-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-200 ${
                    hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          );
        })}

        {/* Fog of War Overlay Layer (Dynamic Line-of-Sight from Walls & Closed Doors + Manual Fog) */}
        {(mapConfig.fogOfWarEnabled || mapConfig.dynamicLosEnabled) && effectiveFogCells.length > 0 && (
          <svg
            width={gridWidth}
            height={gridHeight}
            className={`absolute inset-0 pointer-events-none z-25 ${
              activeLayer === 'architecture' || activeLayer === 'background' ? 'opacity-45' : 'opacity-100'
            }`}
          >
            {effectiveFogCells.map(coord => {
              const [gx, gy] = coord.split(',').map(Number);
              if (isNaN(gx) || isNaN(gy)) return null;
              return (
                <rect
                  key={coord}
                  x={gx * cellSize + gridOffsetX}
                  y={gy * cellSize + gridOffsetY}
                  width={cellSize + 0.5}
                  height={cellSize + 0.5}
                  fill="rgba(2, 6, 23, 0.92)"
                  stroke="rgba(15, 23, 42, 0.95)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
