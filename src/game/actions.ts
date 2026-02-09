import {
  hardDrop,
  holdPiece,
  launchBall,
  movePiece,
  movePaddle,
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

  if (state.mode === "arkanoid") {
    switch (action) {
      case "left":
        return movePaddle(state, -1);
      case "right":
        return movePaddle(state, 1);
      case "down":
      case "rotateCw":
      case "rotateCcw":
      case "hardDrop":
        return launchBall(state);
      default:
        return state;
    }
  }

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
