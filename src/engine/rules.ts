import { cloneBoard, getBlocks } from "./board";
import {
  ARKANOID_TRIGGER_LINES,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DOOM_TRIGGER_LINES,
  TETROMINO_INDEX
} from "./constants";
import type { GameModifiers, Piece } from "./types";

export const DEFAULT_MODIFIERS: GameModifiers = {
  turbo: false,
  mirror: false,
  noGhost: false,
  floaty: false,
  freeHold: false,
  arcadeRush: false,
  party: false
};

export const getDropInterval = (level: number, modifiers: GameModifiers = DEFAULT_MODIFIERS) => {
  const base = Math.max(100, 1000 - (level - 1) * 75);
  const turboFactor = modifiers.turbo ? 0.6 : 1;
  const floatyFactor = modifiers.floaty ? 1.25 : 1;
  const interval = Math.round(base * turboFactor * floatyFactor);
  const minInterval = modifiers.turbo ? 60 : 100;
  return Math.max(minInterval, interval);
};

export const getLockDelay = (modifiers: GameModifiers = DEFAULT_MODIFIERS) => {
  const base = 500;
  if (modifiers.floaty) return Math.round(base * 1.4);
  return base;
};

export const getArkanoidTriggerLines = (modifiers: GameModifiers = DEFAULT_MODIFIERS) =>
  modifiers.arcadeRush
    ? Math.max(6, Math.round(ARKANOID_TRIGGER_LINES * 0.6))
    : ARKANOID_TRIGGER_LINES;

export const getDoomTriggerLines = (modifiers: GameModifiers = DEFAULT_MODIFIERS) =>
  modifiers.arcadeRush ? Math.max(8, Math.round(DOOM_TRIGGER_LINES * 0.6)) : DOOM_TRIGGER_LINES;

export const scoreLineClear = (lines: number, level: number) => {
  const table = [0, 100, 300, 500, 800];
  return (table[lines] ?? 0) * level;
};

export const updateLevel = (lines: number) => Math.floor(lines / 10) + 1;

export const imprintBoard = (board: number[][], piece: Piece) => {
  const next = cloneBoard(board);
  const value = TETROMINO_INDEX[piece.type];
  getBlocks(piece).forEach((block) => {
    if (block.y >= 0 && block.y < BOARD_HEIGHT) {
      next[block.y][block.x] = value;
    }
  });
  return next;
};

export const clearLines = (board: number[][]) => {
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = BOARD_HEIGHT - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array(BOARD_WIDTH).fill(0));
  return { board: [...newRows, ...remaining], cleared };
};
