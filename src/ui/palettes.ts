import type { TetrominoType } from "../engine/types";
import {
  type CustomTheme,
  getThemePiecePalette,
  type PiecePalette,
  type ThemeSelection
} from "./themes";

export type PaletteName = "default" | "colorblind";

export type PaletteMap = Record<TetrominoType, string>;

export const COLORBLIND_PALETTE: PaletteMap = {
  I: "#56B4E9",
  O: "#F0E442",
  T: "#CC79A7",
  S: "#009E73",
  Z: "#D55E00",
  J: "#0072B2",
  L: "#E69F00"
};

const toPaletteMap = (palette: PiecePalette): PaletteMap => ({
  I: palette.I,
  O: palette.O,
  T: palette.T,
  S: palette.S,
  Z: palette.Z,
  J: palette.J,
  L: palette.L
});

export const getPalette = (
  paletteName: PaletteName,
  theme: ThemeSelection,
  customTheme?: CustomTheme | null
): PaletteMap => {
  if (paletteName === "colorblind") {
    return COLORBLIND_PALETTE;
  }
  return toPaletteMap(getThemePiecePalette(theme, customTheme));
};
