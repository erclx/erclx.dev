import { expect, type Locator, type Page, test } from '@playwright/test'

import { contrastRatio, paintedColor } from './colors'

// Guards for the ground every floating control draws.
//
// The site carries four of them, two bars, the rail's active row and the dock,
// and each one reads `--floating-fill`. What that token resolved to in light
// was pure white on a page at chroma 0.01, so the one surface meant to read as
// an object on the page was the only colorless surface on the site.
//
// The reading that settles this is off painted pixels rather than off tokens.
// A `backdrop-filter` samples what sits behind the element, so no composite of
// declared values reproduces what a reader sees, and a patch taken at the
// corner of a bounding box misses a round control and reads the page instead.

const SURFACES = [
  { name: 'the site bar', selector: '[data-bar-ground]' },
  {
    name: "the rail's active row",
    selector: '.section-nav-link[data-active="true"]',
  },
  { name: 'the contact dock', selector: '[data-dock-surface]' },
] as const

async function settleChrome(page: Page): Promise<void> {
  await page.goto('/')
  await page.evaluate(() => window.scrollTo({ top: 1700, behavior: 'instant' }))
  await page.evaluate(() => {
    for (const element of document.querySelectorAll(
      '[data-contact-dock],[data-section-nav],[data-site-bar]',
    )) {
      element.setAttribute('data-revealed', 'true')
      element.removeAttribute('inert')
    }
  })

  // Settled on the surfaces themselves rather than paused for a fixed span. The
  // rail marks its active row off the scroll position, so a pause long enough
  // on an idle machine is short under three parallel workers: the row was
  // absent and this file reported the site as drawing one ground because it had
  // found two.
  for (const surface of SURFACES) {
    await expect(page.locator(surface.selector).first()).toBeVisible({
      timeout: 10000,
    })
  }
}

/**
 * The painted fill once the element has one and it has stopped moving.
 *
 * Two conditions, and the first is the one that is easy to miss. A rail row
 * carries no ground until the scroll marks it active, and it is visible that
 * whole time because it carries its label. So a settle that waits for
 * visibility and then for a steady reading gets a steady reading of
 * `rgba(0, 0, 0, 0)`, which arrives at this file as the color black. Under
 * three parallel workers in WebKit that reported the site as drawing two
 * grounds, and the reading it disagreed on was of an element that had none.
 *
 * The second is the transition. The row ramps its background over 150ms, so a
 * read taken as it lands falls mid-ramp on a color the stylesheet never
 * declares. Two equal reads is the settle rather than a longer pause, since a
 * pause long enough on an idle machine is the one that fails on a loaded one.
 *
 * The declared string is what comes back rather than channels read through a
 * canvas. WebKit serializes a resolved relative color as `color(srgb ...)`,
 * which `paintedColor` cannot parse, so it painted nothing and returned black
 * for a surface that draws the same ground as the two beside it. Comparing the
 * strings is also the stronger reading of the claim: four surfaces resolving
 * one token produce one serialization, where four equal channel triples would
 * also be produced by four components each holding a copy.
 */
async function restingFill(target: Locator): Promise<string> {
  let previous = ''
  for (let attempt = 0; attempt < 40; attempt++) {
    const declared = await target.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    )
    // Zero alpha in whatever form the engine writes it. Matching literal
    // strings is what let this through twice: Chromium writes
    // `rgba(0, 0, 0, 0)` and WebKit writes `oklab(0 0 0 / 0)` for the same
    // transparent start of the same transition, and a check naming the first
    // reported the second as a ground.
    const grounded = !/(^transparent$)|(\/\s*0\s*\))|(,\s*0\s*\)$)/.test(
      declared,
    )
    if (grounded && declared === previous) return declared
    previous = grounded ? declared : ''
    await target.page().waitForTimeout(120)
  }
  throw new Error('a floating surface never settled on a ground')
}

async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
  // No pause follows the toggle. `getComputedStyle` forces a synchronous style
  // recalculation and nothing here reads a color that transitions between
  // themes, verified against 80x CPU throttling in `e2e/focus-ring.spec.ts`'s
  // own theme toggle: the class and the resolved value never disagreed.
  await page.evaluate((mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, theme)
}

test.describe('elevated surfaces', () => {
  test('every floating control draws one ground', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settleChrome(page)

    const fills: string[] = []
    for (const surface of SURFACES) {
      const all = page.locator(surface.selector)
      // The dock draws one of these per control, so the count is a presence
      // check rather than a fixed number. Asserting it is what stops a renamed
      // hook reporting a site with one ground because it found none.
      expect(await all.count()).toBeGreaterThan(0)
      fills.push(`${surface.name}=${await restingFill(all.first())}`)
    }

    // Not a comparison against a literal. Four components each holding an equal
    // copy of one color satisfies that and is the state this guards against.
    const distinct = new Set(fills.map((entry) => entry.split('=')[1]))
    expect(distinct.size, fills.join('  ')).toBe(1)
  })

  for (const theme of ['light', 'dark'] as const) {
    test(`the ground keeps the page's own warmth in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await settleChrome(page)
      await setTheme(page, theme)

      const warmth = await page.evaluate(() => {
        const parse = (declared: string) => {
          const context = document.createElement('canvas').getContext('2d')
          if (!context) throw new Error('no 2d context')
          context.fillStyle = declared
          context.fillRect(0, 0, 1, 1)
          const [red, , blue] = context.getImageData(0, 0, 1, 1).data
          return red - blue
        }
        const root = getComputedStyle(document.documentElement)
        return {
          ground: parse(root.getPropertyValue('--surface-elevated')),
          page: parse(root.getPropertyValue('--background')),
        }
      })

      // The page's warmth is the reference rather than a fixed number, so a
      // palette edit moves both together. Pure white reads 0 here and fails on
      // its own, which is the state that shipped.
      expect(warmth.page).toBeGreaterThan(0)
      expect(warmth.ground).toBeGreaterThanOrEqual(warmth.page / 2)
    })
  }

  test('the ground stays distinguishable from the page it floats over', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settleChrome(page)

    // Read off painted pixels rather than composited from tokens. A
    // `backdrop-filter` samples what sits behind the element, so arithmetic
    // over declared values does not reach it and ran about 6% high when this
    // file's own ceiling was computed that way.
    const bar = await page.locator('[data-bar-ground]').screenshot()
    const behind = await page.screenshot({
      clip: { x: 40, y: 400, width: 120, height: 60 },
    })
    const ratio = await page.evaluate(
      async ([groundBytes, pageBytes]) => {
        const mean = async (bytes: readonly number[]) => {
          const bitmap = await createImageBitmap(
            new Blob([new Uint8Array(bytes)], { type: 'image/png' }),
          )
          const canvas = document.createElement('canvas')
          canvas.width = bitmap.width
          canvas.height = bitmap.height
          const context = canvas.getContext('2d')
          if (!context) throw new Error('no 2d context')
          context.drawImage(bitmap, 0, 0)
          const { data } = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          )
          const pixels: number[][] = []
          for (let i = 0; i < data.length; i += 4) {
            pixels.push([data[i], data[i + 1], data[i + 2]])
          }
          // The lightest 60%, so glyphs inside the bar do not drag the ground
          // reading dark and turn a fill comparison into a text comparison.
          pixels.sort((a, b) => b[0] + b[1] + b[2] - (a[0] + a[1] + a[2]))
          const take = Math.max(1, Math.floor(pixels.length * 0.6))
          const channel = (value: number) => {
            const s = value / 255
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
          }
          let total = 0
          for (let i = 0; i < take; i++) {
            const [r, g, b] = pixels[i]
            total +=
              0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
          }
          return total / take
        }
        const [ground, surround] = await Promise.all([
          mean(groundBytes),
          mean(pageBytes),
        ])
        const [hi, lo] = [ground, surround].sort((a, b) => b - a)
        return (hi + 0.05) / (lo + 0.05)
      },
      [[...new Uint8Array(bar)], [...new Uint8Array(behind)]] as const,
    )

    // A regression floor, not the criterion the board outcome names. The arm
    // rejected on measurement pushed the alpha to 0.72 and read 1.004:1, which
    // is the page laid on the page and the state where prose behind the bar
    // becomes legible through it. The shipped ground reads 1.023:1. Whether
    // separation is the right criterion at all, and at what value, is the
    // question open on this branch's thread rather than something this decides.
    expect(ratio).toBeGreaterThan(1.015)
  })

  test('the bar states its bounds with an edge and a shadow, not with its fill', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await settleChrome(page)

    const ground = page.locator('[data-bar-ground]')
    const drawn = await ground.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        shadow: style.boxShadow,
        borderColor: style.borderTopColor,
        borderWidth: style.borderTopWidth,
      }
    })

    // Light leaves 0.032 of lightness between the page and white, so the fill
    // can separate by at most about 1.04:1 and carries none of this. Removing
    // the shadow or the edge is what leaves the control without bounds, and no
    // contrast reading on the fill would report it.
    expect(drawn.shadow).not.toBe('none')
    expect(drawn.borderWidth).not.toBe('0px')
    expect(drawn.borderColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  // The shape both bars contract into is declared once, and a component
  // redeclaring `transition` on the ground replaces that list rather than
  // adding to it. The landing bar did, asking for its ground's opacity fade,
  // and reset `transition-property` to `opacity` alone: measured at 1280
  // across 31 frames, it held 2 distinct radius values against a route's 21,
  // so the shape changed in one frame on the surface a reader meets first.
  //
  // Read off the transition events rather than off a sampled radius or a
  // snapshot of what is running. Both of those race the page: the landing page
  // runs the hero shader and ticks at 22fps against a route's 60 under a
  // headless composite, so a radius read at 120ms returned 0 on WebKit for
  // both surfaces and 705 on Chromium for one, and a `getAnimations` snapshot
  // taken at a fixed pause missed the landing bar on WebKit against the built
  // preview while passing against the dev server. An event registered before
  // the trigger cannot be missed for arriving early or late.
  for (const surface of [
    { name: 'the landing bar', path: '/' },
    { name: "a route's bar", path: '/jobtriage' },
  ]) {
    test(`${surface.name} eases between its two shapes`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 })
      await page.goto(surface.path)

      const ground = page.locator('[data-bar-ground]').first()
      await expect(ground).toHaveCount(1)
      const bar = ground.locator('xpath=..')

      // The landing bar condenses past the hero's own height and a route's
      // past the top of the page, so each is driven from its own gate rather
      // than from one scroll distance that would miss one of them.
      const heroHeight = await page.evaluate(
        () =>
          document
            .querySelector('[data-section="header"]')
            ?.getBoundingClientRect().height ?? 0,
      )
      const condensed = surface.path === '/' ? heroHeight + 420 : 400
      const expanded = surface.path === '/' ? heroHeight + 100 : 100

      // Driving the gate once and waiting on the attribute is what proves the
      // scroll listener is attached. A fixed pause instead stands in for that
      // and is what a loaded machine makes too short.
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: 'instant' }),
        condensed,
      )
      await expect(bar).toHaveAttribute('data-condensed', 'true')
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: 'instant' }),
        expanded,
      )
      await expect(bar).not.toHaveAttribute('data-condensed', 'true')

      // Settled on the shape rather than on the attribute, because the leg
      // back to the full-width state is itself a transition. Registering while
      // it still runs makes the trigger a reversal of a live transition rather
      // than the start of one, and WebKit reversed in place and announced
      // nothing: the guard collected an empty set on a bar that was easing
      // correctly.
      await expect
        .poll(() =>
          ground.evaluate(
            (element) => getComputedStyle(element).borderTopLeftRadius,
          ),
        )
        .toBe('0px')

      const ran = await ground.evaluate(async (element, top) => {
        const seen = new Set<string>()
        element.addEventListener('transitionrun', (event) =>
          seen.add((event as TransitionEvent).propertyName),
        )
        window.scrollTo({ top, behavior: 'instant' })
        // Bounded rather than open, so a bar that never transitions fails here
        // instead of hanging until the whole spec times out.
        const deadline = Date.now() + 2000
        while (
          !(seen.has('left') && seen.has('border-top-left-radius')) &&
          Date.now() < deadline
        )
          await new Promise((settle) => setTimeout(settle, 50))
        return [...seen]
      }, condensed)

      // Both halves of the shape, because `inset` and `border-radius` are
      // separate entries in that list and dropping either leaves a bar that
      // travels without rounding or rounds without traveling.
      expect(ran).toContain('border-top-left-radius')
      expect(ran).toContain('left')
    })
  }

  test('a chart plate stays white in both themes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })

    for (const theme of ['light', 'dark'] as const) {
      await page.goto('/diction')
      await setTheme(page, theme)
      const plate = page.locator('.figure-plate').first()
      await expect(plate).toHaveCount(1)

      // The charts upstream are drawn on pure white, so the plate under them
      // reads `--card` and not the elevated surface. Warming this is what puts
      // a white rectangle inside a cream frame.
      const fill = await paintedColor(plate, 'backgroundColor')
      expect(contrastRatio(fill, [255, 255, 255])).toBeLessThan(1.02)
    }
  })
})
