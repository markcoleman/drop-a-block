import { describe, expect, it } from "vitest";

import { createEmptyBoard, createInitialState } from "../../engine/engine";
import { GameState } from "../../engine/types";
import { applyAction, canApplyAction } from "../actions";

const makeRunningState = (overrides: Partial<GameState>): GameState => ({
  ...createInitialState(),
  status: "running",
  ...overrides
});

describe("game actions", () => {
  it("starts the game on the first non-pause action", () => {
    const state = createInitialState();
    const started = applyAction(state, "left");
    expect(started.status).toBe("running");
    expect(started.active).toEqual(state.active);
  });

  it("toggles pause regardless of current status", () => {
    const state = createInitialState();
    const paused = applyAction(state, "pause");
    expect(paused.status).toBe("paused");
  });

  it("allows pause and start actions across statuses", () => {
    const startState = createInitialState();
    expect(canApplyAction(startState, "left")).toBe(true);
    expect(canApplyAction(startState, "pause")).toBe(true);
    expect(canApplyAction(startState, "debugArkanoid")).toBe(true);
    const pausedState: GameState = { ...startState, status: "paused" };
    expect(canApplyAction(pausedState, "left")).toBe(false);
    expect(canApplyAction(pausedState, "pause")).toBe(true);
    expect(canApplyAction(pausedState, "debugArkanoid")).toBe(true);
  });

  it("ignores move actions when paused", () => {
    const state: GameState = {
      ...createInitialState(),
      status: "paused"
    };
    const moved = applyAction(state, "left");
    expect(moved).toBe(state);
  });

  it("applies a move when running", () => {
    const state = makeRunningState({
      board: createEmptyBoard(),
      active: {
        type: "L",
        rotation: 0,
        position: { x: 2, y: 0 }
      }
    });
    const moved = applyAction(state, "left");
    expect(moved.active.position.x).toBe(1);
  });

  it("forces arkanoid mode with the debug action", () => {
    const state = createInitialState();
    const forced = applyAction(state, "debugArkanoid");
    expect(forced.mode).toBe("arkanoid");
    expect(forced.status).toBe("running");
  });

  it("routes controls to arkanoid behavior", () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      status: "running",
      mode: "arkanoid",
      arkanoid: {
        ...base.arkanoid,
        launchDelay: 200
      }
    };
    const moved = applyAction(state, "left");
    expect(moved.arkanoid.paddleX).toBeLessThan(state.arkanoid.paddleX);
    const launched = applyAction(moved, "rotateCw");
    expect(launched.arkanoid.launchDelay).toBe(0);
  });

  it("updates doom movement flags", () => {
    const base = createInitialState();
    const state: GameState = {
      ...base,
      status: "running",
      mode: "doom"
    };
    const forward = applyAction(state, "doomForwardDown");
    expect(forward.doom.input.forward).toBe(true);
    const stopped = applyAction(forward, "doomForwardUp");
    expect(stopped.doom.input.forward).toBe(false);
  });
});
