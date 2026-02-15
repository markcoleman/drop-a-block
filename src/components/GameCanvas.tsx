import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  getBlocks,
  getGhost,
  TETROMINO_INDEX,
  TETROMINO_ORDER,
  VISIBLE_ROWS
} from "../engine/engine";
import type { GameState, Piece } from "../engine/types";
import type { PaletteMap } from "../ui/palettes";

export type DropTrail = {
  active: Piece;
  ghost: Piece;
  startedAt: number;
  color: string;
};

type GameCanvasProps = {
  state: GameState;
  palette: PaletteMap;
  dropTrail: DropTrail | null;
  reducedMotion: boolean;
  theme: string;
  onPointerDown?: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLCanvasElement>) => void;
};

type RGB = { r: number; g: number; b: number };

const parseHex = (hex: string): RGB => {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return { r, g, b };
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const toRgba = ({ r, g, b }: RGB, alpha = 1) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const shade = (hex: string, amount: number) => {
  const { r, g, b } = parseHex(hex);
  const target = amount < 0 ? 0 : 255;
  const mix = Math.abs(amount);
  const next = {
    r: Math.round((target - r) * mix + r),
    g: Math.round((target - g) * mix + g),
    b: Math.round((target - b) * mix + b)
  };
  return `rgb(${next.r}, ${next.g}, ${next.b})`;
};

const shadeByFactor = (hex: string, factor: number) => {
  const { r, g, b } = parseHex(hex);
  const clamped = Math.max(0, Math.min(1, factor));
  return `rgb(${Math.round(r * clamped)}, ${Math.round(g * clamped)}, ${Math.round(
    b * clamped
  )})`;
};

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawTile = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 1,
  glow = 0.4
) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = toRgba(parseHex(color), 0.6);
  ctx.shadowBlur = size * glow;
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, shade(color, 0.35));
  gradient.addColorStop(0.55, color);
  gradient.addColorStop(1, shade(color, -0.25));
  ctx.fillStyle = gradient;
  roundedRect(ctx, x, y, size, size, size * 0.22);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(1, size * 0.06);
  ctx.strokeStyle = toRgba(parseHex(color), 0.5);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, size * 0.03);
  ctx.strokeStyle = toRgba(parseHex("#ffffff"), 0.2);
  ctx.stroke();
  ctx.restore();
};

const drawGhostTile = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) => {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.setLineDash([size * 0.3, size * 0.18]);
  ctx.lineWidth = Math.max(1, size * 0.1);
  ctx.shadowColor = toRgba(parseHex(color), 0.35);
  ctx.shadowBlur = size * 0.18;
  ctx.strokeStyle = toRgba(parseHex(color), 0.55);
  roundedRect(ctx, x + size * 0.06, y + size * 0.06, size * 0.88, size * 0.88, size * 0.22);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  ctx.lineWidth = Math.max(1, size * 0.05);
  ctx.strokeStyle = toRgba(parseHex("#ffffff"), 0.25);
  roundedRect(ctx, x + size * 0.12, y + size * 0.12, size * 0.76, size * 0.76, size * 0.18);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
};


export const GameCanvas = ({
  state,
  palette,
  dropTrail,
  reducedMotion,
  theme,
  onPointerDown,
  onPointerMove,
  onPointerUp
}: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasPointerHandlers = Boolean(onPointerDown || onPointerMove || onPointerUp);
  const spriteRef = useRef<{
    imp: HTMLImageElement[];
    items: Record<string, HTMLImageElement>;
  }>({ imp: [], items: {} });
  const themeRef = useRef({
    board: "#0a0f1f",
    grid: "rgba(255,255,255,0.08)",
    gridStrong: "rgba(255,255,255,0.16)",
    glow: "rgba(56, 189, 248, 0.45)",
    accent: "#38bdf8",
    accentStrong: "#7c83ff",
    accentWarm: "#f472b6",
    text: "#e2e8f0"
  });
  const clearRef = useRef<{ count: number; startedAt: number } | null>(null);
  const lastClearRef = useRef(state.lastClear);

  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? "/";
    const load = (name: string) => {
      const img = new Image();
      img.src = `${base}sprites/doom/${name}`;
      return img;
    };
    spriteRef.current = {
      imp: [load("imp_1.png"), load("imp_2.png")],
      items: {
        health: load("item_health.png"),
        armor: load("item_armor.png"),
        ammo: load("item_ammo.png")
      }
    };
  }, []);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    themeRef.current = {
      board: styles.getPropertyValue("--board-bg").trim() || themeRef.current.board,
      grid: styles.getPropertyValue("--board-grid").trim() || themeRef.current.grid,
      gridStrong:
        styles.getPropertyValue("--board-grid-strong").trim() || themeRef.current.gridStrong,
      glow: styles.getPropertyValue("--board-glow").trim() || themeRef.current.glow,
      accent: styles.getPropertyValue("--accent").trim() || themeRef.current.accent,
      accentStrong: styles.getPropertyValue("--accent-strong").trim() || themeRef.current.accentStrong,
      accentWarm: styles.getPropertyValue("--accent-warm").trim() || themeRef.current.accentWarm,
      text: styles.getPropertyValue("--text").trim() || themeRef.current.text
    };
  }, [theme]);

  useEffect(() => {
    if (state.lastClear === lastClearRef.current) return;
    if (state.lastClear > 0) {
      clearRef.current = { count: state.lastClear, startedAt: performance.now() };
    }
    lastClearRef.current = state.lastClear;
  }, [state.lastClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width / BOARD_WIDTH;
    const isArkanoid = state.mode === "arkanoid";
    const isDoom = state.mode === "doom";
    const visibleStart = BOARD_HEIGHT - VISIBLE_ROWS;
    const paletteArray = ["transparent", ...TETROMINO_ORDER.map((type) => palette[type])];
    const now = performance.now();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = themeRef.current.board;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!isArkanoid && !isDoom && dropTrail && !reducedMotion) {
      const trailAge = now - dropTrail.startedAt;
      const trailProgress = Math.min(trailAge / 280, 1);
      if (trailProgress < 1) {
        const activeBlocks = getBlocks(dropTrail.active);
        const ghostBlocks = getBlocks(dropTrail.ghost);
        const alpha = (1 - trailProgress) * 0.55;
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        activeBlocks.forEach((block, index) => {
          const ghostBlock = ghostBlocks[index];
          if (!ghostBlock) return;
          const top = Math.min(block.y, ghostBlock.y);
          const bottom = Math.max(block.y, ghostBlock.y);
          if (bottom < visibleStart) return;
          const startY = Math.max(top, visibleStart) - visibleStart;
          const endY = bottom - visibleStart;
          const trailX = block.x * size + size * 0.2;
          const trailY = startY * size + size * 0.1;
          const trailHeight = Math.max(1, (endY - startY + 1) * size - size * 0.2);
          const gradient = ctx.createLinearGradient(0, trailY, 0, trailY + trailHeight);
          gradient.addColorStop(0, toRgba(parseHex(dropTrail.color), alpha * 0.1));
          gradient.addColorStop(0.45, toRgba(parseHex(dropTrail.color), alpha));
          gradient.addColorStop(1, toRgba(parseHex(dropTrail.color), alpha * 0.15));
          ctx.fillStyle = gradient;
          roundedRect(ctx, trailX, trailY, size * 0.6, trailHeight, size * 0.3);
          ctx.fill();
        });
        ctx.restore();
      }
    }

    if (!isArkanoid && !isDoom) {
      ctx.strokeStyle = themeRef.current.grid;
      for (let y = visibleStart; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
          const value = state.board[y][x];
          const localY = y - visibleStart;
          const drawX = x * size;
          const drawY = localY * size;
          if (value > 0) {
            drawTile(ctx, drawX, drawY, size, paletteArray[value]);
          } else {
            ctx.strokeRect(drawX + 0.5, drawY + 0.5, size - 1, size - 1);
          }
        }
      }

      if (!state.modifiers.noGhost) {
        const ghost = getGhost(state);
        getBlocks(ghost).forEach((block) => {
          if (block.y >= BOARD_HEIGHT - VISIBLE_ROWS) {
            drawGhostTile(
              ctx,
              block.x * size,
              (block.y - (BOARD_HEIGHT - VISIBLE_ROWS)) * size,
              size,
              paletteArray[TETROMINO_INDEX[ghost.type]]
            );
          }
        });
      }

      getBlocks(state.active).forEach((block) => {
        if (block.y >= BOARD_HEIGHT - VISIBLE_ROWS) {
          drawTile(
            ctx,
            block.x * size,
            (block.y - (BOARD_HEIGHT - VISIBLE_ROWS)) * size,
            size,
            paletteArray[TETROMINO_INDEX[state.active.type]]
          );
        }
      });
    } else if (isDoom) {
      const { player, exit } = state.doom;
      const width = canvas.width;
      const height = canvas.height;
      const fov = Math.PI / 3;
      const halfFov = fov / 2;
      const maxDepth = VISIBLE_ROWS + 2;
      const rayStep = 2;
      const hudHeight = height * 0.2;

      const toBoardY = (gridY: number) => BOARD_HEIGHT - 1 - gridY;
      const getCellValue = (gridX: number, gridY: number) => {
        if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) {
          return -1;
        }
        const boardY = toBoardY(gridY);
        return state.board[boardY]?.[gridX] ?? 0;
      };

      const castRayDistance = (angle: number) => {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);
        const deltaDistX = dirX === 0 ? 1e30 : Math.abs(1 / dirX);
        const deltaDistY = dirY === 0 ? 1e30 : Math.abs(1 / dirY);
        let stepX = 0;
        let stepY = 0;
        let sideDistX = 0;
        let sideDistY = 0;
        if (dirX < 0) {
          stepX = -1;
          sideDistX = (player.x - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1 - player.x) * deltaDistX;
        }
        if (dirY < 0) {
          stepY = -1;
          sideDistY = (player.y - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1 - player.y) * deltaDistY;
        }
        let distance = maxDepth;
        let hit = false;
        let side = 0;
        while (!hit) {
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }
          if (mapX < 0 || mapX >= BOARD_WIDTH || mapY < 0 || mapY >= VISIBLE_ROWS) {
            break;
          }
          if (getCellValue(mapX, mapY) > 0) {
            hit = true;
          }
        }
        if (hit) {
          distance =
            side === 0
              ? (mapX - player.x + (1 - stepX) / 2) / (dirX || 1e-6)
              : (mapY - player.y + (1 - stepY) / 2) / (dirY || 1e-6);
        }
        return Math.max(0.1, distance);
      };

      const drawBillboard = (
        entityX: number,
        entityY: number,
        color: string,
        heightScale = 1,
        widthScale = 0.35,
        sprite?: HTMLImageElement
      ) => {
        const vectorX = entityX - player.x;
        const vectorY = entityY - player.y;
        const distance = Math.hypot(vectorX, vectorY);
        if (distance < 0.01) return;
        let angle = Math.atan2(vectorY, vectorX);
        let diff = angle - player.angle;
        diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (Math.abs(diff) > halfFov) return;
        const wallDistance = castRayDistance(angle);
        if (wallDistance < distance - 0.2) return;
        const screenX = (0.5 + diff / fov) * width;
        const spriteHeight = Math.min(height * 0.9, (height / distance) * heightScale);
        const spriteWidth = sprite
          ? spriteHeight * (sprite.naturalWidth / sprite.naturalHeight) * widthScale
          : spriteHeight * widthScale;
        const spriteTop = height / 2 - spriteHeight / 2;
        ctx.save();
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
          ctx.drawImage(sprite, screenX - spriteWidth / 2, spriteTop, spriteWidth, spriteHeight);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(screenX - spriteWidth / 2, spriteTop, spriteWidth, spriteHeight);
          ctx.strokeStyle = "rgba(15, 23, 42, 0.6)";
          ctx.strokeRect(screenX - spriteWidth / 2, spriteTop, spriteWidth, spriteHeight);
        }
        ctx.restore();
      };

      const ceiling = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      ceiling.addColorStop(0, "rgba(6, 7, 14, 0.95)");
      ceiling.addColorStop(1, "rgba(20, 10, 18, 0.85)");
      ctx.fillStyle = ceiling;
      ctx.fillRect(0, 0, width, height / 2);
      const floor = ctx.createLinearGradient(0, height / 2, 0, height);
      floor.addColorStop(0, "rgba(18, 12, 12, 0.9)");
      floor.addColorStop(1, "rgba(3, 4, 10, 0.98)");
      ctx.fillStyle = floor;
      ctx.fillRect(0, height / 2, width, height / 2);

      for (let column = 0; column < width; column += rayStep) {
        const rayAngle = player.angle - halfFov + (column / width) * fov;
        const dirX = Math.cos(rayAngle);
        const dirY = Math.sin(rayAngle);
        let mapX = Math.floor(player.x);
        let mapY = Math.floor(player.y);
        const deltaDistX = dirX === 0 ? 1e30 : Math.abs(1 / dirX);
        const deltaDistY = dirY === 0 ? 1e30 : Math.abs(1 / dirY);
        let stepX = 0;
        let stepY = 0;
        let sideDistX = 0;
        let sideDistY = 0;
        if (dirX < 0) {
          stepX = -1;
          sideDistX = (player.x - mapX) * deltaDistX;
        } else {
          stepX = 1;
          sideDistX = (mapX + 1 - player.x) * deltaDistX;
        }
        if (dirY < 0) {
          stepY = -1;
          sideDistY = (player.y - mapY) * deltaDistY;
        } else {
          stepY = 1;
          sideDistY = (mapY + 1 - player.y) * deltaDistY;
        }
        let hitValue = 0;
        let side = 0;
        let hit = false;
        while (!hit) {
          if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0;
          } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1;
          }
          if (mapX < 0 || mapX >= BOARD_WIDTH || mapY < 0 || mapY >= VISIBLE_ROWS) {
            break;
          }
          hitValue = getCellValue(mapX, mapY);
          if (hitValue > 0) {
            hit = true;
          }
        }

        if (!hit) continue;
        const distance =
          side === 0
            ? (mapX - player.x + (1 - stepX) / 2) / (dirX || 1e-6)
            : (mapY - player.y + (1 - stepY) / 2) / (dirY || 1e-6);
        const corrected = Math.max(0.1, distance);
        const lineHeight = Math.min(height, height / corrected);
        const drawStart = Math.max(0, height / 2 - lineHeight / 2);
        const drawEnd = Math.min(height, height / 2 + lineHeight / 2);
        const baseColor = paletteArray[hitValue] ?? themeRef.current.accent;
        const depthFade = Math.max(0.25, 1 - corrected / maxDepth);
        const sideFade = side === 1 ? 0.7 : 1;
        ctx.strokeStyle = shadeByFactor(baseColor, depthFade * sideFade);
        ctx.lineWidth = rayStep;
        ctx.beginPath();
        ctx.moveTo(column, drawStart);
        ctx.lineTo(column, drawEnd);
        ctx.stroke();
      }

      const impFrames = spriteRef.current.imp;
      const enemySprite =
        impFrames.length > 0 ? impFrames[Math.floor(now / 220) % impFrames.length] : undefined;
      const itemSprites = spriteRef.current.items;

      state.doom.items.forEach((item) => {
        const color =
          item.type === "health"
            ? "rgba(74, 222, 128, 0.85)"
            : item.type === "armor"
              ? "rgba(56, 189, 248, 0.85)"
              : "rgba(251, 191, 36, 0.85)";
        drawBillboard(item.x, item.y, color, 0.55, 0.9, itemSprites[item.type]);
      });

      state.doom.enemies.forEach((enemy) => {
        const healthTint = enemy.health <= 1 ? 0.6 : 0.85;
        drawBillboard(
          enemy.x,
          enemy.y,
          `rgba(248, 113, 113, ${healthTint})`,
          1.05,
          0.95,
          enemySprite
        );
      });

      const exitCenter = { x: exit.x + 0.5, y: exit.y + 0.5 };
      const exitVector = {
        x: exitCenter.x - player.x,
        y: exitCenter.y - player.y
      };
      const exitDistance = Math.hypot(exitVector.x, exitVector.y);
      const exitAngle = Math.atan2(exitVector.y, exitVector.x);
      let diff = exitAngle - player.angle;
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (Math.abs(diff) < halfFov) {
        const wallDistance = castRayDistance(exitAngle);
        if (wallDistance > exitDistance - 0.2) {
          const screenX = (0.5 + diff / fov) * width;
          const spriteHeight = Math.min(height * 0.7, height / Math.max(0.2, exitDistance));
          const spriteWidth = spriteHeight * 0.22;
          ctx.save();
          ctx.fillStyle = "rgba(248, 113, 113, 0.8)";
          ctx.fillRect(
            screenX - spriteWidth / 2,
            height / 2 - spriteHeight / 2,
            spriteWidth,
            spriteHeight
          );
          ctx.restore();
        }
      }

      ctx.save();
      ctx.fillStyle = "rgba(5, 6, 12, 0.92)";
      ctx.fillRect(0, height - hudHeight, width, hudHeight);
      ctx.strokeStyle = "rgba(248, 113, 113, 0.45)";
      ctx.strokeRect(0, height - hudHeight, width, hudHeight);
      ctx.fillStyle = "rgba(248, 113, 113, 0.9)";
      ctx.fillRect(0, height - hudHeight - 2, width, 2);
      ctx.font = "12px 'Space Grotesk', system-ui, sans-serif";
      ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
      ctx.fillText(`HEALTH ${state.doom.health}`, 14, height - hudHeight + 22);
      ctx.fillText(`ARMOR ${state.doom.armor}`, 14, height - hudHeight + 44);
      ctx.fillText(`AMMO ${state.doom.ammo}`, width * 0.45, height - hudHeight + 22);
      ctx.fillText(
        `TIME ${Math.max(0, Math.ceil(state.doom.timeLeft / 1000))}s`,
        width * 0.45,
        height - hudHeight + 44
      );
      const healthBarWidth = width * 0.32;
      const armorBarWidth = width * 0.32;
      ctx.fillStyle = "rgba(248, 113, 113, 0.35)";
      ctx.fillRect(14, height - hudHeight + 28, healthBarWidth, 6);
      ctx.fillStyle = "rgba(248, 113, 113, 0.9)";
      ctx.fillRect(
        14,
        height - hudHeight + 28,
        (healthBarWidth * state.doom.health) / 100,
        6
      );
      ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
      ctx.fillRect(14, height - hudHeight + 50, armorBarWidth, 6);
      ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
      ctx.fillRect(
        14,
        height - hudHeight + 50,
        (armorBarWidth * state.doom.armor) / 100,
        6
      );
      ctx.restore();

      const gunWidth = width * 0.35;
      const gunHeight = height * 0.18;
      const gunX = width / 2 - gunWidth / 2;
      const gunY = height - hudHeight - gunHeight * 0.35;
      ctx.save();
      ctx.fillStyle = "rgba(12, 14, 24, 0.9)";
      ctx.fillRect(gunX, gunY, gunWidth, gunHeight);
      ctx.fillStyle = "rgba(148, 163, 184, 0.85)";
      ctx.fillRect(
        gunX + gunWidth * 0.08,
        gunY + gunHeight * 0.15,
        gunWidth * 0.84,
        gunHeight * 0.5
      );
      ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
      ctx.fillRect(gunX + gunWidth * 0.35, gunY - gunHeight * 0.1, gunWidth * 0.3, gunHeight * 0.2);
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "rgba(248, 113, 113, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 10, height / 2);
      ctx.lineTo(width / 2 + 10, height / 2);
      ctx.moveTo(width / 2, height / 2 - 10);
      ctx.lineTo(width / 2, height / 2 + 10);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.strokeStyle = themeRef.current.gridStrong;
      for (let y = 0; y < VISIBLE_ROWS; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
          ctx.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
        }
      }

      for (let y = visibleStart; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
          const value = state.board[y][x];
          if (value === 0) continue;
          const localY = y - visibleStart;
          const drawX = (BOARD_WIDTH - 1 - x) * size;
          const drawY = (VISIBLE_ROWS - 1 - localY) * size;
          drawTile(ctx, drawX, drawY, size, paletteArray[value], 0.95, 0.3);
        }
      }

      const paddleY = VISIBLE_ROWS - 1;
      const paddleScreenY = paddleY * size + size * 0.2;
      ctx.fillStyle = themeRef.current.text;
      roundedRect(
        ctx,
        state.arkanoid.paddleX * size,
        paddleScreenY,
        state.arkanoid.paddleWidth * size,
        size * 0.6,
        size * 0.3
      );
      ctx.fill();
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
        ctx.fillStyle = themeRef.current.accentStrong;
        ctx.arc(ballX, ballY, size * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.stroke();
      });

      state.arkanoid.lasers.forEach((laser) => {
        ctx.fillStyle = themeRef.current.accentWarm;
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
          laser: themeRef.current.accent,
          multi: "#fb7185"
        };
        ctx.fillStyle = colors[powerup.type] ?? themeRef.current.text;
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

    if (!reducedMotion && clearRef.current) {
      const pulse = clearRef.current;
      const elapsed = now - pulse.startedAt;
      const duration = 320;
      const progress = Math.min(1, elapsed / duration);
      if (progress < 1) {
        const intensity = Math.min(pulse.count, 4) / 4;
        const alpha = (1 - progress) * 0.45 * intensity;
        const sweepY = (1 - progress) * canvas.height;
        const gradient = ctx.createLinearGradient(0, sweepY - 120, 0, sweepY + 120);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(0.5, toRgba(parseHex(themeRef.current.glow), alpha));
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      if (progress >= 1) {
        clearRef.current = null;
      }
    }
  }, [dropTrail, palette, reducedMotion, state, theme]);

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
