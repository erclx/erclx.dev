import { expect, test } from '@playwright/test'

const DOCK = '[data-contact-dock]'
const SETTLE_MS = 700

async function scrollPastHero(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const hero = document.querySelector('[data-section="header"]')
    if (!hero) return
    window.scrollTo(0, hero.getBoundingClientRect().height)
  })
  await page.waitForTimeout(SETTLE_MS)
}

test('the dock stays out of reach while the reader is still in the hero', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForTimeout(SETTLE_MS)

  await expect(page.locator(DOCK)).not.toHaveAttribute('data-revealed', 'true')
})

test('the dock arrives once the reader has scrolled past the hero', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')
})

test('the dock stands down over the footer, which carries the same links', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  )
  await page.waitForTimeout(SETTLE_MS)

  await expect(page.locator(DOCK)).toHaveAttribute('data-near-footer', 'true')
})

test('every contact destination stays in the tab order while collapsed', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  // The stack collapses visually and the links keep their place in the
  // sequence, so a keyboard never meets a set it cannot reach.
  const dock = page.locator(DOCK)
  for (const label of ['GitHub', 'LinkedIn', 'me@erclx.dev']) {
    await expect(dock.getByRole('link', { name: label })).toHaveCount(1)
  }
})

test('the dock names its destinations for a screen reader', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  const dock = page.locator(DOCK)
  await expect(dock.getByRole('button', { name: 'Contact' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(dock.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/erclx',
  )
})

test('the toggle reports the state it puts the stack in', async ({ page }) => {
  await page.goto('/')
  await scrollPastHero(page)

  const toggle = page.locator(DOCK).getByRole('button', { name: 'Contact' })
  await toggle.click()

  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator(DOCK)).toHaveAttribute('data-open', 'true')
})
