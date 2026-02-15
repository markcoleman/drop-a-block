import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
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

const createProps = (overrides: Partial<ComponentProps<typeof StartOverlay>> = {}) => ({
  startStep: "main" as const,
  selectedMode: "marathon" as const,
  unlockedModes: new Set(["marathon"]),
  totalPlays: 0,
  startLevel: 1,
  showCheatEntry: false,
  cheatInput: "",
  cheatFeedback: "idle" as const,
  onCheatTap: () => {},
  onCheatInputChange: () => {},
  onCheatSubmit: () => {},
  onSelectMode: () => {},
  onLaunch: () => {},
  onStartMenu: () => {},
  onBack: () => {},
  onOpenScores: () => {},
  onOpenSettings: () => {},
  onOpenHelp: () => {},
  onOpenAbout: () => {},
  ...overrides
});

it("renders mode selection with locks", async () => {
  const onSelectMode = vi.fn();
  const onLaunch = vi.fn();

  render(
    <StartOverlay
      {...createProps({
        startStep: "mode",
        selectedMode: "sprint",
        unlockedModes: new Set(["marathon"]),
        onSelectMode,
        onLaunch
      })}
    />
  );

  const modeSection = screen.getByText("Game Mode").closest(".mode-select");
  if (!modeSection) throw new Error("Missing mode selection section");

  const sprintButton = within(modeSection).getByRole("button", { name: /Sprint/i });
  expect(sprintButton).toBeDisabled();

  const user = userEvent.setup();
  await user.click(sprintButton);

  expect(onSelectMode).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: /Launch Sprint/i })).toBeDisabled();

  await user.click(within(modeSection).getByRole("button", { name: /Normal/i }));
  expect(onSelectMode).toHaveBeenCalledWith("marathon");
});

it("handles cheat entry interactions", () => {
  const onCheatInputChange = vi.fn();
  const onCheatSubmit = vi.fn();

  render(
    <StartOverlay
      {...createProps({
        showCheatEntry: true,
        cheatFeedback: "error",
        onCheatInputChange,
        onCheatSubmit
      })}
    />
  );

  const input = screen.getByLabelText(/cheat code/i);

  fireEvent.change(input, { target: { value: "TETRIS" } });
  expect(onCheatInputChange).toHaveBeenCalledWith("TETRIS");

  fireEvent.keyDown(input, { key: "Enter" });
  expect(onCheatSubmit).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/Nope\. Try again\./i)).toBeInTheDocument();
});
