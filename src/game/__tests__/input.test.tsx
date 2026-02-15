import { fireEvent, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { useRef } from "react";
import { expect, it, vi } from "vitest";

import { createInitialState } from "../../engine/state";
import type { GameMode, GameState, GameStatus } from "../../engine/types";
import type { Settings } from "../../utils/storage";
import { useInput } from "../input";

const baseSettings: Settings = {
  theme: "dark",
  palette: "default",
  reducedMotion: false,
  sound: true,
  showHud: true,
  mobileControls: true,
  das: 120,
  arr: 40,
  holdEnabled: true
};

const Harness = ({
  allowHold,
  mode,
  status,
  onAction
}: {
  allowHold: boolean;
  mode: GameMode;
  status: GameStatus;
  onAction: (action: string) => void;
}): ReactElement => {
  const stateRef = useRef<GameState>(createInitialState());
  stateRef.current = { ...stateRef.current, status, mode };

  useInput({
    enabled: true,
    allowHold,
    gameStatus: status,
    settings: baseSettings,
    stateRef,
    onAction: onAction as (action: any) => void
  });

  return <div />;
};

it("fires single actions from key presses", () => {
  const onAction = vi.fn();

  render(<Harness allowHold={true} mode="tetris" status="running" onAction={onAction} />);

  fireEvent.keyDown(window, { code: "Space" });

  expect(onAction).toHaveBeenCalledWith("hardDrop");
});

it("skips hold when disabled", () => {
  const onAction = vi.fn();

  render(<Harness allowHold={false} mode="tetris" status="running" onAction={onAction} />);

  fireEvent.keyDown(window, { code: "KeyC" });

  expect(onAction).not.toHaveBeenCalled();
});

it("routes doom movement controls", () => {
  const onAction = vi.fn();

  render(<Harness allowHold={true} mode="doom" status="running" onAction={onAction} />);

  fireEvent.keyDown(window, { code: "KeyW" });
  fireEvent.keyUp(window, { code: "KeyW" });

  expect(onAction).toHaveBeenCalledWith("doomForwardDown");
  expect(onAction).toHaveBeenCalledWith("doomForwardUp");
});

it("repeats movement based on timers", () => {
  vi.useFakeTimers();
  const onAction = vi.fn();

  render(<Harness allowHold={true} mode="tetris" status="running" onAction={onAction} />);

  fireEvent.keyDown(window, { code: "ArrowLeft" });
  vi.advanceTimersByTime(baseSettings.das + baseSettings.arr + 1);

  const leftCalls = onAction.mock.calls.filter(([action]) => action === "left");
  expect(leftCalls.length).toBeGreaterThan(1);

  vi.useRealTimers();
});
