import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
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

type GameCanvasProps = {
  state: GameState;
  onPointerDown?: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLCanvasElement>) => void;
};

export const GameCanvas = ({ state, onPointerDown, onPointerMove, onPointerUp }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasPointerHandlers = Boolean(onPointerDown || onPointerMove || onPointerUp);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width / BOARD_WIDTH;
    const isArkanoid = state.mode === "arkanoid";
    const visibleStart = BOARD_HEIGHT - VISIBLE_ROWS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(10, 12, 20, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = visibleStart; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const value = state.board[y][x];
        const localY = y - visibleStart;
        const drawX = isArkanoid ? (BOARD_WIDTH - 1 - x) * size : x * size;
        const drawY = isArkanoid
          ? (VISIBLE_ROWS - 1 - localY) * size
          : localY * size;
        if (value > 0) {
          drawCell(
            ctx,
            drawX,
            drawY,
            size,
            COLOR_ARRAY[value]
          );
        } else {
          ctx.strokeStyle = "rgba(255,255,255,0.04)";
          ctx.strokeRect(
            drawX,
            drawY,
            size,
            size
          );
        }
      }
    }

    if (!isArkanoid) {
      if (!state.modifiers.noGhost) {
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
      }

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
    } else {
      const paddleY = VISIBLE_ROWS - 1;
      const paddleScreenY = paddleY * size + size * 0.2;
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(
        state.arkanoid.paddleX * size,
        paddleScreenY,
        state.arkanoid.paddleWidth * size,
        size * 0.6
      );
      ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
      ctx.fillRect(
        state.arkanoid.paddleX * size,
        paddleScreenY + size * 0.4,
        state.arkanoid.paddleWidth * size,
        size * 0.2
      );

      state.arkanoid.balls.forEach((ball) => {
        const ballX = ball.x * size;
        const ballY = ball.y * size;
        ctx.beginPath();
        ctx.fillStyle = "#38bdf8";
        ctx.arc(ballX, ballY, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.stroke();
      });

      state.arkanoid.lasers.forEach((laser) => {
        ctx.fillStyle = "#f472b6";
        ctx.fillRect(
          laser.x * size - size * 0.1,
          laser.y * size - size * 0.6,
          size * 0.2,
          size * 0.8
        );
      });

      state.arkanoid.powerups.forEach((powerup) => {
        const colors: Record<string, string> = {
          skinny: "#fbbf24",
          wide: "#4ade80",
          laser: "#60a5fa",
          multi: "#fb7185"
        };
        ctx.fillStyle = colors[powerup.type] ?? "#e2e8f0";
        ctx.fillRect(
          powerup.x * size - size * 0.35,
          powerup.y * size - size * 0.35,
          size * 0.7,
          size * 0.7
        );
        ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
        ctx.strokeRect(
          powerup.x * size - size * 0.35,
          powerup.y * size - size * 0.35,
          size * 0.7,
          size * 0.7
        );
      });
    }
  }, [state]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!hasPointerHandlers) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onPointerDown?.(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!hasPointerHandlers) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId) || event.pointerType !== "mouse") {
      event.preventDefault();
      onPointerMove?.(event);
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!hasPointerHandlers) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onPointerUp?.(event);
  };

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={640}
      className="game-canvas"
      role="img"
      aria-label="Tetris game board"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    />
  );
};
