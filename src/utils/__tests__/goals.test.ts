import { expect, it } from "vitest";

import { evaluateGoals, getGoalValue, getNextLevelTarget, GOALS } from "../goals";

it("derives goal values from state", () => {
  const state = { score: 3200, lines: 12, level: 4 };
  const lineGoal = GOALS.find((goal) => goal.type === "lines");
  const levelGoal = GOALS.find((goal) => goal.type === "level");
  const scoreGoal = GOALS.find((goal) => goal.type === "score");

  expect(lineGoal).toBeDefined();
  expect(levelGoal).toBeDefined();
  expect(scoreGoal).toBeDefined();

  expect(getGoalValue(lineGoal!, state)).toBe(12);
  expect(getGoalValue(levelGoal!, state)).toBe(4);
  expect(getGoalValue(scoreGoal!, state)).toBe(3200);
});

it("evaluates goal progress and achievements", () => {
  const state = { score: 1000, lines: 10, level: 2 };
  const progress = evaluateGoals(state, ["lines-25"]);
  const linesGoal = progress.find((item) => item.goal.id === "lines-25");
  const scoreGoal = progress.find((item) => item.goal.id === "score-5k");

  expect(progress).toHaveLength(GOALS.length);
  expect(linesGoal?.achieved).toBe(true);
  expect(scoreGoal?.progress).toBeCloseTo(0.2);
});

it("calculates next level target", () => {
  expect(getNextLevelTarget(3)).toBe(30);
});
