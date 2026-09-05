import { chromium } from '@playwright/test'
import { mkdir, rm } from 'fs/promises'
import path from 'path'

import { settleLazyImages } from './lazy-images'
import { settleScroll } from './scroll'

const LANDING_SECTIONS = [
  'header',
  'about',
  'experience',
  'projects',
  'looking-for',
  'footer',
] as const
type Section = (typeof LANDING_SECTIONS)[number]

// A case study is one long prose surface rather than a stack of distinct ones,
// so it is captured whole and its `id` headings are not capture targets.
const CASE_STUDY_ROUTES = [
  'canon',
  'jobtriage',
  'diction',
  'stackr',
  'caret',
] as const

interface Viewport {
  readonly name: string
  readonly width: number
  readonly height: number
}

const VIEWPORTS: readonly Viewport[] = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 800 },
]

// Narrow catches a landing section wrapping at 320px. Long-form prose reflows
// instead of breaking, so a route takes the other two widths only.
const ROUTE_VIEWPORTS = VIEWPORTS.filter(
  (viewport) => viewport.name !== 'narrow',
)

type Theme = 'light' | 'dark'
const THEMES: readonly Theme[] = ['light', 'dark']

interface CaseBase {
  readonly url: string
  readonly viewport: Viewport
  readonly theme: Theme
  readonly label: string
  readonly dir: string
}

interface SectionCase extends CaseBase {
  readonly kind: 'section'
  readonly section: Section
}

interface PageCase extends CaseBase {
  readonly kind: 'page'
}

type Case = SectionCase | PageCase

const SECTION_CASES: readonly SectionCase[] = LANDING_SECTIONS.flatMap(
  (section) =>
    VIEWPORTS.flatMap((viewport) =>
      THEMES.map(
        (theme): SectionCase => ({
          kind: 'section',
          url: '/',
          section,
          viewport,
          theme,
          label: `${section}/${viewport.name}--${theme}`,
          dir: section,
        }),
      ),
    ),
)

const PAGE_CASES: readonly PageCase[] = CASE_STUDY_ROUTES.flatMap((route) =>
  ROUTE_VIEWPORTS.flatMap((viewport) =>
    THEMES.map(
      (theme): PageCase => ({
        kind: 'page',
        url: `/${route}`,
        viewport,
        theme,
        label: `${route}/${viewport.name}--${theme}`,
        dir: route,
      }),
    ),
  ),
)

const ALL_CASES: readonly Case[] = [...SECTION_CASES, ...PAGE_CASES]

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:4173'
const OUT_DIR = '.canon/review/screenshots'
const SCREENSHOT_FILTER = process.env.SCREENSHOT_FILTER?.trim() || null

const filterTerms = SCREENSHOT_FILTER
  ? SCREENSHOT_FILTER.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : []

const cases =
  filterTerms.length > 0
    ? ALL_CASES.filter((c) =>
        filterTerms.some((term) => c.label.includes(term)),
      )
    : ALL_CASES

if (filterTerms.length > 0 && cases.length === 0) {
  console.error(
    `No cases matched SCREENSHOT_FILTER=${SCREENSHOT_FILTER}. Available labels:\n${ALL_CASES.map(
      (c) => `  ${c.label}`,
    ).join('\n')}`,
  )
  process.exit(1)
}

if (filterTerms.length > 0) {
  console.log(
    `Filtered to ${cases.length} case(s) matching "${SCREENSHOT_FILTER}". Skipping output-dir wipe.`,
  )
} else {
  await rm(OUT_DIR, { recursive: true, force: true })
}
await mkdir(OUT_DIR, { recursive: true })

const browser = await chromium.launch()

for (const c of cases) {
  const ctx = await browser.newContext({
    viewport: { width: c.viewport.width, height: c.viewport.height },
    reducedMotion: 'reduce',
    colorScheme: c.theme,
  })
  const page = await ctx.newPage()

  await page.goto(new URL(c.url, BASE_URL).href)
  await page.waitForLoadState('networkidle')
  await settleLazyImages(page)

  const caseDir = path.join(OUT_DIR, c.dir)
  await mkdir(caseDir, { recursive: true })
  const file = path.join(caseDir, `${c.viewport.name}--${c.theme}.png`)

  // Settled on the fonts actually being ready to paint, which every capture
  // needs whether or not it scrolls, rather than paused for a span that
  // guessed at both a scroll settling and a font swap at once.
  await page.evaluate(() => document.fonts.ready)

  if (c.kind === 'section') {
    const target = page.locator(`[data-section="${c.section}"]`).first()
    await target.waitFor({ state: 'visible', timeout: 10_000 })
    await target.scrollIntoViewIfNeeded()
    await settleScroll(page)
    await target.screenshot({ path: file })
  } else {
    await page.screenshot({ path: file, fullPage: true })
  }

  console.log(`captured ${file}`)

  await ctx.close()
}

await browser.close()
