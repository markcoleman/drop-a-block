import {
  ArkanoidPowerup,
  ArkanoidPowerupType,
  ArkanoidState,
  GameState,
  Piece,
  RotationDirection,
  TetrominoType,
  Vec2
} from "./types";

export const BOARD_WIDTH = 10;
export const VISIBLE_ROWS = 20;
export const HIDDEN_ROWS = 2;
export const BOARD_HEIGHT = VISIBLE_ROWS + HIDDEN_ROWS;
export const ARKANOID_TRIGGER_LINES = 10;

const ARKANOID_DURATION = 30_000;
const ARKANOID_LAUNCH_DELAY = 600;
const ARKANOID_PADDLE_WIDTH = 3.6;
const ARKANOID_PADDLE_WIDTH_WIDE = ARKANOID_PADDLE_WIDTH * 1.6;
const ARKANOID_PADDLE_WIDTH_SKINNY = ARKANOID_PADDLE_WIDTH * 0.6;
const ARKANOID_PADDLE_STEP = 0.8;
const ARKANOID_BALL_SPEED = 0.012;
const ARKANOID_POWERUP_DROP_CHANCE = 0.22;
const ARKANOID_POWERUP_SPEED = 0.006;
const ARKANOID_POWERUP_DURATION = 12_000;
const ARKANOID_LASER_DURATION = 10_000;
const ARKANOID_LASER_INTERVAL = 220;
const ARKANOID_LASER_SPEED = 0.03;
const ARKANOID_VISIBLE_START = BOARD_HEIGHT - VISIBLE_ROWS;
const ARKANOID_PADDLE_Y = VISIBLE_ROWS - 1;
const ARKANOID_TOP_BOUNDARY = 0;
const ARKANOID_BALL_RADIUS = 0.32;
const ARKANOID_BALL_START_OFFSET = 0.8;

const TETROMINOES: Record<TetrominoType, Vec2[][]> = {
  I: [
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 }
    ],
    [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 }
    ],
    [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 }
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 }
    ]
  ],
  O: [
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ]
  ],
  T: [
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 }
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 }
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 }
    ]
  ],
  S: [
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 }
    ],
    [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 }
    ],
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 }
    ]
  ],
  Z: [
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 }
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 }
    ],
    [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 }
    ]
  ],
  J: [
    [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 }
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 }
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 }
    ]
  ],
  L: [
    [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ],
    [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 }
    ],
    [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 }
    ],
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 }
    ]
  ]
};

const JLSTZ_KICKS: Record<string, Vec2[]> = {
  "0>1": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 }
  ],
  "1>0": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 }
  ],
  "1>2": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 }
  ],
  "2>1": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 }
  ],
  "2>3": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 }
  ],
  "3>2": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 }
  ],
  "3>0": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 }
  ],
  "0>3": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 }
  ]
};

const I_KICKS: Record<string, Vec2[]> = {
  "0>1": [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: -1 },
    { x: 1, y: 2 }
  ],
  "1>0": [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 1 },
    { x: -1, y: -2 }
  ],
  "1>2": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 2 },
    { x: 2, y: -1 }
  ],
  "2>1": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: -2 },
    { x: -2, y: 1 }
  ],
  "2>3": [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 1 },
    { x: -1, y: -2 }
  ],
  "3>2": [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: -1 },
    { x: 1, y: 2 }
  ],
  "3>0": [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: -2 },
    { x: -2, y: 1 }
  ],
  "0>3": [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 2 },
    { x: 2, y: -1 }
  ]
};

export const COLORS: Record<TetrominoType, string> = {
  I: "#5eead4",
  O: "#fde047",
  T: "#c084fc",
  S: "#86efac",
  Z: "#f87171",
  J: "#60a5fa",
  L: "#fb923c"
};

export const TETROMINO_ORDER: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
export const TETROMINO_INDEX: Record<TetrominoType, number> = TETROMINO_ORDER.reduce(
  (acc, type, index) => {
    acc[type] = index + 1;
    return acc;
  },
  {} as Record<TetrominoType, number>
);

const SPAWN_POSITION: Vec2 = { x: 3, y: 0 };

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const ARKANOID_POWERUP_TYPES: ArkanoidPowerupType[] = ["skinny", "laser", "wide", "multi"];

const createArkanoidState = (): ArkanoidState => {
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

const cloneBoard = (board: number[][]) => board.map((row) => [...row]);

const getKickData = (type: TetrominoType, from: number, to: number) => {
  if (type === "O") return [{ x: 0, y: 0 }];
  const key = `${from}>${to}`;
  return type === "I" ? I_KICKS[key] ?? [{ x: 0, y: 0 }] : JLSTZ_KICKS[key] ?? [{ x: 0, y: 0 }];
};

export const getBlocks = (piece: Piece) =>
  TETROMINOES[piece.type][piece.rotation].map((block) => ({
    x: block.x + piece.position.x,
    y: block.y + piece.position.y
  }));

const isInsideBoard = (pos: Vec2) =>
  pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y < BOARD_HEIGHT;

export const isValidPosition = (board: number[][], piece: Piece) =>
  getBlocks(piece).every((block) =>
    isInsideBoard(block) && (block.y < 0 || board[block.y][block.x] === 0)
  );

const createBag = () => {
  const bag = [...TETROMINO_ORDER];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

const nextQueue = (queue: TetrominoType[]) => {
  const next = [...queue];
  if (next.length < 7) next.push(...createBag());
  return next;
};

const spawnPiece = (queue: TetrominoType[]) => {
  const next = nextQueue(queue);
  const type = next.shift() ?? "I";
  const piece: Piece = { type, rotation: 0, position: { ...SPAWN_POSITION } };
  return { piece, queue: next };
};

export const getDropInterval = (level: number) => Math.max(100, 1000 - (level - 1) * 75);

export const createInitialState = (): GameState => {
  const queue = nextQueue([]);
  const { piece, queue: newQueue } = spawnPiece(queue);
  return {
    board: createEmptyBoard(),
    active: piece,
    hold: null,
    queue: newQueue,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    arkanoidMeter: 0,
    status: "start",
    mode: "tetris",
    dropInterval: getDropInterval(1),
    fallAccumulator: 0,
    lockDelay: 500,
    lockTimer: 0,
    lastClear: 0,
    arkanoid: createArkanoidState()
  };
};

export const startGame = (state: GameState): GameState => ({
  ...state,
  status: "running",
  fallAccumulator: 0,
  lockTimer: 0
});

export const pauseGame = (state: GameState): GameState => ({
  ...state,
  status: state.status === "paused" ? "running" : "paused"
});

export const movePiece = (state: GameState, delta: Vec2): GameState => {
  const moved: Piece = {
    ...state.active,
    position: {
      x: state.active.position.x + delta.x,
      y: state.active.position.y + delta.y
    }
  };
  if (!isValidPosition(state.board, moved)) return state;
  return { ...state, active: moved, lockTimer: 0 };
};

export const rotatePiece = (state: GameState, direction: RotationDirection): GameState => {
  const from = state.active.rotation;
  const to = (from + (direction === "cw" ? 1 : 3)) % 4;
  const kicks = getKickData(state.active.type, from, to);
  for (const kick of kicks) {
    const rotated: Piece = {
      ...state.active,
      rotation: to,
      position: {
        x: state.active.position.x + kick.x,
        y: state.active.position.y + kick.y
      }
    };
    if (isValidPosition(state.board, rotated)) {
      return { ...state, active: rotated, lockTimer: 0 };
    }
  }
  return state;
};

const imprint = (board: number[][], piece: Piece) => {
  const next = cloneBoard(board);
  const value = TETROMINO_INDEX[piece.type];
  getBlocks(piece).forEach((block) => {
    if (block.y >= 0 && block.y < BOARD_HEIGHT) {
      next[block.y][block.x] = value;
    }
  });
  return next;
};

const clearLines = (board: number[][]) => {
  const remaining = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = BOARD_HEIGHT - remaining.length;
  const newRows = Array.from({ length: cleared }, () => Array(BOARD_WIDTH).fill(0));
  return { board: [...newRows, ...remaining], cleared };
};

const scoreLineClear = (lines: number, level: number) => {
  const table = [0, 100, 300, 500, 800];
  return (table[lines] ?? 0) * level;
};

const updateLevel = (lines: number) => Math.floor(lines / 10) + 1;

const lockPiece = (state: GameState): GameState => {
  const merged = imprint(state.board, state.active);
  const { board, cleared } = clearLines(merged);
  const totalLines = state.lines + cleared;
  const level = updateLevel(totalLines);
  const { piece, queue } = spawnPiece(state.queue);
  const arkanoidMeter = state.arkanoidMeter + cleared;
  const remainder = arkanoidMeter % ARKANOID_TRIGGER_LINES;
  const nextState: GameState = {
    ...state,
    board,
    active: piece,
    queue,
    canHold: true,
    lines: totalLines,
    level,
    dropInterval: getDropInterval(level),
    score: state.score + scoreLineClear(cleared, state.level),
    fallAccumulator: 0,
    lockTimer: 0,
    lastClear: cleared,
    arkanoidMeter: remainder
  };
  if (!isValidPosition(nextState.board, nextState.active)) {
    return { ...nextState, status: "over" };
  }
  if (cleared > 0 && arkanoidMeter >= ARKANOID_TRIGGER_LINES) {
    return enterArkanoid(nextState);
  }
  return nextState;
};

export const softDrop = (state: GameState): GameState => {
  const moved = movePiece(state, { x: 0, y: 1 });
  if (moved === state) return state;
  return { ...moved, score: state.score + 1 };
};

export const hardDrop = (state: GameState): GameState => {
  let current = state;
  let dropDistance = 0;
  while (true) {
    const moved = movePiece(current, { x: 0, y: 1 });
    if (moved === current) break;
    current = moved;
    dropDistance += 1;
  }
  const locked = lockPiece({ ...current, score: current.score + dropDistance * 2 });
  return locked;
};

export const holdPiece = (state: GameState): GameState => {
  if (!state.canHold) return state;
  if (state.hold) {
    const swapped: Piece = {
      type: state.hold,
      rotation: 0,
      position: { ...SPAWN_POSITION }
    };
    if (!isValidPosition(state.board, swapped)) return state;
    return {
      ...state,
      active: swapped,
      hold: state.active.type,
      canHold: false,
      lockTimer: 0
    };
  }
  const { piece, queue } = spawnPiece(state.queue);
  return {
    ...state,
    hold: state.active.type,
    active: piece,
    queue,
    canHold: false,
    lockTimer: 0
  };
};

const enterArkanoid = (state: GameState): GameState => ({
  ...state,
  mode: "arkanoid",
  arkanoid: createArkanoidState(),
  fallAccumulator: 0,
  lockTimer: 0
});

export const forceArkanoid = (state: GameState): GameState => {
  if (state.status === "over") return state;
  const base = state.status === "start" ? startGame(state) : state;
  return enterArkanoid(base);
};

const exitArkanoid = (state: GameState): GameState => ({
  ...state,
  mode: "tetris",
  fallAccumulator: 0,
  lockTimer: 0
});

const hasVisibleBricks = (board: number[][]) => {
  for (let y = ARKANOID_VISIBLE_START; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (board[y][x] > 0) return true;
    }
  }
  return false;
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

const tickTetris = (state: GameState, deltaMs: number): GameState => {
  let next: GameState = { ...state, fallAccumulator: state.fallAccumulator + deltaMs };
  while (next.fallAccumulator >= next.dropInterval) {
    const moved = movePiece(next, { x: 0, y: 1 });
    if (moved === next) break;
    next = { ...moved, fallAccumulator: next.fallAccumulator - next.dropInterval };
  }
  const canMoveDown = movePiece(next, { x: 0, y: 1 }) !== next;
  if (canMoveDown) {
    next = { ...next, lockTimer: 0 };
  } else {
    const lockTimer = next.lockTimer + deltaMs;
    if (lockTimer >= next.lockDelay) {
      return lockPiece(next);
    }
    next = { ...next, lockTimer };
  }
  return next;
};

const tickArkanoid = (state: GameState, deltaMs: number): GameState => {
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
    return exitArkanoid({ ...state, arkanoid: nextArkanoid });
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
    return exitArkanoid(nextState);
  }

  if (!hasVisibleBricks(board)) {
    return exitArkanoid({ ...nextState, score: nextState.score + 150 });
  }

  return nextState;
};

export const tick = (state: GameState, deltaMs: number): GameState => {
  if (state.status !== "running") return state;
  if (state.mode === "arkanoid") return tickArkanoid(state, deltaMs);
  return tickTetris(state, deltaMs);
};

export const getGhost = (state: GameState): Piece => {
  let ghost = state.active;
  while (true) {
    const moved = { ...ghost, position: { x: ghost.position.x, y: ghost.position.y + 1 } };
    if (!isValidPosition(state.board, moved)) break;
    ghost = moved;
  }
  return ghost;
};

export const resetGame = (): GameState => createInitialState();
