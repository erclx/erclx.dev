import { execFileSync } from 'node:child_process'

import { chromium, type Page } from '@playwright/test'

import { WATCHED_SELECTORS } from './reveal-selectors'

// Walks every page and reports which blocks a reader sees arrive and which are
// simply there, then traces what the first screen actually does frame by frame.
//
// It exists because reveal is opt-in. A block carries `data-fade` or it does
// not, and nothing reports the ones that do not, so a surface built after the
// primitive shipped renders static beside neighbors that animate and only an
// operator watching a reload ever finds out.
//
// Two passes, because the attribute and the behavior are different claims. The
// structural pass reads what is wired. The trace reads opacity per frame from
// first paint, which is the only way to catch a block that is wired and still
// arrives instantly because something else placed it.
//
// Run: bun e2e/reveal-inventory.ts
// Filter: REVEAL_FILTER=/,jobtriage bun e2e/reveal-inventory.ts

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

const BASE = process.env.REVEAL_BASE_URL ?? devServerUrl()
const FILTER = process.env.REVEAL_FILTER?.split(',').map((t) => t.trim())

const ROUTES = ['/', '/aitk', '/jobtriage', '/stackr', '/caret', '/diction']

/** How long the trace watches, past the 700ms fade plus its longest delay. */
const TRACE_MS = 1800

/** Under this and a block is chrome or a spacer rather than something read. */
const MIN_AREA = 240

interface StaticBlock {
  readonly section: string
  readonly label: string
  readonly tag: string
  readonly box: string
}

interface Coverage {
  readonly route: string
  readonly revealed: number
  readonly staticCount: number
  readonly blocks: StaticBlock[]
}

interface Trace {
  readonly label: string
  /** Opacity at the first frame after paint. Below 1 means it animated in. */
  readonly first: number
  readonly settled: number
  /** Milliseconds from first paint until it stopped changing. */
  readonly settledAt: number
}

async function readCoverage(page: Page, route: string): Promise<Coverage> {
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  // Everything below the fold has to have been observed, or the count reads the
  // reader's scroll position rather than the page.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)

  return page.evaluate(
    ({ minArea, routeName }) => {
      const CANDIDATE =
        'h1, h2, h3, h4, p, li, figure, blockquote, img, picture, video, [data-section] > *'

      const seen = [...document.querySelectorAll<HTMLElement>(CANDIDATE)]
      const visible = seen.filter((element) => {
        const box = element.getBoundingClientRect()
        if (box.width * box.height < minArea) return false
        const style = getComputedStyle(element)
        return style.visibility !== 'hidden' && style.display !== 'none'
      })

      const revealed = visible.filter((element) =>
        element.closest('[data-fade]'),
      )
      const unrevealed = visible.filter(
        (element) => !element.closest('[data-fade]'),
      )

      // A section wrapper carries no marker while everything inside it does,
      // so a plain outermost-static read reports every section on the page as
      // a finding. A container holding revealed content is wired, whatever its
      // own attributes say, and only a block with nothing revealed under it is
      // actually static.
      const genuinelyStatic = unrevealed.filter(
        (element) => !element.querySelector('[data-fade]'),
      )

      // Report the outermost of those rather than every leaf inside it, so a
      // surface carrying no reveal reads as one finding and not as forty.
      const outermost = genuinelyStatic.filter(
        (element) =>
          !genuinelyStatic.some(
            (other) => other !== element && other.contains(element),
          ),
      )

      const label = (element: HTMLElement) => {
        const own =
          (element.getAttribute('data-section') ??
          element.getAttribute('data-bar-mark') !== null)
            ? 'bar mark'
            : (element.textContent ?? '').trim().replace(/\s+/g, ' ')
        return own.slice(0, 58) || `<${element.tagName.toLowerCase()}>`
      }

      return {
        route: routeName,
        revealed: revealed.length,
        staticCount: outermost.length,
        blocks: outermost.map((element) => {
          const box = element.getBoundingClientRect()
          return {
            section:
              element.closest('[data-section]')?.getAttribute('data-section') ??
              'outside a section',
            label: label(element),
            tag: element.tagName.toLowerCase(),
            box: `${Math.round(box.width)}x${Math.round(box.height)}`,
          }
        }),
      }
    },
    { minArea: MIN_AREA, routeName: route },
  )
}

/**
 * Records opacity per frame from first paint for everything on the first
 * screen, so a block that is wired to reveal and still appears instantly is
 * separated from one that actually animates.
 */
async function readTrace(page: Page, route: string): Promise<Trace[]> {
  await page.addInitScript(
    ({ limit, watched }) => {
      const samples = new Map<string, { t: number; opacity: number }[]>()
      const start = performance.now()

      const describe = (element: Element) => {
        if (element.hasAttribute('data-bar-mark')) return 'bar mark'
        if (element.hasAttribute('data-toggle-host')) return 'theme toggle host'
        if (element.closest('[data-theme-toggle]')) return 'theme toggle'
        const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ')
        return `${element.tagName.toLowerCase()}: ${text.slice(0, 40)}`
      }

      const tick = () => {
        const t = performance.now() - start
        if (t > limit) return
        const onFirstScreen = [
          ...document.querySelectorAll<HTMLElement>(watched.join(', ')),
        ].filter((element) => {
          const box = element.getBoundingClientRect()
          return (
            box.top < window.innerHeight &&
            box.bottom > 0 &&
            box.width * box.height > 240
          )
        })

        // The reveal sets opacity on a wrapper, and a child inside it computes
        // its own opacity as 1 for the whole fade. Reading the element alone
        // therefore reports every heading and paragraph on the page as already
        // there while the reader watches it arrive. What a reader sees is the
        // product up the chain.
        const effectiveOpacity = (element: Element) => {
          let opacity = 1
          let node: Element | null = element
          while (node && node !== document.documentElement) {
            opacity *= Number(getComputedStyle(node).opacity)
            node = node.parentElement
          }
          return opacity
        }

        for (const element of onFirstScreen) {
          const key = describe(element)
          const series = samples.get(key) ?? []
          series.push({ t, opacity: effectiveOpacity(element) })
          samples.set(key, series)
        }
        requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
      Object.defineProperty(window, '__revealTrace', { get: () => samples })
    },
    { limit: TRACE_MS, watched: [...WATCHED_SELECTORS] },
  )

  await page.goto(BASE + route, { waitUntil: 'commit' })
  await page.waitForTimeout(TRACE_MS + 300)

  return page.evaluate(() => {
    const samples = (
      window as unknown as {
        __revealTrace: Map<string, { t: number; opacity: number }[]>
      }
    ).__revealTrace

    const out: Trace[] = []
    for (const [label, series] of samples) {
      if (series.length === 0) continue
      const first = series[0].opacity
      const settled = series[series.length - 1].opacity
      let settledAt = 0
      for (const point of series) {
        if (Math.abs(point.opacity - settled) > 0.01) settledAt = point.t
      }
      out.push({
        label,
        first: Number(first.toFixed(2)),
        settled: Number(settled.toFixed(2)),
        settledAt: Math.round(settledAt),
      })
    }
    return out
  })
}

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
})

const routes = FILTER
  ? ROUTES.filter((route) => FILTER.some((term) => route.includes(term)))
  : ROUTES

for (const route of routes) {
  const page = await context.newPage()
  const coverage = await readCoverage(page, route)

  console.log(`\n${'='.repeat(72)}\n${route}\n${'='.repeat(72)}`)
  console.log(
    `${coverage.revealed} blocks reveal, ${coverage.staticCount} do not.\n`,
  )
  for (const block of coverage.blocks) {
    console.log(
      `  static  ${block.section.padEnd(12)} ${block.tag.padEnd(7)} ${block.box.padEnd(10)} ${block.label}`,
    )
  }
  await page.close()

  const tracePage = await context.newPage()
  const trace = await readTrace(tracePage, route)
  console.log(`\n  first screen, opacity from first paint:`)
  for (const entry of trace.sort((a, b) => a.first - b.first)) {
    const verdict = entry.first < 0.99 ? 'arrives' : 'already there'
    console.log(
      `  ${verdict.padEnd(14)} ${String(entry.first).padEnd(6)} -> ${String(entry.settled).padEnd(6)} settled ${entry.settledAt}ms  ${entry.label}`,
    )
  }
  await tracePage.close()
}

await browser.close()
