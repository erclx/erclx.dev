import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CARD_CLAIM } from '../../scripts/card-copy'

/**
 * The copy a visitor reads is the copy the components hold. These assertions
 * read the built pages rather than a browser rendering them, since a text node
 * in a static file cannot differ between engines. They need `dist/`, so
 * `bun run test:rendered` runs them after a build and the unit run excludes
 * them.
 */

const DIST = join(process.cwd(), 'dist')

const ROUTES = ['/', '/canon', '/jobtriage', '/stackr', '/caret', '/diction']

// What Google truncates a description at. Every host shows less than this, so a
// description inside it is inside all of them.
const DESCRIPTION_CEILING = 155

/** Maps a route to the file Astro writes for it, the one thing a layout change breaks. */
function builtPath(route: string): string {
  return join(DIST, route === '/' ? '' : route, 'index.html')
}

function readPage(route: string): Document {
  const path = builtPath(route)
  if (!existsSync(path)) {
    throw new Error(`No built page at ${path}. Run bun run build first.`)
  }
  return new DOMParser().parseFromString(
    readFileSync(path, 'utf8'),
    'text/html',
  )
}

function meta(doc: Document, selector: string): string | null {
  return doc.querySelector(selector)?.getAttribute('content') ?? null
}

function textOf(doc: Document, selector: string): string {
  const element = doc.querySelector(selector)
  if (!element) throw new Error(`No element matches ${selector}`)
  return element.textContent ?? ''
}

const home = readPage('/')
const FOOTER = '[data-section="footer"]'

describe('the footer', () => {
  it('states how the page was made', () => {
    expect(textOf(home, FOOTER)).toContain(
      'Built with coding agents, which is also the work',
    )
  })

  it('states when the page was last deployed', () => {
    // A month and a year rather than a bare year, which within the current year
    // carries almost no information.
    expect(textOf(home, FOOTER)).toMatch(/Updated [A-Z][a-z]+ \d{4}/)
  })

  it('leaves the location to the closing ask', () => {
    expect(textOf(home, FOOTER).length).toBeGreaterThan(0)
    expect(textOf(home, FOOTER)).not.toContain('Gothenburg')
    expect(textOf(home, '#looking-for')).toContain('Gothenburg')
  })

  it('carries no copyright notice', () => {
    const text = textOf(home, FOOTER)

    expect(text.length).toBeGreaterThan(0)
    expect(text).not.toContain('©')
    expect(text.toLowerCase()).not.toContain('all rights reserved')
  })
})

describe('a shared link', () => {
  it.each(ROUTES)('declares a preview card on %s', (route) => {
    const doc = readPage(route)

    // A crawler fetches the image on its own rather than in the page's
    // context, so a root-relative path resolves against nothing and the
    // preview arrives with no image at all.
    expect(meta(doc, 'meta[property="og:image"]')).toMatch(/^https:\/\//)
    expect(meta(doc, 'meta[property="og:url"]')).toMatch(/^https:\/\//)

    // X shows a thumbnail beside the text without this and the full card
    // with it, so the tag rather than the image decides the size.
    expect(meta(doc, 'meta[name="twitter:card"]')).toBe('summary_large_image')

    expect(meta(doc, 'meta[property="og:image:alt"]')).toBeTruthy()
  })

  it('says something different in the title and the description', () => {
    const title = home.title.toLowerCase()
    const description = (
      meta(home, 'meta[property="og:description"]') ?? ''
    ).toLowerCase()

    // The two render stacked in an unfurl, so a description opening on the
    // title's own words spends its first line repeating the line above it.
    const opener = description.split(/[.,]/)[0]?.trim() ?? ''
    expect(title.length).toBeGreaterThan(0)
    expect(opener.length).toBeGreaterThan(0)
    expect(title).not.toContain(opener)

    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_CEILING)
  })

  it.each(ROUTES)(
    'says something the card does not already draw on %s',
    (route) => {
      // The card draws the claim, and every host except LinkedIn prints the
      // description beside it, so a description carrying that same sentence
      // prints it twice in one unfurl.
      const claim = CARD_CLAIM.toLowerCase().replace(/\.$/, '')
      const description = meta(
        readPage(route),
        'meta[property="og:description"]',
      )

      expect(description).toBeTruthy()
      expect((description ?? '').toLowerCase()).not.toContain(claim)
    },
  )

  it.each(ROUTES)('carries no retired wording in the title of %s', (route) => {
    // `case study` promises measured results that two of the five routes do not
    // have, and the retirement has to reach the title a shared link shows.
    const title = readPage(route).title

    expect(title.length).toBeGreaterThan(0)
    expect(title.toLowerCase()).not.toContain('case study')
  })
})
