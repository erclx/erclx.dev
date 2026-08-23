import { execFileSync } from 'node:child_process'

import { chromium, type Page } from '@playwright/test'

import {
  AMBIENT_BAND,
  BAND_SHARE_CEILING,
  BEHAVIOR_IDS,
  BEHAVIORS,
} from '../src/components/site/experience/cast/behaviors'
import { behaviorGrid } from './cast-inventory'

// Measures what the agent cast actually does: where each member stands, whether
// a reader would see it, and how fast every behavior moves.
//
// The speed half steps each animation's own timeline rather than sampling a
// wall clock. A wall-clock sample is a race against the compositor and reports
// a different number every run, where seeking `currentTime` is deterministic:
// the same commit yields the same figures, which is what makes this a guard
// rather than an observation.
//
// The visibility half exists because of a specific defect. A placement check
// that read bounding boxes passed on all six members while five of them were
// not painted at all, which is the trap `.claude/ARCHITECTURE.md` records under
// a panel measuring 1517x639 while sitting off screen. Ink is counted here
// rather than geometry.
//
// Run: bun e2e/cast-motion.ts
// Against another server: CAST_BASE_URL=http://localhost:4400 bun e2e/cast-motion.ts

const DEV_PORT_BASE = 4321

function devServerUrl(): string {
  const port = execFileSync('bash', [
    'scripts/worktree-port.sh',
    `${DEV_PORT_BASE}`,
  ])
    .toString()
    .trim()
  return `http://localhost:${port}`
}

const BASE = process.env.CAST_BASE_URL ?? devServerUrl()

/** Widths the cast is expected at, and the one it is expected absent at. */
export const WIDTHS = [768, 1280, 1440, 1920] as const
/** Samples across one cycle. Fine enough that a fast arc still reports its ramp. */
const STEPS = 240

export interface Placement {
  readonly index: number
  readonly size: number
  readonly left: number
  readonly right: number
  readonly hitsColumn: boolean
  readonly hitsRail: boolean
  readonly hitsDock: boolean
  readonly offscreen: boolean
  /** Share of the member's own box carrying ink rather than page. */
  readonly coverage: number
}

export interface MotionReading {
  readonly name: string
  readonly durationMs: number
  /** Fastest the target moves anywhere in its cycle, in pixels per second. */
  readonly peak: number
  /** Share of the cycle spent inside the band the design standard bars. */
  readonly bandShare: number
}

export interface CastReport {
  readonly width: number
  readonly rendered: boolean
  readonly placements: readonly Placement[]
  readonly motion: readonly MotionReading[]
}

async function settle(page: Page): Promise<void> {
  await page.locator('[data-section="experience"]').scrollIntoViewIfNeeded()
  // Past the longest arrival delay plus its own duration, so nothing is read
  // mid-spawn. The behaviors are seeked rather than waited on.
  await page.waitForTimeout(1800)
}

async function readMotion(page: Page): Promise<MotionReading[]> {
  return page.evaluate(
    ({ steps, band }) => {
      const isCast = (animation: Animation) =>
        'animationName' in animation &&
        String(
          (animation as unknown as { animationName: string }).animationName,
        ).startsWith('cast-') &&
        // The aura rides the same terms so it travels with the figure, and it
        // is painted by a pseudo-element. This reads a target's box to get a
        // rate, and a pseudo has none of its own, so those readings come back
        // at 0.0px/s and every term the aura copies reports as sluggish. The
        // drawing is what carries the movement and is already measured here,
        // so its shadow is not a second reading.
        !(animation.effect as KeyframeEffect | null)?.pseudoElement

      const animations = document.getAnimations().filter(isCast)
      // Every cast animation pauses first. Seeking one while its siblings run
      // would fold their movement into its reading, since several of them
      // transform ancestors of the same element.
      for (const animation of animations) animation.pause()

      const byName = new Map<string, Animation>()
      for (const animation of animations) {
        const name = String(
          (animation as unknown as { animationName: string }).animationName,
        )
        // The spawn is an arrival rather than a behavior and is measured
        // nowhere, since it runs once and is meant to be seen.
        if (name === 'cast-spawn') continue
        if (!byName.has(name)) byName.set(name, animation)
      }

      const readings: Array<{
        name: string
        durationMs: number
        peak: number
        bandShare: number
      }> = []

      for (const [name, animation] of byName) {
        // `target` is on `KeyframeEffect` rather than on the base type the DOM
        // lib exposes here, so the narrowing is the type gap and not a cast to any.
        const target =
          (animation.effect as KeyframeEffect | null)?.target ?? null
        const timing = animation.effect?.getComputedTiming()
        const duration =
          typeof timing?.duration === 'number' ? timing.duration : 0
        if (!target || !duration) continue

        const stepMs = duration / steps
        let previous: DOMRect | null = null
        let peak = 0
        let inBand = 0
        let counted = 0

        for (let index = 0; index <= steps; index += 1) {
          animation.currentTime = index * stepMs
          const rect = target.getBoundingClientRect()
          if (previous) {
            // The corner rather than the centre, so a rotation registers: a
            // shape turning about its own middle moves no centre at all.
            const dx = rect.left - previous.left
            const dy = rect.top - previous.top
            const speed = (Math.hypot(dx, dy) / stepMs) * 1000
            peak = Math.max(peak, speed)
            if (speed >= band.low && speed <= band.high) inBand += 1
            counted += 1
          }
          previous = rect
        }

        readings.push({
          name,
          durationMs: Math.round(duration),
          peak: Number(peak.toFixed(1)),
          bandShare: counted ? Number((inBand / counted).toFixed(3)) : 0,
        })
      }

      for (const animation of animations) animation.play()
      return readings
    },
    { steps: STEPS, band: AMBIENT_BAND },
  )
}

async function readPlacements(page: Page): Promise<Placement[]> {
  const boxes = await page.evaluate(() => {
    const field = document.querySelector<HTMLElement>('[data-cast-field]')
    if (!field || getComputedStyle(field).display === 'none') return null
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

    return [...document.querySelectorAll('[data-cast-member]')].map(
      (member, index) => {
        const rect = member.getBoundingClientRect()
        return {
          index,
          size: Math.round(rect.width),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          height: Math.round(rect.height),
          hitsColumn: rect.right > column.left && rect.left < column.right,
          hitsRail: rail
            ? rect.left < rail.right && rect.right > rail.left
            : false,
          hitsDock: dock
            ? rect.left < dock.right && rect.right > dock.left
            : false,
          offscreen: rect.left < 0 || rect.right > window.innerWidth,
        }
      },
    )
  })

  if (!boxes) return []

  // Ink counted off rendered pixels. Geometry cannot tell a drawn member from
  // one that is not, and that difference has already cost this surface once: a
  // placement check reading boxes passed on all six while five were not painted.
  //
  // `omitBackground` is what makes the count mean anything. Without it the page
  // is captured behind the member and every pixel is opaque, which is a measure
  // that reports full coverage for an empty box.
  // The page color behind the member, read once. A capture cannot be taken
  // with a transparent background here: `omitBackground` clears the default
  // page canvas and not the background this page paints, so every pixel comes
  // back opaque and the guard reports full coverage for an empty box.
  const ground = await page.evaluate(() => {
    const context = document.createElement('canvas').getContext('2d')!
    context.fillStyle = getComputedStyle(document.body).backgroundColor
    context.fillRect(0, 0, 1, 1)
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data
    return [r, g, b] as [number, number, number]
  })

  const coverages: number[] = []
  for (const box of boxes) {
    const shot = await page
      .locator('[data-cast-member]')
      .nth(box.index)
      .screenshot()
      .catch(() => null)
    coverages.push(
      shot ? await inkShare(page, shot.toString('base64'), ground) : 0,
    )
  }

  return boxes.map((box, index) => ({
    index: box.index,
    size: box.size,
    left: box.left,
    right: box.right,
    hitsColumn: box.hitsColumn,
    hitsRail: box.hitsRail,
    hitsDock: box.hitsDock,
    offscreen: box.offscreen,
    coverage: Number(coverages[index].toFixed(3)),
  }))
}

/**
 * Share of a capture that differs from the page behind it, decoded by the
 * browser that drew it rather than by a byte heuristic.
 *
 * Two earlier versions of this reported full coverage for every member,
 * including one that was not painted at all. The first counted PNG bytes and
 * the second trusted alpha from a capture that had none. A guard passing
 * hardest exactly when the thing it watches has failed is worse than no guard,
 * so this one is verified against a member that has been hidden on purpose.
 */
async function inkShare(
  page: Page,
  base64: string,
  ground: readonly [number, number, number],
): Promise<number> {
  return page.evaluate(
    async ({ data, ground }) => {
      const image = new Image()
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
        image.src = 'data:image/png;base64,' + data
      })
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (!context) return 0
      context.drawImage(image, 0, 0)
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data
      let inked = 0
      const total = pixels.length / 4
      for (let index = 0; index < pixels.length; index += 4) {
        const distance =
          Math.abs(pixels[index] - ground[0]) +
          Math.abs(pixels[index + 1] - ground[1]) +
          Math.abs(pixels[index + 2] - ground[2])
        if (distance > 60) inked += 1
      }
      return total ? inked / total : 0
    },
    { data: base64, ground },
  )
}

export async function readCast(): Promise<{
  reports: CastReport[]
  motion: MotionReading[]
}> {
  const browser = await chromium.launch()
  const reports: CastReport[] = []
  let motion: MotionReading[]

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: 'no-preference',
    })
    const page = await context.newPage()

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await settle(page)

      const rendered = await page.evaluate(() => {
        const field = document.querySelector<HTMLElement>('[data-cast-field]')
        return Boolean(field) && getComputedStyle(field!).display !== 'none'
      })

      reports.push({
        width,
        rendered,
        placements: rendered ? await readPlacements(page) : [],
        motion: [],
      })
    }
    // Motion is read off a page carrying one member per behavior rather than
    // off the live section. The section assigns a subset, so measuring it leaves
    // every unassigned behavior unguarded, which is the one most likely to
    // reach a reader untested.
    await page.setContent(behaviorGrid('light'))
    await page.waitForTimeout(500)
    motion = await readMotion(page)
  } finally {
    await browser.close()
  }

  return { reports, motion }
}

if (import.meta.main) {
  const { reports, motion } = await readCast()

  for (const report of reports) {
    console.log(`\n=== ${report.width}px ===  rendered: ${report.rendered}`)
    for (const placement of report.placements) {
      const problems = [
        placement.hitsColumn && 'column',
        placement.hitsRail && 'rail',
        placement.hitsDock && 'dock',
        placement.offscreen && 'offscreen',
        placement.coverage < 0.02 && 'unpainted',
      ].filter(Boolean)
      console.log(
        `  #${placement.index} ${String(placement.size).padStart(3)}px ` +
          `${String(placement.left).padStart(4)}..${String(placement.right).padStart(4)}  ` +
          `ink ${(placement.coverage * 100).toFixed(1).padStart(5)}%  ` +
          (problems.length ? `PROBLEM ${problems.join(', ')}` : 'ok'),
      )
    }
  }

  console.log(
    `\n=== motion ===  band ${AMBIENT_BAND.low} to ${AMBIENT_BAND.high}px/s, ceiling ${BAND_SHARE_CEILING}`,
  )
  console.log(
    'animation            cycle    peak px/s   in band   declared peak   verdict',
  )
  for (const reading of motion) {
    const id = reading.name.replace(/^cast-/, '').replace(/-[lr]$/, '')
    const declared = BEHAVIORS[id as keyof typeof BEHAVIORS]
    const ok = reading.bandShare <= BAND_SHARE_CEILING
    console.log(
      `${reading.name.padEnd(20)} ${String(reading.durationMs).padStart(5)}ms ` +
        `${reading.peak.toFixed(1).padStart(10)} ` +
        `${(reading.bandShare * 100).toFixed(1).padStart(8)}% ` +
        `${String(declared?.peak ?? '?').padStart(14)}   ${ok ? 'ok' : 'IN BAND'}`,
    )
  }
}

if (import.meta.main) {
  // Every behavior in the vocabulary has to appear in the reading. A rename
  // that leaves a selector behind produces a behavior that animates nothing,
  // which no rate check can see because there is no rate to read.
  const { motion } = await readCast()
  const seen = new Set(
    motion.map((reading) =>
      reading.name.replace(/^cast-/, '').replace(/-[lr]$/, ''),
    ),
  )
  const missing = BEHAVIOR_IDS.filter((id) => !seen.has(id))
  if (missing.length) {
    console.log(`\nUNMEASURED: ${missing.join(', ')}`)
  }
}
