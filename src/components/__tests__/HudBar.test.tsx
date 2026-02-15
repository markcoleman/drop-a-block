import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { HudBar } from "../HudBar";

it("renders stats and fires actions", async () => {
  const onPause = vi.fn();
  const onOpenSettings = vi.fn();
  const onHideHud = vi.fn();

  render(
    <HudBar
      status="running"
      mode="tetris"
      playMode="marathon"
      modeLabel="Normal"
      sprintLinesLeft={0}
      modeMinutes={0}
      modeSeconds="00"
      score={1234}
      level={3}
      lines={10}
      doomLinesToReady={7}
      highScore={9000}
      onPause={onPause}
      onOpenSettings={onOpenSettings}
      onHideHud={onHideHud}
    />
  );

  expect(screen.getByText("Score")).toBeInTheDocument();
  expect(screen.getByText("1,234")).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByLabelText("Pause"));
  await user.click(screen.getByLabelText("Open settings"));
  await user.click(screen.getByLabelText("Hide HUD"));

  expect(onPause).toHaveBeenCalledTimes(1);
  expect(onOpenSettings).toHaveBeenCalledTimes(1);
  expect(onHideHud).toHaveBeenCalledTimes(1);
});
