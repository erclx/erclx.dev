import { expect, type Page, test } from '@playwright/test'

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

// The giving-up point for a scripted focus that never reports `:focus-visible`,
// on the two engines that carry keyboard modality across one. A Firefox settle
// has been measured taking several seconds at heavy CPU throttle, so this is the
// point at which the engine is treated as having stopped answering rather than a
// guess at how long settling takes.
const SETTLE_BOUND = 15000

// WebKit's fallback trigger, which is a different quantity from the bound above
// even though one number replaced the other. WebKit ran the whole four-control
// loop of `every control marks focus in the accent` in 1.6s on the last green
// run of `main`, run `35485018463`, so the scripted-focus path is succeeding
// there and the Tab walk is reached rarely if at all. This only has to be long
// enough to tell a slow settle from an engine that will not carry the mode,
// rather than long enough to be a settle.
const WEBKIT_FALLBACK_BOUND = 2000
const WEBKIT_FALLBACK_POLL = 50

/**
 * Reached by keyboard rather than by `.focus()`, which is what `:focus-visible`
 * keys on.
 *
 * The round trip is verified rather than assumed, since focus changes the layout
 * on this site and a step that lands elsewhere reports whatever holds focus
 * instead.
 *
 * Its scripted-focus path also holds the page where `settle` put it. A caller
 * walking `SAMPLED` focuses four controls in turn, and any step that scrolls
 * puts the hero back on screen, which re-arms the scroll-gated controls the
 * later iterations reach. The WebKit Tab walk below is the one path that does
 * move the page, since it reaches its target the way a reader does. It is a
 * fallback rather than the ordinary route, and the precondition below names the
 * inert control rather than timing out if the move does cost a later iteration.
 */
async function tabTo(page: Page, selector: string, index = 0) {
  // Keyboard modality is established once per page, by `settle`, rather than
  // once per call here. A Tab press moves focus to the next control in document
  // order and the engine scrolls that control into view, so a press per call
  // moved the page this walk is measuring. Measured on firefox at 1440x900: the
  // press opening the second call left the page at `scrollY=40` with the dock
  // inert, against 1700 across all four controls when the press happens once in
  // `settle`. `:focus-visible` reads true on every control either way, so the
  // mode does survive the move.
  //
  // Stepping off a control and back is the other way to establish the mode, and
  // it is unavailable here: the dock's link stack is faded until something
  // inside it holds focus, so stepping off collapses the set and the return step
  // lands elsewhere. That failed under parallel workers in Firefox and WebKit,
  // and every ring reading after it described a control the test was not looking
  // at. `:focus-visible` is asserted below rather than assumed, so a browser
  // that does not carry the mode across a scripted focus fails there rather than
  // reporting a control with no ring.
  const target = page.locator(selector).nth(index)
  const visiblyFocused = () =>
    target.evaluate(
      (element) =>
        document.activeElement === element && element.matches(':focus-visible'),
    )

  // Whether the target can take focus is read at the moment of use rather than
  // trusted from the reveal attributes `settle` asserted, because an earlier
  // iteration of this same walk can revoke them. An inert element refuses focus
  // and reports nothing, so without this the settle below spends its whole bound
  // against a condition that can never become true and then names a timeout
  // rather than a cause. Keyed on `inert` rather than on visibility: `inert` is
  // what refuses focus here, and the controls this file samples are legitimately
  // off screen at the position `settle` scrolls to.
  const inertHost = await target.evaluate((element) => {
    const host = element.closest('[inert]')
    if (!host) return null
    const marks = [...host.attributes]
      .filter((attribute) => attribute.name.startsWith('data-'))
      .map((attribute) => ` ${attribute.name}`)
      .join('')
    return `<${host.tagName.toLowerCase()}${marks}>`
  })
  if (inertHost) {
    throw new Error(
      `${selector} [${index}] cannot take focus: it sits inside an inert ${inertHost}`,
    )
  }

  // `preventScroll`, the walk's second scroll source after the Tab press above.
  // A bare `focus()` on `SAMPLED[0]` puts the page at `scrollY=40` against the
  // 1700 `settle` set, which brings the hero back on screen and has the dock's
  // reveal gate set `inert` on a control a later iteration reaches. The dock is
  // behaving correctly there. The walk was asserting reveal attributes for one
  // scroll position and then reading them at another.
  await target.evaluate((element) =>
    (element as HTMLElement).focus({ preventScroll: true }),
  )

  // Settled on the browser's own focus-visible determination rather than
  // paused for a fixed span. Firefox failed on the trunk reading this after a
  // flat 80ms: `:focus-visible` mode does not always land inside that window
  // once a runner is loaded, and the same evaluate round trip that carries the
  // focus() call already absorbs most of the delay under load, measured up to
  // several seconds at heavy CPU throttle.
  const isWebKit = page.context().browser()?.browserType().name() === 'webkit'
  if (!isWebKit) {
    await page.waitForFunction(
      (element) =>
        document.activeElement === element &&
        (element as HTMLElement).matches(':focus-visible'),
      await target.elementHandle(),
      { timeout: SETTLE_BOUND },
    )
    return target
  }

  // WebKit does not carry keyboard modality across a scripted focus on every
  // control, and the Tab walk below is the fallback for that. Whether it is
  // needed is read as a predicate rather than caught as a `TimeoutError`, since
  // an engine capability decided by an exception is control flow through
  // exceptions, and a bound that doubles as a branch cannot be shortened
  // without also shortening the settle it is not.
  const deadline = Date.now() + WEBKIT_FALLBACK_BOUND
  do {
    if (await visiblyFocused()) return target
    await page.waitForTimeout(WEBKIT_FALLBACK_POLL)
  } while (Date.now() < deadline)

  // The walk reaches the target the way a reader does. Bounded rather than
  // open, and it throws on exhaustion, since a walk that quietly gives up
  // leaves the caller reading whatever holds focus instead.
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  for (let press = 0; press < 80; press++) {
    await page.keyboard.press('Tab')
    if (await visiblyFocused()) return target
  }
  throw new Error(`${selector} [${index}] never took a visible focus`)
}

async function settle(page: Page) {
  await page.goto('/')

  // The one Tab press of the run, taken here rather than inside `tabTo` so it
  // happens before the scroll below and never moves the page afterwards.
  // `tabTo` carries why.
  await page.keyboard.press('Tab')
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
    // Four controls each carrying their own settle, which under load can
    // legitimately need most of that settle's own 15s bound. The default
    // 30s test budget was measured exceeding on a loaded CI runner with
    // this loop at four iterations.
    test.setTimeout(90_000)
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
    // Same margin as the loop above, and for the same reason.
    test.setTimeout(90_000)
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
