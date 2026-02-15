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
  language: "en",
  customTheme: {
    name: "Custom Theme",
    baseTheme: "liquid2026",
    colors: {},
    assets: {},
    piecePalette: {}
  },
  reducedMotion: false,
  sound: true,
  showHud: true,
  mobileControls: true,
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
  palette: getPalette("default", "dark"),
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

it("fires secret mode actions", async () => {
  const baseProps = createBaseProps();

  render(<MenuModal {...baseProps} view="secret" />);

  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: /sprint/i }));
  await user.click(screen.getByRole("button", { name: /unlock all modes/i }));
  await user.click(screen.getByRole("button", { name: /reset mode unlocks/i }));
  await user.click(screen.getByRole("button", { name: /turbo gravity/i }));
  await user.click(screen.getByRole("button", { name: /remix fun/i }));
  await user.click(screen.getByRole("button", { name: /clear fun modes/i }));

  expect(baseProps.onUnlockMode).toHaveBeenCalledTimes(1);
  expect(baseProps.onUnlockAllModes).toHaveBeenCalledTimes(1);
  expect(baseProps.onResetModeUnlocks).toHaveBeenCalledTimes(1);
  expect(baseProps.onToggleSecretMode).toHaveBeenCalledTimes(1);
  expect(baseProps.onShuffleFunModes).toHaveBeenCalledTimes(1);
  expect(baseProps.onClearFunModes).toHaveBeenCalledTimes(1);
});

it("applies settings only when save is clicked", async () => {
  const baseProps = createBaseProps();
  render(<MenuModal {...baseProps} view="settings" />);

  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: /neon/i }));
  expect(baseProps.onSettingsChange).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: /save/i }));
  expect(baseProps.onSettingsChange).toHaveBeenCalledTimes(1);
  expect(baseProps.onSettingsChange).toHaveBeenCalledWith(
    expect.objectContaining({ theme: "neon" })
  );
  expect(baseProps.onClose).toHaveBeenCalledTimes(1);
});

it("drops settings changes when cancel is clicked", async () => {
  const baseProps = createBaseProps();
  render(<MenuModal {...baseProps} view="settings" />);

  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: /neon/i }));
  await user.click(screen.getByRole("button", { name: /cancel/i }));

  expect(baseProps.onSettingsChange).not.toHaveBeenCalled();
  expect(baseProps.onClose).toHaveBeenCalledTimes(1);
});
