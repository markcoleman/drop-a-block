import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { PauseOverlay } from "../PauseOverlay";

it("fires resume action", async () => {
  const onResume = vi.fn();

  render(<PauseOverlay onResume={onResume} />);

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /resume/i }));

  expect(onResume).toHaveBeenCalledTimes(1);
});
