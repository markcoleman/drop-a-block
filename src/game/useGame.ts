import { useCallback, useEffect, useRef, useState } from "react";

import { resetGame, tick } from "../engine/engine";
import { GameState } from "../engine/types";
import { Action, applyAction } from "./actions";

export const useGame = () => {
  const [state, setState] = useState<GameState>(() => resetGame());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applyState = useCallback((fn: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = fn(prev);
      stateRef.current = next;
      return next;
    });
  }, []);

  const dispatch = useCallback(
    (action: Action) => {
      applyState((prev) => applyAction(prev, action));
    },
    [applyState]
  );

  useEffect(() => {
    let last = performance.now();
    let rafId = 0;
    let accumulator = 0;
    const STEP_MS = 1000 / 60;
    const MAX_FRAME_MS = 100;
    const MAX_STEPS = 5;
    const loop = (now: number) => {
      const delta = Math.min(now - last, MAX_FRAME_MS);
      last = now;
      accumulator += delta;
      let next = stateRef.current;
      let steps = 0;
      while (accumulator >= STEP_MS && steps < MAX_STEPS) {
        const updated = tick(next, STEP_MS);
        if (updated !== next) next = updated;
        accumulator -= STEP_MS;
        steps += 1;
      }
      if (steps === MAX_STEPS) {
        accumulator = 0;
      }
      if (next !== stateRef.current) {
        stateRef.current = next;
        setState(next);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return { state, stateRef, applyState, dispatch };
};
