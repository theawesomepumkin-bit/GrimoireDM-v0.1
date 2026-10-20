import type { Combatant, ArchitectureCellType } from '../types.ts';

/**
 * Snaps coordinate to nearest grid cell index
 */
export function snapCoordinateToGrid(pixelCoord: number, cellSize: number): number {
  return Math.max(0, Math.round(pixelCoord / cellSize));
}

/**
 * Converts pixel coordinate to grid index
 */
export function pixelToGrid(pixel: number, cellSize: number): number {
  return Math.floor(pixel / cellSize);
}

/**
 * Converts grid index to pixel coordinate
 */
export function gridToPixel(gridIndex: number, cellSize: number): number {
  return gridIndex * cellSize;
}

/**
 * Calculates distance in feet between two points using the official D&D diagonal rule (5-10-5 rule from DMG p. 252)
 * or standard 1:1 Chebyshev rule.
 */
export function calculateDistanceFeet(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  feetPerSquare: number = 5,
  useDndDiagonalRule: boolean = true
): number {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);

  if (!useDndDiagonalRule) {
    const squares = Math.max(dx, dy);
    return squares * feetPerSquare;
  }

  const diagonals = Math.min(dx, dy);
  const straight = Math.abs(dx - dy);

  const pairs = Math.floor(diagonals / 2);
  const rem = diagonals % 2;
  const diagonalFeet = (pairs * 15) + (rem * 5);
  const straightFeet = straight * 5;

  return (straightFeet + diagonalFeet) * (feetPerSquare / 5);
}

export function calculateDndDistanceBreakdown(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  feetPerSquare: number = 5
) {
  const dx = Math.abs(p2.x - p1.x);
  const dy = Math.abs(p2.y - p1.y);
  const diagonals = Math.min(dx, dy);
  const straight = Math.abs(dx - dy);

  const pairs = Math.floor(diagonals / 2);
  const rem = diagonals % 2;
  const diagonalFeet = (pairs * 15) + (rem * 5);
  const straightFeet = straight * 5;
  const totalFeet = (straightFeet + diagonalFeet) * (feetPerSquare / 5);

  return {
    totalFeet,
    straightFeet,
    diagonalFeet,
    straightSquares: straight,
    diagonalSquares: diagonals,
  };
}

/**
 * Returns ordered grid cells along a Bresenham ray from `from` to `to` (inclusive).
 */
export function getGridRayCells(
  from: { x: number; y: number },
  to: { x: number; y: number }
): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];
  let x0 = Math.floor(from.x);
  let y0 = Math.floor(from.y);
  const x1 = Math.floor(to.x);
  const y1 = Math.floor(to.y);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return cells;
}

/**
 * Checks whether a single grid cell is passable (not blocked by a wall or closed door).
 * Open doors ('door_open') do NOT obstruct movement.
 */
export function isCellPassable(
  x: number,
  y: number,
  architectureCells?: Record<string, ArchitectureCellType>
): boolean {
  if (!architectureCells) return true;
  const cell = architectureCells[`${x},${y}`];
  return cell !== 'wall' && cell !== 'door_closed';
}

/**
 * Checks if movement or a straight trajectory from `from` to `to` is obstructed by a wall or closed door.
 * Open doors ('door_open') allow free passage.
 */
export function checkPathObstruction(
  from: { x: number; y: number },
  to: { x: number; y: number },
  architectureCells?: Record<string, ArchitectureCellType>
): { obstructed: boolean; blockerCoord?: string; blockerType?: ArchitectureCellType } {
  if (!architectureCells || Object.keys(architectureCells).length === 0) {
    return { obstructed: false };
  }
  const ray = getGridRayCells(from, to);
  // Skip index 0 (the starting cell of the token)
  for (let i = 1; i < ray.length; i++) {
    const c = ray[i];
    const key = `${c.x},${c.y}`;
    const arch = architectureCells[key];
    if (arch === 'wall' || arch === 'door_closed') {
      return { obstructed: true, blockerCoord: key, blockerType: arch };
    }
  }
  return { obstructed: false };
}

/**
 * Checks whether `observer` has unobstructed Line-of-Sight to `target`.
 * Intermediate 'wall' or 'door_closed' cells block vision.
 * 'door_open' cells do NOT block vision.
 */
export function hasLineOfSight(
  observer: { x: number; y: number },
  target: { x: number; y: number },
  architectureCells?: Record<string, ArchitectureCellType>
): boolean {
  if (!architectureCells || Object.keys(architectureCells).length === 0) {
    return true;
  }
  const ray = getGridRayCells(observer, target);
  // Check strictly intermediate cells (between observer and target)
  for (let i = 1; i < ray.length - 1; i++) {
    const c = ray[i];
    const arch = architectureCells[`${c.x},${c.y}`];
    if (arch === 'wall' || arch === 'door_closed') {
      return false;
    }
  }
  return true;
}

/**
 * Computes shrouded Fog of War cells based on observer tokens, walls, and closed doors.
 * Opening a door ('door_open') immediately allows line-of-sight rays through the doorway.
 */
export function computeDynamicLosFogCells(
  cols: number,
  rows: number,
  observers: Array<{ gridX: number; gridY: number; size?: number }>,
  architectureCells?: Record<string, ArchitectureCellType>,
  visionRangeSquares: number = 22
): string[] {
  if (observers.length === 0) return [];
  const shrouded: string[] = [];

  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < rows; gy++) {
      let visibleToAny = false;
      for (const obs of observers) {
        const obsX = Math.floor(obs.gridX + (obs.size || 1) / 2);
        const obsY = Math.floor(obs.gridY + (obs.size || 1) / 2);
        const dist = Math.hypot(gx - obsX, gy - obsY);
        if (dist <= visionRangeSquares && hasLineOfSight({ x: obsX, y: obsY }, { x: gx, y: gy }, architectureCells)) {
          visibleToAny = true;
          break;
        }
      }
      if (!visibleToAny) {
        shrouded.push(`${gx},${gy}`);
      }
    }
  }

  return shrouded;
}

/**
 * Checks if a token intersects a Line AoE originating at origin pointing towards target.
 * Line has length in feet and width in feet (default 5 ft).
 */
export function isTokenInLine(
  token: { gridX: number; gridY: number; size: number },
  origin: { x: number; y: number },
  target: { x: number; y: number },
  lengthFeet: number,
  feetPerSquare: number = 5,
  lineWidthFeet: number = 5
): boolean {
  const tokenCenterX = token.gridX + token.size / 2;
  const tokenCenterY = token.gridY + token.size / 2;

  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const targetDist = Math.sqrt(dx * dx + dy * dy);
  if (targetDist < 0.001) return false;

  const lengthGrid = lengthFeet / feetPerSquare;
  const halfWidthGrid = (lineWidthFeet / feetPerSquare) / 2;

  const uX = dx / targetDist;
  const uY = dy / targetDist;

  const toTokenX = tokenCenterX - origin.x;
  const toTokenY = tokenCenterY - origin.y;

  const proj = toTokenX * uX + toTokenY * uY;
  if (proj < -0.2 || proj > lengthGrid + (token.size * 0.4)) {
    return false;
  }

  const perpDist = Math.abs(toTokenX * (-uY) + toTokenY * uX);
  return perpDist <= halfWidthGrid + (token.size * 0.4);
}

/**
 * Checks if a token (given gridX, gridY, and size) intersects a sphere/radius AoE.
 * originX/originY are in grid units, radiusFeet is in feet.
 */
export function isTokenInRadius(
  token: { gridX: number; gridY: number; size: number },
  origin: { x: number; y: number },
  radiusFeet: number,
  feetPerSquare: number = 5
): boolean {
  const radiusGrid = radiusFeet / feetPerSquare;
  // Center of the token in grid coordinates
  const tokenCenterX = token.gridX + token.size / 2;
  const tokenCenterY = token.gridY + token.size / 2;

  const dx = tokenCenterX - origin.x;
  const dy = tokenCenterY - origin.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Consider half token size overlap
  return dist <= radiusGrid + (token.size * 0.4);
}

/**
 * Checks if a token intersects a 53-degree Cone AoE originating at origin pointing towards target.
 */
export function isTokenInCone(
  token: { gridX: number; gridY: number; size: number },
  origin: { x: number; y: number },
  target: { x: number; y: number },
  coneLengthFeet: number,
  feetPerSquare: number = 5,
  coneAngleDeg: number = 53
): boolean {
  const maxLengthGrid = coneLengthFeet / feetPerSquare;
  const tokenCenterX = token.gridX + token.size / 2;
  const tokenCenterY = token.gridY + token.size / 2;

  const dx = tokenCenterX - origin.x;
  const dy = tokenCenterY - origin.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > maxLengthGrid + (token.size * 0.3)) return false;
  if (dist < 0.1) return true; // At the point of origin

  const dirX = target.x - origin.x;
  const dirY = target.y - origin.y;
  const targetDist = Math.sqrt(dirX * dirX + dirY * dirY);
  if (targetDist < 0.01) return dist <= maxLengthGrid;

  // Dot product to find angle
  const dot = (dx * dirX + dy * dirY) / (dist * targetDist);
  const clampedDot = Math.max(-1, Math.min(1, dot));
  const angleRad = Math.acos(clampedDot);
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg <= (coneAngleDeg / 2) + 5;
}

/**
 * Checks if a token intersects a Cube AoE (placed from origin with size in feet).
 */
export function isTokenInCube(
  token: { gridX: number; gridY: number; size: number },
  origin: { x: number; y: number },
  sizeFeet: number,
  feetPerSquare: number = 5
): boolean {
  const sizeGrid = sizeFeet / feetPerSquare;
  const halfSize = sizeGrid / 2;
  const cubeMinX = origin.x - halfSize;
  const cubeMaxX = origin.x + halfSize;
  const cubeMinY = origin.y - halfSize;
  const cubeMaxY = origin.y + halfSize;

  const tokenMinX = token.gridX;
  const tokenMaxX = token.gridX + token.size;
  const tokenMinY = token.gridY;
  const tokenMaxY = token.gridY + token.size;

  return !(
    tokenMaxX <= cubeMinX ||
    tokenMinX >= cubeMaxX ||
    tokenMaxY <= cubeMinY ||
    tokenMinY >= cubeMaxY
  );
}

/**
 * Sorts combatants by initiative descending with tie-breaker by AC or name
 */
export function sortInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    if (b.ac !== a.ac) {
      return b.ac - a.ac;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Safely applies damage (negative delta) or healing (positive delta) to an HP pool
 */
export function applyHealthChange(currentHp: number, maxHp: number, delta: number): number {
  const nextHp = currentHp + delta;
  return Math.max(0, Math.min(maxHp, nextHp));
}

