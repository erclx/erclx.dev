/**
 * Renders the share card a link preview shows.
 *
 * Composed inside the built site rather than in a bare page, so the type is the
 * site's own Fraunces and the tokens are the ones it ships. A card drawn in a
 * fallback face is a card judged on the wrong letterforms.
 *
 * It carries the claim and the mark and no name. Every host that renders this
 * image prints the page title beside it, so a name inside the image is the same
 * word twice in one unfurl. What the image adds is the sentence the title has
 * no room for.
 *
 * Run: bun scripts/share-card.ts, with the site served at CARD_BASE_URL.
 */
import { writeFile } from 'node:fs/promises'

import { chromium } from '@playwright/test'

// The size every host accepts. LinkedIn asks 1200x627 and X 1200x628, both of
// which this covers, and Discord scales whatever it is given.
const WIDTH = 1200
const HEIGHT = 630

const SITE = process.env.CARD_BASE_URL ?? 'http://localhost:4400'
const OUT = 'public/og.png'

const CLAIM =
  'I build the layer between a language model and the job it has to do.'

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
        <div style="position:absolute;inset:0;padding:88px 96px;display:flex;
          flex-direction:column;justify-content:space-between">
          <span style="width:64px;height:64px;display:block;color:var(--foreground)">${MARK}</span>
          <p style="margin:0;font-family:var(--font-display);font-size:62px;
            line-height:1.14;color:var(--foreground);max-width:17ch">${CLAIM}</p>
          <p style="margin:0;font-size:24px;letter-spacing:0.01em;
            color:var(--muted-foreground)">erclx.dev</p>
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
