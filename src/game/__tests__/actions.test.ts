import { describe, expect, it } from "vitest";
import { applyAction, canApplyAction } from "../actions";
import { createInitialState, createEmptyBoard } from "../../engine/engine";
import { GameState } from "../../engine/types";

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
    const pausedState: GameState = { ...startState, status: "paused" };
    expect(canApplyAction(pausedState, "left")).toBe(false);
    expect(canApplyAction(pausedState, "pause")).toBe(true);
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
});
