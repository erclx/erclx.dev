import type { Page } from '@playwright/test'

/**
 * Settles on the scroll actually finishing rather than on scrollY holding
 * still, which a scroll that has not started yet also does. `scrollend`
 * fires when a real smooth scroll completes, and nothing fires it when
 * `scrollIntoViewIfNeeded` or a scripted `scrollTo` found the target already
 * in view, so a short window checking for any movement at all covers that
 * second case without racing the first.
 *
 * Comparing `scrollY` against its own value read moments earlier was tried
 * first and reproduces the exact defect this sweep exists to close: called
 * immediately after issuing a smooth scroll, the read and the first poll can
 * both land before the browser has moved the page at all, so "unchanged"
 * reads as "finished" before it has started. Verified against a full-page
 * scroll on this site: that shape returned in 16 to 170ms while the scroll
 * itself took over a second, every time.
 */
export async function settleScroll(page: Page): Promise<void> {
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        window.removeEventListener('scrollend', finish)
        resolve()
      }
      window.addEventListener('scrollend', finish, { once: true })

      // 30 frames, about half a second, is the fallback for "nothing was
      // ever going to scroll". Verified against the same full-page scroll:
      // a 2-frame version returned early in roughly half of repeated runs,
      // reading the gap before the browser had started animating as
      // stillness. 30 held across every repeat tried.
      const startedAt = window.scrollY
      let frames = 0
      const MAX_FRAMES = 30
      const tick = () => {
        if (settled) return
        if (window.scrollY !== startedAt) return // scrollend will fire
        frames += 1
        if (frames >= MAX_FRAMES) {
          finish()
          return
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)

      // A safety net rather than the settle's own bound: nothing here should
      // ever reach it, since every path above resolves on its own.
      window.setTimeout(finish, 10000)
    })
  })
}
