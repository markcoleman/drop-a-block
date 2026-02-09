import { describe, expect, it } from "vitest";
import {
  createEmptyBoard,
  createInitialState,
  getDropInterval,
  getGhost,
  hardDrop,
  holdPiece,
  isValidPosition,
  movePiece,
  rotatePiece,
  tick,
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

  it("blocks movement into occupied cells", () => {
    const board = createEmptyBoard();
    board[1][2] = 1;
    const state = makeState({
      board,
      active: {
        type: "L",
        rotation: 0,
        position: { x: 3, y: 0 }
      }
    });
    const moved = movePiece(state, { x: -1, y: 0 });
    expect(moved).toBe(state);
  });

  it("rejects positions outside the board", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 0,
        position: { x: -2, y: 0 }
      }
    });
    expect(isValidPosition(state.board, state.active)).toBe(false);
  });

  it("computes the ghost at the lowest valid position", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "O",
        rotation: 0,
        position: { x: 4, y: 0 }
      }
    });
    const ghost = getGhost(state);
    expect(ghost.position.y).toBe(BOARD_HEIGHT - 2);
  });

  it("holds the active piece and pulls from the queue", () => {
    const queue = ["O", "T", "S", "Z", "J", "L", "I"];
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 0,
        position: { x: 4, y: 0 }
      },
      hold: null,
      canHold: true,
      queue
    });
    const held = holdPiece(state);
    expect(held.hold).toBe("I");
    expect(held.active.type).toBe("O");
    expect(held.queue.length).toBe(queue.length - 1);
    expect(held.canHold).toBe(false);
  });

  it("swaps with the hold piece when available", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 0,
        position: { x: 4, y: 0 }
      },
      hold: "T",
      canHold: true
    });
    const swapped = holdPiece(state);
    expect(swapped.active.type).toBe("T");
    expect(swapped.hold).toBe("I");
    expect(swapped.canHold).toBe(false);
  });

  it("ignores hold when already used this turn", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 0,
        position: { x: 4, y: 0 }
      },
      hold: "T",
      canHold: false
    });
    const held = holdPiece(state);
    expect(held).toBe(state);
  });

  it("locks a piece after the lock delay", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "O",
        rotation: 0,
        position: { x: 4, y: BOARD_HEIGHT - 2 }
      },
      lockDelay: 1,
      lockTimer: 0
    });
    const locked = tick(state, 2);
    expect(locked.board[BOARD_HEIGHT - 1][5]).toBeGreaterThan(0);
    expect(locked.board[BOARD_HEIGHT - 1][6]).toBeGreaterThan(0);
  });

  it("drops a piece after the drop interval elapses", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 1,
        position: { x: 4, y: 0 }
      },
      dropInterval: 10,
      fallAccumulator: 0
    });
    const next = tick(state, 10);
    expect(next.active.position.y).toBe(1);
  });

  it("resets hold availability after a hard drop locks", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "O",
        rotation: 0,
        position: { x: 4, y: 0 }
      },
      canHold: false
    });
    const dropped = hardDrop(state);
    expect(dropped.canHold).toBe(true);
  });

  it("scales drop interval with level and caps at 100ms", () => {
    expect(getDropInterval(1)).toBe(1000);
    expect(getDropInterval(10)).toBe(325);
    expect(getDropInterval(20)).toBe(100);
  });
});
