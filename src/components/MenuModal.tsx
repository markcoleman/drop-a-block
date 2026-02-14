import clsx from "clsx";
import type { GameModifiers, PlayMode } from "../engine/types";
import {
  ARKANOID_TRIGGER_LINES,
  BOARD_HEIGHT,
  BOARD_WIDTH,
  DOOM_DURATION,
  DOOM_TRIGGER_LINES,
  SPRINT_TARGET_LINES,
  ULTRA_DURATION,
  VISIBLE_ROWS
} from "../engine/engine";
import { MODE_OPTIONS, MODE_UNLOCKS, SECRET_MODES } from "../game/modes";
import type { Settings, HighScore } from "../utils/storage";
import type { MenuView } from "../ui/types";
import type { PaletteMap } from "../ui/palettes";
import { HighScores } from "./HighScores";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./Icons";
import { Modal } from "./Modal";
import { SettingsPanel } from "./SettingsPanel";

type MenuModalProps = {
  view: Exclude<MenuView, "none">;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  scores: HighScore[];
  palette: PaletteMap;
  unlockedModes: Set<PlayMode>;
  totalPlays: number;
  activeModifiers: GameModifiers;
  onToggleSecretMode: (mode: keyof GameModifiers) => void;
  onShuffleFunModes: () => void;
  onClearFunModes: () => void;
  onUnlockMode: (mode: PlayMode) => void;
  onUnlockAllModes: () => void;
  onResetModeUnlocks: () => void;
};

const HelpPanel = ({ holdEnabled }: { holdEnabled: boolean }) => {
  return (
    <div className="help-panel">
      <p className="muted">
        Tight rotations and fast drops win. Use Hold to save a rescue piece, and watch the next queue.
      </p>
      <ul className="help-list">
        <li>
          <strong>Rotate</strong> with Z / X or the on-screen rotate buttons.
        </li>
        <li>
          <strong>Move/Drop</strong> by holding the on-screen arrows for repeat.
        </li>
        <li>
          <strong>Hard drop</strong> with Space or the hard drop button.
        </li>
        {holdEnabled && (
          <li>
            <strong>Hold</strong> with C / Shift to swap the current tetromino.
          </li>
        )}
        <li>
          <strong>Arkanoid mode</strong> triggers every {ARKANOID_TRIGGER_LINES} lines for 30 seconds.
        </li>
        <li>
          <strong>Doom run</strong> triggers every {DOOM_TRIGGER_LINES} lines. You get{" "}
          {Math.round(DOOM_DURATION / 1000)} seconds to clear a path to the exit with WASD + mouse.
        </li>
        <li>
          <strong>Doom pickups</strong> restore health, armor, and ammo. Enemies can drain your health.
        </li>
        <li>
          <strong>Modes</strong> include Normal (Marathon), Sprint ({SPRINT_TARGET_LINES} lines),
          and Ultra ({Math.round(ULTRA_DURATION / 60000)} minutes).
        </li>
        <li>
          <strong>Pause</strong> anytime with P or Esc.
        </li>
      </ul>
    </div>
  );
};

const SecretPanel = ({
  unlockedModes,
  totalPlays,
  activeModifiers,
  onUnlockMode,
  onUnlockAllModes,
  onResetModeUnlocks,
  onToggleSecretMode,
  onShuffleFunModes,
  onClearFunModes
}: {
  unlockedModes: Set<PlayMode>;
  totalPlays: number;
  activeModifiers: GameModifiers;
  onUnlockMode: (mode: PlayMode) => void;
  onUnlockAllModes: () => void;
  onResetModeUnlocks: () => void;
  onToggleSecretMode: (mode: keyof GameModifiers) => void;
  onShuffleFunModes: () => void;
  onClearFunModes: () => void;
}) => {
  return (
    <div className="secret-panel">
      <p className="muted">Secret console unlocked. Changes apply to your next run.</p>
      <div className="secret-section">
        <h3>Mode Unlocks</h3>
        <div className="secret-grid">
          {MODE_OPTIONS.filter((mode) => mode.id !== "marathon").map((mode) => {
            const isUnlocked = unlockedModes.has(mode.id);
            const requirement = MODE_UNLOCKS[mode.id as Exclude<PlayMode, "marathon">];
            const progress = Math.min(totalPlays, requirement.plays);
            return (
              <button
                key={mode.id}
                type="button"
                className={clsx("secret-toggle", { active: isUnlocked })}
                onClick={() => onUnlockMode(mode.id)}
                disabled={isUnlocked}
              >
                <span className="secret-title">
                  {mode.label}
                  <span className="secret-status">
                    {isUnlocked ? "Unlocked" : `Locked - ${progress}/${requirement.plays}`}
                  </span>
                </span>
                <span className="secret-desc">{mode.desc}</span>
                {!isUnlocked && <span className="secret-meta">{requirement.label}</span>}
              </button>
            );
          })}
        </div>
        <div className="secret-actions">
          <button className="secret-action" onClick={onUnlockAllModes}>
            Unlock All Modes
          </button>
          <button className="secret-action" onClick={onResetModeUnlocks}>
            Reset Mode Unlocks
          </button>
        </div>
      </div>
      <div className="secret-section">
        <h3>Fun Modes</h3>
        <div className="secret-grid">
          {SECRET_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={clsx("secret-toggle", { active: Boolean(activeModifiers[mode.id]) })}
              aria-pressed={Boolean(activeModifiers[mode.id])}
              onClick={() => onToggleSecretMode(mode.id)}
            >
              <span className="secret-title">
                {mode.label}
                <span className="secret-status">{activeModifiers[mode.id] ? "On" : "Off"}</span>
              </span>
              <span className="secret-desc">{mode.desc}</span>
            </button>
          ))}
        </div>
        <div className="secret-actions">
          <button className="secret-action" onClick={onShuffleFunModes}>
            Remix Fun
          </button>
          <button className="secret-action" onClick={onClearFunModes}>
            Clear Fun Modes
          </button>
        </div>
      </div>
    </div>
  );
};

const AboutPanel = ({ palette }: { palette: PaletteMap }) => {
  return (
    <div className="help-panel">
      <p className="muted about-copy">
        Board size {BOARD_WIDTH}x{VISIBLE_ROWS} with {BOARD_HEIGHT - VISIBLE_ROWS} hidden spawn rows.
        Colors are mapped per tetromino.
      </p>
      <div className="legend about-legend">
        {Object.entries(palette).map(([key, value]) => (
          <span key={key} style={{ background: value }}>
            {key}
          </span>
        ))}
      </div>
    </div>
  );
};

export const MenuModal = ({
  view,
  onClose,
  settings,
  onSettingsChange,
  scores,
  palette,
  unlockedModes,
  totalPlays,
  activeModifiers,
  onToggleSecretMode,
  onShuffleFunModes,
  onClearFunModes,
  onUnlockMode,
  onUnlockAllModes,
  onResetModeUnlocks
}: MenuModalProps) => {
  const title =
    view === "settings"
      ? "Adjust Settings"
      : view === "help"
        ? "Help"
        : view === "scores"
          ? "High Scores"
          : view === "secret"
            ? "Secret Menu"
            : "About";

  return (
    <Modal size="large">
      <div className="modal-header">
        <h2>{title}</h2>
        <IconButton label="Close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      {view === "settings" ? (
        <SettingsPanel settings={settings} onChange={onSettingsChange} className="embedded" />
      ) : view === "help" ? (
        <HelpPanel holdEnabled={settings.holdEnabled} />
      ) : view === "scores" ? (
        <HighScores scores={scores} className="embedded" />
      ) : view === "secret" ? (
        <SecretPanel
          unlockedModes={unlockedModes}
          totalPlays={totalPlays}
          activeModifiers={activeModifiers}
          onUnlockMode={onUnlockMode}
          onUnlockAllModes={onUnlockAllModes}
          onResetModeUnlocks={onResetModeUnlocks}
          onToggleSecretMode={onToggleSecretMode}
          onShuffleFunModes={onShuffleFunModes}
          onClearFunModes={onClearFunModes}
        />
      ) : (
        <AboutPanel palette={palette} />
      )}
    </Modal>
  );
};
