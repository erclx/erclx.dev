import { expect, test } from '@playwright/test'

test('landing page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Astro/)
  await expect(page.getByRole('heading', { name: 'Astro' })).toBeVisible()
})
