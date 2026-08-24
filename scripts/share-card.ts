/**
 * Renders the share card a link preview shows.
 *
 * Composed inside the built site rather than in a bare page, so the type is the
 * site's own Fraunces and the tokens are the ones it ships. A card drawn in a
 * fallback face is a card judged on the wrong letterforms.
 *
 * The mark leads and the claim sits beside it. Two earlier arrangements put the
 * name in the image at display weight, which is the same word twice in one
 * unfurl since every host prints the title alongside. Attribution stays, small
 * and under the claim, because a host shows the domain and not always the
 * person.
 *
 * The claim runs 22 characters to the line. Judged at 1200 a longer line looks
 * fuller, and a card is met at 400 to 600 in a feed and smaller in a compact
 * unfurl, where the longer setting goes thin and the shorter one holds. Judge
 * this downscaled or the reading is of a size nobody sees.
 *
 * The field plate is a margin crop of the hero's own live shader field, with a
 * pointer held at the mark so the card carries the same accent-gradient reveal
 * a real hover produces. It used to be a whole-page capture of the static
 * `page-ground` copy, which mounts with `animate: false` and never redraws
 * after its first paint: that source could not carry a gradient at all,
 * however long a pointer simulation waited. See `scripts/lib/capture-field.ts`.
 *
 * Run: bun scripts/share-card.ts, with the site served at CARD_BASE_URL.
 */
import { readFile, writeFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

import { CARD_CLAIM as CLAIM } from './card-copy'
import { captureFieldPlate, renderOnRealPage } from './lib/capture-field'

// The size every host accepts. LinkedIn asks 1200x627 and X 1200x628, both of
// which this covers, and Discord scales whatever it is given.
const WIDTH = 1200
const HEIGHT = 630
const MARK_SIZE = 210
const MARK_PADDING = 84

const SITE = process.env.CARD_BASE_URL ?? 'http://localhost:4400'
const OUT = 'public/og.png'

// The hero's own column is a centered `max-width: 48rem` (768px) strip the
// field damps hardest inside. Cropping from the left margin avoids it, the
// same rule `scripts/avatar-field.ts` follows.
const COLUMN_MAX = 768
const MARGIN_BUFFER = 96
const CAPTURE_W = 3600
const CAPTURE_H = 1200
const columnLeft = (CAPTURE_W - COLUMN_MAX) / 2
const cropX = MARGIN_BUFFER
const cropY = (CAPTURE_H - HEIGHT) / 2
if (cropX + WIDTH + MARGIN_BUFFER > columnLeft) {
  throw new Error('card crop reaches the damped column: widen CAPTURE_W')
}

// Judged against three other placements served live: on the mark itself,
// below it into the open margin, and toward the text column. This one, up
// and to the left of the mark into the frame's empty corner, was the pick,
// separated from both the mark and the text rather than competing with
// either for attention.
const pointerAt = {
  x: cropX + MARK_PADDING + MARK_SIZE / 2 - 120,
  y: cropY + HEIGHT / 2 - 110,
}

// Read from the one drawing rather than copied into this file, so the card
// cannot drift from the tab, the home screen, and the avatar that
// `scripts/brand.ts` renders from the same source. The mark carries no width or
// height of its own, so the host sizes it.
const MARK = await readFile('src/assets/brand/mark.svg', 'utf8')

const browser = await chromium.launch()

// A throw anywhere below leaves the browser running otherwise, and the ordinary
// mistake reaches it: `goto` throws whenever CARD_BASE_URL is not being served.
try {
  const field = await captureFieldPlate(browser, {
    url: SITE,
    captureWidth: CAPTURE_W,
    captureHeight: CAPTURE_H,
    crop: { x: cropX, y: cropY, width: WIDTH, height: HEIGHT },
    pointerAt,
  })

  const card = await renderOnRealPage(browser, {
    url: SITE,
    width: WIDTH,
    height: HEIGHT,
    markup: `
      <style>.card-mark > svg { display:block; width:100%; height:100% }</style>
      <div style="position:fixed;inset:0;background:var(--background);overflow:hidden">
        <img src="data:image/png;base64,${field.toString('base64')}"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
        <div style="position:absolute;inset:0;padding:0 ${MARK_PADDING}px;display:flex;
          align-items:center;gap:64px">
          <span class="card-mark" style="width:${MARK_SIZE}px;height:${MARK_SIZE}px;flex:none;
            display:block;color:var(--foreground)">${MARK}</span>
          <div style="display:flex;flex-direction:column;gap:22px">
            <p style="margin:0;font-family:var(--font-display);font-size:44px;
              line-height:1.2;color:var(--foreground);max-width:22ch">${CLAIM}</p>
            <p style="margin:0;font-size:23px;color:var(--muted-foreground)">Eric Le · erclx.dev</p>
          </div>
        </div>
      </div>`,
  })
  await writeFile(OUT, card)
} finally {
  await browser.close()
}

console.log(`${OUT}  ${WIDTH}x${HEIGHT}`)
