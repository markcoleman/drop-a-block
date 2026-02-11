import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DOOM_DURATION,
  DOOM_ENEMY_COOLDOWN,
  DOOM_ENEMY_DAMAGE,
  DOOM_ENEMY_RADIUS,
  DOOM_ENEMY_SPEED,
  DOOM_HEALTH_MAX,
  DOOM_HEALTH_PICKUP,
  DOOM_HEALTH_START,
  DOOM_ARMOR_MAX,
  DOOM_ARMOR_PICKUP,
  DOOM_ARMOR_START,
  DOOM_AMMO_MAX,
  DOOM_AMMO_START,
  DOOM_AMMO_PICKUP,
  DOOM_EXIT_RADIUS,
  DOOM_EXIT_BONUS,
  DOOM_PICKUP_RADIUS,
  DOOM_PLAYER_SPEED,
  DOOM_SHOT_COOLDOWN,
  VISIBLE_ROWS
} from "./constants";
import { cloneBoard } from "./board";
import type { DoomEnemy, DoomInput, DoomItem, DoomItemType, DoomState, GameState } from "./types";

const EMPTY_INPUT: DoomInput = {
  forward: false,
  back: false,
  left: false,
  right: false
};

const clampAngle = (angle: number) => {
  const twoPi = Math.PI * 2;
  let next = angle % twoPi;
  if (next < 0) next += twoPi;
  return next;
};

const toBoardY = (gridY: number) => BOARD_HEIGHT - 1 - gridY;

const isWallAt = (board: number[][], x: number, y: number) => {
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);
  if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) {
    return true;
  }
  const boardY = toBoardY(gridY);
  return board[boardY]?.[gridX] > 0;
};

const canMoveTo = (board: number[][], x: number, y: number, radius: number) => {
  return (
    !isWallAt(board, x - radius, y - radius) &&
    !isWallAt(board, x + radius, y - radius) &&
    !isWallAt(board, x - radius, y + radius) &&
    !isWallAt(board, x + radius, y + radius)
  );
};

const clearCell = (board: number[][], gridX: number, gridY: number) => {
  if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) return board;
  const boardY = toBoardY(gridY);
  if (board[boardY]?.[gridX] === 0) return board;
  const next = cloneBoard(board);
  next[boardY][gridX] = 0;
  return next;
};

const carveSpawn = (board: number[][], gridX: number, gridY: number) => {
  let next = board;
  const offsets = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
  ];
  offsets.forEach(([dx, dy]) => {
    next = clearCell(next, gridX + dx, gridY + dy);
  });
  return next;
};

const pickExit = (board: number[][]) => {
  const gridY = VISIBLE_ROWS - 1;
  const candidates: number[] = [];
  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    candidates.push(x);
  }
  const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
  return { x: chosen, y: gridY };
};

const isEmptyCell = (board: number[][], gridX: number, gridY: number) => {
  if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) return false;
  const boardY = toBoardY(gridY);
  return board[boardY]?.[gridX] === 0;
};

const listEmptyCells = (board: number[][], excluded: Set<number>) => {
  const cells: Array<{ x: number; y: number }> = [];
  for (let gridY = 0; gridY < VISIBLE_ROWS; gridY += 1) {
    for (let gridX = 0; gridX < BOARD_WIDTH; gridX += 1) {
      const key = gridY * BOARD_WIDTH + gridX;
      if (excluded.has(key)) continue;
      if (isEmptyCell(board, gridX, gridY)) {
        cells.push({ x: gridX, y: gridY });
      }
    }
  }
  return cells;
};

const takeRandomCell = (cells: Array<{ x: number; y: number }>) => {
  if (cells.length === 0) return null;
  const index = Math.floor(Math.random() * cells.length);
  return cells.splice(index, 1)[0] ?? null;
};

const spawnEnemies = (
  cells: Array<{ x: number; y: number }>,
  startId: number,
  playerX: number,
  playerY: number
) => {
  const enemies: DoomEnemy[] = [];
  let nextId = startId;
  const desired = Math.min(6, Math.max(2, Math.floor(cells.length / 35)));
  for (let i = 0; i < desired; i += 1) {
    let cell = takeRandomCell(cells);
    while (cell && Math.hypot(cell.x + 0.5 - playerX, cell.y + 0.5 - playerY) < 2.4) {
      cell = takeRandomCell(cells);
    }
    if (!cell) break;
    enemies.push({
      id: nextId,
      x: cell.x + 0.5,
      y: cell.y + 0.5,
      health: 2,
      speed: DOOM_ENEMY_SPEED * (0.8 + Math.random() * 0.6)
    });
    nextId += 1;
  }
  return { enemies, nextId };
};

const spawnItems = (cells: Array<{ x: number; y: number }>, startId: number) => {
  const items: DoomItem[] = [];
  let nextId = startId;
  const desired = Math.min(8, Math.max(3, Math.floor(cells.length / 30)));
  const itemTypes: DoomItemType[] = ["health", "armor", "ammo"];
  for (let i = 0; i < desired; i += 1) {
    const cell = takeRandomCell(cells);
    if (!cell) break;
    const type = itemTypes[i % itemTypes.length];
    items.push({
      id: nextId,
      x: cell.x + 0.5,
      y: cell.y + 0.5,
      type
    });
    nextId += 1;
  }
  return { items, nextId };
};

export const createEmptyDoomState = (): DoomState => ({
  player: { x: BOARD_WIDTH / 2, y: 0.5, angle: Math.PI / 2 },
  input: { ...EMPTY_INPUT },
  timeLeft: 0,
  exit: { x: Math.floor(BOARD_WIDTH / 2), y: VISIBLE_ROWS - 1 },
  shotCooldown: 0,
  health: DOOM_HEALTH_START,
  armor: DOOM_ARMOR_START,
  ammo: DOOM_AMMO_START,
  enemies: [],
  items: [],
  nextEntityId: 1,
  damageCooldown: 0
});

export const createDoomState = (board: number[][]) => {
  const spawnCell = { x: Math.max(0, Math.floor(BOARD_WIDTH / 2) - 1), y: 0 };
  let nextBoard = carveSpawn(board, spawnCell.x, spawnCell.y);
  const exit = pickExit(nextBoard);
  nextBoard = clearCell(nextBoard, exit.x, exit.y);
  const excluded = new Set<number>();
  for (let dy = 0; dy <= 1; dy += 1) {
    for (let dx = 0; dx <= 1; dx += 1) {
      excluded.add((spawnCell.y + dy) * BOARD_WIDTH + (spawnCell.x + dx));
    }
  }
  excluded.add(exit.y * BOARD_WIDTH + exit.x);
  const emptyCells = listEmptyCells(nextBoard, excluded);
  const playerX = spawnCell.x + 0.5;
  const playerY = spawnCell.y + 0.5;
  const enemiesResult = spawnEnemies(emptyCells, 1, playerX, playerY);
  const itemsResult = spawnItems(emptyCells, enemiesResult.nextId);
  const doom: DoomState = {
    player: { x: playerX, y: playerY, angle: Math.PI / 2 },
    input: { ...EMPTY_INPUT },
    timeLeft: DOOM_DURATION,
    exit,
    shotCooldown: 0,
    health: DOOM_HEALTH_START,
    armor: DOOM_ARMOR_START,
    ammo: DOOM_AMMO_START,
    enemies: enemiesResult.enemies,
    items: itemsResult.items,
    nextEntityId: itemsResult.nextId,
    damageCooldown: 0
  };
  return { board: nextBoard, doom };
};

export const setDoomInput = (state: GameState, input: Partial<DoomInput>): GameState => {
  if (state.mode !== "doom") return state;
  return {
    ...state,
    doom: {
      ...state.doom,
      input: { ...state.doom.input, ...input }
    }
  };
};

export const turnDoom = (state: GameState, delta: number): GameState => {
  if (state.mode !== "doom") return state;
  return {
    ...state,
    doom: {
      ...state.doom,
      player: {
        ...state.doom.player,
        angle: clampAngle(state.doom.player.angle + delta)
      }
    }
  };
};

export const doomShoot = (state: GameState): GameState => {
  if (state.mode !== "doom") return state;
  if (state.doom.shotCooldown > 0) return state;
  if (state.doom.ammo <= 0) {
    return {
      ...state,
      doom: { ...state.doom, shotCooldown: DOOM_SHOT_COOLDOWN }
    };
  }
  const { x, y, angle } = state.doom.player;
  const step = 0.08;
  const maxRange = VISIBLE_ROWS + 2;
  let distance = 0;
  let hitCell: { x: number; y: number } | null = null;
  let hitEnemyIndex = -1;
  while (distance < maxRange) {
    const sampleX = x + Math.cos(angle) * distance;
    const sampleY = y + Math.sin(angle) * distance;
    const gridX = Math.floor(sampleX);
    const gridY = Math.floor(sampleY);
    if (gridX < 0 || gridX >= BOARD_WIDTH || gridY < 0 || gridY >= VISIBLE_ROWS) {
      break;
    }
    for (let i = 0; i < state.doom.enemies.length; i += 1) {
      const enemy = state.doom.enemies[i];
      if (Math.hypot(sampleX - enemy.x, sampleY - enemy.y) <= DOOM_ENEMY_RADIUS) {
        hitEnemyIndex = i;
        break;
      }
    }
    if (hitEnemyIndex >= 0) {
      break;
    }
    if (isWallAt(state.board, sampleX, sampleY)) {
      hitCell = { x: gridX, y: gridY };
      break;
    }
    distance += step;
  }
  if (hitEnemyIndex >= 0) {
    const enemies = [...state.doom.enemies];
    const target = enemies[hitEnemyIndex];
    const nextHealth = target.health - 1;
    let score = state.score;
    if (nextHealth <= 0) {
      enemies.splice(hitEnemyIndex, 1);
      score += 15;
    } else {
      enemies[hitEnemyIndex] = { ...target, health: nextHealth };
      score += 5;
    }
    return {
      ...state,
      score,
      doom: {
        ...state.doom,
        enemies,
        ammo: Math.max(0, state.doom.ammo - 1),
        shotCooldown: DOOM_SHOT_COOLDOWN
      }
    };
  }
  if (!hitCell) {
    return {
      ...state,
      doom: {
        ...state.doom,
        ammo: Math.max(0, state.doom.ammo - 1),
        shotCooldown: DOOM_SHOT_COOLDOWN
      }
    };
  }
  const nextBoard = clearCell(state.board, hitCell.x, hitCell.y);
  return {
    ...state,
    board: nextBoard,
    doom: {
      ...state.doom,
      ammo: Math.max(0, state.doom.ammo - 1),
      shotCooldown: DOOM_SHOT_COOLDOWN
    }
  };
};

export const tickDoom = (state: GameState, deltaMs: number): GameState => {
  if (state.mode !== "doom") return state;
  const doom = state.doom;
  const nextTime = Math.max(0, doom.timeLeft - deltaMs);
  const cooldown = Math.max(0, doom.shotCooldown - deltaMs);
  let damageCooldown = Math.max(0, doom.damageCooldown - deltaMs);
  let health = doom.health;
  let armor = doom.armor;
  let ammo = doom.ammo;
  const forward = { x: Math.cos(doom.player.angle), y: Math.sin(doom.player.angle) };
  const right = { x: -Math.sin(doom.player.angle), y: Math.cos(doom.player.angle) };
  let moveX = 0;
  let moveY = 0;
  if (doom.input.forward) {
    moveX += forward.x;
    moveY += forward.y;
  }
  if (doom.input.back) {
    moveX -= forward.x;
    moveY -= forward.y;
  }
  if (doom.input.left) {
    moveX -= right.x;
    moveY -= right.y;
  }
  if (doom.input.right) {
    moveX += right.x;
    moveY += right.y;
  }
  const length = Math.hypot(moveX, moveY);
  let nextX = doom.player.x;
  let nextY = doom.player.y;
  if (length > 0) {
    const scale = (DOOM_PLAYER_SPEED * deltaMs) / length;
    const stepX = moveX * scale;
    const stepY = moveY * scale;
    const radius = 0.18;
    if (canMoveTo(state.board, nextX + stepX, nextY, radius)) {
      nextX += stepX;
    }
    if (canMoveTo(state.board, nextX, nextY + stepY, radius)) {
      nextY += stepY;
    }
  }

  const nextEnemies: DoomEnemy[] = [];
  doom.enemies.forEach((enemy) => {
    let ex = enemy.x;
    let ey = enemy.y;
    const dx = nextX - ex;
    const dy = nextY - ey;
    const dist = Math.hypot(dx, dy);
    if (dist > 0.05) {
      const step = enemy.speed * deltaMs;
      const stepX = (dx / dist) * step;
      const stepY = (dy / dist) * step;
      const radius = DOOM_ENEMY_RADIUS * 0.8;
      if (canMoveTo(state.board, ex + stepX, ey, radius)) {
        ex += stepX;
      }
      if (canMoveTo(state.board, ex, ey + stepY, radius)) {
        ey += stepY;
      }
    }
    if (dist < DOOM_ENEMY_RADIUS + 0.28 && damageCooldown <= 0) {
      let damage = DOOM_ENEMY_DAMAGE;
      if (armor > 0) {
        const absorbed = Math.min(armor, Math.max(1, Math.round(damage * 0.6)));
        armor -= absorbed;
        damage -= absorbed;
      }
      health = Math.max(0, health - damage);
      damageCooldown = DOOM_ENEMY_COOLDOWN;
    }
    nextEnemies.push({ ...enemy, x: ex, y: ey });
  });

  const nextItems: DoomItem[] = [];
  doom.items.forEach((item) => {
    const distance = Math.hypot(nextX - item.x, nextY - item.y);
    if (distance <= DOOM_PICKUP_RADIUS) {
      if (item.type === "health") {
        health = Math.min(DOOM_HEALTH_MAX, health + DOOM_HEALTH_PICKUP);
      } else if (item.type === "armor") {
        armor = Math.min(DOOM_ARMOR_MAX, armor + DOOM_ARMOR_PICKUP);
      } else if (item.type === "ammo") {
        ammo = Math.min(DOOM_AMMO_MAX, ammo + DOOM_AMMO_PICKUP);
      }
      return;
    }
    nextItems.push(item);
  });

  const exitCenter = { x: doom.exit.x + 0.5, y: doom.exit.y + 0.5 };
  const exitDistance = Math.hypot(nextX - exitCenter.x, nextY - exitCenter.y);
  if (exitDistance <= DOOM_EXIT_RADIUS) {
    return {
      ...state,
      mode: "tetris",
      score: state.score + DOOM_EXIT_BONUS,
      fallAccumulator: 0,
      lockTimer: 0,
      doom: {
        ...doom,
        timeLeft: 0,
        shotCooldown: cooldown,
        health,
        armor,
        ammo,
        enemies: nextEnemies,
        items: nextItems,
        damageCooldown
      }
    };
  }

  if (nextTime === 0 || health <= 0) {
    return {
      ...state,
      mode: "tetris",
      fallAccumulator: 0,
      lockTimer: 0,
      doom: {
        ...doom,
        timeLeft: 0,
        shotCooldown: cooldown,
        health,
        armor,
        ammo,
        enemies: nextEnemies,
        items: nextItems,
        damageCooldown
      }
    };
  }

  return {
    ...state,
    doom: {
      ...doom,
      timeLeft: nextTime,
      shotCooldown: cooldown,
      player: { ...doom.player, x: nextX, y: nextY },
      health,
      armor,
      ammo,
      enemies: nextEnemies,
      items: nextItems,
      damageCooldown
    }
  };
};
