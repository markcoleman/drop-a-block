import { HighScore } from "../utils/storage";

type Props = {
  scores: HighScore[];
  className?: string;
};

export const HighScores = ({ scores, className }: Props) => {
  const panelClass = ["panel", "high-scores", className].filter(Boolean).join(" ");
  return (
    <section className={panelClass} aria-label="High scores">
      <h2>High Scores</h2>
      <ol className="scores-list">
        {scores.length === 0 && <li>No scores yet.</li>}
        {scores.map((score) => (
          <li key={`${score.name}-${score.date}`}>
            <div>
              <strong>{score.name}</strong>
              <span className="muted">L{score.level}</span>
            </div>
            <span>{score.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
