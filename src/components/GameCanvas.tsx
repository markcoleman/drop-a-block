import { useEffect, useRef } from "react";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  COLORS,
  getBlocks,
  getGhost,
  TETROMINO_INDEX,
  TETROMINO_ORDER,
  VISIBLE_ROWS
} from "../engine/engine";
import { GameState } from "../engine/types";

const COLOR_ARRAY = ["transparent", ...TETROMINO_ORDER.map((type) => COLORS[type])];

const drawCell = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 1
) => {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.strokeRect(x, y, size, size);
  ctx.globalAlpha = 1;
};

export const GameCanvas = ({ state }: { state: GameState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width / BOARD_WIDTH;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(10, 12, 20, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = BOARD_HEIGHT - VISIBLE_ROWS; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const value = state.board[y][x];
        if (value > 0) {
          drawCell(
            ctx,
            x * size,
            (y - (BOARD_HEIGHT - VISIBLE_ROWS)) * size,
            size,
            COLOR_ARRAY[value]
          );
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.04)";
          ctx.strokeRect(
            x * size,
            (y - (BOARD_HEIGHT - VISIBLE_ROWS)) * size,
            size,
            size
          );
        }
      }
    }

    const ghost = getGhost(state);
    getBlocks(ghost).forEach((block) => {
      if (block.y >= BOARD_HEIGHT - VISIBLE_ROWS) {
        drawCell(
          ctx,
          block.x * size,
          (block.y - (BOARD_HEIGHT - VISIBLE_ROWS)) * size,
          size,
          COLOR_ARRAY[TETROMINO_INDEX[ghost.type]],
          0.25
        );
      }
    });

    getBlocks(state.active).forEach((block) => {
      if (block.y >= BOARD_HEIGHT - VISIBLE_ROWS) {
        drawCell(
          ctx,
          block.x * size,
          (block.y - (BOARD_HEIGHT - VISIBLE_ROWS)) * size,
          size,
          COLOR_ARRAY[TETROMINO_INDEX[state.active.type]]
        );
      }
    });
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={640}
      className="game-canvas"
      role="img"
      aria-label="Tetris game board"
    />
  );
};
