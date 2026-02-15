import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import { ScoreEntryModal } from "../ScoreEntryModal";

it("captures initials and saves", async () => {
  const onChange = vi.fn();
  const onSave = vi.fn();

  render(<ScoreEntryModal initials="AAA" onChange={onChange} onSave={onSave} />);

  fireEvent.change(screen.getByLabelText(/initials/i), { target: { value: "JDG" } });
  expect(onChange).toHaveBeenCalledWith("JDG");

  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: /save score/i }));

  expect(onSave).toHaveBeenCalledTimes(1);
});
