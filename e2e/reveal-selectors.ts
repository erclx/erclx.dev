/**
 * What `reveal-inventory.ts` traces, held apart from it so a guard can read the
 * list without running the instrument.
 *
 * That module executes at import: it resolves a dev-server port and walks every
 * route at module scope, with no `import.meta.main` gate. A spec importing the
 * list directly therefore started an inventory run inside the suite and failed
 * on a connection to a server the suite does not raise.
 *
 * The list is what a guard needs, so the list is what moves. Anything else
 * importing that module still runs it.
 */
export const WATCHED_SELECTORS = [
  'h1',
  'h2',
  'p',
  'img',
  '[data-fade]',
  '[data-bar-mark]',
  '[data-theme-toggle]',
  // Read as `[data-section-nav] li` until 2026-08-24, and the rail renders `a`.
  // That clause matched nothing on every run since it was written and reported
  // nothing wrong, which is the same output as a rail arriving correctly.
  '[data-section-nav] a',
  '[data-way-home]',
] as const
