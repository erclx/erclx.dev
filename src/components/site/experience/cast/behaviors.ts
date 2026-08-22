/**
 * The motion vocabulary the cast draws from.
 *
 * Behaviors are named and assigned per member rather than chosen once for the
 * whole cast, so a member can be given a temperament without a decision being
 * taken away from every other member.
 *
 * Each entry declares the peak speed it is built to reach. That declaration is
 * what `e2e/cast-motion.ts` measures against, so a keyframe edited without
 * updating its own claim fails rather than drifting quietly. `.claude/DESIGN.md`
 * bars sustained motion between 4 and 11px per second, as motion detected with
 * no fixed reference to judge it against, which pulls the eye without rewarding
 * it. A behavior is therefore either below that band or crosses it fast enough
 * that almost none of its cycle is spent inside.
 */

import type { MoodId } from './faces'

export type BehaviorId =
  | 'bob'
  | 'wobble'
  | 'twitch'
  | 'wave'
  | 'blink'
  | 'glance'
  | 'emote'
  | 'nod'
  | 'sway'
  | 'lean'
  | 'hop'
  | 'shake'
  | 'turn'
  | 'pace'
  | 'flail'
  | 'breathe'
  | 'slump'
  | 'float'
  | 'power'

export interface Behavior {
  readonly kind: BehaviorKind
  /**
   * Whether the behavior moves its target through space at all. `turn` mirrors
   * in place and `think` drives opacity while its children carry the movement,
   * so both are real and neither has a speed to read.
   */
  readonly travels: boolean
  /** The element the behavior moves, as a selector inside a member. */
  readonly target: string
  /**
   * What a member must be wearing and feeling for this behavior to have
   * anything to move.
   *
   * A behavior demonstrated on the wrong member animates nothing, and no rate
   * check can see that because there is no rate to read. It has happened twice:
   * `wobble` moves the antenna and reported as absent on a member wearing ears,
   * and `emote` moves the mood's own mark and reported as absent on a mood that
   * carries none.
   */
  readonly hat: 'none' | 'antenna' | 'ears'
  readonly mood: MoodId
  /**
   * Peak speed the keyframes reach, in pixels per second, measured on a 54px
   * member, which is the smallest the cast ships.
   *
   * Size matters to this figure and to the band share under it. A bigger member
   * moves its bounding box further for the same keyframes, so it crosses the
   * barred band faster and spends less of its cycle inside it. Measuring a
   * comfortable size would make the guard laxer than the page it guards. An earlier set of these was estimated from rotation
   * angles and ran an order of magnitude high: a small element turning about
   * its own centre moves its bounding box far more slowly than the angle reads.
   */
  readonly peak: number
  /**
   * Share of one cycle the target spends inside the barred band. Meaningful for
   * an idle term and not for a reaction, which is short enough that its own
   * acceleration accounts for most of its cycle.
   */
  readonly bandShare: number
  readonly summary: string
}

/**
 * What kind of term a behavior is, which decides what it is judged against.
 *
 * The band below bars *ambient* motion: movement detected with no fixed
 * reference to judge it against, which pulls the eye without rewarding it. A
 * reaction has a reference, namely the pointer that caused it, and it runs once
 * and stops. Holding one to the ambient ceiling is applying a rule to the case
 * it was written to exclude, and doing so would mean slowing twelve gestures a
 * reader asked for until they crossed the band quickly enough to satisfy a
 * standard about surfaces nobody asked for.
 *
 * So the two are guarded on different properties. An idle term answers to the
 * band. A reaction answers to being brief and to actually moving, which is what
 * catches the real defect in its class: a gesture that fires and does nothing.
 */
export type BehaviorKind = 'idle' | 'reaction'

/** A reaction longer than this stops reading as an answer to a pointer. */
export const REACTION_CEILING_MS = 2500
/**
 * A reaction has to travel at least this much of its own target's width every
 * second, rather than a flat number of pixels.
 *
 * A flat floor asks a one-cell antenna and a whole body for the same speed, and
 * the antenna fails it while being clearly visible: 12px/s across an 8px part is
 * a flick, and across a 54px body it is a drift. Reading the target's own size
 * is what makes one number cover both.
 */
export const REACTION_FLOOR_PER_WIDTH = 0.6

/** The band `.claude/DESIGN.md` bars, in pixels per second. */
export const AMBIENT_BAND = { low: 4, high: 11 } as const

/** No behavior may spend more than this share of a cycle inside the band. */
export const BAND_SHARE_CEILING = 0.08

export const BEHAVIORS: Record<BehaviorId, Behavior> = {
  bob: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    // A 2.5px amplitude over 4.2s peaks at 2 pi a / T, which is 3.7px/s and
    // never reaches the band at all.
    peak: 7.4,
    bandShare: 0,
    summary: 'the whole body rising and settling, slower than the band starts',
  },
  wobble: {
    kind: 'reaction',
    travels: true,
    target: '.bn-hat',
    hat: 'antenna',
    mood: 'neutral',
    peak: 11.5,
    bandShare: 0.02,
    summary: 'the antenna springing and damping, then a long rest',
  },
  twitch: {
    kind: 'reaction',
    travels: true,
    target: '.bn-hat-l, .bn-hat-r',
    hat: 'ears',
    mood: 'neutral',
    peak: 13.3,
    bandShare: 0.02,
    summary: 'one ear flicking and returning',
  },
  wave: {
    kind: 'reaction',
    travels: true,
    target: '.bn-arm-r',
    hat: 'ears',
    mood: 'neutral',
    peak: 20.5,
    bandShare: 0.03,
    summary: 'an arm raised twice and lowered',
  },
  blink: {
    kind: 'reaction',
    travels: true,
    target: '.bn-eye-l, .bn-eye-r',
    hat: 'ears',
    mood: 'neutral',
    // A scale rather than a translation, so nothing crosses the frame and the
    // instrument reads no displacement at all.
    peak: 813.7,
    bandShare: 0,
    summary: 'the eyes closing for two frames',
  },
  glance: {
    kind: 'reaction',
    travels: true,
    target: '.bn-eye-l, .bn-eye-r',
    hat: 'ears',
    mood: 'neutral',
    // Stepped rather than eased, so the eyes are in one place or the other and
    // never at an intermediate speed.
    peak: 435.1,
    bandShare: 0,
    summary: 'the eyes stepping left, then right, then back',
  },
  nod: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 44.1,
    bandShare: 0.05,
    summary:
      'a listening dip, phased against the member opposite so a pair alternates',
  },
  sway: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 8.7,
    bandShare: 0,
    summary:
      'the whole body drifting side to side, the lateral answer to a bob',
  },
  lean: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 58.9,
    bandShare: 0.05,
    summary: 'a tilt off vertical held for a while, which reads as attention',
  },
  hop: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 157.5,
    bandShare: 0.02,
    summary: 'a jump with a squash on the landing',
  },
  shake: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 1934.0,
    bandShare: 0,
    summary:
      'fast lateral jitter with a hard stop, which is what frustration reads as',
  },
  turn: {
    kind: 'reaction',
    travels: false,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 0,
    bandShare: 0,
    summary:
      'a mirror rather than a rotation, so the member looks the other way',
  },
  pace: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 48.6,
    bandShare: 0.04,
    summary: 'walking a short distance and coming back',
  },
  flail: {
    kind: 'reaction',
    travels: true,
    target: '.bn-arm-l, .bn-arm-r',
    hat: 'ears',
    mood: 'neutral',
    peak: 48.1,
    bandShare: 0.03,
    summary:
      'both arms thrown up and dropped, the gesture a shake needs beside it',
  },
  breathe: {
    kind: 'idle',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 0.4,
    bandShare: 0,
    summary:
      'a slow swell and settle, the only term quiet enough to run unattended',
  },
  slump: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 43.4,
    bandShare: 0.03,
    summary:
      'a tilt away and a sag, which is what a tilt reads as when the face is already down',
  },
  float: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 200.7,
    bandShare: 0.03,
    summary:
      'rising off the ground and holding there, the one term that leaves the floor',
  },
  power: {
    kind: 'reaction',
    travels: true,
    target: '.bn',
    hat: 'ears',
    mood: 'neutral',
    peak: 268.0,
    bandShare: 0.03,
    summary: 'a slow charge and a fast release, read as effort then discharge',
  },
  emote: {
    kind: 'reaction',
    travels: true,
    target: '.bn-mark',
    hat: 'ears',
    mood: 'thinking',
    peak: 300,
    bandShare: 0.03,
    summary:
      "the member's own mark thrown up and settling, so each one emotes differently",
  },
}

export const BEHAVIOR_IDS = Object.keys(BEHAVIORS) as BehaviorId[]

/**
 * What a mood does, at rest and when a reader reaches it.
 *
 * Motion is bound to expression rather than assigned per member. A cast picking
 * behaviors freely produces a happy face tilting like a sad one, which reads as
 * two unrelated decisions rather than as a character: up and down belongs to
 * pleasure, a tilt belongs to disappointment, and a jitter belongs to
 * frustration. Binding them here is what stops a placement recombining them.
 *
 * `idle` is what runs unattended and is deliberately almost nothing. Every
 * expressive term moved to `react`, which fires under a pointer, because a
 * margin full of characters performing at a reader who has not looked at them
 * is the ambient motion problem restated rather than solved.
 */
export interface Temperament {
  /** Runs forever. Keep it under the band and barely visible. */
  readonly idle: BehaviorId | null
  /** Fires once when a reader points at the member. */
  readonly react: readonly BehaviorId[]
}

export const TEMPERAMENTS: Record<string, Temperament> = {
  determined: { idle: 'breathe', react: ['power', 'emote'] },
  unleashed: { idle: 'breathe', react: ['power', 'float', 'emote'] },
  playful: { idle: 'breathe', react: ['hop', 'wave'] },
  starstruck: { idle: 'breathe', react: ['hop', 'emote'] },
  triumphant: { idle: 'breathe', react: ['hop', 'flail', 'emote'] },
  exasperated: { idle: 'breathe', react: ['slump', 'emote'] },
  dizzy: { idle: 'breathe', react: ['shake', 'emote'] },
  neutral: { idle: 'breathe', react: ['nod', 'blink'] },
  pleased: { idle: 'breathe', react: ['hop', 'blink'] },
  humming: { idle: 'breathe', react: ['hop', 'emote'] },
  // A scale and a rise, which is why tapping the member carrying this read as
  // the figure simply getting bigger. Neither term is a gesture. A jump with
  // the arms thrown up and the mark with it is an event a reader can name.
  charged: { idle: 'breathe', react: ['hop', 'flail', 'emote'] },
  working: { idle: 'breathe', react: ['nod', 'emote'] },
  thinking: { idle: 'breathe', react: ['lean', 'emote'] },
  frustrated: { idle: 'breathe', react: ['shake', 'flail'] },
  flustered: { idle: 'breathe', react: ['shake', 'blink'] },
  sulking: { idle: 'breathe', react: ['slump'] },
  done: { idle: 'breathe', react: ['slump', 'blink'] },
  surprised: { idle: 'breathe', react: ['hop', 'blink'] },
  asleep: { idle: 'breathe', react: ['blink', 'emote'] },
  // A lean and a blink were the two weakest terms in the vocabulary, and the
  // lead had both while every other member jumped or shook. He read as a
  // villain because he stood in flames and did nothing. No `emote` even now:
  // it moves the mood's own mark and `smug` carries none, so binding it would
  // fire a reaction that animates nothing.
  smug: { idle: 'breathe', react: ['power', 'flail'] },
  driven: { idle: 'breathe', react: ['power', 'flail', 'emote'] },
  roused: { idle: 'breathe', react: ['power', 'flail', 'emote'] },
  stoked: { idle: 'breathe', react: ['power', 'flail', 'emote'] },
  composed: { idle: 'breathe', react: ['nod', 'emote'] },
  // No `emote` on `assured`: it moves the mood's own mark and this one carries
  // none, so binding it would fire a reaction that animates nothing.
  assured: { idle: 'breathe', react: ['power', 'flail'] },
  bold: { idle: 'breathe', react: ['power', 'flail', 'emote'] },
  sunny: { idle: 'breathe', react: ['power', 'flail', 'emote'] },
  // No `float` beside `power`. A scale and a rise together read as the figure
  // simply getting bigger, which is the defect the worker's tap already had.
  // A flail throws the arms out, which is a gesture rather than a size change.
  surging: { idle: 'breathe', react: ['power', 'flail', 'emote'] },
  rapt: { idle: 'breathe', react: ['hop', 'emote'] },
  revved: { idle: 'breathe', react: ['hop', 'flail', 'emote'] },
  cocky: { idle: 'breathe', react: ['hop', 'emote'] },
  fired: { idle: 'breathe', react: ['power', 'emote'] },
  beaming: { idle: 'breathe', react: ['hop', 'flail', 'emote'] },
  pumped: { idle: 'breathe', react: ['hop', 'flail', 'emote'] },
}
