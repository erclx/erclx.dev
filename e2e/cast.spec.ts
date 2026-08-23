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
/**
 * Long enough to hold several of the scheduler's own gaps, which run 5.2 to
 * 7.8 seconds apart. A window shorter than one gap reports a working scheduler
 * as silent.
 */
const SCHEDULER_WATCH_MS = 20_000
/**
 * What a test watching that window needs, against Playwright's 30s default.
 *
 * These three observe a wall clock rather than wait on a condition, so the
 * window is time the run genuinely spends and no amount of machine makes it
 * shorter. Add the settle, the load and the tap's own reaction and 20s of
 * watching does not fit 30s of budget: the schedule test took 35.1s on a CI
 * runner and timed out three times while passing locally. Shortening the window
 * to fit would have bought the same fit by watching fewer of the scheduler's
 * own gaps, which is the thing under test.
 */
const SCHEDULER_TEST_MS = 60_000
/** Long enough for a tap's own reaction to finish before the window opens. */
const STILL_AFTER_TAP_MS = 2_500

const WIDE = { width: 1440, height: 900 }

async function settleCast(page: Page): Promise<void> {
  await page.goto('/')
  await page.locator(SECTION).scrollIntoViewIfNeeded()
  await page.waitForTimeout(SETTLE_MS)
  // The arrival scales every member up from 0.7, so a box read while it runs
  // is a fraction of the size that ships. Measured on webkit under the full
  // suite, the largest member read 61.6px against the 72 it settles at, which
  // is 0.855 of it, while the same read passed alone. A fixed pause is a guess
  // at how much lead an engine needs and the engines disagree, so this waits on
  // the arrival itself rather than on a duration.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter(
                (animation) =>
                  ((animation as unknown as { animationName?: string })
                    .animationName ?? '') === 'cast-spawn' &&
                  animation.playState === 'running',
              ).length,
        ),
      { timeout: 5000 },
    )
    .toBe(0)
}

/**
 * The share of each member's box carrying ink, read from one capture of the
 * whole field rather than one per member.
 *
 * Seven element captures cost seven actionability waits and seven encodes, and
 * Playwright serializes actions on a page so they do not overlap. Measured at
 * 5829ms for the seven against 989ms for one field capture plus 100ms to read
 * every box in a single call, which is what took this past the case timeout on
 * a loaded runner while passing here.
 */
async function inkShares(page: Page): Promise<number[]> {
  const field = page.locator(FIELD)
  const shot = await field.screenshot({ animations: 'disabled' })
  const geometry = await field.evaluate((element) => {
    const root = element.getBoundingClientRect()
    return {
      rootWidth: root.width,
      members: [...element.querySelectorAll('[data-cast-member]')].map(
        (member) => {
          const box = member.getBoundingClientRect()
          return {
            x: box.x - root.x,
            y: box.y - root.y,
            width: box.width,
            height: box.height,
          }
        },
      ),
    }
  })

  return page.evaluate(
    async ({ data, geometry: shape }) => {
      const probe = document.createElement('canvas').getContext('2d')!
      probe.fillStyle = getComputedStyle(document.body).backgroundColor
      probe.fillRect(0, 0, 1, 1)
      const [gr, gg, gb] = probe.getImageData(0, 0, 1, 1).data

      const image = new Image()
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = 'data:image/png;base64,' + data
      })

      // Derived from the capture rather than read off the device, since the
      // context's scale factor is what decides it and a caller may change it.
      const scale = image.width / shape.rootWidth
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const target = canvas.getContext('2d')!
      target.drawImage(image, 0, 0)

      return shape.members.map((member) => {
        const x = Math.max(0, Math.round(member.x * scale))
        const y = Math.max(0, Math.round(member.y * scale))
        const width = Math.min(
          Math.round(member.width * scale),
          canvas.width - x,
        )
        const height = Math.min(
          Math.round(member.height * scale),
          canvas.height - y,
        )
        if (width <= 0 || height <= 0) return 0

        const pixels = target.getImageData(x, y, width, height).data
        let inked = 0
        for (let offset = 0; offset < pixels.length; offset += 4) {
          const distance =
            Math.abs(pixels[offset] - gr) +
            Math.abs(pixels[offset + 1] - gg) +
            Math.abs(pixels[offset + 2] - gb)
          if (distance > 60) inked += 1
        }
        return inked / (pixels.length / 4)
      })
    },
    { data: shot.toString('base64'), geometry },
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

    const animations = document.getAnimations().filter(
      (animation) =>
        named(animation).startsWith('cast-') &&
        // The aura rides the traveling terms so it stays with the figure,
        // and it is painted by a pseudo-element. A rate here is a distance
        // over a target's own box, and a pseudo has none, so those readings
        // come back at 0.0px/s and report every term the aura copies as
        // moving nothing. The drawing carries the movement and is measured
        // already, so its shadow is not a second reading.
        !(animation.effect as KeyframeEffect | null)?.pseudoElement,
    )
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

    const shares = await inkShares(page)

    // Asserted non-empty before the minimum is read, since `Math.min` of no
    // members returns Infinity and clears the floor below.
    expect(shares.length).toBeGreaterThan(0)
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

    const hidden = (await inkShares(page))[2]

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

    const all = await inkShares(page)
    const shares = [all[0], all[5]]

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

  // The airliner is not a cast member and shares no code with one, but it is
  // drawn in the same family and a reader meets the two a section apart. It sat
  // at 49.9px against a cast running 54 to 88, so it was smaller than every
  // figure on the page, and nothing related the two numbers.
  test('draws the airliner inside the band the cast occupies', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const sizes = await page.evaluate(
      (selectors) => {
        const members = [
          ...document.querySelectorAll<HTMLElement>(selectors.member),
        ].map((member) => member.getBoundingClientRect().width)
        const craft = document.querySelector(selectors.craft)
        if (!craft) throw new Error('the about surface draws no airliner')
        if (members.length === 0) throw new Error('the cast draws no members')
        return {
          craft: craft.getBoundingClientRect().width,
          smallest: Math.min(...members),
          largest: Math.max(...members),
        }
      },
      { member: MEMBER, craft: '.about-flight-craft path' },
    )

    // The band rather than the mean. The cast spans 34px across seven figures,
    // and pinning the aircraft to one point inside that would be a number with
    // nothing behind it.
    expect(sizes.craft).toBeGreaterThanOrEqual(sizes.smallest)
    expect(sizes.craft).toBeLessThanOrEqual(sizes.largest)
  })

  // The contrail's weight is set independently of the craft it trails, so a
  // scale applied to one leaves the other where it was. They were 0.45 and 5px
  // when that pairing was chosen, and the ratio is what has to survive.
  test('keeps the contrail in step with the aircraft it trails', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await settleCast(page)

    const ratio = await page.evaluate(() => {
      const craft = document.querySelector('.about-flight-craft path')
      const trail = document.querySelector('.about-flight-trail')
      if (!craft || !trail) throw new Error('the flight is missing a part')
      const scale = Number(
        /scale\(([\d.]+)\)/.exec(craft.getAttribute('transform') ?? '')?.[1],
      )
      const stroke = Number(trail.getAttribute('stroke-width'))
      if (!scale || !stroke) throw new Error('the flight states no scale')
      return stroke / scale
    })

    // 5 / 0.45, the pairing the drawing was tuned at. Held to two places rather
    // than one, since the component derives the stroke from the scale and lands
    // within 0.0004 of it. At one place the tolerance is 0.05 and a stroke
    // written by hand beside the scale spends two thirds of it standing still,
    // which is a guard that reports nothing until the drift is already large.
    expect(ratio).toBeCloseTo(11.111, 2)
  })

  // The margin check reads a cluster's own box, and the power layer is a
  // sibling reaching past that box on every side, so it can paint over the
  // prose while the cluster still measures clear. That is the shape of the
  // defect `.claude/ARCHITECTURE.md` records under a panel measuring correctly
  // while sitting off screen: the instrument answers about the wrong element.
  test('keeps every power layer clear of the reading column', async ({
    page,
  }) => {
    const clearances: number[] = []

    for (const width of [1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await settleCast(page)

      clearances.push(
        await page.evaluate((section) => {
          const prose = document.querySelector(`${section} p`)
          if (!prose) throw new Error('the experience section carries no prose')
          const column = prose.getBoundingClientRect()

          const layers = [
            ...document.querySelectorAll('.cast-power-layer'),
          ].filter((layer) => layer.getBoundingClientRect().width > 0)
          if (layers.length === 0)
            throw new Error('no power layer is painted, so nothing was read')

          // Signed, and the larger of the two edge distances. Branching on
          // which side of the column a layer sits is meaningless once it
          // overlaps, and that form reported a 10px overlap as 890px.
          return Math.min(
            ...layers.map((layer) => {
              const box = layer.getBoundingClientRect()
              return Math.max(box.left - column.right, column.left - box.right)
            }),
          )
        }, SECTION),
      )
    }

    expect(Math.min(...clearances)).toBeGreaterThan(0)
  })

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
