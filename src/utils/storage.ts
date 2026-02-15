import type { PlayMode, TetrominoType } from "../engine/types";
import { type Language, SUPPORTED_LANGUAGES } from "../i18n/config";
import {
  createDefaultCustomTheme,
  type CustomTheme,
  THEME_ASSET_KEYS,
  THEME_COLOR_KEYS,
  THEME_IDS,
  type ThemeAssetKey,
  type ThemeColorKey,
  type ThemeId,
  type ThemeSelection
} from "../ui/themes";

export type Settings = {
  theme: ThemeSelection;
  palette: "default" | "colorblind";
  language: Language;
  customTheme: CustomTheme;
  reducedMotion: boolean;
  sound: boolean;
  showHud: boolean;
  mobileControls: boolean;
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
const SETTINGS_SCHEMA_VERSION = 4;
const SCORES_SCHEMA_VERSION = 1;

const defaultSettings: Settings = {
  theme: "dark",
  palette: "default",
  language: "en",
  customTheme: createDefaultCustomTheme(),
  reducedMotion: false,
  sound: true,
  showHud: true,
  mobileControls: true,
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
const TETROMINO_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

const isTheme = (value: unknown): value is ThemeSelection =>
  value === "custom" || (typeof value === "string" && THEME_IDS.includes(value as ThemeId));

const isPalette = (value: unknown): value is Settings["palette"] =>
  value === "default" || value === "colorblind";

const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && SUPPORTED_LANGUAGES.includes(value as Language);

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const pickStringRecord = <TKey extends string>(
  value: unknown,
  allowedKeys: readonly TKey[]
): Partial<Record<TKey, string>> => {
  if (!isRecord(value)) return {};
  const next: Partial<Record<TKey, string>> = {};
  for (const key of allowedKeys) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) {
      next[key] = candidate.trim();
    }
  }
  return next;
};

const normalizeCustomTheme = (value: unknown): CustomTheme => {
  const fallback = createDefaultCustomTheme();
  if (!isRecord(value)) return fallback;

  const name =
    typeof value.name === "string" && value.name.trim() ? value.name.trim() : fallback.name;
  const baseTheme =
    typeof value.baseTheme === "string" && THEME_IDS.includes(value.baseTheme as ThemeId)
      ? (value.baseTheme as CustomTheme["baseTheme"])
      : fallback.baseTheme;

  return {
    name,
    baseTheme,
    colors: pickStringRecord<ThemeColorKey>(value.colors, THEME_COLOR_KEYS),
    assets: pickStringRecord<ThemeAssetKey>(value.assets, THEME_ASSET_KEYS),
    piecePalette: pickStringRecord<TetrominoType>(value.piecePalette, TETROMINO_TYPES)
  };
};

const normalizeSettings = (value: Partial<Settings>): Settings => {
  const rawTheme: string | undefined = typeof value.theme === "string" ? value.theme : undefined;
  const theme = isTheme(rawTheme) ? rawTheme : defaultSettings.theme;
  const legacyTheme = rawTheme === "light" ? "dark" : theme;
  const customTheme = normalizeCustomTheme(value.customTheme);

  return {
    theme: legacyTheme,
    palette: isPalette(value.palette) ? value.palette : defaultSettings.palette,
    language: isLanguage(value.language) ? value.language : defaultSettings.language,
    customTheme,
    reducedMotion: isBoolean(value.reducedMotion)
      ? value.reducedMotion
      : defaultSettings.reducedMotion,
    sound: isBoolean(value.sound) ? value.sound : defaultSettings.sound,
    showHud: isBoolean(value.showHud) ? value.showHud : defaultSettings.showHud,
    mobileControls: isBoolean(value.mobileControls)
      ? value.mobileControls
      : defaultSettings.mobileControls,
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
    const parsed = JSON.parse(raw) as HighScore[] | { version: number; entries?: HighScore[] };
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
  const next = [...scores, entry].sort((a, b) => b.score - a.score).slice(0, 10);
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
      ? parsed.unlockedModes.filter((mode): mode is PlayMode =>
          PLAY_MODES.includes(mode as PlayMode)
        )
      : defaultGoals.unlockedModes;
    const secretModes = Array.isArray(parsed.secretModes)
      ? parsed.secretModes.filter((mode) => typeof mode === "string")
      : defaultGoals.secretModes;
    const plays =
      typeof parsed.plays === "number" && Number.isFinite(parsed.plays)
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
