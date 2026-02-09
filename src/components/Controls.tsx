import { ReactNode } from "react";

type ControlButtonProps = {
  label: string;
  onPress: () => void;
  children: ReactNode;
};

const ControlButton = ({ label, onPress, children }: ControlButtonProps) => (
  <button className="control-button" onClick={onPress} aria-label={label}>
    {children}
  </button>
);

export const Controls = ({
  onLeft,
  onRight,
  onDown,
  onRotateCw,
  onRotateCcw,
  onHardDrop,
  onHold,
  onPause
}: {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotateCw: () => void;
  onRotateCcw: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onPause: () => void;
}) => {
  return (
    <div className="controls" aria-label="Touch controls">
      <div className="controls-row">
        <ControlButton label="Move left" onPress={onLeft}>
          ◀
        </ControlButton>
        <ControlButton label="Move right" onPress={onRight}>
          ▶
        </ControlButton>
        <ControlButton label="Soft drop" onPress={onDown}>
          ▼
        </ControlButton>
      </div>
      <div className="controls-row">
        <ControlButton label="Rotate counter-clockwise" onPress={onRotateCcw}>
          ↺
        </ControlButton>
        <ControlButton label="Rotate clockwise" onPress={onRotateCw}>
          ↻
        </ControlButton>
        <ControlButton label="Hard drop" onPress={onHardDrop}>
          ⤓
        </ControlButton>
      </div>
      <div className="controls-row">
        <ControlButton label="Hold piece" onPress={onHold}>
          Hold
        </ControlButton>
        <ControlButton label="Pause" onPress={onPause}>
          Pause
        </ControlButton>
      </div>
    </div>
  );
};
