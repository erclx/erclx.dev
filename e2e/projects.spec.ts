import { expect, test } from '@playwright/test'

import { loadedImageCount, scrollThroughPage } from './lazy-images'

const CARD_NAMES = ['aitk', 'Jobtriage', 'Stackr', 'Caret', 'diction']
const POSTER_SELECTOR = '#projects [data-media-poster]'

test('every project card renders a heading', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.locator('#projects').getByRole('heading', { level: 3 }),
  ).toHaveText(CARD_NAMES)
})

test('every project card poster loads its image', async ({ page }) => {
  await page.goto('/')
  await scrollThroughPage(page)

  await expect
    .poll(() => loadedImageCount(page, POSTER_SELECTOR))
    .toBe(CARD_NAMES.length)
})

test('a card without a hover video still renders its poster', async ({
  page,
}) => {
  await page.goto('/')
  const aitkCard = page.locator('#projects article').first()

  await expect(aitkCard.locator('[data-media-poster]')).toBeVisible()
  await expect(aitkCard.locator('[data-media-video]')).toHaveCount(0)
})

test('pointing at a card plays the clip it reveals', async ({ page }) => {
  await page.goto('/')

  // A card host declares no `view`, so the clip has one way in and hovering is
  // it. The rule keying that path answered false on every desktop engine that
  // reports its hover capability conservatively, which took the card to a
  // branch that plays nothing and broke no assertion on the way. This is the
  // assertion, and it belongs beside the behavior rather than in one shared
  // case, which would pass while any single rule silently went touch-side.
  const card = page.locator('#projects article').nth(1)
  const clip = card.locator('[data-media-video]')

  await expect
    .poll(() => clip.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(true)

  await card.hover()

  await expect
    .poll(() => clip.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(false)
})

test('the projects section states no count of its own cards', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#projects')).not.toContainText('tools shipped')
})

test('the aitk card writes the npm scope', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects article').first()).toContainText(
    '@erclx/aitk',
  )
})

test('clicking a card that owns a case study opens it', async ({ page }) => {
  await page.goto('/')

  await page.locator('#projects article').first().click()

  await expect(page).toHaveURL('/aitk')
})

test('a card link stays reachable above the whole-card overlay', async ({
  page,
}) => {
  await page.goto('/')
  const link = page
    .locator('#projects article')
    .first()
    .getByRole('link', { name: 'GitHub' })
  await link.hover()

  const topmost = await link.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const hit = document.elementFromPoint(
      box.x + box.width / 2,
      box.y + box.height / 2,
    )
    return hit?.closest('a')?.getAttribute('href') ?? null
  })

  expect(topmost).toBe('https://github.com/erclx/aitk')
})

test('every card owns a route and carries the overlay that opens it', async ({
  page,
}) => {
  await page.goto('/')
  const cards = page.locator('#projects article')
  const total = await cards.count()

  const overlays = await cards.locator('a[aria-hidden="true"]').count()

  expect(overlays).toBe(total)
})

test('the trailing card closes the grid across both columns', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const cards = page.locator('#projects article')

  const first = await cards.first().boundingBox()
  const trailing = await cards.nth(CARD_NAMES.length - 1).boundingBox()

  expect(trailing?.width).toBeGreaterThan((first?.width ?? 0) * 1.8)
})

test('two cards sharing a row share a lower edge', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')
  const cards = page.locator('#projects article')
  // The cards reveal on a stagger, so an early read catches one mid-transition
  // and measures the residue of its own travel rather than the layout. The
  // reveal runs 700ms behind a delay reaching 400ms, so a fixed wait races the
  // observer that starts it: at 1200ms the margin is 100ms and a slower machine
  // spends it before the transition begins. Waiting for the transform to rest
  // needs no budget and cannot go stale against a change to either duration.
  await cards.first().scrollIntoViewIfNeeded()
  // One assertion per card of the compared pair, rather than one over the set.
  // The three cards below the fold never reveal from this scroll position, so a
  // wait covering all five spends its own budget and reads the same
  // mid-transition box. Asserting per card also names which one failed, and
  // cannot pass on an empty match the way a predicate over a set does.
  await expect(cards.nth(0)).toHaveCSS('transform', 'none')
  await expect(cards.nth(1)).toHaveCSS('transform', 'none')

  const left = await cards.first().boundingBox()
  const right = await cards.nth(1).boundingBox()

  const leftEdge = (left?.y ?? 0) + (left?.height ?? 0)
  const rightEdge = (right?.y ?? 0) + (right?.height ?? 0)
  expect(Math.abs(leftEdge - rightEdge)).toBeLessThan(2)
})

test('the Jobtriage card renders the description the source carries', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#projects article').nth(1)).toContainText(
    'Live agent that triages Swedish job ads against a profile',
  )
})

test('a card names no provider the source leaves out', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects article').nth(1)).not.toContainText(
    'OpenAI',
  )
})

test('the Stackr card renders the description the source carries', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#projects article').nth(2)).toContainText(
    'stages files across a workspace into one block of LLM context',
  )
})

test('the Caret card renders the description the source carries', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('#projects article').nth(3)).toContainText(
    'saves prompts and drops them into Claude, Gemini, and ChatGPT',
  )
})
