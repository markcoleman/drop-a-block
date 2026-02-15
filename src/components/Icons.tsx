type IconProps = {
  className?: string;
};

const iconBase = (className?: string) =>
  ({
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false"
  }) as const;

export const PlayIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)} fill="currentColor" stroke="none">
    <path d="M8 5l11 7-11 7V5z" />
  </svg>
);

export const SettingsIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M4 7h10" />
    <circle cx="16.5" cy="7" r="2.5" />
    <path d="M4 17h6" />
    <circle cx="13.5" cy="17" r="2.5" />
  </svg>
);

export const HelpIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 4.2 1.9c-.7.7-1.2 1-1.2 2.1" />
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M6 6l12 12" />
    <path d="M18 6l-12 12" />
  </svg>
);

export const TrophyIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M7 6h10v4a5 5 0 1 1-10 0V6z" />
    <path d="M5 8H3a4 4 0 0 0 4 4" />
    <path d="M19 8h2a4 4 0 0 1-4 4" />
    <path d="M10 17h4" />
    <path d="M9 20h6" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const ArrowRightIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const ArrowDownIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M6 10l6 6 6-6" />
  </svg>
);

export const RotateCwIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M7 8a6 6 0 1 1 1.6 8.6" />
    <path d="M7 8V4m0 4H3" />
  </svg>
);

export const RotateCcwIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M17 8a6 6 0 1 0-1.6 8.6" />
    <path d="M17 8V4m0 4h4" />
  </svg>
);

export const HardDropIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M12 4v10" />
    <path d="M8 10l4 4 4-4" />
    <path d="M5 20h14" />
  </svg>
);

export const HoldIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <rect x="6.5" y="7" width="11" height="11" rx="2" />
    <path d="M12 10v5" />
    <path d="M9.5 12.5l2.5 2.5 2.5-2.5" />
  </svg>
);

export const PauseIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)} fill="currentColor" stroke="none">
    <rect x="7" y="5" width="4" height="14" rx="1.2" />
    <rect x="13" y="5" width="4" height="14" rx="1.2" />
  </svg>
);

export const EyeIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M2.5 12s3.6-6 9.5-6 9.5 6 9.5 6-3.6 6-9.5 6-9.5-6-9.5-6z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const EyeOffIcon = ({ className }: IconProps) => (
  <svg {...iconBase(className)}>
    <path d="M2.5 12s3.6-6 9.5-6c2.4 0 4.4 1 6 2.3" />
    <path d="M21.5 12s-3.6 6-9.5 6c-2.4 0-4.4-1-6-2.3" />
    <path d="M4 4l16 16" />
  </svg>
);
