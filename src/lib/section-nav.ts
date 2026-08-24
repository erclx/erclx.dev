/**
 * The row-activation anchor and the rail's reveal margin are one relationship
 * rather than two: the hero holds the viewport height wherever the rail is
 * visible, so a hero bottom edge at this ratio is the same moment the section
 * under it crosses the anchor. One exported value places both lines, so a
 * change here moves the component and the guard that watches it together.
 */
export const ANCHOR_RATIO = 0.3
