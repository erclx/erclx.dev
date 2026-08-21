import { execFileSync } from 'node:child_process'

import { chromium, type Page } from '@playwright/test'

// Walks every page and reports the vertical space a reader crosses at each
// section boundary, as content-to-content rather than as box padding.
//
// It exists because spacing is decided per section and read per page. A gap
// tuned on one surface has no way of knowing whether it agrees with the rest,
// which is how a route foot came to hold 184px above its control against 48
// below while the landing page ran 160 between every section.
//
// Padding is the wrong instrument for the same reason. Sections here sit flush
// and carry their space inside themselves, so every boundary measures zero
// between the boxes while a reader crosses 160px of it.
//
// Run: bun e2e/rhythm.ts
// Filter: RHYTHM_FILTER=diction,caret bun e2e/rhythm.ts

// The dev server's port is the base plus a per-worktree offset, so a literal
// here only resolves in the tree it was written in. `worktree-port.sh` is the
// one place that math lives and every other entry point already reads it.
const DEV_PORT_BASE = 4321

function devServerUrl(): string {
  const port = execFileSync('bash', [
    'scripts/worktree-port.sh',
    `${DEV_PORT_BASE}`,
  ])
    .toString()
    .trim()
  return `http://localhost:${port}`
}

const BASE = process.env.RHYTHM_BASE_URL ?? devServerUrl()
const FILTER = process.env.RHYTHM_FILTER?.split(',').map((term) => term.trim())

const ROUTES = ['/', '/aitk', '/jobtriage', '/stackr', '/caret', '/diction']

interface Boundary {
  readonly page: string
  readonly from: string
  readonly to: string
  /** Null where one side carried nothing this harness knows how to measure. */
  readonly gap: number | null
  /** What the reader meets after the gap, which is what justifies its size. */
  readonly arrivesOn: string
}

/**
 * The last thing painted in one section and the first in the next. Reads the
 * leaf rather than the container: a wrapper's box starts where its first child
 * does, so measuring wrappers reports the gap between two paddings and misses
 * the whitespace entirely.
 */
async function readBoundaries(page: Page, route: string): Promise<Boundary[]> {
  return page.evaluate((currentRoute) => {
    const scroll = window.scrollY
    const edge = (element: Element | undefined, side: 'top' | 'bottom') =>
      (element?.getBoundingClientRect()[side] ?? 0) + scroll

    // Named rather than inferred, because two heuristics both got this wrong.
    // "Leaf with text" excludes any paragraph carrying a `code` or an `em` and
    // measures the inline child instead, which sits wherever it happens to fall
    // in the block and misses every line that wraps below it. "Anything that
    // paints" admits decorative art whose box starts above the section it is
    // inside, which produced a boundary of minus 1283px.
    const TEXT = new Set([
      'P',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'LI',
      'DT',
      'DD',
      'TD',
      'TH',
      'FIGCAPTION',
      'BLOCKQUOTE',
      // A bare link is content, and leaving it out cost twice. A boundary
      // closing on one was measured through whatever else the link contained,
      // which at a route foot is the arrow and read 114px against the 104 the
      // anchor's own box sits at. A link carrying no icon yielded no leaf at
      // all and the boundary left the run entirely.
      'A',
    ])
    const MEDIA = new Set(['IMG', 'VIDEO', 'CANVAS'])

    const leaves = (root: Element | null) =>
      [...(root?.querySelectorAll('*') ?? [])].filter((node) => {
        const box = node.getBoundingClientRect()
        if (box.width === 0 || box.height === 0) return false

        const tag = node.tagName.toUpperCase()
        if (MEDIA.has(tag)) return true
        // An overlay is art rather than content, and it is the positioning
        // that separates the page's background from an icon in a link.
        if (tag === 'SVG') {
          const position = getComputedStyle(node).position
          return position === 'static' || position === 'relative'
        }
        return TEXT.has(tag) && (node.textContent ?? '').trim().length > 0
      })

    // The landing page marks its sections and a route marks only its bar and
    // its foot, so a route's body is read from the sections the rail tracks.
    const marked = [...document.querySelectorAll('[data-section]')]
    const routeBody = [...document.querySelectorAll('main section[id]')]
    const sections = [...new Set([...marked, ...routeBody])].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    // A section label the run can print, whether or not the section is marked.
    // `Element.id` returns an empty string rather than null when the attribute
    // is absent, so nullish coalescing never reaches the placeholder and an
    // unmarked section printed as nothing at all.
    const label = (section: Element) =>
      section.getAttribute('data-section') || section.id || '?'

    const out = []

    for (let index = 0; index < sections.length - 1; index++) {
      const here = leaves(sections[index])
      const next = leaves(sections[index + 1])
      // A boundary with nothing to measure on one side is reported as skipped
      // rather than dropped, since a run that silently omits it still prints a
      // total that reads as coverage.
      if (here.length === 0 || next.length === 0) {
        out.push({
          page: currentRoute,
          from: label(sections[index]),
          to: label(sections[index + 1]),
          gap: null,
          arrivesOn: 'nothing measurable',
        })
        continue
      }

      // Lowest and highest edge rather than last and first in document order.
      // An inline element is a leaf and can sit anywhere inside its block, so
      // document order put a `code` on the first line of a three-line paragraph
      // and reported a gap two lines too wide. Four boundaries read as outliers
      // that way, and every one of them ended on a `code` or an `em`.
      const lowest = Math.max(...here.map((node) => edge(node, 'bottom')))
      const highest = Math.min(...next.map((node) => edge(node, 'top')))
      const first =
        next.find((node) => edge(node, 'top') === highest) ?? next[0]
      out.push({
        page: currentRoute,
        from: label(sections[index]),
        to: label(sections[index + 1]),
        gap: Math.round(highest - lowest),
        // A heading stops the eye and earns a wider gap. Anything else does
        // not, which is the distinction a bare number cannot make.
        arrivesOn: /^H[1-6]$/.test(first.tagName)
          ? 'heading'
          : first.tagName.toLowerCase(),
      })
    }
    return out
  }, route)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const all: Boundary[] = []

for (const route of ROUTES) {
  if (FILTER && !FILTER.some((term) => route.includes(term))) continue
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  // Everything gated on a scroll is unrevealed and offset until the page moves,
  // and an element still translated into place reports a gap short by its own
  // travel rather than the one a settled reader sees.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => window.setTimeout(resolve, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(900)
  all.push(...(await readBoundaries(page, route)))
}
await browser.close()

console.log('')
console.log('='.repeat(72))
console.log('SECTION BOUNDARIES, content to content')
console.log('='.repeat(72))

let current = ''
for (const boundary of all) {
  if (boundary.page !== current) {
    current = boundary.page
    console.log('')
    console.log(current)
  }
  const reading =
    boundary.gap === null ? '    ?  ' : `${String(boundary.gap).padStart(5)}px`
  console.log(
    `  ${reading}  ${`${boundary.from} → ${boundary.to}`.padEnd(30)} arrives on ${boundary.arrivesOn}`,
  )
}

const measured = all.filter(
  (b): b is Boundary & { gap: number } => b.gap !== null,
)
const skipped = all.filter((b) => b.gap === null)
const onHeading = measured.filter((b) => b.arrivesOn === 'heading')
const onOther = measured.filter((b) => b.arrivesOn !== 'heading')
const span = (rows: readonly (Boundary & { gap: number })[]) =>
  rows.length === 0
    ? 'none'
    : `${Math.min(...rows.map((r) => r.gap))} to ${Math.max(...rows.map((r) => r.gap))}px`

console.log('')
console.log('-'.repeat(72))
console.log(
  `arriving on a heading   ${onHeading.length} boundaries, ${span(onHeading)}`,
)
console.log(
  `arriving on anything else ${onOther.length} boundaries, ${span(onOther)}`,
)
console.log(`nothing measurable        ${skipped.length} boundaries`)
console.log('')
console.log(
  `${measured.length} of ${all.length} boundaries measured across ${new Set(all.map((b) => b.page)).size} pages`,
)
