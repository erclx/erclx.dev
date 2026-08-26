import { expect, type Page, test } from '@playwright/test'

import { contrastRatio, paintedColor, relativeLuminance } from './colors'
import { loadedImageCount, scrollThroughPage } from './lazy-images'
import { WATCHED_SELECTORS } from './reveal-selectors'

const FIGURE_SELECTOR = 'main figure img'
// The six research charts. The route's opening figure, added 2026-08-20 so
// the route does not begin in prose where every other one begins with a
// figure, became a screenshot gallery on 2026-08-25 and is counted below
// under its own selector rather than this one: a carousel slide is a
// button a reader operates, not a `<figure>` a reader reads past.
const DICTION_FIGURE_COUNT = 6
const DICTION_GALLERY_SELECTOR =
  'main [data-screenshot-gallery] [data-peek-slide] img'
const DICTION_GALLERY_COUNT = 5
const CASE_STUDY_ROUTES = [
  '/aitk',
  '/jobtriage',
  '/diction',
  '/stackr',
  '/caret',
]

for (const route of CASE_STUDY_ROUTES) {
  test(`every section on ${route} opens on a real heading`, async ({
    page,
  }) => {
    await page.goto(route)

    // The route's opening carries the `h1` and every prose section an `h2`, so
    // the heading level varies while the invariant does not: a section a reader
    // can be sent to opens on a heading. This read `h2` alone until the opening
    // gained an id, which held while that section was the one nothing linked to.
    //
    // Counted per section rather than as a document-wide total, since a total
    // is satisfied by a section carrying two headings offsetting one carrying
    // none, in either level.
    const headingCounts = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main section[id]')).map(
        (section) => section.querySelectorAll(':is(h1, h2)').length,
      ),
    )

    expect(headingCounts.length).toBeGreaterThan(0)
    expect(headingCounts).toEqual(headingCounts.map(() => 1))
  })

  test(`the rail on ${route} leads with the route itself`, async ({ page }) => {
    await page.goto(route)

    // The rail is shown from first paint here, and the opening section's own
    // id is the top row in navItems, so a route with no lead row would leave
    // the rail naming nothing for the whole opening screen: no active class
    // rather than a wrong one, since the loop in section-nav.astro's
    // computeActive only lights a row once some section's top clears the
    // anchor.
    const active = page.locator('.section-nav-link[data-active="true"]')
    await expect(active).toHaveCount(1)
    await expect(active).toHaveAttribute('data-target', route.slice(1))
  })

  test(`a section heading on ${route} outsizes the prose under it`, async ({
    page,
  }) => {
    await page.goto(route)

    const sizes = await page.evaluate(() => {
      const heading = document.querySelector('main section[id] h2')
      // Read from inside the heading's own section. Taken across the document
      // these two now land in different ones, since the opening section leads
      // and carries no `h2`, so the comparison would be against its eyebrow.
      const body = heading?.closest('section')?.querySelector('p')
      if (!heading || !body) return { heading: 0, body: 0 }
      return {
        heading: parseFloat(getComputedStyle(heading).fontSize),
        body: parseFloat(getComputedStyle(body).fontSize),
      }
    })

    expect(sizes.heading).toBeGreaterThan(sizes.body)
  })
}

test('the aitk case study renders its claim and sections', async ({ page }) => {
  await page.goto('/aitk')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('aitk')
  await expect(page.locator('main')).toContainText(
    'installs one set of agent rules, skills, and standards into every project',
  )
  await expect(page.locator('main section[id]')).toHaveCount(6)
})

test('the aitk case study names the scoped package', async ({ page }) => {
  await page.goto('/aitk')

  await expect(page.locator('main')).toContainText('@erclx/aitk')
})

test('the diction case study renders its claim and sections', async ({
  page,
}) => {
  await page.goto('/diction')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('diction')
  await expect(page.locator('main')).toContainText(
    'scores each sound against what a native speaker actually sounds like',
  )
  await expect(page.locator('main section[id]')).toHaveCount(6)
})

test('the diction case study states the offline claim', async ({ page }) => {
  await page.goto('/diction')

  await expect(page.locator('main')).toContainText(
    'Nothing leaves the machine it runs on',
  )
})

test('every diction figure loads its image', async ({ page }) => {
  await page.goto('/diction')
  await scrollThroughPage(page)

  await expect
    .poll(() => loadedImageCount(page, FIGURE_SELECTOR))
    .toBe(DICTION_FIGURE_COUNT)
})

test('every diction gallery screenshot loads its image', async ({ page }) => {
  await page.goto('/diction')

  await expect
    .poll(() => loadedImageCount(page, DICTION_GALLERY_SELECTOR))
    .toBe(DICTION_GALLERY_COUNT)
})

test('clicking a peeking screenshot centers it', async ({ page }) => {
  await page.goto('/diction')

  const slides = page.locator('[data-screenshot-gallery] [data-peek-slide]')
  // Dispatched rather than clicked, because Playwright scrolls a target into
  // view before clicking it and that scroll centers the slide, which makes it
  // the active one before the click lands. The click then reads as a click on
  // the centered slide and opens the preview instead of advancing, which is
  // the driver's scroll changing the state under the assertion rather than a
  // defect in what a reader's own click does.
  await slides.nth(1).dispatchEvent('click')

  await expect(slides.nth(1)).toHaveAttribute('data-active', '')
  await expect(page.locator('[data-gallery-preview]')).toBeHidden()
})

test('clicking the centered screenshot opens the preview on the same image', async ({
  page,
}) => {
  await page.goto('/diction')

  await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .first()
    .click()

  const dialog = page.locator('[data-gallery-preview]')
  await expect(dialog).toBeVisible()
  await expect(page.locator('[data-gallery-preview-position]')).toHaveText(
    `1 / ${DICTION_GALLERY_COUNT}`,
  )
  await expect(dialog.locator('[data-peek-slide]')).toHaveCount(
    DICTION_GALLERY_COUNT,
  )
  await expect(
    dialog.locator('[data-peek-slide][data-active]'),
  ).toHaveAttribute('data-peek-index', '0')
})

test('stepping inside the preview carries back to the inline gallery', async ({
  page,
}) => {
  await page.goto('/diction')

  await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .first()
    .click()
  const dialog = page.locator('[data-gallery-preview]')
  await expect(dialog).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-gallery-preview-position]')).toHaveText(
    `2 / ${DICTION_GALLERY_COUNT}`,
  )

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await expect(
    page.locator('[data-screenshot-gallery] [data-peek-slide][data-active]'),
  ).toHaveAttribute('data-peek-index', '1')
})

/**
 * How far the centered slide sits from the middle of its own scroller, which
 * is the reading that catches an end slide the scroll cannot reach. Both
 * mounts are measured the same way, so `scope` is the only thing that varies.
 */
async function offCenterBy(page: Page, scope: string): Promise<number> {
  return page.evaluate((root) => {
    const mount = document.querySelector<HTMLElement>(root)
    const scroller = mount?.querySelector<HTMLElement>('[data-peek-scroller]')
    const active = mount?.querySelector<HTMLElement>(
      '[data-peek-slide][data-active]',
    )
    if (!scroller || !active) return Number.NaN
    const scrollerRect = scroller.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()
    return Math.abs(
      activeRect.left +
        activeRect.width / 2 -
        (scrollerRect.left + scrollerRect.width / 2),
    )
  }, scope)
}

test('every screenshot centers when it is stepped to, including the last', async ({
  page,
}) => {
  await page.goto('/diction')
  const slides = page.locator('[data-screenshot-gallery] [data-peek-slide]')
  const dots = page.locator('[data-screenshot-gallery] [data-gallery-dot]')
  const offsets: number[] = []

  for (let at = 0; at < DICTION_GALLERY_COUNT; at += 1) {
    // Stepped by dot rather than by clicking the slide, since a dot always
    // navigates where a click on the centered slide opens the preview.
    if (at > 0) await dots.nth(at).click()
    await expect(slides.nth(at)).toHaveAttribute('data-active', '')
    // The scroll is animated, so the reading settles rather than being taken
    // once after a pause.
    await expect
      .poll(() => offCenterBy(page, '[data-screenshot-gallery]'))
      .toBeLessThan(2)
    offsets.push(await offCenterBy(page, '[data-screenshot-gallery]'))
  }

  expect(offsets).toHaveLength(DICTION_GALLERY_COUNT)
})

test('stepping back from the last screenshot moves the active row', async ({
  page,
}) => {
  await page.goto('/diction')
  const dots = page.locator('[data-screenshot-gallery] [data-gallery-dot]')

  await dots.nth(DICTION_GALLERY_COUNT - 1).click()
  await expect(dots.nth(DICTION_GALLERY_COUNT - 1)).toHaveAttribute(
    'data-active',
    '',
  )
  await expect(
    page.locator('[data-screenshot-gallery] [data-gallery-next]'),
  ).toBeDisabled()

  await page.locator('[data-screenshot-gallery] [data-gallery-prev]').click()

  await expect(dots.nth(DICTION_GALLERY_COUNT - 2)).toHaveAttribute(
    'data-active',
    '',
  )
  await expect(dots.nth(DICTION_GALLERY_COUNT - 1)).not.toHaveAttribute(
    'data-active',
    '',
  )
})

test('only the centered screenshot is in the tab sequence', async ({
  page,
}) => {
  await page.goto('/diction')
  const dots = page.locator('[data-screenshot-gallery] [data-gallery-dot]')

  await dots.nth(2).click()
  await expect(
    page.locator('[data-screenshot-gallery] [data-peek-slide][data-active]'),
  ).toHaveAttribute('data-peek-index', '2')

  const tabbable = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-screenshot-gallery] [data-peek-slide]',
      ),
    )
      .map((slide, index) => ({ index, tabIndex: slide.tabIndex }))
      .filter((entry) => entry.tabIndex === 0)
      .map((entry) => entry.index),
  )

  expect(tabbable).toEqual([2])
})

test('the focus ring follows the screenshot the reader steps to', async ({
  page,
}) => {
  await page.goto('/diction')
  await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .first()
    .click()
  const dialog = page.locator('[data-gallery-preview]')
  await expect(dialog).toBeVisible()

  // Focus the centered slide the way a keyboard reader reaches it, so the
  // ring is on the track rather than on the dialog's close button.
  await dialog.locator('[data-peek-slide][data-active]').focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('[data-gallery-preview-position]')).toHaveText(
    `2 / ${DICTION_GALLERY_COUNT}`,
  )

  // Left behind, the ring marks the slide the reader has just stepped off
  // while a different one sits centered.
  const focusedIsCentered = await page.evaluate(() => {
    const focused = document.activeElement
    return (
      focused instanceof HTMLElement &&
      focused.matches('[data-peek-slide]') &&
      focused.hasAttribute('data-active')
    )
  })

  expect(focusedIsCentered).toBe(true)
})

test('the focus ring on a screenshot is not clipped by the track', async ({
  page,
}) => {
  await page.goto('/diction')
  const centered = page.locator(
    '[data-screenshot-gallery] [data-peek-slide][data-active]',
  )
  await centered.focus()

  const room = await page.evaluate(() => {
    const scroller = document.querySelector<HTMLElement>(
      '[data-screenshot-gallery] [data-peek-scroller]',
    )
    const slide = document.querySelector<HTMLElement>(
      '[data-screenshot-gallery] [data-peek-slide][data-active]',
    )
    if (!scroller || !slide) return null
    const style = getComputedStyle(slide)
    const scrollerRect = scroller.getBoundingClientRect()
    const slideRect = slide.getBoundingClientRect()
    return {
      outlineStyle: style.outlineStyle,
      // How far the ring is painted outside the slide's own border box.
      reach: parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset),
      above: slideRect.top - scrollerRect.top,
      below: scrollerRect.bottom - slideRect.bottom,
    }
  })

  expect(room).not.toBeNull()
  // Assert the ring is painted before measuring room for it. An unfocused
  // element computes `outline-width: 0px` while `outline-style` is none, so a
  // check that only compared the reach against the headroom read 0 against 0
  // and passed on a slide carrying no ring at all.
  expect(room?.outlineStyle).not.toBe('none')
  expect(room?.reach).toBeGreaterThan(0)

  // The centered slide is the one at risk: it sits at scale(1) and fills the
  // track's height where the peeking slides are held clear by scale(0.94).
  expect(room?.above).toBeGreaterThanOrEqual(room?.reach ?? 0)
  expect(room?.below).toBeGreaterThanOrEqual(room?.reach ?? 0)
})

test('arrow keys step the gallery on the route itself', async ({ page }) => {
  await page.goto('/diction')
  const centered = page.locator(
    '[data-screenshot-gallery] [data-peek-slide][data-active]',
  )
  await centered.focus()

  await page.keyboard.press('ArrowRight')
  await expect(centered).toHaveAttribute('data-peek-index', '1')

  await page.keyboard.press('ArrowLeft')
  await expect(centered).toHaveAttribute('data-peek-index', '0')
})

test('arrow keys still step after an arrow control disables itself', async ({
  page,
}) => {
  await page.goto('/diction')
  const centered = page.locator(
    '[data-screenshot-gallery] [data-peek-slide][data-active]',
  )

  // Click the control with a pointer, so focus lands on the arrow rather than
  // on the track, which is the path a reader takes and the one that breaks.
  await page.locator('[data-screenshot-gallery] [data-gallery-next]').click()
  await expect(centered).toHaveAttribute('data-peek-index', '1')

  for (let step = 3; step <= DICTION_GALLERY_COUNT; step += 1) {
    await page.keyboard.press('ArrowRight')
    await expect(centered).toHaveAttribute('data-peek-index', String(step - 1))
  }

  // Reaching the end disables the next arrow, and a browser blurs an element
  // as it becomes disabled, which dropped focus to the body and left every
  // later press doing nothing.
  await expect(
    page.locator('[data-screenshot-gallery] [data-gallery-next]'),
  ).toBeDisabled()

  await page.keyboard.press('ArrowLeft')
  await expect(centered).toHaveAttribute('data-peek-index', '3')
})

test('the preview opens focused on the screenshot rather than on close', async ({
  page,
}) => {
  await page.goto('/diction')
  await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .first()
    .click()
  await expect(page.locator('[data-gallery-preview]')).toBeVisible()

  // `showModal` focuses the first focusable descendant, which is the close
  // button, so the first arrow press ringed the close control while the
  // carousel moved under it.
  const focusedIsSlide = await page.evaluate(
    () =>
      document.activeElement instanceof HTMLElement &&
      document.activeElement.matches('[data-peek-slide]'),
  )

  expect(focusedIsSlide).toBe(true)
})

test('each screenshot names what it shows, not only its position', async ({
  page,
}) => {
  await page.goto('/diction')

  const names = await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label') ?? ''),
    )
  const alts = await page
    .locator('[data-screenshot-gallery] [data-peek-slide] img')
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLImageElement).alt))

  expect(names).toHaveLength(DICTION_GALLERY_COUNT)
  // An `aria-label` on a button replaces its contents for the accessible
  // name, so a label carrying the position alone leaves a screen reader five
  // slides that differ by a number and discards every alt on the page.
  expect(alts.every((alt) => alt.length > 0)).toBe(true)
  expect(names.every((name, at) => name.includes(alts[at] ?? ' '))).toBe(true)
})

test('only the mount that answers a click promises one', async ({ page }) => {
  await page.goto('/diction')
  await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .first()
    .click()
  await expect(page.locator('[data-gallery-preview]')).toBeVisible()

  const cursors = await page.evaluate(() => {
    const read = (scope: string): string | null => {
      const slide = document.querySelector<HTMLElement>(
        `${scope} [data-peek-slide][data-active]`,
      )
      return slide ? getComputedStyle(slide).cursor : null
    }
    return {
      inline: read('[data-screenshot-gallery]'),
      preview: read('[data-gallery-preview]'),
    }
  })

  // The inline mount opens the preview on a click here. The preview passes no
  // `onCenterClick`, so the same click does nothing and must not offer to.
  expect(cursors.inline).toBe('zoom-in')
  expect(cursors.preview).not.toBe('zoom-in')
})

test('the preview holds one panel size across its screenshots', async ({
  page,
}) => {
  await page.goto('/diction')
  await page
    .locator('[data-screenshot-gallery] [data-peek-slide]')
    .first()
    .click()
  const dialog = page.locator('[data-gallery-preview]')
  await expect(dialog).toBeVisible()

  const widths: number[] = []
  for (let at = 0; at < DICTION_GALLERY_COUNT; at += 1) {
    if (at > 0) {
      await page.keyboard.press('ArrowRight')
      await expect(page.locator('[data-gallery-preview-position]')).toHaveText(
        `${at + 1} / ${DICTION_GALLERY_COUNT}`,
      )
    }
    await expect
      .poll(() => offCenterBy(page, '[data-gallery-preview]'))
      .toBeLessThan(2)
    widths.push(Math.round((await dialog.boundingBox())?.width ?? 0))
  }

  // A panel sized to its content takes its width from whichever slide is
  // centered, and the five captures differ in height, so stepping resized the
  // dialog under the reader: 958px on the first against 720px on the last.
  expect(new Set(widths).size).toBe(1)
})

test('the project cards link to both case studies', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects a[href="/aitk"]').first()).toBeVisible()
  await expect(
    page.locator('#projects a[href="/diction"]').first(),
  ).toBeVisible()
})

test('a diction figure opens to a larger view', async ({ page }) => {
  await page.goto('/diction')

  await page.locator('[data-figure-zoom]').first().click()

  await expect(page.locator('[data-figure-dialog]')).toBeVisible()
})

test('an open figure closes on Escape without leaving the page', async ({
  page,
}) => {
  await page.goto('/diction')
  await page.locator('[data-figure-zoom]').first().click()

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-figure-dialog]')).toBeHidden()
})

test('the page behind an open figure does not scroll', async ({ page }) => {
  await page.goto('/diction')
  await page.locator('[data-figure-zoom]').first().click()
  const resting = await page.evaluate(() => window.scrollY)

  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(300)

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(resting)
})

test('every opened figure fits without scrolling inside the dialog', async ({
  page,
}) => {
  await page.goto('/diction')
  const triggers = page.locator('[data-figure-zoom]')
  const overflowing: string[] = []

  for (let index = 0; index < (await triggers.count()); index += 1) {
    await triggers.nth(index).click()
    const scrolls = await page
      .locator('[data-figure-scroll]')
      .evaluate((el) => el.scrollHeight > el.clientHeight + 2)
    if (scrolls) overflowing.push(`figure ${index + 1}`)
    await page.keyboard.press('Escape')
  }

  expect(overflowing).toEqual([])
})

test('closing a figure returns focus to the figure that opened it', async ({
  page,
}) => {
  await page.goto('/diction')
  const trigger = page.locator('[data-figure-zoom]').first()
  await trigger.click()

  await page.keyboard.press('Escape')

  await expect(trigger).toBeFocused()
})

test('each case study carries one way home in the bar and one at the foot', async ({
  page,
}) => {
  await page.goto('/diction')

  // One persistent and one closing, rather than two of the same. The bar
  // answers at any scroll position and the foot answers when the read is over,
  // so a third would be the one that makes them read as repetition.
  await expect(page.locator('header a[data-way-home]')).toHaveCount(1)
  await expect(page.locator('footer a[data-way-home]')).toHaveCount(1)
  await expect(page.locator('a[data-way-home]')).toHaveCount(2)
})

test('a route brings its chrome in with its prose rather than ahead of it', async ({
  page,
}) => {
  // Sampled from first paint, because the defect is a surface already placed
  // while everything around it arrives, and a settled read cannot see it. An
  // opacity strictly between 0 and 1 is proof of a fade; a placed surface never
  // holds one.
  await page.addInitScript(() => {
    const seen: Record<string, number[]> = {}
    const start = performance.now()
    const TRACKED = [
      ['rail', '[data-section-nav]'],
      ['bar', '[data-bar-row]'],
      ['prose', 'main [data-fade]'],
    ] as const
    // Sampled until every tracked surface has settled rather than for a fixed
    // span. A window measured from this script's own start expired before the
    // page had loaded on webkit under the full suite, so the fade ran after
    // sampling stopped and all three reported as placed. The cap is a backstop
    // against a surface that never settles, not the measurement.
    const settled = () =>
      TRACKED.every(([key]) => {
        const values = seen[key]
        return values && values.length > 2 && values.at(-1) === 1
      })
    const read = () => {
      if (performance.now() - start > 8000) return
      for (const [key, selector] of TRACKED) {
        const element = document.querySelector(selector)
        if (element) {
          ;(seen[key] ??= []).push(Number(getComputedStyle(element).opacity))
        }
      }
      if (settled()) {
        ;(window as unknown as { __settled: boolean }).__settled = true
        return
      }
      requestAnimationFrame(read)
    }
    requestAnimationFrame(read)
    ;(window as unknown as { __arrival: typeof seen }).__arrival = seen
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/jobtriage', { waitUntil: 'load' })
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as unknown as { __settled?: boolean }).__settled === true,
        ),
      { timeout: 10_000 },
    )
    .toBe(true)

  const arrival = await page.evaluate(() => {
    const seen = (window as unknown as { __arrival: Record<string, number[]> })
      .__arrival
    // Read the first sample and the last rather than hunting a mid-transition
    // frame. The rail's fade runs 300ms against the prose's 700, so a loaded
    // engine steps over it and reports a surface that faded as one that was
    // placed. Starting hidden and ending shown is the claim, and the init
    // script runs before paint, so one early sample settles it.
    return Object.fromEntries(
      Object.entries(seen).map(([key, values]) => [
        key,
        { start: values[0], end: values.at(-1) },
      ]),
    )
  })

  expect(arrival).toEqual({
    rail: { start: 0, end: 1 },
    bar: { start: 0, end: 1 },
    prose: { start: 0, end: 1 },
  })
})

test('the rail places its first row rather than sliding it into place', async ({
  page,
}) => {
  // A route marks a row active on the first frame, so the step's easing sent it
  // traveling out of the column on load. That easing is for a handover between
  // two rows, and an arrival is not one.
  await page.addInitScript(() => {
    const steps: number[] = []
    const start = performance.now()
    // The clock runs from the row appearing rather than from this script. Timed
    // from the script, a loaded engine spent the window waiting for the page
    // and sampled once, failing a non-emptiness floor for a reason that has
    // nothing to do with the step. The span past first sight covers the 260ms a
    // slide would take.
    let firstSeen: number | null = null
    const read = () => {
      if (performance.now() - start > 8000) return
      const active = document.querySelector(
        '.section-nav-link[data-active="true"]',
      )
      if (active) {
        firstSeen ??= performance.now()
        steps.push(new DOMMatrix(getComputedStyle(active).transform).m41)
        // Gated on how many samples were taken rather than how long was spent
        // taking them. A 500ms window returned 3 frames on a loaded engine
        // running near 6fps, so any floor over the sample count was really a
        // floor on the frame rate. Eight frames span 133ms at 60fps, inside the
        // 260ms a slide would take, and longer than it on anything slower.
        if (steps.length >= 8) {
          ;(window as unknown as { __stepsDone: boolean }).__stepsDone = true
          return
        }
      }
      requestAnimationFrame(read)
    }
    requestAnimationFrame(read)
    ;(window as unknown as { __steps: number[] }).__steps = steps
  })

  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/jobtriage', { waitUntil: 'load' })
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as unknown as { __stepsDone?: boolean }).__stepsDone ===
            true,
        ),
      { timeout: 10_000 },
    )
    .toBe(true)

  const steps = await page.evaluate(
    () => (window as unknown as { __steps: number[] }).__steps,
  )

  // The collection above stops at eight, so anything short of that means the
  // cap expired and nothing was really measured. A distinct-value assertion
  // over an empty sample passes hardest when the sample is empty.
  expect(steps.length).toBe(8)
  expect([...new Set(steps.map((step) => Math.round(step)))]).toHaveLength(1)
  expect(Math.round(steps[0])).toBeGreaterThan(0)
})

test('every selector the reveal instrument watches still finds something', async ({
  page,
}) => {
  // One clause read the rail as `li` and the rail renders `a`, so it matched
  // nothing on every run and reported nothing wrong, which is the same output
  // as a rail arriving correctly. This is what makes that state loud.
  await page.setViewportSize({ width: 1440, height: 900 })

  const counts: Record<string, number> = {}
  for (const route of ['/', '/jobtriage']) {
    await page.goto(route)
    const found = await page.evaluate(
      (selectors) =>
        Object.fromEntries(
          selectors.map((selector) => [
            selector,
            document.querySelectorAll(selector).length,
          ]),
        ),
      [...WATCHED_SELECTORS],
    )
    for (const [selector, count] of Object.entries(found)) {
      counts[selector] = (counts[selector] ?? 0) + (count as number)
    }
  }

  const dead = Object.entries(counts)
    .filter(([, count]) => count === 0)
    .map(([selector]) => selector)

  expect(dead, `matched nothing on any surface: ${dead.join(', ')}`).toEqual([])
})

test('each case study links back to the landing page from the top bar', async ({
  page,
}) => {
  await page.goto('/diction')

  await page.getByRole('link', { name: 'Eric Le', exact: true }).click()

  await expect(page).toHaveURL('/')
})

test('a heading reached by a deep link clears the sticky bar on a phone', async ({
  page,
}) => {
  // From md the section's own padding clears the bar. Below md it does not, and
  // this is the width where a shared link is opened.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/diction#fix')
  await page.waitForLoadState('load')
  // The fragment is applied a second time on purpose. The first scroll lands
  // before the media above the section finishes arriving, which then pushes the
  // section down by around 436px at this width. That overshoot is a separate
  // defect and is not what this test measures, so the second application takes
  // it out of the reading rather than leaving it to mask the bar overlap.
  await page.evaluate(() => {
    window.location.hash = ''
    window.location.hash = '#fix'
  })

  const clearance = await page.evaluate(() => {
    const bar = document
      .querySelector('header[data-section="header"]')
      ?.getBoundingClientRect()
    const heading = document
      .querySelector('#fix h2, #fix h3')
      ?.getBoundingClientRect()
    if (!bar || !heading) return Number.NaN
    return heading.top - bar.height
  })

  // The bar's height and the section's scroll margin are derived from the same
  // parts, so the design lands the heading at exactly zero clearance. Any image
  // above the anchor renders at a fractional height and carries that fraction
  // into every offset below it, which makes an exact-fit assertion fail by less
  // than a pixel while nothing is occluded. The tolerance is one pixel because
  // that is the largest error sub-pixel layout can introduce; a real overlap
  // would be the bar's whole height.
  expect(clearance).toBeGreaterThan(-1)
})

test('the route name stays out of the bar while its own title is on screen', async ({
  page,
}) => {
  await page.goto('/diction')

  await expect(page.locator('[data-route-here]')).not.toHaveAttribute(
    'data-shown',
    'true',
  )
})

test('the route name joins the bar once its title scrolls behind it', async ({
  page,
}) => {
  await page.goto('/diction')

  await page.evaluate(() =>
    window.scrollTo({ top: 1200, behavior: 'instant' as ScrollBehavior }),
  )

  await expect(page.locator('[data-route-here]')).toHaveAttribute(
    'data-shown',
    'true',
  )
})

test('returning from a case study restores where the visitor left', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const left = await page.evaluate(() => window.scrollY)
  await page.locator('#projects article').first().click()
  await expect(page).toHaveURL('/aitk')

  // The unwind runs off the foot rather than the bar. `way-home.ts` binds
  // every `[data-way-home]` anchor, so both controls carry it, and the foot is
  // the one a reader reaches by scrolling the route, which is the path it
  // exists for.
  await page.getByRole('link', { name: 'Back to Eric Le' }).click()

  await expect(page).toHaveURL('/')
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(left / 2)
})

test('a case study opened directly still links home from the foot', async ({
  page,
}) => {
  await page.goto('/aitk')

  await page.getByRole('link', { name: 'Back to Eric Le' }).click()

  await expect(page).toHaveURL('/')
})

test('the navigation bar holds one measure across every surface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const widths: number[] = []

  await page.goto('/')
  widths.push((await page.locator('[data-bar-row]').boundingBox())?.width ?? 0)

  for (const route of CASE_STUDY_ROUTES) {
    await page.goto(route)
    widths.push(
      (await page.locator('[data-bar-row]').boundingBox())?.width ?? 0,
    )
  }

  // The bar is the one element that persists across a navigation, so it holds
  // its shape rather than tracking the prose beneath it, which is fluid on a
  // route and varies per section on the landing page.
  expect(Math.min(...widths)).toBeGreaterThan(0)
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2)
})

test('a figure plate holds a light ground in the dark theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')
  const plate = page.locator('main .figure-plate').first()

  const plateColor = await paintedColor(plate, 'backgroundColor')
  const pageColor = await paintedColor(page.locator('body'), 'backgroundColor')

  expect(relativeLuminance(plateColor)).toBeGreaterThan(0.8)
  expect(relativeLuminance(pageColor)).toBeLessThan(0.1)
})

test('a figure caption stays readable on the plate in the dark theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')
  const plate = page.locator('main .figure-plate').first()

  const plateColor = await paintedColor(plate, 'backgroundColor')
  const captionColor = await paintedColor(plate.locator('figcaption'), 'color')

  expect(contrastRatio(plateColor, captionColor)).toBeGreaterThan(4.5)
})

test('a focused figure keeps its ring legible on the plate in the dark theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')
  const plate = page.locator('main .figure-plate').first()
  const trigger = plate.locator('[data-figure-zoom]')
  await trigger.focus()

  const plateColor = await paintedColor(plate, 'backgroundColor')
  const ringColor = await paintedColor(trigger, 'outlineColor')
  // outlineColor resolves whether or not a ring paints, so the style is what
  // separates a visible ring from a color nobody sees.
  const ringStyle = await trigger.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  )

  expect(ringStyle).not.toBe('none')
  expect(contrastRatio(plateColor, ringColor)).toBeGreaterThan(3)
})

test('a figure built from type keeps the plate the page uses', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')

  const tableColor = await paintedColor(
    page.locator('main figure:has(table)').first(),
    'backgroundColor',
  )

  expect(relativeLuminance(tableColor)).toBeLessThan(0.1)
})

// The three tests above assert the plate clears a threshold, which catches a
// plate that stopped being light and never catches one that stopped matching
// the palette it borrows from. This asserts the equality instead.
test('a figure plate tracks the light palette rather than a copy of it', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')

  const plate = page.locator('main .figure-plate').first()
  const source = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    return {
      card: root.getPropertyValue('--light-card').trim(),
      mutedForeground: root.getPropertyValue('--light-muted-foreground').trim(),
      ring: root.getPropertyValue('--light-ring').trim(),
    }
  })
  const resolved = await plate.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      card: style.getPropertyValue('--card').trim(),
      mutedForeground: style.getPropertyValue('--muted-foreground').trim(),
      ring: style.getPropertyValue('--ring').trim(),
    }
  })

  expect(resolved).toEqual(source)
})

test('a section opener on a case study reads above body copy', async ({
  page,
}) => {
  await page.goto('/diction')

  // The section marker is a heading rather than a paragraph, so the lead is the
  // first paragraph in the section and the body copy follows it.
  const opener = page.locator('#problem p').nth(0)
  const body = page.locator('#problem p').nth(1)

  const openerSize = await opener.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  )
  const bodySize = await body.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  )

  expect(openerSize).toBeGreaterThan(bodySize)
})

test('the jobtriage canvas clip plays while it is hovered', async ({
  page,
}) => {
  await page.goto('/jobtriage')

  const clip = page.locator('[data-media-host] video[data-media-video]')
  await expect(clip).toHaveCount(1)

  await expect
    .poll(() => clip.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(true)

  await clip.hover()

  await expect
    .poll(() => clip.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(false)
})

test('the jobtriage clip posters an optimized derivative', async ({ page }) => {
  await page.goto('/jobtriage')

  const poster = await page
    .locator('video[data-media-video]')
    .getAttribute('poster')

  expect(poster).toMatch(/\.webp$/)
})

test('a route reveals its prose as the reader arrives at it', async ({
  page,
}) => {
  await page.goto('/diction')

  // Below the fold on arrival, so an unrevealed one has not been reached yet
  // rather than having failed to reveal.
  const last = page.locator('main [data-fade]').last()
  await expect(last).not.toHaveAttribute('data-visible', 'true')

  await scrollThroughPage(page)

  await expect(last).toHaveAttribute('data-visible', 'true')
})

test('a route with no intersection observer still renders its prose', async ({
  browser,
}) => {
  const context = await browser.newContext()
  // The stylesheet hides a marked element whenever scripting is on, so an
  // engine with no observer would hold the whole route hidden. Reduced motion
  // and a failed script escape through the media query and the `data-js` gate,
  // and this is the third case and the only one the module has to answer.
  await context.addInitScript(() => {
    // @ts-expect-error removing a platform global is what this exercises
    delete window.IntersectionObserver
  })
  const page = await context.newPage()

  await page.goto('/diction')

  // Polled rather than read once. The fallback marks every element arrived and
  // the stylesheet then fades it in over 700ms, so a single read taken on load
  // catches most of them at an opacity of exactly zero and reports the repair
  // as the defect it fixes.
  await expect
    .poll(() =>
      page
        .locator('main [data-fade]')
        .evaluateAll(
          (nodes) =>
            nodes.filter((node) => getComputedStyle(node).opacity === '0')
              .length,
        ),
    )
    .toBe(0)

  await context.close()
})

// Past the opening screen, where the bar's name has arrived. The routes run
// thousands of pixels, so this only has to clear the heading.
const INTO_THE_PROSE_PX = 2000

const scrollIntoTheProse = async (page: Page) => {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior }),
    INTO_THE_PROSE_PX,
  )
  await expect(page.locator('[data-route-here]')).toHaveAttribute(
    'data-shown',
    'true',
  )
}

for (const route of CASE_STUDY_ROUTES) {
  test(`the bar names ${route} at the bar's own centre`, async ({ page }) => {
    await page.goto(route)
    await scrollIntoTheProse(page)

    // Read against the row rather than against the gap between the two
    // controls, because those are different boxes and only the first is the
    // one an eye reads a bar's centre from. Equal gaps are what the retired
    // `justify-between` already produced while the name sat 17.5px right of
    // here, so a guard on the gaps passes against the defect.
    const offset = await page.evaluate(() => {
      const row = document.querySelector('[data-bar-row]')
      const here = document.querySelector('[data-route-here]')
      if (!row || !here) throw new Error('the bar row or its name is missing')
      const rowBox = row.getBoundingClientRect()
      const hereBox = here.getBoundingClientRect()
      return hereBox.left + hereBox.width / 2 - (rowBox.left + rowBox.width / 2)
    })

    // Subpixel, since the middle column is sized to the name's own text and a
    // fractional advance splits either side of centre.
    expect(Math.abs(offset)).toBeLessThan(1)
  })

  test(`the bar's name for ${route} says what it does`, async ({ page }) => {
    await page.goto(route)
    await scrollIntoTheProse(page)

    // A button reading only the route name states where the reader is and not
    // what pressing it does, and an accessible name that drops the visible one
    // leaves a voice reader naming a control the page does not show.
    const here = page.getByRole('button', { name: /back to top of/i })
    await expect(here).toHaveCount(1)
    await expect(here).toHaveAccessibleName(
      new RegExp(`back to top of ${(await here.innerText()).trim()}`, 'i'),
    )
  })
}

test('the bar name returns a reader to the top of the route', async ({
  page,
}) => {
  await page.goto('/diction#problem')
  await scrollIntoTheProse(page)

  await page.locator('[data-route-here]').click()

  // Polled rather than read once: the root's own `scroll-behavior` glides
  // this, so a read taken on the click catches the page in transit.
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  // The rail row that left this fragment names a section the reader has left,
  // and this control scrolls rather than navigates, so nothing else clears it.
  expect(await page.evaluate(() => window.location.hash)).toBe('')
})

test('the bar name is out of reach while the route heading is on screen', async ({
  page,
}) => {
  await page.goto('/diction')
  const here = page.locator('[data-route-here]')

  // Opacity hides a control from the eye and from nothing else, so without
  // this the name was a 44px target and a tab stop across the whole opening
  // screen while painting nothing.
  await expect(here).toHaveAttribute('inert', '')

  await scrollIntoTheProse(page)
  await expect(here).not.toHaveAttribute('inert', '')
})
