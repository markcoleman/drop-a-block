import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES } from "./constants";
import type { Piece, Vec2 } from "./types";

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

export const cloneBoard = (board: number[][]) => board.map((row) => [...row]);

export const getBlocks = (piece: Piece) =>
  TETROMINOES[piece.type][piece.rotation].map((block) => ({
    x: block.x + piece.position.x,
    y: block.y + piece.position.y
  }));

const isInsideBoard = (pos: Vec2) => pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y < BOARD_HEIGHT;

export const isValidPosition = (board: number[][], piece: Piece) =>
  getBlocks(piece).every(
    (block) => isInsideBoard(block) && (block.y < 0 || board[block.y][block.x] === 0)
  );
