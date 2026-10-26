import { expect, test } from '@playwright/test'

test.use({ colorScheme: 'light' })

test.describe('the theme choice', () => {
  test('cycles from system to light to dark', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('[data-theme-toggle]')

    await toggle.click()
    await toggle.click()

    await expect(page.locator('html')).toHaveAttribute(
      'data-theme-mode',
      'dark',
    )
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })

  test('survives a reload and a route change', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('[data-theme-toggle]')
    await toggle.click()
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)

    await page.reload()
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)

    await page.goto('/canon')
    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
  })
})
