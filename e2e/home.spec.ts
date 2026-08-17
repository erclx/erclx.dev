import { expect, test } from '@playwright/test'

import { loadedImageCount, scrollThroughPage } from './lazy-images'

const ORIGIN_ENTRY_COUNT = 5
const PORTRAIT_SELECTOR = 'header [data-portrait]'
// The reveal script re-staggers whatever arrives together at 80ms a step, so a
// surviving authored delay is the regression this bound catches.
const MAX_REVEAL_DELAY_SECONDS = 0.5

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})

test('the header states the claim line', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'the layer between a language model and the job it has to do',
  )
})

test('the header portrait loads its image', async ({ page }) => {
  await page.goto('/')

  await expect.poll(() => loadedImageCount(page, PORTRAIT_SELECTOR)).toBe(1)
})

test('the header portrait stays inside the content column', async ({
  page,
}) => {
  await page.goto('/')

  const overflow = await page.evaluate(() => {
    const column = document
      .querySelector('[data-header-column]')
      ?.getBoundingClientRect()
    const portrait = document
      .querySelector('[data-portrait]')
      ?.getBoundingClientRect()
    if (!column || !portrait) return Number.NaN
    return Math.round(portrait.right - column.right)
  })

  expect(overflow).toBeLessThanOrEqual(0)
})

test('the origin section renders one entry per beat', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#origin ol > li')).toHaveCount(ORIGIN_ENTRY_COUNT)
})

test('every origin entry carries a head and a supporting sentence', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#origin .origin-head')).toHaveCount(
    ORIGIN_ENTRY_COUNT,
  )
  await expect(page.locator('#origin .origin-detail')).not.toHaveCount(0)
})

test('the beat holding two pieces of work carries a line for each', async ({
  page,
}) => {
  await page.goto('/')
  const volvoBeat = page.locator('#origin ol > li', {
    hasText: 'volvo technology',
  })

  await expect(volvoBeat.locator('.origin-detail')).toHaveCount(2)
})

test('the origin rail marks every entry', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#origin .origin-marker')).toHaveCount(
    ORIGIN_ENTRY_COUNT,
  )
})

test('the origin chips name the cards below them', async ({ page }) => {
  await page.goto('/')

  const trimmed = (labels: string[]) => labels.map((label) => label.trim())
  const chips = trimmed(await page.locator('#origin ul a').allTextContents())
  const cards = trimmed(await page.locator('#projects h3').allTextContents())

  expect(chips).toEqual(cards)
})

test('every origin chip links to a card that exists', async ({ page }) => {
  await page.goto('/')

  const targets = await page
    .locator('#origin ul a')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')),
    )

  const missing = await page.evaluate(
    (selectors) =>
      selectors.filter((selector) => !document.querySelector(selector ?? '')),
    targets,
  )

  expect(missing).toEqual([])
})

test('no revealed surface waits out an authored delay', async ({ page }) => {
  await page.goto('/')
  await scrollThroughPage(page)

  const longestDelay = await page.evaluate(() => {
    const revealed = Array.from(
      document.querySelectorAll('[data-fade][data-visible="true"]'),
    )
    const delays = revealed.map(
      (element) => parseFloat(getComputedStyle(element).transitionDelay) || 0,
    )
    return Math.max(...delays)
  })

  expect(longestDelay).toBeLessThanOrEqual(MAX_REVEAL_DELAY_SECONDS)
})

test('the origin section names the field of the degree', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#origin')).toContainText(
    'complex adaptive systems',
  )
})

test('the origin section carries no engagement vocabulary', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#origin')).not.toContainText('contract iii')
})

test('the looking-for section states experience rather than a level band', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#looking-for')).toContainText('two years in')
})
