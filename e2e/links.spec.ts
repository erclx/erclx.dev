import { expect, test } from '@playwright/test'

const ROUTES = ['/', '/aitk', '/jobtriage', '/diction', '/stackr', '/caret']
const MINIMUM_TAP_TARGET_PX = 44
const PHONE = { width: 390, height: 844 }

// The résumé PDF is the long-form resource the link rule already exempts, so it
// carries a new-tab target while sitting behind a root-relative path.
const EXEMPT_INTERNAL_HREF = '/resume.pdf'

for (const route of ROUTES) {
  test(`every outbound link on ${route} opens in a new tab with noopener`, async ({
    page,
  }) => {
    await page.goto(route)

    const offenders = await page
      .locator('a[href^="http"]')
      .evaluateAll((links) =>
        links
          .filter(
            (link) =>
              link.getAttribute('target') !== '_blank' ||
              link.getAttribute('rel') !== 'noopener',
          )
          .map((link) => link.getAttribute('href')),
      )

    expect(offenders).toEqual([])
  })

  test(`internal navigation on ${route} stays in the current tab`, async ({
    page,
  }) => {
    await page.goto(route)

    const offenders = await page
      .locator('a[href^="/"]')
      .evaluateAll(
        (links, exempt) =>
          links
            .filter(
              (link) =>
                link.getAttribute('href') !== exempt &&
                link.getAttribute('target') !== null,
            )
            .map((link) => link.getAttribute('href')),
        EXEMPT_INTERNAL_HREF,
      )

    expect(offenders).toEqual([])
  })

  test(`every tap target on ${route} clears the phone minimum`, async ({
    page,
  }) => {
    await page.setViewportSize(PHONE)
    await page.goto(route)

    const undersized = await page
      .locator('a:visible, button:visible')
      .evaluateAll(
        (elements, minimum) =>
          elements
            .map((element) => {
              const box = element.getBoundingClientRect()
              const label =
                element.getAttribute('aria-label') ??
                element.textContent?.trim().slice(0, 40) ??
                ''
              return {
                label,
                width: Math.round(box.width),
                height: Math.round(box.height),
              }
            })
            .filter((entry) => entry.width < minimum || entry.height < minimum)
            .map((entry) => `${entry.label} (${entry.width}x${entry.height})`),
        MINIMUM_TAP_TARGET_PX,
      )

    expect(undersized).toEqual([])
  })
}

test('the mail handoff stays in the current tab', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('a[href^="mailto:"]')).not.toHaveAttribute(
    'target',
    '_blank',
  )
})

test('the resume link keeps the new-tab pairing it already had', async ({
  page,
}) => {
  await page.goto('/')
  const resume = page.locator(`a[href="${EXEMPT_INTERNAL_HREF}"]`)

  await expect(resume).toHaveAttribute('target', '_blank')
  await expect(resume).toHaveAttribute('rel', 'noopener')
})
