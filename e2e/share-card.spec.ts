import { expect, test } from '@playwright/test'

test.describe('a shared link', () => {
  test('serves the card at the size every host accepts', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content')
    expect(image).toBeTruthy()

    // Fetched by path rather than by the absolute URL the tag carries, which
    // names the production host and is not what this run is serving.
    const path = new URL(image ?? '').pathname
    const response = await request.get(path)
    expect(response.status()).toBe(200)

    const declared = {
      width: await page
        .locator('meta[property="og:image:width"]')
        .getAttribute('content'),
      height: await page
        .locator('meta[property="og:image:height"]')
        .getAttribute('content'),
    }

    // A host that lays out the preview before the image arrives reads these,
    // so a declared size that disagrees with the file reflows the card.
    const actual = await page.evaluate(
      (src) =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image()
          image.onload = () =>
            resolve({ width: image.naturalWidth, height: image.naturalHeight })
          image.onerror = () => reject(new Error('failed to load the card'))
          image.src = src
        }),
      path,
    )

    expect(String(actual.width)).toBe(declared.width)
    expect(String(actual.height)).toBe(declared.height)
  })
})
