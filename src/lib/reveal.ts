/**
 * Reveals `[data-fade]` elements as they arrive, in document order.
 *
 * The landing page and the project routes share this. It lived inside the
 * projects component until 2026-08-21 while querying the whole document, so it
 * was already a page-wide primitive sitting in one section's file, and the
 * routes carried its markers with nothing to set them.
 *
 * This module owns the timing. `--fade-delay` is written here per batch and an
 * authored value on the element is overwritten the moment it is observed, so
 * writing one in the markup sets nothing. The five routes carried 99 such
 * values and they came out with this change.
 *
 * Eleven remain on the landing page and all of them are equally inert. Five are
 * plain literals on the element, twice in `header.astro` and once each in
 * `employers.astro`, `experience.astro`, and `looking-for.astro`, which is the
 * same shape as the route values above. Five are local expressions over a map
 * index, in `about.astro`, `experience.astro` twice, `looking-for.astro`, and
 * `projects.astro`. One crosses a component boundary: `project-card.astro`
 * derives its value from an `index` prop. Only that last one costs an interface
 * change to remove, so the other ten are cheap and it is the considered one.
 */

const BATCH_STEP_MS = 80

/**
 * A step per element with no ceiling makes a large batch wait longer than the
 * authored delays this replaces, so the whole batch is fitted to one window.
 */
const BATCH_WINDOW_MS = 400

/**
 * How far apart a grouped list steps its rows.
 *
 * Read against the 700ms fade rather than chosen freely: rows closer than about
 * a fifth of that overlap almost entirely and the list reads as one block
 * arriving. Judged live at 90, 140, and 220 on the timeline, where the last row
 * of six starts at 1.1s and the whole list settles inside 1.8s.
 */
const GROUP_STEP_MS = 220

/**
 * How much of an element has to be inside the root before it is marked, and how
 * far the root is inset from the bottom of the viewport. Both are exported
 * because `e2e/lazy-images.ts` walks the page waiting on the elements this
 * observer is due to mark, and a walk holding its own copies drifts from these
 * the moment either moves.
 */
export const REVEAL_THRESHOLD = 0.15
export const REVEAL_ROOT_BOTTOM_INSET_PERCENT = 10

/**
 * Marks every target arrived at once, all of them running the fade together.
 * The stylesheet holds the 700ms transition on `[data-fade]` wherever it is not
 * suppressed, and this path is inside that case rather than outside it, which
 * is why a test reading opacity here has to poll rather than read once.
 */
function revealAll(targets: readonly HTMLElement[]): void {
  for (const target of targets) target.setAttribute('data-visible', 'true')
}

/**
 * Reveals a list as one unit, its rows stepped by their position in it.
 *
 * The batch stagger below cannot do this, and the reason is worth stating
 * because it looks like it should. That stagger orders whatever arrives in one
 * observer callback, and a reader scrolling at reading pace delivers a six-row
 * list as six callbacks of one element each: measured on the timeline, batch
 * sizes ran 1,1,1,1,1,1,1,1,1,2 under a slow scroll against 3,6 under a fast
 * one. A batch of one is stepped by zero, so the constant is inert in exactly
 * the case a reader is in, and raising it changes nothing they will ever see.
 *
 * Watching the container instead makes the cascade a property of the list
 * rather than of how fast the page went by.
 */
function observeGroup(group: HTMLElement): void {
  const rows = [...group.querySelectorAll<HTMLElement>('[data-fade]')]
  if (rows.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        // Scheduled rather than written as a `transition-delay`, because that
        // longhand is reset by any `transition` shorthand a component declares
        // on the same element, and the token carrying the reveal cannot hold
        // the delay itself. Marking each row on its own timer puts the stagger
        // out of the cascade's reach entirely.
        for (const [index, row] of rows.entries()) {
          window.setTimeout(
            () => row.setAttribute('data-visible', 'true'),
            index * GROUP_STEP_MS,
          )
        }
        observer.disconnect()
      }
    },
    {
      // A list taller than the viewport never reaches a share of itself, so
      // this fires on the container's leading edge rather than on a ratio.
      threshold: 0,
      rootMargin: `0px 0px -${REVEAL_ROOT_BOTTOM_INSET_PERCENT}% 0px`,
    },
  )
  observer.observe(group)
}

export function initReveal(): void {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-fade]')]
  if (targets.length === 0) return

  // The stylesheet hides a marked element whenever scripting is on, so an
  // engine without an observer would hold every one of them hidden for the
  // life of the page. Reduced motion and a failed script both escape that
  // through the media query and the `data-js` gate, and this is the third case
  // and the only one reaching the rule with nothing able to answer it.
  if (!('IntersectionObserver' in window)) {
    revealAll(targets)
    return
  }

  // A grouped row is stepped by its position in its own list rather than by
  // what shared its callback, so the two paths are exclusive.
  const groups = [
    ...document.querySelectorAll<HTMLElement>('[data-fade-group]'),
  ]
  const grouped = new Set<HTMLElement>()
  for (const group of groups) {
    for (const row of group.querySelectorAll<HTMLElement>('[data-fade]')) {
      grouped.add(row)
    }
    observeGroup(group)
  }

  const loose = targets.filter((target) => !grouped.has(target))
  if (loose.length === 0) return

  // The authored per-element delay assumes its surface arrives alone. A fast
  // scroll delivers several surfaces in one callback, where a long-delayed
  // element further up the page finishes after a short-delayed one below it
  // and the page appears to reveal backwards. Everything arriving together is
  // therefore re-staggered by document position, which is the order a reader
  // expects whatever their scroll speed.
  const documentOrder = new Map<Element, number>()
  for (const [index, target] of loose.entries()) {
    documentOrder.set(target, index)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const arriving = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (a, b) =>
            (documentOrder.get(a.target) ?? 0) -
            (documentOrder.get(b.target) ?? 0),
        )

      const stepMs = Math.min(
        BATCH_STEP_MS,
        BATCH_WINDOW_MS / Math.max(1, arriving.length),
      )

      for (const [step, entry] of arriving.entries()) {
        const element = entry.target as HTMLElement
        element.style.setProperty('--fade-delay', `${step * stepMs}ms`)
        element.setAttribute('data-visible', 'true')
        observer.unobserve(element)
      }
    },
    {
      threshold: REVEAL_THRESHOLD,
      rootMargin: `0px 0px -${REVEAL_ROOT_BOTTOM_INSET_PERCENT}% 0px`,
    },
  )

  for (const target of loose) observer.observe(target)
}
