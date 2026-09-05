import { expect, test } from '@playwright/test'

import {
  MEMBER,
  SCHEDULER_TEST_MS,
  SCHEDULER_WATCH_MS,
  SECTION,
  SETTLE_MS,
  settleCast,
  STILL_AFTER_TAP_MS,
  WIDE,
} from './cast-helpers'

// Split out of cast.spec.ts: these three each watch a wall clock for
// SCHEDULER_WATCH_MS, about 70s combined against the sixteen tests left in
// that file at about 45s, so keeping them there set the floor one worker held
// the whole file to regardless of how many workers CI has. `.claude/context/ci.md`
// records the measured seam.

test.describe('agent cast', () => {
  // The scheduler is the one term that runs without a reader asking for it, so
  // it answers to three things and each is the defect its own class has. A
  // second member moving at the same time is what turns a margin into a
  // performance. A term that fires nothing is indistinguishable from a broken
  // selector unless something proves it can still fire. And a member left
  // marked holds the scheduler's only slot for the life of the page.
  test('lets one member act on its own, and never two', async ({ page }) => {
    test.setTimeout(SCHEDULER_TEST_MS)
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const watched = await page.evaluate(
      async ({ member, watchMs }) => {
        const members = [...document.querySelectorAll<HTMLElement>(member)]
        let starts = 0
        let mostAtOnce = 0
        const wasActive = new Array<boolean>(members.length).fill(false)

        const until = performance.now() + watchMs
        while (performance.now() < until) {
          let atOnce = 0
          members.forEach((one, index) => {
            const on = one.dataset.reacting !== undefined
            if (on) {
              atOnce += 1
              if (!wasActive[index]) starts += 1
            }
            wasActive[index] = on
          })
          mostAtOnce = Math.max(mostAtOnce, atOnce)
          await new Promise((resolve) => window.setTimeout(resolve, 50))
        }
        return { starts, mostAtOnce }
      },
      { member: MEMBER, watchMs: SCHEDULER_WATCH_MS },
    )

    expect(watched.starts).toBeGreaterThan(0)
    expect(watched.mostAtOnce).toBe(1)
  })

  // The scheduler stands down while a pointer rests on a member, and WebKit
  // applies `:hover` to a tapped element and holds it. Ungated, one tap on a
  // touch screen silences the cast for the life of the page, and silence is
  // indistinguishable from a cast that is quiet on purpose. The tap is made
  // through the touch path rather than by calling `hover()`, since the point is
  // what a device without a hover pointer leaves behind.
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
    await page.goto('/')
    await page.locator(SECTION).scrollIntoViewIfNeeded()
    await page.waitForTimeout(SETTLE_MS)

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
    await page.waitForTimeout(STILL_AFTER_TAP_MS)

    const acted = await page.evaluate(
      async ({ member, watchMs }) => {
        const members = [...document.querySelectorAll<HTMLElement>(member)]
        let starts = 0
        const wasActive = new Array<boolean>(members.length).fill(false)
        const until = performance.now() + watchMs
        while (performance.now() < until) {
          members.forEach((one, index) => {
            const on = one.dataset.reacting !== undefined
            if (on && !wasActive[index]) starts += 1
            wasActive[index] = on
          })
          await new Promise((resolve) => window.setTimeout(resolve, 50))
        }
        return starts
      },
      { member: MEMBER, watchMs: SCHEDULER_WATCH_MS },
    )

    await context.close()

    expect(acted).toBeGreaterThan(0)
  })

  test('holds the cast still for a reader who asked for less motion', async ({
    page,
  }) => {
    test.setTimeout(SCHEDULER_TEST_MS)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const acted = await page.evaluate(
      async ({ member, watchMs }) => {
        const members = [...document.querySelectorAll<HTMLElement>(member)]
        let seen = 0
        const until = performance.now() + watchMs
        while (performance.now() < until) {
          seen += members.filter(
            (one) => one.dataset.reacting !== undefined,
          ).length
          await new Promise((resolve) => window.setTimeout(resolve, 50))
        }
        return seen
      },
      { member: MEMBER, watchMs: SCHEDULER_WATCH_MS },
    )

    expect(acted).toBe(0)
  })
})
