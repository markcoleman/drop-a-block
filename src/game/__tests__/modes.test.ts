import { expect, it } from "vitest";

import { getUnlockedModes, orderModes } from "../modes";

it("unlocks modes based on play count", () => {
  const early = getUnlockedModes(0, undefined);
  expect(early.has("marathon")).toBe(true);
  expect(early.has("sprint")).toBe(false);
  expect(early.has("ultra")).toBe(false);

  const later = getUnlockedModes(3, ["sprint"]);
  expect(later.has("marathon")).toBe(true);
  expect(later.has("sprint")).toBe(true);
  expect(later.has("ultra")).toBe(true);
});

it("orders modes in display order", () => {
  const ordered = orderModes(["ultra", "marathon"]);
  expect(ordered).toEqual(["marathon", "ultra"]);
});
