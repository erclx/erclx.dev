import { expect, test } from '@playwright/test'

import {
  AMBIENT_BAND,
  BAND_SHARE_CEILING,
  BEHAVIOR_IDS,
  BEHAVIORS,
  REACTION_CEILING_MS,
  REACTION_FLOOR_PER_WIDTH,
} from '../src/components/site/experience/cast/behaviors'
import {
  countOverlaps,
  FIELD,
  inkShares,
  MEMBER,
  readBandShares,
  SECTION,
  settleCast,
  WIDE,
} from './cast-helpers'
import { behaviorGrid } from './cast-inventory'

/**
 * Settled on the animations existing rather than paused for a span.
 * `readBandShares` reads `document.getAnimations()`, and a browser does not
 * populate that list until it has run a style and layout pass over content
 * `setContent` just replaced, which `load` alone does not guarantee.
 */
async function settleBehaviorGrid(page: import('@playwright/test').Page) {
  await page.waitForFunction(
    () => document.getAnimations().length > 0,
    undefined,
    {
      timeout: 5000,
    },
  )
}

// Guards for the agent cast in the experience section, apart from the three
// scheduler tests now in cast-scheduler.spec.ts: their 70s of wall-clock
// watching would otherwise set the floor one worker holds this file to, which
// is what `.claude/context/ci.md` records as the seam.
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
    await settleBehaviorGrid(page)

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
    await settleBehaviorGrid(page)

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
    await settleBehaviorGrid(page)

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
})
