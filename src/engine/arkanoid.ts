import {
  ARKANOID_BALL_RADIUS,
  ARKANOID_BALL_SPEED,
  ARKANOID_BALL_START_OFFSET,
  ARKANOID_DURATION,
  ARKANOID_LASER_DURATION,
  ARKANOID_LASER_INTERVAL,
  ARKANOID_LASER_SPEED,
  ARKANOID_LAUNCH_DELAY,
  ARKANOID_PADDLE_STEP,
  ARKANOID_PADDLE_WIDTH,
  ARKANOID_PADDLE_WIDTH_SKINNY,
  ARKANOID_PADDLE_WIDTH_WIDE,
  ARKANOID_PADDLE_Y,
  ARKANOID_POWERUP_DROP_CHANCE,
  ARKANOID_POWERUP_DURATION,
  ARKANOID_POWERUP_SPEED,
  ARKANOID_POWERUP_TYPES,
  ARKANOID_TOP_BOUNDARY,
  ARKANOID_VISIBLE_START,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  VISIBLE_ROWS
} from "./constants";
import type { ArkanoidPowerup, ArkanoidPowerupType, ArkanoidState, GameState } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const createArkanoidState = (): ArkanoidState => {
  const paddleWidth = ARKANOID_PADDLE_WIDTH;
  const paddleX = (BOARD_WIDTH - paddleWidth) / 2;
  const ball = {
    x: paddleX + paddleWidth / 2,
    y: ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET,
    vx: ARKANOID_BALL_SPEED * 0.6,
    vy: -ARKANOID_BALL_SPEED
  };
  return {
    paddleX,
    paddleWidth,
    balls: [ball],
    powerups: [],
    lasers: [],
    powerupTimers: {
      skinny: 0,
      wide: 0,
      laser: 0
    },
    laserCooldown: 0,
    nextPowerupId: 1,
    timeLeft: ARKANOID_DURATION,
    launchDelay: ARKANOID_LAUNCH_DELAY
  };
};

const updatePaddleWidth = (arkanoid: ArkanoidState, paddleWidth: number) => {
  const clampedX = clamp(arkanoid.paddleX, 0, BOARD_WIDTH - paddleWidth);
  const balls =
    arkanoid.launchDelay > 0
      ? arkanoid.balls.map((ball, index) =>
          index === 0
            ? {
                ...ball,
                x: clampedX + paddleWidth / 2,
                y: ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET
              }
            : ball
        )
      : arkanoid.balls;
  return { ...arkanoid, paddleX: clampedX, paddleWidth, balls };
};

const centerBallOnPaddle = (arkanoid: ArkanoidState) => ({
  ...arkanoid,
  balls: arkanoid.balls.map((ball, index) =>
    index === 0
      ? {
          ...ball,
          x: arkanoid.paddleX + arkanoid.paddleWidth / 2,
          y: ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET
        }
      : ball
  )
});

export const movePaddle = (state: GameState, direction: -1 | 1): GameState => {
  if (state.mode !== "arkanoid") return state;
  const paddleX = clamp(
    state.arkanoid.paddleX + direction * ARKANOID_PADDLE_STEP,
    0,
    BOARD_WIDTH - state.arkanoid.paddleWidth
  );
  return {
    ...state,
    arkanoid: {
      ...state.arkanoid,
      paddleX,
      balls:
        state.arkanoid.launchDelay > 0
          ? state.arkanoid.balls.map((ball, index) =>
              index === 0
                ? {
                    ...ball,
                    x: paddleX + state.arkanoid.paddleWidth / 2,
                    y: ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET
                  }
                : ball
            )
          : state.arkanoid.balls
    }
  };
};

export const setPaddlePosition = (state: GameState, targetX: number): GameState => {
  if (state.mode !== "arkanoid") return state;
  const paddleX = clamp(
    targetX - state.arkanoid.paddleWidth / 2,
    0,
    BOARD_WIDTH - state.arkanoid.paddleWidth
  );
  const nextArkanoid =
    state.arkanoid.launchDelay > 0
      ? centerBallOnPaddle({ ...state.arkanoid, paddleX })
      : { ...state.arkanoid, paddleX };
  return { ...state, arkanoid: nextArkanoid };
};

export const launchBall = (state: GameState): GameState => {
  if (state.mode !== "arkanoid") return state;
  if (state.arkanoid.launchDelay <= 0) return state;
  return {
    ...state,
    arkanoid: {
      ...state.arkanoid,
      launchDelay: 0,
      balls: state.arkanoid.balls.map((ball, index) =>
        index === 0
          ? {
              ...ball,
              x: state.arkanoid.paddleX + state.arkanoid.paddleWidth / 2,
              y: ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET
            }
          : ball
      )
    }
  };
};

const hasVisibleBricks = (board: number[][]) => {
  for (let y = ARKANOID_VISIBLE_START; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (board[y][x] > 0) return true;
    }
  }
  return false;
};

export const tickArkanoid = (state: GameState, deltaMs: number): GameState => {
  let nextArkanoid: ArkanoidState = {
    ...state.arkanoid,
    timeLeft: Math.max(0, state.arkanoid.timeLeft - deltaMs)
  };
  let board = state.board;
  let score = state.score;
  let powerups = [...state.arkanoid.powerups];
  let lasers = [...state.arkanoid.lasers];
  let nextPowerupId = state.arkanoid.nextPowerupId;
  let laserCooldown = state.arkanoid.laserCooldown;
  let powerupTimers = { ...state.arkanoid.powerupTimers };

  const tickTimer = (value: number) => Math.max(0, value - deltaMs);
  powerupTimers = {
    skinny: tickTimer(powerupTimers.skinny),
    wide: tickTimer(powerupTimers.wide),
    laser: tickTimer(powerupTimers.laser)
  };

  let targetWidth = ARKANOID_PADDLE_WIDTH;
  if (powerupTimers.skinny > 0) {
    targetWidth = ARKANOID_PADDLE_WIDTH_SKINNY;
  } else if (powerupTimers.wide > 0) {
    targetWidth = ARKANOID_PADDLE_WIDTH_WIDE;
  }

  nextArkanoid = {
    ...nextArkanoid,
    powerupTimers,
    lasers,
    powerups,
    laserCooldown,
    nextPowerupId
  };

  if (targetWidth !== nextArkanoid.paddleWidth) {
    nextArkanoid = updatePaddleWidth(nextArkanoid, targetWidth);
  }

  if (nextArkanoid.timeLeft <= 0) {
    return { ...state, mode: "tetris", arkanoid: nextArkanoid, fallAccumulator: 0, lockTimer: 0 };
  }

  if (nextArkanoid.launchDelay > 0) {
    const launchDelay = Math.max(0, nextArkanoid.launchDelay - deltaMs);
    nextArkanoid = {
      ...nextArkanoid,
      launchDelay,
      balls:
        launchDelay > 0
          ? centerBallOnPaddle(nextArkanoid).balls
          : nextArkanoid.balls
    };
    return { ...state, arkanoid: nextArkanoid };
  }

  const spawnPowerup = (cellX: number, cellY: number) => {
    if (Math.random() > ARKANOID_POWERUP_DROP_CHANCE) return;
    const type =
      ARKANOID_POWERUP_TYPES[Math.floor(Math.random() * ARKANOID_POWERUP_TYPES.length)];
    const x = BOARD_WIDTH - 1 - cellX + 0.5;
    const y = VISIBLE_ROWS - 1 - (cellY - ARKANOID_VISIBLE_START) + 0.5;
    const powerup: ArkanoidPowerup = {
      id: nextPowerupId,
      type,
      x,
      y,
      vy: ARKANOID_POWERUP_SPEED
    };
    nextPowerupId += 1;
    powerups.push(powerup);
  };

  const breakBrick = (cellX: number, cellY: number) => {
    if (board[cellY][cellX] <= 0) return;
    board = board.map((row) => [...row]);
    board[cellY][cellX] = 0;
    score += 10;
    spawnPowerup(cellX, cellY);
  };

  if (powerupTimers.laser > 0) {
    laserCooldown += deltaMs;
    while (laserCooldown >= ARKANOID_LASER_INTERVAL) {
      const leftX = nextArkanoid.paddleX + 0.35;
      const rightX = nextArkanoid.paddleX + nextArkanoid.paddleWidth - 0.35;
      lasers.push({ x: leftX, y: ARKANOID_PADDLE_Y - 0.3, vy: ARKANOID_LASER_SPEED });
      lasers.push({ x: rightX, y: ARKANOID_PADDLE_Y - 0.3, vy: ARKANOID_LASER_SPEED });
      laserCooldown -= ARKANOID_LASER_INTERVAL;
    }
  } else {
    laserCooldown = 0;
  }

  const nextLasers: typeof lasers = [];
  lasers.forEach((laser) => {
    const nextY = laser.y - laser.vy * deltaMs;
    if (nextY < ARKANOID_TOP_BOUNDARY) return;
    const cellX = BOARD_WIDTH - 1 - Math.floor(laser.x);
    const cellY = ARKANOID_VISIBLE_START + (VISIBLE_ROWS - 1 - Math.floor(nextY));
    if (
      cellY >= ARKANOID_VISIBLE_START &&
      cellY < BOARD_HEIGHT &&
      cellX >= 0 &&
      cellX < BOARD_WIDTH &&
      board[cellY][cellX] > 0
    ) {
      breakBrick(cellX, cellY);
      return;
    }
    nextLasers.push({ ...laser, y: nextY });
  });
  lasers = nextLasers;

  const nextBalls: typeof nextArkanoid.balls = [];
  nextArkanoid.balls.forEach((ball) => {
    let { x, y, vx, vy } = ball;
    const dx = vx * deltaMs;
    const dy = vy * deltaMs;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.25));
    const stepX = dx / steps;
    const stepY = dy / steps;
    let lostBall = false;
    for (let step = 0; step < steps; step += 1) {
      const prevX = x;
      const prevY = y;
      x += stepX;
      y += stepY;

      if (x - ARKANOID_BALL_RADIUS < 0) {
        x = ARKANOID_BALL_RADIUS;
        vx = Math.abs(vx);
      }
      if (x + ARKANOID_BALL_RADIUS > BOARD_WIDTH) {
        x = BOARD_WIDTH - ARKANOID_BALL_RADIUS;
        vx = -Math.abs(vx);
      }
      if (y - ARKANOID_BALL_RADIUS < ARKANOID_TOP_BOUNDARY) {
        y = ARKANOID_TOP_BOUNDARY + ARKANOID_BALL_RADIUS;
        vy = Math.abs(vy);
      }

      const paddleTop = ARKANOID_PADDLE_Y - 0.2;
      if (vy > 0 && prevY <= paddleTop && y >= paddleTop) {
        if (x >= nextArkanoid.paddleX && x <= nextArkanoid.paddleX + nextArkanoid.paddleWidth) {
          y = paddleTop;
          const offset =
            (x - (nextArkanoid.paddleX + nextArkanoid.paddleWidth / 2)) /
            (nextArkanoid.paddleWidth / 2);
          const clampedOffset = clamp(offset, -1, 1);
          const speed = Math.hypot(vx, vy) || ARKANOID_BALL_SPEED;
          vx = clampedOffset * speed;
          vy = -Math.sqrt(Math.max(speed * speed - vx * vx, 0.0001));
        }
      }

      if (y > ARKANOID_PADDLE_Y + 1) {
        lostBall = true;
        break;
      }

      const cellX = BOARD_WIDTH - 1 - Math.floor(x);
      const cellY = ARKANOID_VISIBLE_START + (VISIBLE_ROWS - 1 - Math.floor(y));
      if (
        cellY >= ARKANOID_VISIBLE_START &&
        cellY < BOARD_HEIGHT &&
        cellX >= 0 &&
        cellX < BOARD_WIDTH &&
        board[cellY][cellX] > 0
      ) {
        breakBrick(cellX, cellY);
        const prevCellX = BOARD_WIDTH - 1 - Math.floor(prevX);
        const prevCellY =
          ARKANOID_VISIBLE_START + (VISIBLE_ROWS - 1 - Math.floor(prevY));
        const hitVertical = prevCellY !== cellY;
        const hitHorizontal = prevCellX !== cellX;
        if (hitVertical && !hitHorizontal) {
          vy = -vy;
        } else if (hitHorizontal && !hitVertical) {
          vx = -vx;
        } else {
          vy = -vy;
          vx = -vx;
        }
      }
    }

    if (!lostBall) {
      nextBalls.push({ x, y, vx, vy });
    }
  });

  nextArkanoid = {
    ...nextArkanoid,
    balls: nextBalls
  };

  const applyPowerup = (type: ArkanoidPowerupType) => {
    if (type === "skinny") {
      powerupTimers = { ...powerupTimers, skinny: ARKANOID_POWERUP_DURATION, wide: 0 };
      nextArkanoid = updatePaddleWidth(nextArkanoid, ARKANOID_PADDLE_WIDTH_SKINNY);
      return;
    }
    if (type === "wide") {
      powerupTimers = { ...powerupTimers, wide: ARKANOID_POWERUP_DURATION, skinny: 0 };
      nextArkanoid = updatePaddleWidth(nextArkanoid, ARKANOID_PADDLE_WIDTH_WIDE);
      return;
    }
    if (type === "laser") {
      powerupTimers = { ...powerupTimers, laser: ARKANOID_LASER_DURATION };
      return;
    }
    if (type === "multi") {
      if (nextArkanoid.balls.length >= 4) return;
      const baseBall = nextArkanoid.balls[0] ?? {
        x: nextArkanoid.paddleX + nextArkanoid.paddleWidth / 2,
        y: ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET,
        vx: ARKANOID_BALL_SPEED * 0.5,
        vy: -ARKANOID_BALL_SPEED
      };
      const speed = Math.hypot(baseBall.vx, baseBall.vy) || ARKANOID_BALL_SPEED;
      const spread = speed * 0.65;
      const vy = -Math.sqrt(Math.max(speed * speed - spread * spread, 0.0001));
      const spawnX = nextArkanoid.paddleX + nextArkanoid.paddleWidth / 2;
      const spawnY = ARKANOID_PADDLE_Y - ARKANOID_BALL_START_OFFSET;
      nextArkanoid = {
        ...nextArkanoid,
        balls: [
          ...nextArkanoid.balls,
          { x: spawnX, y: spawnY, vx: spread, vy },
          { x: spawnX, y: spawnY, vx: -spread, vy }
        ]
      };
    }
  };

  const nextPowerups: ArkanoidPowerup[] = [];
  powerups.forEach((powerup) => {
    const nextY = powerup.y + powerup.vy * deltaMs;
    if (nextY > ARKANOID_PADDLE_Y + 1) return;
    const paddleTop = ARKANOID_PADDLE_Y - 0.2;
    if (
      nextY >= paddleTop &&
      powerup.x >= nextArkanoid.paddleX &&
      powerup.x <= nextArkanoid.paddleX + nextArkanoid.paddleWidth
    ) {
      applyPowerup(powerup.type);
      return;
    }
    nextPowerups.push({ ...powerup, y: nextY });
  });

  nextArkanoid = {
    ...nextArkanoid,
    balls: nextBalls,
    powerups: nextPowerups,
    lasers,
    powerupTimers,
    nextPowerupId,
    laserCooldown
  };

  const nextState = { ...state, board, arkanoid: nextArkanoid, score };
  if (nextBalls.length === 0) {
    return { ...nextState, mode: "tetris", fallAccumulator: 0, lockTimer: 0 };
  }

  if (!hasVisibleBricks(board)) {
    return { ...nextState, mode: "tetris", score: nextState.score + 150, fallAccumulator: 0, lockTimer: 0 };
  }

  return nextState;
};
