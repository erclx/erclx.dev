/**
 * The expression vocabulary.
 *
 * A face is three independent slots rather than a fixed set of moods: what the
 * eyes do, what the mouth does, and what floats beside the head.
 *
 * The mark is the mood's own and is the only thing raised when a member emotes.
 * A separate element used to draw three dots beside every member whatever they
 * were feeling, so five of them answered a pointer with the same gesture and the
 * cast read as one animation repeated. A mood that wants three dots asks for
 * `ellipsis` like any other. That split is
 * what makes the inventory combinatorial, so a mood nobody has named yet is a
 * pairing rather than a new drawing.
 *
 * Every shape is a rectangle on the same cell grid the body uses. A stepped
 * chevron stands in for a curve, because a diagonal is the one thing this
 * grammar has none of and adding one would break the cast rather than extend it.
 *
 * Those steps overlap rather than sitting side by side. A first pass spaced them
 * exactly and every chevron broke into three dots at the smallest size the cast
 * ships at, because a step measuring 0.35 of an eye box is 2.6px on a 60px
 * member. `e2e/cast.spec.ts` fails a face carrying a cell under 3px there.
 *
 * Nothing is deleted from here. It is an inventory a placement draws from, and
 * an unused entry costs a few bytes of a static build.
 */

export type EyeId =
  | 'sparkle'
  | 'fierce'
  | 'swirl'
  | 'open'
  | 'wide'
  | 'happy'
  | 'squint'
  | 'closed'
  | 'sleepy'
  | 'dot'
  | 'cross'

export type MouthId =
  | 'tongue'
  | 'flat'
  | 'smile'
  | 'frown'
  | 'pout'
  | 'open'
  | 'wide'
  | 'wave'
  | 'none'

export type MarkId =
  | 'none'
  | 'sweat'
  | 'anger'
  | 'spark'
  | 'zzz'
  | 'question'
  | 'exclaim'
  | 'note'
  | 'bolt'
  | 'heart'
  | 'burst'
  | 'spiral'
  | 'steam'
  | 'ellipsis'
  | 'aura'
  | 'impact'

export interface Face {
  readonly eyes: EyeId
  readonly mouth: MouthId
  readonly mark: MarkId
}

export interface Cell {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly ink: 'body' | 'eye'
  readonly part: string
  readonly round?: number
}

/**
 * Eye shapes, in units of the eye box: a 1 by 1 square centred on the eye's own
 * position. A shape returning several cells is a stepped figure standing in for
 * a curve.
 */
export function eyeCells(
  id: EyeId,
  side: -1 | 1,
): ReadonlyArray<Omit<Cell, 'ink' | 'part'>> {
  const flip = side === 1 ? 1 : -1
  switch (id) {
    case 'open':
      return [{ x: 0, y: 0, w: 1, h: 1 }]
    // A stepped four-point star. The admiring eye, and the only one that reads
    // as light coming out rather than as a shape cut in.
    case 'sparkle':
      return [
        { x: 0.34, y: -0.1, w: 0.34, h: 1.2 },
        { x: -0.1, y: 0.34, w: 1.2, h: 0.34 },
        { x: 0.16, y: 0.16, w: 0.7, h: 0.7 },
      ]
    // A brow stepping down toward the nose. Mirrored per side, which is the one
    // eye that needs to know which side it is on.
    case 'fierce':
      return [
        { x: flip > 0 ? 0.0 : 0.5, y: 0.02, w: 0.5, h: 0.26 },
        { x: flip > 0 ? 0.32 : 0.18, y: 0.2, w: 0.5, h: 0.26 },
        { x: 0.16, y: 0.46, w: 0.68, h: 0.34 },
      ]
    // Squares stepping inward, which is the blocky reading of a dizzy spiral.
    case 'swirl':
      return [
        { x: 0, y: 0, w: 1, h: 0.24 },
        { x: 0.76, y: 0, w: 0.24, h: 0.76 },
        { x: 0.24, y: 0.52, w: 0.76, h: 0.24 },
        { x: 0.24, y: 0.24, w: 0.24, h: 0.5 },
      ]
    case 'wide':
      return [{ x: -0.15, y: -0.25, w: 1.3, h: 1.5 }]
    // Stepped upward at the outer edge, which is the blocky reading of a happy
    // arc without a diagonal anywhere in it.
    case 'happy':
      return [
        { x: -0.05, y: 0.44, w: 0.5, h: 0.42 },
        { x: 0.25, y: 0.12, w: 0.5, h: 0.42 },
        { x: 0.55, y: 0.44, w: 0.5, h: 0.42 },
      ]
    // The same figure inverted, which reads as screwed shut rather than as sad.
    case 'squint':
      return [
        { x: -0.05, y: 0.08, w: 0.5, h: 0.42 },
        { x: 0.25, y: 0.4, w: 0.5, h: 0.42 },
        { x: 0.55, y: 0.08, w: 0.5, h: 0.42 },
      ]
    case 'closed':
      return [{ x: -0.1, y: 0.4, w: 1.2, h: 0.28 }]
    // Half lidded, so the eye is present but mostly covered.
    case 'sleepy':
      return [{ x: 0, y: 0.5, w: 1, h: 0.5 }]
    case 'dot':
      return [{ x: 0.28, y: 0.28, w: 0.44, h: 0.44 }]
    // Two bars crossing, drawn as three cells so no diagonal is needed.
    case 'cross':
      return [
        { x: 0.1, y: 0.1, w: 0.36, h: 0.36 },
        { x: 0.32, y: 0.32, w: 0.36, h: 0.36 },
        { x: 0.54, y: 0.54, w: 0.36, h: 0.36 },
        { x: 0.54 * (flip > 0 ? 1 : 1), y: 0.1, w: 0.36, h: 0.36 },
        { x: 0.1, y: 0.54, w: 0.36, h: 0.36 },
      ]
  }
}

/** Mouth shapes, in units of the mouth box: 1 wide by 1 tall at the mouth position. */
export function mouthCells(
  id: MouthId,
): ReadonlyArray<Omit<Cell, 'ink' | 'part'>> {
  switch (id) {
    case 'none':
      return []
    case 'flat':
      return [{ x: 0, y: 0.36, w: 1, h: 0.28, round: 1 }]
    // Open mouth with a tongue below it, offset off centre so it reads as
    // pulled rather than as a second mouth.
    case 'tongue':
      return [
        { x: 0.12, y: 0.12, w: 0.76, h: 0.34, round: 2 },
        { x: 0.42, y: 0.4, w: 0.36, h: 0.36, round: 4 },
      ]
    case 'smile':
      return [
        { x: -0.02, y: 0.06, w: 0.36, h: 0.4 },
        { x: 0.2, y: 0.4, w: 0.6, h: 0.4 },
        { x: 0.66, y: 0.06, w: 0.36, h: 0.4 },
      ]
    case 'frown':
      return [
        { x: -0.02, y: 0.42, w: 0.36, h: 0.4 },
        { x: 0.2, y: 0.1, w: 0.6, h: 0.4 },
        { x: 0.66, y: 0.42, w: 0.36, h: 0.4 },
      ]
    // Small and centred. The classic sulk reads on size rather than on shape.
    case 'pout':
      return [{ x: 0.34, y: 0.24, w: 0.32, h: 0.42, round: 3 }]
    case 'open':
      return [{ x: 0.24, y: 0.12, w: 0.52, h: 0.62, round: 2 }]
    case 'wide':
      return [{ x: 0.06, y: 0.1, w: 0.88, h: 0.7, round: 2 }]
    // A stepped tilde, which is the blocky reading of an unimpressed squiggle.
    case 'wave':
      return [
        { x: -0.02, y: 0.4, w: 0.36, h: 0.34 },
        { x: 0.24, y: 0.16, w: 0.36, h: 0.34 },
        { x: 0.5, y: 0.4, w: 0.36, h: 0.34 },
        { x: 0.74, y: 0.16, w: 0.3, h: 0.34 },
      ]
  }
}

/**
 * Marks float beside the head rather than on the face, in units of the body
 * width, measured from the head's top right corner. They carry the body ink
 * rather than the eye ink, since they read as something in the air rather than
 * as a hole in the drawing.
 */
export function markCells(
  id: MarkId,
): ReadonlyArray<Omit<Cell, 'ink' | 'part'>> {
  switch (id) {
    case 'none':
      return []
    // A blocky teardrop: wide at the bottom, stepped to a point.
    case 'sweat':
      return [
        { x: 0.16, y: 0, w: 0.16, h: 0.16 },
        { x: 0.08, y: 0.14, w: 0.32, h: 0.3, round: 4 },
      ]
    // The anime irritation cross, four bars around a gap.
    case 'anger':
      return [
        { x: 0.12, y: 0, w: 0.4, h: 0.15 },
        { x: 0.12, y: 0.28, w: 0.4, h: 0.15 },
        { x: 0.04, y: 0.04, w: 0.15, h: 0.35 },
        { x: 0.45, y: 0.04, w: 0.15, h: 0.35 },
      ]
    case 'spark':
      return [
        { x: 0.22, y: 0, w: 0.14, h: 0.42 },
        { x: 0.05, y: 0.14, w: 0.48, h: 0.14 },
      ]
    // Three rising marks, each smaller than the last.
    case 'zzz':
      return [
        { x: 0, y: 0.3, w: 0.14, h: 0.14 },
        { x: 0.18, y: 0.15, w: 0.18, h: 0.18 },
        { x: 0.4, y: 0, w: 0.22, h: 0.22 },
      ]
    case 'question':
      return [
        { x: 0.1, y: 0, w: 0.34, h: 0.1 },
        { x: 0.36, y: 0.08, w: 0.1, h: 0.14 },
        { x: 0.22, y: 0.2, w: 0.16, h: 0.12 },
        { x: 0.22, y: 0.38, w: 0.14, h: 0.12 },
      ]
    case 'exclaim':
      return [
        { x: 0.2, y: 0, w: 0.14, h: 0.32 },
        { x: 0.2, y: 0.38, w: 0.14, h: 0.14 },
      ]
    case 'note':
      return [
        { x: 0.26, y: 0, w: 0.12, h: 0.34 },
        { x: 0.12, y: 0.28, w: 0.26, h: 0.18, round: 4 },
      ]
    // The power mark. A lightning bolt stepped rather than tapered, which is
    // the only way this grammar can draw a diagonal at all.
    case 'bolt':
      return [
        { x: 0.3, y: 0, w: 0.17, h: 0.2 },
        { x: 0.18, y: 0.16, w: 0.17, h: 0.2 },
        { x: 0.08, y: 0.32, w: 0.34, h: 0.14 },
        { x: 0.26, y: 0.32, w: 0.17, h: 0.2 },
        { x: 0.14, y: 0.48, w: 0.17, h: 0.22 },
      ]
    case 'heart':
      return [
        { x: 0.06, y: 0.08, w: 0.18, h: 0.18, round: 5 },
        { x: 0.3, y: 0.08, w: 0.18, h: 0.18, round: 5 },
        { x: 0.06, y: 0.2, w: 0.42, h: 0.16 },
        { x: 0.14, y: 0.34, w: 0.26, h: 0.14 },
        { x: 0.22, y: 0.46, w: 0.1, h: 0.12 },
      ]
    // A burst rather than a star: four short strokes leaving a gap in the
    // middle, so it reads as something happening rather than as an object.
    case 'burst':
      return [
        { x: 0.24, y: 0, w: 0.12, h: 0.16 },
        { x: 0.24, y: 0.4, w: 0.12, h: 0.16 },
        { x: 0, y: 0.22, w: 0.16, h: 0.12 },
        { x: 0.44, y: 0.22, w: 0.16, h: 0.12 },
        { x: 0.06, y: 0.06, w: 0.12, h: 0.12 },
        { x: 0.42, y: 0.38, w: 0.12, h: 0.12 },
      ]
    case 'spiral':
      return [
        { x: 0.08, y: 0.06, w: 0.44, h: 0.1 },
        { x: 0.42, y: 0.06, w: 0.1, h: 0.34 },
        { x: 0.2, y: 0.3, w: 0.32, h: 0.1 },
        { x: 0.2, y: 0.18, w: 0.1, h: 0.22 },
      ]
    // Two puffs leaving the head, which is the exasperated sigh.
    case 'steam':
      return [
        { x: 0.04, y: 0.24, w: 0.16, h: 0.1, round: 5 },
        { x: 0.22, y: 0.12, w: 0.2, h: 0.12, round: 5 },
        { x: 0.3, y: 0, w: 0.24, h: 0.14, round: 5 },
      ]
    // Strokes rising beside the head at uneven heights, which is the action-anime
    // reading of energy coming off someone rather than a symbol about them.
    case 'aura':
      return [
        { x: 0.02, y: 0.18, w: 0.1, h: 0.34 },
        { x: 0.18, y: 0.04, w: 0.1, h: 0.52 },
        { x: 0.34, y: 0.14, w: 0.1, h: 0.4 },
        { x: 0.5, y: 0, w: 0.1, h: 0.46 },
      ]
    // A struck burst. Longer spikes than `burst` and no centre at all, so it
    // reads as a hit rather than as a sparkle.
    case 'impact':
      return [
        { x: 0.26, y: 0, w: 0.12, h: 0.24 },
        { x: 0.26, y: 0.4, w: 0.12, h: 0.24 },
        { x: 0, y: 0.26, w: 0.24, h: 0.12 },
        { x: 0.4, y: 0.26, w: 0.24, h: 0.12 },
        { x: 0.08, y: 0.08, w: 0.14, h: 0.14 },
        { x: 0.42, y: 0.42, w: 0.14, h: 0.14 },
        { x: 0.42, y: 0.08, w: 0.14, h: 0.14 },
        { x: 0.08, y: 0.42, w: 0.14, h: 0.14 },
      ]
    // Three dots. It used to be every member's mark whatever their mood, drawn
    // by a separate element the face knew nothing about, which is why the cast
    // read as one repeated gesture. It is a mood's own mark now and belongs to
    // the deadpan one alone.
    case 'ellipsis':
      return [
        { x: 0.02, y: 0.28, w: 0.13, h: 0.13, round: 5 },
        { x: 0.22, y: 0.28, w: 0.13, h: 0.13, round: 5 },
        { x: 0.42, y: 0.28, w: 0.13, h: 0.13, round: 5 },
      ]
  }
}

export const EYE_IDS: readonly EyeId[] = [
  'open',
  'wide',
  'happy',
  'squint',
  'closed',
  'sleepy',
  'dot',
  'cross',
  'sparkle',
  'swirl',
  'fierce',
]
export const MOUTH_IDS: readonly MouthId[] = [
  'flat',
  'smile',
  'frown',
  'pout',
  'open',
  'wide',
  'wave',
  'tongue',
  'none',
]
export const MARK_IDS: readonly MarkId[] = [
  'none',
  'sweat',
  'anger',
  'spark',
  'zzz',
  'question',
  'exclaim',
  'note',
  'bolt',
  'heart',
  'burst',
  'spiral',
  'steam',
  'ellipsis',
  'aura',
  'impact',
]

/** Named pairings, so a common mood is one word rather than three. */
export const MOODS = {
  neutral: { eyes: 'open', mouth: 'flat', mark: 'none' },
  pleased: { eyes: 'happy', mouth: 'smile', mark: 'none' },
  thinking: { eyes: 'sleepy', mouth: 'flat', mark: 'question' },
  working: { eyes: 'open', mouth: 'flat', mark: 'spark' },
  frustrated: { eyes: 'squint', mouth: 'wide', mark: 'anger' },
  flustered: { eyes: 'wide', mouth: 'wave', mark: 'sweat' },
  sulking: { eyes: 'sleepy', mouth: 'pout', mark: 'none' },
  asleep: { eyes: 'closed', mouth: 'flat', mark: 'zzz' },
  surprised: { eyes: 'wide', mouth: 'open', mark: 'exclaim' },
  done: { eyes: 'cross', mouth: 'wave', mark: 'none' },
  humming: { eyes: 'happy', mouth: 'open', mark: 'note' },
  charged: { eyes: 'wide', mouth: 'wide', mark: 'bolt' },
  starstruck: { eyes: 'sparkle', mouth: 'smile', mark: 'heart' },
  dizzy: { eyes: 'swirl', mouth: 'wave', mark: 'spiral' },
  deadpan: { eyes: 'dot', mouth: 'flat', mark: 'ellipsis' },
  exasperated: { eyes: 'closed', mouth: 'frown', mark: 'steam' },
  triumphant: { eyes: 'happy', mouth: 'wide', mark: 'burst' },
  playful: { eyes: 'happy', mouth: 'tongue', mark: 'none' },
  determined: { eyes: 'fierce', mouth: 'flat', mark: 'aura' },
  unleashed: { eyes: 'fierce', mouth: 'wide', mark: 'impact' },
} as const satisfies Record<string, Face>

export type MoodId = keyof typeof MOODS
export const MOOD_IDS = Object.keys(MOODS) as MoodId[]
