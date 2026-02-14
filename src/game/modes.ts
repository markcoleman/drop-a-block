import type { GameModifiers, PlayMode } from "../engine/types";
import { SPRINT_TARGET_LINES, ULTRA_DURATION } from "../engine/engine";

export type ModeOption = {
  id: PlayMode;
  label: string;
  desc: string;
};

export type ModeUnlockRequirement = {
  plays: number;
  label: string;
};

export type ModeUnlockMap = Record<Exclude<PlayMode, "marathon">, ModeUnlockRequirement>;

export type SecretModeOption = {
  id: keyof GameModifiers;
  label: string;
  desc: string;
};

export const MODE_LABELS: Record<PlayMode, string> = {
  marathon: "Normal",
  sprint: "Sprint",
  ultra: "Ultra"
};

export const MODE_OPTIONS: ModeOption[] = [
  {
    id: "marathon",
    label: "Normal",
    desc: "Classic endless climb with speed bumps every 10 lines."
  },
  {
    id: "sprint",
    label: "Sprint",
    desc: `Clear ${SPRINT_TARGET_LINES} lines as fast as you can.`
  },
  {
    id: "ultra",
    label: "Ultra",
    desc: `Score attack for ${Math.round(ULTRA_DURATION / 60000)} minutes.`
  }
];

export const MODE_UNLOCKS: ModeUnlockMap = {
  sprint: { plays: 1, label: "Finish 1 game" },
  ultra: { plays: 3, label: "Finish 3 games" }
};

export const MODE_ORDER: PlayMode[] = ["marathon", "sprint", "ultra"];

export const SECRET_MODES: SecretModeOption[] = [
  { id: "turbo", label: "Turbo Gravity", desc: "Pieces fall 40% faster." },
  { id: "floaty", label: "Floaty Gravity", desc: "Pieces fall slower with extra lock time." },
  { id: "freeHold", label: "Free Hold", desc: "Hold swaps stay available." },
  { id: "mirror", label: "Mirror Controls", desc: "Left/right controls are swapped." },
  { id: "noGhost", label: "No Ghost", desc: "Hide the landing preview." },
  { id: "arcadeRush", label: "Arcade Rush", desc: "Arkanoid/Doom trigger sooner." },
  { id: "party", label: "Party Filter", desc: "Pulse the board with a color remix." }
];

export const getUnlockedModes = (
  totalPlays: number,
  storedModes: PlayMode[] | undefined
) => {
  const unlocked = new Set<PlayMode>(storedModes ?? []);
  unlocked.add("marathon");
  if (totalPlays >= MODE_UNLOCKS.sprint.plays) unlocked.add("sprint");
  if (totalPlays >= MODE_UNLOCKS.ultra.plays) unlocked.add("ultra");
  return unlocked;
};

export const orderModes = (modes: Iterable<PlayMode>) => {
  const modeSet = new Set(modes);
  return MODE_ORDER.filter((mode) => modeSet.has(mode));
};
