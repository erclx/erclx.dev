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
 * Run: bun scripts/share-card.ts, with the site served at CARD_BASE_URL.
 */
import { writeFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

import { CARD_CLAIM as CLAIM } from './card-copy'

// The size every host accepts. LinkedIn asks 1200x627 and X 1200x628, both of
// which this covers, and Discord scales whatever it is given.
const WIDTH = 1200
const HEIGHT = 630

const SITE = process.env.CARD_BASE_URL ?? 'http://localhost:4400'
const OUT = 'public/og.png'

const MARK = `<svg viewBox="9.5 9.5 81 81" style="width:100%;height:100%">
  <path d="M 67.5 50 A 25 25 0 1 0 56.84 70.48" fill="none" stroke="currentColor"
    stroke-width="10" stroke-linecap="round"/>
  <path d="M 17.5 50 L 67.5 50" fill="none" stroke="currentColor"
    stroke-width="10" stroke-linecap="round"/>
  <rect x="74.5" y="21" width="13" height="58" rx="1.5" fill="currentColor"/>
</svg>`

const browser = await chromium.launch()

// The ground alone, at the card's own aspect so its contours are not stretched.
// Every other element is hidden first: shooting the canvas while content sits
// over it bakes the hero's own text into the image, which it once did.
const fieldContext = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
})
const fieldPage = await fieldContext.newPage()
await fieldPage.addInitScript(() => localStorage.setItem('theme', 'dark'))
await fieldPage.goto(SITE, { waitUntil: 'networkidle' })
await fieldPage.waitForTimeout(1600)
await fieldPage.addStyleTag({
  content: `body > *:not([data-page-ground]) { visibility: hidden !important }
            [data-page-ground] { visibility: visible !important }`,
})
await fieldPage.waitForTimeout(300)
const fieldShot = await fieldPage.screenshot({ type: 'png' })
await fieldContext.close()
const field = `data:image/png;base64,${fieldShot.toString('base64')}`

const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
})
const page = await context.newPage()
await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
// Navigated rather than set, so the head keeps the site's fonts and tokens.
await page.goto(SITE, { waitUntil: 'networkidle' })
await page.evaluate(
  ({ markup }) => {
    document.documentElement.classList.add('dark')
    document.body.innerHTML = markup
  },
  {
    markup: `
      <div style="position:fixed;inset:0;background:var(--background);overflow:hidden">
        <img src="${field}"
          style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
        <div style="position:absolute;inset:0;padding:0 84px;display:flex;
          align-items:center;gap:64px">
          <span style="width:210px;height:210px;flex:none;display:block;
            color:var(--foreground)">${MARK}</span>
          <div style="display:flex;flex-direction:column;gap:22px">
            <p style="margin:0;font-family:var(--font-display);font-size:44px;
              line-height:1.2;color:var(--foreground);max-width:22ch">${CLAIM}</p>
            <p style="margin:0;font-size:23px;color:var(--muted-foreground)">Eric Le · erclx.dev</p>
          </div>
        </div>
      </div>`,
  },
)
await page.waitForTimeout(800)
const card = await page.screenshot({ type: 'png' })
await writeFile(OUT, card)
await context.close()
await browser.close()

console.log(`${OUT}  ${WIDTH}x${HEIGHT}`)
