import { expect, test } from '@playwright/test'

import { CARD_CLAIM } from '../scripts/card-copy'

const ROUTES = ['/', '/aitk', '/jobtriage', '/stackr', '/caret', '/diction']

// What Google truncates a description at. Every host shows less than this, so a
// description inside it is inside all of them.
const DESCRIPTION_CEILING = 155

test.describe('a shared link', () => {
  for (const route of ROUTES) {
    test(`declares a preview card on ${route}`, async ({ page }) => {
      await page.goto(route)

      const content = (selector: string) =>
        page.locator(selector).getAttribute('content')

      // A crawler fetches the image on its own rather than in the page's
      // context, so a root-relative path resolves against nothing and the
      // preview arrives with no image at all.
      const image = await content('meta[property="og:image"]')
      expect(image).toMatch(/^https:\/\//)

      const url = await content('meta[property="og:url"]')
      expect(url).toMatch(/^https:\/\//)

      // X shows a thumbnail beside the text without this and the full card
      // with it, so the tag rather than the image decides the size.
      expect(await content('meta[name="twitter:card"]')).toBe(
        'summary_large_image',
      )

      expect(await content('meta[property="og:image:alt"]')).toBeTruthy()
    })
  }

  test('says something different in the title and the description', async ({
    page,
  }) => {
    await page.goto('/')

    const title = (await page.title()).toLowerCase()
    const description = (
      (await page
        .locator('meta[property="og:description"]')
        .getAttribute('content')) ?? ''
    ).toLowerCase()

    // The two render stacked in an unfurl, so a description opening on the
    // title's own words spends its first line repeating the line above it. The
    // page shipped with a title ending "applied ai engineer" over a description
    // opening "applied ai engineer in gothenburg".
    const opener = description.split(/[.,]/)[0]?.trim() ?? ''
    expect(opener.length).toBeGreaterThan(0)
    expect(title).not.toContain(opener)

    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_CEILING)
  })

  test('says something the card does not already draw', async ({ page }) => {
    // The card draws the claim, and every host except LinkedIn prints the
    // description beside it, so a description carrying that same sentence
    // prints it twice in one unfurl. The check above guards the description
    // against the title and cannot see this: the apex shipped repeating the
    // claim and `bun run unfurl` is what showed it.
    const claim = CARD_CLAIM.toLowerCase().replace(/\.$/, '')

    for (const route of ROUTES) {
      await page.goto(route)
      const description = (
        (await page
          .locator('meta[property="og:description"]')
          .getAttribute('content')) ?? ''
      ).toLowerCase()

      expect(description).not.toContain(claim)
    }
  })

  test('carries no retired wording in a route title', async ({ page }) => {
    // `.claude/REQUIREMENTS.md` retired `case study` on 2026-08-18 because it
    // promises measured results that two of the five routes do not have. The
    // retirement reached the visible labels and not the page titles, which is
    // the surface a shared link actually shows.
    for (const route of ROUTES) {
      await page.goto(route)
      expect((await page.title()).toLowerCase()).not.toContain('case study')
    }
  })

  test('serves the card at the size every host accepts', async ({
    page,
    request,
  }) => {
    await page.goto('/')
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content')
    expect(image).toBeTruthy()

    // Fetched by path rather than by the absolute URL the tag carries, which
    // names the production host and is not what this run is serving.
    const path = new URL(image ?? '').pathname
    const response = await request.get(path)
    expect(response.status()).toBe(200)

    const declared = {
      width: await page
        .locator('meta[property="og:image:width"]')
        .getAttribute('content'),
      height: await page
        .locator('meta[property="og:image:height"]')
        .getAttribute('content'),
    }

    // A host that lays out the preview before the image arrives reads these,
    // so a declared size that disagrees with the file reflows the card.
    const actual = await page.evaluate(
      (src) =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image()
          image.onload = () =>
            resolve({ width: image.naturalWidth, height: image.naturalHeight })
          image.onerror = () => reject(new Error('failed to load the card'))
          image.src = src
        }),
      path,
    )

    expect(String(actual.width)).toBe(declared.width)
    expect(String(actual.height)).toBe(declared.height)
  })
})
