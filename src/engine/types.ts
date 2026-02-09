export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Vec2 = { x: number; y: number };

export type Piece = {
  type: TetrominoType;
  rotation: number;
  position: Vec2;
};

export type GameStatus = "start" | "running" | "paused" | "over";

export type GameState = {
  board: number[][];
  active: Piece;
  hold: TetrominoType | null;
  queue: TetrominoType[];
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  status: GameStatus;
  dropInterval: number;
  fallAccumulator: number;
  lockDelay: number;
  lockTimer: number;
  lastClear: number;
};

export type RotationDirection = "cw" | "ccw";
