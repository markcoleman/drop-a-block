import type { TetrominoType } from "../engine/types";
import type { PaletteMap } from "../ui/palettes";
import { MiniGrid } from "./MiniGrid";

type QueuePanelProps = {
  holdEnabled: boolean;
  holdPiece: TetrominoType | null;
  nextQueue: TetrominoType[];
  palette: PaletteMap;
};

export const QueuePanel = ({ holdEnabled, holdPiece, nextQueue, palette }: QueuePanelProps) => {
  return (
    <>
      {holdEnabled ? (
        <div className="panel">
          <h2>Hold</h2>
          <MiniGrid type={holdPiece} label="Hold piece" palette={palette} />
        </div>
      ) : (
        <div className="panel panel-muted">
          <h2>Hold</h2>
          <p className="muted">Disabled in settings.</p>
        </div>
      )}
      <div className="panel">
        <h2>Next</h2>
        <div className="next-queue">
          {nextQueue.map((type, index) => (
            <MiniGrid
              key={`${type}-${index}`}
              type={type}
              label={`Next piece ${index + 1}`}
              palette={palette}
            />
          ))}
        </div>
      </div>
    </>
  );
};
