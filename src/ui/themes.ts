import type { TetrominoType } from "../engine/types";

export type ThemeId = "dark" | "neon" | "retro" | "liquid2026" | "gameboy" | "solarized" | "c64";

export type ThemeSelection = ThemeId | "custom";

export const THEME_IDS: ThemeId[] = [
  "dark",
  "neon",
  "retro",
  "liquid2026",
  "gameboy",
  "solarized",
  "c64"
];

export const THEME_COLOR_KEYS = [
  "bg",
  "bgElevated",
  "surface",
  "surfaceStrong",
  "surfaceGlass",
  "border",
  "borderStrong",
  "text",
  "textMuted",
  "accent",
  "accentStrong",
  "accentWarm",
  "accentGlow",
  "accentWarmGlow",
  "success",
  "warning",
  "danger",
  "focus",
  "boardBg",
  "boardGrid",
  "boardGridStrong",
  "boardGlow",
  "panelQuiet",
  "panelQuietStrong",
  "panelQuietBorder"
] as const;

export const THEME_ASSET_KEYS = [
  "doomImp1",
  "doomImp2",
  "doomItemHealth",
  "doomItemArmor",
  "doomItemAmmo",
  "bodyPattern",
  "boardOverlay"
] as const;

export type ThemeColorKey = (typeof THEME_COLOR_KEYS)[number];
export type ThemeAssetKey = (typeof THEME_ASSET_KEYS)[number];

export type PiecePalette = Record<TetrominoType, string>;

export type ThemeColorOverrides = Partial<Record<ThemeColorKey, string>>;
export type ThemeAssetOverrides = Partial<Record<ThemeAssetKey, string>>;
export type PiecePaletteOverrides = Partial<PiecePalette>;

export type CustomTheme = {
  name: string;
  baseTheme: ThemeId;
  colors: ThemeColorOverrides;
  assets: ThemeAssetOverrides;
  piecePalette: PiecePaletteOverrides;
};

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  tagline: string;
  colors: Record<ThemeColorKey, string>;
  assets: Record<ThemeAssetKey, string>;
  piecePalette: PiecePalette;
};

const assetPath = (file: string) => `sprites/doom/${file}`;

const svgPattern = (stroke: string, opacity = 0.16, size = 28) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}' fill='none'><path d='M0 ${size / 2}h${size}M${size / 2} 0v${size}' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='1.2'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const diagonalPattern = (stroke: string, opacity = 0.16, size = 30) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}' fill='none'><path d='M-2 ${size - 2}L${size - 2} -2M2 ${size + 2}L${size + 2} 2' stroke='${stroke}' stroke-opacity='${opacity}' stroke-width='1.2'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const dotPattern = (fill: string, opacity = 0.28, size = 24) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${size} ${size}'><circle cx='4' cy='4' r='2.2' fill='${fill}' fill-opacity='${opacity}'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const baseAssets: Record<ThemeAssetKey, string> = {
  doomImp1: assetPath("imp_1.png"),
  doomImp2: assetPath("imp_2.png"),
  doomItemHealth: assetPath("item_health.png"),
  doomItemArmor: assetPath("item_armor.png"),
  doomItemAmmo: assetPath("item_ammo.png"),
  bodyPattern: "",
  boardOverlay: ""
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  dark: {
    id: "dark",
    name: "Dark",
    tagline: "Default contrast-first interface.",
    colors: {
      bg: "#080c18",
      bgElevated: "#0f172a",
      surface: "rgba(14, 20, 36, 0.74)",
      surfaceStrong: "rgba(10, 16, 30, 0.92)",
      surfaceGlass: "rgba(18, 24, 40, 0.58)",
      border: "rgba(148, 163, 184, 0.2)",
      borderStrong: "rgba(148, 163, 184, 0.35)",
      text: "#e5e7eb",
      textMuted: "rgba(226, 232, 240, 0.68)",
      accent: "#59d3ff",
      accentStrong: "#7b7dff",
      accentWarm: "#ff7ac2",
      accentGlow: "rgba(89, 211, 255, 0.28)",
      accentWarmGlow: "rgba(255, 122, 194, 0.2)",
      success: "#4ade80",
      warning: "#fbbf24",
      danger: "#fb7185",
      focus: "rgba(89, 211, 255, 0.85)",
      boardBg: "#050814",
      boardGrid: "rgba(255, 255, 255, 0.06)",
      boardGridStrong: "rgba(255, 255, 255, 0.12)",
      boardGlow: "#5ce1ff",
      panelQuiet: "rgba(8, 12, 22, 0.52)",
      panelQuietStrong: "rgba(8, 12, 22, 0.78)",
      panelQuietBorder: "rgba(148, 163, 184, 0.12)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: diagonalPattern("#7b7dff", 0.1),
      boardOverlay: diagonalPattern("#59d3ff", 0.22, 34)
    },
    piecePalette: {
      I: "#41D9FF",
      O: "#F7D74F",
      T: "#A988FF",
      S: "#45E49B",
      Z: "#FF6B6B",
      J: "#5A86FF",
      L: "#FF9F43"
    }
  },
  neon: {
    id: "neon",
    name: "Neon",
    tagline: "Cyber-arcade contrast and glow.",
    colors: {
      bg: "#05070f",
      bgElevated: "#0b1022",
      surface: "rgba(9, 16, 32, 0.75)",
      surfaceStrong: "rgba(7, 12, 26, 0.92)",
      surfaceGlass: "rgba(16, 22, 40, 0.6)",
      border: "rgba(98, 146, 255, 0.28)",
      borderStrong: "rgba(98, 146, 255, 0.45)",
      text: "#e6f0ff",
      textMuted: "rgba(230, 240, 255, 0.6)",
      accent: "#3bffcf",
      accentStrong: "#7b7dff",
      accentWarm: "#ff4fd8",
      accentGlow: "rgba(59, 255, 207, 0.32)",
      accentWarmGlow: "rgba(255, 79, 216, 0.22)",
      success: "#34d399",
      warning: "#facc15",
      danger: "#fb7185",
      focus: "rgba(59, 255, 207, 0.85)",
      boardBg: "#03060f",
      boardGrid: "rgba(255, 255, 255, 0.06)",
      boardGridStrong: "rgba(255, 255, 255, 0.12)",
      boardGlow: "#3bffcf",
      panelQuiet: "rgba(7, 11, 21, 0.58)",
      panelQuietStrong: "rgba(6, 10, 18, 0.84)",
      panelQuietBorder: "rgba(98, 146, 255, 0.18)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: svgPattern("#3bffcf", 0.15),
      boardOverlay: diagonalPattern("#ff4fd8", 0.22, 36)
    },
    piecePalette: {
      I: "#00F5FF",
      O: "#FFE156",
      T: "#B589FF",
      S: "#3BFFCF",
      Z: "#FF5D8F",
      J: "#4F7DFF",
      L: "#FF9E3D"
    }
  },
  retro: {
    id: "retro",
    name: "Retro Mono",
    tagline: "Warm phosphor-style arcade tones.",
    colors: {
      bg: "#050403",
      bgElevated: "#0b0906",
      surface: "rgba(12, 10, 8, 0.82)",
      surfaceStrong: "rgba(8, 6, 4, 0.92)",
      surfaceGlass: "rgba(14, 11, 8, 0.64)",
      border: "rgba(248, 214, 136, 0.2)",
      borderStrong: "rgba(248, 214, 136, 0.35)",
      text: "#f9e7b7",
      textMuted: "rgba(249, 231, 183, 0.65)",
      accent: "#f4cf65",
      accentStrong: "#f2b45b",
      accentWarm: "#f59f6a",
      accentGlow: "rgba(244, 207, 101, 0.3)",
      accentWarmGlow: "rgba(245, 159, 106, 0.24)",
      success: "#b7d774",
      warning: "#f7cd5d",
      danger: "#f28f5f",
      focus: "rgba(244, 207, 101, 0.9)",
      boardBg: "#040302",
      boardGrid: "rgba(255, 235, 170, 0.06)",
      boardGridStrong: "rgba(255, 235, 170, 0.14)",
      boardGlow: "#f4cf65",
      panelQuiet: "rgba(12, 9, 6, 0.56)",
      panelQuietStrong: "rgba(9, 7, 4, 0.82)",
      panelQuietBorder: "rgba(248, 214, 136, 0.16)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: dotPattern("#f4cf65", 0.22),
      boardOverlay: diagonalPattern("#f2b45b", 0.26, 28)
    },
    piecePalette: {
      I: "#E6D98D",
      O: "#F2C265",
      T: "#D39A5B",
      S: "#C7BF73",
      Z: "#E18D5C",
      J: "#B59F6A",
      L: "#F0A95A"
    }
  },
  liquid2026: {
    id: "liquid2026",
    name: "Liquid Glass 2026",
    tagline: "High-contrast glass layers inspired by modern mobile UI.",
    colors: {
      bg: "#070b16",
      bgElevated: "#0f1a33",
      surface: "rgba(13, 23, 46, 0.6)",
      surfaceStrong: "rgba(10, 19, 41, 0.84)",
      surfaceGlass: "rgba(25, 36, 62, 0.48)",
      border: "rgba(157, 190, 255, 0.34)",
      borderStrong: "rgba(186, 208, 255, 0.5)",
      text: "#f2f7ff",
      textMuted: "rgba(225, 235, 255, 0.72)",
      accent: "#64f0ff",
      accentStrong: "#8f9cff",
      accentWarm: "#ff82b5",
      accentGlow: "rgba(100, 240, 255, 0.34)",
      accentWarmGlow: "rgba(255, 130, 181, 0.28)",
      success: "#53f0b0",
      warning: "#ffd166",
      danger: "#ff8f9a",
      focus: "rgba(100, 240, 255, 0.92)",
      boardBg: "#050914",
      boardGrid: "rgba(199, 220, 255, 0.08)",
      boardGridStrong: "rgba(199, 220, 255, 0.18)",
      boardGlow: "#64f0ff",
      panelQuiet: "rgba(13, 22, 43, 0.5)",
      panelQuietStrong: "rgba(11, 18, 36, 0.78)",
      panelQuietBorder: "rgba(146, 176, 255, 0.2)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: svgPattern("#9dc0ff", 0.14, 26),
      boardOverlay: dotPattern("#64f0ff", 0.3, 22)
    },
    piecePalette: {
      I: "#64F0FF",
      O: "#FFE37C",
      T: "#A8AFFF",
      S: "#62E7C1",
      Z: "#FF8AA6",
      J: "#7095FF",
      L: "#FFB163"
    }
  },
  gameboy: {
    id: "gameboy",
    name: "DMG Classic",
    tagline: "Monochrome handheld palette from the 90s.",
    colors: {
      bg: "#1b2518",
      bgElevated: "#253421",
      surface: "rgba(44, 59, 38, 0.76)",
      surfaceStrong: "rgba(36, 49, 31, 0.9)",
      surfaceGlass: "rgba(58, 76, 48, 0.58)",
      border: "rgba(147, 174, 115, 0.26)",
      borderStrong: "rgba(147, 174, 115, 0.4)",
      text: "#d9e7be",
      textMuted: "rgba(197, 217, 161, 0.7)",
      accent: "#b5d46f",
      accentStrong: "#8caf55",
      accentWarm: "#d0be74",
      accentGlow: "rgba(181, 212, 111, 0.28)",
      accentWarmGlow: "rgba(208, 190, 116, 0.24)",
      success: "#9fcb6a",
      warning: "#dbc06f",
      danger: "#d1916d",
      focus: "rgba(181, 212, 111, 0.92)",
      boardBg: "#151f13",
      boardGrid: "rgba(217, 231, 190, 0.07)",
      boardGridStrong: "rgba(217, 231, 190, 0.16)",
      boardGlow: "#b5d46f",
      panelQuiet: "rgba(30, 42, 26, 0.58)",
      panelQuietStrong: "rgba(24, 35, 22, 0.82)",
      panelQuietBorder: "rgba(147, 174, 115, 0.18)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: dotPattern("#d9e7be", 0.22, 20),
      boardOverlay: svgPattern("#b5d46f", 0.22, 20)
    },
    piecePalette: {
      I: "#D9E7BE",
      O: "#B5D46F",
      T: "#A4C062",
      S: "#8CAF55",
      Z: "#D0BE74",
      J: "#7D9C4A",
      L: "#C1D98C"
    }
  },
  solarized: {
    id: "solarized",
    name: "Solarized 2010",
    tagline: "Classic editor palette translated to game UI.",
    colors: {
      bg: "#002b36",
      bgElevated: "#073642",
      surface: "rgba(7, 54, 66, 0.74)",
      surfaceStrong: "rgba(0, 43, 54, 0.92)",
      surfaceGlass: "rgba(10, 57, 70, 0.56)",
      border: "rgba(88, 110, 117, 0.35)",
      borderStrong: "rgba(88, 110, 117, 0.55)",
      text: "#eee8d5",
      textMuted: "rgba(238, 232, 213, 0.7)",
      accent: "#2aa198",
      accentStrong: "#268bd2",
      accentWarm: "#cb4b16",
      accentGlow: "rgba(42, 161, 152, 0.3)",
      accentWarmGlow: "rgba(203, 75, 22, 0.22)",
      success: "#859900",
      warning: "#b58900",
      danger: "#dc322f",
      focus: "rgba(42, 161, 152, 0.92)",
      boardBg: "#001f27",
      boardGrid: "rgba(238, 232, 213, 0.07)",
      boardGridStrong: "rgba(238, 232, 213, 0.16)",
      boardGlow: "#2aa198",
      panelQuiet: "rgba(0, 43, 54, 0.62)",
      panelQuietStrong: "rgba(0, 36, 45, 0.85)",
      panelQuietBorder: "rgba(88, 110, 117, 0.25)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: diagonalPattern("#2aa198", 0.2, 30),
      boardOverlay: svgPattern("#cb4b16", 0.2, 32)
    },
    piecePalette: {
      I: "#2AA198",
      O: "#B58900",
      T: "#6C71C4",
      S: "#859900",
      Z: "#DC322F",
      J: "#268BD2",
      L: "#CB4B16"
    }
  },
  c64: {
    id: "c64",
    name: "C64 Nights",
    tagline: "80s home-computer inspired palette.",
    colors: {
      bg: "#161738",
      bgElevated: "#20204c",
      surface: "rgba(38, 40, 89, 0.78)",
      surfaceStrong: "rgba(31, 32, 72, 0.9)",
      surfaceGlass: "rgba(48, 50, 104, 0.58)",
      border: "rgba(131, 118, 198, 0.34)",
      borderStrong: "rgba(131, 118, 198, 0.5)",
      text: "#e1d8ff",
      textMuted: "rgba(213, 202, 255, 0.72)",
      accent: "#8ee3ff",
      accentStrong: "#b79dff",
      accentWarm: "#ff9b86",
      accentGlow: "rgba(142, 227, 255, 0.32)",
      accentWarmGlow: "rgba(255, 155, 134, 0.26)",
      success: "#9be77a",
      warning: "#ffd47a",
      danger: "#ff8ea1",
      focus: "rgba(142, 227, 255, 0.9)",
      boardBg: "#12132d",
      boardGrid: "rgba(225, 216, 255, 0.08)",
      boardGridStrong: "rgba(225, 216, 255, 0.16)",
      boardGlow: "#8ee3ff",
      panelQuiet: "rgba(30, 32, 71, 0.58)",
      panelQuietStrong: "rgba(24, 25, 59, 0.82)",
      panelQuietBorder: "rgba(131, 118, 198, 0.2)"
    },
    assets: {
      ...baseAssets,
      bodyPattern: diagonalPattern("#b79dff", 0.2, 32),
      boardOverlay: dotPattern("#8ee3ff", 0.26, 24)
    },
    piecePalette: {
      I: "#8EE3FF",
      O: "#FFD47A",
      T: "#B79DFF",
      S: "#9BE77A",
      Z: "#FF8EA1",
      J: "#7AA8FF",
      L: "#FFB27A"
    }
  }
};

const COLOR_VAR_MAP: Record<ThemeColorKey, string> = {
  bg: "--bg",
  bgElevated: "--bg-elevated",
  surface: "--surface",
  surfaceStrong: "--surface-strong",
  surfaceGlass: "--surface-glass",
  border: "--border",
  borderStrong: "--border-strong",
  text: "--text",
  textMuted: "--text-muted",
  accent: "--accent",
  accentStrong: "--accent-strong",
  accentWarm: "--accent-warm",
  accentGlow: "--accent-glow",
  accentWarmGlow: "--accent-warm-glow",
  success: "--success",
  warning: "--warning",
  danger: "--danger",
  focus: "--focus",
  boardBg: "--board-bg",
  boardGrid: "--board-grid",
  boardGridStrong: "--board-grid-strong",
  boardGlow: "--board-glow",
  panelQuiet: "--panel-quiet",
  panelQuietStrong: "--panel-quiet-strong",
  panelQuietBorder: "--panel-quiet-border"
};

const ABSOLUTE_URL = /^(?:https?:|data:|blob:|\/)/i;

const resolveAssetUrl = (asset: string, baseUrl: string) => {
  const value = asset.trim();
  if (!value) return "";
  if (ABSOLUTE_URL.test(value)) return value;
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}${value}`;
};

const normalizeThemeId = (value: string | undefined): ThemeId => {
  if (value && THEME_IDS.includes(value as ThemeId)) {
    return value as ThemeId;
  }
  return "dark";
};

export const createDefaultCustomTheme = (): CustomTheme => ({
  name: "Custom Theme",
  baseTheme: "liquid2026",
  colors: {},
  assets: {},
  piecePalette: {}
});

export const getResolvedThemeId = (
  selection: ThemeSelection,
  customTheme?: CustomTheme | null
): ThemeId => {
  if (selection === "custom") {
    return normalizeThemeId(customTheme?.baseTheme);
  }
  return normalizeThemeId(selection);
};

export const getThemeDefinition = (
  selection: ThemeSelection,
  customTheme?: CustomTheme | null
): ThemeDefinition => {
  const themeId = getResolvedThemeId(selection, customTheme);
  return THEMES[themeId] ?? THEMES.dark;
};

export const applyThemeToDocument = (
  root: HTMLElement,
  selection: ThemeSelection,
  customTheme?: CustomTheme | null,
  baseUrl = import.meta.env.BASE_URL ?? "/"
) => {
  const theme = getThemeDefinition(selection, customTheme);
  const customColors = selection === "custom" ? (customTheme?.colors ?? {}) : {};
  const customAssets = selection === "custom" ? (customTheme?.assets ?? {}) : {};

  const mergedColors: Record<ThemeColorKey, string> = {
    ...theme.colors,
    ...customColors
  };

  const mergedAssets: Record<ThemeAssetKey, string> = {
    ...theme.assets,
    ...customAssets
  };

  root.dataset.theme = theme.id;
  root.dataset.themeMode = selection;

  for (const key of THEME_COLOR_KEYS) {
    root.style.setProperty(COLOR_VAR_MAP[key], mergedColors[key]);
  }

  const imp1 = resolveAssetUrl(mergedAssets.doomImp1, baseUrl);
  const imp2 = resolveAssetUrl(mergedAssets.doomImp2, baseUrl);
  const itemHealth = resolveAssetUrl(mergedAssets.doomItemHealth, baseUrl);
  const itemArmor = resolveAssetUrl(mergedAssets.doomItemArmor, baseUrl);
  const itemAmmo = resolveAssetUrl(mergedAssets.doomItemAmmo, baseUrl);
  const bodyPattern = resolveAssetUrl(mergedAssets.bodyPattern, baseUrl);
  const boardOverlay = resolveAssetUrl(mergedAssets.boardOverlay, baseUrl);

  root.style.setProperty("--asset-doom-imp-1", imp1);
  root.style.setProperty("--asset-doom-imp-2", imp2);
  root.style.setProperty("--asset-doom-item-health", itemHealth);
  root.style.setProperty("--asset-doom-item-armor", itemArmor);
  root.style.setProperty("--asset-doom-item-ammo", itemAmmo);
  root.style.setProperty(
    "--asset-body-pattern-image",
    bodyPattern ? `url("${bodyPattern}")` : "none"
  );
  root.style.setProperty(
    "--asset-board-overlay-image",
    boardOverlay ? `url("${boardOverlay}")` : "none"
  );
};

export const getThemePreview = (
  selection: ThemeSelection,
  customTheme?: CustomTheme | null
): string[] => {
  const theme = getThemeDefinition(selection, customTheme);
  const customColors = selection === "custom" ? (customTheme?.colors ?? {}) : {};
  return [
    customColors.bg ?? theme.colors.bg,
    customColors.accent ?? theme.colors.accent,
    customColors.accentWarm ?? theme.colors.accentWarm
  ];
};

export const getThemePiecePalette = (
  selection: ThemeSelection,
  customTheme?: CustomTheme | null
): PiecePalette => {
  const theme = getThemeDefinition(selection, customTheme);
  if (selection !== "custom") {
    return theme.piecePalette;
  }
  return {
    ...theme.piecePalette,
    ...(customTheme?.piecePalette ?? {})
  };
};

export const THEME_COLOR_LABELS: Record<ThemeColorKey, string> = {
  bg: "App Background",
  bgElevated: "App Gradient",
  surface: "Surface",
  surfaceStrong: "Surface Strong",
  surfaceGlass: "Glass Surface",
  border: "Border",
  borderStrong: "Border Strong",
  text: "Text",
  textMuted: "Muted Text",
  accent: "Accent",
  accentStrong: "Accent Strong",
  accentWarm: "Accent Warm",
  accentGlow: "Accent Glow",
  accentWarmGlow: "Warm Glow",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  focus: "Focus Ring",
  boardBg: "Board Background",
  boardGrid: "Board Grid",
  boardGridStrong: "Board Grid Strong",
  boardGlow: "Board Glow",
  panelQuiet: "Panel",
  panelQuietStrong: "Panel Strong",
  panelQuietBorder: "Panel Border"
};

export const THEME_ASSET_LABELS: Record<ThemeAssetKey, string> = {
  doomImp1: "Doom Enemy Frame 1 URL",
  doomImp2: "Doom Enemy Frame 2 URL",
  doomItemHealth: "Doom Health Pickup URL",
  doomItemArmor: "Doom Armor Pickup URL",
  doomItemAmmo: "Doom Ammo Pickup URL",
  bodyPattern: "Body Pattern Image URL",
  boardOverlay: "Board Overlay Image URL"
};
