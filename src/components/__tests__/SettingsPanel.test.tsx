import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type { Settings } from "../../utils/storage";
import { SettingsPanel } from "../SettingsPanel";

const baseSettings: Settings = {
  theme: "dark",
  palette: "default",
  reducedMotion: false,
  sound: true,
  showHud: true,
  mobileControls: true,
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

  await user.click(screen.getByLabelText(/reduced motion/i));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ reducedMotion: true }));

  await user.click(screen.getByLabelText(/show hud/i));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ showHud: false }));

  await user.click(screen.getByLabelText(/sound effects/i));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ sound: false }));

  await user.click(screen.getByLabelText(/enable hold/i));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ holdEnabled: false }));

  await user.click(screen.getByLabelText(/mobile controls/i));
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ mobileControls: false }));

  fireEvent.change(screen.getByLabelText(/DAS/i), { target: { value: "200" } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ das: 200 }));

  fireEvent.change(screen.getByLabelText(/ARR/i), { target: { value: "90" } });
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ arr: 90 }));
});
