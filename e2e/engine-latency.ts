import { execFileSync } from 'node:child_process'

import {
  type Browser,
  chromium,
  firefox,
  type Page,
  webkit,
} from '@playwright/test'

// Times a handful of primitive actions per engine, isolated from a served
// page's own rendering cost, to say which action type carries the gate's
// chromium-against-firefox-and-webkit gap rather than only that a gap exists.
//
// The task's per-spec table already shows a broad, non-flat excess that tracks
// how much interaction a spec drives rather than how many tests it holds:
// `focus-ring`, which walks every control on six pages, runs at the top of the
// spread. This instrument drives the same primitives that walk performs,
// navigation, evaluate, click, hover, and Tab, each in isolation and repeated,
// so a mean-per-action figure can be read against the per-spec ratios rather
// than reasoned about from the suite's own timing.
//
// Run: bun e2e/engine-latency.ts
// Reps: ENGINE_LATENCY_REPS=50 bun e2e/engine-latency.ts

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

const BASE = process.env.ENGINE_LATENCY_BASE_URL ?? devServerUrl()
const REPS = Number(process.env.ENGINE_LATENCY_REPS) || 15
// A bare localhost round trip resolves in single-digit milliseconds. This
// bounds every action alike, including the ones Playwright itself gives no
// `timeout` option for, so a contended stall costs seconds rather than
// Playwright's own 30s default and the probe still finishes on a noisy
// machine.
const ACTION_TIMEOUT_MS = 4_000
const ROUTE = '/'
// A control that toggles in place. Clicking and hovering it drives a real
// actionability check and a real style read without leaving the page, which
// is what every reading below needs to stay comparable across reps.
const TOGGLE_SELECTOR = '[data-theme-toggle]'

const ENGINES = { chromium, firefox, webkit } as const
type EngineName = keyof typeof ENGINES
const ACTIONS = ['navigate', 'evaluate', 'click', 'hover', 'tab'] as const
type ActionName = (typeof ACTIONS)[number]

type ActionResult = { readonly durations: number[]; readonly dropped: number }
type Timing = Record<ActionName, ActionResult>

class RepTimeout extends Error {}

/** Bounds one action against `ACTION_TIMEOUT_MS`, whether or not the call
 * Playwright makes has a `timeout` option of its own. */
async function withTimeout(action: () => Promise<void>): Promise<void> {
  let timer: ReturnType<typeof setTimeout>
  await Promise.race([
    action(),
    new Promise<void>((_, reject) => {
      timer = setTimeout(
        () => reject(new RepTimeout(`stalled past ${ACTION_TIMEOUT_MS}ms`)),
        ACTION_TIMEOUT_MS,
      )
    }),
  ]).finally(() => clearTimeout(timer))
}

/**
 * A shared, contended sandbox occasionally stalls an action well past what a
 * bare localhost round trip needs. A stalled rep is dropped from the mean
 * rather than crashing the whole probe, and the drop is reported so a reader
 * can tell a thin sample from a full one.
 */
async function timeReps(
  reps: number,
  action: () => Promise<void>,
): Promise<ActionResult> {
  const durations: number[] = []
  let dropped = 0
  for (let i = 0; i < reps; i++) {
    const start = performance.now()
    try {
      await withTimeout(action)
      durations.push(performance.now() - start)
    } catch (error) {
      dropped++
      console.warn(`rep dropped: ${String(error)}`)
    }
  }
  return { durations, dropped }
}

async function measureEngine(browser: Browser, reps: number): Promise<Timing> {
  const page: Page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  })

  // Warm the page and its caches once, uncounted, so the first counted
  // navigation is not also paying for cold compilation. Bounded the same way
  // as every counted rep, so a stall here fails fast rather than riding
  // Playwright's own 30s default. One retry, since a cold launch is the
  // single point in the run with nothing already warmed to fall back on.
  const warm = async () => {
    await withTimeout(async () => {
      await page.goto(BASE + ROUTE, { waitUntil: 'domcontentloaded' })
    })
  }
  await warm().catch(warm)

  const navigate = await timeReps(reps, async () => {
    await page.goto(BASE + ROUTE, { waitUntil: 'domcontentloaded' })
  })

  // Raw protocol round trip with nothing to render, isolating dispatch
  // overhead from any DOM or paint cost the other actions also carry.
  const evaluate = await timeReps(reps, async () => {
    await page.evaluate(() => 1)
  })

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  const toggle = page.locator(TOGGLE_SELECTOR)
  const click = await timeReps(reps, async () => {
    await toggle.click()
  })

  const hover = await timeReps(reps, async () => {
    await toggle.hover()
    await page.mouse.move(2, 2)
  })

  // The primitive `focus-ring.spec.ts` drives per control on six pages in
  // both themes, which the task's table names as the widest chromium-firefox
  // ratio in the suite.
  const tab = await timeReps(reps, async () => {
    await page.keyboard.press('Tab')
  })

  await page.close()
  return { navigate, evaluate, click, hover, tab }
}

function timingFor(results: Map<EngineName, Timing>, name: EngineName): Timing {
  const timing = results.get(name)
  if (!timing) throw new Error(`no timing recorded for ${name}`)
  return timing
}

function mean(result: ActionResult): number {
  const { durations } = result
  if (durations.length === 0) return NaN
  return durations.reduce((sum, value) => sum + value, 0) / durations.length
}

function formatMs(value: number): string {
  return Number.isNaN(value) ? 'n/a' : `${value.toFixed(1)}ms`
}

const reps = REPS
const environment = process.env.CI
  ? `CI=${process.env.CI} on this machine, not a GitHub runner`
  : 'local, CI unset — read this as a fact about this machine rather than the runner'

console.log(`base: ${BASE}`)
console.log(`reps per action: ${reps}`)
console.log(`environment: ${environment}`)
console.log('')

const results = new Map<EngineName, Timing>()
for (const [name, launcher] of Object.entries(ENGINES) as [
  EngineName,
  (typeof ENGINES)[EngineName],
][]) {
  const browser = await launcher.launch()
  const timing = await measureEngine(browser, reps)
  await browser.close()
  results.set(name, timing)
  const dropped = ACTIONS.reduce((sum, a) => sum + timing[a].dropped, 0)
  console.log(
    `measured ${name}${dropped > 0 ? ` (${dropped} reps dropped)` : ''}`,
  )
  // A settle between engines, since the sandbox this instrument was built
  // against runs other processes and a launch landing mid-contention read as
  // an engine defect rather than as shared-machine noise.
  await new Promise((resolve) => setTimeout(resolve, 5000))
}

console.log('')
console.log('='.repeat(78))
console.log('MEAN LATENCY PER ACTION (ms)')
console.log('='.repeat(78))

console.log(
  `${''.padEnd(12)} ${'chromium'.padStart(10)} ${'firefox'.padStart(10)} ${'webkit'.padStart(10)}`,
)
for (const action of ACTIONS) {
  const c = mean(timingFor(results, 'chromium')[action])
  const f = mean(timingFor(results, 'firefox')[action])
  const w = mean(timingFor(results, 'webkit')[action])
  console.log(
    `${action.padEnd(12)} ${formatMs(c).padStart(10)} ${formatMs(f).padStart(10)} ${formatMs(w).padStart(10)}`,
  )
}

console.log('')
console.log('='.repeat(78))
console.log('CHROMIUM RATIO AGAINST THE OTHER TWO')
console.log('='.repeat(78))
for (const action of ACTIONS) {
  const c = mean(timingFor(results, 'chromium')[action])
  const f = mean(timingFor(results, 'firefox')[action])
  const w = mean(timingFor(results, 'webkit')[action])
  console.log(
    `${action.padEnd(12)} vs firefox ${(c / f).toFixed(2)}x   vs webkit ${(c / w).toFixed(2)}x`,
  )
}
