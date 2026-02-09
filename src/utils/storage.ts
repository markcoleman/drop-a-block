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

const SETTINGS_KEY = "dropablock:settings";
const SCORES_KEY = "dropablock:scores";

const defaultSettings: Settings = {
  theme: "dark",
  sound: true,
  das: 150,
  arr: 50
};

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
