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

test('the aitk card writes the npm scope', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects article').first()).toContainText(
    '@erclx/aitk',
  )
})

test('clicking a card that owns a case study opens it', async ({ page }) => {
  await page.goto('/')

  await page.locator('#projects article').first().click()

  await expect(page).toHaveURL('/aitk')
})

test('a card link stays reachable above the whole-card overlay', async ({
  page,
}) => {
  await page.goto('/')
  const link = page
    .locator('#projects article')
    .first()
    .getByRole('link', { name: 'GitHub' })
  await link.hover()

  const topmost = await link.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const hit = document.elementFromPoint(
      box.x + box.width / 2,
      box.y + box.height / 2,
    )
    return hit?.closest('a')?.getAttribute('href') ?? null
  })

  expect(topmost).toBe('https://github.com/erclx/aitk')
})

test('a card without a case study carries no whole-card overlay', async ({
  page,
}) => {
  await page.goto('/')
  const caretCard = page.locator('#projects article').nth(3)

  await expect(caretCard.locator('a[aria-hidden="true"]')).toHaveCount(0)
})
