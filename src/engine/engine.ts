import { GameState, Piece, RotationDirection, TetrominoType, Vec2 } from "./types";

export const BOARD_WIDTH = 10;
export const VISIBLE_ROWS = 20;
export const HIDDEN_ROWS = 2;
export const BOARD_HEIGHT = VISIBLE_ROWS + HIDDEN_ROWS;

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

const TETROMINO_KEYS: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

const SPAWN_POSITION: Vec2 = { x: 3, y: 0 };

export const createEmptyBoard = () =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

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
  const bag = [...TETROMINO_KEYS];
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
    status: "start",
    dropInterval: getDropInterval(1),
    fallAccumulator: 0,
    lockDelay: 500,
    lockTimer: 0,
    lastClear: 0
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
  const value = TETROMINO_KEYS.indexOf(piece.type) + 1;
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
    lastClear: cleared
  };
  if (!isValidPosition(nextState.board, nextState.active)) {
    return { ...nextState, status: "over" };
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

export const tick = (state: GameState, deltaMs: number): GameState => {
  if (state.status !== "running") return state;
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
