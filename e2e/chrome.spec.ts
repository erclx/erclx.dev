import { expect, type Page, test } from '@playwright/test'

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 900 }

const scrollToEnd = (page: Page) =>
  page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

const scrollY = (page: Page) => page.evaluate(() => window.scrollY)

test.describe('the way back to the top', () => {
  test.use({ viewport: PHONE })

  test('the landing bar returns a reader at the end to the top', async ({
    page,
  }) => {
    await page.goto('/')
    await scrollToEnd(page)
    await expect(page.locator('[data-site-bar]')).toHaveAttribute(
      'data-revealed',
      'true',
    )

    await page.locator('[data-to-top]').click()

    await expect.poll(() => scrollY(page)).toBe(0)
  })

  test('a route bar returns a reader at the end to the top', async ({
    page,
  }) => {
    await page.goto('/canon')
    await scrollToEnd(page)
    await expect.poll(() => scrollY(page)).toBeGreaterThan(0)

    await page.getByRole('button', { name: 'Back to top of canon' }).click()

    await expect.poll(() => scrollY(page)).toBe(0)
  })
})

test.describe('the reading column', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the projects heading starts where the about heading does', async ({
    page,
  }) => {
    await page.goto('/')
    const about = await page.locator('#about h2').boundingBox()
    const projects = await page.locator('#projects h2').boundingBox()

    expect(about?.x ?? 0).toBeGreaterThan(0)
    expect(Math.abs((about?.x ?? 0) - (projects?.x ?? 0))).toBeLessThanOrEqual(
      1,
    )
  })

  test('the footer starts where the closing ask does', async ({ page }) => {
    await page.goto('/')
    const ask = await page.locator('#looking-for h2').boundingBox()
    const footer = await page
      .locator('[data-section="footer"] nav[aria-label="Elsewhere"]')
      .boundingBox()

    expect(ask?.x ?? 0).toBeGreaterThan(0)
    expect(Math.abs((ask?.x ?? 0) - (footer?.x ?? 0))).toBeLessThanOrEqual(1)
  })

  test('the footer links and the date share a baseline', async ({ page }) => {
    await page.goto('/')
    // The text's own box rather than the element's, since a link carries a
    // 44px target around a 20px line and its box bottom is not its text's.
    const textBottoms = await page.evaluate(() =>
      [
        '[data-section="footer"] nav a',
        '[data-section="footer"] [data-updated]',
      ].map((selector) => {
        const range = document.createRange()
        range.selectNodeContents(document.querySelector(selector) as Node)
        const rects = Array.from(range.getClientRects())
        return rects.at(-1)?.bottom ?? 0
      }),
    )

    expect(textBottoms[0]).toBeGreaterThan(0)
    expect(Math.abs(textBottoms[0] - textBottoms[1])).toBeLessThanOrEqual(0.5)
  })
})

test.describe('navigation chrome', () => {
  test.use({ viewport: DESKTOP })

  test('holds one width on the landing page and a route', async ({ page }) => {
    await page.goto('/')
    const landing = await page.locator('[data-bar-row]').boundingBox()
    await page.goto('/canon')
    const route = await page.locator('[data-bar-row]').boundingBox()

    expect(landing?.width ?? 0).toBeGreaterThan(0)
    expect(Math.abs((landing?.width ?? 0) - (route?.width ?? 0))).toBeLessThan(
      2,
    )
  })
})

test.describe('the section links', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  // Places the section's top a set distance below the middle of the viewport
  // and reports how far the page sits from its end, since the last section is
  // forced active within 4px of it and a pass there would prove nothing.
  const placeBelowCenter = (page: Page, id: string, offset: number) =>
    page.evaluate(
      ([target, below]) => {
        const section = document.getElementById(target as string)
        if (!section) return -1
        const top = section.getBoundingClientRect().top + window.scrollY
        window.scrollTo(0, top - window.innerHeight / 2 - (below as number))
        return (
          document.documentElement.scrollHeight -
          window.innerHeight -
          window.scrollY
        )
      },
      [id, offset],
    )

  test('mark Looking for while it holds the middle of the screen', async ({
    page,
  }) => {
    await page.goto('/')

    const fromEnd = await placeBelowCenter(page, 'looking-for', -40)

    expect(fromEnd).toBeGreaterThan(4)
    await expect(
      page.locator('[data-section-nav] a[href="#looking-for"]'),
    ).toHaveAttribute('aria-current', 'location')
  })

  test('keep Projects marked until Looking for reaches the middle', async ({
    page,
  }) => {
    await page.goto('/')

    const fromEnd = await placeBelowCenter(page, 'looking-for', 40)

    expect(fromEnd).toBeGreaterThan(4)
    await expect(
      page.locator('[data-section-nav] a[href="#projects"]'),
    ).toHaveAttribute('aria-current', 'location')
  })
})

test.describe('the sections menu on a phone', () => {
  test.use({ viewport: PHONE })

  const openMenu = async (page: Page) => {
    await page.goto('/canon')
    await page.getByRole('button', { name: 'Sections' }).click()
    await expect(page.locator('[data-section-menu]')).toBeVisible()
  }

  test('lists the route sections once opened', async ({ page }) => {
    await openMenu(page)

    await expect(
      page.locator('[data-section-menu]').getByRole('link'),
    ).toHaveText(['why i built it', 'how i use it', 'what it shows'])
  })

  test('closes on Escape and returns focus to its button', async ({ page }) => {
    await openMenu(page)

    await page.keyboard.press('Escape')

    await expect(page.locator('[data-section-menu]')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Sections' })).toBeFocused()
  })

  test('closes on a tap on the scrim and returns focus to its button', async ({
    page,
  }) => {
    await openMenu(page)

    await page.mouse.click(PHONE.width / 2, PHONE.height - 40)

    await expect(page.locator('[data-section-menu]')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Sections' })).toBeFocused()
  })

  test('closes when a reader picks a section', async ({ page }) => {
    await openMenu(page)

    await page
      .locator('[data-section-menu]')
      .getByRole('link', { name: 'what it shows' })
      .click()

    await expect(page.locator('[data-section-menu]')).toBeHidden()
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.getElementById('what-it-shows')?.getBoundingClientRect()
              .top ?? -1,
        ),
      )
      .toBeLessThan(PHONE.height / 2)
  })
})
