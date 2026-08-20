import { expect, test } from '@playwright/test'

const STRIP = '[data-employers]'

test('the experience section names where the work happened', async ({
  page,
}) => {
  await page.goto('/')

  const strip = page.locator(STRIP)
  await expect(strip.getByRole('img', { name: 'Volvo Group' })).toHaveCount(1)
  await expect(
    strip.getByRole('img', { name: 'Chalmers University of Technology' }),
  ).toHaveCount(1)
  await expect(strip.getByRole('img', { name: 'Bac Ha Software' })).toHaveCount(
    1,
  )
})

test('the marks read in the order the timeline below them does', async ({
  page,
}) => {
  await page.goto('/')

  const order = await page
    .locator('[data-employers] li span[role="img"]')
    .evaluateAll((marks) =>
      marks.map((mark) => mark.getAttribute('aria-label') ?? ''),
    )

  // Newest start first, which puts the two employers before the university.
  expect(order).toEqual([
    'Volvo Group',
    'Bac Ha Software',
    'Chalmers University of Technology',
  ])
})

test('the marks sit between the prose and the record', async ({ page }) => {
  await page.goto('/')

  const positions = await page.evaluate(() => {
    const section = document.querySelector('[data-section="experience"]')
    const strip = section?.querySelector('[data-employers]')
    const list = section?.querySelector('.experience-list')
    if (!strip || !list || !section) return null
    return {
      strip: strip.getBoundingClientRect().top,
      list: list.getBoundingClientRect().top,
      heading: section.querySelector('h2')!.getBoundingClientRect().top,
    }
  })

  // Recognition arrives after the claim has been made and before the dated
  // record, which is the order the section argues in.
  expect(positions).not.toBeNull()
  expect(positions!.strip).toBeGreaterThan(positions!.heading)
  expect(positions!.strip).toBeLessThan(positions!.list)
})

test('each mark inherits the surrounding text color rather than a brand one', async ({
  page,
}) => {
  await page.goto('/')

  const fills = await page.evaluate(() => {
    const paths = document.querySelectorAll('[data-employers] svg [fill]')
    return Array.from(paths).map((path) => path.getAttribute('fill'))
  })

  expect(fills.length).toBeGreaterThan(0)
  expect(fills.every((fill) => fill === 'currentColor')).toBe(true)
})

test('the marks carry no affordance, since nothing here is operable', async ({
  page,
}) => {
  await page.goto('/')

  const strip = page.locator(STRIP)
  await expect(strip.locator('a')).toHaveCount(0)
  await expect(strip.locator('button')).toHaveCount(0)
})

test('the hovered name is hidden from assistive technology', async ({
  page,
}) => {
  await page.goto('/')

  // The mark already carries the accessible name, so the visible label would
  // otherwise be read a second time.
  const names = page.locator('[data-employer-name]')
  await expect(names).toHaveCount(3)
  for (let index = 0; index < 3; index += 1) {
    await expect(names.nth(index)).toHaveAttribute('aria-hidden', 'true')
  }
})

test('pointing at a mark names it on a pointer device', async ({ page }) => {
  await page.goto('/')

  const mark = page.locator('[data-employers] li').first()
  const name = mark.locator('[data-employer-name]')
  await expect(name).toHaveCSS('opacity', '0')

  // The label is suppressed on a coarse pointer, where it is unreachable and
  // costs a page that scrolls sideways. Keying that on hover alone hid it on
  // any engine reporting no hover capability, which is every desktop engine
  // that answers the query conservatively.
  await mark.hover()

  await expect(name).toHaveCSS('opacity', '1')
})
