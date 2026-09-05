import type { Page } from '@playwright/test'

/**
 * Settles on the scroll position itself rather than a guessed span.
 * `scrollIntoViewIfNeeded` and a scripted `scrollTo` do not wait out the
 * `scroll-behavior: smooth` a reader with no motion preference inherits from
 * `:root`, so a box or a position read right after either can describe the
 * page still traveling.
 */
export async function settleScroll(page: Page): Promise<void> {
  await page.evaluate(() => {
    ;(window as unknown as { __lastScrollY: number }).__lastScrollY =
      window.scrollY
  })
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __lastScrollY: number }
      const settled = window.scrollY === w.__lastScrollY
      w.__lastScrollY = window.scrollY
      return settled
    },
    undefined,
    { timeout: 5000 },
  )
}
