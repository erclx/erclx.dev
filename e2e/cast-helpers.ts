import { expect, type Page } from '@playwright/test'

import { AMBIENT_BAND } from '../src/components/site/experience/cast/behaviors'

// Shared between cast.spec.ts and cast-scheduler.spec.ts, which were one file
// until its three wall-clock scheduler tests, costing about 70s against the
// other sixteen tests' 45s, set the floor one worker held the whole file to.
// `.claude/context/ci.md` records the measured seam.

export const FIELD = '[data-cast-field]'
export const MEMBER = '[data-cast-member]'
export const SECTION = '[data-section="experience"]'
export const SETTLE_MS = 1800
/**
 * Long enough to hold several of the scheduler's own gaps, which run 5.2 to
 * 7.8 seconds apart. A window shorter than one gap reports a working scheduler
 * as silent.
 */
export const SCHEDULER_WATCH_MS = 20_000
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
export const SCHEDULER_TEST_MS = 60_000
/** Long enough for a tap's own reaction to finish before the window opens. */
export const STILL_AFTER_TAP_MS = 2_500

export const WIDE = { width: 1440, height: 900 }

export async function settleCast(page: Page): Promise<void> {
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
export async function inkShares(page: Page): Promise<number[]> {
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

export async function countOverlaps(page: Page): Promise<Overlaps> {
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
export async function readBandShares(page: Page): Promise<
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
