import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Modal } from "../Modal";

it("renders dialog content with sizing", () => {
  render(
    <Modal size="large">
      <p>Modal content</p>
    </Modal>
  );

  const dialog = screen.getByRole("dialog");
  const card = dialog.querySelector(".modal-card");

  expect(screen.getByText("Modal content")).toBeInTheDocument();
  expect(card).toHaveClass("modal-large");
});
