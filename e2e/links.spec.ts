import { expect, test } from '@playwright/test'

const ROUTES = [
  '/',
  '/canon',
  '/jobtriage',
  '/diction',
  '/stackr',
  '/caret',
  '/annex',
]
const MINIMUM_TAP_TARGET_PX = 44
const PHONE = { width: 390, height: 844 }

for (const route of ROUTES) {
  test(`every tap target on ${route} clears the phone minimum`, async ({
    page,
  }) => {
    await page.setViewportSize(PHONE)
    await page.goto(route)

    // A link sitting inline in a sentence is exempt: WCAG's own target-size
    // criterion carries the same exception, since inflating a word inside a
    // paragraph to 44px breaks the line it sits in. Every control on this site
    // built to hit the minimum declares `inline-flex` or a block display for
    // that reason, so reading the computed display is the same "does it have
    // its own box" test the focus-ring and hover treatments already use.
    const undersized = await page
      .locator('a:visible, button:visible')
      .evaluateAll(
        (elements, minimum) =>
          elements
            .filter((element) => getComputedStyle(element).display !== 'inline')
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

    // The filter above reads computed display, which only a control sitting
    // as a direct child of its own flex row (the footer resume link, the
    // site-bar button, the route-bar home link) gets blockified into a box
    // regardless of what it declares. Every other control here sits inside an
    // `<li>` or a plain block container, so nothing blockifies it and a
    // regression from `inline-flex` to `inline` computes exactly as declared.
    // The class-list check below is what catches that on those controls,
    // read from the class list rather than from a computed style a parent
    // sometimes distorts and sometimes does not.
    const boxDisplayClasses = [
      'flex',
      'inline-flex',
      'block',
      'inline-block',
      'grid',
      'inline-grid',
    ]
    const sizedClasses = ['min-h-11', 'min-w-11', 'size-11']
    const sizedWithoutOwnBox = await page
      .locator('a:visible, button:visible')
      .evaluateAll(
        (elements, { boxClasses, sizedClasses }) =>
          elements
            .filter((element) =>
              Array.from(element.classList).some((className) =>
                sizedClasses.includes(className),
              ),
            )
            .filter(
              (element) =>
                !Array.from(element.classList).some((className) =>
                  boxClasses.includes(className),
                ),
            )
            .map((element) => {
              const label =
                element.getAttribute('aria-label') ??
                element.textContent?.trim().slice(0, 40) ??
                ''
              return `${label} (${element.className})`
            }),
        { boxClasses: boxDisplayClasses, sizedClasses },
      )

    // Assert the filter found controls at all. A selector matching nothing
    // satisfies the emptiness below without reading a single control, which
    // is how the narrower version passed while ten of them sat outside it.
    const sizedCount = await page
      .locator('a:visible, button:visible')
      .evaluateAll(
        (elements, sizedClasses) =>
          elements.filter((element) =>
            Array.from(element.classList).some((className) =>
              sizedClasses.includes(className),
            ),
          ).length,
        sizedClasses,
      )

    expect(sizedCount).toBeGreaterThan(0)
    expect(sizedWithoutOwnBox).toEqual([])
  })
}

test('every mail handoff stays in the current tab', async ({ page }) => {
  await page.goto('/')

  // The page carries the address in more than one place, so this asserts the
  // rule across every one rather than against whichever came first.
  const targets = await page
    .locator('a[href^="mailto:"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('target')))

  expect(targets.length).toBeGreaterThan(0)
  expect(targets.filter((target) => target === '_blank')).toEqual([])
})
