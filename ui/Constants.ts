// The values are the style rule each one selects, which is how every sheet keyed by an orientation reads
export const Orientation = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical",
} as const;

export type OrientationType = typeof Orientation[keyof typeof Orientation];

export const Direction = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right",
} as const;

export type DirectionType = typeof Direction[keyof typeof Direction];

export const Level = {
    INFO: "info",
    PRIMARY: "primary",
    SECONDARY: "secondary",
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "error",
    ERROR: "error",
} as const;

export type LevelType = typeof Level[keyof typeof Level];

export const Size = {
    NONE: null,
    EXTRA_SMALL: "xs",
    SMALL: "sm",
    MEDIUM: "md",
    LARGE: "lg",
    EXTRA_LARGE: "xl",
} as const;

// NONE is null, which `as const` cannot give a literal type to with strictNullChecks off, so it is
// excluded from the derivation and added back
export type SizeType = typeof Size[Exclude<keyof typeof Size, "NONE">] | null;

export const VoteStatus = {
    NONE: null,
    LIKE: 1,
    DISLIKE: 0,
} as const;

export type VoteStatusType = typeof VoteStatus[Exclude<keyof typeof VoteStatus, "NONE">] | null;

export const ActionStatus = {
    INITIAL: 1,
    RUNNING: 2,
    SUCCESS: 3,
    FAILED: 4,
} as const;

export type ActionStatusType = typeof ActionStatus[keyof typeof ActionStatus];
