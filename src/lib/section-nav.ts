/**
 * The share of the viewport's height a section's top has to cross before its
 * link is marked. The middle rather than 30% down: at 0.3 a 292px closing
 * section above a 317px footer could never cross the line before the page
 * ran out, measured at 1440x900, so Looking for was marked only inside the
 * 4px the end-of-page override covers. Every handover lands a little later as
 * the cost.
 */
export const ANCHOR_RATIO = 0.5
