import { expect, type Page, test } from '@playwright/test'

import {
  AMBIENT_BAND,
  BAND_SHARE_CEILING,
  BEHAVIOR_IDS,
  BEHAVIORS,
  REACTION_CEILING_MS,
  REACTION_FLOOR_PER_WIDTH,
} from '../src/components/site/experience/cast/behaviors'
import { behaviorGrid } from './cast-inventory'

// Guards for the agent cast in the experience section.
//
// Three of these exist because of defects this surface already shipped, and
// each is worth more than the assertion it makes.
//
// A placement check reading bounding boxes passed on all six members while five
// of them were not painted, so `is painted` is asserted off pixels and the ink
// reading is itself checked against a member hidden on purpose. A guard that
// cannot fail is not a guard.
//
// Motion is read by seeking each animation's own timeline rather than by
// sampling a wall clock, so the figures are the same on every run and on every
// engine. What is asserted is the share of a cycle spent inside the band
// `.claude/DESIGN.md` bars, not the peak: an event term crosses that band on
// its way to being fast, and only a term that idles inside it is a defect.

const FIELD = '[data-cast-field]'
const MEMBER = '[data-cast-member]'
const SECTION = '[data-section="experience"]'
const SETTLE_MS = 1800

const WIDE = { width: 1440, height: 900 }

async function settleCast(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator(SECTION).scrollIntoViewIfNeeded()
  await page.waitForTimeout(SETTLE_MS)
}

/** Share of a member's own box that differs from the page behind it. */
async function inkShare(page: Page, index: number): Promise<number> {
  // Every member carries `cast-breathe`, an ambient scale that runs forever, and
  // an element screenshot waits for two consecutive frames to report the same
  // box before it shoots. A scaling box gives it that only where the term passes
  // through a slow point, so the wait is variable rather than fatal: measured on
  // one member it ran 4499ms, then 873ms, then 666ms, against a flat 760ms with
  // the animations frozen. Seven members at the long end of that reach the
  // capture timeout on a loaded runner, which is why this failed in CI and
  // passed here. Freezing costs the reading nothing, since the term is a scale
  // rather than a travel and the drawing is the same at any phase of it.
  const shot = await page
    .locator(MEMBER)
    .nth(index)
    .screenshot({ animations: 'disabled' })
  return page.evaluate(
    async ({ data }) => {
      const context = document.createElement('canvas').getContext('2d')!
      context.fillStyle = getComputedStyle(document.body).backgroundColor
      context.fillRect(0, 0, 1, 1)
      const [gr, gg, gb] = context.getImageData(0, 0, 1, 1).data

      const image = new Image()
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = 'data:image/png;base64,' + data
      })
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const target = canvas.getContext('2d')!
      target.drawImage(image, 0, 0)
      const pixels = target.getImageData(0, 0, canvas.width, canvas.height).data
      let inked = 0
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const distance =
          Math.abs(pixels[offset] - gr) +
          Math.abs(pixels[offset + 1] - gg) +
          Math.abs(pixels[offset + 2] - gb)
        if (distance > 60) inked += 1
      }
      return inked / (pixels.length / 4)
    },
    { data: shot.toString('base64') },
  )
}

interface Overlaps {
  readonly column: number
  readonly rail: number
  readonly dock: number
  readonly offscreen: number
}

async function countOverlaps(page: Page): Promise<Overlaps> {
  return page.evaluate(() => {
    const edges = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const rect = element.getBoundingClientRect()
      return rect.width ? { left: rect.left, right: rect.right } : null
    }
    const rail = edges('.section-nav, [data-section-nav]')
    const dock = edges('.contact-dock, [data-contact-dock]')
    const column = document
      .querySelector('[data-section="experience"] > div.mx-auto')!
      .getBoundingClientRect()

    const members = [...document.querySelectorAll('[data-cast-member]')].map(
      (member) => member.getBoundingClientRect(),
    )
    return {
      column: members.filter(
        (rect) => rect.right > column.left && rect.left < column.right,
      ).length,
      rail: members.filter(
        (rect) => rail && rect.left < rail.right && rect.right > rail.left,
      ).length,
      dock: members.filter(
        (rect) => dock && rect.left < dock.right && rect.right > dock.left,
      ).length,
      offscreen: members.filter(
        (rect) => rect.left < 0 || rect.right > window.innerWidth,
      ).length,
    }
  })
}

/** Seeks every cast behavior through its own cycle and reports its band share. */
async function readBandShares(page: Page): Promise<
  Array<{
    name: string
    share: number
    peak: number
    duration: number
    targetWidth: number
  }>
> {
  return page.evaluate((band) => {
    const named = (animation: Animation) =>
      String(
        (animation as unknown as { animationName?: string }).animationName ??
          '',
      )

    const animations = document
      .getAnimations()
      .filter((animation) => named(animation).startsWith('cast-'))
    for (const animation of animations) animation.pause()

    const seen = new Set<string>()
    const readings: Array<{
      name: string
      share: number
      peak: number
      duration: number
      targetWidth: number
    }> = []
    const STEPS = 240

    for (const animation of animations) {
      const name = named(animation)
      // The spawn runs once and is meant to be seen, so it is an arrival rather
      // than a behavior and the band does not apply to it.
      if (name === 'cast-spawn' || seen.has(name)) continue
      seen.add(name)

      const target = (animation.effect as KeyframeEffect | null)?.target ?? null
      const timing = animation.effect?.getComputedTiming()
      const duration =
        typeof timing?.duration === 'number' ? timing.duration : 0
      if (!target || !duration) continue

      const stepMs = duration / STEPS
      let previous: DOMRect | null = null
      let inBand = 0
      let counted = 0
      let peak = 0

      for (let index = 0; index <= STEPS; index += 1) {
        animation.currentTime = index * stepMs
        const rect = target.getBoundingClientRect()
        if (previous) {
          // The corner rather than the centre, so a rotation registers at all.
          const speed =
            (Math.hypot(rect.left - previous.left, rect.top - previous.top) /
              stepMs) *
            1000
          peak = Math.max(peak, speed)
          if (speed >= band.low && speed <= band.high) inBand += 1
          counted += 1
        }
        previous = rect
      }

      readings.push({
        name,
        share: counted ? inBand / counted : 0,
        peak,
        duration,
        targetWidth: target.getBoundingClientRect().width,
      })
    }

    for (const animation of animations) animation.play()
    return readings
  }, AMBIENT_BAND)
}

test.describe('agent cast', () => {
  test('renders in the margins on a wide viewport', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)

    await expect(page.locator(FIELD)).toBeVisible()
    await expect(page.locator(MEMBER)).toHaveCount(7)
    await expect(page.locator('[data-cast-cluster]')).toHaveCount(5)
  })

  test('stands down where the margin measures zero', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await settleCast(page)

    await expect(page.locator(FIELD)).toBeHidden()
  })

  test('never overlaps the rail, the dock, or the reading column', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const overlaps = await countOverlaps(page)

    expect(overlaps).toEqual({ column: 0, rail: 0, dock: 0, offscreen: 0 })
  })

  test('paints every member rather than only reserving a box for it', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const count = await page.locator(MEMBER).count()
    const shares = await Promise.all(
      Array.from({ length: count }, (_, index) => inkShare(page, index)),
    )

    expect(Math.min(...shares)).toBeGreaterThan(0.05)
  })

  // The check above passed on six members while five were blank, in two separate
  // implementations. This is what says it can still fail.
  test('reports a member that is present but not painted', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)
    await page.evaluate(() => {
      const member =
        document.querySelectorAll<HTMLElement>('[data-cast-member]')[2]
      member.style.opacity = '0'
    })

    const hidden = await inkShare(page, 2)

    expect(hidden).toBeLessThan(0.05)
  })

  // A cluster is the unit that has to fit, and the margin it fits inside is
  // narrower than the page margin: the rail takes the left edge and the dock
  // the right. A cluster grown by one member is the way this breaks.
  test('keeps every cluster inside the margin the rail and dock leave', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await settleCast(page)

    const clear = await page.evaluate(() => {
      const edges = (selector: string) => {
        const element = document.querySelector(selector)
        if (!element) return null
        const rect = element.getBoundingClientRect()
        return rect.width ? { left: rect.left, right: rect.right } : null
      }
      const rail = edges('.section-nav, [data-section-nav]')
      const dock = edges('.contact-dock, [data-contact-dock]')
      const column = document
        .querySelector('[data-section="experience"] > div.mx-auto')!
        .getBoundingClientRect()

      return [...document.querySelectorAll('[data-cast-cluster]')].map(
        (cluster) => {
          const rect = cluster.getBoundingClientRect()
          const onLeft = rect.left < column.left
          return onLeft
            ? rect.left - (rail?.right ?? 0)
            : (dock?.left ?? window.innerWidth) - rect.right
        },
      )
    })

    expect(Math.min(...clear)).toBeGreaterThan(0)
  })

  // The band bars ambient motion, which is movement with no fixed reference to
  // judge it against. A reaction has one, the pointer that caused it, and it
  // runs once and stops, so only the resting term answers here. Holding a
  // gesture to this ceiling would mean slowing twelve movements a reader asked
  // for to satisfy a rule about surfaces nobody asked for.
  test('holds every resting term out of the barred ambient band', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await page.setContent(behaviorGrid('light'))
    await page.waitForTimeout(400)

    const readings = await readBandShares(page)
    const resting = readings.filter((reading) => {
      const id = reading.name
        .replace(/^cast-/, '')
        .replace(/-[lr]$/, '') as keyof typeof BEHAVIORS
      return BEHAVIORS[id]?.kind === 'idle'
    })
    const worst = resting.reduce((a, b) => (a.share > b.share ? a : b), {
      name: 'none',
      share: 0,
      peak: 0,
      duration: 0,
      targetWidth: 0,
    })

    expect(
      resting.length,
      'no resting term was measured at all',
    ).toBeGreaterThan(0)
    expect(
      worst.share,
      `${worst.name} spends ${(worst.share * 100).toFixed(1)}% of its cycle between ${AMBIENT_BAND.low} and ${AMBIENT_BAND.high}px/s`,
    ).toBeLessThanOrEqual(BAND_SHARE_CEILING)
  })

  // The defect a reaction actually has is the opposite one. It fires and does
  // nothing a reader can see, which is what shipped once: written for ambient
  // looping, `blink` moved at 96% of a 5600ms cycle, so a click paid out five
  // seconds later and read as dead.
  test('answers a pointer with something brief and visible', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await page.setContent(behaviorGrid('light'))
    await page.waitForTimeout(400)

    const readings = await readBandShares(page)
    const reactions = readings.filter((reading) => {
      const id = reading.name
        .replace(/^cast-/, '')
        .replace(/-[lr]$/, '') as keyof typeof BEHAVIORS
      return BEHAVIORS[id]?.kind === 'reaction'
    })
    // The floor is read against each target's own width, so one number covers a
    // one-cell antenna and a whole body. A behavior that does not travel at
    // all is real and is read on duration alone.
    const sluggish = reactions.filter((reading) => {
      const id = reading.name
        .replace(/^cast-/, '')
        .replace(/-[lr]$/, '') as keyof typeof BEHAVIORS
      if (reading.duration > REACTION_CEILING_MS) return true
      if (!BEHAVIORS[id]?.travels) return false
      return reading.peak < reading.targetWidth * REACTION_FLOOR_PER_WIDTH
    })

    expect(
      sluggish.map(
        (reading) =>
          `${reading.name} ${Math.round(reading.duration)}ms at ${reading.peak.toFixed(1)}px/s ` +
          `across a ${Math.round(reading.targetWidth)}px target`,
      ),
    ).toEqual([])
  })

  // A behavior whose selector matches nothing animates nothing, and no rate
  // check can see that because there is no rate to read. `wobble` moves the
  // antenna and reported as absent while rendered on a member wearing ears.
  test('finds every behavior in the vocabulary rather than silently skipping one', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await page.setContent(behaviorGrid('light'))
    await page.waitForTimeout(400)

    const readings = await readBandShares(page)
    const seen = new Set(
      readings.map((reading) =>
        reading.name.replace(/^cast-/, '').replace(/-[lr]$/, ''),
      ),
    )
    const missing = BEHAVIOR_IDS.filter((id) => !seen.has(id))

    expect(
      missing,
      `no animation moved anything for: ${missing.join(', ')}`,
    ).toEqual([])
  })

  // A mood is a pairing of eyes, mouth, and mark, so reusing one makes two
  // members answer a pointer with the same gesture however different their
  // faces are. That is what a single shared mark element did to five of them.
  test('gives each member a mark of its own', async ({ page }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const counts = await page.evaluate(() => {
      const tally: Record<string, number> = {}
      for (const face of document.querySelectorAll(
        '[data-cast-member] .cast-face',
      )) {
        // The mark is the run of `bn-mark` rects, and its shape is what
        // identifies it. Counting the rect count and the first rect's geometry
        // separates one mark from another without naming any of them here.
        const marks = [...face.querySelectorAll('.bn-mark')]
        if (!marks.length) continue
        const first = marks[0] as SVGRectElement
        const key = `${marks.length}:${first.getAttribute('x')}:${first.getAttribute('y')}:${first.getAttribute('width')}`
        tally[key] = (tally[key] ?? 0) + 1
      }
      return tally
    })

    const overused = Object.entries(counts).filter(([, count]) => count > 2)

    expect(
      overused.map(([key, count]) => `${key} used ${count} times`),
    ).toEqual([])
  })

  test("changes a member's face when a reader taps it", async ({ page }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)
    const sleeper = page.locator(MEMBER).last()
    const before = await sleeper.evaluate((member) => member.dataset.react)

    // Recorded at handler time rather than read after the round trip. The tap
    // marks clear once the reaction ends, which for this member is an 820ms
    // `hop`, so a separate `evaluate` races a state whose lifetime is shorter
    // than a loaded runner's round trip. Registered after the component's own
    // listener, so it runs second and sees what that one set.
    await sleeper.evaluate((member) => {
      member.addEventListener('click', () => {
        const tapped = member.querySelector('.cast-face.is-tapped')
        Object.assign(window, {
          __tap: {
            react: member.dataset.react,
            woken: 'woken' in member.dataset,
            showing: tapped ? getComputedStyle(tapped).display : 'missing',
          },
        })
      })
    })

    await sleeper.click({ force: true })

    const after = await page.evaluate(
      () =>
        (
          window as unknown as {
            __tap?: { react?: string; woken: boolean; showing: string }
          }
        ).__tap,
    )

    // Asserted present before its members are read, so a tap the listener never
    // saw fails here rather than passing on three reads of `undefined`.
    expect(after, 'no tap was recorded').toBeDefined()
    expect(after?.woken).toBe(true)
    expect(after?.react).not.toBe(before)
    expect(after?.showing).toBe('block')
  })

  test('settles the cast in place for a reader who asked for less motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const shares = await Promise.all(
      [0, 5].map((index) => inkShare(page, index)),
    )

    expect(Math.min(...shares)).toBeGreaterThan(0.05)
  })

  test('releases a tapped member for a reader who asked for less motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const sleeper = page.locator(MEMBER).last()
    const resting = await sleeper.evaluate((member) => member.dataset.react)

    await sleeper.click({ force: true })

    // The face is the whole of what a tap says once the movement is gone, so it
    // has to arrive and be readable rather than revert inside a frame.
    expect(await sleeper.evaluate((member) => 'woken' in member.dataset)).toBe(
      true,
    )

    // Every `cast-*` keyframe sits behind `no-preference`, so no animation runs
    // and no `animationend` arrives. A member left marked here holds its aura
    // lit and takes no further tap for the life of the page, which is a control
    // that answers once and then reads as broken.
    await expect
      .poll(() => sleeper.evaluate((member) => 'reacting' in member.dataset), {
        timeout: 5000,
      })
      .toBe(false)

    expect(await sleeper.evaluate((member) => member.dataset.react)).toBe(
      resting,
    )

    // Releasing the mark is only half of it. A second tap has to be answered,
    // which is what a reader actually notices about the first one sticking.
    await sleeper.click({ force: true })
    expect(await sleeper.evaluate((member) => 'woken' in member.dataset)).toBe(
      true,
    )
  })
})
