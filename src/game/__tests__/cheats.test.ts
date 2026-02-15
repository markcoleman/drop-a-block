import { expect, it } from "vitest";

import { isCheatMatch, normalizeCheatInput, updateCheatBuffer } from "../cheats";

it("normalizes cheat input", () => {
  expect(normalizeCheatInput("  tetris ")).toBe("TETRIS");
});

it("updates the cheat buffer", () => {
  expect(updateCheatBuffer("TE", "t")).toBe("TET");
  expect(updateCheatBuffer("TE", "!")).toBe("TE");
});

it("matches cheat codes at the end of the buffer", () => {
  expect(isCheatMatch("ABCTETRIS", "TETRIS")).toBe(true);
  expect(isCheatMatch("ABCTE", "TETRIS")).toBe(false);
});
