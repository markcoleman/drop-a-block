import clsx from "clsx";
import { useEffect, useState } from "react";

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
import type { GameModifiers, PlayMode } from "../engine/types";
import { MODE_OPTIONS, MODE_UNLOCKS, SECRET_MODES } from "../game/modes";
import { useI18n } from "../i18n";
import type { PaletteMap } from "../ui/palettes";
import type { MenuView } from "../ui/types";
import type { HighScore, Settings } from "../utils/storage";
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
  const { t } = useI18n();
  return (
    <div className="help-panel">
      <p className="muted">{t("menu.helpIntro")}</p>
      <ul className="help-list">
        <li>
          <strong>{t("menu.rotate")}</strong> {t("menu.rotateDesc")}
        </li>
        <li>
          <strong>{t("menu.touch")}</strong> {t("menu.touchDesc")}
        </li>
        <li>
          <strong>{t("menu.hardDrop")}</strong> {t("menu.hardDropDesc")}
        </li>
        {holdEnabled && (
          <li>
            <strong>{t("menu.hold")}</strong> {t("menu.holdDesc")}
          </li>
        )}
        <li>
          <strong>{t("menu.arkanoid")}</strong>{" "}
          {t("menu.arkanoidDesc", { lines: ARKANOID_TRIGGER_LINES })}
        </li>
        <li>
          <strong>{t("menu.doomRun")}</strong>{" "}
          {t("menu.doomRunDesc", {
            lines: DOOM_TRIGGER_LINES,
            seconds: Math.round(DOOM_DURATION / 1000)
          })}
        </li>
        <li>
          <strong>{t("menu.doomPickups")}</strong> {t("menu.doomPickupsDesc")}
        </li>
        <li>
          <strong>{t("menu.modes")}</strong>{" "}
          {t("menu.modesDesc", {
            sprint: SPRINT_TARGET_LINES,
            minutes: Math.round(ULTRA_DURATION / 60000)
          })}
        </li>
        <li>
          <strong>{t("menu.pause")}</strong> {t("menu.pauseDesc")}
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
  const { t } = useI18n();

  return (
    <div className="secret-panel">
      <p className="muted">{t("menu.secretUnlocked")}</p>
      <div className="secret-section">
        <h3>{t("menu.modeUnlocks")}</h3>
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
                  {t(`mode.${mode.id}.label`, undefined, mode.label)}
                  <span className="secret-status">
                    {isUnlocked
                      ? t("menu.unlocked")
                      : t(
                          "menu.locked",
                          { progress, plays: requirement.plays },
                          `Locked - ${progress}/${requirement.plays}`
                        )}
                  </span>
                </span>
                <span className="secret-desc">
                  {mode.id === "sprint"
                    ? t("mode.sprint.desc", { lines: SPRINT_TARGET_LINES }, mode.desc)
                    : mode.id === "ultra"
                      ? t(
                          "mode.ultra.desc",
                          { minutes: Math.round(ULTRA_DURATION / 60000) },
                          mode.desc
                        )
                      : t(`mode.${mode.id}.desc`, undefined, mode.desc)}
                </span>
                {!isUnlocked && <span className="secret-meta">{requirement.label}</span>}
              </button>
            );
          })}
        </div>
        <div className="secret-actions">
          <button className="secret-action" onClick={onUnlockAllModes}>
            {t("menu.unlockAllModes")}
          </button>
          <button className="secret-action" onClick={onResetModeUnlocks}>
            {t("menu.resetModeUnlocks")}
          </button>
        </div>
      </div>
      <div className="secret-section">
        <h3>{t("menu.funModes")}</h3>
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
                {t(`secret.${mode.id}.label`, undefined, mode.label)}
                <span className="secret-status">
                  {activeModifiers[mode.id] ? t("menu.on") : t("menu.off")}
                </span>
              </span>
              <span className="secret-desc">
                {t(`secret.${mode.id}.desc`, undefined, mode.desc)}
              </span>
            </button>
          ))}
        </div>
        <div className="secret-actions">
          <button className="secret-action" onClick={onShuffleFunModes}>
            {t("menu.remixFun")}
          </button>
          <button className="secret-action" onClick={onClearFunModes}>
            {t("menu.clearFunModes")}
          </button>
        </div>
      </div>
    </div>
  );
};

const AboutPanel = ({ palette }: { palette: PaletteMap }) => {
  const { t } = useI18n();

  return (
    <div className="help-panel">
      <p className="muted about-copy">
        {t("menu.aboutBoard", {
          width: BOARD_WIDTH,
          visibleRows: VISIBLE_ROWS,
          hiddenRows: BOARD_HEIGHT - VISIBLE_ROWS
        })}
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
  const { t } = useI18n();
  const [draftSettings, setDraftSettings] = useState(settings);

  useEffect(() => {
    if (view === "settings") {
      setDraftSettings(settings);
    }
  }, [settings, view]);

  const handleCancelSettings = () => {
    setDraftSettings(settings);
    onClose();
  };

  const handleSaveSettings = () => {
    onSettingsChange(draftSettings);
    onClose();
  };

  const title =
    view === "settings"
      ? t("menu.adjustSettings")
      : view === "help"
        ? t("menu.help")
        : view === "scores"
          ? t("menu.highScores")
          : view === "secret"
            ? t("menu.secretMenu")
            : t("menu.about");

  const content =
    view === "settings" ? (
      <SettingsPanel settings={draftSettings} onChange={setDraftSettings} className="embedded" />
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
    );

  return (
    <Modal size="large" cardClassName="menu-modal-card">
      <div className="modal-header">
        <h2>{title}</h2>
        <IconButton
          label={t("menu.close")}
          onClick={view === "settings" ? handleCancelSettings : onClose}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className="menu-modal-body">{content}</div>
      {view === "settings" && (
        <div className="menu-modal-footer">
          <button type="button" className="ghost" onClick={handleCancelSettings}>
            {t("menu.cancel")}
          </button>
          <button type="button" className="primary" onClick={handleSaveSettings}>
            {t("menu.save")}
          </button>
        </div>
      )}
    </Modal>
  );
};
