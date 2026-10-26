import { expect, test } from '@playwright/test'

test.describe('the way between the landing page and a route', () => {
  test('a project card opens its route', async ({ page }) => {
    await page.goto('/')

    await page
      .locator('[data-section="projects"]')
      .getByRole('link', { name: 'canon', exact: true })
      .click()

    await expect(page).toHaveURL(/\/canon$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('the foot of a route returns to the landing page', async ({ page }) => {
    await page.goto('/')
    await page
      .locator('[data-section="projects"]')
      .getByRole('link', { name: 'canon', exact: true })
      .click()
    await expect(page).toHaveURL(/\/canon$/)

    await page.locator('footer [data-way-home]').click()

    await expect(page).toHaveURL(/\/$/)
  })

  test('the bar returns home from a route opened directly', async ({
    page,
  }) => {
    await page.goto('/caret')

    await page.locator('header [data-way-home]').click()

    await expect(page).toHaveURL(/\/$/)
  })
})
