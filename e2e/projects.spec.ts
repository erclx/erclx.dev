import { expect, test } from '@playwright/test'

import { loadedImageCount, scrollThroughPage } from './lazy-images'

const CARD_NAMES = ['aitk', 'Jobtriage', 'Stackr', 'Caret', 'diction']
const POSTER_SELECTOR = '#projects [data-media-poster]'

test('every project card renders a heading', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.locator('#projects').getByRole('heading', { level: 3 }),
  ).toHaveText(CARD_NAMES)
})

test('every project card poster loads its image', async ({ page }) => {
  await page.goto('/')
  await scrollThroughPage(page)

  await expect
    .poll(() => loadedImageCount(page, POSTER_SELECTOR))
    .toBe(CARD_NAMES.length)
})

test('a card without a hover video still renders its poster', async ({
  page,
}) => {
  await page.goto('/')
  const aitkCard = page.locator('#projects article').first()

  await expect(aitkCard.locator('[data-media-poster]')).toBeVisible()
  await expect(aitkCard.locator('[data-media-video]')).toHaveCount(0)
})

test('the projects section states no count of its own cards', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#projects')).not.toContainText('tools shipped')
})
