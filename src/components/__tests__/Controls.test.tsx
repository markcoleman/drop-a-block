import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { Controls } from "../Controls";

it("fires pause and hides hold when disabled", async () => {
  const onPause = vi.fn();

  render(
    <Controls
      onLeftStart={vi.fn()}
      onLeftEnd={vi.fn()}
      onRightStart={vi.fn()}
      onRightEnd={vi.fn()}
      onDownStart={vi.fn()}
      onDownEnd={vi.fn()}
      onRotateCw={vi.fn()}
      onRotateCcw={vi.fn()}
      onHardDrop={vi.fn()}
      onHold={vi.fn()}
      onPause={onPause}
      holdEnabled={false}
    />
  );

  expect(screen.queryByRole("button", { name: /hold piece/i })).not.toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /pause/i }));

  expect(onPause).toHaveBeenCalledTimes(1);
});

it("handles holdable keyboard actions", () => {
  const onLeftStart = vi.fn();
  const onLeftEnd = vi.fn();
  const onHardDrop = vi.fn();

  render(
    <Controls
      onLeftStart={onLeftStart}
      onLeftEnd={onLeftEnd}
      onRightStart={vi.fn()}
      onRightEnd={vi.fn()}
      onDownStart={vi.fn()}
      onDownEnd={vi.fn()}
      onRotateCw={vi.fn()}
      onRotateCcw={vi.fn()}
      onHardDrop={onHardDrop}
      onHold={vi.fn()}
      onPause={vi.fn()}
    />
  );

  const leftButton = screen.getByRole("button", { name: /move left/i });
  fireEvent.keyDown(leftButton, { key: " " });
  fireEvent.keyUp(leftButton, { key: " " });

  const dropButton = screen.getByRole("button", { name: /hard drop/i });
  fireEvent.keyDown(dropButton, { key: "Enter" });

  expect(onLeftStart).toHaveBeenCalledTimes(1);
  expect(onLeftEnd).toHaveBeenCalledTimes(1);
  expect(onHardDrop).toHaveBeenCalledTimes(1);
});
