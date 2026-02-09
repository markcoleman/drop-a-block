import { describe, expect, it } from "vitest";
import {
  createEmptyBoard,
  createInitialState,
  hardDrop,
  movePiece,
  rotatePiece,
  BOARD_HEIGHT,
  BOARD_WIDTH
} from "../engine";
import { GameState } from "../types";

const makeState = (overrides: Partial<GameState>): GameState => ({
  ...createInitialState(),
  status: "running",
  ...overrides
});

describe("engine", () => {
  it("rotates a piece with wall kicks on an empty board", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "T",
        rotation: 0,
        position: { x: 4, y: 0 }
      }
    });
    const rotated = rotatePiece(state, "cw");
    expect(rotated.active.rotation).toBe(1);
  });

  it("clears a single line and updates score", () => {
    const board = createEmptyBoard();
    board[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill(1);
    const state = makeState({
      board,
      active: {
        type: "O",
        rotation: 0,
        position: { x: 4, y: 0 }
      }
    });
    const dropped = hardDrop(state);
    expect(dropped.lines).toBe(1);
    expect(dropped.score).toBeGreaterThan(0);
  });

  it("hard drops to the floor", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 1,
        position: { x: 4, y: 0 }
      }
    });
    const dropped = hardDrop(state);
    expect(dropped.active.position.y).toBeLessThan(2);
  });

  it("moves left within bounds", () => {
    const state = makeState({
      active: {
        type: "L",
        rotation: 0,
        position: { x: 1, y: 0 }
      }
    });
    const moved = movePiece(state, { x: -1, y: 0 });
    expect(moved.active.position.x).toBe(0);
  });
});
