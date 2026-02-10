import {
  ARKANOID_TRIGGER_LINES,
  SPAWN_POSITION,
  SPRINT_TARGET_LINES,
  ULTRA_DURATION
} from "./constants";
import { createEmptyBoard, isValidPosition } from "./board";
import {
  DEFAULT_MODIFIERS,
  clearLines,
  getDropInterval,
  imprintBoard,
  scoreLineClear,
  updateLevel
} from "./rules";
import { canMoveDown, movePiece, nextQueue, spawnPiece } from "./tetris";
import { createArkanoidState, tickArkanoid } from "./arkanoid";
import type { GameModifiers, GameState, PlayMode } from "./types";

export const createInitialState = (
  playMode: PlayMode = "marathon",
  modifiers: GameModifiers = DEFAULT_MODIFIERS
): GameState => {
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
    playMode,
    modeTimer: playMode === "ultra" ? ULTRA_DURATION : 0,
    targetLines: playMode === "sprint" ? SPRINT_TARGET_LINES : 0,
    result: null,
    modifiers,
    dropInterval: getDropInterval(1, modifiers),
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

const lockPiece = (state: GameState): GameState => {
  const merged = imprintBoard(state.board, state.active);
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
    dropInterval: getDropInterval(level, state.modifiers),
    score: state.score + scoreLineClear(cleared, state.level),
    fallAccumulator: 0,
    lockTimer: 0,
    lastClear: cleared,
    arkanoidMeter: remainder
  };
  if (state.playMode === "sprint" && totalLines >= state.targetLines) {
    return { ...nextState, status: "over", result: "win" };
  }
  if (!isValidPosition(nextState.board, nextState.active)) {
    return { ...nextState, status: "over", result: "lose" };
  }
  if (cleared > 0 && arkanoidMeter >= ARKANOID_TRIGGER_LINES) {
    return {
      ...nextState,
      mode: "arkanoid",
      arkanoid: createArkanoidState(),
      fallAccumulator: 0,
      lockTimer: 0
    };
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
    const swapped = {
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

export const forceArkanoid = (state: GameState): GameState => {
  if (state.status === "over") return state;
  const base = state.status === "start" ? startGame(state) : state;
  return {
    ...base,
    mode: "arkanoid",
    arkanoid: createArkanoidState(),
    fallAccumulator: 0,
    lockTimer: 0
  };
};

const tickTetris = (state: GameState, deltaMs: number): GameState => {
  let next: GameState = { ...state, fallAccumulator: state.fallAccumulator + deltaMs };
  while (next.fallAccumulator >= next.dropInterval) {
    const moved = movePiece(next, { x: 0, y: 1 });
    if (moved === next) break;
    next = { ...moved, fallAccumulator: next.fallAccumulator - next.dropInterval };
  }
  if (canMoveDown(next)) {
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

export const tick = (state: GameState, deltaMs: number): GameState => {
  if (state.status !== "running") return state;
  let nextState = state;
  if (state.playMode === "ultra") {
    const nextTimer = Math.max(0, state.modeTimer - deltaMs);
    nextState = { ...state, modeTimer: nextTimer };
    if (nextTimer === 0) {
      return { ...nextState, status: "over", result: "win" };
    }
  }
  if (nextState.mode === "arkanoid") return tickArkanoid(nextState, deltaMs);
  return tickTetris(nextState, deltaMs);
};

export const resetGame = (
  playMode: PlayMode = "marathon",
  modifiers: GameModifiers = DEFAULT_MODIFIERS
): GameState => createInitialState(playMode, modifiers);
