import type { ReactNode } from "react";

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
  return (
    <div className="overlay">
      <div className="game-over-panel">
        <div>
          <p className="eyebrow">Run Summary</p>
          <h2>{result === "win" ? "Mode Complete" : "Game Over"}</h2>
          <p className="muted">
            {result === "win"
              ? `${modeLabel} wrapped with ${score.toLocaleString()} points.`
              : `Final score ${score.toLocaleString()}.`}
          </p>
        </div>
        <div className="summary-grid">
          <SummaryCard label="Score" value={score.toLocaleString()} />
          <SummaryCard label="Lines" value={lines} />
          <SummaryCard label="Level" value={level} />
          <SummaryCard label="Mode" value={modeLabel} />
        </div>
        <div className="summary-actions">
          <button type="button" className="primary" onClick={onRestart}>
            Play Again
          </button>
          <button type="button" className="ghost" onClick={onBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
