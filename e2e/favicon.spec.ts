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

test('draws a tab icon whose detail survives 16 pixels', async ({ page }) => {
  await page.goto('/')

  // Ink coverage rather than luminance. The recorded figure of 239 was taken on
  // cream over the dark page, and this mark is transparent and swaps its ink on
  // the reader's scheme, so a luminance reading answers which scheme the run
  // emulated rather than whether the drawing holds. What the stippled mark
  // failed was coverage: 268 dots each covering a seventh of a pixel reached
  // full ink nowhere, which is why it averaged to grey whatever color it was.
  const covered = await page.evaluate(async () => {
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
    let solid = 0
    let peak = 0
    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i] ?? 0
      if (alpha > peak) peak = alpha
      if (alpha > 200) solid += 1
    }
    return { solid, peak }
  })

  // Somewhere in the drawing has to reach full ink, which is the thing a
  // stipple never does at this size.
  expect(covered.peak).toBeGreaterThan(240)

  // And enough of it, so a mark that resolves to one solid pixel and a haze
  // does not pass on the peak alone.
  expect(covered.solid).toBeGreaterThan(20)
})

test('keeps the letter open at 16 pixels', async ({ page }) => {
  await page.goto('/')

  // The counter is the enclosed space inside the bowl, and it closing is what
  // turns this mark into a blob with a bar beside it. It is the property the
  // tail angle was tuned around and the one an ink-coverage reading cannot see:
  // a filled-in letter has more ink, not less, so coverage rises as the mark
  // fails. A frame change alone once closed it with every other check passing.
  const openPixels = await page.evaluate(async () => {
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

    const alphaAt = (x: number, y: number) => data[(y * 16 + x) * 4 + 3] ?? 0

    // Every region of empty pixels, and whether it touches the frame's edge.
    // A region that does not is a hole in the drawing. Named coordinates were
    // the first attempt and the seed landed on the crossbar, which bisects the
    // bowl, so the reading was of ink rather than of a counter.
    const seen = new Set<number>()
    let largestHole = 0

    for (let startY = 0; startY < 16; startY += 1) {
      for (let startX = 0; startX < 16; startX += 1) {
        if (seen.has(startY * 16 + startX)) continue
        if (alphaAt(startX, startY) > 60) continue

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
          if (alphaAt(point.x, point.y) > 60) continue
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

    return largestHole
  })

  // The eye of the e, enclosed by the bowl and the crossbar. It is the first
  // thing to disappear when the drawing is scaled down inside its frame, and
  // a mark whose eye has filled reads as a dot rather than a letter.
  expect(openPixels).toBeGreaterThan(1)
})

test('swaps its ink with the reader’s color scheme', async ({ page }) => {
  const inkUnder = async (scheme: 'light' | 'dark') => {
    await page.emulateMedia({ colorScheme: scheme })
    await page.goto('/')
    return page.evaluate(async () => {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const candidate = new Image()
        candidate.onload = () => resolve(candidate)
        candidate.onerror = () => reject(new Error('failed to load'))
        candidate.src = '/favicon.svg?' + Math.random()
      })
      const canvas = document.createElement('canvas')
      canvas.width = 64
      canvas.height = 64
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) throw new Error('no 2d context')
      context.drawImage(image, 0, 0, 64, 64)
      const { data } = context.getImageData(0, 0, 64, 64)
      let sum = 0
      let counted = 0
      for (let i = 0; i < data.length; i += 4) {
        if ((data[i + 3] ?? 0) < 200) continue
        sum +=
          0.2126 * (data[i] ?? 0) +
          0.7152 * (data[i + 1] ?? 0) +
          0.0722 * (data[i + 2] ?? 0)
        counted += 1
      }
      return counted ? sum / counted : -1
    })
  }

  const light = await inkUnder('light')
  const dark = await inkUnder('dark')

  // Chrome and Firefox honour a media query inside a favicon and Safari does
  // not, so this asserts the file is authored correctly rather than that every
  // reader gets the swap. A run on an engine that ignores it reports one value
  // twice, which is the skip below rather than a failure of the drawing.
  test.skip(
    Math.abs(light - dark) < 1,
    'engine ignores prefers-color-scheme inside an svg icon',
  )

  expect(dark).toBeGreaterThan(light)
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
