import type { Page } from '@playwright/test'

const SCROLL_STEP_RATIO = 0.8

/**
 * Lazy images only fetch once they approach the viewport, so a test that reads
 * their dimensions has to walk the page the way a reader does first.
 */
export async function scrollThroughPage(page: Page): Promise<void> {
  await page.evaluate(async (stepRatio) => {
    const step = Math.max(1, window.innerHeight * stepRatio)
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => window.setTimeout(resolve, 100))
    }
    window.scrollTo(0, 0)
  }, SCROLL_STEP_RATIO)
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
