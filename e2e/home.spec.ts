import { expect, test } from '@playwright/test'

import { loadedImageCount, scrollThroughPage } from './lazy-images'

const ORIGIN_ENTRY_COUNT = 5
const PORTRAIT_SELECTOR = 'header [data-portrait]'
// The reveal script fits whatever arrives together into one 400ms window, so a
// surviving authored delay is the regression this bound catches.
const MAX_REVEAL_DELAY_SECONDS = 0.5

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})

test('the level-one heading names the person', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Eric Le')
})

test('the header carries the claim and its elaboration', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('header')

  await expect(header).toContainText(
    'the layer between a language model and the job it has to do',
  )
  await expect(header).toContainText('In practice that means agents')
})

test('the about surface reads as personal rather than professional', async ({
  page,
}) => {
  await page.goto('/')
  const about = page.locator('[data-section="about"]')

  await expect(about).toContainText('I was born in Vietnam')
  await expect(about).toContainText('I have played guitar since I was twelve')
  await expect(about).not.toContainText('agents')
  await expect(about).not.toContainText('Volvo')
})

test('the about surface sits between the header and the origin timeline', async ({
  page,
}) => {
  await page.goto('/')

  const order = await page.evaluate(() =>
    [...document.querySelectorAll('[data-section]')].map(
      (el) => (el as HTMLElement).dataset.section,
    ),
  )

  expect(order.indexOf('about')).toBeGreaterThan(order.indexOf('header'))
  expect(order.indexOf('about')).toBeLessThan(order.indexOf('origin'))
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

test('the theme toggle centres on the identity line it shares a row with', async ({
  page,
}) => {
  await page.goto('/')

  const offset = await page.evaluate(() => {
    const line = document
      .querySelector('[data-identity-line]')
      ?.getBoundingClientRect()
    const toggle = document
      .querySelector('header button')
      ?.getBoundingClientRect()
    if (!line || !toggle) return Number.NaN
    const lineCenter = (line.top + line.bottom) / 2
    return Math.abs((toggle.top + toggle.bottom) / 2 - lineCenter)
  })

  expect(offset).toBeLessThanOrEqual(2)
})

test('the availability status sits in the closing ask rather than the header', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('header .status-dot')).toHaveCount(0)
  await expect(page.locator('#looking-for .status-dot')).toHaveCount(1)
  await expect(page.locator('#looking-for')).toContainText('Open to work')
  await expect(page.locator('header')).not.toContainText('Open to work')
})

test('the availability dot centres on the cap height of its own label', async ({
  page,
}) => {
  await page.goto('/')

  const offset = await page.evaluate(() => {
    const slot = document
      .querySelector('#looking-for .status-dot-slot')
      ?.getBoundingClientRect()
    const dot = document
      .querySelector('#looking-for .status-dot')
      ?.getBoundingClientRect()
    if (!slot || !dot) return Number.NaN
    const capCenter = (slot.top + slot.bottom) / 2
    return Math.abs((dot.top + dot.bottom) / 2 - capCenter)
  })

  expect(offset).toBeLessThanOrEqual(1)
})

test('the availability dot renders no pulse halo under reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  const halo = await page.evaluate(() => {
    const dot = document.querySelector('#looking-for .status-dot')
    if (!dot) return { content: 'missing', animationName: 'missing' }
    const style = getComputedStyle(dot, '::after')
    return { content: style.content, animationName: style.animationName }
  })

  expect(halo.content).toBe('none')
  expect(halo.animationName).toBe('none')
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

  const revealed = await page.evaluate(() => {
    const elements = Array.from(
      document.querySelectorAll('[data-fade][data-visible="true"]'),
    )
    const delays = elements.map(
      (element) => parseFloat(getComputedStyle(element).transitionDelay) || 0,
    )
    // Report the count too: Math.max of an empty list is -Infinity, which would
    // pass the bound below while proving the selector matched nothing.
    return { count: elements.length, longestDelay: Math.max(0, ...delays) }
  })

  expect(revealed.count).toBeGreaterThan(0)
  expect(revealed.longestDelay).toBeLessThanOrEqual(MAX_REVEAL_DELAY_SECONDS)
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
