import { expect, test } from '@playwright/test'

import { contrastRatio, paintedColor, relativeLuminance } from './colors'
import { loadedImageCount, scrollThroughPage } from './lazy-images'

const FIGURE_SELECTOR = 'main figure img'
const DICTION_FIGURE_COUNT = 6
const CASE_STUDY_ROUTES = [
  '/aitk',
  '/jobtriage',
  '/diction',
  '/stackr',
  '/caret',
]

for (const route of CASE_STUDY_ROUTES) {
  test(`every section on ${route} opens on a real heading`, async ({
    page,
  }) => {
    await page.goto(route)

    const sections = await page.locator('main section[id]').count()
    const headings = await page.locator('main section[id] h2').count()

    expect(sections).toBeGreaterThan(0)
    expect(headings).toBe(sections)
  })

  test(`a section heading on ${route} outsizes the prose under it`, async ({
    page,
  }) => {
    await page.goto(route)

    const sizes = await page.evaluate(() => {
      const heading = document.querySelector('main section[id] h2')
      const body = document.querySelector('main section[id] p')
      if (!heading || !body) return { heading: 0, body: 0 }
      return {
        heading: parseFloat(getComputedStyle(heading).fontSize),
        body: parseFloat(getComputedStyle(body).fontSize),
      }
    })

    expect(sizes.heading).toBeGreaterThan(sizes.body)
  })
}

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

test('a heading reached by a deep link clears the sticky bar on a phone', async ({
  page,
}) => {
  // From md the section's own padding clears the bar. Below md it does not, and
  // this is the width where a shared link is opened.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/diction#fix')
  await page.waitForLoadState('load')
  await page.evaluate(() => {
    window.location.hash = ''
    window.location.hash = '#fix'
  })

  const clearance = await page.evaluate(() => {
    const bar = document
      .querySelector('header[data-section="header"]')
      ?.getBoundingClientRect()
    const heading = document
      .querySelector('#fix h2, #fix h3')
      ?.getBoundingClientRect()
    if (!bar || !heading) return Number.NaN
    return heading.top - bar.height
  })

  expect(clearance).toBeGreaterThanOrEqual(0)
})

test('the route name stays out of the bar while its own title is on screen', async ({
  page,
}) => {
  await page.goto('/diction')

  await expect(page.locator('[data-route-here]')).not.toHaveAttribute(
    'data-shown',
    'true',
  )
})

test('the route name joins the bar once its title scrolls behind it', async ({
  page,
}) => {
  await page.goto('/diction')

  await page.evaluate(() =>
    window.scrollTo({ top: 1200, behavior: 'instant' as ScrollBehavior }),
  )

  await expect(page.locator('[data-route-here]')).toHaveAttribute(
    'data-shown',
    'true',
  )
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

test('the navigation bar holds one measure across every surface', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  const widths: number[] = []

  await page.goto('/')
  widths.push(
    (await page.locator('[data-site-bar] > div').boundingBox())?.width ?? 0,
  )

  for (const route of CASE_STUDY_ROUTES) {
    await page.goto(route)
    widths.push(
      (await page.locator('header[data-section="header"] > div').boundingBox())
        ?.width ?? 0,
    )
  }

  // The bar is the one element that persists across a navigation, so it holds
  // its shape rather than tracking the prose beneath it, which is fluid on a
  // route and varies per section on the landing page.
  expect(Math.min(...widths)).toBeGreaterThan(0)
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(2)
})

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

  // The section marker is a heading rather than a paragraph, so the lead is the
  // first paragraph in the section and the body copy follows it.
  const opener = page.locator('#problem p').nth(0)
  const body = page.locator('#problem p').nth(1)

  const openerSize = await opener.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  )
  const bodySize = await body.evaluate((element) =>
    parseFloat(getComputedStyle(element).fontSize),
  )

  expect(openerSize).toBeGreaterThan(bodySize)
})

test('the jobtriage canvas clip plays while it is hovered', async ({
  page,
}) => {
  await page.goto('/jobtriage')

  const clip = page.locator('[data-media-host] video[data-media-video]')
  await expect(clip).toHaveCount(1)

  await expect
    .poll(() => clip.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(true)

  await clip.hover()

  await expect
    .poll(() => clip.evaluate((video: HTMLVideoElement) => video.paused))
    .toBe(false)
})

test('the jobtriage clip posters an optimized derivative', async ({ page }) => {
  await page.goto('/jobtriage')

  const poster = await page
    .locator('video[data-media-video]')
    .getAttribute('poster')

  expect(poster).toMatch(/\.webp$/)
})
