import test from 'node:test';
import assert from 'node:assert/strict';
import {
  snapCoordinateToGrid,
  calculateDistanceFeet,
  isTokenInRadius,
  isTokenInCone,
  isTokenInCube,
  sortInitiative,
  applyHealthChange,
} from './battleMath.ts';

test('snapCoordinateToGrid snaps properly', () => {
  assert.equal(snapCoordinateToGrid(24, 50), 0);
  assert.equal(snapCoordinateToGrid(26, 50), 1);
  assert.equal(snapCoordinateToGrid(110, 50), 2);
});

test('calculateDistanceFeet computes 5e distances with D&D diagonal rule', () => {
  // Straight line 6 squares: 30 ft
  assert.equal(calculateDistanceFeet({ x: 2, y: 2 }, { x: 8, y: 2 }, 5), 30);
  // Diagonal 1 square: 5 ft
  assert.equal(calculateDistanceFeet({ x: 0, y: 0 }, { x: 1, y: 1 }, 5), 5);
  // Diagonal 2 squares: 15 ft (5 + 10)
  assert.equal(calculateDistanceFeet({ x: 0, y: 0 }, { x: 2, y: 2 }, 5), 15);
  // Diagonal 3 squares: 20 ft (5 + 10 + 5)
  assert.equal(calculateDistanceFeet({ x: 0, y: 0 }, { x: 3, y: 3 }, 5), 20);
  // 3 squares right, 4 squares down: 3 diagonals (20 ft) + 1 straight (5 ft) = 25 ft with D&D diagonal rule!
  assert.equal(calculateDistanceFeet({ x: 0, y: 0 }, { x: 3, y: 4 }, 5), 25);
  // Optional 1:1 Chebyshev rule: 20 ft
  assert.equal(calculateDistanceFeet({ x: 0, y: 0 }, { x: 3, y: 4 }, 5, false), 20);
});

test('isTokenInRadius detects tokens within sphere AoE', () => {
  const tokenNear = { gridX: 4, gridY: 4, size: 1 };
  const tokenFar = { gridX: 12, gridY: 12, size: 1 };
  const origin = { x: 5, y: 5 }; // Center at (5, 5)
  const radiusFeet = 20; // 4 grid units

  assert.equal(isTokenInRadius(tokenNear, origin, radiusFeet, 5), true);
  assert.equal(isTokenInRadius(tokenFar, origin, radiusFeet, 5), false);
});

test('isTokenInCone handles directional AoE', () => {
  const origin = { x: 5, y: 5 };
  const target = { x: 10, y: 5 }; // Facing directly right (east)
  const tokenInPath = { gridX: 7, gridY: 5, size: 1 };
  const tokenBehind = { gridX: 2, gridY: 5, size: 1 };

  assert.equal(isTokenInCone(tokenInPath, origin, target, 30, 5, 53), true);
  assert.equal(isTokenInCone(tokenBehind, origin, target, 30, 5, 53), false);
});

test('isTokenInCube detects intersecting tokens', () => {
  const origin = { x: 5, y: 5 };
  const tokenInside = { gridX: 5, gridY: 5, size: 1 };
  const tokenOutside = { gridX: 10, gridY: 10, size: 1 };

  assert.equal(isTokenInCube(tokenInside, origin, 15, 5), true);
  assert.equal(isTokenInCube(tokenOutside, origin, 15, 5), false);
});

test('sortInitiative sorts descending by roll', () => {
  const combatants = [
    { id: '1', name: 'Goblin A', initiative: 12, hp: 7, maxHp: 7, ac: 15, conditions: [], isPlayer: false },
    { id: '2', name: 'Hero', initiative: 21, hp: 30, maxHp: 30, ac: 18, conditions: [], isPlayer: true },
    { id: '3', name: 'Goblin Boss', initiative: 15, hp: 21, maxHp: 21, ac: 17, conditions: [], isPlayer: false },
  ];

  const sorted = sortInitiative(combatants);
  assert.equal(sorted[0].name, 'Hero');
  assert.equal(sorted[1].name, 'Goblin Boss');
  assert.equal(sorted[2].name, 'Goblin A');
});

test('applyHealthChange clamps within [0, maxHp]', () => {
  assert.equal(applyHealthChange(20, 30, -10), 10);
  assert.equal(applyHealthChange(5, 30, -20), 0);
  assert.equal(applyHealthChange(25, 30, 15), 30);
});
