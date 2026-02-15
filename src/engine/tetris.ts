import { isValidPosition } from "./board";
import { I_KICKS, JLSTZ_KICKS, SPAWN_POSITION, TETROMINO_ORDER } from "./constants";
import type { GameState, Piece, RotationDirection, TetrominoType, Vec2 } from "./types";

const getKickData = (type: TetrominoType, from: number, to: number) => {
  if (type === "O") return [{ x: 0, y: 0 }];
  const key = `${from}>${to}`;
  return type === "I" ? (I_KICKS[key] ?? [{ x: 0, y: 0 }]) : (JLSTZ_KICKS[key] ?? [{ x: 0, y: 0 }]);
};

const createBag = () => {
  const bag = [...TETROMINO_ORDER];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
};

export const nextQueue = (queue: TetrominoType[]) => {
  const next = [...queue];
  if (next.length < 7) next.push(...createBag());
  return next;
};

export const spawnPiece = (queue: TetrominoType[]) => {
  const next = nextQueue(queue);
  const type = next.shift() ?? "I";
  const piece: Piece = { type, rotation: 0, position: { ...SPAWN_POSITION } };
  return { piece, queue: next };
};

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

export const getGhost = (state: GameState): Piece => {
  let ghost = state.active;
  while (true) {
    const moved = { ...ghost, position: { x: ghost.position.x, y: ghost.position.y + 1 } };
    if (!isValidPosition(state.board, moved)) break;
    ghost = moved;
  }
  return ghost;
};

export const canMoveDown = (state: GameState) => movePiece(state, { x: 0, y: 1 }) !== state;
