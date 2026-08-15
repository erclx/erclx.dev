import { expect, type Page, test } from '@playwright/test'

// Both engines draw a declared SVG icon whatever the order, so the vector must stay
// out of the icon relation for the raster to reach the tab.
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

test('declares the raster as the only tab icon', async ({ page }) => {
  await page.goto('/')

  const icons = page.locator(iconSelector)

  await expect(icons).toHaveCount(1)
  await expect(icons).toHaveAttribute('href', '/favicon-32.png')
  await expect(icons).toHaveAttribute('sizes', '32x32')
})

test('keeps the stippled vector out of the icon relation', async ({ page }) => {
  await page.goto('/')

  const vectorIcons = page.locator(`${iconSelector}[href$=".svg"]`)

  await expect(vectorIcons).toHaveCount(0)
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
