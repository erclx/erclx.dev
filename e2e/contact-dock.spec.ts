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
  for (const label of ['GitHub', 'LinkedIn', 'me@erclx.dev', 'Résumé']) {
    await expect(dock.getByRole('link', { name: label })).toHaveCount(1)
  }
})

test('the résumé sits nearest the resting mark', async ({ page }) => {
  await page.goto('/')
  await scrollPastHero(page)

  const dock = page.locator(DOCK)
  const toggle = dock.getByRole('button', { name: 'Contact' })
  const resume = dock.getByRole('link', { name: 'Résumé' })
  const furthest = dock.getByRole('link', { name: 'GitHub' })

  const toggleBox = await toggle.boundingBox()
  const resumeBox = await resume.boundingBox()
  const furthestBox = await furthest.boundingBox()

  // Shortest travel from the control belongs to the destination most readers
  // came for, so the resume sits between the mark and the rest of the set.
  expect(Math.abs((resumeBox?.y ?? 0) - (toggleBox?.y ?? 0))).toBeLessThan(
    Math.abs((furthestBox?.y ?? 0) - (toggleBox?.y ?? 0)),
  )
})

test('a pointer names one destination rather than the whole set', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  // The dock first, which is what opens the stack. A collapsed stack takes no
  // pointer events, so an item cannot be reached before the set is open.
  await page.locator(DOCK).hover()
  await page.waitForTimeout(300)

  const items = page.locator('[data-dock-links] li')
  await items.last().hover()
  await page.waitForTimeout(300)

  const shown = await items.evaluateAll((rows) =>
    rows.map((row) => {
      const name = row.querySelector('[data-dock-name]')
      return name ? getComputedStyle(name).opacity : '0'
    }),
  )

  expect(shown.filter((opacity) => opacity === '1')).toHaveLength(1)
})

test('the dock names are hidden from assistive technology', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  // Each link already carries the string as its accessible name, so exposing
  // the label too would read every destination in the set twice.
  const names = page.locator('[data-dock-name]')
  await expect(names).toHaveCount(4)
  for (let index = 0; index < 4; index += 1) {
    await expect(names.nth(index)).toHaveAttribute('aria-hidden', 'true')
  }
})

test('the résumé opens in a new tab from the dock', async ({ page }) => {
  await page.goto('/')
  await scrollPastHero(page)

  const resume = page.locator(DOCK).getByRole('link', { name: 'Résumé' })

  await expect(resume).toHaveAttribute('href', '/resume.pdf')
  await expect(resume).toHaveAttribute('target', '_blank')
  await expect(resume).toHaveAttribute('rel', 'noopener')
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
