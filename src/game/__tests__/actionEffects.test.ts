import { expect, it, vi } from "vitest";

import { playLock, playMove, playRotate } from "../../audio/sfx";
import { ACTION_EFFECTS } from "../actionEffects";

vi.mock("../../audio/sfx", () => ({
  playLock: vi.fn(),
  playMove: vi.fn(),
  playRotate: vi.fn()
}));

it("maps actions to sound effects", () => {
  ACTION_EFFECTS.left?.sound?.();
  ACTION_EFFECTS.rotateCw?.sound?.();
  ACTION_EFFECTS.hardDrop?.sound?.();

  expect(playMove).toHaveBeenCalledTimes(1);
  expect(playRotate).toHaveBeenCalledTimes(1);
  expect(playLock).toHaveBeenCalledTimes(1);
  expect(ACTION_EFFECTS.hardDrop?.haptics).toBe(true);
});
