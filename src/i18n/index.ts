import { useCallback, useMemo, useSyncExternalStore } from "react";

import { type Language } from "./config";

export { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from "./config";

type Params = Record<string, string | number>;

const interpolate = (template: string, params?: Params) => {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_full, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
};

const EN_MESSAGES: Record<string, string> = {
  "app.combo": "Combo x{count}",
  "app.bonus": "Bonus",
  "app.showHud": "Show HUD",
  "app.boardLabel": "Tetris game board",
  "app.cheatNope": "Nope. Try again.",

  "hud.linesLeft": "{count} lines left",
  "hud.remaining": "{minutes}:{seconds} remaining",
  "hud.score": "Score",
  "hud.level": "Level",
  "hud.lines": "Lines",
  "hud.doom": "Doom",
  "hud.high": "High",
  "hud.doomLines": "{count} lines",
  "hud.resume": "Resume",
  "hud.pause": "Pause",
  "hud.openSettings": "Open settings",
  "hud.hideHud": "Hide HUD",

  "stats.progress": "Progress",
  "stats.arkanoid": "Arkanoid",
  "stats.breakBlocks": "Break blocks for points.",
  "stats.doomRun": "Doom Run",
  "stats.findExit": "Find the exit. WASD + mouse, click to shoot.",
  "stats.nextLevel": "Next level",
  "stats.lines": "{count} lines",
  "stats.levelUnlock": "Level {level} unlocks at {lines} lines.",
  "stats.completed": "Completed",

  "start.startMenu": "Start Menu",
  "start.chooseMode": "Choose your mode",
  "start.readyToDrop": "Ready to drop?",
  "start.modeUnlocked": "Normal is unlocked by default. Other modes unlock after you play.",
  "start.pickGameMode": "Start a run, then pick the game mode type.",
  "start.gameMode": "Game Mode",
  "start.lockedProgress": "Locked - {label} ({progress}/{plays})",
  "start.gamesFinished": "Games finished: {count}",
  "start.launchMode": "Launch {mode}",
  "start.dropLevel": "Drop into level {level}.",
  "start.back": "Back",
  "start.returnStart": "Return to the start menu.",
  "start.startGame": "Start Game",
  "start.pickModeNext": "Pick your mode next.",
  "start.highScores": "High Scores",
  "start.rankings": "Your top runs and rankings.",
  "start.adjustSettings": "Adjust Settings",
  "start.soundThemeSpeed": "Sound, theme, and speed controls.",
  "start.help": "Help",
  "start.proTips": "Controls, tactics, and pro tips.",
  "start.about": "About",
  "start.boardRules": "Board size, colors, and rules.",
  "start.cheatCode": "Cheat Code",
  "start.enterCode": "Enter code",
  "start.enter": "Enter",

  "menu.adjustSettings": "Adjust Settings",
  "menu.help": "Help",
  "menu.highScores": "High Scores",
  "menu.secretMenu": "Secret Menu",
  "menu.about": "About",
  "menu.close": "Close",
  "menu.cancel": "Cancel",
  "menu.save": "Save",
  "menu.helpIntro":
    "Tight rotations and fast drops win. Use Hold to save a rescue piece, and watch the next queue.",
  "menu.rotate": "Rotate",
  "menu.rotateDesc": "with Z / X or the on-screen rotate buttons.",
  "menu.touch": "Touch controls",
  "menu.touchDesc":
    "let you drag left/right, swipe down to drop, and tap the board to rotate. You can toggle mobile controls in Settings.",
  "menu.hardDrop": "Hard drop",
  "menu.hardDropDesc": "with Space or the hard drop button.",
  "menu.hold": "Hold",
  "menu.holdDesc": "with C / Shift to swap the current tetromino.",
  "menu.arkanoid": "Arkanoid mode",
  "menu.arkanoidDesc": "triggers every {lines} lines for 30 seconds.",
  "menu.doomRun": "Doom run",
  "menu.doomRunDesc":
    "triggers every {lines} lines. You get {seconds} seconds to clear a path to the exit with WASD + mouse.",
  "menu.doomPickups": "Doom pickups",
  "menu.doomPickupsDesc": "restore health, armor, and ammo. Enemies can drain your health.",
  "menu.modes": "Modes",
  "menu.modesDesc":
    "include Normal (Marathon), Sprint ({sprint} lines), and Ultra ({minutes} minutes).",
  "menu.pause": "Pause",
  "menu.pauseDesc": "anytime with P or Esc.",
  "menu.secretUnlocked": "Secret console unlocked. Changes apply to your next run.",
  "menu.modeUnlocks": "Mode Unlocks",
  "menu.unlocked": "Unlocked",
  "menu.locked": "Locked - {progress}/{plays}",
  "menu.unlockAllModes": "Unlock All Modes",
  "menu.resetModeUnlocks": "Reset Mode Unlocks",
  "menu.funModes": "Fun Modes",
  "menu.on": "On",
  "menu.off": "Off",
  "menu.remixFun": "Remix Fun",
  "menu.clearFunModes": "Clear Fun Modes",
  "menu.aboutBoard":
    "Board size {width}x{visibleRows} with {hiddenRows} hidden spawn rows. Colors are mapped per tetromino.",

  "pause.paused": "Paused",
  "pause.prompt": "Press P or tap resume.",
  "pause.resume": "Resume",

  "gameover.runSummary": "Run Summary",
  "gameover.modeComplete": "Mode Complete",
  "gameover.gameOver": "Game Over",
  "gameover.winSummary": "{mode} wrapped with {score} points.",
  "gameover.loseSummary": "Final score {score}.",
  "gameover.score": "Score",
  "gameover.lines": "Lines",
  "gameover.level": "Level",
  "gameover.mode": "Mode",
  "gameover.playAgain": "Play Again",
  "gameover.backToMenu": "Back to Menu",

  "scores.highScores": "High Scores",
  "scores.none": "No scores yet.",
  "scores.levelShort": "L{level}",

  "queue.hold": "Hold",
  "queue.holdPiece": "Hold piece",
  "queue.disabled": "Disabled in settings.",
  "queue.next": "Next",
  "queue.nextPiece": "Next piece {index}",

  "controls.touchControls": "Touch controls",
  "controls.moveLeft": "Move left",
  "controls.left": "Left",
  "controls.moveRight": "Move right",
  "controls.right": "Right",
  "controls.softDrop": "Soft drop",
  "controls.down": "Down",
  "controls.rotateCcw": "Rotate counter-clockwise",
  "controls.rotateL": "Rotate L",
  "controls.rotateCw": "Rotate clockwise",
  "controls.rotateR": "Rotate R",
  "controls.hardDrop": "Hard drop",
  "controls.hardDropText": "Hard Drop",
  "controls.holdPiece": "Hold piece",
  "controls.hold": "Hold",
  "controls.pause": "Pause",

  "scoreEntry.newHighScore": "New High Score",
  "scoreEntry.enterInitials": "Enter your initials (3 letters).",
  "scoreEntry.initials": "Initials",
  "scoreEntry.saveScore": "Save Score",

  "settings.settings": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.themePresets": "Theme presets",
  "settings.customTheme": "Custom Theme",
  "settings.themeTagline": "{tagline}",
  "settings.colorblindPalette": "Colorblind palette",
  "settings.reducedMotion": "Reduced motion",
  "settings.showHud": "Show HUD",
  "settings.audioGameplay": "Audio & Gameplay",
  "settings.soundEffects": "Sound effects",
  "settings.enableHold": "Enable hold",
  "settings.mobileControls": "Mobile controls",
  "settings.language": "Language",
  "settings.customThemeEditor": "Custom theme editor",
  "settings.customThemeName": "Theme Name",
  "settings.customBaseTheme": "Base Theme",
  "settings.customColors": "Color Tokens",
  "settings.customAssets": "Asset URLs",
  "settings.customPiecePalette": "Piece Colors",
  "settings.das": "DAS (ms)",
  "settings.arr": "ARR (ms)",

  "mode.marathon.label": "Normal",
  "mode.marathon.desc": "Classic endless climb with speed bumps every 10 lines.",
  "mode.sprint.label": "Sprint",
  "mode.sprint.desc": "Clear {lines} lines as fast as you can.",
  "mode.ultra.label": "Ultra",
  "mode.ultra.desc": "Score attack for {minutes} minutes.",

  "secret.turbo.label": "Turbo Gravity",
  "secret.turbo.desc": "Pieces fall 40% faster.",
  "secret.floaty.label": "Floaty Gravity",
  "secret.floaty.desc": "Pieces fall slower with extra lock time.",
  "secret.freeHold.label": "Free Hold",
  "secret.freeHold.desc": "Hold swaps stay available.",
  "secret.mirror.label": "Mirror Controls",
  "secret.mirror.desc": "Left/right controls are swapped.",
  "secret.noGhost.label": "No Ghost",
  "secret.noGhost.desc": "Hide the landing preview.",
  "secret.arcadeRush.label": "Arcade Rush",
  "secret.arcadeRush.desc": "Arkanoid/Doom trigger sooner.",
  "secret.party.label": "Party Filter",
  "secret.party.desc": "Pulse the board with a color remix."
};

const ES_MESSAGES: Partial<Record<string, string>> = {
  "app.bonus": "Bono",
  "app.showHud": "Mostrar HUD",
  "pause.paused": "Pausa",
  "pause.resume": "Continuar",
  "scores.highScores": "Puntuaciones",
  "settings.settings": "Configuracion",
  "settings.language": "Idioma",
  "settings.theme": "Tema",
  "menu.cancel": "Cancelar",
  "menu.save": "Guardar",
  "start.startMenu": "Menu Inicio",
  "start.startGame": "Iniciar Juego",
  "start.highScores": "Puntuaciones",
  "start.adjustSettings": "Ajustes",
  "menu.help": "Ayuda",
  "menu.about": "Acerca de",
  "queue.hold": "Guardar",
  "queue.next": "Siguiente"
};

const JA_MESSAGES: Partial<Record<string, string>> = {
  "app.bonus": "ボーナス",
  "app.showHud": "HUD表示",
  "pause.paused": "一時停止",
  "pause.resume": "再開",
  "scores.highScores": "ハイスコア",
  "settings.settings": "設定",
  "settings.language": "言語",
  "settings.theme": "テーマ",
  "menu.cancel": "キャンセル",
  "menu.save": "保存",
  "start.startMenu": "スタートメニュー",
  "start.startGame": "ゲーム開始",
  "start.highScores": "ハイスコア",
  "start.adjustSettings": "設定",
  "menu.help": "ヘルプ",
  "menu.about": "情報",
  "queue.hold": "ホールド",
  "queue.next": "ネクスト"
};

const DICTIONARIES: Record<Language, Partial<Record<string, string>>> = {
  en: EN_MESSAGES,
  es: ES_MESSAGES,
  ja: JA_MESSAGES
};

const listeners = new Set<() => void>();
let currentLanguage: Language = "en";

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentLanguage;

export const setLanguage = (language: Language) => {
  if (currentLanguage === language) return;
  currentLanguage = language;
  listeners.forEach((listener) => listener());
};

export const translate = (
  key: string,
  params?: Params,
  language: Language = currentLanguage,
  fallback = key
) => {
  const localized = DICTIONARIES[language][key];
  if (localized) return interpolate(localized, params);
  const english = EN_MESSAGES[key];
  if (english) return interpolate(english, params);
  return interpolate(fallback, params);
};

export const useI18n = () => {
  const language = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const t = useCallback(
    (key: string, params?: Params, fallback?: string) => translate(key, params, language, fallback),
    [language]
  );

  return useMemo(
    () => ({
      language,
      t
    }),
    [language, t]
  );
};
