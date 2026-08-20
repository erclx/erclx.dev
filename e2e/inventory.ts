import { execFileSync } from 'node:child_process'

import { chromium, type Page } from '@playwright/test'

// Walks every page and reports what each interactive element does when a
// pointer lands on it, grouped by the treatment rather than by the component.
//
// It exists because a hover treatment is decided per component and read per
// page. Judging cohesion by opening five files tells you what each one says;
// this tells you how many different answers the site actually gives, and which
// element is the only one giving its own.
//
// Run: bun e2e/inventory.ts
// Filter: INVENTORY_FILTER=projects,footer bun e2e/inventory.ts

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

const BASE = process.env.INVENTORY_BASE_URL ?? devServerUrl()
const FILTER = process.env.INVENTORY_FILTER?.split(',').map((t) => t.trim())

const ROUTES = ['/', '/aitk', '/jobtriage', '/stackr', '/caret', '/diction']

/** The properties a hover treatment can move. */
const TRACKED = [
  'color',
  'backgroundColor',
  'borderTopColor',
  'borderTopWidth',
  'boxShadow',
  'opacity',
  'transform',
  'textDecorationLine',
] as const

interface Probe {
  readonly page: string
  readonly section: string
  readonly label: string
  readonly tag: string
  readonly width: number
  readonly height: number
  readonly rest: Record<string, string>
  readonly hover: Record<string, string>
}

// Reads the control and everything that paints with it: its two pseudo
// elements and its descendants. A treatment is routinely written on a child
// span or on an ::after inset behind the content, and a reader that only
// measured the element itself reported both as controls that do nothing.
function readTreatment(element: Element, keys: string[]) {
  const out: Record<string, string> = {}
  const collect = (node: Element, prefix: string, pseudo?: string) => {
    const style = getComputedStyle(node, pseudo)
    for (const key of keys) {
      out[`${prefix}${key}`] = style[key as never] as string
    }
  }
  collect(element, '')
  collect(element, '::before/', '::before')
  collect(element, '::after/', '::after')
  const kids = element.querySelectorAll('*')
  for (const [i, kid] of [...kids].slice(0, 4).entries()) {
    collect(kid, `child${i}/`)
  }
  return out
}

async function probePage(page: Page, route: string): Promise<Probe[]> {
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  // Everything gated on a scroll is off-screen and inert until the page moves.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.4))
  await page.waitForTimeout(900)
  await page.evaluate(() => {
    for (const el of document.querySelectorAll(
      '[data-contact-dock],[data-section-nav],[data-site-bar]',
    )) {
      el.setAttribute('data-revealed', 'true')
      el.removeAttribute('inert')
    }
    // A surface still waiting to reveal is transparent and offset, so a probe
    // that hovers it lands on whatever sits behind and reports the element as
    // having no response at all. Every reveal is settled before anything is
    // read, which is what separates a real dead control from an unrevealed one.
    for (const el of document.querySelectorAll('[data-fade]')) {
      el.setAttribute('data-visible', 'true')
    }
  })
  await page.waitForTimeout(700)

  // Astro's dev toolbar renders its own buttons into every page in dev, and
  // they are not the site's. Reported once as a site-wide treatment nobody
  // wrote, which is worse than not reporting them at all.
  const handles = await page
    .locator('a, button')
    .and(page.locator(':not(astro-dev-toolbar *)'))
    .elementHandles()
  const probes: Probe[] = []

  for (const handle of handles) {
    const meta = await handle.evaluate((node) => {
      const el = node as Element
      const box = el.getBoundingClientRect()
      const host =
        el.closest('[data-contact-dock]') !== null
          ? 'contact-dock'
          : el.closest('[data-section-nav]') !== null
            ? 'section-rail'
            : el.closest('[data-site-bar]') !== null
              ? 'site-bar'
              : (el.closest('[data-section]')?.getAttribute('data-section') ??
                el.closest('footer')?.tagName.toLowerCase() ??
                'page')
      return {
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute('aria-label') || el.textContent || '')
          .trim()
          .slice(0, 24),
        section: host,
        width: Math.round(box.width),
        height: Math.round(box.height),
        visible: box.width > 0 && box.height > 0,
      }
    })
    if (!meta.visible) continue

    const rest = await handle.evaluate(readTreatment, [...TRACKED])
    // Hovering through the mouse rather than a class, so a treatment driven by
    // an ancestor's :hover is caught the same as one on the element itself.
    try {
      await handle.hover({ timeout: 1200 })
      await page.waitForTimeout(320)
    } catch {
      continue
    }
    const hover = await handle.evaluate(readTreatment, [...TRACKED])
    // Park the pointer somewhere inert so the next probe starts clean.
    await page.mouse.move(2, 2)
    await page.waitForTimeout(160)

    probes.push({
      page: route,
      section: meta.section,
      label: meta.label,
      tag: meta.tag,
      width: meta.width,
      height: meta.height,
      rest,
      hover,
    })
  }
  return probes
}

/** What actually moved, as a stable signature two elements can be compared on. */
function signature(probe: Probe): string {
  const moved = new Set<string>()
  for (const key of Object.keys(probe.rest)) {
    if (probe.rest[key] === probe.hover[key]) continue
    // The property is what matters for cohesion; where it is painted is an
    // implementation detail two components may legitimately differ on.
    const property = key.slice(key.lastIndexOf('/') + 1)
    if (property === 'boxShadow') {
      moved.add(probe.hover[key] === 'none' ? 'shadow-off' : 'glow')
    } else {
      moved.add(property)
    }
  }
  return moved.size === 0 ? 'NOTHING' : [...moved].sort().join(' + ')
}

/** True when any layer of the control gains a shadow it did not have at rest. */
function gainsGlow(probe: Probe): boolean {
  for (const key of Object.keys(probe.rest)) {
    if (!key.endsWith('boxShadow')) continue
    if (probe.rest[key] === 'none' && probe.hover[key] !== 'none') return true
  }
  return false
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const all: Probe[] = []
for (const route of ROUTES) {
  if (FILTER && !FILTER.some((t) => route.includes(t))) continue
  const probes = await probePage(page, route)
  all.push(...probes)
  console.log(`probed ${route}: ${probes.length} interactive elements`)
}
await browser.close()

console.log('')
console.log('='.repeat(78))
console.log('HOVER TREATMENTS, grouped by what moves')
console.log('='.repeat(78))

const groups = new Map<string, Probe[]>()
for (const probe of all) {
  const key = signature(probe)
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key)!.push(probe)
}

const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
for (const [sig, members] of ordered) {
  console.log('')
  console.log(`${sig}   (${members.length} elements)`)
  const seen = new Set<string>()
  for (const m of members) {
    const id = `${m.page}|${m.section}|${m.label}`
    if (seen.has(id)) continue
    seen.add(id)
    console.log(
      `    ${m.page.padEnd(11)} ${m.section.padEnd(14)} ${m.label.padEnd(26)} ${m.width}x${m.height}`,
    )
  }
}

console.log('')
console.log('='.repeat(78))
console.log('WHO GLOWS: elements gaining a shadow on hover')
console.log('='.repeat(78))
const glowing = all.filter(gainsGlow)
if (glowing.length === 0) console.log('    none')
for (const g of glowing) {
  console.log(`    ${g.page.padEnd(11)} ${g.section.padEnd(14)} ${g.label}`)
}

console.log('')
console.log('='.repeat(78))
console.log('TAP TARGETS under 44px')
console.log('='.repeat(78))
const small = all.filter((p) => p.height < 44 || p.width < 44)
const smallSeen = new Set<string>()
for (const s of small) {
  const id = `${s.section}|${s.label}`
  if (smallSeen.has(id)) continue
  smallSeen.add(id)
  console.log(
    `    ${s.page.padEnd(11)} ${s.section.padEnd(14)} ${s.label.padEnd(26)} ${s.width}x${s.height}`,
  )
}
if (small.length === 0) console.log('    none')

console.log('')
console.log(
  `${all.length} elements probed across ${FILTER ? FILTER.join(',') : ROUTES.length + ' pages'}`,
)
