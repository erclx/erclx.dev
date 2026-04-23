import { mkdir } from 'node:fs/promises'

import type { Page } from '@playwright/test'
import { chromium } from '@playwright/test'

const BASE_URL = 'http://localhost:4321'
const OUTPUT_DIR = 'screenshots'

const ROUTES = [
  { name: 'home-desktop', path: '/', viewport: { width: 1440, height: 900 } },
  { name: 'home-mobile', path: '/', viewport: { width: 390, height: 844 } },
] as const

type State = { name: string; setup?: (page: Page) => Promise<void> }

const STATES: State[] = [
  { name: 'light' },
  {
    name: 'dark',
    setup: async (page) => {
      await page.emulateMedia({ colorScheme: 'dark' })
    },
  },
]

await mkdir(OUTPUT_DIR, { recursive: true })

const browser = await chromium.launch()
try {
  for (const route of ROUTES) {
    for (const state of STATES) {
      const context = await browser.newContext({ viewport: route.viewport })
      const page = await context.newPage()
      if (state.setup) await state.setup(page)
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' })
      const file = `${OUTPUT_DIR}/${route.name}-${state.name}.png`
      await page.screenshot({ path: file, fullPage: true })
      console.log(`✓ ${file}`)
      await context.close()
    }
  }
} finally {
  await browser.close()
}
