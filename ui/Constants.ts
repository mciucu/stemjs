export const Orientation = {
    HORIZONTAL: 1,
    VERTICAL: 2,
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
    LARGE: "lg",
    EXTRA_LARGE: "xl",
} as const;

export type SizeType = typeof Size[keyof typeof Size];

export const VoteStatus = {
    NONE: null,
    LIKE: 1,
    DISLIKE: 0,
} as const;

export type VoteStatusType = typeof VoteStatus[keyof typeof VoteStatus];

export const ActionStatus = {
    INITIAL: 1,
    RUNNING: 2,
    SUCCESS: 3,
    FAILED: 4,
} as const;

export type ActionStatusType = typeof ActionStatus[keyof typeof ActionStatus];
