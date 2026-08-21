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
 * Marks every target arrived at once, all of them running the fade together.
 * The stylesheet holds the 700ms transition on `[data-fade]` wherever it is not
 * suppressed, and this path is inside that case rather than outside it, which
 * is why a test reading opacity here has to poll rather than read once.
 */
function revealAll(targets: readonly HTMLElement[]): void {
  for (const target of targets) target.setAttribute('data-visible', 'true')
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

  // The authored per-element delay assumes its surface arrives alone. A fast
  // scroll delivers several surfaces in one callback, where a long-delayed
  // element further up the page finishes after a short-delayed one below it
  // and the page appears to reveal backwards. Everything arriving together is
  // therefore re-staggered by document position, which is the order a reader
  // expects whatever their scroll speed.
  const documentOrder = new Map<Element, number>()
  for (const [index, target] of targets.entries()) {
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
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  )

  for (const target of targets) observer.observe(target)
}
