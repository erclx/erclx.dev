/**
 * Renders a scannable code per address, as an image rather than as terminal
 * blocks.
 *
 * `scripts/device.sh` draws its code with block characters, which is right in a
 * terminal and useless to a camera anywhere else: a session handing an operator an
 * address it cannot render, or a chat window with its own line height, both
 * turn those blocks into something a camera reads as noise. This draws the same
 * matrix as squares and screenshots it, so the code survives wherever the image
 * lands.
 *
 * The quiet zone is four modules on every side. A code cropped to its own edge
 * fails to scan against a busy background and the failure looks like a bad
 * camera rather than a bad image.
 *
 * Run: bun scripts/qr.ts <url> [url...]
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { chromium } from '@playwright/test'
// The vendored encoder inside the terminal renderer, reached directly for its
// matrix. The renderer itself only emits characters.
import QRCode from 'qrcode-terminal/vendor/QRCode'
import QRErrorCorrectLevel from 'qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel'

const OUT = '.claude/review/qr'
const MODULE_PX = 8
const QUIET_MODULES = 4

const urls = process.argv.slice(2)
if (urls.length === 0) {
  console.error('Give it at least one address.')
  process.exit(1)
}

/** The module matrix for one address, at the smallest type version that fits. */
function encode(url: string): boolean[][] {
  const code = new QRCode(-1, QRErrorCorrectLevel.M)
  code.addData(url)
  code.make()
  const count = code.getModuleCount()
  return Array.from({ length: count }, (_, row) =>
    Array.from({ length: count }, (_, column) => code.isDark(row, column)),
  )
}

function markup(url: string, matrix: boolean[][]): string {
  const count = matrix.length
  const size = (count + QUIET_MODULES * 2) * MODULE_PX
  const cells = matrix
    .map((row, y) =>
      row
        .map((dark, x) =>
          dark
            ? `<rect x="${(x + QUIET_MODULES) * MODULE_PX}" y="${(y + QUIET_MODULES) * MODULE_PX}" width="${MODULE_PX}" height="${MODULE_PX}" fill="#000"/>`
            : '',
        )
        .join(''),
    )
    .join('')

  return `<div style="display:inline-block;background:#fff;font:12px ui-monospace,monospace;color:#000;padding-bottom:8px;text-align:center">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#fff"/>${cells}
      </svg>
      <div style="padding:0 12px">${url}</div>
    </div>`
}

const browser = await chromium.launch()

// A throw anywhere below leaves the browser running otherwise, and a headless
// chromium nothing owns survives the script that started it.
try {
  const context = await browser.newContext({ deviceScaleFactor: 2 })
  const page = await context.newPage()
  await mkdir(OUT, { recursive: true })

  for (const [index, url] of urls.entries()) {
    const matrix = encode(url)
    await page.setContent(
      `<body style="margin:0;background:#fff">${markup(url, matrix)}</body>`,
    )
    const shot = await page.locator('div').first().screenshot()
    const file = path.join(OUT, `code-${index + 1}.png`)
    await writeFile(file, shot)
    console.log(`${file}  ${url}  (${matrix.length} modules)`)
  }
} finally {
  await browser.close()
}
