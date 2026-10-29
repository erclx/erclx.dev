import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { CARD_CLAIM } from '../../scripts/brand/card-copy'

/**
 * The copy a visitor reads is the copy the components hold. These assertions
 * read the built pages rather than a browser rendering them, since a text node
 * in a static file cannot differ between engines. They need `dist/`, so
 * `bun run test:rendered` runs them after a build and the unit run excludes
 * them.
 */

const DIST = join(process.cwd(), 'dist')

const ROUTES = [
  '/',
  '/canon',
  '/frameboard',
  '/stackr',
  '/caret',
  '/jobtriage',
  '/annex',
]

const PROJECT_ROUTES = ROUTES.filter((route) => route !== '/')

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

const CARD_NAMES = [
  'canon',
  'Frameboard',
  'Stackr',
  'Caret',
  'Jobtriage',
  'annex',
]
const CARD_SELECTOR = '#projects article'
// One per beat in the timeline. The record is a local const inside the
// component, so the count is stated here rather than derived.
const EXPERIENCE_ENTRY_COUNT = 5
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
  it('carries no colophon', () => {
    expect(textOf(home, FOOTER)).toMatch(/Updated [A-Z][a-z]+ \d{4}/)

    expect(textOf(home, FOOTER)).not.toContain('Built with coding agents')
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
    // title's own words spends its first line repeating the line above it. The
    // opener is the first sentence, since the career source's description
    // names the person before the role and the title names them too.
    const opener = description.split('.')[0]?.trim() ?? ''
    expect(title.length).toBeGreaterThan(0)
    expect(opener.length).toBeGreaterThan(0)
    expect(title).not.toContain(opener)

    expect(description.length).toBeLessThanOrEqual(DESCRIPTION_CEILING)
  })

  it('carries the source description on the landing page', () => {
    expect(meta(home, 'meta[name="description"]')).toBe(
      'Eric Le, software developer in Gothenburg who builds open-source tools for coding with AI agents.',
    )
  })

  it.each(ROUTES)(
    'says something the card does not already draw on %s',
    (route) => {
      // The card draws the header's line, and every host
      // except LinkedIn prints the description beside it, so a description
      // carrying that same sentence prints it twice in one unfurl.
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

  it('opens on the line the share card draws', () => {
    expect(queryAll(home, 'header')).toHaveLength(1)
    const header = textOf(home, 'header')

    expect(header).toContain(CARD_CLAIM)
    expect(header).not.toContain('In practice that means agents')
  })

  it.each(ROUTES)('renders no retired claim on %s', (route) => {
    expect(textOf(readPage(route), 'body')).not.toContain(
      'the layer between a language model',
    )
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
  it('introduces the person before the work', () => {
    expect(textOf(home, '[data-section="about"]')).toContain(
      "I'm Eric, a software developer in Gothenburg.",
    )
  })

  it('closes on one thing that is not work', () => {
    expect(textOf(home, '[data-section="about"]')).toContain(
      'Outside of that I play tennis and travel whenever I can.',
    )
  })

  it('sets the racket on the line naming tennis', () => {
    // The paragraphs render by index, so a racket attached to one by position
    // follows whatever line lands there when the bio reorders.
    const rackets = queryAll(home, '[data-section="about"] .about-racket')

    expect(rackets).toHaveLength(1)
    expect(collapse(rackets[0]?.closest('p')?.textContent ?? '')).toContain(
      'I play tennis',
    )
  })

  it('keeps the racket out of the accessibility tree', () => {
    const selector = '[data-section="about"] .about-racket'

    expect(queryAll(home, selector)).toHaveLength(1)
    expect(attributeOf(home, selector, 'aria-hidden')).toBe('true')
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
  it('opens on the timeline with no paragraph above it', () => {
    const experience = textOf(home, '#experience')

    expect(experience).toContain('volvo technology, gothenburg')
    expect(experience).not.toContain('For 18 months at Volvo Technology')
    expect(experience).not.toContain('the layer between a language model')
  })

  it('carries the canon line on the current beat', () => {
    const current = queryAll(home, '#experience ol > li[aria-current="step"]')

    expect(current).toHaveLength(1)
    expect(
      current.flatMap((beat) => queryAll(beat, '.experience-detail')),
    ).toHaveLength(1)
    expect(textOf(home, '#experience')).toContain(
      'Building canon and Frameboard, open-source tools for coding with AI agents, after earlier extensions for VS Code and Chrome.',
    )
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

  it('carries the agent and the conference on the Volvo beat', () => {
    const volvoBeats = beatsNamed('volvo technology')

    expect(volvoBeats).toHaveLength(1)
    expect(
      volvoBeats.flatMap((beat) => queryAll(beat, '.experience-detail')),
    ).toHaveLength(1)
    expect(textOf(home, '#experience')).toContain(
      'Built an agent that let test engineers get plots and figures from their truck test data',
    )
    expect(textOf(home, '#experience')).toContain(
      'Presented it remotely at Generative AI for Automotive USA 2024',
    )
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

  it('labels the marks with the line the source carries', () => {
    expect(collapse(textOf(home, '[data-employers] > p'))).toBe(
      "Where I've worked and studied",
    )
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
    const annex = queryAll(home, CARD_SELECTOR).filter(
      (element) =>
        collapse(queryAll(element, 'h3')[0]?.textContent) === 'annex',
    )

    expect(annex).toHaveLength(1)
    expect(
      annex.flatMap((element) => queryAll(element, '[data-media-poster]')),
    ).toHaveLength(1)
    expect(
      annex.flatMap((element) => queryAll(element, '[data-media-video]')),
    ).toHaveLength(0)
  })

  it('renders a dark still on the annex card for the dark theme', () => {
    const annex = queryAll(home, CARD_SELECTOR).filter(
      (element) =>
        collapse(queryAll(element, 'h3')[0]?.textContent) === 'annex',
    )

    expect(
      annex.flatMap((element) => queryAll(element, '[data-media-poster-dark]')),
    ).toHaveLength(1)
  })

  it('writes the npm scope on the canon card', () => {
    expect(card(0)).toContain('@erclx/canon')
  })

  it('renders the description the source carries on the canon card', () => {
    expect(card(0)).toContain(
      'canon takes each change from plan to reviewed pull request, with the same skills and rules in every repository.',
    )
  })

  it('renders the description the source carries on the Frameboard card', () => {
    expect(card(1)).toContain(
      'Frameboard is a board where they draw interfaces as plain HTML files, and I steer them by hand or with notes they answer.',
    )
  })

  it('carries a clip per theme on the canon card', () => {
    const videos = queryAll(queryAll(home, CARD_SELECTOR)[0] ?? home, 'video')

    expect(videos).toHaveLength(2)
    expect(videos.map((video) => video.getAttribute('class'))).toEqual([
      expect.stringContaining('dark:hidden'),
      expect.stringContaining('dark:block'),
    ])
  })

  it('carries one clip under both themes on the Frameboard card', () => {
    const frameboard = queryAll(home, CARD_SELECTOR)[1] ?? home

    expect(queryAll(frameboard, 'video')).toHaveLength(1)
    expect(attributeOf(frameboard, 'video', 'class')).not.toContain('dark:')
    expect(queryAll(frameboard, '[data-media-poster-dark]')).toHaveLength(1)
  })

  it('spans no card across both columns', () => {
    expect(queryAll(home, CARD_SELECTOR)).toHaveLength(CARD_NAMES.length)

    expect(queryAll(home, '#projects .lg\\:col-span-2')).toHaveLength(0)
  })

  it('carries the overlay that opens its route on every card', () => {
    const cards = queryAll(home, CARD_SELECTOR)
    const overlays = queryAll(home, `${CARD_SELECTOR} a[aria-hidden="true"]`)

    expect(cards).toHaveLength(CARD_NAMES.length)
    expect(overlays).toHaveLength(cards.length)
  })

  it('renders the description the source carries on the Jobtriage card', () => {
    expect(card(4)).toContain(
      'A job-search agent. Describe what you want, and it shows the ads that fit, each with a reason. Live to try, and its page has the retrieval numbers.',
    )
  })

  it('names no provider the source leaves out on the Jobtriage card', () => {
    expect(card(4)).toContain('Jobtriage')

    expect(card(4)).not.toContain('OpenAI')
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

  it('renders the description the source carries on the annex card', () => {
    expect(card(5)).toContain(
      'Search plus cross-reference traversal found 83% of them for about a seventh of the tokens, and showed which text it used.',
    )
  })

  it('opens the annex route from its card', () => {
    expect(queryAll(home, '#projects a[href="/annex"]').length).toBeGreaterThan(
      0,
    )
  })

  it('links to the canon route from its card', () => {
    // The browser test also read the link as visible, which a static file
    // cannot state. This asserts the link is declared.
    expect(queryAll(home, '#projects a[href="/canon"]').length).toBeGreaterThan(
      0,
    )
  })

  it('links to every route it builds from a card', () => {
    const routes = queryAll(home, `${CARD_SELECTOR} h3 a`).map((link) =>
      link.getAttribute('href'),
    )

    expect(routes).toEqual(PROJECT_ROUTES)
  })

  it('drops the intro sentence the source removed', () => {
    expect(textOf(home, '#projects')).not.toContain('One more lives at')
  })
})

describe('the closing ask', () => {
  it('states the one sentence the source carries', () => {
    expect(textOf(home, '#looking-for')).toContain(
      'Open to developer roles in Gothenburg or remote, full-time or contract.',
    )
  })

  it('carries no criteria list the source dropped', () => {
    expect(textOf(home, '#looking-for')).toContain('Open to work')

    expect(queryAll(home, '#looking-for dl')).toHaveLength(0)
  })

  it('hands the email to the mail client in the current tab', () => {
    const selector = '#looking-for a[href="mailto:me@erclx.dev"]'

    expect(queryAll(home, selector)).toHaveLength(1)
    expect(textOf(home, selector)).toBe('me@erclx.dev')
    expect(attributeOf(home, selector, 'target')).toBeNull()
  })

  it('opens the résumé in a new tab and names its format', () => {
    const selector = `#looking-for a[href="${EXEMPT_INTERNAL_HREF}"]`

    expect(queryAll(home, selector)).toHaveLength(1)
    expect(textOf(home, selector)).toBe('Résumé (PDF)')
    expect(attributeOf(home, selector, 'target')).toBe('_blank')
    expect(attributeOf(home, selector, 'rel')).toBe('noopener')
  })
})

describe('a project route', () => {
  it.each(PROJECT_ROUTES)(
    'states why the work started before what it shows on %s',
    (route) => {
      const ids = queryAll(readPage(route), 'main section[id]').map(
        (section) => section.id,
      )

      expect(ids).toHaveLength(4)
      expect(ids[0]).toBe(route.slice(1))
      expect(ids[1]).toBe('why-i-built-it')
      expect(ids[3]).toBe('what-it-shows')
    },
  )

  it.each(PROJECT_ROUTES)('tracks every section in the rail on %s', (route) => {
    const doc = readPage(route)
    const labels = queryAll(doc, '[data-section-nav] a').map((link) =>
      collapse(link.textContent),
    )
    const headings = queryAll(doc, 'main h2').map((heading) =>
      collapse(heading.textContent),
    )

    expect(labels.slice(1)).toEqual(headings)
  })

  it.each([
    [
      '/canon',
      'canon is how I build with AI coding agents, packaged so any repository can install it.',
    ],
    [
      '/frameboard',
      'Frameboard is a local design board where my coding agents and I design together.',
    ],
    [
      '/stackr',
      'Stackr is a VS Code extension that keeps named sets of files and copies each one into an AI chat as a single block, with the directory tree on top.',
    ],
    [
      '/caret',
      'Caret is a Chrome extension that opens a searchable prompt library right where you type, in Claude, Gemini and ChatGPT.',
    ],
    [
      '/jobtriage',
      "Jobtriage is a job-search agent over Sweden's public JobTech API.",
    ],
    ['/annex', 'annex is an agent for the EU AI Act.'],
  ])('opens on the source intro on %s', (route, sentence) => {
    expect(textOf(readPage(route), 'main')).toContain(sentence)
  })

  it.each([
    ['/canon', 'and I merge every pull request myself.'],
    ['/frameboard', 'I built it with canon, starting in October 2026.'],
    ['/stackr', 'and its tests run on Ubuntu, macOS and Windows.'],
    ['/caret', 'Published on the Chrome Web Store across four releases'],
    [
      '/jobtriage',
      'Hybrid search found 95% of the relevant ads in its top ten results.',
    ],
    ['/annex', 'Search plus cross-references found 83% of them'],
  ])('carries the source sections on %s', (route, sentence) => {
    expect(textOf(readPage(route), 'main')).toContain(sentence)
  })

  it.each([
    [
      '/canon',
      "canon runs a coding agent's work from plan to reviewed pull request, through one orchestrator that dispatches a planner, a worker and a reviewer.",
    ],
    [
      '/frameboard',
      'Frameboard is a local design board where coding agents draw interfaces as plain HTML files and I steer them by hand or with notes they answer.',
    ],
    [
      '/jobtriage',
      "A job-search agent over Sweden's public JobTech API that turns a profile and a question into a visual shortlist, with its retrieval measured.",
    ],
    [
      '/stackr',
      'A VS Code extension that keeps named sets of files and copies each into an AI chat as one block, with the tree on top. On the Marketplace and Open VSX.',
    ],
    [
      '/caret',
      'A prompt palette that opens where the cursor already is, on three chat sites that each handle text differently. A Chrome extension.',
    ],
    [
      '/annex',
      'An agent for the EU AI Act that maps a system to the articles that apply, built to test whether retrieval still helps when the whole law fits in context.',
    ],
  ])('carries the source description on %s', (route, description) => {
    expect(meta(readPage(route), 'meta[name="description"]')).toBe(description)
  })

  it('carries a loop per theme on the canon route', () => {
    const videos = queryAll(readPage('/canon'), 'main video[data-media-video]')

    expect(videos.map((video) => video.getAttribute('class'))).toEqual([
      expect.stringContaining('dark:hidden'),
      expect.stringContaining('dark:block'),
    ])
  })

  it('holds the Frameboard loop at its own ratio', () => {
    const doc = readPage('/frameboard')

    expect(queryAll(doc, 'main video[data-media-video]')).toHaveLength(1)
    expect(attributeOf(doc, 'main video', 'class')).toContain(
      'aspect-[880/588]',
    )
  })

  it('keeps both annex screenshots and drops the evaluation table', () => {
    const doc = readPage('/annex')

    expect(queryAll(doc, 'main figure img')).toHaveLength(2)
    expect(queryAll(doc, 'main table')).toHaveLength(0)
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
