import type { Page } from '@playwright/test'
import { chromium } from '@playwright/test'
import { mkdir, readdir, unlink } from 'fs/promises'
import path from 'path'

const ROUTES = [
  { name: 'home-desktop', path: '/', width: 1280, height: 800 },
  { name: 'home-mobile', path: '/', width: 390, height: 844 },
  { name: 'home-narrow', path: '/', width: 320, height: 800 },
]

type State = { name: string; setup?: (page: Page) => Promise<void> }
const STATES: State[] = [
  { name: 'light' },
  { name: 'dark', setup: async (p) => p.emulateMedia({ colorScheme: 'dark' }) },
]

type Case = {
  label: string
  route: (typeof ROUTES)[number]
  state: State
}

const ALL_CASES: Case[] = ROUTES.flatMap((route) =>
  STATES.map((state) => ({
    label: `${route.name}--${state.name}`,
    route,
    state,
  })),
)

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:4173'
const OUT_DIR = '.claude/review/screenshots'
const SCREENSHOT_FILTER = process.env.SCREENSHOT_FILTER?.trim() || null

const cases = SCREENSHOT_FILTER
  ? ALL_CASES.filter((c) => c.label.includes(SCREENSHOT_FILTER))
  : ALL_CASES

if (SCREENSHOT_FILTER && cases.length === 0) {
  console.error(
    `No cases matched SCREENSHOT_FILTER=${SCREENSHOT_FILTER}. Available labels:\n${ALL_CASES.map(
      (c) => `  ${c.label}`,
    ).join('\n')}`,
  )
  process.exit(1)
}

await mkdir(OUT_DIR, { recursive: true })

async function wipeOutDir() {
  const entries = await readdir(OUT_DIR)
  await Promise.all(
    entries
      .filter((f) => f.endsWith('.png'))
      .map((f) => unlink(path.join(OUT_DIR, f))),
  )
}

if (SCREENSHOT_FILTER) {
  console.log(
    `Filtered to ${cases.length} case(s) matching "${SCREENSHOT_FILTER}". Skipping output-dir wipe.`,
  )
} else {
  await wipeOutDir()
}

const browser = await chromium.launch()

for (const { label, route, state } of cases) {
  const ctx = await browser.newContext({
    viewport: { width: route.width, height: route.height },
    reducedMotion: 'reduce',
  })
  const page = await ctx.newPage()

  if (state.setup) await state.setup(page)

  await page.goto(`${BASE_URL}${route.path}`)
  await page.waitForLoadState('networkidle')

  const file = path.join(OUT_DIR, `${label}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`captured ${file}`)

  await ctx.close()
}

await browser.close()
