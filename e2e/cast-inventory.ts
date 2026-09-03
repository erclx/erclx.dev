import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'

import { type Browser, chromium } from '@playwright/test'

import {
  BEHAVIOR_IDS,
  BEHAVIORS,
} from '../src/components/site/experience/cast/behaviors'
import { renderMember } from '../src/components/site/experience/cast/cast'
import { MOOD_IDS } from '../src/components/site/experience/cast/faces'

// Renders the cast inventory as two sheets: every expression as a labelled
// still, and every behavior as a labelled recording.
//
// The split is not cosmetic. An expression is a shape and a still shows it
// better than a video does, where a behavior is a change over time and a still
// of one is a picture of a random frame. Reaching for one format for both is
// how an inventory ends up proving nothing about half of itself.
//
// It reads `motion.css` off disk rather than restating any of it. A harness
// holding its own copy of the keyframes drifts from the page within a pass, and
// the drift is invisible because both still animate.
//
// Run: bun e2e/cast-inventory.ts
// Output: .canon/review/cast/

const OUT = '.canon/review/cast'
const CELL = 132
/**
 * The smallest member the cast ships. The instrument measures at this size
 * because a bigger member crosses the barred band faster for the same
 * keyframes, so a comfortable size would make the guard laxer than the page.
 */
export const SMALLEST_MEMBER = 54
const RECORD_MS = 14_000

const MOTION_CSS = await readFile(
  'src/components/site/experience/cast/motion.css',
  'utf8',
)

type Theme = 'light' | 'dark'

// The figure fill is one value in both themes, the way the dog's and the
// airliner's are. Only the page around it changes.
const FIGURE = { body: '#d4a574', eye: '#2a1d14' } as const

const INK: Record<
  Theme,
  {
    body: string
    eye: string
    page: string
    fg: string
    rule: string
    mute: string
  }
> = {
  light: {
    ...FIGURE,
    page: '#f8f4ed',
    fg: '#1a1815',
    rule: '#ded5c9',
    mute: '#776e67',
  },
  dark: {
    ...FIGURE,
    page: '#1a1815',
    fg: '#f4efe6',
    rule: '#3a332c',
    mute: '#a29a92',
  },
}

function shell(
  theme: Theme,
  columns: number,
  body: string,
  cell = CELL,
): string {
  const ink = INK[theme]
  return `<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; background: ${ink.page}; color: ${ink.fg};
           font: 13px/1.5 ui-sans-serif, system-ui, sans-serif }
    .grid { padding: 24px 26px; display: grid;
            grid-template-columns: repeat(${columns}, 1fr); gap: 18px 10px }
    figure { margin: 0; text-align: center }
    .cast-field { position: static; display: block }
    .cast-member { position: relative; width: ${cell}px; height: ${cell}px;
                   margin: 0 auto; opacity: 1;
                   --cast-size: ${cell}px; --cast-delay: 0ms; --cast-offset: 0ms }
    .cast-member .bn { display: block; width: 100%; height: 100% }
    .cast-thought { position: absolute; bottom: calc(100% - var(--cast-size) * 0.12);
                    left: 50%; display: flex; align-items: flex-end;
                    gap: calc(var(--cast-size) * 0.05); opacity: 0 }
    .cast-thought i { display: block; background: ${ink.body}; border-radius: 2px }
    .cast-thought i:nth-child(1) { width: calc(var(--cast-size) * .07); height: calc(var(--cast-size) * .07) }
    .cast-thought i:nth-child(2) { width: calc(var(--cast-size) * .10); height: calc(var(--cast-size) * .10) }
    .cast-thought i:nth-child(3) { width: calc(var(--cast-size) * .14); height: calc(var(--cast-size) * .14);
                                   border-radius: 50% }
    figcaption { margin-top: 4px; color: ${ink.mute}; font-size: 11px;
                 letter-spacing: .04em; text-transform: uppercase }
    .note { color: ${ink.mute}; font-size: 11px; margin-top: 2px;
            min-height: 2.4em; padding: 0 6px }
    :root { --cast-body: ${ink.body}; --cast-eye: ${ink.eye} }
    .cast-field { --cast-loops: infinite }
  </style><style>${MOTION_CSS}</style>${body}`
}

// Members are held in their reacting state, which is what a behavior looks
// like when a reader points at one. `--cast-loops` on the field is what makes it
// repeat for a recording without the page ever repeating it.
const memberMarkup = (inner: string, behaviors = '') =>
  // Both slots carry the id. A behavior is either a resting term or a reacting
  // one and only one rule can match, so naming it twice costs nothing and stops
  // the grid having to know which kind it is.
  `<div class="cast-member" data-react="${behaviors}" data-idle="${behaviors || 'breathe'}"${behaviors ? ' data-reacting' : ''}>` +
  `<span class="cast-thought"><i></i><i></i><i></i></span>${inner}</div>`

async function shootMoods(browser: Browser, theme: Theme): Promise<string> {
  const cells = MOOD_IDS.map(
    (mood) =>
      // A mood is a pairing of eyes, mouth, and mark, so the expression
      // inventory draws the mark whatever the members shipping that mood do
      // with it. This documents the vocabulary rather than the cast.
      `<figure>${memberMarkup(renderMember({ hat: 'ears', arms: true, seated: false, mood, hasMark: true }))}` +
      `<figcaption>${mood}</figcaption></figure>`,
  ).join('')

  const context = await browser.newContext({
    viewport: { width: 6 * (CELL + 10) + 52, height: 700 },
    deviceScaleFactor: 2,
    // The still is of a face rather than of a movement, so motion is suppressed
    // and every cell is captured at rest.
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.setContent(
    shell(
      theme,
      6,
      `<div class="cast-field" data-arrived><div class="grid">${cells}</div></div>`,
    ),
  )
  await page.waitForTimeout(400)
  const file = path.join(OUT, `moods--${theme}.png`)
  await page.locator('.grid').screenshot({ path: file })
  await context.close()
  return file
}

/**
 * Every behavior as a row of frames across its own cycle.
 *
 * The recording is the honest artefact and it is also a file a reader has to
 * open in something. A strip is one image, sits inline anywhere, and is
 * deterministic in a way a recording is not: each frame is taken by seeking the
 * animation's own `currentTime` rather than by catching the compositor at a
 * moment, so the same commit produces the same strip.
 */
async function stripBehaviors(browser: Browser, theme: Theme): Promise<string> {
  const FRAMES = 6
  const rows = BEHAVIOR_IDS.map((id) => {
    const behavior = BEHAVIORS[id]
    const cells = Array.from({ length: FRAMES }, () =>
      memberMarkup(
        renderMember({
          hat: behavior.hat,
          arms: true,
          seated: false,
          mood: behavior.mood,
          hasMark: behavior.target.includes('mark'),
        }),
        id,
      ),
    ).join('')
    return `<figure><figcaption>${id}: ${behavior.summary}</figcaption><div class="strip">${cells}</div></figure>`
  }).join('')

  const context = await browser.newContext({
    viewport: { width: FRAMES * (SMALLEST_MEMBER + 22) + 60, height: 400 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  await page.setContent(
    shell(
      theme,
      1,
      `<div class="cast-field" data-arrived><div class="grid">${rows}</div></div>`,
      SMALLEST_MEMBER,
    ) +
      `<style>
         .grid { display: block }
         figure { text-align: left; margin-bottom: 14px }
         figcaption { text-transform: none; letter-spacing: 0; margin: 0 0 4px }
         .strip { display: flex; gap: 22px }
         .cast-member { margin: 0 }
       </style>`,
  )
  await page.waitForTimeout(300)

  // Columns are spaced by how much has moved rather than by how much time has
  // passed. Every event term here rests for most of its cycle and moves in the
  // last tenth of it, so six evenly spaced frames landed six times on the rest
  // and the strip reported `wave` and `twitch` as doing nothing at all.
  //
  // The cumulative path length is walked instead, and a column is taken at each
  // equal share of it, which puts the frames where the movement is.
  await page.evaluate((frames) => {
    const named = (animation: Animation) =>
      String(
        (animation as unknown as { animationName?: string }).animationName ??
          '',
      )
    const STEPS = 200

    for (const member of document.querySelectorAll('.cast-member')) {
      const column = [...(member.parentElement?.children ?? [])].indexOf(member)
      const animations = member
        .getAnimations({ subtree: true })
        .filter(
          (animation) =>
            named(animation).startsWith('cast-') &&
            named(animation) !== 'cast-spawn',
        )
      if (!animations.length) continue

      const lead = animations[0]
      const target = (lead.effect as KeyframeEffect | null)?.target ?? null
      const timing = lead.effect?.getComputedTiming()
      const duration =
        typeof timing?.duration === 'number' ? timing.duration : 0
      for (const animation of animations) animation.pause()
      if (!target || !duration) continue

      // Walk the cycle once, recording how far the target has moved by each
      // step. A behavior with no travel at all falls back to even spacing.
      const path: number[] = [0]
      let previous: DOMRect | null = null
      for (let step = 0; step <= STEPS; step += 1) {
        for (const animation of animations)
          animation.currentTime = (duration * step) / STEPS
        const rect = target.getBoundingClientRect()
        if (previous) {
          const moved = Math.hypot(
            rect.left - previous.left,
            rect.top - previous.top,
          )
          path.push(path[path.length - 1] + moved)
        }
        previous = rect
      }

      const total = path[path.length - 1]
      let time = (duration * column) / frames
      if (total > 0.5) {
        const wanted = (total * column) / frames
        const index = path.findIndex((value) => value >= wanted)
        time = (duration * (index < 0 ? STEPS : index)) / STEPS
      }
      for (const animation of animations) animation.currentTime = time
    }
  }, FRAMES)
  await page.waitForTimeout(200)

  const file = path.join(OUT, `behaviors--${theme}.png`)
  await page.locator('.grid').screenshot({ path: file })
  await context.close()
  return file
}

async function recordBehaviors(
  browser: Browser,
  theme: Theme,
): Promise<string | null> {
  const cells = BEHAVIOR_IDS.map((id) => {
    const behavior = BEHAVIORS[id]
    return (
      `<figure>${memberMarkup(renderMember({ hat: behavior.hat, arms: true, seated: false, mood: behavior.mood, hasMark: behavior.target.includes('mark') }), id)}` +
      `<figcaption>${id}</figcaption>` +
      `<div class="note">${behavior.summary}</div></figure>`
    )
  }).join('')

  const size = { width: 5 * (CELL + 10) + 52, height: 2 * (CELL + 92) + 60 }
  const dir = path.join(OUT, 'take', theme)
  const context = await browser.newContext({
    viewport: size,
    recordVideo: { dir, size },
    reducedMotion: 'no-preference',
  })
  const page = await context.newPage()
  await page.setContent(
    shell(
      theme,
      5,
      `<div class="cast-field" data-arrived><div class="grid">${cells}</div></div>`,
    ),
  )
  // Long enough for the slowest cycle to complete once. `glance` runs 13s and a
  // recording shorter than that reports a behavior as doing nothing.
  await page.waitForTimeout(RECORD_MS)
  await context.close()

  const written = (await readdir(dir)).find((name) => name.endsWith('.webm'))
  if (!written) return null
  const file = path.join(OUT, `behaviors--${theme}.webm`)
  await rename(path.join(dir, written), file)
  await rm(dir, { recursive: true, force: true })
  return file
}

export { memberMarkup, shell }

/**
 * A page carrying one member per behavior. `e2e/cast-motion.ts` measures this
 * rather than the live page, because a behavior nobody has assigned yet is the
 * one most likely to ship unguarded.
 */
export function behaviorGrid(
  theme: Theme = 'light',
  size = SMALLEST_MEMBER,
): string {
  const cells = BEHAVIOR_IDS.map(
    (id) =>
      `<figure>${memberMarkup(
        renderMember({
          hat: BEHAVIORS[id].hat,
          arms: true,
          seated: false,
          mood: BEHAVIORS[id].mood,
          // A mark is drawn per member now rather than by every mood handing
          // one to every figure, so a behavior aimed at the mark has nothing
          // to move unless this asks for it. Read off the behavior's own
          // target, so one added later is covered without this changing.
          hasMark: BEHAVIORS[id].target.includes('mark'),
        }),
        id,
      )}` + `<figcaption>${id}</figcaption></figure>`,
  ).join('')
  return shell(
    theme,
    5,
    `<div class="cast-field" data-arrived><div class="grid">${cells}</div></div>`,
    size,
  )
}

if (import.meta.main) {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  const browser = await chromium.launch()
  const written: string[] = []
  try {
    for (const theme of ['light', 'dark'] as const) {
      written.push(await shootMoods(browser, theme))
      written.push(await stripBehaviors(browser, theme))
      const video = await recordBehaviors(browser, theme)
      if (video) written.push(video)
    }
  } finally {
    await browser.close()
    await rm(path.join(OUT, 'take'), { recursive: true, force: true })
  }

  // An index so the folder states what it holds without anything being opened.
  await writeFile(
    path.join(OUT, 'README.md'),
    [
      '# Cast inventory',
      '',
      `${MOOD_IDS.length} expressions and ${BEHAVIOR_IDS.length} behaviors, regenerated by \`bun e2e/cast-inventory.ts\`.`,
      '',
      'Expressions are stills because an expression is a shape. Behaviors are',
      'recordings because a behavior is a change over time, and a still of one is',
      'a picture of a random frame.',
      '',
      'Each behavior also ships as a strip of six frames across its own cycle,',
      'taken by seeking rather than by catching the compositor, so the same commit',
      'produces the same image and a file nobody can open is not the only record.',
      '',
      ...BEHAVIOR_IDS.map((id) => `- \`${id}\`: ${BEHAVIORS[id].summary}`),
      '',
    ].join('\n'),
  )

  for (const file of written) console.log(file)
  console.log(path.join(OUT, 'README.md'))
}
