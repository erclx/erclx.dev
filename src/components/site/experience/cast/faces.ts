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
 * member. `cast.test.ts` fails a stepped figure whose cells stop touching.
 *
 * That guard is connectivity rather than size, and the distinction cost a pass
 * to find. Reading the rule as a floor on every cell reports thirty of
 * thirty-four parts broken, since a `closed` eye is one bar at 1.5px and has
 * nothing beside it to separate from. What breaks a chevron is a gap between
 * two cells, so a gap is what is measured.
 *
 * Nothing is deleted from here. It is an inventory a placement draws from, and
 * an unused entry costs a few bytes of a static build.
 */

export type EyeId =
  | 'keen'
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
  | 'beam'
  | 'bared'
  | 'smirk'
  | 'grin'
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
    // Taller than it is wide, which is the one proportion no other eye here
    // uses: `open` is a square, `wide` a bigger square, `dot` a small one. A
    // level gaze needs a shape rather than a brow, and a brow is what every
    // intense eye in this set already is. One cell rather than a lid over an
    // eye, because the eye box is 5.4px on the smallest member and a lid inside
    // it lands near 1px.
    case 'keen':
      return [{ x: 0.22, y: -0.12, w: 0.56, h: 1.24, round: 3 }]
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
    // Up on one side only. Symmetry is what makes `smile` read as friendly, so
    // breaking it is the whole of what makes this read as pleased with itself.
    // The one mouth in the set that is not mirrored about the centre.
    case 'smirk':
      return [
        { x: 0.04, y: 0.44, w: 0.42, h: 0.34 },
        { x: 0.38, y: 0.26, w: 0.34, h: 0.34 },
        { x: 0.62, y: 0.1, w: 0.34, h: 0.32 },
      ]
    // Wider than `smile` and heavier along the bottom. A confident mouth is a
    // broad one rather than a big one, so this spans past the mouth box on both
    // sides where `wide` and `grin` grow upward into the face instead.
    case 'beam':
      return [
        { x: -0.1, y: 0.02, w: 0.4, h: 0.4 },
        { x: 0.18, y: 0.36, w: 0.64, h: 0.44 },
        { x: 0.7, y: 0.02, w: 0.4, h: 0.4 },
      ]
    // Open with a stepped top edge, which reads as a mouth set against
    // something rather than one enjoying itself. `open` is a plain box and
    // `wide` is a bigger one, so neither can carry effort: what carries it is
    // the break in the upper line.
    case 'bared':
      return [
        { x: 0.1, y: 0.14, w: 0.34, h: 0.28 },
        { x: 0.4, y: 0.06, w: 0.3, h: 0.36 },
        { x: 0.66, y: 0.16, w: 0.32, h: 0.26 },
        { x: 0.12, y: 0.36, w: 0.78, h: 0.42, round: 2 },
      ]
    // Open and stepped up at both corners. Wider than `smile` and taller than
    // `wide`, so it carries at the smallest size where a thin arc does not.
    case 'grin':
      return [
        { x: 0.06, y: 0.2, w: 0.34, h: 0.34 },
        { x: 0.16, y: 0.34, w: 0.68, h: 0.42 },
        { x: 0.6, y: 0.2, w: 0.34, h: 0.34 },
      ]
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
  'keen',
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
  'bared',
  'beam',
  'smirk',
  'grin',
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
  // The lead at rest. `determined` pairs a fierce brow with a flat mouth and
  // both are hairlines, which measured 8.0% ink in the face region, second
  // lowest in the cast and behind the member that is asleep. A brow that reads
  // as effort over a mouth that reads as nothing is what made him read as glum
  // rather than as capable.
  smug: { eyes: 'fierce', mouth: 'smirk', mark: 'none' },
  cocky: { eyes: 'happy', mouth: 'smirk', mark: 'spark' },
  fired: { eyes: 'fierce', mouth: 'grin', mark: 'bolt' },
  beaming: { eyes: 'sparkle', mouth: 'grin', mark: 'burst' },
  // Open eyes over a grin. `working` shipped the same eyes over a flat mouth
  // and read as blank, which is a mouth problem rather than an eye one: the
  // eyes were already the only pair in the cast nothing else used. Reaching for
  // `triumphant` instead spent that, since it shares `happy` eyes with the
  // member standing in the next cluster and the two measured 4.8% apart, the
  // closest pair the cast has ever held.
  pumped: { eyes: 'open', mouth: 'grin', mark: 'burst' },
  // Candidates for the lead. He measured as the member doing the least in the
  // cast, reacting with a lean and a blink where everyone else jumps or shakes,
  // and he carried no mark, so his face emitted nothing while he stood in
  // flames. Each of these gives him something to throw.
  driven: { eyes: 'fierce', mouth: 'smirk', mark: 'bolt' },
  roused: { eyes: 'fierce', mouth: 'bared', mark: 'impact' },
  stoked: { eyes: 'fierce', mouth: 'bared', mark: 'aura' },
  // A candidate for the crowned member, who shares the cheerful register with
  // the member two clusters above him. They are the only two in the cast whose
  // eyes and mouth are both warm, so they pair off across the page however
  // unique each feature is on its own.
  composed: { eyes: 'dot', mouth: 'open', mark: 'note' },
  // The lead, off the brow entirely. Every intense eye in this family is a brow
  // and a brow over a closed mouth is what read as a villain, so these pair a
  // level gaze with a broad smile instead.
  assured: { eyes: 'keen', mouth: 'beam', mark: 'none' },
  bold: { eyes: 'fierce', mouth: 'beam', mark: 'bolt' },
  sunny: { eyes: 'keen', mouth: 'smirk', mark: 'spark' },
  // What the lead becomes under a tap. It keeps his own eyes and opens his own
  // smile, because the tap he had thrown both away: `unleashed` swaps the level
  // gaze for the angled brow he was moved off and the broad smile for `wide`,
  // which is a plain open box and the same mouth the angry member wears. From a
  // confident rest that reads as dismay rather than as effort.
  //
  // A tap escalates a face rather than replacing it. That is the rule the
  // sleeping member already followed, waking surprised rather than waking as
  // somebody else.
  surging: { eyes: 'keen', mouth: 'bared', mark: 'impact' },
  // The crowned member. `rapt` is where he rests and `composed` is what a tap
  // narrows him to, which is the opposite of how the pair was first placed.
  // Wide eyes settling to points reads as a figure gathering itself, and points
  // widening reads as one being startled, so the order carries the meaning
  // rather than either face doing it alone.
  //
  // Neither is the cheerful register he was moved out of. That was `sparkle`
  // over a `smile`, and what does the work here is the mouth staying `open`
  // through both, so only the eyes change and the change is the whole event.
  rapt: { eyes: 'sparkle', mouth: 'open', mark: 'spiral' },
  // The worker under a tap. `charged` widened both his eyes and his mouth at
  // once, which is why tapping him read as startled rather than as effort. His
  // own eyes stay and the grin opens.
  revved: { eyes: 'open', mouth: 'bared', mark: 'impact' },
} as const satisfies Record<string, Face>

export type MoodId = keyof typeof MOODS
export const MOOD_IDS = Object.keys(MOODS) as MoodId[]
