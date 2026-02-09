import { describe, expect, it } from "vitest";
import { getActionForKey, isRepeatableAction } from "../controls";

describe("controls", () => {
  it("maps known keys to actions", () => {
    expect(getActionForKey("ArrowLeft")).toBe("left");
    expect(getActionForKey("KeyX")).toBe("rotateCw");
    expect(getActionForKey("Space")).toBe("hardDrop");
  });

  it("returns null for unknown keys", () => {
    expect(getActionForKey("KeyQ")).toBeNull();
  });

  it("identifies repeatable actions", () => {
    expect(isRepeatableAction("left")).toBe(true);
    expect(isRepeatableAction("down")).toBe(true);
    expect(isRepeatableAction("hold")).toBe(false);
  });
});
