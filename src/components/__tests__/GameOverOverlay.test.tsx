import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { GameOverOverlay } from "../GameOverOverlay";

it("shows win messaging and actions", async () => {
  const onRestart = vi.fn();
  const onBackToMenu = vi.fn();

  render(
    <GameOverOverlay
      result="win"
      modeLabel="Sprint"
      score={1234}
      lines={40}
      level={3}
      onRestart={onRestart}
      onBackToMenu={onBackToMenu}
    />
  );

  expect(screen.getByText("Mode Complete")).toBeInTheDocument();
  expect(screen.getByText(/Sprint wrapped/i)).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /play again/i }));
  await user.click(screen.getByRole("button", { name: /back to menu/i }));

  expect(onRestart).toHaveBeenCalledTimes(1);
  expect(onBackToMenu).toHaveBeenCalledTimes(1);
});

it("shows lose messaging", () => {
  render(
    <GameOverOverlay
      result="lose"
      modeLabel="Normal"
      score={500}
      lines={4}
      level={1}
      onRestart={() => {}}
      onBackToMenu={() => {}}
    />
  );

  expect(screen.getByText("Game Over")).toBeInTheDocument();
  expect(screen.getByText(/Final score 500/i)).toBeInTheDocument();
});
