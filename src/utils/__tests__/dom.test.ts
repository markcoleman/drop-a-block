import { expect, it } from "vitest";

import { isEditableTarget } from "../dom";

it("identifies editable elements", () => {
  const input = document.createElement("input");
  const div = document.createElement("div");

  expect(isEditableTarget(input)).toBe(true);
  expect(isEditableTarget(div)).toBe(false);
  expect(isEditableTarget(null)).toBe(false);
});
