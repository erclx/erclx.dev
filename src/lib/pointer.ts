/**
 * Whether the reader has a pointer that can rest on something without pressing
 * it, which is what every hover-driven response on this site depends on.
 *
 * The site answers a pointer two ways and only one of them is gated here. A
 * response keyed to a pointer being over something, whether through `:hover` or
 * through `pointerenter`, `pointerleave`, or `pointermove`, is meaningless
 * where no such pointer exists: a finger dragging down the page crosses every
 * card, row, and beat on the way, and answering each one turns a scroll into a
 * light show nobody asked for. A response keyed to a deliberate act, a click, a
 * focus, or an activation, is never gated, because touch performs those exactly
 * as a mouse does and gating them would take the page away from the reader
 * rather than give it back.
 *
 * The stylesheet gates the same way with the same query. Any component adding a
 * hover response answers to this rather than deciding for itself, which is what
 * keeps the site to one answer as components are added.
 */

// Excluding a coarse pointer rather than requiring hover, because Playwright's
// Firefox answers `(hover: hover)` and `(pointer: fine)` both false on a
// desktop that hovers perfectly well and would take the touch branch. A coarse
// pointer is the one capability only a real touch device reports.
//
// This is true of a device reporting `pointer: none` as well, so a television
// or a kiosk is treated as hover-capable and binds a response that cannot fire.
// That is accepted rather than missed. Measured across all three engines,
// Playwright's Firefox answers `(pointer: none)` and `(hover: none)` both true,
// so it is indistinguishable from that device on every pointer and hover query,
// and no pairing separates the two.
export const HOVER_CAPABLE_QUERY = 'not all and (pointer: coarse)'

/**
 * False on a real touch device, and true everywhere else including a headless
 * engine that misreports its own hover support.
 */
export function hasHoverPointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(HOVER_CAPABLE_QUERY).matches
}
