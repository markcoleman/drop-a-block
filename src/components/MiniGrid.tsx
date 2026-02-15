import type { CSSProperties } from "react";

import { TetrominoType } from "../engine/types";
import type { PaletteMap } from "../ui/palettes";

const SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  T: [
    [0, 1, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  S: [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  Z: [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  J: [
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  L: [
    [0, 0, 1, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
};

export const MiniGrid = ({
  type,
  label,
  palette
}: {
  type: TetrominoType | null;
  label: string;
  palette: PaletteMap;
}) => {
  return (
    <div className="mini-grid" aria-label={label} role="img">
      {Array.from({ length: 16 }).map((_, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const filled = type ? SHAPES[type][row][col] === 1 : false;
        const color = type ? palette[type] : "transparent";
        return (
          <span
            key={`${row}-${col}`}
            className={filled ? "mini-cell filled" : "mini-cell"}
            style={filled ? ({ "--tile-color": color } as CSSProperties) : undefined}
          />
        );
      })}
    </div>
  );
};
