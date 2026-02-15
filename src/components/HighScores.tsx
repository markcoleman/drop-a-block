import clsx from "clsx";

import { useI18n } from "../i18n";
import { HighScore } from "../utils/storage";

type Props = {
  scores: HighScore[];
  className?: string;
};

export const HighScores = ({ scores, className }: Props) => {
  const { t } = useI18n();

  return (
    <section
      className={clsx("panel", "high-scores", className)}
      aria-label={t("scores.highScores")}
    >
      <h2>{t("scores.highScores")}</h2>
      <ol className="scores-list">
        {scores.length === 0 && <li>{t("scores.none")}</li>}
        {scores.map((score) => (
          <li key={`${score.name}-${score.date}`}>
            <div>
              <strong>{score.name}</strong>
              <span className="muted">{t("scores.levelShort", { level: score.level })}</span>
            </div>
            <span>{score.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};
