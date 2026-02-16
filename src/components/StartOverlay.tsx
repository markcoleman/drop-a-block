import clsx from "clsx";
import type { ReactNode } from "react";

import { SPRINT_TARGET_LINES, ULTRA_DURATION } from "../engine/engine";
import type { PlayMode } from "../engine/types";
import { MODE_LABELS, MODE_OPTIONS, MODE_UNLOCKS } from "../game/modes";
import { useI18n } from "../i18n";
import type { CheatFeedback, StartStep } from "../ui/types";
import {
  ArrowLeftIcon,
  DownloadIcon,
  HelpIcon,
  PlayIcon,
  SettingsIcon,
  ShareIcon,
  TrophyIcon
} from "./Icons";

type StartOverlayProps = {
  startStep: StartStep;
  selectedMode: PlayMode;
  unlockedModes: Set<PlayMode>;
  totalPlays: number;
  startLevel: number;
  showCheatEntry: boolean;
  cheatInput: string;
  cheatFeedback: CheatFeedback;
  onCheatTap: () => void;
  onCheatInputChange: (value: string) => void;
  onCheatSubmit: () => void;
  onSelectMode: (mode: PlayMode) => void;
  onLaunch: () => void;
  onStartMenu: () => void;
  onBack: () => void;
  onOpenScores: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
  canInstall: boolean;
  onInstallApp: () => void;
  canShare: boolean;
  onShareApp: () => void;
};

const StartMenuButton = ({
  icon,
  title,
  desc,
  onClick,
  className,
  disabled
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      className={clsx("menu-button", className)}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="menu-icon">{icon}</span>
      <span className="menu-copy">
        <strong>{title}</strong>
        <span className="menu-desc">{desc}</span>
      </span>
    </button>
  );
};

export const StartOverlay = ({
  startStep,
  selectedMode,
  unlockedModes,
  totalPlays,
  startLevel,
  showCheatEntry,
  cheatInput,
  cheatFeedback,
  onCheatTap,
  onCheatInputChange,
  onCheatSubmit,
  onSelectMode,
  onLaunch,
  onStartMenu,
  onBack,
  onOpenScores,
  onOpenSettings,
  onOpenHelp,
  onOpenAbout,
  canInstall,
  onInstallApp,
  canShare,
  onShareApp
}: StartOverlayProps) => {
  const { t } = useI18n();

  return (
    <div className="overlay start-overlay">
      <div className="start-menu">
        <div className="start-menu-header" onClick={onCheatTap}>
          <p className="eyebrow">{t("start.startMenu")}</p>
          <h2>{startStep === "mode" ? t("start.chooseMode") : t("start.readyToDrop")}</h2>
          <p className="subtitle">
            {startStep === "mode" ? t("start.modeUnlocked") : t("start.pickGameMode")}
          </p>
        </div>
        {startStep === "mode" ? (
          <>
            <div className="mode-select">
              <p className="eyebrow">{t("start.gameMode")}</p>
              <div className="mode-options">
                {MODE_OPTIONS.map((mode) => {
                  const isUnlocked = unlockedModes.has(mode.id);
                  const requirement =
                    mode.id === "marathon"
                      ? null
                      : MODE_UNLOCKS[mode.id as Exclude<PlayMode, "marathon">];
                  const progress = requirement ? Math.min(totalPlays, requirement.plays) : 0;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      className={clsx("mode-option", {
                        active: selectedMode === mode.id,
                        locked: !isUnlocked
                      })}
                      onClick={() => isUnlocked && onSelectMode(mode.id)}
                      disabled={!isUnlocked}
                    >
                      <span className="mode-option-title">
                        {t(`mode.${mode.id}.label`, undefined, mode.label)}
                      </span>
                      <span className="mode-option-desc">
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
                      {!isUnlocked && requirement && (
                        <span className="mode-option-lock">
                          {t(
                            "start.lockedProgress",
                            { label: requirement.label, progress, plays: requirement.plays },
                            `Locked - ${requirement.label} (${progress}/${requirement.plays})`
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mode-unlock-progress muted">
              {t("start.gamesFinished", { count: totalPlays })}
            </div>
            <div className="start-menu-actions">
              <StartMenuButton
                className="primary"
                onClick={onLaunch}
                disabled={!unlockedModes.has(selectedMode)}
                icon={<PlayIcon />}
                title={t("start.launchMode", {
                  mode: t(`mode.${selectedMode}.label`, undefined, MODE_LABELS[selectedMode])
                })}
                desc={t("start.dropLevel", { level: startLevel })}
              />
              <StartMenuButton
                onClick={onBack}
                icon={<ArrowLeftIcon />}
                title={t("start.back")}
                desc={t("start.returnStart")}
              />
            </div>
          </>
        ) : (
          <div className="start-menu-actions">
            <StartMenuButton
              className="primary"
              onClick={onStartMenu}
              icon={<PlayIcon />}
              title={t("start.startGame")}
              desc={t("start.pickModeNext")}
            />
            <StartMenuButton
              onClick={onOpenScores}
              icon={<TrophyIcon />}
              title={t("start.highScores")}
              desc={t("start.rankings")}
            />
            <StartMenuButton
              onClick={onOpenSettings}
              icon={<SettingsIcon />}
              title={t("start.adjustSettings")}
              desc={t("start.soundThemeSpeed")}
            />
            <StartMenuButton
              onClick={onOpenHelp}
              icon={<HelpIcon />}
              title={t("start.help")}
              desc={t("start.proTips")}
            />
            <StartMenuButton
              onClick={onOpenAbout}
              icon={<HelpIcon />}
              title={t("start.about")}
              desc={t("start.boardRules")}
            />
            {canInstall && (
              <StartMenuButton
                onClick={onInstallApp}
                icon={<DownloadIcon />}
                title={t("start.installApp")}
                desc={t("start.installAppDesc")}
              />
            )}
            {canShare && (
              <StartMenuButton
                onClick={onShareApp}
                icon={<ShareIcon />}
                title={t("start.shareGame")}
                desc={t("start.shareGameDesc")}
              />
            )}
          </div>
        )}
        {showCheatEntry && (
          <div className="cheat-entry">
            <p className="eyebrow">{t("start.cheatCode")}</p>
            <div className="cheat-row">
              <input
                value={cheatInput}
                onChange={(event) => onCheatInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onCheatSubmit();
                }}
                placeholder={t("start.enterCode")}
                aria-label={t("start.cheatCode")}
                autoComplete="off"
              />
              <button className="primary" onClick={onCheatSubmit}>
                {t("start.enter")}
              </button>
            </div>
            {cheatFeedback === "error" && (
              <span className="cheat-feedback">{t("app.cheatNope")}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
