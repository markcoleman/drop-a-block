import {
  doomShoot,
  forceArkanoid,
  hardDrop,
  holdPiece,
  launchBall,
  movePaddle,
  movePiece,
  pauseGame,
  rotatePiece,
  setDoomInput,
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
  | "pause"
  | "debugArkanoid"
  | "doomForwardDown"
  | "doomForwardUp"
  | "doomBackDown"
  | "doomBackUp"
  | "doomLeftDown"
  | "doomLeftUp"
  | "doomRightDown"
  | "doomRightUp"
  | "doomShoot";

export const canApplyAction = (state: GameState, action: Action): boolean => {
  if (action === "pause" || action === "debugArkanoid") return true;
  if (state.status === "start") return true;
  return state.status === "running";
};

export const applyAction = (state: GameState, action: Action): GameState => {
  if (action === "pause") return pauseGame(state);
  if (action === "debugArkanoid") return forceArkanoid(state);

  if (state.status === "start") {
    return startGame(state);
  }

  if (state.status !== "running") return state;

  if (state.mode === "doom") {
    switch (action) {
      case "doomForwardDown":
        return setDoomInput(state, { forward: true });
      case "doomForwardUp":
        return setDoomInput(state, { forward: false });
      case "doomBackDown":
        return setDoomInput(state, { back: true });
      case "doomBackUp":
        return setDoomInput(state, { back: false });
      case "doomLeftDown":
        return setDoomInput(state, { left: true });
      case "doomLeftUp":
        return setDoomInput(state, { left: false });
      case "doomRightDown":
        return setDoomInput(state, { right: true });
      case "doomRightUp":
        return setDoomInput(state, { right: false });
      case "doomShoot":
        return doomShoot(state);
      default:
        return state;
    }
  }

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
