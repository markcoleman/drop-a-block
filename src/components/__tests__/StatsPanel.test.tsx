import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import type { GoalProgress } from "../../utils/goals";
import { StatsPanel } from "../StatsPanel";

const goals: GoalProgress[] = [
  {
    goal: { id: "lines-25", label: "Clear 25 lines", type: "lines", target: 25 },
    value: 10,
    progress: 0.4,
    achieved: false
  }
];

it("renders mode banner and progress", () => {
  render(
    <StatsPanel
      level={1}
      mode="doom"
      arkanoidSeconds={0}
      doomSeconds={12}
      status="running"
      linesToNextLevel={8}
      levelProgress={0.2}
      linesIntoLevel={2}
      nextLevelTarget={10}
      displayGoals={goals}
    />
  );

  expect(screen.getByText("Doom Run")).toBeInTheDocument();
  expect(screen.getByText("12s")).toBeInTheDocument();

  const progress = screen.getByRole("progressbar");
  expect(progress).toHaveAttribute("aria-valuenow", "2");
  expect(screen.getByText(/Clear 25 lines/i)).toBeInTheDocument();
});
