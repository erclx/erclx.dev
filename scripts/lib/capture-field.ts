/**
 * Captures a square crop of the hero's own live shader field
 * (`[data-shader-field]`), with a real pointer held near the crop so the
 * accent-gradient reveal renders the way a hover does. `page-ground` (the
 * whole-page copy) mounts with `animate: false` and never redraws after its
 * first paint, so a pointer aimed at it can never produce that gradient no
 * matter how long the wait: the hero's own canvas is the only live source.
 *
 * The header mounts its pointermove listener from an IntersectionObserver
 * callback rather than synchronously on load, so a single `mouse.move` fired
 * too early lands before that listener attaches and is lost. Settling first,
 * then moving twice, guarantees at least one event reaches a listener that
 * is actually attached.
 */
import type { Browser } from '@playwright/test'

export interface FieldCrop {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface CaptureFieldPlateOptions {
  readonly url: string
  readonly captureWidth: number
  readonly captureHeight: number
  readonly crop: FieldCrop
  readonly pointerAt: { x: number; y: number }
  /** ms to hold the pointer before capture. cursorEase is 0.045/frame, so
   * 1800ms mostly saturates cursorStrength toward 1. */
  readonly settleMs?: number
  /**
   * Renders the same CSS-pixel geometry at higher physical resolution for a
   * @2x output. The field's own spatial scale (`uFieldScale`) is driven by
   * the canvas's CSS width alone, not device pixels, so two captures at the
   * same viewport and crop but different `deviceScaleFactor` show the
   * identical composition at different physical resolutions rather than two
   * different noise fields. Default 1.
   */
  readonly deviceScaleFactor?: number
}

/**
 * Hides nothing before shooting `options.crop`, unlike the whole-page capture
 * this replaced, which hid every element outside `[data-page-ground]` to keep
 * a fixed control from baking into the still. That guard is unneeded here only
 * because this function never scrolls: the section rail and the contact dock
 * both gate off at scroll 0, so a crop taken from either margin at the top of
 * the page is clear of both by construction. A caller cropping anywhere the
 * gate has already opened, or scrolling before it shoots, needs the guard
 * back.
 */
export async function captureFieldPlate(
  browser: Browser,
  options: CaptureFieldPlateOptions,
): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: options.captureWidth, height: options.captureHeight },
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
  })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
  await page.goto(options.url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.documentElement.classList.add('dark'))

  await page.waitForTimeout(500)
  await page.mouse.move(options.pointerAt.x - 40, options.pointerAt.y - 40)
  await page.waitForTimeout(100)
  await page.mouse.move(options.pointerAt.x, options.pointerAt.y)
  await page.waitForTimeout(options.settleMs ?? 1800)

  const buffer = await page.screenshot({ type: 'png', clip: options.crop })
  await context.close()
  return buffer
}

export interface RenderOnRealPageOptions {
  readonly url: string
  readonly width: number
  readonly height: number
  readonly markup: string
}

/**
 * Renders `markup` as the body of a real, navigated document and screenshots
 * it. A page that never navigates (`page.setContent` on a fresh context)
 * crashes the screenshot protocol in this environment once it holds a large
 * embedded image; a document with a real origin does not.
 *
 * Always dark: both callers composite onto the field, which the site draws
 * in dark theme. Setting `theme` in `localStorage` before navigation is
 * enough, since the site's own first-paint script in `base.astro` reads it
 * and applies the `dark` class before first render.
 */
export async function renderOnRealPage(
  browser: Browser,
  options: RenderOnRealPageOptions,
): Promise<Buffer> {
  const context = await browser.newContext({
    viewport: { width: options.width, height: options.height },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
  await page.goto(options.url, { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ markup }) => {
      document.body.innerHTML = markup
    },
    { markup: options.markup },
  )
  await page.waitForTimeout(150)
  const buffer = await page.screenshot({ type: 'png' })
  await context.close()
  return buffer
}
