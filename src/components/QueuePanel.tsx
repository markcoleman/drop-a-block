import type { TetrominoType } from "../engine/types";
import { useI18n } from "../i18n";
import type { PaletteMap } from "../ui/palettes";
import { MiniGrid } from "./MiniGrid";

type QueuePanelProps = {
  holdEnabled: boolean;
  holdPiece: TetrominoType | null;
  nextQueue: TetrominoType[];
  palette: PaletteMap;
};

export const QueuePanel = ({ holdEnabled, holdPiece, nextQueue, palette }: QueuePanelProps) => {
  const { t } = useI18n();

  return (
    <>
      {holdEnabled ? (
        <div className="panel hold-panel">
          <h2>{t("queue.hold")}</h2>
          <MiniGrid type={holdPiece} label={t("queue.holdPiece")} palette={palette} />
        </div>
      ) : (
        <div className="panel panel-muted hold-panel">
          <h2>{t("queue.hold")}</h2>
          <p className="muted">{t("queue.disabled")}</p>
        </div>
      )}
      <div className="panel next-panel">
        <h2>{t("queue.next")}</h2>
        <div className="next-queue">
          {nextQueue.map((type, index) => (
            <MiniGrid
              key={`${type}-${index}`}
              type={type}
              label={t("queue.nextPiece", { index: index + 1 })}
              palette={palette}
            />
          ))}
        </div>
      </div>
    </>
  );
};
