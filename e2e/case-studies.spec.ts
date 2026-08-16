import { expect, test } from '@playwright/test'

import { contrastRatio, paintedColor, relativeLuminance } from './colors'
import { loadedImageCount, scrollThroughPage } from './lazy-images'

const FIGURE_SELECTOR = 'main figure img'
const DICTION_FIGURE_COUNT = 6
const CASE_STUDY_ROUTES = ['/aitk', '/jobtriage', '/diction']

test('the aitk case study renders its claim and sections', async ({ page }) => {
  await page.goto('/aitk')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('aitk')
  await expect(page.locator('main')).toContainText(
    'installs one set of agent rules, skills, and standards into every project',
  )
  await expect(page.locator('main section[id]')).toHaveCount(5)
})

test('the aitk case study names the scoped package', async ({ page }) => {
  await page.goto('/aitk')

  await expect(page.locator('main')).toContainText('@erclx/aitk')
})

test('the diction case study renders its claim and sections', async ({
  page,
}) => {
  await page.goto('/diction')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('diction')
  await expect(page.locator('main')).toContainText(
    'scores each sound against what a native speaker actually sounds like',
  )
  await expect(page.locator('main section[id]')).toHaveCount(5)
})

test('the diction case study states the offline claim', async ({ page }) => {
  await page.goto('/diction')

  await expect(page.locator('main')).toContainText(
    'Nothing leaves the machine it runs on',
  )
})

test('every diction figure loads its image', async ({ page }) => {
  await page.goto('/diction')
  await scrollThroughPage(page)

  await expect
    .poll(() => loadedImageCount(page, FIGURE_SELECTOR))
    .toBe(DICTION_FIGURE_COUNT)
})

test('each case study links back to the landing page', async ({ page }) => {
  await page.goto('/aitk')

  await page.getByRole('link', { name: 'Back to Eric Le' }).click()
  await expect(page).toHaveURL('/')
})

test('the project cards link to both case studies', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('#projects a[href="/aitk"]').first()).toBeVisible()
  await expect(
    page.locator('#projects a[href="/diction"]').first(),
  ).toBeVisible()
})

test('a diction figure opens to a larger view', async ({ page }) => {
  await page.goto('/diction')

  await page.locator('[data-figure-zoom]').first().click()

  await expect(page.locator('[data-figure-dialog]')).toBeVisible()
})

test('an open figure closes on Escape without leaving the page', async ({
  page,
}) => {
  await page.goto('/diction')
  await page.locator('[data-figure-zoom]').first().click()

  await page.keyboard.press('Escape')

  await expect(page.locator('[data-figure-dialog]')).toBeHidden()
})

test('the page behind an open figure does not scroll', async ({ page }) => {
  await page.goto('/diction')
  await page.locator('[data-figure-zoom]').first().click()
  const resting = await page.evaluate(() => window.scrollY)

  await page.mouse.wheel(0, 1200)
  await page.waitForTimeout(300)

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(resting)
})

test('every opened figure fits without scrolling inside the dialog', async ({
  page,
}) => {
  await page.goto('/diction')
  const triggers = page.locator('[data-figure-zoom]')
  const overflowing: string[] = []

  for (let index = 0; index < (await triggers.count()); index += 1) {
    await triggers.nth(index).click()
    const scrolls = await page
      .locator('[data-figure-scroll]')
      .evaluate((el) => el.scrollHeight > el.clientHeight + 2)
    if (scrolls) overflowing.push(`figure ${index + 1}`)
    await page.keyboard.press('Escape')
  }

  expect(overflowing).toEqual([])
})

test('closing a figure returns focus to the figure that opened it', async ({
  page,
}) => {
  await page.goto('/diction')
  const trigger = page.locator('[data-figure-zoom]').first()
  await trigger.click()

  await page.keyboard.press('Escape')

  await expect(trigger).toBeFocused()
})

test('each case study carries one way home at the foot', async ({ page }) => {
  await page.goto('/diction')

  await expect(page.getByRole('link', { name: 'Back to Eric Le' })).toHaveCount(
    1,
  )
})

test('each case study also carries a way home in the top bar', async ({
  page,
}) => {
  await page.goto('/diction')

  await page.getByRole('link', { name: 'Eric Le', exact: true }).click()

  await expect(page).toHaveURL('/')
})

test('returning from a case study restores where the visitor left', async ({
  page,
}) => {
  await page.goto('/')
  await page.locator('#projects').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const left = await page.evaluate(() => window.scrollY)
  await page.locator('#projects article').first().click()
  await expect(page).toHaveURL('/aitk')

  await page.getByRole('link', { name: 'Back to Eric Le' }).click()

  await expect(page).toHaveURL('/')
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(left / 2)
})

test('a case study opened directly still links home', async ({ page }) => {
  await page.goto('/aitk')

  await page.getByRole('link', { name: 'Back to Eric Le' }).click()

  await expect(page).toHaveURL('/')
})

for (const route of CASE_STUDY_ROUTES) {
  test(`the top bar on ${route} sits at the same measure as the prose`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(route)

    const bar = await page.locator('header > div').boundingBox()
    const column = await page
      .locator('main section > div')
      .first()
      .boundingBox()

    expect(Math.abs((bar?.width ?? 0) - (column?.width ?? 0))).toBeLessThan(2)
  })
}

test('a figure plate holds a light ground in the dark theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')
  const plate = page.locator('main figure:has(img)').first()

  const plateColor = await paintedColor(plate, 'backgroundColor')
  const pageColor = await paintedColor(page.locator('body'), 'backgroundColor')

  expect(relativeLuminance(plateColor)).toBeGreaterThan(0.8)
  expect(relativeLuminance(pageColor)).toBeLessThan(0.1)
})

test('a figure caption stays readable on the plate in the dark theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')
  const plate = page.locator('main figure:has(img)').first()

  const plateColor = await paintedColor(plate, 'backgroundColor')
  const captionColor = await paintedColor(plate.locator('figcaption'), 'color')

  expect(contrastRatio(plateColor, captionColor)).toBeGreaterThan(4.5)
})

test('a focused figure keeps its ring legible on the plate in the dark theme', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')
  const plate = page.locator('main figure:has(img)').first()
  const trigger = plate.locator('[data-figure-zoom]')
  await trigger.focus()

  const plateColor = await paintedColor(plate, 'backgroundColor')
  const ringColor = await paintedColor(trigger, 'outlineColor')
  // outlineColor resolves whether or not a ring paints, so the style is what
  // separates a visible ring from a color nobody sees.
  const ringStyle = await trigger.evaluate(
    (element) => getComputedStyle(element).outlineStyle,
  )

  expect(ringStyle).not.toBe('none')
  expect(contrastRatio(plateColor, ringColor)).toBeGreaterThan(3)
})

test('a figure built from type keeps the plate the page uses', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')

  const tableColor = await paintedColor(
    page.locator('main figure:has(table)').first(),
    'backgroundColor',
  )

  expect(relativeLuminance(tableColor)).toBeLessThan(0.1)
})

// The three tests above assert the plate clears a threshold, which catches a
// plate that stopped being light and never catches one that stopped matching
// the palette it borrows from. This asserts the equality instead.
test('a figure plate tracks the light palette rather than a copy of it', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/diction')

  const plate = page.locator('main figure:has(img)').first()
  const source = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    return {
      card: root.getPropertyValue('--light-card').trim(),
      mutedForeground: root.getPropertyValue('--light-muted-foreground').trim(),
      ring: root.getPropertyValue('--light-ring').trim(),
    }
  })
  const resolved = await plate.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      card: style.getPropertyValue('--card').trim(),
      mutedForeground: style.getPropertyValue('--muted-foreground').trim(),
      ring: style.getPropertyValue('--ring').trim(),
    }
  })

  expect(resolved).toEqual(source)
})

test('a section opener on a case study reads above body copy', async ({
  page,
}) => {
  await page.goto('/diction')

  const opener = page.locator('#problem p').nth(1)
  const body = page.locator('#problem p').nth(2)

  const openerSize = await opener.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  )
  const bodySize = await body.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  )

  expect(openerSize).toBeGreaterThan(bodySize)
})
