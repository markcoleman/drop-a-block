import {
  hardDrop,
  holdPiece,
  movePiece,
  pauseGame,
  rotatePiece,
  softDrop,
  startGame
} from "../engine/engine";
import { GameState } from "../engine/types";

export type Action =
  | "left"
  | "right"
  | "down"
  | "rotateCw"
  | "rotateCcw"
  | "hardDrop"
  | "hold"
  | "pause";

export const canApplyAction = (state: GameState, action: Action): boolean => {
  if (action === "pause") return true;
  if (state.status === "start") return true;
  return state.status === "running";
};

export const applyAction = (state: GameState, action: Action): GameState => {
  if (action === "pause") return pauseGame(state);

  if (state.status === "start") {
    return startGame(state);
  }

  if (state.status !== "running") return state;

  switch (action) {
    case "left":
      return movePiece(state, { x: -1, y: 0 });
    case "right":
      return movePiece(state, { x: 1, y: 0 });
    case "down":
      return softDrop(state);
    case "rotateCw":
      return rotatePiece(state, "cw");
    case "rotateCcw":
      return rotatePiece(state, "ccw");
    case "hardDrop":
      return hardDrop(state);
    case "hold":
      return holdPiece(state);
    default:
      return state;
  }
};
