export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Vec2 = { x: number; y: number };

export type Piece = {
  type: TetrominoType;
  rotation: number;
  position: Vec2;
};

export type GameStatus = "start" | "running" | "paused" | "over";

export type GameMode = "tetris" | "arkanoid";

export type ArkanoidBall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type ArkanoidState = {
  paddleX: number;
  paddleWidth: number;
  ball: ArkanoidBall;
  timeLeft: number;
  launchDelay: number;
};

export type GameState = {
  board: number[][];
  active: Piece;
  hold: TetrominoType | null;
  queue: TetrominoType[];
  canHold: boolean;
  score: number;
  level: number;
  lines: number;
  arkanoidMeter: number;
  status: GameStatus;
  mode: GameMode;
  dropInterval: number;
  fallAccumulator: number;
  lockDelay: number;
  lockTimer: number;
  lastClear: number;
  arkanoid: ArkanoidState;
};

export type RotationDirection = "cw" | "ccw";
