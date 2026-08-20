import { expect, test } from '@playwright/test'

const FOOTER = '[data-section="footer"]'

test('the footer states how the page was made', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator(FOOTER)).toContainText(
    'built with coding agents, which is also the work',
  )
})

test('the footer states when the page was last deployed', async ({ page }) => {
  await page.goto('/')

  // A month and a year rather than a bare year, which within the current year
  // carries almost no information.
  await expect(page.locator(FOOTER)).toContainText(/Updated [A-Z][a-z]+ \d{4}/)
})

test('the location sits in the closing ask rather than the footer', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator(FOOTER)).not.toContainText('Gothenburg')
  await expect(page.locator('#looking-for')).toContainText('Gothenburg')
})

test('the footer carries no copyright notice', async ({ page }) => {
  await page.goto('/')

  const text = (await page.locator(FOOTER).textContent()) ?? ''

  expect(text).not.toContain('©')
  expect(text.toLowerCase()).not.toContain('all rights reserved')
})
