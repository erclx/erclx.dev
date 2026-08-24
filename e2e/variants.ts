import { type Browser, chromium, type Page } from '@playwright/test'
import { mkdir, readdir, readFile, rename, rm } from 'fs/promises'
import path from 'path'

// Renders one surface several ways and composes the results into a single
// labeled sheet, which is what a decision about how something looks is made
// against. Describing the options instead produces a pick made on the labels.
//
// Per-decision configuration stays in a session's own scratch script. What
// lives here is the part that is identical every time.

export interface Variant {
  /** Short id used for filenames. */
  readonly id: string
  /** Caption on the sheet. State what it means, not just what it is. */
  readonly title: string
  /** CSS applied to the page. Empty renders the surface as it ships. */
  readonly css?: string
  /**
   * Query string appended to the run's url, for a surface that picks what it
   * renders at load time. CSS and `apply` both land after that choice is made,
   * so neither can reach one.
   */
  readonly search?: string
  /**
   * Runs in the page after the CSS lands, for a variant that needs the DOM
   * changed. It is serialized across the browser boundary, so it reaches
   * nothing from the surrounding scope however much its type suggests it can.
   * Everything it needs has to be written inside it.
   */
  readonly apply?: () => void
}

export type Theme = 'light' | 'dark'

export interface VariantRun {
  /** Where the dev server is serving. */
  readonly url: string
  /** The element each capture is clipped to, or scrolled to under `viewport`. */
  readonly target: string
  /**
   * `viewport` shoots the visible frame rather than the target's own box, which
   * is what a decision about the join between two surfaces needs: clipping to
   * either one of them removes the thing being judged.
   */
  readonly clip?: 'target' | 'viewport'
  /**
   * Pixels to scroll back after the target is brought into view, so a surface
   * above it stays in frame. Only meaningful under `clip: 'viewport'`.
   */
  readonly scrollOffset?: number
  readonly variants: readonly Variant[]
  readonly outDir: string
  readonly themes?: readonly Theme[]
  readonly width?: number
  /** Applies to both a still and a recording, which take the same frame. */
  readonly height?: number
  /** Milliseconds to wait after the surface is scrolled into view. */
  readonly settle?: number
  /**
   * Stills default to `reduce`, which stops a capture landing mid-reveal. A
   * surface gated on that preference renders nothing under it, so a comparison
   * of one captures blank sheets with nothing saying why. Pass
   * `no-preference` for those.
   */
  readonly reducedMotion?: 'no-preference' | 'reduce'
  /**
   * The sticky bar covers a surface pinned to the top of the viewport, which
   * hides the very thing being judged. Hidden by default.
   */
  readonly keepSiteBar?: boolean
  /** Records the surface instead of shooting it, for a decision about motion. */
  readonly video?: boolean
}

const BAR = '[data-site-bar] { display: none !important }'

// The only two roots this harness writes into, both gitignored.
const SCRATCH_ROOTS = ['.claude/review', '.claude/.tmp'] as const

const prepare = async (
  page: Page,
  run: VariantRun,
  variant: Variant,
  theme: Theme,
) => {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
  await page.goto(new URL(variant.search ?? '', run.url).href, {
    waitUntil: 'networkidle',
  })
  await page.evaluate(
    (t) => document.documentElement.classList.toggle('dark', t === 'dark'),
    theme,
  )
}

const shoot = async (
  browser: Browser,
  run: VariantRun,
  variant: Variant,
  theme: Theme,
  rawDir: string,
) => {
  const context = await browser.newContext({
    viewport: { width: run.width ?? 1280, height: run.height ?? 900 },
    deviceScaleFactor: 2,
    reducedMotion: run.reducedMotion ?? 'reduce',
  })
  const page = await context.newPage()
  await prepare(page, run, variant, theme)
  await page.locator(run.target).scrollIntoViewIfNeeded()
  await page.waitForTimeout(run.settle ?? 600)

  if (variant.css) await page.addStyleTag({ content: variant.css })
  if (!run.keepSiteBar) await page.addStyleTag({ content: BAR })
  if (variant.apply) await page.evaluate(variant.apply)

  // After the variant's own styles land, since a treatment that changes a
  // surface's height moves where the join sits.
  if (run.clip === 'viewport' && run.scrollOffset) {
    // Instant, since the root glides for a reader and a capture taken during
    // that glide shoots a surface part-way to where it was asked to sit.
    await page.evaluate(
      (offset) => window.scrollBy({ top: -offset, behavior: 'instant' }),
      run.scrollOffset,
    )
  }
  await page.waitForTimeout(250)

  const file = path.join(rawDir, `${variant.id}--${theme}.png`)
  if (run.clip === 'viewport') await page.screenshot({ path: file })
  else await page.locator(run.target).screenshot({ path: file })
  await context.close()
  return file
}

const record = async (
  browser: Browser,
  run: VariantRun,
  variant: Variant,
  theme: Theme,
  outDir: string,
) => {
  const dir = path.join(outDir, 'video', `${variant.id}--${theme}`)
  const size = { width: run.width ?? 1280, height: run.height ?? 900 }
  const context = await browser.newContext({
    viewport: size,
    recordVideo: { dir, size },
  })
  const page = await context.newPage()
  await prepare(page, run, variant, theme)
  if (variant.css) await page.addStyleTag({ content: variant.css })
  if (!run.keepSiteBar) await page.addStyleTag({ content: BAR })
  if (variant.apply) await page.evaluate(variant.apply)

  // Scrolled the way a reader does, so anything gated on arrival fires on its
  // own rather than being poked into running.
  await page.evaluate((selector) => {
    const el = document.querySelector(selector)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top - 500, behavior: 'instant' as ScrollBehavior })
  }, run.target)
  await page.waitForTimeout(run.settle ?? 4600)
  await context.close()

  const written = (await readdir(dir)).find((f) => f.endsWith('.webm'))
  if (!written) return null
  const file = path.join(outDir, `${variant.id}--${theme}.webm`)
  await rename(path.join(dir, written), file)
  return file
}

const compose = async (
  browser: Browser,
  run: VariantRun,
  theme: Theme,
  shots: ReadonlyArray<{ variant: Variant; file: string }>,
  outDir: string,
) => {
  const ink =
    theme === 'dark'
      ? { bg: '#12100e', fg: '#f2ece4', rule: '#3a332c' }
      : { bg: '#fbf8f4', fg: '#2a2320', rule: '#e0d8cd' }

  // Inlined rather than linked. A page built with `setContent` has no document
  // origin, so a `file://` source is blocked and the sheet composes with every
  // image missing, which looks like a rendering fault rather than a bad path.
  const figures: string[] = []
  for (const { variant, file } of shots) {
    const data = (await readFile(file)).toString('base64')
    figures.push(
      `<figure><figcaption>${variant.title}</figcaption>` +
        `<img src="data:image/png;base64,${data}"></figure>`,
    )
  }

  const context = await browser.newContext({
    viewport: { width: 1080, height: 1200 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  await page.setContent(
    `<style>
       body { margin: 0; padding: 28px; background: ${ink.bg}; color: ${ink.fg};
              font: 13px/1.45 ui-sans-serif, system-ui, sans-serif; }
       figure { margin: 0 0 22px; }
       figcaption { font-weight: 600; letter-spacing: .02em; margin-bottom: 8px;
                    padding-bottom: 7px; border-bottom: 1px solid ${ink.rule}; }
       img { display: block; width: 1010px; border: 1px solid ${ink.rule}; }
     </style>${figures.join('')}`,
  )

  // A sheet whose images have not decoded shoots blank, and a blank sheet is
  // indistinguishable from a surface that renders nothing.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('img')].every(
      (img) => (img as HTMLImageElement).naturalWidth > 0,
    ),
  )

  const file = path.join(outDir, `SHEET--${theme}.png`)
  await page.screenshot({ path: file, fullPage: true })
  await context.close()
  return file
}

/**
 * Captures every variant across every theme and writes one sheet per theme.
 * Returns the files written, so a caller can report them rather than guess.
 */
export async function captureVariants(run: VariantRun): Promise<string[]> {
  const themes = run.themes ?? (['light', 'dark'] as const)
  const rawDir = path.join(run.outDir, 'raw')

  // The output directory is wiped before every run, so a mistyped path is a
  // recursive delete of whatever it names. Every caller writes into gitignored
  // scratch, and refusing anything else costs a comparison. `force` stays off
  // for the same reason: it would swallow the error that reports the typo.
  const resolved = path.resolve(run.outDir)
  const allowed = SCRATCH_ROOTS.map((dir) => path.resolve(dir))
  if (
    !allowed.some(
      (root) => resolved === root || resolved.startsWith(root + path.sep),
    )
  ) {
    throw new Error(
      `refusing to wipe ${resolved}: outDir must sit under ${SCRATCH_ROOTS.join(' or ')}`,
    )
  }
  await rm(resolved, { recursive: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error
    },
  )
  await mkdir(rawDir, { recursive: true })

  const browser = await chromium.launch()
  const written: string[] = []

  try {
    for (const theme of themes) {
      if (run.video) {
        for (const variant of run.variants) {
          const file = await record(browser, run, variant, theme, run.outDir)
          if (file) written.push(file)
        }
        continue
      }

      const shots: Array<{ variant: Variant; file: string }> = []
      for (const variant of run.variants) {
        shots.push({
          variant,
          file: await shoot(browser, run, variant, theme, rawDir),
        })
      }
      written.push(await compose(browser, run, theme, shots, run.outDir))
    }
  } finally {
    await browser.close()
  }

  return written
}
