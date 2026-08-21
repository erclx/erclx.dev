import type { Page } from '@playwright/test'

import {
  REVEAL_ROOT_BOTTOM_INSET_PERCENT,
  REVEAL_THRESHOLD,
} from '@/lib/reveal'

const SCROLL_STEP_RATIO = 0.8

/**
 * A step gives up on the images standing in it after this long. One that never
 * resolves is a broken source rather than a slow one, and every caller here
 * prefers the reading it came for over a walk that never returns.
 */
const STEP_SETTLE_TIMEOUT_MS = 2_000

/**
 * What the whole walk may spend waiting, against a step timeout it would
 * otherwise pay once per step. A request that hangs without erroring stands in
 * every step it is visible in, and fifteen of those at the step timeout reach
 * Playwright's 30s default, which times the test out rather than reporting the
 * count it was called for. The measured worst case is 2.7s, on webkit against
 * `/diction` with 400ms of latency added to every image.
 */
const WALK_SETTLE_BUDGET_MS = 10_000

/**
 * The gap between two reads of what the viewport is still waiting on. It also
 * doubles as the step's floor, since the loop takes it once before reading
 * anything, which is what hands the engine a task boundary to act in.
 */
const SETTLE_POLL_MS = 50

/**
 * The share of the viewport the reveal observer treats as its root, derived
 * from the inset that module declares rather than restated as a second number.
 */
const REVEAL_BOTTOM_RATIO = 1 - REVEAL_ROOT_BOTTOM_INSET_PERCENT / 100

/**
 * Lazy images only fetch once they approach the viewport, so a test that reads
 * their dimensions has to walk the page the way a reader does first.
 *
 * A step holds until the images standing in the viewport report themselves
 * loaded, rather than for a fixed span. A fixed span is a guess at how much
 * lead an engine needs before it issues a lazy fetch, and the engines disagree
 * on that number by an order of magnitude. Measured against `/diction` at
 * 1280x720, chromium loses nothing with no pause at all, firefox loses one of
 * seven figures there, and webkit is already down four at a 10ms pause and one
 * at 20ms. Nothing recovers a figure the walk outran, whether the walk parks at
 * the top or at the bottom, because no later event brings it back.
 *
 * Waiting on what is in the viewport rather than on a band around it is what
 * keeps the timeout off the ordinary path. An image inside the viewport is one
 * every engine agrees to fetch, so the wait ends when the fetch does.
 *
 * The reveal markers are waited on for the same reason and are the same defect
 * rather than a second one. Both are driven off the viewport and neither has a
 * later event that recovers what the walk went past, so the walk returning home
 * strands an unmarked element exactly as it strands an image it never asked
 * for. Reading the count afterwards cannot tell the two apart, which is why a
 * step settles where it stands rather than the walk settling once it is over.
 */
export async function scrollThroughPage(page: Page): Promise<void> {
  const exhausted = await page.evaluate(
    async ([
      stepRatio,
      timeoutMs,
      budgetMs,
      pollMs,
      revealThreshold,
      revealBottomRatio,
    ]) => {
      const pendingInViewport = () =>
        [...document.images].filter((image) => {
          if (!image.getAttribute('src') || image.complete) return false
          const box = image.getBoundingClientRect()
          return box.bottom > 0 && box.top < window.innerHeight
        })

      const unrevealedInViewport = () =>
        [...document.querySelectorAll<HTMLElement>('[data-fade]')].filter(
          (element) => {
            if (element.getAttribute('data-visible') === 'true') return false
            const box = element.getBoundingClientRect()
            if (box.height === 0) return false
            const gate = window.innerHeight * revealBottomRatio
            const visible = Math.min(box.bottom, gate) - Math.max(box.top, 0)
            return visible / box.height >= revealThreshold
          },
        )

      const walkDeadline = performance.now() + budgetMs

      const settleViewport = async () => {
        const deadline = Math.min(performance.now() + timeoutMs, walkDeadline)
        do {
          await new Promise((resolve) => window.setTimeout(resolve, pollMs))
        } while (
          (pendingInViewport().length > 0 ||
            unrevealedInViewport().length > 0) &&
          performance.now() < deadline
        )
      }

      const step = Math.max(1, window.innerHeight * stepRatio)
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y)
        await settleViewport()
      }
      window.scrollTo(0, 0)

      return performance.now() > walkDeadline
    },
    [
      SCROLL_STEP_RATIO,
      STEP_SETTLE_TIMEOUT_MS,
      WALK_SETTLE_BUDGET_MS,
      SETTLE_POLL_MS,
      REVEAL_THRESHOLD,
      REVEAL_BOTTOM_RATIO,
    ] as const,
  )

  // Past the budget every remaining step settles for one poll and returns, which
  // is a shorter fixed pause than the one this walk replaced. Whatever a caller
  // counts afterwards reads as a page defect, so the walk says which it was.
  if (exhausted) {
    console.warn(
      `page walk exhausted its ${WALK_SETTLE_BUDGET_MS}ms settle budget, so a later step may not have waited`,
    )
  }
}

/**
 * Walks the page and then waits for every image to report pixels, so a capture
 * taken afterwards cannot land on a slot whose image never started loading.
 * A image that never loads resolves rather than throwing: the capture is the
 * evidence a reviewer wants, and losing it hides the breakage it would show.
 * An image carrying no source at all is a slot a control fills on demand, which
 * has nothing to wait for.
 */
export async function settleLazyImages(page: Page): Promise<void> {
  await scrollThroughPage(page)
  await page
    .waitForFunction(
      () =>
        Array.from(document.images).every(
          (image) =>
            !image.getAttribute('src') ||
            (image.complete && image.naturalWidth > 0),
        ),
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => {
      console.warn('capture proceeding with at least one image unloaded')
    })
}

/**
 * Counts how many of the matched images actually decoded. Reading the count
 * rather than each width keeps the assertion tied to whether a reader sees the
 * image, not to the dimensions of whichever source file is behind it.
 */
export function loadedImageCount(page: Page, selector: string) {
  return page
    .locator(selector)
    .evaluateAll(
      (images) =>
        images.filter((image) => (image as HTMLImageElement).naturalWidth > 0)
          .length,
    )
}
