import { expect, test } from '@playwright/test'

import { loadedImageCount, scrollThroughPage } from './lazy-images'

const FIGURE_SELECTOR = 'main figure img'
const DICTION_FIGURE_COUNT = 6

test('the aitk case study renders its claim and sections', async ({ page }) => {
  await page.goto('/aitk')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('aitk')
  await expect(page.locator('main section[id]')).toHaveCount(5)
})

test('the diction case study renders its claim and sections', async ({
  page,
}) => {
  await page.goto('/diction')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('diction')
  await expect(page.locator('main section[id]')).toHaveCount(5)
})

test('every diction figure loads its image', async ({ page }) => {
  await page.goto('/diction')
  await scrollThroughPage(page)

  await expect
    .poll(() => loadedImageCount(page, FIGURE_SELECTOR))
    .toBe(DICTION_FIGURE_COUNT)
})

test('each case study links back to the landing page', async ({ page }) => {
  await page.goto('/aitk')

  await page.getByRole('link', { name: 'Back to Eric Le' }).click()
  await expect(page).toHaveURL('/')
})

test('the project cards link to both case studies', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects a[href="/aitk"]')).toHaveCount(1)
  await expect(page.locator('#projects a[href="/diction"]')).toHaveCount(1)
})
