import type { PlayMode } from "../engine/types";

export type Settings = {
  theme: "dark" | "light";
  sound: boolean;
  das: number;
  arr: number;
};

export type HighScore = {
  name: string;
  score: number;
  lines: number;
  level: number;
  date: string;
};

export type GoalsState = {
  unlocked: string[];
  unlockedModes: PlayMode[];
  secretModes: string[];
  plays: number;
};

const SETTINGS_KEY = "dropablock:settings";
const SCORES_KEY = "dropablock:scores";
const GOALS_KEY = "dropablock:goals";

const defaultSettings: Settings = {
  theme: "dark",
  sound: true,
  das: 150,
  arr: 50
};

const defaultGoals: GoalsState = {
  unlocked: [],
  unlockedModes: ["marathon"],
  secretModes: [],
  plays: 0
};

const PLAY_MODES: PlayMode[] = ["marathon", "sprint", "ultra"];

export const loadSettings = (): Settings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) } as Settings;
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadScores = (): HighScore[] => {
  const raw = localStorage.getItem(SCORES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HighScore[];
  } catch {
    return [];
  }
};

export const saveScore = (entry: HighScore) => {
  const scores = loadScores();
  const next = [...scores, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  localStorage.setItem(SCORES_KEY, JSON.stringify(next));
  return next;
};

export const resetScores = () => {
  localStorage.removeItem(SCORES_KEY);
};

export const loadGoalsState = (): GoalsState => {
  const raw = localStorage.getItem(GOALS_KEY);
  if (!raw) return defaultGoals;
  try {
    const parsed = JSON.parse(raw) as GoalsState;
    if (!Array.isArray(parsed.unlocked)) return defaultGoals;
    const unlockedModes = Array.isArray(parsed.unlockedModes)
      ? parsed.unlockedModes.filter((mode): mode is PlayMode => PLAY_MODES.includes(mode as PlayMode))
      : defaultGoals.unlockedModes;
    const secretModes = Array.isArray(parsed.secretModes)
      ? parsed.secretModes.filter((mode) => typeof mode === "string")
      : defaultGoals.secretModes;
    const plays = typeof parsed.plays === "number" && Number.isFinite(parsed.plays)
      ? parsed.plays
      : defaultGoals.plays;
    const normalizedModes = unlockedModes.includes("marathon")
      ? unlockedModes
      : (["marathon", ...unlockedModes] as PlayMode[]);
    return {
      unlocked: parsed.unlocked,
      unlockedModes: normalizedModes,
      secretModes,
      plays
    };
  } catch {
    return defaultGoals;
  }
};

export const saveGoalsState = (goals: GoalsState) => {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
};

export const resetGoals = () => {
  localStorage.removeItem(GOALS_KEY);
};
