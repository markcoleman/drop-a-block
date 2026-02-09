import { describe, expect, it } from "vitest";
import {
  ARKANOID_TRIGGER_LINES,
  createEmptyBoard,
  createInitialState,
  getDropInterval,
  getGhost,
  hardDrop,
  launchBall,
  movePaddle,
  pauseGame,
  resetGame,
  holdPiece,
  isValidPosition,
  movePiece,
  softDrop,
  startGame,
  rotatePiece,
  tick,
  BOARD_HEIGHT,
  BOARD_WIDTH
} from "../engine";
import { GameState, TetrominoType } from "../types";

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
    const queue: TetrominoType[] = ["O", "T", "S", "Z", "J", "L", "I"];
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

  it("applies soft drop with a score bonus", () => {
    const state = makeState({
      board: createEmptyBoard(),
      active: {
        type: "I",
        rotation: 1,
        position: { x: 4, y: 0 }
      }
    });
    const dropped = softDrop(state);
    expect(dropped.active.position.y).toBe(1);
    expect(dropped.score).toBe(state.score + 1);
  });

  it("toggles pause and resumes correctly", () => {
    const state = makeState({});
    const paused = pauseGame(state);
    expect(paused.status).toBe("paused");
    const resumed = pauseGame(paused);
    expect(resumed.status).toBe("running");
  });

  it("starts the game from the initial state", () => {
    const state = createInitialState();
    const started = startGame(state);
    expect(started.status).toBe("running");
    expect(started.fallAccumulator).toBe(0);
    expect(started.lockTimer).toBe(0);
  });

  it("returns default state on reset", () => {
    const state = resetGame();
    expect(state.status).toBe("start");
    expect(state.board.length).toBe(BOARD_HEIGHT);
  });

  it("enters arkanoid mode after clearing the trigger lines", () => {
    const board = createEmptyBoard();
    board[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill(1);
    for (let x = 3; x <= 6; x += 1) {
      board[BOARD_HEIGHT - 1][x] = 0;
    }
    const state = makeState({
      board,
      arkanoidMeter: ARKANOID_TRIGGER_LINES - 1,
      active: {
        type: "I",
        rotation: 0,
        position: { x: 3, y: 0 }
      }
    });
    const dropped = hardDrop(state);
    expect(dropped.mode).toBe("arkanoid");
    expect(dropped.arkanoidMeter).toBe(0);
  });

  it("exits arkanoid mode when the timer expires", () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      status: "running",
      mode: "arkanoid",
      arkanoid: {
        ...base.arkanoid,
        timeLeft: 5,
        launchDelay: 0
      }
    };
    const next = tick(state, 10);
    expect(next.mode).toBe("tetris");
  });

  it("moves the paddle and keeps the ball centered before launch", () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      status: "running",
      mode: "arkanoid",
      arkanoid: {
        ...base.arkanoid,
        launchDelay: 500
      }
    };
    const moved = movePaddle(state, 1);
    expect(moved.arkanoid.paddleX).toBeGreaterThan(state.arkanoid.paddleX);
    expect(moved.arkanoid.ball.x).toBeCloseTo(
      moved.arkanoid.paddleX + moved.arkanoid.paddleWidth / 2
    );
  });

  it("launches the ball immediately when requested", () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      status: "running",
      mode: "arkanoid",
      arkanoid: {
        ...base.arkanoid,
        launchDelay: 400
      }
    };
    const launched = launchBall(state);
    expect(launched.arkanoid.launchDelay).toBe(0);
  });

  it("prevents hold swap if the spawned piece would be invalid", () => {
    const board = createEmptyBoard();
    board[0][3] = 1;
    board[0][4] = 1;
    const state = makeState({
      board,
      active: {
        type: "I",
        rotation: 0,
        position: { x: 4, y: 0 }
      },
      hold: "O",
      canHold: true
    });
    const swapped = holdPiece(state);
    expect(swapped).toBe(state);
  });

  it("slows drop interval but never below 100ms", () => {
    expect(getDropInterval(1)).toBe(1000);
    expect(getDropInterval(20)).toBe(100);
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
