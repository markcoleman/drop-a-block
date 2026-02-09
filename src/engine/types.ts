export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Vec2 = { x: number; y: number };

export type Piece = {
  type: TetrominoType;
  rotation: number;
  position: Vec2;
};

export type GameStatus = "start" | "running" | "paused" | "over";

export type GameMode = "tetris" | "arkanoid";

export type PlayMode = "marathon" | "sprint" | "ultra";

export type ArkanoidBall = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type ArkanoidPowerupType = "skinny" | "wide" | "laser" | "multi";

export type ArkanoidPowerup = {
  id: number;
  type: ArkanoidPowerupType;
  x: number;
  y: number;
  vy: number;
};

export type ArkanoidLaser = {
  x: number;
  y: number;
  vy: number;
};

export type ArkanoidState = {
  paddleX: number;
  paddleWidth: number;
  balls: ArkanoidBall[];
  powerups: ArkanoidPowerup[];
  lasers: ArkanoidLaser[];
  powerupTimers: {
    skinny: number;
    wide: number;
    laser: number;
  };
  laserCooldown: number;
  nextPowerupId: number;
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
  playMode: PlayMode;
  modeTimer: number;
  targetLines: number;
  result: "win" | "lose" | null;
  dropInterval: number;
  fallAccumulator: number;
  lockDelay: number;
  lockTimer: number;
  lastClear: number;
  arkanoid: ArkanoidState;
};

export type RotationDirection = "cw" | "ccw";
