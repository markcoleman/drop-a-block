import { beforeEach, expect, it, vi } from "vitest";

import {
  createArkanoidState,
  launchBall,
  movePaddle,
  setPaddlePosition,
  tickArkanoid
} from "../arkanoid";
import { createEmptyBoard } from "../board";
import {
  ARKANOID_BALL_START_OFFSET,
  ARKANOID_LASER_INTERVAL,
  ARKANOID_LASER_SPEED,
  ARKANOID_PADDLE_WIDTH,
  ARKANOID_PADDLE_WIDTH_WIDE,
  ARKANOID_PADDLE_Y,
  ARKANOID_VISIBLE_START,
  BOARD_WIDTH,
  VISIBLE_ROWS
} from "../constants";
import { createInitialState } from "../state";
import type { GameState } from "../types";

const createArkanoidGame = (): GameState => ({
  ...createInitialState(),
  mode: "arkanoid",
  board: createEmptyBoard(),
  arkanoid: createArkanoidState(),
  fallAccumulator: 0,
  lockTimer: 0
});

const placeBrick = (board: number[][], cellX: number, cellY: number) => {
  const next = board.map((row) => [...row]);
  next[cellY][cellX] = 1;
  return next;
};

const laserForCell = (cellX: number, cellY: number, deltaMs: number) => {
  const nextY = VISIBLE_ROWS - 1 - (cellY - ARKANOID_VISIBLE_START) + 0.1;
  const x = BOARD_WIDTH - 1 - cellX + 0.1;
  return {
    x,
    y: nextY + ARKANOID_LASER_SPEED * deltaMs,
    vy: ARKANOID_LASER_SPEED
  };
};

beforeEach(() => {
  vi.restoreAllMocks();
});

it("creates the initial arkanoid state", () => {
  const arkanoid = createArkanoidState();

  expect(arkanoid.paddleWidth).toBe(ARKANOID_PADDLE_WIDTH);
  expect(arkanoid.balls).toHaveLength(1);
  expect(arkanoid.balls[0].y).toBeCloseTo(ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET);
});

it("moves the paddle and clamps within bounds", () => {
  const state = createArkanoidGame();

  const left = movePaddle({ ...state, arkanoid: { ...state.arkanoid, paddleX: 0 } }, -1);
  expect(left.arkanoid.paddleX).toBe(0);

  const moved = movePaddle(state, 1);
  expect(moved.arkanoid.paddleX).toBeGreaterThan(0);
  expect(moved.arkanoid.balls[0].x).toBeCloseTo(
    moved.arkanoid.paddleX + moved.arkanoid.paddleWidth / 2
  );
});

it("sets paddle position and centers ball before launch", () => {
  const state = createArkanoidGame();

  const next = setPaddlePosition(state, BOARD_WIDTH + 5);
  expect(next.arkanoid.paddleX).toBeLessThanOrEqual(BOARD_WIDTH - next.arkanoid.paddleWidth);
  expect(next.arkanoid.balls[0].x).toBeCloseTo(
    next.arkanoid.paddleX + next.arkanoid.paddleWidth / 2
  );
});

it("launches the ball from the paddle", () => {
  const state = createArkanoidGame();

  const launched = launchBall(state);
  expect(launched.arkanoid.launchDelay).toBe(0);
  expect(launched.arkanoid.balls[0].x).toBeCloseTo(
    launched.arkanoid.paddleX + launched.arkanoid.paddleWidth / 2
  );
});

it("returns to tetris when time expires", () => {
  const state = createArkanoidGame();

  const next = tickArkanoid(
    {
      ...state,
      arkanoid: { ...state.arkanoid, timeLeft: 1, launchDelay: 0 }
    },
    10
  );

  expect(next.mode).toBe("tetris");
});

it("spawns lasers while laser powerup is active", () => {
  const state = createArkanoidGame();

  const next = tickArkanoid(
    {
      ...state,
      arkanoid: {
        ...state.arkanoid,
        launchDelay: 0,
        powerupTimers: { ...state.arkanoid.powerupTimers, laser: 1000 },
        laserCooldown: 0
      }
    },
    ARKANOID_LASER_INTERVAL * 2
  );

  expect(next.arkanoid.lasers.length).toBe(4);
});

it("applies powerups and updates paddle width", () => {
  const state = createArkanoidGame();

  const next = tickArkanoid(
    {
      ...state,
      arkanoid: {
        ...state.arkanoid,
        launchDelay: 0,
        powerups: [
          {
            id: 1,
            type: "wide",
            x: state.arkanoid.paddleX + 0.2,
            y: ARKANOID_PADDLE_Y - 0.2,
            vy: 0.01
          }
        ]
      }
    },
    1
  );

  expect(next.arkanoid.powerupTimers.wide).toBeGreaterThan(0);
  expect(next.arkanoid.paddleWidth).toBeCloseTo(ARKANOID_PADDLE_WIDTH_WIDE);
});

it("adds extra balls for multi powerups", () => {
  const state = createArkanoidGame();

  const next = tickArkanoid(
    {
      ...state,
      arkanoid: {
        ...state.arkanoid,
        launchDelay: 0,
        powerups: [
          {
            id: 2,
            type: "multi",
            x: state.arkanoid.paddleX + 0.1,
            y: ARKANOID_PADDLE_Y - 0.2,
            vy: 0.01
          }
        ]
      }
    },
    1
  );

  expect(next.arkanoid.balls.length).toBeGreaterThan(1);
});

it("breaks bricks with lasers and adds score", () => {
  const state = createArkanoidGame();
  const deltaMs = 1;
  const cellX = 4;
  const cellY = ARKANOID_VISIBLE_START;

  const board = placeBrick(placeBrick(state.board, cellX, cellY), cellX + 1, cellY);
  const laser = laserForCell(cellX, cellY, deltaMs);

  vi.spyOn(Math, "random").mockReturnValue(1);

  const next = tickArkanoid(
    {
      ...state,
      board,
      arkanoid: {
        ...state.arkanoid,
        launchDelay: 0,
        lasers: [laser],
        balls: [{ x: 5, y: 10, vx: 0, vy: 0 }]
      }
    },
    deltaMs
  );

  expect(next.board[cellY][cellX]).toBe(0);
  expect(next.score).toBe(state.score + 10);
});

it("ends arkanoid when no balls remain", () => {
  const state = createArkanoidGame();

  const next = tickArkanoid(
    {
      ...state,
      arkanoid: {
        ...state.arkanoid,
        launchDelay: 0,
        balls: [{ x: 2, y: ARKANOID_PADDLE_Y + 2, vx: 0, vy: 0.01 }]
      }
    },
    1
  );

  expect(next.mode).toBe("tetris");
});

it("grants bonus when all bricks are cleared", () => {
  const state = createArkanoidGame();

  const next = tickArkanoid(
    {
      ...state,
      arkanoid: {
        ...state.arkanoid,
        launchDelay: 0,
        balls: [{ x: 5, y: 10, vx: 0, vy: 0 }]
      }
    },
    1
  );

  expect(next.mode).toBe("tetris");
  expect(next.score).toBe(state.score + 150);
});
