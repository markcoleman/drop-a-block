import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DOOM_DURATION,
  DOOM_EXIT_RADIUS,
  DOOM_EXIT_BONUS,
  DOOM_PLAYER_SPEED,
  DOOM_SHOT_COOLDOWN,
  VISIBLE_ROWS
} from "./constants";
import { cloneBoard } from "./board";
import type { DoomInput, DoomState, GameState } from "./types";

const EMPTY_INPUT: DoomInput = {
  forward: false,
  back: false,
  left: false,
  right: false
};

const clampAngle = (angle: number) => {
  const twoPi = Math.PI * 2;
  let next = angle % twoPi;
  if (next < 0) next += twoPi;
  return next;
};

const toBoardY = (gridY: number) => BOARD_HEIGHT - 1 - gridY;

const isWallAt = (board: number[][], x: number, y: number) => {
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);
  if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) {
    return true;
  }
  const boardY = toBoardY(gridY);
  return board[boardY]?.[gridX] > 0;
};

const canMoveTo = (board: number[][], x: number, y: number, radius: number) => {
  return (
    !isWallAt(board, x - radius, y - radius) &&
    !isWallAt(board, x + radius, y - radius) &&
    !isWallAt(board, x - radius, y + radius) &&
    !isWallAt(board, x + radius, y + radius)
  );
};

const clearCell = (board: number[][], gridX: number, gridY: number) => {
  if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) return board;
  const boardY = toBoardY(gridY);
  if (board[boardY]?.[gridX] === 0) return board;
  const next = cloneBoard(board);
  next[boardY][gridX] = 0;
  return next;
};

const carveSpawn = (board: number[][], gridX: number, gridY: number) => {
  let next = board;
  const offsets = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ];
  offsets.forEach(([dx, dy]) => {
    next = clearCell(next, gridX + dx, gridY + dy);
  });
  return next;
};

const pickExit = (board: number[][]) => {
  const gridY = VISIBLE_ROWS - 1;
  const candidates: number[] = [];
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    candidates.push(x);
  }
  const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
  return { x: chosen, y: gridY };
};

export const createEmptyDoomState = (): DoomState => ({
  player: { x: BOARD_WIDTH / 2, y: 0.5, angle: Math.PI / 2 },
  input: { ...EMPTY_INPUT },
  timeLeft: 0,
  exit: { x: Math.floor(BOARD_WIDTH / 2), y: VISIBLE_ROWS - 1 },
  shotCooldown: 0
});

export const createDoomState = (board: number[][]) => {
  const spawnCell = { x: Math.max(0, Math.floor(BOARD_WIDTH / 2) - 1), y: 0 };
  let nextBoard = carveSpawn(board, spawnCell.x, spawnCell.y);
  const exit = pickExit(nextBoard);
  nextBoard = clearCell(nextBoard, exit.x, exit.y);
  const doom: DoomState = {
    player: { x: spawnCell.x + 0.5, y: spawnCell.y + 0.5, angle: Math.PI / 2 },
    input: { ...EMPTY_INPUT },
    timeLeft: DOOM_DURATION,
    exit,
    shotCooldown: 0
  };
  return { board: nextBoard, doom };
};

export const setDoomInput = (state: GameState, input: Partial<DoomInput>): GameState => {
  if (state.mode !== "doom") return state;
  return {
    ...state,
    doom: {
      ...state.doom,
      input: { ...state.doom.input, ...input }
    }
  };
};

export const turnDoom = (state: GameState, delta: number): GameState => {
  if (state.mode !== "doom") return state;
  return {
    ...state,
    doom: {
      ...state.doom,
      player: {
        ...state.doom.player,
        angle: clampAngle(state.doom.player.angle + delta)
      }
    }
  };
};

export const doomShoot = (state: GameState): GameState => {
  if (state.mode !== "doom") return state;
  if (state.doom.shotCooldown > 0) return state;
  const { x, y, angle } = state.doom.player;
  const step = 0.08;
  const maxRange = VISIBLE_ROWS + 2;
  let distance = 0;
  let hitCell: { x: number; y: number } | null = null;
  while (distance < maxRange) {
    const sampleX = x + Math.cos(angle) * distance;
    const sampleY = y + Math.sin(angle) * distance;
    const gridX = Math.floor(sampleX);
    const gridY = Math.floor(sampleY);
    if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) {
      break;
    }
    if (isWallAt(state.board, sampleX, sampleY)) {
      hitCell = { x: gridX, y: gridY };
      break;
    }
    distance += step;
  }
  if (!hitCell) {
    return {
      ...state,
      doom: { ...state.doom, shotCooldown: DOOM_SHOT_COOLDOWN }
    };
  }
  const nextBoard = clearCell(state.board, hitCell.x, hitCell.y);
  return {
    ...state,
    board: nextBoard,
    doom: { ...state.doom, shotCooldown: DOOM_SHOT_COOLDOWN }
  };
};

export const tickDoom = (state: GameState, deltaMs: number): GameState => {
  if (state.mode !== "doom") return state;
  const doom = state.doom;
  const nextTime = Math.max(0, doom.timeLeft - deltaMs);
  const cooldown = Math.max(0, doom.shotCooldown - deltaMs);
  const forward = { x: Math.cos(doom.player.angle), y: Math.sin(doom.player.angle) };
  const right = { x: -Math.sin(doom.player.angle), y: Math.cos(doom.player.angle) };
  let moveX = 0;
  let moveY = 0;
  if (doom.input.forward) {
    moveX += forward.x;
    moveY += forward.y;
  }
  if (doom.input.back) {
    moveX -= forward.x;
    moveY -= forward.y;
  }
  if (doom.input.left) {
    moveX -= right.x;
    moveY -= right.y;
  }
  if (doom.input.right) {
    moveX += right.x;
    moveY += right.y;
  }
  const length = Math.hypot(moveX, moveY);
  let nextX = doom.player.x;
  let nextY = doom.player.y;
  if (length > 0) {
    const scale = (DOOM_PLAYER_SPEED * deltaMs) / length;
    const stepX = moveX * scale;
    const stepY = moveY * scale;
    const radius = 0.18;
    if (canMoveTo(state.board, nextX + stepX, nextY, radius)) {
      nextX += stepX;
    }
    if (canMoveTo(state.board, nextX, nextY + stepY, radius)) {
      nextY += stepY;
    }
  }

  const exitCenter = { x: doom.exit.x + 0.5, y: doom.exit.y + 0.5 };
  const exitDistance = Math.hypot(nextX - exitCenter.x, nextY - exitCenter.y);
  if (exitDistance <= DOOM_EXIT_RADIUS) {
    return {
      ...state,
      mode: "tetris",
      score: state.score + DOOM_EXIT_BONUS,
      fallAccumulator: 0,
      lockTimer: 0,
      doom: { ...doom, timeLeft: 0, shotCooldown: cooldown }
    };
  }

  if (nextTime === 0) {
    return {
      ...state,
      mode: "tetris",
      fallAccumulator: 0,
      lockTimer: 0,
      doom: { ...doom, timeLeft: 0, shotCooldown: cooldown }
    };
  }

  return {
    ...state,
    doom: {
      ...doom,
      timeLeft: nextTime,
      shotCooldown: cooldown,
      player: { ...doom.player, x: nextX, y: nextY }
    }
  };
};
