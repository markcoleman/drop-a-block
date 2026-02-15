export type GoalType = "lines" | "score" | "level";

export type Goal = {
  id: string;
  label: string;
  type: GoalType;
  target: number;
};

export type GoalProgress = {
  goal: Goal;
  value: number;
  progress: number;
  achieved: boolean;
};

export const GOALS: Goal[] = [
  { id: "lines-25", label: "Clear 25 lines", type: "lines", target: 25 },
  { id: "score-5k", label: "Score 5,000", type: "score", target: 5000 },
  { id: "level-5", label: "Reach level 5", type: "level", target: 5 },
  { id: "lines-75", label: "Clear 75 lines", type: "lines", target: 75 },
  { id: "score-15k", label: "Score 15,000", type: "score", target: 15000 },
  { id: "level-10", label: "Reach level 10", type: "level", target: 10 },
  { id: "lines-150", label: "Clear 150 lines", type: "lines", target: 150 },
  { id: "score-30k", label: "Score 30,000", type: "score", target: 30000 },
  { id: "level-15", label: "Reach level 15", type: "level", target: 15 }
];

export const getGoalValue = (
  goal: Goal,
  state: { score: number; lines: number; level: number }
) => {
  if (goal.type === "lines") return state.lines;
  if (goal.type === "level") return state.level;
  return state.score;
};

export const evaluateGoals = (
  state: { score: number; lines: number; level: number },
  unlocked: string[]
): GoalProgress[] => {
  return GOALS.map((goal) => {
    const value = getGoalValue(goal, state);
    const achieved = unlocked.includes(goal.id) || value >= goal.target;
    const progress = Math.min(1, value / goal.target);
    return { goal, value, progress, achieved };
  });
};

export const getNextLevelTarget = (level: number) => level * 10;
