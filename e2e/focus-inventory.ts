import { execFileSync } from 'node:child_process'

import { chromium, type Page } from '@playwright/test'

// Walks every page and reports what each focusable control does when a keyboard
// reaches it, grouped by the treatment rather than by the component.
//
// It exists because a focus ring is the one treatment nobody sees while they
// build. A pointer response is met on every pass over the page; a ring is met
// only by tabbing, so a default inherited from a component library survives
// every visual review and reaches a keyboard reader unchanged.
//
// Run: bun e2e/focus-inventory.ts
// Filter: FOCUS_FILTER=diction,caret bun e2e/focus-inventory.ts

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

const BASE = process.env.FOCUS_BASE_URL ?? devServerUrl()
const FILTER = process.env.FOCUS_FILTER?.split(',').map((term) => term.trim())

const ROUTES = ['/', '/aitk', '/jobtriage', '/stackr', '/caret', '/diction']
const THEMES = ['light', 'dark'] as const

/**
 * What a ring can be drawn with.
 *
 * `outline` is the obvious one and is not the only one. A ring written as a
 * `box-shadow` spread, or painted on an `::after` inset over the control, is
 * what a reader sees and is invisible to a check reading `outlineWidth` alone,
 * which would report a working control as having no indicator at all.
 */
const TRACKED = [
  'outlineColor',
  'outlineStyle',
  'outlineWidth',
  'outlineOffset',
  'boxShadow',
  'borderTopLeftRadius',
  'backgroundColor',
  'borderTopColor',
  'textDecorationLine',
] as const

interface Probe {
  readonly page: string
  readonly theme: string
  readonly host: string
  readonly label: string
  readonly tag: string
  readonly width: number
  readonly height: number
  readonly rest: Record<string, string>
  readonly focused: Record<string, string>
}

function readTreatment(element: Element, keys: string[]) {
  const out: Record<string, string> = {}
  const collect = (node: Element, prefix: string, pseudo?: string) => {
    const style = getComputedStyle(node, pseudo)
    for (const key of keys)
      out[`${prefix}${key}`] = style[key as never] as string
  }
  collect(element, '')
  collect(element, '::before/', '::before')
  collect(element, '::after/', '::after')
  return out
}

async function probePage(
  page: Page,
  route: string,
  theme: (typeof THEMES)[number],
): Promise<Probe[]> {
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.evaluate((mode) => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, theme)
  await page.evaluate(() =>
    window.scrollTo({ top: window.innerHeight * 1.4, behavior: 'instant' }),
  )
  await page.waitForTimeout(900)
  await page.evaluate(() => {
    for (const element of document.querySelectorAll(
      '[data-contact-dock],[data-section-nav],[data-site-bar]',
    )) {
      element.setAttribute('data-revealed', 'true')
      element.removeAttribute('inert')
    }
    for (const element of document.querySelectorAll('[data-fade]')) {
      element.setAttribute('data-visible', 'true')
    }
  })
  await page.waitForTimeout(600)

  const handles = await page
    .locator('a, button, input, select, textarea, [tabindex]')
    .and(page.locator(':not(astro-dev-toolbar *)'))
    .elementHandles()

  const probes: Probe[] = []
  for (const handle of handles) {
    const meta = await handle.evaluate((node) => {
      const element = node as Element
      const box = element.getBoundingClientRect()
      return {
        tag: element.tagName.toLowerCase(),
        label: (element.getAttribute('aria-label') || element.textContent || '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 24),
        host:
          element.closest('[data-contact-dock]') !== null
            ? 'contact-dock'
            : element.closest('[data-section-nav]') !== null
              ? 'section-rail'
              : element.closest('[data-site-bar]') !== null
                ? 'site-bar'
                : (element
                    .closest('[data-section]')
                    ?.getAttribute('data-section') ??
                  element.closest('footer')?.tagName.toLowerCase() ??
                  'page'),
        width: Math.round(box.width),
        height: Math.round(box.height),
        visible: box.width > 0 && box.height > 0,
        focusable: (element as HTMLElement).tabIndex >= 0,
      }
    })
    if (!meta.visible || !meta.focusable) continue

    const rest = await handle.evaluate(readTreatment, [...TRACKED])
    // Focused through the keyboard rather than through `.focus()`, because
    // `:focus-visible` is what the stylesheet keys on and a scripted focus does
    // not always satisfy it. The element is focused first so the tab lands on
    // it, then the ring is read.
    await handle.evaluate((node) => (node as HTMLElement).focus())
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await page.waitForTimeout(60)
    const focused = await handle.evaluate(readTreatment, [...TRACKED])
    await handle.evaluate((node) => (node as HTMLElement).blur())

    probes.push({
      page: route,
      theme,
      host: meta.host,
      label: meta.label,
      tag: meta.tag,
      width: meta.width,
      height: meta.height,
      rest,
      focused,
    })
  }
  return probes
}

/** The ring as a signature two controls can be compared on. */
function signature(probe: Probe): string {
  const parts: string[] = []
  const outline = probe.focused.outlineStyle
  if (outline !== 'none' && probe.focused.outlineWidth !== '0px') {
    parts.push(
      `outline ${probe.focused.outlineStyle} ${probe.focused.outlineWidth} @${probe.focused.outlineOffset} ${probe.focused.outlineColor}`,
    )
  }
  for (const key of Object.keys(probe.rest)) {
    if (probe.rest[key] === probe.focused[key]) continue
    const property = key.slice(key.lastIndexOf('/') + 1)
    if (property.startsWith('outline')) continue
    if (property === 'boxShadow') parts.push('shadow')
    else if (property === 'backgroundColor') parts.push('ground')
    else if (property === 'borderTopColor') parts.push('border')
    else if (property === 'textDecorationLine') parts.push('underline')
  }
  // The radius the ring is drawn at, which is what decides whether it follows a
  // pill or draws a rectangle around one.
  parts.push(`r=${probe.focused.borderTopLeftRadius}`)
  return parts.length === 1
    ? `NOTHING (${parts[0]})`
    : [...new Set(parts)].join(' + ')
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const all: Probe[] = []
for (const route of ROUTES) {
  if (FILTER && !FILTER.some((term) => route.includes(term))) continue
  for (const theme of THEMES) {
    const probes = await probePage(page, route, theme)
    all.push(...probes)
    console.log(`probed ${route} (${theme}): ${probes.length} focusable`)
  }
}
await browser.close()

console.log('')
console.log('='.repeat(80))
console.log('FOCUS RINGS, grouped by treatment')
console.log('='.repeat(80))

const groups = new Map<string, Probe[]>()
for (const probe of all) {
  const key = signature(probe)
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key)!.push(probe)
}

const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
for (const [sig, members] of ordered) {
  console.log('')
  console.log(`${sig}   (${members.length})`)
  const seen = new Set<string>()
  for (const member of members) {
    const id = `${member.host}|${member.label}`
    if (seen.has(id)) continue
    seen.add(id)
    console.log(
      `    ${member.page.padEnd(11)} ${member.host.padEnd(14)} ${member.label.padEnd(26)} ${member.width}x${member.height}`,
    )
  }
}

console.log('')
console.log('='.repeat(80))
console.log('CONTROLS A KEYBOARD REACHES WITH NOTHING TO SHOW FOR IT')
console.log('='.repeat(80))
const unmarked = all.filter((probe) => {
  const hasOutline =
    probe.focused.outlineStyle !== 'none' &&
    probe.focused.outlineWidth !== '0px'
  const moved = Object.keys(probe.rest).some(
    (key) => probe.rest[key] !== probe.focused[key],
  )
  return !hasOutline && !moved
})
if (unmarked.length === 0) console.log('    none')
for (const probe of unmarked) {
  console.log(
    `    ${probe.page.padEnd(11)} ${probe.host.padEnd(14)} ${probe.label}`,
  )
}

console.log('')
console.log('='.repeat(80))
console.log('RINGS DRAWN SQUARE AROUND A CONTROL')
console.log('='.repeat(80))
const square = all.filter(
  (probe) => probe.focused.borderTopLeftRadius === '0px',
)
const squareSeen = new Set<string>()
for (const probe of square) {
  const id = `${probe.page}|${probe.host}|${probe.label}`
  if (squareSeen.has(id)) continue
  squareSeen.add(id)
  console.log(
    `    ${probe.page.padEnd(11)} ${probe.host.padEnd(14)} ${probe.label.padEnd(26)} ${probe.width}x${probe.height}`,
  )
}
if (square.length === 0) console.log('    none')

console.log('')
console.log(
  `${all.length} probes across ${FILTER ? FILTER.join(',') : ROUTES.length + ' pages'} and ${THEMES.length} themes`,
)
console.log(`${groups.size} distinct treatments`)
console.log(
  `${squareSeen.size} controls carry a square ring, ${unmarked.length} carry none`,
)
