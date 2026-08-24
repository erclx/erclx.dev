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
// The site's own `--card` in dark: `--background` dark lifted one step
// rather than the mark's near-black ink inverted, so the ground separates
// from Discord's (~#313338) and GitHub dark's (~#0d1117) chrome instead of
// reading as flat black against flat black.
const DARK_GROUND = 'oklch(0.248 0.009 74)'

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
    file: 'public/avatar/light.png',
    size: 1024,
    ground: CREAM,
    ink: INK,
    scale: 0.62,
    radius: 0,
    note: 'naked light avatar, cropped to a circle by the hosts that show one',
  },
  {
    file: 'public/avatar/light@2x.png',
    size: 2048,
    ground: CREAM,
    ink: INK,
    scale: 0.62,
    radius: 0,
    note: 'naked light avatar, @2x',
  },
  {
    file: 'public/avatar/dark.png',
    size: 1024,
    ground: DARK_GROUND,
    ink: CREAM,
    scale: 0.62,
    radius: 0,
    note: 'naked dark avatar',
  },
  {
    file: 'public/avatar/dark@2x.png',
    size: 2048,
    ground: DARK_GROUND,
    ink: CREAM,
    scale: 0.62,
    radius: 0,
    note: 'naked dark avatar, @2x',
  },
]

const source = await readFile('src/assets/brand/mark.svg', 'utf8')

const browser = await chromium.launch()

// A throw anywhere below leaves the browser running otherwise, and a headless
// chromium nothing owns survives the script that started it.
try {
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
} finally {
  await browser.close()
}
