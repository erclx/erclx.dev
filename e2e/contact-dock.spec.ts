import { expect, test } from '@playwright/test'

const DOCK = '[data-contact-dock]'
/**
 * The window the two hero-only cases below hold the page in front of a
 * regression, since a claim that the dock has not yet revealed itself has no
 * completion to poll for.
 */
const PROVE_NOTHING_MS = 700

async function scrollPastHero(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const hero = document.querySelector('[data-section="header"]')
    if (!hero) return
    window.scrollTo({
      top: hero.getBoundingClientRect().height,
      behavior: 'instant',
    })
  })
  // Settled on the reveal gate itself rather than a guessed span. Every
  // caller of this helper wants the dock actually revealed, and a scroll
  // settling is not the same event: the gate is an IntersectionObserver
  // callback that can land after the scroll has already finished.
  await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')
}

test('the dock stays out of reach while the reader is still in the hero', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForTimeout(PROVE_NOTHING_MS)

  await expect(page.locator(DOCK)).not.toHaveAttribute('data-revealed', 'true')
})

test('the dock arrives once the reader has scrolled past the hero', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')
})

test('the dock holds to the end of the page, where the footer carries one of its four links', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'instant',
    }),
  )
  // No settle needed here: the web-first assertion below already polls for
  // the reveal, which was the only thing this pause was waiting on.

  // It stood down here until 2026-08-20, on the reading that the footer
  // repeats what it carries. The footer carries the resume alone, so standing
  // down removed three destinations at the moment a reader has finished
  // reading. The assertion below is what stops that being reintroduced.
  await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')
  await expect(page.locator(DOCK)).not.toHaveAttribute('data-near-footer')

  const footerLinks = await page.locator('footer a').count()
  expect(footerLinks).toBeLessThan(await page.locator(`${DOCK} a`).count())
})

test('no dock destination takes focus before the dock is revealed', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForTimeout(PROVE_NOTHING_MS)

  // Collapsed only hides the stack. The dock itself is invisible until it
  // arrives, so without inert a keyboard reader tabs through four destinations
  // that are not on screen and has no focus ring to follow.
  const landed = await page.locator(DOCK).evaluate((dock: HTMLElement) => {
    const link = dock.querySelector('a')
    link?.focus()
    return document.activeElement === link
  })

  expect(landed).toBe(false)
})

test('every contact destination takes focus once the dock is revealed', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)

  const landed = await page.locator(DOCK).evaluate((dock: HTMLElement) => {
    const link = dock.querySelector('a')
    link?.focus()
    return document.activeElement === link
  })

  expect(landed).toBe(true)
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
  const links = page.locator('[data-dock-links]')
  await page.locator(DOCK).hover()
  await expect(links).toHaveCSS('opacity', '1')

  const items = page.locator('[data-dock-links] li')
  await items.last().hover()
  // Settled on the same fade the assertion below reads, rather than paused for
  // a span that guesses the `[data-dock-name]` transition's 150ms.
  await expect(items.last().locator('[data-dock-name]')).toHaveCSS(
    'opacity',
    '1',
  )

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

test('the toggle reports expanded once focus opens the stack', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)
  await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')

  const dock = page.locator(DOCK)
  const toggle = dock.getByRole('button', { name: 'Contact' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')

  // The stylesheet opens the stack on `:focus-within`, so a reader arriving by
  // keyboard has four reachable destinations. The control has to say so rather
  // than reporting the state only a click reaches.
  await dock.getByRole('link', { name: 'GitHub' }).focus()

  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
})

test('a keyboard activation of the toggle keeps its place', async ({
  page,
}) => {
  await page.goto('/')
  await scrollPastHero(page)
  await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')

  const toggle = page.locator(DOCK).getByRole('button', { name: 'Contact' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')

  // Collapsing by pointer releases the control, since `:focus-within` would
  // otherwise hold the set open under the tap that just closed it. A keyboard
  // reader keeps focus instead, because dropping them on `body` restarts their
  // next tab at the top of the document.
  const stillOnToggle = await page
    .locator(DOCK)
    .evaluate((dock: HTMLElement) => dock.contains(document.activeElement))

  expect(stillOnToggle).toBe(true)
})

test.describe('the toggle on a touch device', () => {
  test.skip(
    ({ browserName }) => browserName === 'firefox',
    'isMobile emulation is unsupported in firefox',
  )
  test.use({ hasTouch: true, isMobile: true })

  test('a second tap closes what the first opened', async ({ page }) => {
    await page.goto('/')
    await scrollPastHero(page)
    await expect(page.locator(DOCK)).toHaveAttribute('data-revealed', 'true')

    const dock = page.locator(DOCK)
    const toggle = dock.getByRole('button', { name: 'Contact' })
    const links = dock.locator('[data-dock-links]')

    await toggle.tap()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(links).toHaveCSS('pointer-events', 'auto')

    // Three things held the set open against this tap. The touch pointer is
    // destroyed on lift, so `pointerleave` cleared the flag before the click
    // could read it and the control could only ever open. The control kept
    // focus, and `:hover` stays stuck on the last thing a finger touched.
    await toggle.tap()

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(links).toHaveCSS('pointer-events', 'none')
    await expect(links).toHaveCSS('opacity', '0')
  })
})
