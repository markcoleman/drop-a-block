import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type { GameModifiers, PlayMode } from "../../engine/types";
import { getPalette } from "../../ui/palettes";
import type { Settings } from "../../utils/storage";
import { MenuModal } from "../MenuModal";

const baseSettings: Settings = {
  theme: "dark",
  palette: "default",
  reducedMotion: false,
  sound: true,
  das: 150,
  arr: 50,
  holdEnabled: true
};

const baseModifiers: GameModifiers = {
  turbo: false,
  mirror: false,
  noGhost: false,
  floaty: false,
  freeHold: false,
  arcadeRush: false,
  party: false
};

const createBaseProps = () => ({
  onClose: vi.fn(),
  settings: baseSettings,
  onSettingsChange: vi.fn(),
  scores: [{ name: "ACE", score: 2500, lines: 12, level: 2, date: "2024-01-01" }],
  palette: getPalette("default"),
  unlockedModes: new Set<PlayMode>(["marathon"]),
  totalPlays: 0,
  activeModifiers: baseModifiers,
  onToggleSecretMode: vi.fn(),
  onShuffleFunModes: vi.fn(),
  onClearFunModes: vi.fn(),
  onUnlockMode: vi.fn(),
  onUnlockAllModes: vi.fn(),
  onResetModeUnlocks: vi.fn()
});

it("renders scores and closes", async () => {
  const baseProps = createBaseProps();

  render(<MenuModal {...baseProps} view="scores" />);

  expect(screen.getAllByText("High Scores").length).toBeGreaterThan(0);
  expect(screen.getByText("ACE")).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByLabelText(/close/i));

  expect(baseProps.onClose).toHaveBeenCalledTimes(1);
});

it("shows help content when requested", () => {
  const baseProps = createBaseProps();

  render(<MenuModal {...baseProps} view="help" />);

  expect(screen.getByText(/Tight rotations and fast drops win/i)).toBeInTheDocument();
});
