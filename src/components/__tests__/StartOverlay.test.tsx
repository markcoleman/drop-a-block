import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { StartOverlay } from "../StartOverlay";

it("calls onStartMenu from main screen", async () => {
  const onStartMenu = vi.fn();

  render(
    <StartOverlay
      startStep="main"
      selectedMode="marathon"
      unlockedModes={new Set(["marathon"])}
      totalPlays={0}
      startLevel={1}
      showCheatEntry={false}
      cheatInput=""
      cheatFeedback="idle"
      onCheatTap={() => {}}
      onCheatInputChange={() => {}}
      onCheatSubmit={() => {}}
      onSelectMode={() => {}}
      onLaunch={() => {}}
      onStartMenu={onStartMenu}
      onBack={() => {}}
      onOpenScores={() => {}}
      onOpenSettings={() => {}}
      onOpenHelp={() => {}}
      onOpenAbout={() => {}}
    />
  );

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /start game/i }));
  expect(onStartMenu).toHaveBeenCalledTimes(1);
});
