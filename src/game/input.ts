import type { MutableRefObject } from "react";
import { useCallback, useEffect, useRef } from "react";

import type { GameState, GameStatus } from "../engine/types";
import { isEditableTarget } from "../utils/dom";
import type { Settings } from "../utils/storage";
import type { Action } from "./actions";
import { getActionForKey, isRepeatableAction, RepeatableAction } from "./controls";

type TimerKey = RepeatableAction | `${RepeatableAction}Interval`;

type InputOptions = {
  enabled: boolean;
  allowHold: boolean;
  gameStatus: GameStatus;
  settings: Settings;
  stateRef: MutableRefObject<GameState>;
  onAction: (action: Action) => void;
};

export const useInput = ({
  enabled,
  allowHold,
  gameStatus,
  settings,
  stateRef,
  onAction
}: InputOptions) => {
  const inputTimers = useRef<Record<TimerKey, number | undefined>>({
    left: undefined,
    right: undefined,
    down: undefined,
    leftInterval: undefined,
    rightInterval: undefined,
    downInterval: undefined
  });
  const heldDirections = useRef<Record<RepeatableAction, boolean>>({
    left: false,
    right: false,
    down: false
  });

  const clearTimer = useCallback((key: TimerKey) => {
    const timerId = inputTimers.current[key];
    if (!timerId) return;
    if (key.endsWith("Interval")) {
      window.clearInterval(timerId);
    } else {
      window.clearTimeout(timerId);
    }
    inputTimers.current[key] = undefined;
  }, []);

  const stopRepeat = useCallback(
    (direction: RepeatableAction) => {
      heldDirections.current[direction] = false;
      clearTimer(direction);
      clearTimer(`${direction}Interval` as TimerKey);
    },
    [clearTimer]
  );

  const stopAll = useCallback(() => {
    (Object.keys(heldDirections.current) as RepeatableAction[]).forEach((direction) => {
      heldDirections.current[direction] = false;
      stopRepeat(direction);
    });
  }, [stopRepeat]);

  const fireAction = useCallback(
    (action: Action) => {
      if (!enabled) return;
      if (action === "hold" && !allowHold) return;
      onAction(action);
    },
    [allowHold, enabled, onAction]
  );

  const isRepeating = useCallback(
    (direction: RepeatableAction) =>
      Boolean(
        inputTimers.current[direction] || inputTimers.current[`${direction}Interval` as TimerKey]
      ),
    []
  );

  const startRepeat = useCallback(
    (direction: RepeatableAction) => {
      if (!enabled) return;
      if (stateRef.current.status !== "running") return;
      heldDirections.current[direction] = true;
      if (direction === "left" && isRepeating("right")) stopRepeat("right");
      if (direction === "right" && isRepeating("left")) stopRepeat("left");
      if (isRepeating(direction)) return;
      fireAction(direction);
      const timeoutId = window.setTimeout(() => {
        if (!heldDirections.current[direction]) return;
        const intervalId = window.setInterval(() => {
          fireAction(direction);
        }, settings.arr);
        inputTimers.current[`${direction}Interval` as const] = intervalId;
      }, settings.das);
      inputTimers.current[direction] = timeoutId;
    },
    [enabled, fireAction, isRepeating, settings.arr, settings.das, stateRef, stopRepeat]
  );

  useEffect(() => {
    if (!enabled || gameStatus !== "running") {
      stopAll();
    }
  }, [enabled, gameStatus, stopAll]);

  useEffect(() => {
    stopAll();
  }, [settings.arr, settings.das, stopAll]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabled || isEditableTarget(event.target)) {
        return;
      }
      if (stateRef.current.mode === "doom") {
        switch (event.code) {
          case "KeyW":
            event.preventDefault();
            fireAction("doomForwardDown");
            return;
          case "KeyS":
            event.preventDefault();
            fireAction("doomBackDown");
            return;
          case "KeyA":
            event.preventDefault();
            fireAction("doomLeftDown");
            return;
          case "KeyD":
            event.preventDefault();
            fireAction("doomRightDown");
            return;
          case "Space":
            event.preventDefault();
            fireAction("doomShoot");
            return;
          default:
            break;
        }
        const doomAction = getActionForKey(event.code);
        if (doomAction && doomAction !== "pause") {
          event.preventDefault();
          return;
        }
      }
      const action = getActionForKey(event.code);
      if (!action) return;
      if (action === "hold" && !allowHold) return;
      event.preventDefault();
      if (event.repeat) return;
      if (isRepeatableAction(action)) {
        heldDirections.current[action] = true;
        startRepeat(action);
        return;
      }
      fireAction(action);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (stateRef.current.mode === "doom") {
        switch (event.code) {
          case "KeyW":
            event.preventDefault();
            fireAction("doomForwardUp");
            return;
          case "KeyS":
            event.preventDefault();
            fireAction("doomBackUp");
            return;
          case "KeyA":
            event.preventDefault();
            fireAction("doomLeftUp");
            return;
          case "KeyD":
            event.preventDefault();
            fireAction("doomRightUp");
            return;
          default:
            break;
        }
      }
      const action = getActionForKey(event.code);
      if (!action) return;
      if (isEditableTarget(event.target)) return;
      if (isRepeatableAction(action)) {
        heldDirections.current[action] = false;
        stopRepeat(action);
        if (action === "left" && heldDirections.current.right) {
          startRepeat("right");
        }
        if (action === "right" && heldDirections.current.left) {
          startRepeat("left");
        }
      }
      if (enabled) {
        event.preventDefault();
      }
    };

    const handleBlur = () => {
      stopAll();
    };

    const handleVisibility = () => {
      if (document.hidden) stopAll();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      stopAll();
    };
  }, [allowHold, enabled, fireAction, startRepeat, stateRef, stopAll, stopRepeat]);

  return { startRepeat, stopRepeat, stopAll };
};
