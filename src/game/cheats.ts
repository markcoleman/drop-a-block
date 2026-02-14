export const CHEAT_CODE = "TETRIS";
export const DOOM_CODE = "DOOM";
export const CHEAT_TAP_TARGET = 5;

export const CHEAT_BUFFER_LENGTH = Math.max(CHEAT_CODE.length, DOOM_CODE.length);

export const normalizeCheatInput = (value: string) => value.trim().toUpperCase();

export const updateCheatBuffer = (buffer: string, key: string) =>
  `${buffer}${key}`.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-CHEAT_BUFFER_LENGTH);

export const isCheatMatch = (buffer: string, code: string) => buffer.endsWith(code);
