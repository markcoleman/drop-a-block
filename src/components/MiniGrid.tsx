import { TetrominoType } from "../engine/types";
import { COLORS } from "../engine/engine";

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

export const MiniGrid = ({ type, label }: { type: TetrominoType | null; label: string }) => {
  return (
    <div className="mini-grid" aria-label={label} role="img">
      {Array.from({ length: 16 }).map((_, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const filled = type ? SHAPES[type][row][col] === 1 : false;
        const color = type ? COLORS[type] : "transparent";
        return (
          <span
            key={`${row}-${col}`}
            className="mini-cell"
            style={{ background: filled ? color : "transparent" }}
          />
        );
      })}
    </div>
  );
};
