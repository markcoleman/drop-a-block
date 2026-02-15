import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { getPalette } from "../../ui/palettes";
import { QueuePanel } from "../QueuePanel";

it("shows disabled copy when hold is off", () => {
  render(
    <QueuePanel
      holdEnabled={false}
      holdPiece={null}
      nextQueue={["I", "O", "T"]}
      palette={getPalette("default", "dark")}
    />
  );

  expect(screen.getByText("Disabled in settings.")).toBeInTheDocument();
});
