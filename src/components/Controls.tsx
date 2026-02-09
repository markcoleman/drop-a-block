import { ReactNode } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HardDropIcon,
  HoldIcon,
  PauseIcon,
  RotateCcwIcon,
  RotateCwIcon
} from "./Icons";

type ControlButtonProps = {
  label: string;
  onPress: () => void;
  text: string;
  children: ReactNode;
};

const ControlButton = ({ label, onPress, text, children }: ControlButtonProps) => (
  <button className="control-button" onClick={onPress} aria-label={label}>
    <span className="control-icon">{children}</span>
    <span className="control-text">{text}</span>
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
        <ControlButton label="Move left" text="Left" onPress={onLeft}>
          <ArrowLeftIcon />
        </ControlButton>
        <ControlButton label="Move right" text="Right" onPress={onRight}>
          <ArrowRightIcon />
        </ControlButton>
        <ControlButton label="Soft drop" text="Down" onPress={onDown}>
          <ArrowDownIcon />
        </ControlButton>
      </div>
      <div className="controls-row">
        <ControlButton label="Rotate counter-clockwise" text="Rotate L" onPress={onRotateCcw}>
          <RotateCcwIcon />
        </ControlButton>
        <ControlButton label="Rotate clockwise" text="Rotate R" onPress={onRotateCw}>
          <RotateCwIcon />
        </ControlButton>
        <ControlButton label="Hard drop" text="Hard Drop" onPress={onHardDrop}>
          <HardDropIcon />
        </ControlButton>
      </div>
      <div className="controls-row">
        <ControlButton label="Hold piece" text="Hold" onPress={onHold}>
          <HoldIcon />
        </ControlButton>
        <ControlButton label="Pause" text="Pause" onPress={onPause}>
          <PauseIcon />
        </ControlButton>
      </div>
    </div>
  );
};
