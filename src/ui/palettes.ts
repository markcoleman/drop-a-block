import type { TetrominoType } from "../engine/types";

export type PaletteName = "default" | "colorblind";

export type PaletteMap = Record<TetrominoType, string>;

export const PALETTES: Record<PaletteName, PaletteMap> = {
  default: {
    I: "#41D9FF",
    O: "#F7D74F",
    T: "#A988FF",
    S: "#45E49B",
    Z: "#FF6B6B",
    J: "#5A86FF",
    L: "#FF9F43"
  },
  colorblind: {
    I: "#56B4E9",
    O: "#F0E442",
    T: "#CC79A7",
    S: "#009E73",
    Z: "#D55E00",
    J: "#0072B2",
    L: "#E69F00"
  }
};

export const getPalette = (name: PaletteName): PaletteMap => PALETTES[name] ?? PALETTES.default;
