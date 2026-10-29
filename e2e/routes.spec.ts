import { expect, test } from '@playwright/test'

const ROUTES = [
  '/',
  '/canon',
  '/jobtriage',
  '/annex',
  '/stackr',
  '/caret',
  '/frameboard',
  '/resume',
] as const

const PHONE_WIDTH = 320

test.describe('every route renders', () => {
  for (const route of ROUTES) {
    test(`${route} shows its heading with no console error`, async ({
      page,
    }) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => errors.push(error.message))

      await page.goto(route)

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      expect(errors).toEqual([])
    })
  }
})

test.describe('every route holds a phone width', () => {
  for (const route of ROUTES) {
    test(`${route} scrolls no wider than ${PHONE_WIDTH}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: PHONE_WIDTH, height: 800 })

      await page.goto(route)

      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          ),
        )
        .toBeLessThanOrEqual(0)
    })
  }
})
