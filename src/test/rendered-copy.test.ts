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

// A browser matches copy against rendered text, which collapses the newlines
// the built HTML wraps a phrase across, so the raw text node reads differently.
function collapse(text: string | null): string {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

function textOf(doc: Document | Element, selector: string): string {
  const element = doc.querySelector(selector)
  if (!element) throw new Error(`No element matches ${selector}`)
  return collapse(element.textContent)
}

function queryAll(doc: Document | Element, selector: string): Element[] {
  return Array.from(doc.querySelectorAll(selector))
}

function attributeOf(
  doc: Document | Element,
  selector: string,
  name: string,
): string | null {
  return doc.querySelector(selector)?.getAttribute(name) ?? null
}

const home = readPage('/')
const FOOTER = '[data-section="footer"]'

const CARD_NAMES = ['canon', 'Jobtriage', 'Stackr', 'Caret', 'diction']
const CARD_SELECTOR = '#projects article'
// One per beat in the timeline. The record is a local const inside the
// component, so the count is stated here rather than derived.
const EXPERIENCE_ENTRY_COUNT = 6
const EMPLOYERS = [
  'Volvo Group',
  'Chalmers University of Technology',
  'Bac Ha Software',
]
// The résumé PDF is the long-form resource the link rule already exempts, so it
// carries a new-tab target while sitting behind a root-relative path.
const EXEMPT_INTERNAL_HREF = '/resume.pdf'

function card(index: number): string {
  const element = queryAll(home, CARD_SELECTOR)[index]
  if (!element) throw new Error(`No project card at ${index}`)
  return collapse(element.textContent)
}

function beatsNamed(name: string): Element[] {
  return queryAll(home, '#experience ol > li').filter((beat) =>
    collapse(beat.textContent).toLowerCase().includes(name),
  )
}

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

describe('the header', () => {
  it('names the person in the level-one heading', () => {
    expect(queryAll(home, 'h1')).toHaveLength(1)
    expect(textOf(home, 'h1')).toBe('Eric Le')
  })

  it('states no claim, leaving the stage to the concept layer', () => {
    expect(queryAll(home, 'header')).toHaveLength(1)
    const header = textOf(home, 'header')

    expect(header).toContain('Welcome to my corner of the internet')
    expect(header).not.toContain('the layer between a language model')
    expect(header).not.toContain('In practice that means agents')
  })

  it('leaves the location to the closing ask', () => {
    expect(queryAll(home, 'header')).toHaveLength(1)

    expect(textOf(home, 'header')).not.toContain('Gothenburg')
    expect(textOf(home, '#looking-for')).toContain('Gothenburg')
  })

  it('leaves the availability status to the closing ask', () => {
    expect(queryAll(home, 'header')).toHaveLength(1)

    expect(queryAll(home, '#looking-for .status-dot')).toHaveLength(1)
    expect(queryAll(home, 'header .status-dot')).toHaveLength(0)
    expect(textOf(home, '#looking-for')).toContain('Open to work')
    expect(textOf(home, 'header')).not.toContain('Open to work')
  })
})

describe('the about surface', () => {
  it('reads as personal rather than professional', () => {
    const about = textOf(home, '[data-section="about"]')

    expect(about).toContain('this should be easier')
    expect(about).toContain('I play guitar')
    expect(about).not.toContain('agents')
    expect(about).not.toContain('Volvo')
  })
})

describe('the landing page', () => {
  it('ships no open visual decision', () => {
    // The scenarios harness serves candidate treatments from the running page
    // while a visual decision is open, and the arms and the call site are
    // deleted in the change that applies the pick. An arm left mounted renders
    // nothing until its parameter is named, so it survives every capture and
    // every read of the page. The absence is asserted beside the page's own
    // main being found, since a selector matching nothing passes on its own.
    expect(queryAll(home, 'main')).toHaveLength(1)

    expect(queryAll(home, '[data-scenario-switcher]')).toHaveLength(0)
  })

  it('tracks every section in the rail', () => {
    const labels = queryAll(home, '[data-section-nav] a').map((link) =>
      collapse(link.textContent),
    )

    expect(labels).toEqual([
      'About me',
      'Experience',
      'Projects',
      'Looking for',
    ])
  })
})

describe('the experience section', () => {
  it('keeps the claim beside the prose depending on it', () => {
    const experience = textOf(home, '#experience')

    expect(experience).toContain(
      'the layer between a language model and the job it has to do',
    )
    expect(experience).toContain('In practice that means agents')
    expect(experience).toContain('I spend most of my working day')
  })

  it('renders one entry per beat', () => {
    expect(queryAll(home, '#experience ol > li')).toHaveLength(
      EXPERIENCE_ENTRY_COUNT,
    )
  })

  it('carries a head and a supporting sentence on every entry', () => {
    expect(queryAll(home, '#experience .experience-head')).toHaveLength(
      EXPERIENCE_ENTRY_COUNT,
    )
    expect(
      queryAll(home, '#experience .experience-detail').length,
    ).toBeGreaterThan(0)
  })

  it('carries a line for each of the two pieces of work in one beat', () => {
    const volvoBeats = beatsNamed('volvo technology')

    expect(volvoBeats).toHaveLength(1)
    expect(
      volvoBeats.flatMap((beat) => queryAll(beat, '.experience-detail')),
    ).toHaveLength(2)
  })

  it('marks every entry on the rail', () => {
    expect(queryAll(home, '#experience .experience-marker')).toHaveLength(
      EXPERIENCE_ENTRY_COUNT,
    )
  })

  it('states each span in its own column rather than in the head', () => {
    expect(queryAll(home, '#experience .experience-date')).toHaveLength(
      EXPERIENCE_ENTRY_COUNT,
    )
    expect(queryAll(home, '#experience .experience-head')).toHaveLength(
      EXPERIENCE_ENTRY_COUNT,
    )

    expect(textOf(home, '#experience .experience-head')).not.toContain('2026')
  })

  it('carries the internship the record holds', () => {
    const dates = beatsNamed('bac ha software').flatMap((beat) =>
      queryAll(beat, '.experience-date'),
    )

    expect(beatsNamed('bac ha software')).toHaveLength(1)
    expect(dates).toHaveLength(1)
    expect(collapse(dates[0]?.textContent ?? '')).toContain('2023')
  })

  it('names the field of the degree', () => {
    expect(textOf(home, '#experience')).toContain('complex adaptive systems')
  })

  it('carries no engagement vocabulary', () => {
    expect(queryAll(home, '#experience ol > li')).toHaveLength(
      EXPERIENCE_ENTRY_COUNT,
    )
    expect(textOf(home, '#experience')).toContain('complex adaptive systems')

    expect(textOf(home, '#experience').toLowerCase()).not.toContain(
      'contract iii',
    )
  })

  it('names the cards below it on its chips', () => {
    const chips = queryAll(home, '#experience ul a').map((chip) =>
      collapse(chip.textContent),
    )
    const cards = queryAll(home, '#projects h3').map((heading) =>
      collapse(heading.textContent),
    )

    expect(chips.length).toBeGreaterThan(0)
    expect(chips).toEqual(cards)
  })

  it('names where the work happened', () => {
    const marks = queryAll(home, '[data-employers] [role="img"]')

    expect(marks.map((mark) => mark.getAttribute('aria-label'))).toEqual(
      expect.arrayContaining(EMPLOYERS),
    )
    expect(marks).toHaveLength(EMPLOYERS.length)
  })

  it('carries no affordance on the marks, since nothing there is operable', () => {
    expect(queryAll(home, '[data-employers] [role="img"]')).toHaveLength(
      EMPLOYERS.length,
    )

    expect(queryAll(home, '[data-employers] a')).toHaveLength(0)
    expect(queryAll(home, '[data-employers] button')).toHaveLength(0)
  })

  it('hides the hovered name from assistive technology', () => {
    // The mark already carries the accessible name, so the visible label would
    // otherwise be read a second time.
    const names = queryAll(home, '[data-employer-name]')

    expect(names).toHaveLength(EMPLOYERS.length)
    expect(names.map((name) => name.getAttribute('aria-hidden'))).toEqual(
      EMPLOYERS.map(() => 'true'),
    )
  })
})

describe('the projects section', () => {
  it('renders a heading on every card', () => {
    expect(
      queryAll(home, '#projects h3').map((heading) =>
        collapse(heading.textContent),
      ),
    ).toEqual(CARD_NAMES)
  })

  it('states no count of its own cards', () => {
    expect(queryAll(home, CARD_SELECTOR)).toHaveLength(CARD_NAMES.length)

    expect(textOf(home, '#projects')).not.toContain('tools shipped')
  })

  it('renders a poster on a card without a hover video', () => {
    // The browser test also read the poster as visible, which a static file
    // cannot state. This asserts the poster is in the markup and the video is not.
    const diction = queryAll(home, CARD_SELECTOR).slice(4, 5)

    expect(diction).toHaveLength(1)
    expect(
      diction.flatMap((element) => queryAll(element, '[data-media-poster]')),
    ).toHaveLength(1)
    expect(
      diction.flatMap((element) => queryAll(element, '[data-media-video]')),
    ).toHaveLength(0)
  })

  it('writes the npm scope on the canon card', () => {
    expect(card(0)).toContain('@erclx/canon')
  })

  it('carries the overlay that opens its route on every card', () => {
    const cards = queryAll(home, CARD_SELECTOR)
    const overlays = queryAll(home, `${CARD_SELECTOR} a[aria-hidden="true"]`)

    expect(cards).toHaveLength(CARD_NAMES.length)
    expect(overlays).toHaveLength(cards.length)
  })

  it('renders the description the source carries on the Jobtriage card', () => {
    expect(card(1)).toContain(
      'Live agent that triages Swedish job ads against a profile',
    )
  })

  it('names no provider the source leaves out on the Jobtriage card', () => {
    expect(card(1)).toContain('Jobtriage')

    expect(card(1)).not.toContain('OpenAI')
  })

  it('renders the description the source carries on the Stackr card', () => {
    expect(card(2)).toContain(
      'stages files across a workspace into one block of LLM context',
    )
  })

  it('renders the description the source carries on the Caret card', () => {
    expect(card(3)).toContain(
      'saves prompts and drops them into Claude, Gemini, and ChatGPT',
    )
  })

  it('links to both case studies from a card', () => {
    // The browser test also read each link as visible, which a static file
    // cannot state. This asserts the links are declared.
    expect(queryAll(home, '#projects a[href="/canon"]').length).toBeGreaterThan(
      0,
    )
    expect(
      queryAll(home, '#projects a[href="/diction"]').length,
    ).toBeGreaterThan(0)
  })
})

describe('a case study', () => {
  it('renders the canon claim and sections', () => {
    const doc = readPage('/canon')

    expect(textOf(doc, 'h1')).toBe('canon')
    expect(textOf(doc, 'main')).toContain(
      'distributes AI-development rules, skills, and workflows from one source',
    )
    expect(queryAll(doc, 'main section[id]')).toHaveLength(6)
  })

  it('names the scoped package on the canon route', () => {
    expect(textOf(readPage('/canon'), 'main')).toContain('@erclx/canon')
  })

  it('renders the diction claim and sections', () => {
    const doc = readPage('/diction')

    expect(textOf(doc, 'h1')).toBe('diction')
    expect(textOf(doc, 'main')).toContain(
      'scores each sound against what a native speaker actually sounds like',
    )
    expect(queryAll(doc, 'main section[id]')).toHaveLength(6)
  })

  it('states the offline claim on the diction route', () => {
    expect(textOf(readPage('/diction'), 'main')).toContain(
      'Nothing leaves the machine it runs on',
    )
  })

  it('posters the Jobtriage clip with an optimized derivative', () => {
    const doc = readPage('/jobtriage')

    expect(queryAll(doc, 'video[data-media-video]')).toHaveLength(1)
    expect(attributeOf(doc, 'video[data-media-video]', 'poster')).toMatch(
      /\.webp$/,
    )
  })
})

describe('the icons', () => {
  it('leads the icon relation with the vector and keeps the raster behind it', () => {
    // An engine that reads the vector never requests the raster, so the order
    // states which one is the fallback rather than a mechanism.
    const icons = queryAll(home, 'link[rel="icon"]')

    expect(icons).toHaveLength(2)
    expect(icons[0]?.getAttribute('href')).toBe('/favicon.svg')
    expect(icons[0]?.getAttribute('type')).toBe('image/svg+xml')
    expect(icons[1]?.getAttribute('href')).toBe('/favicon-32.png')
    expect(icons[1]?.getAttribute('sizes')).toBe('32x32')
  })

  it('declares the apple touch icon at 180 square', () => {
    const selector = 'link[rel="apple-touch-icon"]'

    expect(queryAll(home, selector)).toHaveLength(1)
    expect(attributeOf(home, selector, 'href')).toBe('/apple-touch-icon.png')
    expect(attributeOf(home, selector, 'sizes')).toBe('180x180')
  })
})

describe('a link', () => {
  it.each(ROUTES)(
    'opens every outbound link on %s in a new tab with noopener',
    (route) => {
      const links = queryAll(readPage(route), 'a[href^="http"]')
      const offenders = links
        .filter(
          (link) =>
            link.getAttribute('target') !== '_blank' ||
            link.getAttribute('rel') !== 'noopener',
        )
        .map((link) => link.getAttribute('href'))

      expect(links.length).toBeGreaterThan(0)
      expect(offenders).toEqual([])
    },
  )

  it.each(ROUTES)(
    'keeps internal navigation on %s in the current tab',
    (route) => {
      const links = queryAll(readPage(route), 'a[href^="/"]')
      const offenders = links
        .filter(
          (link) =>
            link.getAttribute('href') !== EXEMPT_INTERNAL_HREF &&
            link.getAttribute('target') !== null,
        )
        .map((link) => link.getAttribute('href'))

      expect(links.length).toBeGreaterThan(0)
      expect(offenders).toEqual([])
    },
  )

  it('keeps the new-tab pairing on the resume link', () => {
    const selector = `a[href="${EXEMPT_INTERNAL_HREF}"]`

    expect(queryAll(home, selector).length).toBeGreaterThan(0)
    expect(attributeOf(home, selector, 'target')).toBe('_blank')
    expect(attributeOf(home, selector, 'rel')).toBe('noopener')
  })
})
