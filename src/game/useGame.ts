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
    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      const next = tick(stateRef.current, delta);
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
