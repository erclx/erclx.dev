import { expect, test } from '@playwright/test'

const PAGE_IMAGES = 'main img[alt^="Résumé, page"]'

test.describe('the résumé page switches layout at md', () => {
  for (const { width, pages } of [
    { width: 767, pages: false },
    { width: 768, pages: true },
  ]) {
    test(`shows ${pages ? 'the pages' : 'the preview card'} alone at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })

      await page.goto('/resume')

      const card = page.getByRole('link', { name: 'Open the full PDF' })
      const firstPage = page.locator(PAGE_IMAGES).first()
      await expect(pages ? firstPage : card).toBeVisible()
      await expect(pages ? card : firstPage).toBeHidden()
    })
  }
})

test('a phone fetches none of the full page images', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (request) => requested.push(request.url()))
  await page.setViewportSize({ width: 390, height: 800 })

  await page.goto('/resume')
  await page.mouse.wheel(0, 4000)
  const preview = page
    .getByRole('link', { name: 'Open the full PDF' })
    .locator('img')
  await expect
    .poll(() => preview.evaluate((image: HTMLImageElement) => image.complete))
    .toBe(true)

  const sources = await page
    .locator(PAGE_IMAGES)
    .evaluateAll((images) =>
      images.flatMap((image) =>
        (image.getAttribute('srcset') ?? '')
          .split(',')
          .map(
            (entry) =>
              new URL(entry.trim().split(' ')[0] ?? '', location.href).href,
          ),
      ),
    )
  expect(sources.length).toBeGreaterThan(0)
  expect(requested.filter((url) => sources.includes(url))).toEqual([])
})
