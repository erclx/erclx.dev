import { expect, type Page, test } from '@playwright/test'

declare global {
  interface Window {
    __frames: number
  }
}

const CANVAS = '[data-shader-field]'
const SETTLE_MS = 1200
const FRAME_WINDOW_MS = 1500

// Counts scheduled frames and keeps the drawing buffer readable. Both have to
// land before the mount runs, so every test needing either installs it first.
const instrument = `
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    return original.call(
      this,
      type,
      type === 'webgl' ? Object.assign({}, attrs, { preserveDrawingBuffer: true }) : attrs,
    )
  }
  window.__frames = 0
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (cb) => {
    window.__frames += 1
    return raf(cb)
  }
`

async function litPercent(page: Page): Promise<number> {
  return page.evaluate((selector) => {
    const canvas = document.querySelector(selector)
    if (!(canvas instanceof HTMLCanvasElement)) return 0

    const flat = document.createElement('canvas')
    flat.width = canvas.width
    flat.height = canvas.height
    const context = flat.getContext('2d', { willReadFrequently: true })
    if (!context) return 0
    context.drawImage(canvas, 0, 0)

    const { data } = context.getImageData(0, 0, flat.width, flat.height)
    let lit = 0
    for (let i = 3; i < data.length; i += 4) if ((data[i] ?? 0) > 8) lit += 1
    return (lit / (data.length / 4)) * 100
  }, CANVAS)
}

test('the header carries a shader canvas covering the band', async ({
  page,
}) => {
  await page.goto('/')

  const canvasBox = await page.locator(CANVAS).boundingBox()
  const bandBox = await page.locator('[data-section="header"]').boundingBox()

  expect(canvasBox?.width).toBeCloseTo(bandBox?.width ?? 0, 0)
  expect(canvasBox?.height).toBeCloseTo(bandBox?.height ?? 0, 0)
})

test('the surface paints in both themes', async ({ page, baseURL }) => {
  await page.addInitScript(instrument)
  await page.goto(baseURL ?? '/')
  await page.waitForTimeout(SETTLE_MS)

  const light = await litPercent(page)

  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.waitForTimeout(SETTLE_MS)
  const dark = await litPercent(page)

  // A surface reading as blank still reports a fraction of a percent, which is
  // why the floor sits well above zero rather than at it.
  expect(light).toBeGreaterThan(1)
  expect(dark).toBeGreaterThan(1)
})

test('reduced motion renders a still frame rather than hiding the surface', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.addInitScript(instrument)
  await page.goto(baseURL ?? '/')
  await page.waitForTimeout(SETTLE_MS)

  await expect(page.locator(CANVAS)).toBeVisible()
  expect(await litPercent(page)).toBeGreaterThan(1)

  await context.close()
})

test('reduced motion schedules no animation frames once drawn', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.addInitScript(instrument)
  await page.goto(baseURL ?? '/')
  await page.waitForTimeout(SETTLE_MS)

  const before = await page.evaluate(() => window.__frames)
  await page.waitForTimeout(FRAME_WINDOW_MS)
  const after = await page.evaluate(() => window.__frames)

  expect(after - before).toBe(0)

  await context.close()
})

test('the heading, links, and toggle stay reachable over the surface', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const header = page.locator('header')
  for (const label of ['GitHub', 'LinkedIn', 'me@erclx.dev']) {
    await expect(header.getByRole('link', { name: label })).toBeVisible()
  }

  // The canvas sits under the content rather than over it, so a click aimed at
  // a link reaches the link and not the surface behind it.
  await expect(page.locator(CANVAS)).toHaveCSS('pointer-events', 'none')
})

test('a lost context reveals the fallback and a restore hides it', async ({
  page,
}) => {
  await page.goto('/')
  await page.waitForTimeout(SETTLE_MS)

  const fallback = page.locator('[data-shader-field-fallback]')
  await expect(fallback).toBeHidden()

  // The extension drives the same events the browser fires when it drops a
  // context. This is the one path to the fallback that no setup failure
  // reaches, and it is where a band with nothing drawn behind it comes from.
  //
  // The handle is kept rather than looked up twice. A lost context returns null
  // from `getExtension`, so fetching it again to restore reaches nothing and
  // the surface stays down.
  const lost = await page.locator(CANVAS).evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext('webgl')
    const ext = gl?.getExtension('WEBGL_lose_context')
    if (!ext) return false
    Object.assign(window, { __loseContext: ext })
    ext.loseContext()
    return true
  })

  test.skip(!lost, 'engine does not expose WEBGL_lose_context')

  await expect(fallback).toBeVisible()
  await expect(page.locator(CANVAS)).toBeHidden()

  await page.evaluate(() => {
    ;(
      window as unknown as { __loseContext: WEBGL_lose_context }
    ).__loseContext.restoreContext()
  })

  await expect(fallback).toBeHidden()
  await expect(page.locator(CANVAS)).toBeVisible()
})
