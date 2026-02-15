import {
  BONUS_LINE_BONUS,
  BONUS_MULTIPLIER_START,
  BONUS_MULTIPLIER_STEP,
  BONUS_SPEED_FACTOR,
  BONUS_TIME_PER_TRIGGER,
  BONUS_TRIGGER_LINES,
  SPAWN_POSITION,
  SPRINT_TARGET_LINES,
  ULTRA_DURATION
} from "./constants";
import { createEmptyBoard, isValidPosition } from "./board";
import {
  DEFAULT_MODIFIERS,
  clearLines,
  getArkanoidTriggerLines,
  getDoomTriggerLines,
  getDropInterval,
  getLockDelay,
  imprintBoard,
  scoreLineClear,
  updateLevel
} from "./rules";
import { canMoveDown, movePiece, nextQueue, spawnPiece } from "./tetris";
import { createArkanoidState, tickArkanoid } from "./arkanoid";
import { createDoomState, createEmptyDoomState, tickDoom } from "./doom";
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
    doomMeter: 0,
    bonusTimeLeft: 0,
    bonusMultiplier: 1,
    status: "start",
    mode: "tetris",
    playMode,
    modeTimer: playMode === "ultra" ? ULTRA_DURATION : 0,
    targetLines: playMode === "sprint" ? SPRINT_TARGET_LINES : 0,
    result: null,
    modifiers,
    dropInterval: getDropInterval(1, modifiers),
    fallAccumulator: 0,
    lockDelay: getLockDelay(modifiers),
    lockTimer: 0,
    lastClear: 0,
    arkanoid: createArkanoidState(),
    doom: createEmptyDoomState()
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
  const arkanoidTrigger = getArkanoidTriggerLines(state.modifiers);
  const doomTrigger = getDoomTriggerLines(state.modifiers);
  const arkanoidMeter = state.arkanoidMeter + cleared;
  const doomMeter = state.doomMeter + cleared;
  const arkanoidRemainder = arkanoidMeter % arkanoidTrigger;
  const doomRemainder = doomMeter % doomTrigger;
  const doomReady = cleared > 0 && doomMeter >= doomTrigger;
  const bonusChunks = Math.floor(cleared / BONUS_TRIGGER_LINES);
  const bonusTriggered = bonusChunks > 0;
  const bonusTimeLeft = bonusTriggered
    ? state.bonusTimeLeft + BONUS_TIME_PER_TRIGGER * bonusChunks
    : state.bonusTimeLeft;
  const bonusActive = bonusTimeLeft > 0;
  let bonusMultiplier = state.bonusMultiplier;
  if (bonusTriggered && bonusMultiplier < BONUS_MULTIPLIER_START) {
    bonusMultiplier = BONUS_MULTIPLIER_START;
  }
  const baseScore = scoreLineClear(cleared, state.level);
  let scoreDelta = baseScore;
  if (cleared > 0 && bonusActive) {
    scoreDelta =
      Math.round(baseScore * bonusMultiplier) + cleared * BONUS_LINE_BONUS * state.level;
    bonusMultiplier += cleared * BONUS_MULTIPLIER_STEP;
  }
  if (!bonusActive) {
    bonusMultiplier = 1;
  }
  const nextState: GameState = {
    ...state,
    board,
    active: piece,
    queue,
    canHold: true,
    lines: totalLines,
    level,
    dropInterval: getDropInterval(level, state.modifiers),
    score: state.score + scoreDelta,
    fallAccumulator: 0,
    lockTimer: 0,
    lastClear: cleared,
    arkanoidMeter: arkanoidRemainder,
    doomMeter: doomRemainder,
    bonusTimeLeft,
    bonusMultiplier
  };
  if (state.playMode === "sprint" && totalLines >= state.targetLines) {
    return { ...nextState, status: "over", result: "win" };
  }
  if (!isValidPosition(nextState.board, nextState.active)) {
    return { ...nextState, status: "over", result: "lose" };
  }
  if (doomReady) {
    const { board: doomBoard, doom } = createDoomState(nextState.board);
    return {
      ...nextState,
      mode: "doom",
      board: doomBoard,
      doom,
      fallAccumulator: 0,
      lockTimer: 0
    };
  }
  if (cleared > 0 && arkanoidMeter >= arkanoidTrigger) {
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
  if (!state.canHold && !state.modifiers.freeHold) return state;
  const allowRepeatHold = state.modifiers.freeHold;
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
      canHold: allowRepeatHold,
      lockTimer: 0
    };
  }
  const { piece, queue } = spawnPiece(state.queue);
  return {
    ...state,
    hold: state.active.type,
    active: piece,
    queue,
    canHold: allowRepeatHold,
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

export const forceDoom = (state: GameState): GameState => {
  if (state.status === "over") return state;
  const base = state.status === "start" ? startGame(state) : state;
  const { board, doom } = createDoomState(base.board);
  return {
    ...base,
    mode: "doom",
    board,
    doom,
    fallAccumulator: 0,
    lockTimer: 0
  };
};

const tickBonusTimer = (state: GameState, deltaMs: number): GameState => {
  if (state.mode !== "tetris" || state.bonusTimeLeft <= 0) return state;
  const bonusTimeLeft = Math.max(0, state.bonusTimeLeft - deltaMs);
  if (bonusTimeLeft === state.bonusTimeLeft) return state;
  return {
    ...state,
    bonusTimeLeft,
    bonusMultiplier: bonusTimeLeft === 0 ? 1 : state.bonusMultiplier
  };
};

const tickTetris = (state: GameState, deltaMs: number): GameState => {
  const effectiveInterval =
    state.bonusTimeLeft > 0
      ? Math.max(60, Math.round(state.dropInterval * BONUS_SPEED_FACTOR))
      : state.dropInterval;
  let next: GameState = { ...state, fallAccumulator: state.fallAccumulator + deltaMs };
  while (next.fallAccumulator >= effectiveInterval) {
    const moved = movePiece(next, { x: 0, y: 1 });
    if (moved === next) break;
    next = { ...moved, fallAccumulator: next.fallAccumulator - effectiveInterval };
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
  let nextState = tickBonusTimer(state, deltaMs);
  if (nextState.playMode === "ultra") {
    const nextTimer = Math.max(0, nextState.modeTimer - deltaMs);
    nextState = { ...nextState, modeTimer: nextTimer };
    if (nextTimer === 0) {
      return { ...nextState, status: "over", result: "win" };
    }
  }
  if (nextState.mode === "doom") return tickDoom(nextState, deltaMs);
  if (nextState.mode === "arkanoid") return tickArkanoid(nextState, deltaMs);
  return tickTetris(nextState, deltaMs);
};

export const resetGame = (
  playMode: PlayMode = "marathon",
  modifiers: GameModifiers = DEFAULT_MODIFIERS
): GameState => createInitialState(playMode, modifiers);
