/**
 * Renders every page's link preview as the hosts a link actually gets pasted
 * into compose it, so a card is judged without pasting it into five apps.
 *
 * The tags are read off the served pages rather than out of the source, because
 * a crawler reads the rendered document and that is the only copy that can be
 * wrong. The image is fetched the same way and inlined, so a sheet stays
 * readable after the server is gone.
 *
 * What this catches is ours: a crop that takes the mark, a title clipped
 * mid-word, a description repeating the title, an image that never resolves.
 * What it cannot catch is a host changing its own layout. The chrome below is
 * drawn to each host's published shape and is an approximation of it, so read a
 * sheet as evidence about this card and never as a screenshot of that app.
 *
 * Run: bun scripts/unfurl.ts, with the site served at UNFURL_BASE_URL.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { chromium, type Page } from '@playwright/test'

const SITE = process.env.UNFURL_BASE_URL ?? 'http://localhost:4400'
const OUT = '.claude/review/unfurl'

const ROUTES = ['/', '/jobtriage', '/aitk', '/diction', '/stackr', '/caret']

interface Preview {
  route: string
  title: string
  description: string
  image: string
  card: string
  siteName: string
  imageData: string
}

/**
 * Each host crops the one 1200x630 image to its own frame and clamps the text
 * to its own line counts. Those two are what differ between them and what a
 * card either survives or does not.
 */
interface Host {
  readonly label: string
  /** What the host is known to vary on, printed under its frame. */
  readonly caveat: string
  readonly render: (preview: Preview) => string
}

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

/** Clamps a block to a line count the way every one of these hosts does. */
const clamp = (lines: number) =>
  `display:-webkit-box;-webkit-line-clamp:${lines};-webkit-box-orient:vertical;overflow:hidden`

const HOSTS: Host[] = [
  {
    label: 'Discord',
    caveat: 'Scales the image to the embed rather than cropping it.',
    render: (p) => `
      <div style="width:480px;background:#313338;padding:16px;font-family:${SANS}">
        <div style="max-width:432px;background:#2b2d31;border-left:4px solid #1e1f22;
          border-radius:4px;padding:12px 16px 16px">
          <div style="color:#949ba4;font-size:12px;margin-bottom:2px">${p.siteName}</div>
          <div style="color:#00a8fc;font-size:16px;font-weight:600;line-height:1.375;
            margin-bottom:8px;${clamp(2)}">${p.title}</div>
          <div style="color:#dbdee1;font-size:14px;line-height:1.375;
            margin-bottom:16px;${clamp(4)}">${p.description}</div>
          <img src="${p.imageData}" style="width:400px;border-radius:4px;display:block">
        </div>
      </div>`,
  },
  {
    label: 'LinkedIn',
    caveat:
      'Commonly drops the description in a feed share, leaving title and domain.',
    render: (p) => `
      <div style="width:552px;background:#fff;font-family:${SANS};
        border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="width:552px;height:289px;overflow:hidden">
          <img src="${p.imageData}" style="width:100%;height:100%;object-fit:cover;display:block">
        </div>
        <div style="background:#f4f2ee;padding:8px 12px">
          <div style="color:#000;font-size:14px;font-weight:600;line-height:1.4;
            ${clamp(2)}">${p.title}</div>
          <div style="color:#00000099;font-size:12px;margin-top:2px">${hostname(p.image)}</div>
        </div>
      </div>`,
  },
  {
    label: 'X',
    caveat:
      'Crops to 2:1 and overlays the domain. Title placement varies by client.',
    render: (p) => `
      <div style="width:504px;background:#000;padding:12px;font-family:${SANS}">
        <div style="position:relative;width:480px;height:240px;border-radius:16px;
          overflow:hidden;border:1px solid #2f3336">
          <img src="${p.imageData}" style="width:100%;height:100%;object-fit:cover;display:block">
          <span style="position:absolute;left:12px;bottom:12px;background:#00000099;
            color:#fff;font-size:12px;padding:2px 6px;border-radius:4px">${hostname(p.image)}</span>
        </div>
        <div style="color:#e7e9ea;font-size:15px;line-height:1.3;margin-top:8px;
          ${clamp(1)}">${p.title}</div>
        <div style="color:#71767b;font-size:15px;line-height:1.3;${clamp(1)}">${p.description}</div>
      </div>`,
  },
  {
    label: 'Slack',
    caveat:
      'Sits behind a left rule and scales the image to the attachment width.',
    render: (p) => `
      <div style="width:440px;background:#fff;padding:16px;font-family:${SANS}">
        <div style="border-left:4px solid #1d1c1d1a;padding-left:12px">
          <div style="color:#616061;font-size:13px;font-weight:700">${p.siteName}</div>
          <div style="color:#1264a3;font-size:15px;font-weight:700;line-height:1.4;
            ${clamp(1)}">${p.title}</div>
          <div style="color:#1d1c1d;font-size:15px;line-height:1.46;margin:2px 0 8px;
            ${clamp(3)}">${p.description}</div>
          <img src="${p.imageData}" style="width:360px;border-radius:8px;display:block">
        </div>
      </div>`,
  },
  {
    label: 'Notion bookmark',
    caveat:
      'The one host here that crops toward a square, so the mark is at risk.',
    render: (p) => `
      <div style="width:560px;background:#fff;padding:16px;font-family:${SANS}">
        <div style="display:flex;border:1px solid #e9e9e7;border-radius:4px;overflow:hidden">
          <div style="flex:1;padding:12px 14px;min-width:0">
            <div style="color:#37352f;font-size:14px;line-height:1.4;${clamp(1)}">${p.title}</div>
            <div style="color:#37352fa6;font-size:12px;line-height:1.4;margin-top:2px;
              ${clamp(2)}">${p.description}</div>
            <div style="color:#37352f;font-size:12px;margin-top:6px;${clamp(1)}">${p.image}</div>
          </div>
          <div style="width:180px;flex:none;overflow:hidden">
            <img src="${p.imageData}" style="width:100%;height:100%;object-fit:cover;display:block">
          </div>
        </div>
      </div>`,
  },
]

function hostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/** Reads the tags a crawler would read, from the document the server sent. */
async function readPreview(page: Page, route: string): Promise<Preview> {
  await page.goto(SITE + route, { waitUntil: 'domcontentloaded' })
  const tags = await page.evaluate(() => {
    const read = (property: string) =>
      document
        .querySelector(`meta[property="${property}"], meta[name="${property}"]`)
        ?.getAttribute('content') ?? ''
    return {
      title: read('og:title'),
      description: read('og:description'),
      image: read('og:image'),
      card: read('twitter:card'),
      siteName: read('og:site_name'),
    }
  })

  const missing = Object.entries(tags)
    .filter(([, value]) => !value)
    .map(([key]) => key)
  if (missing.length) {
    throw new Error(`${route} declares no ${missing.join(', ')}`)
  }

  // The declared URL is absolute so a crawler can fetch it outside the page,
  // which is the failure this project already shipped once. The bytes come from
  // the served copy, since the declared host is production.
  if (!tags.image.startsWith('http')) {
    throw new Error(`${route} declares a relative og:image: ${tags.image}`)
  }
  const served = SITE + new URL(tags.image).pathname
  const response = await page.request.get(served)
  if (!response.ok()) {
    throw new Error(`${served} did not resolve: ${response.status()}`)
  }
  const body = await response.body()

  return {
    route,
    ...tags,
    imageData: `data:image/png;base64,${body.toString('base64')}`,
  }
}

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()

await mkdir(OUT, { recursive: true })

const previews: Preview[] = []
for (const route of ROUTES) {
  previews.push(await readPreview(page, route))
}

const sheet = await context.newPage()

for (const preview of previews) {
  const slug = preview.route === '/' ? 'apex' : preview.route.slice(1)
  const frames = HOSTS.map(
    (host) => `
      <figure>
        <figcaption>${host.label}</figcaption>
        <div class="frame">${host.render(preview)}</div>
        <em>${host.caveat}</em>
      </figure>`,
  ).join('')

  await sheet.setContent(`<style>
      body { margin:0; padding:28px; background:#17150f; color:#f4efe6;
             font:13px/1.5 ${SANS} }
      h1 { font-size:15px; margin:0 0 4px }
      p.tags { margin:0 0 22px; color:#f4efe699; font:12px/1.6 ui-monospace, monospace;
               white-space:pre-wrap }
      .grid { display:flex; flex-wrap:wrap; gap:26px; align-items:flex-start }
      figure { margin:0 }
      figcaption { font-weight:600; margin-bottom:8px }
      .frame { border:1px solid #3a332c; border-radius:6px; overflow:hidden;
               display:inline-block }
      em { display:block; font-style:normal; opacity:.45; margin-top:7px;
           max-width:520px; font-size:11px }
    </style>
    <h1>${preview.route}</h1>
    <p class="tags">og:title        ${preview.title}
og:description  ${preview.description}
og:image        ${preview.image}
twitter:card    ${preview.card}</p>
    <div class="grid">${frames}</div>`)

  await sheet.waitForTimeout(300)
  const shot = await sheet.screenshot({ fullPage: true })
  await writeFile(path.join(OUT, `${slug}.png`), shot)
  console.log(path.join(OUT, `${slug}.png`))
}

await browser.close()
