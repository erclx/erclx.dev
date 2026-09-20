import { expect, test } from '@playwright/test'

import {
  MEMBER,
  SCHEDULER_ACT_MS,
  SCHEDULER_TEST_MS,
  settleCast,
  WIDE,
} from './cast-helpers'

// One test, where there were three. The scheduler is a module now, at
// `src/components/site/experience/cast/scheduler.ts`, driven by an injected
// clock, so the one-at-a-time rule and the reduced-motion gate are proved in
// the unit runner in milliseconds rather than watched against a wall clock
// here. What is left is the case no fake clock reaches: WebKit's own hit
// testing after a tap.

test.describe('agent cast', () => {
  // The scheduler stands down while a pointer rests on a member, and WebKit
  // applies `:hover` to a tapped element and holds it. Ungated, one tap on a
  // touch screen silences the cast for the life of the page, and silence is
  // indistinguishable from a cast that is quiet on purpose. The tap is made
  // through the touch path rather than by calling `hover()`, since the point is
  // what a device without a hover pointer leaves behind. jsdom matches `:hover`
  // for nobody, so this cannot move down a layer.
  test('goes on acting after a member is tapped on a touch screen', async ({
    browser,
  }) => {
    test.setTimeout(SCHEDULER_TEST_MS)
    const context = await browser.newContext({
      ...WIDE,
      hasTouch: true,
      isMobile: false,
    })
    const page = await context.newPage()
    await page.setViewportSize(WIDE)
    await settleCast(page)

    // Bringing the section into view leaves the first member 61px above the
    // viewport at this size, so the tap below was relying on the driver to
    // scroll it in, and a minimal scroll lands it under the sticky bar. The
    // driver's own scroll is not instant now that the root glides for a reader,
    // so that hit test was being taken while the page was still traveling.
    // Centring the member is what the tap actually needs, and it needs no
    // driver scroll at all.
    await page.evaluate((selector) => {
      const member = document.querySelector(selector)
      if (!member) throw new Error('no cast member to tap')
      const box = member.getBoundingClientRect()
      window.scrollTo({
        top: window.scrollY + box.top - (window.innerHeight - box.height) / 2,
        behavior: 'instant',
      })
    }, MEMBER)

    await page.locator(MEMBER).first().tap()
    // Settled on the reaction the tap itself starts, rather than paused for a
    // span guessing when it ends. `cast.astro` clears `data-reacting` on
    // whichever comes first, `animationend` or its own 1400ms fallback, so
    // polling that mark directly carries both the tap's own timeout and the
    // engine's actual animation length rather than a number computed by hand.
    //
    // It takes the same budget the act below does, rather than a tighter bound
    // of its own. Both wait on one of the cast's own timers under a load
    // neither can see, and a bound at three times nominal is the shape that
    // fails on a contended runner with most of the test budget unspent.
    await page.waitForFunction(
      (selector) =>
        document.querySelector<HTMLElement>(selector)?.dataset.reacting ===
        undefined,
      MEMBER,
      { timeout: SCHEDULER_ACT_MS },
    )

    // The wait is the assertion: it resolves on the scheduler's next act and
    // throws on the budget, which is exactly what going on acting means. The
    // tap's own reaction was awaited above and nothing but the scheduler marks
    // a member after it, so the first mark to appear is the one under test.
    //
    // Settled on that act rather than counting starts across a fixed window. A
    // window is spent in full on every pass, and sizing one to clear a 7.8s gap
    // on a loaded runner is the trade that made these tests expensive.
    const acting = page.locator(`${MEMBER}[data-reacting]`).first()

    try {
      await expect(acting).toBeAttached({ timeout: SCHEDULER_ACT_MS })
    } finally {
      await context.close()
    }
  })
})
