import { expect, type Page, test } from '@playwright/test'

// Every engine draws a declared SVG icon whatever the order, so the raster is
// reached only by an engine that ignores the vector entirely. That is what the
// vector leading the relation means here, and why the raster is a fallback
// rather than a first choice ordering could protect.
const iconSelector = 'link[rel="icon"]'

interface DiscLuminance {
  peak: number
  bright: number
}

async function measureDiscLuminance(
  page: Page,
  href: string,
  size: number,
): Promise<DiscLuminance> {
  return page.evaluate(
    async ({ href, size }) => {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const candidate = new Image()
        candidate.onload = () => resolve(candidate)
        candidate.onerror = () => reject(new Error(`failed to load ${href}`))
        candidate.src = href
      })

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) throw new Error('no 2d context')
      context.drawImage(image, 0, 0, size, size)
      const { data } = context.getImageData(0, 0, size, size)

      const center = (size - 1) / 2
      let peak = 0
      let bright = 0

      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const dx = x - center
          const dy = y - center
          if (Math.sqrt(dx * dx + dy * dy) > size / 2) continue
          const offset = (y * size + x) * 4
          const alpha = data[offset + 3] / 255
          const luminance =
            (0.2126 * data[offset] +
              0.7152 * data[offset + 1] +
              0.0722 * data[offset + 2]) *
            alpha
          if (luminance > peak) peak = luminance
          if (luminance > 180) bright += 1
        }
      }

      return { peak: Math.round(peak), bright }
    },
    { href, size },
  )
}

test('leads the icon relation with the vector and keeps the raster behind it', async ({
  page,
}) => {
  await page.goto('/')

  const icons = page.locator(iconSelector)
  await expect(icons).toHaveCount(2)

  // An engine that reads the vector never requests the raster, so the order is
  // a statement about which one the fallback is rather than a mechanism.
  await expect(icons.first()).toHaveAttribute('href', '/favicon.svg')
  await expect(icons.first()).toHaveAttribute('type', 'image/svg+xml')
  await expect(icons.nth(1)).toHaveAttribute('href', '/favicon-32.png')
  await expect(icons.nth(1)).toHaveAttribute('sizes', '32x32')
})

test('draws a tab icon that reads as a letter at 16 pixels', async ({
  page,
}) => {
  await page.goto('/')

  // Ink read as dark against a cream ground rather than as alpha against
  // nothing. The icon carries its own ground now, so every pixel is opaque and
  // an alpha reading reports the whole frame as solid whatever the drawing does.
  const shape = await page.evaluate(async () => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image()
      candidate.onload = () => resolve(candidate)
      candidate.onerror = () => reject(new Error('failed to load /favicon.svg'))
      candidate.src = '/favicon.svg'
    })
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('no 2d context')
    context.drawImage(image, 0, 0, 16, 16)
    const { data } = context.getImageData(0, 0, 16, 16)

    const isInk = (x: number, y: number) => {
      const offset = (y * 16 + x) * 4
      const luminance =
        0.2126 * (data[offset] ?? 0) +
        0.7152 * (data[offset + 1] ?? 0) +
        0.0722 * (data[offset + 2] ?? 0)
      return luminance < 128
    }

    let inked = 0
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) if (isInk(x, y)) inked += 1
    }

    // Every region of ground, and whether it reaches the frame's edge. One that
    // does not is a hole in the drawing, and the eye of the e is the hole this
    // mark is built around. A filled bowl carries more ink rather than less, so
    // a coverage count rises as the letter dies and only this separates them:
    // the mark once shipped as a solid disc and passed on coverage alone.
    const seen = new Set<number>()
    let largestHole = 0

    for (let startY = 0; startY < 16; startY += 1) {
      for (let startX = 0; startX < 16; startX += 1) {
        if (seen.has(startY * 16 + startX)) continue
        if (isInk(startX, startY)) continue

        const queue = [{ x: startX, y: startY }]
        let size = 0
        let touchesEdge = false

        while (queue.length) {
          const point = queue.pop()
          if (!point) break
          const key = point.y * 16 + point.x
          if (seen.has(key)) continue
          if (point.x < 0 || point.x > 15 || point.y < 0 || point.y > 15) {
            touchesEdge = true
            continue
          }
          if (isInk(point.x, point.y)) continue
          seen.add(key)
          size += 1
          queue.push(
            { x: point.x + 1, y: point.y },
            { x: point.x - 1, y: point.y },
            { x: point.x, y: point.y + 1 },
            { x: point.x, y: point.y - 1 },
          )
        }

        if (!touchesEdge && size > largestHole) largestHole = size
      }
    }

    return { inked, largestHole }
  })

  // Enough of the frame is drawn on. A mark resolving to a few pixels and a
  // haze fails here whatever else holds.
  expect(shape.inked).toBeGreaterThan(20)

  // And the letter still has its eye.
  expect(shape.largestHole).toBeGreaterThan(1)
})

test('carries its own ground so a tab theme cannot hide it', async ({
  page,
}) => {
  await page.goto('/')

  // The transparent version resolved its ink from `prefers-color-scheme`, which
  // a favicon reads off the browser while the tab strip takes its color from a
  // theme set separately. The two disagree routinely, and the mark then
  // rendered cream on a white tab and vanished. An opaque ground is what
  // removes the dependency, so the absence of transparency is the property.
  const clearPixels = await page.evaluate(async () => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image()
      candidate.onload = () => resolve(candidate)
      candidate.onerror = () => reject(new Error('failed to load /favicon.svg'))
      candidate.src = '/favicon.svg'
    })
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('no 2d context')
    context.drawImage(image, 0, 0, 32, 32)
    const { data } = context.getImageData(0, 0, 32, 32)

    // The corners fall outside the rounded ground and are clear by design, so
    // the reading covers the middle rather than the whole frame.
    let clear = 0
    for (let y = 6; y < 26; y += 1) {
      for (let x = 6; x < 26; x += 1) {
        if ((data[(y * 32 + x) * 4 + 3] ?? 0) < 250) clear += 1
      }
    }
    return clear
  })

  expect(clearPixels).toBe(0)
})

test('declares the apple touch icon at 180 square', async ({ page }) => {
  await page.goto('/')

  const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]')

  await expect(appleTouchIcon).toHaveAttribute('href', '/apple-touch-icon.png')
  await expect(appleTouchIcon).toHaveAttribute('sizes', '180x180')
})

test('serves every declared icon', async ({ page, request }) => {
  await page.goto('/')

  const links = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]')
  const declared = await links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('href')),
  )
  const iconPaths = declared.filter((path): path is string => path !== null)
  const served = await Promise.all(
    iconPaths.map(
      async (path) => `${path} ${(await request.get(path)).status()}`,
    ),
  )

  expect(iconPaths).toHaveLength(declared.length)
  expect(served).toEqual(iconPaths.map((path) => `${path} 200`))
})

test('holds its contrast when the tab downsamples it to 16px', async ({
  page,
}) => {
  await page.goto('/')

  const { peak, bright } = await measureDiscLuminance(
    page,
    '/favicon-32.png',
    16,
  )

  expect(peak).toBeGreaterThanOrEqual(180)
  expect(bright).toBeGreaterThanOrEqual(5)
})

test('holds its contrast at retina tab density', async ({ page }) => {
  await page.goto('/')

  const { peak, bright } = await measureDiscLuminance(
    page,
    '/favicon-32.png',
    32,
  )

  expect(peak).toBeGreaterThanOrEqual(180)
  expect(bright).toBeGreaterThanOrEqual(40)
})
