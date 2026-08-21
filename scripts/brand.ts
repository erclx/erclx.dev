/**
 * Renders the brand mark to rasters at the sizes that need one.
 *
 * One drawing at `src/assets/brand/mark.svg` produces all of them, so the tab,
 * the home screen, and the avatar cannot drift from each other. The rasters are
 * generated here rather than synced in, because this repository owns the mark.
 *
 * Each size is drawn at its own dimensions rather than reduced from a large
 * one. Measured on this mark the two paths are within nine bright pixels of
 * each other, so the choice costs almost nothing, and drawing at size is what
 * stays true if the mark ever gains detail that a reduction would average away.
 *
 * Run: bun scripts/brand.ts
 */
import { readFile, writeFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

const INK = '#1A1815'
const CREAM = '#F4EFE6'

interface Raster {
  readonly file: string
  readonly size: number
  /** Null leaves the ground transparent. */
  readonly ground: string | null
  readonly ink: string
  /** Fraction of the frame the mark occupies, leaving the rest as margin. */
  readonly scale: number
  /** Corner radius as a fraction of the frame, for a ground that has corners. */
  readonly radius: number
  readonly note: string
}

const rasters: readonly Raster[] = [
  {
    file: 'public/favicon-32.png',
    size: 32,
    ground: CREAM,
    ink: INK,
    scale: 0.84,
    radius: 0.2,
    note: 'tab fallback for engines that ignore an SVG favicon',
  },
  {
    file: 'public/apple-touch-icon.png',
    size: 180,
    ground: CREAM,
    ink: INK,
    scale: 0.68,
    radius: 0,
    note: 'home screen, which applies its own mask, so the ground stays square',
  },
  {
    file: 'public/avatar.png',
    size: 512,
    ground: CREAM,
    ink: INK,
    scale: 0.62,
    radius: 0,
    note: 'profile avatar, cropped to a circle by the hosts that show one',
  },
]

const source = await readFile('src/assets/brand/mark.svg', 'utf8')

const browser = await chromium.launch()

for (const raster of rasters) {
  const context = await browser.newContext({
    viewport: { width: raster.size, height: raster.size },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // The mark carries `currentColor`, so the ink is set on the host element and
  // inherited rather than rewritten into the file.
  await page.setContent(
    `<style>
       html, body { margin:0; width:100%; height:100%; }
       body { display:flex; align-items:center; justify-content:center;
              background:${raster.ground ?? 'transparent'}; color:${raster.ink};
              border-radius:${raster.size * raster.radius}px; overflow:hidden; }
       svg { display:block; width:${raster.size * raster.scale}px;
             height:${raster.size * raster.scale}px; }
     </style>${source}`,
  )

  const buffer = await page.screenshot({
    omitBackground: raster.ground === null,
    type: 'png',
  })
  await writeFile(raster.file, buffer)
  await context.close()
  console.log(`${raster.file.padEnd(30)} ${raster.size}px  ${raster.note}`)
}

await browser.close()
