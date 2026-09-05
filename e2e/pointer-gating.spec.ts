import { expect, test } from '@playwright/test'

import { settleScroll } from './scroll'

const CARD = '[data-tilt]'
const ROW = '.experience-row'
/**
 * The window a drag has to prove nothing happened across, for the two cases
 * where the read is a negative: the pointer gate keeps the whole tilt and
 * active-row systems from ever wiring up under a coarse pointer, so there is
 * no completion event a passing case could poll for, only a span to hold the
 * page in front of a regression that wired them up anyway.
 */
const PROVE_NOTHING_MS = 500

// A real touch device is what the gate keys on, and only a context reporting a
// coarse pointer is one. Chromium is the engine that reports it from
// `hasTouch`, which is why these run there rather than across the matrix: the
// question is whether the page reads the capability, and one engine that
// reports the capability honestly answers it.
test.describe('a touch reader', () => {
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'only chromium reports a coarse pointer from an emulated touch context',
  )

  test('drags down the page without tilting a card', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 820, height: 1180 },
    })
    const page = await context.newPage()
    await page.goto(baseURL ?? '/')

    // The gate is what this asserts, so a context that does not report a coarse
    // pointer would pass the drag below while proving nothing at all.
    const coarse = await page.evaluate(
      () => window.matchMedia('(pointer: coarse)').matches,
    )
    expect(coarse).toBe(true)

    const card = page.locator(CARD).first()
    await card.scrollIntoViewIfNeeded()
    await settleScroll(page)

    const box = await card.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    // A finger landing on the card and moving up the screen, which is what
    // a reader does to read on. Bound ungated, this rotated the card and left
    // it rotated, since the pointer is destroyed on lift and never returns it.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.8)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.2, {
      steps: 12,
    })
    await page.mouse.up()

    // A duration rather than a settle: `initTilt` never attaches a listener
    // under a coarse pointer, so there is no completion this could poll for,
    // only a span to hold the page in front of a gate that wired up anyway.
    await page.waitForTimeout(PROVE_NOTHING_MS)

    const tilt = await card.evaluate((element) => ({
      x: (element as HTMLElement).style.getPropertyValue('--tilt-x'),
      y: (element as HTMLElement).style.getPropertyValue('--tilt-y'),
    }))

    expect(tilt.x).toBe('')
    expect(tilt.y).toBe('')

    await context.close()
  })

  test('drags across the timeline without walking it off its resting beat', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 820, height: 1180 },
    })
    const page = await context.newPage()
    await page.goto(baseURL ?? '/')

    const rows = page.locator(ROW)
    await rows.first().scrollIntoViewIfNeeded()
    await settleScroll(page)

    // The beat the list marks from first paint. A drag crossing the rows used
    // to hand the mark to each in turn and leave it on the last one crossed.
    const restingBeat = await rows
      .first()
      .evaluate((element) => element.getAttribute('data-active'))
    expect(restingBeat).toBe('true')

    const last = rows.last()
    const box = await last.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    await page.mouse.move(box.x + 20, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 20, box.y - box.height * 3, { steps: 12 })
    await page.mouse.up()

    // A duration rather than a settle, for the same reason as the tilt case
    // above: the row-swap listener never attaches under a coarse pointer, so
    // nothing here completes for a poll to catch.
    await page.waitForTimeout(PROVE_NOTHING_MS)

    await expect(rows.first()).toHaveAttribute('data-active', 'true')
    await expect(last).not.toHaveAttribute('data-active', 'true')

    await context.close()
  })
})

test.describe('a pointer reader', () => {
  test.skip(
    ({ browserName }) => browserName === 'firefox',
    'reports no pointer capability on a desktop that hovers, so the gate closes',
  )

  test('still tilts a card under a hovering pointer', async ({
    page,
    baseURL,
  }) => {
    await page.goto(baseURL ?? '/')

    const card = page.locator(CARD).first()
    await card.scrollIntoViewIfNeeded()
    await settleScroll(page)

    const box = await card.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return

    // The gate has to leave the pointer path alone, which is the half a
    // capability check breaks when it is written the other way round.
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.25)

    // Settled on the style the tilt loop writes rather than paused for a span:
    // `initTilt` runs its lerp toward the target over several frames, and the
    // assertion only needs the loop to have painted once, not to have
    // converged.
    await page.waitForFunction(
      (selector) =>
        document
          .querySelector<HTMLElement>(selector)
          ?.style.getPropertyValue('--tilt-x') !== '',
      CARD,
      { timeout: 5000 },
    )

    const tilt = await card.evaluate((element) =>
      (element as HTMLElement).style.getPropertyValue('--tilt-x'),
    )
    expect(tilt).not.toBe('')
  })
})
