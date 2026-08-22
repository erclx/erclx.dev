import { expect, type Page, test } from '@playwright/test'

import { REVEAL_THRESHOLD } from '../src/lib/reveal'
import { loadedImageCount, scrollThroughPage } from './lazy-images'

// One per beat. The three counts below read the same number on purpose, so a
// beat that renders a head with no marker, or a marker with no row, is caught
// rather than passing as a smaller list.
const EXPERIENCE_ENTRY_COUNT = 6
const PORTRAIT_SELECTOR = 'header [data-portrait]'
// The reveal script fits whatever arrives together into one 400ms window, so a
// surviving authored delay is the regression this bound catches.
const MAX_REVEAL_DELAY_SECONDS = 0.5

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})

test('the level-one heading names the person', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eric Le')
})

test('the header states no claim, leaving the stage to the concept layer', async ({
  page,
}) => {
  await page.goto('/')
  const header = page.locator('header')

  await expect(header).toContainText('Welcome to my corner of the internet')
  await expect(header).not.toContainText('the layer between a language model')
  await expect(header).not.toContainText('In practice that means agents')
})

test('the location sits in the closing ask rather than the header', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('header')).not.toContainText('Gothenburg')
  await expect(page.locator('#looking-for')).toContainText('Gothenburg')
})

test('the experience section keeps the claim beside the prose depending on it', async ({
  page,
}) => {
  await page.goto('/')
  const experience = page.locator('#experience')

  await expect(experience).toContainText(
    'the layer between a language model and the job it has to do',
  )
  await expect(experience).toContainText('In practice that means agents')
  await expect(experience).toContainText('I spend most of my working day')
})

test('the rail tracks every section the page stacks', async ({ page }) => {
  await page.goto('/')

  const labels = await page.locator('[data-section-nav] a').allTextContents()

  expect(labels.map((label) => label.trim())).toEqual([
    'About me',
    'Experience',
    'Projects',
    'Looking for',
  ])
})

test('the rail cascades to looking-for and stays visible to the document end', async ({
  page,
}) => {
  // looking-for and the footer together barely clear one viewport at 1920,
  // so this is the height where a rail that stood down near the footer
  // would have the least room to do it gracefully.
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')
  const rail = page.locator('[data-section-nav]')

  const target = await page.evaluate(() => {
    const lookingFor = document.getElementById('looking-for')
    const top = (lookingFor?.getBoundingClientRect().top ?? 0) + window.scrollY
    // 0.3 mirrors ANCHOR_RATIO in section-nav.astro's scroll handler. Landing
    // 100px past the crossing puts looking-for well inside the active zone
    // without landing at the document's own end.
    const anchor = window.innerHeight * 0.3
    return top - anchor + 100
  })
  await page.evaluate((y) => window.scrollTo(0, y), target)

  await expect(
    page.locator('.section-nav-link[data-active="true"]'),
  ).toHaveText('Looking for')
  await expect(rail).toHaveCSS('opacity', '1')

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  )
  await expect(
    page.locator('.section-nav-link[data-active="true"]'),
  ).toHaveText('Looking for')
  await expect(rail).toHaveCSS('opacity', '1')
})

test('every rail label reads as its own heading rather than an anchor id', async ({
  page,
}) => {
  await page.goto('/')

  const headings = await page
    .locator('[data-section-nav] a')
    .evaluateAll((links) =>
      links.map((link) => {
        const id = link.getAttribute('href')?.slice(1) ?? ''
        return {
          label: link.textContent?.trim() ?? '',
          heading:
            document.querySelector(`#${id} h2`)?.textContent?.trim() ?? '',
        }
      }),
    )

  expect(headings).toEqual(
    headings.map((entry) => ({ ...entry, label: entry.heading })),
  )
})

test('the about surface reads as personal rather than professional', async ({
  page,
}) => {
  await page.goto('/')
  const about = page.locator('[data-section="about"]')

  await expect(about).toContainText('I was born in Vietnam')
  await expect(about).toContainText('I have played guitar since I was twelve')
  await expect(about).not.toContainText('agents')
  await expect(about).not.toContainText('Volvo')
})

test('the about surface sits between the header and the experience timeline', async ({
  page,
}) => {
  await page.goto('/')

  const order = await page.evaluate(() =>
    [...document.querySelectorAll('[data-section]')].map(
      (el) => (el as HTMLElement).dataset.section,
    ),
  )

  expect(order.indexOf('about')).toBeGreaterThan(order.indexOf('header'))
  expect(order.indexOf('about')).toBeLessThan(order.indexOf('experience'))
})

test('the about flight waits off the page until its section arrives', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForTimeout(300)

  const parked = await page.evaluate(() => {
    const craft = document.querySelector('.about-flight-craft')
    const track = document.querySelector('.about-flight-track')
    if (!craft || !track) return null
    const c = craft.getBoundingClientRect()
    const t = track.getBoundingClientRect()
    return {
      // Outside the clipping box, and the box clips. Either alone proves
      // nothing: the aircraft parks off the curve's start rather than off the
      // page, so being elsewhere on the page is not being invisible.
      outside:
        c.right <= t.left ||
        c.left >= t.right ||
        c.bottom <= t.top ||
        c.top >= t.bottom,
      clips: getComputedStyle(track).overflow,
      // A figure that begins outside its column must not lengthen the
      // document, which is what that clipping is also there to prevent.
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    }
  })

  expect(parked?.outside).toBe(true)
  expect(parked?.clips).toBe('hidden')
  expect(parked?.overflow).toBeLessThanOrEqual(0)
})

test('the about figure is there for a reader who arrives from the rail', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  // A rail jump pins the section's top under the sticky bar, so the approach
  // cannot run in clear air. Scrolling on only carries the band further up and
  // out, so waiting for clear air means waiting forever.
  await page.evaluate(() => document.querySelector('#about')?.scrollIntoView())
  await page.waitForTimeout(600)

  const state = await page.evaluate(() => {
    const band = document.querySelector<HTMLElement>('.about-flight')
    const craft = document.querySelector('.about-flight-craft')
    const track = document.querySelector('.about-flight-track')
    if (!band || !craft || !track) return null
    const c = craft.getBoundingClientRect()
    const t = track.getBoundingClientRect()
    return {
      flight: band.dataset.flight ?? 'unset',
      painted: c.right > t.left && c.left < t.right && c.bottom > t.top,
    }
  })

  expect(state?.flight).toBe('settled')
  expect(state?.painted).toBe(true)
})

test('the about flight renders nothing when motion is not wanted', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await expect(page.locator('.about-flight')).toBeHidden()
})

test('the header portrait loads its image', async ({ page }) => {
  await page.goto('/')

  await expect.poll(() => loadedImageCount(page, PORTRAIT_SELECTOR)).toBe(1)
})

test('the header portrait stays inside the content column', async ({
  page,
}) => {
  await page.goto('/')

  const overflow = await page.evaluate(() => {
    const column = document
      .querySelector('[data-header-column]')
      ?.getBoundingClientRect()
    const portrait = document
      .querySelector('[data-portrait]')
      ?.getBoundingClientRect()
    if (!column || !portrait) return Number.NaN
    return Math.round(portrait.right - column.right)
  })

  expect(overflow).toBeLessThanOrEqual(0)
})

test('the theme toggle rests clear of the portrait it would otherwise sit on', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  // The toggle is positioned from a measurement taken after load, so the
  // assertion waits for that rather than racing it.
  await page.waitForSelector('[data-toggle-host][data-ready]')

  const overlap = await page.evaluate(() => {
    // The toggle is promoted out of the header into a fixed host so one
    // control serves the hero and the bar, so it is found by its own hook
    // rather than by where it happens to sit.
    const toggle = document
      .querySelector('[data-theme-toggle]')
      ?.getBoundingClientRect()
    const portrait = document
      .querySelector('[data-portrait]')
      ?.getBoundingClientRect()
    if (!toggle || !portrait) return Number.NaN
    const across =
      Math.min(toggle.right, portrait.right) -
      Math.max(toggle.left, portrait.left)
    const down =
      Math.min(toggle.bottom, portrait.bottom) -
      Math.max(toggle.top, portrait.top)
    return Math.max(0, across) * Math.max(0, down)
  })

  // The portrait floats flush to the column's right edge for 160px from the
  // heading's top, so every row under the name has its right side taken. A
  // toggle placed on one of those rows renders on top of the photograph.
  expect(overlap).toBe(0)
})

// Short enough that the hero does not fill half of it, which is the case a
// viewport-keyed gate cleared without being scrolled.
const SHORT_HERO_VIEWPORT = { width: 390, height: 844 }

test('the bar stays out of reach while the hero still carries the name', async ({
  page,
}) => {
  await page.setViewportSize(SHORT_HERO_VIEWPORT)
  await page.goto('/')
  await page.waitForSelector('[data-toggle-host][data-ready]')

  await expect(page.locator('[data-site-bar]')).toHaveAttribute('inert', '')
})

test('the bar arrives once the reader has scrolled past the hero', async ({
  page,
}) => {
  await page.setViewportSize(SHORT_HERO_VIEWPORT)
  await page.goto('/')
  await page.waitForSelector('[data-toggle-host][data-ready]')

  await page.evaluate(() =>
    window.scrollTo({ top: 2000, behavior: 'instant' as ScrollBehavior }),
  )

  await expect(page.locator('[data-site-bar]')).toHaveAttribute(
    'data-revealed',
    'true',
  )
})

test('the bar stays shut while the controls are still unplaced', async ({
  page,
}) => {
  // Holding a subresource keeps the placement wait open, which is the window a
  // reader can scroll through. Nothing has been measured yet there, so the
  // landing distance defaults to 1 and any scroll would read as landed.
  await page.route('**/*.webp', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    await route.continue()
  })
  await page.goto('/', { waitUntil: 'commit' })
  await page.waitForTimeout(250)

  // Short of the nearest landing, which is the toggle's. Its home is the
  // header's corner, tens of pixels above the bar's slot, so a scroll chosen
  // against the name's travel would sit past a real landing and assert the
  // bar shut when it is meant to be open. Anything above the unplaced default
  // of 1 still catches a placement guard that stops running.
  await page.evaluate(() =>
    window.scrollTo({ top: 20, behavior: 'instant' as ScrollBehavior }),
  )

  await expect(page.locator('[data-site-bar]')).not.toHaveAttribute(
    'data-revealed',
    'true',
  )
})

test('the bar is behind the controls by the time they land in it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await page.waitForSelector('[data-toggle-host][data-ready]')

  // Past the name's travel, which is the one distance both controls key to.
  // Landing ahead of the bar left both controls over page content with nothing
  // behind them, which the two gates above and below this band never covered.
  await page.evaluate(() =>
    window.scrollTo({ top: 420, behavior: 'instant' as ScrollBehavior }),
  )

  // The position is painted on the next frame, so the landing is polled rather
  // than read straight after the scroll.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.querySelector('[data-theme-toggle]')?.getBoundingClientRect()
            .top ?? Number.NaN,
      ),
    )
    .toBeLessThan(40)

  await expect(page.locator('[data-site-bar]')).toHaveAttribute(
    'data-revealed',
    'true',
  )
})

test('the one promoted toggle still cycles the theme', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-toggle-host][data-ready]')
  const mode = () =>
    page.evaluate(() => document.documentElement.dataset.themeMode)

  const before = await mode()
  await page.locator('[data-theme-toggle]').click()

  expect(await mode()).not.toBe(before)
})

test('the name in the bar returns the reader to the top', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('[data-toggle-host][data-ready]')
  await page.evaluate(() =>
    window.scrollTo({ top: 2000, behavior: 'instant' as ScrollBehavior }),
  )
  await expect(page.locator('[data-site-bar]')).toHaveAttribute(
    'data-revealed',
    'true',
  )

  await page.locator('[data-to-top]').click()

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})

test('the availability status sits in the closing ask rather than the header', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('header .status-dot')).toHaveCount(0)
  await expect(page.locator('#looking-for .status-dot')).toHaveCount(1)
  await expect(page.locator('#looking-for')).toContainText('Open to work')
  await expect(page.locator('header')).not.toContainText('Open to work')
})

test('the availability dot centres on the cap height of its own label', async ({
  page,
}) => {
  await page.goto('/')

  const offset = await page.evaluate(() => {
    const slot = document
      .querySelector('#looking-for .status-dot-slot')
      ?.getBoundingClientRect()
    const dot = document
      .querySelector('#looking-for .status-dot')
      ?.getBoundingClientRect()
    if (!slot || !dot) return Number.NaN
    const capCenter = (slot.top + slot.bottom) / 2
    return Math.abs((dot.top + dot.bottom) / 2 - capCenter)
  })

  expect(offset).toBeLessThanOrEqual(1)
})

test('the availability dot renders no pulse halo under reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const halo = await page.evaluate(() => {
    const dot = document.querySelector('#looking-for .status-dot')
    if (!dot) return { content: 'missing', animationName: 'missing' }
    const style = getComputedStyle(dot, '::after')
    return { content: style.content, animationName: style.animationName }
  })

  expect(halo.content).toBe('none')
  expect(halo.animationName).toBe('none')
})

test('the experience section renders one entry per beat', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#experience ol > li')).toHaveCount(
    EXPERIENCE_ENTRY_COUNT,
  )
})

test('every experience entry carries a head and a supporting sentence', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#experience .experience-head')).toHaveCount(
    EXPERIENCE_ENTRY_COUNT,
  )
  await expect(page.locator('#experience .experience-detail')).not.toHaveCount(
    0,
  )
})

test('the beat holding two pieces of work carries a line for each', async ({
  page,
}) => {
  await page.goto('/')
  const volvoBeat = page.locator('#experience ol > li', {
    hasText: 'volvo technology',
  })

  await expect(volvoBeat.locator('.experience-detail')).toHaveCount(2)
})

test('the projects lede reads at the measure the page already holds', async ({
  page,
}) => {
  // Above lg, where the projects column breaks out to 1024 and every other
  // section stays at 768. Below it all four columns agree and the assertion
  // would hold whatever the lede declared.
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const widths = await page.evaluate(() => {
    const read = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) throw new Error(`no element for ${selector}`)
      return Math.round(element.getBoundingClientRect().width)
    }
    return {
      lede: read('#projects .max-w-3xl p'),
      about: read('#about p'),
      // The cards the lede introduces, which it is deliberately not level with:
      // reaching them put the line at 127 characters against the 92 and 93 the
      // sections either side of it run.
      grid: read('#projects .grid'),
    }
  })

  expect(widths.lede).toBe(widths.about)
  expect(widths.lede).toBeLessThan(widths.grid)
})

test('the experience rail marks every entry', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#experience .experience-marker')).toHaveCount(
    EXPERIENCE_ENTRY_COUNT,
  )
})

// The band between a phone and the old breakpoint, where the rail used to be
// switched off outright. 767 is the last width that took the flat stack and 620
// sits inside the range the operator read it at.
//
// 390 is the one that is not in that band, and it covers the tier the change
// actually adds. Below 600 the gutter spans two grid rows instead of one and
// takes its type from the span rather than the head, so the dot meets a
// different line. The other three all land in the middle tier, which shares its
// shape with the widest one.
const NARROW_TIMELINE_WIDTHS = [390, 620, 700, 767]

for (const width of NARROW_TIMELINE_WIDTHS) {
  test(`the timeline keeps its rail at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    // Painted rather than present. The markers stay in the DOM at every width,
    // so the count assertion above passed throughout the band this covers,
    // against a gutter the stylesheet had set to `display: none`.
    const painted = await page.evaluate(() => {
      const markers = [
        ...document.querySelectorAll<HTMLElement>(
          '#experience .experience-marker',
        ),
      ]
      if (markers.length === 0) throw new Error('the timeline draws no markers')
      return markers.filter((marker) => {
        const box = marker.getBoundingClientRect()
        return box.width > 0 && box.height > 0
      }).length
    })

    expect(painted).toBe(EXPERIENCE_ENTRY_COUNT)
  })

  test(`a beat keeps its span out of the reading column at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')

    // The stack put the span at the head's own left edge and at the head's own
    // size, which is what made it read as a line of prose rather than as a
    // date. Either separation answers that, so the assertion takes the two
    // together rather than fixing which one the layout uses.
    const separated = await page.evaluate(() => {
      const row = document.querySelector('#experience .experience-row')
      const date = row?.querySelector<HTMLElement>('.experience-date')
      const head = row?.querySelector<HTMLElement>('.experience-head')
      if (!date || !head) throw new Error('a beat is missing its span or head')
      return {
        indented:
          Math.round(head.getBoundingClientRect().left) >
          Math.round(date.getBoundingClientRect().left),
        smaller:
          parseFloat(getComputedStyle(date).fontSize) <
          parseFloat(getComputedStyle(head).fontSize),
      }
    })

    expect(separated.indented || separated.smaller).toBe(true)
  })
}

test('every beat states its span in its own column', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#experience .experience-date')).toHaveCount(
    EXPERIENCE_ENTRY_COUNT,
  )
  // The span left the head sentence, so a head restating it would put the
  // date on the row twice.
  await expect(
    page.locator('#experience .experience-head').first(),
  ).not.toContainText('2026')
})

test('the internship the record carries is on the timeline', async ({
  page,
}) => {
  await page.goto('/')
  const beat = page.locator('#experience ol > li', {
    hasText: 'bac ha software',
  })

  await expect(beat).toHaveCount(1)
  await expect(beat.locator('.experience-date')).toContainText('2023')
})

test('the experience chips name the cards below them', async ({ page }) => {
  await page.goto('/')

  const trimmed = (labels: string[]) => labels.map((label) => label.trim())
  const chips = trimmed(
    await page.locator('#experience ul a').allTextContents(),
  )
  const cards = trimmed(await page.locator('#projects h3').allTextContents())

  expect(chips).toEqual(cards)
})

test('every experience chip links to a card that exists', async ({ page }) => {
  await page.goto('/')

  const targets = await page
    .locator('#experience ul a')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')),
    )

  const missing = await page.evaluate(
    (selectors) =>
      selectors.filter((selector) => !document.querySelector(selector ?? '')),
    targets,
  )

  expect(missing).toEqual([])
})

test('no revealed surface waits out an authored delay', async ({ page }) => {
  await page.goto('/')
  await scrollThroughPage(page)

  const revealed = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll('[data-fade][data-visible="true"]'),
    )
    const delays = elements.map(
      (element) => parseFloat(getComputedStyle(element).transitionDelay) || 0,
    )
    // Report the count too: Math.max of an empty list is -Infinity, which would
    // pass the bound below while proving the selector matched nothing.
    return { count: elements.length, longestDelay: Math.max(0, ...delays) }
  })

  expect(revealed.count).toBeGreaterThan(0)
  expect(revealed.longestDelay).toBeLessThanOrEqual(MAX_REVEAL_DELAY_SECONDS)
})

test('every revealed element can actually animate its opacity', async ({
  page,
}) => {
  await page.goto('/')

  // `transition` is a shorthand, so a component declaring one on a faded
  // element replaces the reveal's outright, and Astro emits component styles
  // unlayered where the reveal sits in a layer, so the component wins whatever
  // the specificity. The six timeline rows shipped in exactly that state:
  // snapping from 0 to 1 while carrying every marker an inventory reads, which
  // is why nothing caught it until the page was watched frame by frame.
  const readClobbered = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-fade]'))
        .filter(
          (element) =>
            !getComputedStyle(element).transitionProperty.includes('opacity'),
        )
        .map((element) => element.tagName.toLowerCase()),
    )

  expect(await readClobbered()).toEqual([])

  // A route carries its own components and its own utilities, so the landing
  // page passing says nothing about it. The way home there sits under a
  // `transition-colors` utility, which is the same shape of declaration.
  await page.goto('/jobtriage')
  expect(await readClobbered()).toEqual([])
})

test('the footer arrives on a tall viewport, not only a short one', async ({
  page,
}) => {
  // The reveal root is inset from the bottom by a share of the viewport, and
  // content at the document end sits a fixed distance from the page's bottom.
  // Past some height the inset is deeper than that distance, so the footer
  // lands in the excluded band with no scroll left to carry it out. It
  // revealed at 1080 and never at 1200, which is why a check at one height
  // proves nothing.
  for (const height of [800, 1200, 1600]) {
    await page.setViewportSize({ width: 1280, height })
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Settled on what the fade reached rather than on a duration. These rows
    // are a group, so the second waits out a 220ms step before its own 700ms
    // fade, and a fixed pause is a guess at how much of that a loaded runner
    // will have finished. Measured under a 40x processor throttle the colophon
    // read 0.90, 0.78, and 0.00 at the three heights with both rows already
    // carrying `data-visible`, which is the fade caught in flight rather than a
    // reveal that never fired.
    //
    // The assertion is unchanged: every row still has to reach 0.9, and a row
    // that never reveals fails this on the timeout with the same list it
    // reported before.
    //
    // Counted first, because an empty list of hidden rows reads the same
    // whether every row revealed or the footer carries none to reveal, and the
    // second is the state this branch exists to close.
    const rows = await page.evaluate(
      () =>
        document.querySelectorAll('[data-section="footer"] [data-fade]').length,
    )
    expect(rows, `footer rows at ${height}px`).toBeGreaterThan(0)

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Array.from(
              document.querySelectorAll('[data-section="footer"] [data-fade]'),
            )
              .filter(
                (element) => Number(getComputedStyle(element).opacity) < 0.9,
              )
              .map((element) =>
                (element.textContent ?? '').trim().slice(0, 30),
              ),
          ),
        { message: `hidden at ${height}px`, timeout: 10000 },
      )
      .toEqual([])
  }
})

test('a grouped list staggers its rows rather than landing them together', async ({
  page,
}) => {
  await page.goto('/')

  // The batch stagger cannot do this. It orders whatever shares one observer
  // callback, and a reader at reading pace delivers a list one row per
  // callback, where the step multiplies by zero. The group schedules its own.
  const reveal = await page.evaluate(async () => {
    const group = document.querySelector('[data-fade-group]')
    if (!group) return { spread: -1, everMidFade: false }
    const rows = Array.from(group.querySelectorAll('[data-fade]'))
    group.scrollIntoView({ behavior: 'instant', block: 'center' })

    const lit = new Map<Element, number>()
    let everMidFade = false
    const start = performance.now()
    while (performance.now() - start < 2600 && lit.size < rows.length) {
      for (const row of rows) {
        const opacity = Number(getComputedStyle(row).opacity)
        if (opacity > 0.05 && opacity < 0.95) everMidFade = true
        if (!lit.has(row) && opacity > 0.5) {
          lit.set(row, performance.now() - start)
        }
      }
      await new Promise((resolve) => requestAnimationFrame(resolve))
    }
    if (lit.size < rows.length) return { spread: -1, everMidFade }
    const times = [...lit.values()]
    return { spread: Math.max(...times) - Math.min(...times), everMidFade }
  })

  // Six rows stepped by 220ms separate by over a second. Anything under half
  // the fade duration reads as one block arriving.
  expect(reveal.spread).toBeGreaterThan(350)
  // Spread alone passes on a list that snaps at staggered times, which is what
  // shipped: the rows were scheduled apart and had no opacity transition to
  // run. Catching a row part-way through its fade is what separates the two.
  expect(reveal.everMidFade).toBe(true)
})

test('the experience section names the field of the degree', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#experience')).toContainText(
    'complex adaptive systems',
  )
})

test('the experience section carries no engagement vocabulary', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#experience')).not.toContainText('contract iii')
})

test('the looking-for section states experience rather than a level band', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#looking-for')).toContainText('two years in')
})

// 375 and 390 are the two commonest phone widths, and both regressed when a
// decorative hover label shipped on one line: it reached 62px and 47px past the
// viewport while invisible, which scrolls the whole page sideways.
for (const width of [320, 375, 390, 768]) {
  test(`the page does not scroll sideways at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')

    // Every revealed element counts toward the document width, so the reveal is
    // settled first rather than measuring a page still cascading in.
    await page.evaluate(() => {
      document.querySelectorAll('[data-fade]').forEach((el) => {
        ;(el as HTMLElement).dataset.visible = 'true'
      })
    })

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )

    expect(overflow).toBeLessThanOrEqual(0)
  })
}

// A refresh restores the scroll, which puts the hero above the viewport before
// anything has observed it. An IntersectionObserver only reports an element
// becoming intersecting, so a hero that starts out of view never reveals, and a
// placement waiting on that reveal can only time out.
//
// Reproduced by scrolling on `DOMContentLoaded` rather than by reloading.
// Restoration is what a reader triggers, and Firefox does not perform it under
// automation, so a test resting on it measures nothing on one engine of three.
const MID_PAGE_LANDING = 2400
// How much slower than a fresh load a mid-page landing may place its controls.
// The defect this guards ran 3057ms against 876ms, a gap of 2181ms, because the
// placement wait expired rather than resolving. Read as a difference rather than
// as a duration: an absolute budget measures the machine as much as the page,
// and one set at 2000ms passed alone and failed under three parallel workers.
const PLACEMENT_GAP_TOLERANCE_MS = 1000

async function landMidPage(page: Page): Promise<void> {
  await page.addInitScript((top) => {
    addEventListener('DOMContentLoaded', () => window.scrollTo(0, top), {
      once: true,
    })
  }, MID_PAGE_LANDING)
}

/**
 * Lands with a sliver of the hero's reveal still on screen, under the share of
 * its own height the observer marks at.
 *
 * The row is partly visible and will never be marked, which is the narrow band
 * a test for "any of it is on screen" reads as arriving. Landing far past the
 * hero does not reach it.
 *
 * The position is measured on a settled page and replayed as a literal, rather
 * than computed inside the landing itself. At `DOMContentLoaded` the row has
 * not taken its final box, and a landing computed there overshot into the fully
 * scrolled-past case in Firefox, which is the state the test above already
 * covers.
 */
async function landUnderRevealThreshold(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForSelector('[data-toggle-host][data-ready]', {
    timeout: 15000,
  })
  const target = await page.evaluate((share) => {
    const revealing = document
      .querySelector('[data-hero-name]')
      ?.closest('[data-fade]')
    if (!revealing) throw new Error('the hero name carries no reveal')
    const box = revealing.getBoundingClientRect()
    return Math.round(window.scrollY + box.bottom - box.height * share)
  }, 0.05)

  await page.addInitScript((top) => {
    addEventListener('DOMContentLoaded', () => window.scrollTo(0, top), {
      once: true,
    })
  }, target)
}

async function timeToPlacement(page: Page): Promise<number> {
  const started = Date.now()
  await page.goto('/', { waitUntil: 'commit' })
  await page.waitForSelector('[data-toggle-host][data-ready]', {
    timeout: 15000,
  })
  return Date.now() - started
}

test('a refresh landing mid-page fills the bar as fast as a fresh load does', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })

  const fresh = await timeToPlacement(page)
  await landMidPage(page)
  const midPage = await timeToPlacement(page)

  // The landing is asserted rather than assumed. An engine that ignored the
  // scroll would report a fresh load's timing twice and pass having measured
  // nothing. Firefox does exactly that under automation on a real reload, which
  // is why the landing is scripted rather than restored.
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
  expect(midPage - fresh).toBeLessThan(PLACEMENT_GAP_TOLERANCE_MS)
})

test('the reveal marks a row at any sliver, not at its declared threshold', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await landUnderRevealThreshold(page)
  await page.goto('/', { waitUntil: 'commit' })
  await page.waitForSelector('[data-toggle-host][data-ready]', {
    timeout: 15000,
  })
  await page.waitForTimeout(400)

  // `initReveal` passes `threshold: REVEAL_THRESHOLD` and then branches on
  // `entry.isIntersecting` alone. A threshold decides when a callback fires and
  // not what `isIntersecting` reports, and the initial observation fires once
  // regardless, so a row is marked by any part of it being on screen.
  //
  // The placement wait reads that, which is why it tests `bottom > 0` rather
  // than a share of the row's height. Written against the threshold instead, it
  // would place through a row the observer still marks and pin the name while
  // that row was about to rise.
  const state = await page.evaluate(() => {
    const revealing = document
      .querySelector('[data-hero-name]')
      ?.closest('[data-fade]')
    if (!revealing) throw new Error('the hero name carries no reveal')
    const box = revealing.getBoundingClientRect()
    return {
      visible: box.bottom / box.height,
      marked: revealing.getAttribute('data-visible'),
    }
  })

  expect(state.visible).toBeGreaterThan(0)
  expect(state.visible).toBeLessThan(REVEAL_THRESHOLD)
  expect(state.marked).toBe('true')
})

test('the name is not placed before the hero it sits in has arrived', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/', { waitUntil: 'commit' })
  await page.waitForSelector('[data-toggle-host][data-ready]', {
    timeout: 15000,
  })

  // The other direction of the same wait, and the one a repair reaches for
  // first. Treating an unmarked reveal as settled makes the mid-page case
  // instant and pins the name at its landed position while the row around it is
  // still rising, which is the title appearing to correct itself after
  // everything else has landed. Measured on that version: placement at 210ms
  // against a hero that had not begun to reveal.
  const heroOpacity = await page.evaluate(() => {
    const revealing = document
      .querySelector('[data-hero-name]')
      ?.closest('[data-fade]')
    if (!revealing) throw new Error('the hero name carries no reveal')
    return Number(getComputedStyle(revealing).opacity)
  })

  expect(heroOpacity).toBeGreaterThan(0.98)
})

test('the controls land in the bar when the page opens mid-page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await landMidPage(page)
  await page.goto('/', { waitUntil: 'commit' })
  await page.waitForSelector('[data-toggle-host][data-ready]', {
    timeout: 15000,
  })

  // Placing sooner is worth nothing unless it places correctly. A wait cut
  // without keeping its measurement leaves the control where it sits in the
  // hero, 216px across and 28px up from the slot.
  //
  // Polled rather than read once. `data-ready` is set after the first paint is
  // scheduled rather than after it lands, so a single read straight after it
  // catches the control a frame short and reported 6px on two engines.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const toggle = document.querySelector('[data-theme-toggle]')
          const slot = document.querySelector('[data-bar-toggle-slot]')
          if (!toggle || !slot) {
            throw new Error('the promoted toggle or the bar slot is missing')
          }
          const control = toggle.getBoundingClientRect()
          const target = slot.getBoundingClientRect()
          return Math.round(
            Math.hypot(control.left - target.left, control.top - target.top),
          )
        }),
      { timeout: 5000 },
    )
    .toBeLessThanOrEqual(2)
})
