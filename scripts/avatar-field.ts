/**
 * Renders the dark streamline avatar: the mark composited over a crop of the
 * hero's own live shader field, with a pointer held nearby so the accent
 * gradient a real hover produces is baked into the still. Geometry and
 * pointer placement were picked from four prototyped candidates, served live
 * and judged against a real capture rather than guessed.
 *
 * The crop sits in the hero's right margin, clear of the centered
 * `max-width: 48rem` column the field damps around (see `capture-field.ts`
 * and `.claude/ARCHITECTURE.md` § "A landing-page figure sits inside the text
 * column" for the general rule this is an instance of).
 *
 * Two sizes come from one CSS-pixel geometry rather than two different
 * capture widths, since the field's own scale divides by the canvas's CSS
 * width: capturing the same crop at `deviceScaleFactor` 1 and 2 renders the
 * identical composition at two physical resolutions, where widening the
 * capture viewport for a "2x" pass would have changed the field's density
 * along with the size.
 *
 * Run: bun scripts/avatar-field.ts, with the site served at CARD_BASE_URL.
 */
import { readFile, writeFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

import { captureFieldPlate, renderOnRealPage } from './lib/capture-field'

const SITE = process.env.CARD_BASE_URL ?? 'http://localhost:4400'
const FRAME = 1024
const MARK_SCALE = 0.55
const MARK_INK = '#F4EFE6'

// The hero's own column is a centered `max-width: 48rem` (768px) strip the
// field damps hardest inside. Cropping from the margin avoids it.
const COLUMN_MAX = 768
const MARGIN_BUFFER = 96
const CAPTURE_W = 3200
const CAPTURE_H = 1600
const columnRight = CAPTURE_W - (CAPTURE_W - COLUMN_MAX) / 2
const cropX = columnRight + MARGIN_BUFFER
const cropY = (CAPTURE_H - FRAME) / 2

// Toward the lower-left (inward, toward the column) at 420px, judged against
// three other distances and two other angles served live. 230px is the
// site's own reveal radius: centering the pointer under the mark would put
// the whole glow behind it, since the mark's own half-width (281px at this
// scale) already exceeds that radius.
const GLOW_ANGLE_DEG = 135
const GLOW_DISTANCE = 420
const glowRad = (GLOW_ANGLE_DEG * Math.PI) / 180
const pointerAt = {
  x: cropX + FRAME / 2 + Math.cos(glowRad) * GLOW_DISTANCE,
  y: cropY + FRAME / 2 + Math.sin(glowRad) * GLOW_DISTANCE,
}

const MARK = await readFile('src/assets/brand/mark.svg', 'utf8')

const compose = (field: Buffer) => `
  <style>.avatar-mark > svg { display:block; width:100%; height:100% }</style>
  <div style="position:fixed;inset:0;overflow:hidden">
    <img src="data:image/png;base64,${field.toString('base64')}"
      style="position:absolute;inset:0;width:100%;height:100%">
    <div class="avatar-mark" style="position:absolute;color:${MARK_INK};
      width:${100 * MARK_SCALE}%;height:${100 * MARK_SCALE}%;
      left:${(50 * (1 - MARK_SCALE)).toFixed(3)}%;top:${(50 * (1 - MARK_SCALE)).toFixed(3)}%;">${MARK}</div>
  </div>`

const browser = await chromium.launch()

try {
  for (const [suffix, deviceScaleFactor] of [
    ['', 1],
    ['@2x', 2],
  ] as const) {
    const field = await captureFieldPlate(browser, {
      url: SITE,
      captureWidth: CAPTURE_W,
      captureHeight: CAPTURE_H,
      crop: { x: cropX, y: cropY, width: FRAME, height: FRAME },
      pointerAt,
      deviceScaleFactor,
    })

    const composed = await renderOnRealPage(browser, {
      url: SITE,
      width: FRAME * deviceScaleFactor,
      height: FRAME * deviceScaleFactor,
      markup: compose(field),
    })

    const file = `public/avatar/dark-field${suffix}.png`
    await writeFile(file, composed)
    console.log(`${file.padEnd(30)} ${FRAME * deviceScaleFactor}px`)
  }
} finally {
  await browser.close()
}
