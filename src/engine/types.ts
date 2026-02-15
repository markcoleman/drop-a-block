export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Vec2 = { x: number; y: number };

export type Piece = {
  type: TetrominoType;
  rotation: number;
  position: Vec2;
};

export type GameStatus = "start" | "running" | "paused" | "over";

export type GameMode = "tetris" | "arkanoid" | "doom";

export type PlayMode = "marathon" | "sprint" | "ultra";

export type GameModifiers = {
  turbo: boolean;
  mirror: boolean;
  noGhost: boolean;
  floaty: boolean;
  freeHold: boolean;
  arcadeRush: boolean;
  party: boolean;
};

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

export type DoomInput = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
};

export type DoomEnemy = {
  id: number;
  x: number;
  y: number;
  health: number;
  speed: number;
};

export type DoomItemType = "health" | "armor" | "ammo";

export type DoomItem = {
  id: number;
  x: number;
  y: number;
  type: DoomItemType;
};

export type DoomState = {
  player: {
    x: number;
    y: number;
    angle: number;
  };
  input: DoomInput;
  timeLeft: number;
  exit: {
    x: number;
    y: number;
  };
  shotCooldown: number;
  health: number;
  armor: number;
  ammo: number;
  enemies: DoomEnemy[];
  items: DoomItem[];
  nextEntityId: number;
  damageCooldown: number;
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
  doomMeter: number;
  bonusTimeLeft: number;
  bonusMultiplier: number;
  status: GameStatus;
  mode: GameMode;
  playMode: PlayMode;
  modeTimer: number;
  targetLines: number;
  result: "win" | "lose" | null;
  modifiers: GameModifiers;
  dropInterval: number;
  fallAccumulator: number;
  lockDelay: number;
  lockTimer: number;
  lastClear: number;
  arkanoid: ArkanoidState;
  doom: DoomState;
};

export type RotationDirection = "cw" | "ccw";
