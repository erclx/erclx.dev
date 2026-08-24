import { expect, type Page, test } from '@playwright/test'

import { REVEAL_THRESHOLD } from '../src/lib/reveal'
import { ANCHOR_RATIO } from '../src/lib/section-nav'
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

  const target = await page.evaluate(
    ([anchorRatio]) => {
      const lookingFor = document.getElementById('looking-for')
      const top =
        (lookingFor?.getBoundingClientRect().top ?? 0) + window.scrollY
      // Landing 100px past the crossing puts looking-for well inside the active
      // zone without landing at the document's own end.
      const anchor = window.innerHeight * anchorRatio
      return top - anchor + 100
    },
    [ANCHOR_RATIO] as const,
  )
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: 'instant' }),
    target,
  )

  await expect(
    page.locator('.section-nav-link[data-active="true"]'),
  ).toHaveText('Looking for')
  await expect(rail).toHaveCSS('opacity', '1')

  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant',
    }),
  )
  await expect(
    page.locator('.section-nav-link[data-active="true"]'),
  ).toHaveText('Looking for')
  await expect(rail).toHaveCSS('opacity', '1')
})

test('the rail never shows a reader a column naming no row', async ({
  page,
}) => {
  // The reveal keyed to half the viewport while the first row lit at the 30%
  // anchor, so the rail painted at full opacity naming nothing across 0.2
  // viewport heights: 150px at 1280, 170px at 1440, 210px at 1920. Both ends
  // are fractions of the screen, so the window grew with it.
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')

  const naked = await page.evaluate(
    async ([anchorRatio]) => {
      const nav = document.querySelector<HTMLElement>('[data-section-nav]')
      const about = document.getElementById('about')
      const links = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('.section-nav-link'),
      )
      if (!nav || !about || links.length === 0) return -1

      // Sampled around the one boundary rather than walked across the band. The
      // rail can only name nothing above the first section's crossing, and the
      // reveal is the only other event in that stretch, so a spread either side
      // of the crossing covers it. Walking it at 40px took 16s alone and timed
      // out under the full suite, and a guard that fails on load rather than on
      // the defect reports nothing either way.
      const crossing =
        about.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * anchorRatio
      const from = crossing - window.innerHeight * 0.4
      const step = (window.innerHeight * 0.5) / 11

      let count = 0
      for (let index = 0; index <= 11; index += 1) {
        window.scrollTo({
          top: Math.max(0, Math.round(from + step * index)),
          behavior: 'instant',
        })
        await new Promise((done) => requestAnimationFrame(() => done(null)))
        await new Promise((done) => requestAnimationFrame(() => done(null)))
        // Read the painted opacity rather than `data-revealed`, so a rail caught
        // part way through its fade still counts as one a reader can see.
        const visible = Number(getComputedStyle(nav).opacity) > 0.05
        if (visible && !links.some((link) => link.dataset.active === 'true')) {
          count += 1
        }
      }
      return count
    },
    [ANCHOR_RATIO] as const,
  )

  expect(naked).toBe(0)
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
  // Instant, because what this reproduces is the arrival rather than the
  // travel. The root glides for a reader now, and a bare call inherits it, so
  // the poll below caught a state part-way through the flight and read it as an
  // end state. Verified against a real rail click, which still lands settled.
  await page.evaluate(() =>
    document.querySelector('#about')?.scrollIntoView({ behavior: 'instant' }),
  )
  // Settled on the figure reaching an end state rather than paused for a span.
  // The gate runs off a scroll frame and a bar measurement, and 600ms was a
  // guess at how long a loaded engine needs to get there: on webkit under the
  // full suite it read `unset` twice while passing alone. Both end states are
  // accepted here because the assertion below is what decides which is correct.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document.querySelector<HTMLElement>('.about-flight')?.dataset
              .flight ?? 'unset',
        ),
      { timeout: 8000 },
    )
    .not.toBe('unset')

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

const ABOUT_FLIGHT_WIDTHS = [1280, 1024, 390]

for (const width of ABOUT_FLIGHT_WIDTHS) {
  test(`the aircraft settles centred on the trail it flies, at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() =>
      document.querySelector('#about')?.scrollIntoView({ behavior: 'instant' }),
    )
    // Landing under the bar settles at once; landing in clear air runs the
    // 2000ms approach first and its `both` fill mode holds `data-flight` at
    // `true` rather than advancing it to `settled`, so the offset the craft
    // rides is what the geometry below actually needs to reach 100%.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const craft = document.querySelector<HTMLElement>(
            '.about-flight-craft',
          )
          return craft
            ? parseFloat(getComputedStyle(craft).offsetDistance)
            : null
        }),
      )
      .toBe(100)

    const measured = await page.evaluate(() => {
      const craft = document.querySelector<SVGGElement>('.about-flight-craft')
      const craftPath = craft?.querySelector<SVGPathElement>('path')
      const trail = document.querySelector<SVGPathElement>(
        '.about-flight-trail',
      )
      const svg = document.querySelector<SVGSVGElement>('.about-flight-stage')
      if (!craft || !craftPath || !trail || !svg) return null

      const toScreenPoint = (
        element: SVGGraphicsElement,
        local: { x: number; y: number },
      ) => {
        const ctm = element.getScreenCTM()
        if (!ctm) return null
        const point = svg.createSVGPoint()
        point.x = local.x
        point.y = local.y
        const screen = point.matrixTransform(ctm)
        return { x: screen.x, y: screen.y }
      }

      // The craft's own drawing centres on the group's local origin, so its
      // painted bounding box, read in the group's local space, has to centre
      // there too. Mapping that centre through the group's own screen matrix
      // is what puts the painted craft and the trail's endpoint on the same
      // axis for comparison below.
      const box = craft.getBBox()
      const craftCentre = toScreenPoint(craft, {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
      })

      const trailEnd = trail.getPointAtLength(trail.getTotalLength())
      const trailHead = toScreenPoint(trail, trailEnd)

      if (!craftCentre || !trailHead) return null

      const scaleMatch = craftPath
        .getAttribute('transform')
        ?.match(/scale\(([\d.]+)\)/)

      return {
        offset: Math.hypot(
          craftCentre.x - trailHead.x,
          craftCentre.y - trailHead.y,
        ),
        scale: scaleMatch ? Number(scaleMatch[1]) : null,
      }
    })

    // The origin is derived from the drawing's own centre, so the painted
    // craft has to land on the trail's own head, not somewhere beside it.
    expect(measured?.offset).toBeLessThan(0.5)
    // Past about 0.90 the craft's half-width outgrows the clearance the trail
    // head holds for it, per .claude/context/motion.md, and the nose draws
    // inside its own trail.
    expect(measured?.scale).toBeLessThanOrEqual(0.9)
  })
}

// The scenarios harness serves candidate treatments from the running page
// while a visual decision is open, and the rule is that the arms and the call
// site are deleted in the change that applies the pick. A variant left behind a
// flag is a second design nobody maintains, and the parameter is a surface a
// reader can reach.
//
// This is that rule made mechanical rather than remembered. It fails on a
// branch that ships a page still carrying a switcher, which is the one state
// nobody notices: an arm left mounted renders nothing until the parameter is
// named, so it survives every capture and every read of the page.
test('the landing page ships no open visual decision', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('[data-scenario-switcher]')).toHaveCount(0)
})

// The rings are contours of a mound the shader adds to its stream function, so
// nothing in the DOM says whether they drew. A state a component sets and a
// treatment the page paints are two claims, and reading the first says nothing
// about the second, so this reads painted pixels.
//
// It tests the one property the drawing claims, which is that the contours near
// the photo are concentric about it. Averaging luminance around a circle keeps
// a line that follows that circle and washes out one that crosses it, so a
// radial profile built from those averages ripples once per ring where the
// contours are centred here and runs flat where they are not. Detrending
// against a window wider than the ring spacing drops the slow falloff from the
// photo's edge outward and leaves the ripple alone.
//
// Two earlier versions of this guard passed against a page with the rings
// switched off, which is the defect class this project keeps finding rather
// than a pair of slips.
//
// The first compared ink in the annulus against a patch of plain field. It was
// reading the reading column's damp rather than the rings: the annulus sits
// inside the column at 0.4 and the only nearby patch wide enough to sample sits
// outside it at 1.0, so the two differed by a damp fraction before the mound was
// considered at all. No control patch escapes that here, because the photo sits
// against the column's right edge by construction.
//
// The second counted turns in the radial profile. Averaging around a circle
// leaves small fluctuations, every one of them is a local extremum, and the
// count cleared any floor worth setting either way. Amplitude at the ring scale
// separates cleanly where a count of turns does not: measured at 1280 with the
// mound at 0.62 against the same page with it at 0, the ripple runs 0.6336
// against 0.0355 in light and 0.8007 against 0.0301 in dark.
test('the portrait sits on a mound the field draws contours around', async ({
  page,
  browserName,
}) => {
  // Headless WebKit composites this page without its WebGL canvas: a patch of
  // pure field in the hero margin returns a luminance spread of 0 there against
  // 57.1 in chromium and 56.1 in firefox. Every pixel read from a WebKit
  // screenshot is therefore a reading of the CSS layer alone, which cannot see
  // a shader at all. The rings do render in a real WebKit.
  test.skip(
    browserName === 'webkit',
    'headless webkit screenshots omit the WebGL canvas',
  )

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const box = await page.locator(PORTRAIT_SELECTOR).boundingBox()
  expect(box).not.toBeNull()

  // Polled rather than read once behind a pause, because the field mounts from
  // an observer and compiles a program before it draws anything, so any fixed
  // wait is a guess at how long that takes on the machine running it.
  const rippleAmplitude = async (): Promise<number | null> => {
    const shot = await page.screenshot()
    return page.evaluate(
      async ({ src, center, radius }) => {
        const img = new Image()
        img.src = src
        await img.decode()
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return null
        ctx.drawImage(img, 0, 0)
        const { data } = ctx.getImageData(0, 0, img.width, img.height)

        const meanOnCircle = (r: number): number => {
          let sum = 0
          let count = 0
          const steps = Math.max(180, Math.round(2 * Math.PI * r))
          for (let i = 0; i < steps; i++) {
            const angle = (i / steps) * 2 * Math.PI
            const x = Math.round(center.x + r * Math.cos(angle))
            const y = Math.round(center.y + r * Math.sin(angle))
            if (x < 0 || y < 0 || x >= img.width || y >= img.height) continue
            const at = (y * img.width + x) * 4
            sum +=
              0.2126 * data[at] + 0.7152 * data[at + 1] + 0.0722 * data[at + 2]
            count++
          }
          return count === 0 ? Number.NaN : sum / count
        }

        const profile: number[] = []
        for (let r = radius.inner; r <= radius.outer; r += 1) {
          profile.push(meanOnCircle(r))
        }

        const half = Math.floor(radius.window / 2)
        let energy = 0
        let counted = 0
        for (let i = half; i < profile.length - half; i++) {
          let local = 0
          for (let k = i - half; k <= i + half; k++) local += profile[k]
          const residual = profile[i] - local / radius.window
          energy += residual * residual
          counted++
        }

        return counted === 0 ? null : Math.sqrt(energy / counted)
      },
      {
        src: `data:image/png;base64,${shot.toString('base64')}`,
        center: {
          x: Math.round((box?.x ?? 0) + (box?.width ?? 0) / 2),
          y: Math.round((box?.y ?? 0) + (box?.height ?? 0) / 2),
        },
        // The window is wider than the widest gap between two rings, so the
        // detrend removes the falloff and never the ripple it measures.
        radius: { inner: 85, outer: 185, window: 25 },
      },
    )
  }

  // Sits between the two measured states rather than on either: seven times
  // what the same page draws with the mound at zero, and well under the 0.63
  // the lighter theme reaches with it.
  await expect.poll(rippleAmplitude, { timeout: 8000 }).toBeGreaterThan(0.25)
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
    await page.evaluate(() =>
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'instant',
      }),
    )

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
    addEventListener(
      'DOMContentLoaded',
      () => window.scrollTo({ top, behavior: 'instant' }),
      { once: true },
    )
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
    addEventListener(
      'DOMContentLoaded',
      () => window.scrollTo({ top, behavior: 'instant' }),
      { once: true },
    )
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

// A chip's scroll is judged on the positions the page passes through rather
// than on the declaration behind it. That reads the same on every engine, and
// it survives the answer moving between a stylesheet and a script, which is
// what a check reading `scroll-behavior` off the root cannot claim.
const traceChipScroll = async (
  page: Page,
  frames: number,
): Promise<{ start: number; landed: number; passedThrough: boolean }> =>
  page.evaluate(async (count) => {
    const chip = document.querySelector<HTMLAnchorElement>('#experience ul a')
    if (!chip) throw new Error('the experience section carries no chip')

    const start = window.scrollY
    const samples: number[] = []
    chip.click()

    await new Promise<void>((resolve) => {
      let seen = 0
      const tick = () => {
        samples.push(window.scrollY)
        seen += 1
        if (seen < count) requestAnimationFrame(tick)
        else resolve()
      }
      requestAnimationFrame(tick)
    })

    const landed = samples.at(-1) ?? start
    return {
      start,
      landed,
      passedThrough: samples.some((at) => at > start && at < landed),
    }
  }, frames)

// Holding a position strictly between where the page started and where it
// landed is the whole difference between the two tests below, and it is the
// strongest claim every engine can answer.
//
// Two thresholds were tried before this and each encoded one engine. A fraction
// of the distance failed webkit, whose automation build collapses the glide
// into two frames and opens at 1895 of 2833 where chromium holds 23 distinct
// positions and firefox 29. A frame-exact arrival then failed firefox, which
// does not commit a fragment scroll synchronously: it still reports the
// starting position on the first frame after the click and the landing on the
// second, which is a jump arriving late rather than a glide.
test('a chip glides to the card it names rather than jumping there', async ({
  page,
}) => {
  await page.goto('/')

  const scroll = await traceChipScroll(page, 90)

  expect(scroll.landed).toBeGreaterThan(scroll.start)
  expect(scroll.passedThrough).toBe(true)
})

test('a chip jumps under a reduced-motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const scroll = await traceChipScroll(page, 30)

  expect(scroll.landed).toBeGreaterThan(scroll.start)
  expect(scroll.passedThrough).toBe(false)
})

test('the card a chip lands on clears the sticky bar', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await traceChipScroll(page, 20)

  const clearance = await page.evaluate(() => {
    const card = document.querySelector('#aitk')
    const ground = document.querySelector('[data-bar-ground]')
    if (!card || !ground) throw new Error('no card, or no bar to clear')
    return (
      card.getBoundingClientRect().top - ground.getBoundingClientRect().bottom
    )
  })

  expect(clearance).toBeGreaterThanOrEqual(0)
})
