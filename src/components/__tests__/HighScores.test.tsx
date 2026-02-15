import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { HighScores } from "../HighScores";

it("shows empty state when there are no scores", () => {
  render(<HighScores scores={[]} />);

  expect(screen.getByText("No scores yet.")).toBeInTheDocument();
});

it("renders score entries", () => {
  const scoreValue = 12345;
  render(
    <HighScores
      scores={[
        {
          name: "MJC",
          score: scoreValue,
          lines: 42,
          level: 3,
          date: "2024-01-01"
        }
      ]}
    />
  );

  expect(screen.getByText("MJC")).toBeInTheDocument();
  expect(screen.getByText("L3")).toBeInTheDocument();
  expect(screen.getByText(scoreValue.toLocaleString())).toBeInTheDocument();
});
