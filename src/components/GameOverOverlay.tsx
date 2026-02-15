import type { ReactNode } from "react";

import { useI18n } from "../i18n";

type GameOverOverlayProps = {
  result: "win" | "lose" | null;
  modeLabel: string;
  score: number;
  lines: number;
  level: number;
  onRestart: () => void;
  onBackToMenu: () => void;
};

const SummaryCard = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="summary-card">
    <span className="label">{label}</span>
    <strong>{value}</strong>
  </div>
);

export const GameOverOverlay = ({
  result,
  modeLabel,
  score,
  lines,
  level,
  onRestart,
  onBackToMenu
}: GameOverOverlayProps) => {
  const { t } = useI18n();

  return (
    <div className="overlay">
      <div className="game-over-panel">
        <div>
          <p className="eyebrow">{t("gameover.runSummary")}</p>
          <h2>{result === "win" ? t("gameover.modeComplete") : t("gameover.gameOver")}</h2>
          <p className="muted">
            {result === "win"
              ? t(
                  "gameover.winSummary",
                  { mode: modeLabel, score: score.toLocaleString() },
                  `${modeLabel} wrapped with ${score.toLocaleString()} points.`
                )
              : t(
                  "gameover.loseSummary",
                  { score: score.toLocaleString() },
                  `Final score ${score.toLocaleString()}.`
                )}
          </p>
        </div>
        <div className="summary-grid">
          <SummaryCard label={t("gameover.score")} value={score.toLocaleString()} />
          <SummaryCard label={t("gameover.lines")} value={lines} />
          <SummaryCard label={t("gameover.level")} value={level} />
          <SummaryCard label={t("gameover.mode")} value={modeLabel} />
        </div>
        <div className="summary-actions">
          <button type="button" className="primary" onClick={onRestart}>
            {t("gameover.playAgain")}
          </button>
          <button type="button" className="ghost" onClick={onBackToMenu}>
            {t("gameover.backToMenu")}
          </button>
        </div>
      </div>
    </div>
  );
};
