import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type { Settings } from "../../utils/storage";
import { SettingsPanel } from "../SettingsPanel";

const baseSettings: Settings = {
  theme: "dark",
  palette: "default",
  reducedMotion: false,
  sound: true,
  das: 150,
  arr: 50,
  holdEnabled: true
};

it("updates settings when controls change", async () => {
  const onChange = vi.fn();

  render(<SettingsPanel settings={baseSettings} onChange={onChange} />);

  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: /neon/i }));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ theme: "neon" }));

  await user.click(screen.getByLabelText(/colorblind palette/i));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ palette: "colorblind" }));
});
