import { expect, type Page, test } from '@playwright/test'

const FIELD = '[data-page-ground-field]'
const COLUMN = '[data-page-ground-column]'
/** How long a reading waits for the still frame to draw before it gives up. */
const SETTLE_TIMEOUT_MS = 5000

// The ground draws one frame and runs no loop, so its buffer is cleared once
// composited and every later read returns nothing. Keeping it readable has to
// land before the mount, which is why this is an init script rather than a
// call. A run without it reports an empty field at every width and reads as the
// surface being switched off.
const preserveBuffer = `
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    return original.call(
      this,
      type,
      type === 'webgl' ? Object.assign({}, attrs, { preserveDrawingBuffer: true }) : attrs,
    )
  }
`

interface Weights {
  /** Mean alpha inside the strip the field damps within. */
  readonly column: number
  /** Mean alpha in the margins either side of it. */
  readonly margin: number
}

/**
 * The field's mean alpha inside the reading column and in the margins beside
 * it.
 *
 * Mean alpha rather than a count of pixels above a cutoff. A cutoff has to be
 * chosen against a surface, and this one runs at a fraction of the hero's
 * weight: inside the column its peak sits near 7 of 255, so the hero spec's own
 * cutoff of 8 reports this surface as painting nothing at all. A mean needs no
 * such choice and moves with exactly what damping multiplies.
 *
 * Read off the canvas rather than off a screenshot, so the number is the
 * field's own alpha rather than its composite over whatever the page put
 * behind it.
 */
async function fieldWeights(page: Page): Promise<Weights> {
  return page.evaluate(
    ({ fieldSelector, columnSelector }) => {
      const empty = { column: 0, margin: 0 }
      const canvas = document.querySelector(fieldSelector)
      const column = document.querySelector(columnSelector)
      if (!(canvas instanceof HTMLCanvasElement) || !column) return empty

      const flat = document.createElement('canvas')
      flat.width = canvas.width
      flat.height = canvas.height
      const context = flat.getContext('2d', { willReadFrequently: true })
      // Raised rather than reported as an empty reading. A refused context is
      // the harness running out of them, and returning zeros from here spends
      // that as a field that never drew.
      if (!context) throw new Error('the readback canvas was refused a context')
      context.drawImage(canvas, 0, 0)

      // The backing store is the CSS box times the ratio the mount settled on,
      // which is clamped and can be degraded, so it is derived from the canvas
      // rather than read off the device.
      const scale = canvas.width / canvas.clientWidth
      const box = column.getBoundingClientRect()
      const left = Math.max(0, Math.round(box.left * scale))
      const right = Math.min(flat.width, Math.round(box.right * scale))

      const { data } = context.getImageData(0, 0, flat.width, flat.height)
      let columnSum = 0
      let columnCount = 0
      let marginSum = 0
      let marginCount = 0

      for (let i = 3; i < data.length; i += 4) {
        const pixel = (i - 3) / 4
        const x = pixel % flat.width
        const alpha = data[i] ?? 0
        if (x >= left && x < right) {
          columnSum += alpha
          columnCount += 1
        } else {
          marginSum += alpha
          marginCount += 1
        }
      }

      const weights = {
        column: columnCount ? columnSum / columnCount : 0,
        margin: marginCount ? marginSum / marginCount : 0,
      }

      // The scratch canvas is the size of the drawing buffer, so one call holds
      // several megabytes and a suite holds one per reading. Zeroing it drops
      // the backing store rather than waiting for a collector.
      flat.width = 0
      flat.height = 0
      return weights
    },
    { fieldSelector: FIELD, columnSelector: COLUMN },
  )
}

async function readAt(page: Page, width: number): Promise<Weights> {
  await page.setViewportSize({ width, height: 900 })
  await page.reload()
  // Settled on the column actually carrying ink rather than paused for a
  // span. The column is what every caller asserts nonzero, where the margin
  // is not: at a narrow enough viewport the column spans the full canvas and
  // the margin has no pixels to sample at all, which is a fact about the
  // layout rather than a sign the field never drew. The mount draws its one
  // still frame synchronously rather than on a frame callback, so this
  // ordinarily returns on its first check, and only waits out a genuine delay
  // in the rare case the mount script runs late.
  let weights: Weights = { column: 0, margin: 0 }
  await expect
    .poll(
      async () => {
        weights = await fieldWeights(page)
        return weights.column
      },
      { timeout: SETTLE_TIMEOUT_MS },
    )
    .toBeGreaterThan(0)
  return weights
}

test.describe('the page ground over the reading column', () => {
  test('paints in the margins and quieter over the prose', async ({
    page,
    baseURL,
  }) => {
    await page.addInitScript(preserveBuffer)
    await page.goto(baseURL ?? '/')

    const { column, margin } = await readAt(page, 1440)

    // The field is present rather than switched off over prose. A treatment
    // that clears the column entirely satisfies every ceiling below, so this
    // floor is what separates damping from deletion.
    expect(column).toBeGreaterThan(0)
    expect(margin).toBeGreaterThan(column)
  })

  test('lays no more weight over prose as the viewport narrows', async ({
    page,
    baseURL,
  }) => {
    await page.addInitScript(preserveBuffer)
    await page.goto(baseURL ?? '/')

    const wide = await readAt(page, 1440)
    const tablet = await readAt(page, 1366)
    const phone = await readAt(page, 390)

    // The field's scale divides by the viewport, so the pattern squeezes as the
    // screen narrows while the reading column does not. Under one flat damping
    // fraction that put sixteen times the ink over prose on a phone as on a
    // wide desktop, and a reader met contours crossing text on a tablet that
    // were absent on a laptop. Damping walking down with width is what holds
    // these three together.
    //
    // Two widths a few percent apart are compared with a tolerance, because
    // over that distance the damping falls and the density rises by almost the
    // same amount and the two very nearly cancel: 1366 measured 1.8% above 1440
    // on a curve that is monotonic by construction. Asserting a strict fall
    // between adjacent widths would be asserting which of the two moved more.
    expect(tablet.column).toBeLessThanOrEqual(wide.column * 1.1)

    // A real span, where the curve has somewhere to travel and the claim is
    // worth making. Measured across the whole surface, mean weight runs 0.39 at
    // 1920 against 0.03 at 390.
    expect(phone.column).toBeLessThan(wide.column * 0.7)
  })
})
