import { errors, expect, type Page, test } from '@playwright/test'

import { contrastRatio, paintedColor } from './colors'

// Guards for the ring a keyboard reader meets.
//
// The site carried one ring and it was the component library's default blue,
// a color painted nowhere else a visitor can see. That survived every review
// because a ring is the one treatment nobody meets while building: a pointer
// response is met on every pass over the page, and a ring takes a Tab.
//
// `e2e/focus-inventory.ts` is the instrument these are written from. It walks
// six pages in both themes and groups every focusable control by its full
// treatment, which is the reading a per-component look cannot give.

/**
 * Reached by keyboard rather than by `.focus()`, which is what `:focus-visible`
 * keys on.
 *
 * The round trip is verified rather than assumed. Focus changes the layout on
 * this site: the dock's link stack is faded until something inside it holds
 * focus, so stepping off it collapses the set and the return step does not
 * always land back on the same control. Under three parallel workers that put
 * focus somewhere else in Firefox and WebKit, and every ring reading after it
 * described a control the test was not looking at, reported as a control with
 * no ring at all.
 */
async function tabTo(page: Page, selector: string, index = 0) {
  // Modality first, then focus directly. Stepping off a control and back is
  // what puts an engine in keyboard mode, and it cannot be done per control
  // here: the dock's link stack is faded until something inside it holds focus,
  // so stepping off collapses the set and the return step lands elsewhere. That
  // failed under parallel workers in Firefox and WebKit, and every ring reading
  // after it described a control the test was not looking at.
  //
  // One Tab establishes the mode for the page, and `:focus-visible` is then
  // asserted rather than assumed, so a browser that does not carry the mode
  // across a scripted focus fails here rather than reporting a control with no
  // ring.
  await page.keyboard.press('Tab')
  const target = page.locator(selector).nth(index)
  const visiblyFocused = () =>
    target.evaluate(
      (element) =>
        document.activeElement === element && element.matches(':focus-visible'),
    )

  await target.evaluate((element) => (element as HTMLElement).focus())

  // Settled on the browser's own focus-visible determination rather than
  // paused for a fixed span. Firefox failed on the trunk reading this after a
  // flat 80ms: `:focus-visible` mode does not always land inside that window
  // once a runner is loaded, and the same evaluate round trip that carries the
  // focus() call already absorbs most of the delay under load, measured up to
  // several seconds at heavy CPU throttle. The bound is the giving-up point,
  // not a guess at how long settling takes.
  try {
    await page.waitForFunction(
      (element) =>
        document.activeElement === element &&
        (element as HTMLElement).matches(':focus-visible'),
      await target.elementHandle(),
      { timeout: 8000 },
    )
    return target
  } catch (error) {
    if (!(error instanceof errors.TimeoutError)) throw error
    // Falls through to the bounded Tab walk below.
  }

  // WebKit does not carry keyboard modality across a scripted focus on every
  // control, so the fallback reaches the target the way a reader does. Bounded
  // rather than open, and it throws on exhaustion, since a walk that quietly
  // gives up leaves the caller reading whatever holds focus instead.
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  for (let press = 0; press < 80; press++) {
    await page.keyboard.press('Tab')
    if (await visiblyFocused()) return target
  }
  throw new Error(`${selector} [${index}] never took a visible focus`)
}

async function settle(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.scrollTo({ top: 1700, behavior: 'instant' }))
  await page.evaluate(() => {
    for (const element of document.querySelectorAll(
      '[data-contact-dock],[data-section-nav],[data-site-bar]',
    )) {
      element.setAttribute('data-revealed', 'true')
      element.removeAttribute('inert')
    }
    for (const element of document.querySelectorAll('[data-fade]')) {
      element.setAttribute('data-visible', 'true')
    }
  })

  // Settled on a surface rather than paused for a fixed span, so a read after
  // this is not racing the reveal under parallel workers.
  await expect(page.locator('[data-dock-surface]').first()).toBeVisible({
    timeout: 10000,
  })
}

// One with a shape of its own, one with none, and one whose shape sits inside
// its hit area, which is the case that drew a rectangle around a pill.
const SAMPLED = [
  { name: 'a hero contact link', selector: 'header a', index: 0 },
  { name: 'a timeline chip', selector: '.experience-chip-hit', index: 0 },
  { name: 'a rail row', selector: '.section-nav-link', index: 0 },
  { name: 'a dock link', selector: '[data-contact-dock] a[href]', index: 0 },
] as const

test.describe('focus ring', () => {
  test('every control marks focus in the accent rather than a color of its own', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settle(page)

    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent'),
    )

    for (const control of SAMPLED) {
      const target = await tabTo(page, control.selector, control.index)
      const ring = await target.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          color: style.outlineColor,
          width: style.outlineWidth,
          style: style.outlineStyle,
        }
      })
      // Resolved against the token rather than compared to a literal, so a
      // palette edit moves the ring with the accent instead of failing here.
      const [ringColor, accentColor] = await Promise.all([
        paintedColor(target, 'outlineColor'),
        page.evaluate((declared) => {
          const context = document.createElement('canvas').getContext('2d')
          if (!context) throw new Error('no 2d context')
          context.fillStyle = declared
          context.fillRect(0, 0, 1, 1)
          const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
          return [red, green, blue] as [number, number, number]
        }, accent),
      ])

      expect(ring.style, control.name).toBe('solid')
      expect(ring.width, control.name).not.toBe('0px')
      expect(contrastRatio(ringColor, accentColor), control.name).toBeLessThan(
        1.02,
      )
    }
  })

  test('no ring is drawn square around a control', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settle(page)

    for (const control of SAMPLED) {
      const target = await tabTo(page, control.selector, control.index)
      const radius = await target.evaluate(
        (element) => getComputedStyle(element).borderTopLeftRadius,
      )
      expect(parseFloat(radius), control.name).toBeGreaterThan(0)
    }
  })

  test('a control with a shape of its own keeps it when focused', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settle(page)

    // The floor lives in `@layer base` so anything a component or a utility
    // declares beats it. Raising that rule out of the layer, or writing it as a
    // utility, squares off every round control on the site and no assertion
    // about the ring's color would report it.
    const round = page.locator('[data-contact-dock] a[href]').first()
    const atRest = parseFloat(
      await round.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    )
    const focused = await tabTo(page, '[data-contact-dock] a[href]', 0)
    const whenFocused = parseFloat(
      await focused.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    )

    expect(atRest).toBeGreaterThan(100)
    expect(whenFocused).toBe(atRest)
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`the ring clears the contrast floor for an indicator in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await settle(page)
      await page.evaluate((mode) => {
        document.documentElement.classList.toggle('dark', mode === 'dark')
      }, theme)

      // No pause follows the toggle. `getComputedStyle` forces a synchronous
      // style recalculation, and no token or transition in this codebase
      // animates between themes, so the class and the color it resolves to
      // land inside the one evaluate call above. Verified against 80x CPU
      // throttling: the class and the resolved color never disagree.
      //
      // The ring is read once and measured against every ground it can sit on,
      // rather than against the page alone. It reaches controls inside the two
      // bars, the rail's active row and the dock, and each of those draws its
      // own elevated ground, so a reading against `body` goes on passing while
      // the surface under the ring changes. The branch below this one moves
      // exactly those surfaces.
      //
      // One reading rather than one per surface, because focusing inside the
      // dock by keyboard is not reliable: its link stack is faded until
      // something in it holds focus, so stepping off to come back collapses the
      // set and the return step lands elsewhere. `every control marks focus in
      // the accent` already establishes that every control resolves one ring,
      // which is what makes a single reading the right one to carry here.
      const ring = await paintedColor(
        await tabTo(page, 'header a', 0),
        'outlineColor',
      )

      // The rail's active row is not listed and does not need to be.
      // `e2e/elevation.spec.ts` asserts all four floating surfaces resolve one
      // ground, so the two sampled here carry the rail's as well. Reading it
      // directly would mean waiting on a row the rail marks off the scroll
      // position, which is a dependency this file does not otherwise have.
      const grounds = [
        { name: 'the page', selector: 'body' },
        { name: "the dock's ground", selector: '[data-dock-surface]' },
        { name: "the bar's ground", selector: '[data-bar-ground]' },
      ] as const

      for (const surface of grounds) {
        const ground = await paintedColor(
          page.locator(surface.selector).first(),
          'backgroundColor',
        )

        // 3:1, which is what a non-text indicator answers to. The blue this
        // replaced cleared it too, so this is a floor rather than the reason.
        expect(
          contrastRatio(ring, ground),
          surface.name,
        ).toBeGreaterThanOrEqual(3)
      }
    })
  }

  test('the guard reports a control whose ring has been taken away', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settle(page)

    // A check that cannot fail is not a check. The site's rings are uniform, so
    // nothing above distinguishes a working instrument from one reading the
    // wrong property, and this strips a ring on purpose and asserts the same
    // reading catches it.
    //
    // Stripped inline rather than through a stylesheet. An added rule has to
    // win a cascade against a base-layer declaration and a user-agent default,
    // and a first attempt that lost read 3px, the agent's own ring, which is
    // this check failing to falsify anything rather than a ring surviving.
    const target = await tabTo(page, 'header a', 0)
    await target.evaluate((element) => {
      ;(element as HTMLElement).style.outline = 'none'
    })
    const style = await target.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    )

    // The style rather than the width. `outline: none` resets the width to
    // `medium`, which every engine reports as 3px while drawing nothing, so a
    // check reading the width sees a ring on a control that has none.
    expect(style).toBe('none')
  })
})
