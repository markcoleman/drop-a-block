import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINO_INDEX } from "./constants";
import { cloneBoard, getBlocks } from "./board";
import type { GameModifiers, Piece } from "./types";

export const DEFAULT_MODIFIERS: GameModifiers = {
  turbo: false,
  mirror: false,
  noGhost: false
};

export const getDropInterval = (level: number, modifiers: GameModifiers = DEFAULT_MODIFIERS) => {
  const base = Math.max(100, 1000 - (level - 1) * 75);
  if (!modifiers.turbo) return base;
  return Math.max(60, Math.round(base * 0.6));
};

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
