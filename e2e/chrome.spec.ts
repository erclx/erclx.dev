import { expect, type Page, test } from '@playwright/test'

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 900 }

const scrollToEnd = (page: Page) =>
  page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

test.describe('the way back to the top', () => {
  test.use({ viewport: PHONE })

  test('the landing bar returns a reader at the end to the top', async ({
    page,
  }) => {
    await page.goto('/')
    await scrollToEnd(page)
    await expect(page.locator('[data-site-bar]')).toHaveAttribute(
      'data-revealed',
      'true',
    )

    await page.locator('[data-to-top]').click()

    await expect.poll(() => scrollY(page)).toBe(0)
  })

  test('a route bar returns a reader at the end to the top', async ({
    page,
  }) => {
    await page.goto('/canon')
    await scrollToEnd(page)
    await expect(page.locator('[data-route-here]')).toHaveAttribute(
      'data-shown',
      'true',
    )

    await page.locator('[data-route-here]').click()

    await expect.poll(() => scrollY(page)).toBe(0)
  })
})

test.describe('the reading column', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the projects heading starts where the about heading does', async ({
    page,
  }) => {
    await page.goto('/')
    const about = await page.locator('#about h2').boundingBox()
    const projects = await page.locator('#projects h2').boundingBox()

    expect(about?.x ?? 0).toBeGreaterThan(0)
    expect(Math.abs((about?.x ?? 0) - (projects?.x ?? 0))).toBeLessThanOrEqual(
      1,
    )
  })

  test('the footer starts where the closing ask does', async ({ page }) => {
    await page.goto('/')
    const ask = await page.locator('#looking-for h2').boundingBox()
    const footer = await page
      .locator('[data-section="footer"] nav[aria-label="Elsewhere"]')
      .boundingBox()

    expect(ask?.x ?? 0).toBeGreaterThan(0)
    expect(Math.abs((ask?.x ?? 0) - (footer?.x ?? 0))).toBeLessThanOrEqual(1)
  })
})

test.describe('navigation chrome', () => {
  test.use({ viewport: DESKTOP })

  test('holds one width on the landing page and a route', async ({ page }) => {
    await page.goto('/')
    const landing = await page.locator('[data-bar-row]').boundingBox()
    await page.goto('/canon')
    const route = await page.locator('[data-bar-row]').boundingBox()

    expect(landing?.width ?? 0).toBeGreaterThan(0)
    expect(Math.abs((landing?.width ?? 0) - (route?.width ?? 0))).toBeLessThan(
      2,
    )
  })
})
