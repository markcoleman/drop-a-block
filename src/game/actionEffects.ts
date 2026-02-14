import { playLock, playMove, playRotate } from "../audio/sfx";
import type { Action } from "./actions";

export type ActionEffect = {
  sound?: () => void;
  haptics?: boolean;
};

export const ACTION_EFFECTS: Partial<Record<Action, ActionEffect>> = {
  left: { sound: playMove },
  right: { sound: playMove },
  down: { sound: playMove },
  rotateCw: { sound: playRotate },
  rotateCcw: { sound: playRotate },
  hardDrop: { sound: playLock, haptics: true },
  hold: { sound: playRotate }
};
