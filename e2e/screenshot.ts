import { chromium } from '@playwright/test'
import { mkdir, rm } from 'fs/promises'
import path from 'path'

const SECTIONS = [
  'header',
  'origin',
  'projects',
  'looking-for',
  'footer',
] as const
type Section = (typeof SECTIONS)[number]

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

type Theme = 'light' | 'dark'
const THEMES: readonly Theme[] = ['light', 'dark']

interface Case {
  readonly section: Section
  readonly viewport: Viewport
  readonly theme: Theme
  readonly label: string
}

const ALL_CASES: readonly Case[] = SECTIONS.flatMap((section) =>
  VIEWPORTS.flatMap((viewport) =>
    THEMES.map((theme) => ({
      section,
      viewport,
      theme,
      label: `${section}/${viewport.name}--${theme}`,
    })),
  ),
)

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://localhost:4173'
const OUT_DIR = '.claude/review/screenshots'
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

  await page.goto(BASE_URL)
  await page.waitForLoadState('networkidle')

  const target = page.locator(`[data-section="${c.section}"]`).first()
  await target.waitFor({ state: 'visible', timeout: 10_000 })
  await target.scrollIntoViewIfNeeded()
  await page.waitForTimeout(200)

  const sectionDir = path.join(OUT_DIR, c.section)
  await mkdir(sectionDir, { recursive: true })
  const file = path.join(sectionDir, `${c.viewport.name}--${c.theme}.png`)
  await target.screenshot({ path: file })
  console.log(`captured ${file}`)

  await ctx.close()
}

await browser.close()
