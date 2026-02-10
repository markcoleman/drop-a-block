import type { PlayMode } from "../engine/types";

export type Settings = {
  theme: "dark" | "neon" | "retro";
  palette: "default" | "colorblind";
  reducedMotion: boolean;
  sound: boolean;
  das: number;
  arr: number;
  holdEnabled: boolean;
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
const SETTINGS_SCHEMA_VERSION = 3;
const SCORES_SCHEMA_VERSION = 1;

const defaultSettings: Settings = {
  theme: "dark",
  palette: "default",
  reducedMotion: false,
  sound: true,
  das: 150,
  arr: 50,
  holdEnabled: true
};

const defaultGoals: GoalsState = {
  unlocked: [],
  unlockedModes: ["marathon"],
  secretModes: [],
  plays: 0
};

const PLAY_MODES: PlayMode[] = ["marathon", "sprint", "ultra"];

const isTheme = (value: unknown): value is Settings["theme"] =>
  value === "dark" || value === "neon" || value === "retro";

const isPalette = (value: unknown): value is Settings["palette"] =>
  value === "default" || value === "colorblind";

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeSettings = (value: Partial<Settings>): Settings => {
  const rawTheme: string | undefined =
    typeof value.theme === "string" ? value.theme : undefined;
  const theme = isTheme(rawTheme) ? rawTheme : defaultSettings.theme;
  const legacyTheme = rawTheme === "light" ? "dark" : theme;
  return {
    theme: legacyTheme as Settings["theme"],
    palette: isPalette(value.palette) ? value.palette : defaultSettings.palette,
    reducedMotion: isBoolean(value.reducedMotion)
      ? value.reducedMotion
      : defaultSettings.reducedMotion,
    sound: isBoolean(value.sound) ? value.sound : defaultSettings.sound,
    das: isNumber(value.das) ? value.das : defaultSettings.das,
    arr: isNumber(value.arr) ? value.arr : defaultSettings.arr,
    holdEnabled: isBoolean(value.holdEnabled) ? value.holdEnabled : defaultSettings.holdEnabled
  };
};

export const loadSettings = (): Settings => {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as
      | { version: number; data?: Partial<Settings> }
      | Partial<Settings>;
    if (parsed && typeof parsed === "object" && "version" in parsed) {
      return normalizeSettings(parsed.data ?? {});
    }
    return normalizeSettings(parsed);
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: Settings) => {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ version: SETTINGS_SCHEMA_VERSION, data: settings })
  );
};

export const loadScores = (): HighScore[] => {
  const raw = localStorage.getItem(SCORES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as
      | HighScore[]
      | { version: number; entries?: HighScore[] };
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.entries)) {
      return parsed.entries;
    }
    return [];
  } catch {
    return [];
  }
};

export const saveScore = (entry: HighScore) => {
  const scores = loadScores();
  const next = [...scores, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  localStorage.setItem(
    SCORES_KEY,
    JSON.stringify({ version: SCORES_SCHEMA_VERSION, entries: next })
  );
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
