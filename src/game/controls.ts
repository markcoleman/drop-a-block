import { Action } from "./actions";

export const keyMap = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowUp: "rotateCw",
  KeyX: "rotateCw",
  KeyZ: "rotateCcw",
  Space: "hardDrop",
  KeyC: "hold",
  ShiftLeft: "hold",
  ShiftRight: "hold",
  KeyP: "pause",
  Escape: "pause"
} as const satisfies Record<string, Action>;

export type RepeatableAction = "left" | "right" | "down";

export const isRepeatableAction = (action: Action): action is RepeatableAction =>
  action === "left" || action === "right" || action === "down";

export const getActionForKey = (code: string): Action | null =>
  keyMap[code as keyof typeof keyMap] ?? null;
