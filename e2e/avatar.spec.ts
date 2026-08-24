import { expect, test } from '@playwright/test'

import { measureLetterShape } from './letter-shape'

const AVATAR_PATHS = [
  '/avatar/light.png',
  '/avatar/light@2x.png',
  '/avatar/dark.png',
  '/avatar/dark@2x.png',
  '/avatar/dark-field.png',
  '/avatar/dark-field@2x.png',
]

test('serves every avatar raster with a drawn body', async ({ request }) => {
  const responses = await Promise.all(
    AVATAR_PATHS.map(async (path) => {
      const response = await request.get(path)
      const body = await response.body()
      return { path, status: response.status(), bytes: body.byteLength }
    }),
  )

  for (const { path, status, bytes } of responses) {
    expect(status, path).toBe(200)
    expect(bytes, path).toBeGreaterThan(0)
  }
})

test('keeps the mark legible where the streamline variant composites it over the live field', async ({
  page,
}) => {
  await page.goto('/')

  // `scripts/avatar-field.ts` paints the mark at full opacity in its own
  // `MARK_INK` (`#F4EFE6`), so a pixel close to that color is the mark rather
  // than the field behind it, whatever the field is doing there. That holds
  // even where the flat luminance test above cannot: the field is arbitrary
  // color, not a uniform ground, so a brightness threshold alone cannot tell
  // the mark's ink apart from a bright patch of noise.
  const shape = await measureLetterShape(page, '/avatar/dark-field.png', 256, {
    mode: 'colorMatch',
    target: [244, 239, 230],
    tolerance: 40,
  })

  // Enough of the frame reads as the mark's own ink.
  expect(shape.inked).toBeGreaterThan(400)

  // And the letter still has its eye, the same property the favicon guards
  // and the one a filled disc would pass on coverage alone.
  expect(shape.largestHole).toBeGreaterThan(20)
})
