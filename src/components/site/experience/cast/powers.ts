/**
 * The power vocabulary: what a member emits, drawn behind it.
 *
 * This is a slot rather than another mark, and the reason is measured. A mark
 * is laid out in a box 17.6px across on the smallest member the cast ships and
 * anchored to the head's top right corner, so nothing that has to surround a
 * body can be drawn as one. An aura built there reads as a small comb beside
 * the ear, which is what the determined lead shipped with and why he reads flat
 * rather than charged.
 *
 * Cells are in grid units, the same 12 by 12 the body is laid out on, so a
 * power is positioned against the member rather than against a sub-box. That is
 * the whole difference from `faces.ts`, where a slot is small enough that its
 * own box is the useful frame.
 *
 * Strokes are 0.7 cells or wider. One cell is 4.5px on a 54px member, so a
 * thinner stroke lands under 3px and stops holding its shape against the ground.
 * `.claude/.tmp/cast-society/legibility.ts` is where that figure comes from.
 *
 * The layer reaches `REACH` cells past the member on every side. Held to the
 * member's own 12 by 12 box a power cannot be larger than the figure emitting
 * it, and served live at that size a blaze read as a fringe around the lead
 * rather than as anything he was doing. The reach costs nothing the member's
 * box has to pay, since the power is its own drawing with its own viewBox, and
 * the member's bounding box is what the cluster guard measures.
 *
 * Everything here is stepped rather than tapered, because a diagonal is the one
 * thing this grammar has none of, and adding one would break the cast rather
 * than extend it.
 */

export type PowerId =
  | 'none'
  | 'aura'
  | 'blaze'
  | 'bolts'
  | 'ring'
  | 'sparks'
  | 'speed'
  | 'shadow'
  | 'tide'
  | 'stone'
  | 'gust'

export interface PowerCell {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly round?: number
  /**
   * Which limb of the effect this cell belongs to, so a stylesheet can move the
   * left side against the right without the drawing knowing about motion.
   */
  readonly part: 'aura-l' | 'aura-r' | 'aura-t' | 'aura-b'
  /**
   * Emission is the default and reads lighter than the body. A power standing
   * behind the member as a second figure has to read darker instead, since a
   * silhouette lighter than the thing casting it is not a shadow.
   */
  readonly ink?: 'aura' | 'shade'
}

/**
 * How far past the member's own box the layer extends, in cells on every side.
 *
 * Two rather than three, and the figure is the placement's rather than the
 * drawing's. A cluster reserves the reach on both sides, once as clearance from
 * the reading column and once in its own width, so the footprint grows by twice
 * the overhang. At three cells the 88px member's cluster ran 12.6px past the
 * margin the rail and dock leave at 1280, which the cluster guard caught. Two
 * clears both by 12px at the column and 7px at the dock.
 *
 * A larger reach is available and it costs a placement change rather than a
 * drawing change, since what does not fit is the cluster rather than the
 * effect.
 */
export const REACH = 2

/** The body's own extent, so a power frames the member rather than a guess at it. */
const BODY_LEFT = 2.5
const BODY_RIGHT = 9.5
const BODY_TOP = 3.7
const GROUND = 11.2

/**
 * Tongues rising beside a member at uneven heights, which is the classic
 * charged silhouette. Uneven on purpose: matched heights read as a fence.
 */
function flames(inset: number, heights: readonly number[]): PowerCell[] {
  const out: PowerCell[] = []
  heights.forEach((height, index) => {
    const step = index * 0.95
    out.push({
      x: BODY_LEFT - inset - step * 0.15,
      y: GROUND - 1 - height - step * 0.2,
      w: 0.75,
      h: height,
      round: 3,
      part: 'aura-l',
    })
    out.push({
      x: BODY_RIGHT + inset - 0.75 + step * 0.15,
      y: GROUND - 1 - height - step * 0.2,
      w: 0.75,
      h: height,
      round: 3,
      part: 'aura-r',
    })
  })
  return out
}

export function powerCells(id: PowerId): readonly PowerCell[] {
  switch (id) {
    case 'none':
      return []

    // Steady flanking tongues plus a crown of them. The everyday charged state,
    // and the one meant to sit under a member without taking the section over.
    case 'aura':
      return [
        ...flames(1.1, [5.0, 3.4, 2.0]),
        {
          x: 4.1,
          y: BODY_TOP - 3.6,
          w: 0.85,
          h: 3.0,
          round: 3,
          part: 'aura-t',
        },
        {
          x: 5.6,
          y: BODY_TOP - 4.8,
          w: 0.85,
          h: 4.2,
          round: 3,
          part: 'aura-t',
        },
        {
          x: 7.1,
          y: BODY_TOP - 3.6,
          w: 0.85,
          h: 3.0,
          round: 3,
          part: 'aura-t',
        },
      ]

    // The same figure driven much further: taller tongues, a wider spread, and
    // a base under the feet so the member reads as standing inside it.
    case 'blaze':
      return [
        ...flames(1.9, [8.4, 6.2, 4.2, 2.4]),
        { x: 3.0, y: -1.2, w: 1.0, h: 4.7, round: 3, part: 'aura-t' },
        { x: 5.0, y: -1.9, w: 1.0, h: 5.4, round: 3, part: 'aura-t' },
        { x: 7.0, y: -1.5, w: 1.0, h: 5.0, round: 3, part: 'aura-t' },
        { x: 8.8, y: 0.2, w: 0.9, h: 3.3, round: 3, part: 'aura-t' },
        { x: 1.4, y: 0.9, w: 0.9, h: 2.6, round: 3, part: 'aura-t' },
        { x: 0.9, y: GROUND - 0.4, w: 10.2, h: 0.9, round: 3, part: 'aura-b' },
      ]

    // Arcs leaving the body, stepped outward so each reads as a discharge
    // rather than as a bar. The lightning register, and the loudest thing here
    // that still resolves at the smallest size.
    case 'bolts':
      return [
        { x: 1.2, y: 3.6, w: 0.85, h: 2.1, part: 'aura-l' },
        { x: -0.5, y: 5.4, w: 0.85, h: 2.0, part: 'aura-l' },
        { x: -1.75, y: 7.1, w: 0.85, h: 1.7, part: 'aura-l' },
        { x: 1.4, y: 8.0, w: 0.85, h: 1.8, part: 'aura-l' },
        { x: 9.95, y: 3.6, w: 0.85, h: 2.1, part: 'aura-r' },
        { x: 11.65, y: 5.4, w: 0.85, h: 2.0, part: 'aura-r' },
        { x: 12.9, y: 7.1, w: 0.85, h: 1.7, part: 'aura-r' },
        { x: 9.75, y: 8.0, w: 0.85, h: 1.8, part: 'aura-r' },
        { x: 5.2, y: -0.4, w: 0.85, h: 2.1, part: 'aura-t' },
        { x: 6.3, y: 1.4, w: 0.85, h: 2.0, part: 'aura-t' },
      ]

    // A broken ring, which reads as containment rather than as emission. Four
    // arcs with the corners left out so it never closes into a disc.
    case 'ring':
      return [
        { x: 2.6, y: 0.1, w: 6.8, h: 0.85, round: 3, part: 'aura-t' },
        { x: 2.6, y: 12.3, w: 6.8, h: 0.85, round: 3, part: 'aura-b' },
        { x: -0.7, y: 3.2, w: 0.85, h: 6.8, round: 3, part: 'aura-l' },
        { x: 11.85, y: 3.2, w: 0.85, h: 6.8, round: 3, part: 'aura-r' },
        { x: 0.4, y: 1.4, w: 1.0, h: 1.0, round: 3, part: 'aura-l' },
        { x: 10.6, y: 1.4, w: 1.0, h: 1.0, round: 3, part: 'aura-r' },
        { x: 0.4, y: 10.8, w: 1.0, h: 1.0, round: 3, part: 'aura-l' },
        { x: 10.6, y: 10.8, w: 1.0, h: 1.0, round: 3, part: 'aura-r' },
      ]

    // Loose points around the member rather than a figure. The quietest power,
    // for a member who is working rather than fighting.
    case 'sparks':
      return [
        { x: 0.6, y: 2.6, w: 0.95, h: 0.95, round: 4, part: 'aura-l' },
        { x: -0.6, y: 6.2, w: 0.8, h: 0.8, round: 4, part: 'aura-l' },
        { x: 1.2, y: 9.6, w: 0.75, h: 0.75, round: 4, part: 'aura-l' },
        { x: 10.5, y: 2.1, w: 0.95, h: 0.95, round: 4, part: 'aura-r' },
        { x: 11.8, y: 5.8, w: 0.8, h: 0.8, round: 4, part: 'aura-r' },
        { x: 10.1, y: 9.4, w: 0.75, h: 0.75, round: 4, part: 'aura-r' },
        { x: 5.7, y: 0.0, w: 0.85, h: 0.85, round: 4, part: 'aura-t' },
      ]

    // Trailing bars behind the member, which is what says it arrived rather
    // than that it is standing there.
    case 'speed':
      return [
        { x: -1.9, y: 4.6, w: 4.5, h: 0.8, round: 3, part: 'aura-l' },
        { x: -1.4, y: 6.1, w: 3.9, h: 0.8, round: 3, part: 'aura-l' },
        { x: -2.0, y: 7.6, w: 4.1, h: 0.8, round: 3, part: 'aura-l' },
        { x: -1.4, y: 3.2, w: 3.4, h: 0.8, round: 3, part: 'aura-l' },
        { x: 9.6, y: 5.3, w: 2.6, h: 0.8, round: 3, part: 'aura-r' },
        { x: 9.9, y: 7.1, w: 3.1, h: 0.8, round: 3, part: 'aura-r' },
      ]

    // A second figure standing behind the member rather than an effect around
    // it. Offset far enough that a head, a shoulder and one foot clear the body
    // in front: at a closer offset the whole of it fell inside the silhouette
    // and read as a plate behind the head.
    case 'shadow':
      return [
        {
          x: 4.6,
          y: 2.6,
          w: 6.6,
          h: 5.6,
          round: 2,
          part: 'aura-r',
          ink: 'shade',
        },
        {
          x: 5.4,
          y: 8.2,
          w: 1.7,
          h: 2.0,
          round: 1,
          part: 'aura-r',
          ink: 'shade',
        },
        {
          x: 8.9,
          y: 8.2,
          w: 1.7,
          h: 2.0,
          round: 1,
          part: 'aura-r',
          ink: 'shade',
        },
        {
          x: 6.2,
          y: 1.5,
          w: 0.8,
          h: 1.2,
          round: 2,
          part: 'aura-t',
          ink: 'shade',
        },
        {
          x: 9.0,
          y: 1.5,
          w: 0.8,
          h: 1.2,
          round: 2,
          part: 'aura-t',
          ink: 'shade',
        },
      ]

    // Crests rising and breaking, stepped so the top of each is one cell proud
    // of the one before it.
    case 'tide':
      return [
        { x: 0.9, y: 7.4, w: 1.9, h: 0.8, round: 3, part: 'aura-l' },
        { x: 1.5, y: 6.3, w: 0.8, h: 1.3, round: 3, part: 'aura-l' },
        { x: 0.6, y: 9.0, w: 1.4, h: 0.8, round: 3, part: 'aura-l' },
        { x: 9.2, y: 7.4, w: 1.9, h: 0.8, round: 3, part: 'aura-r' },
        { x: 9.7, y: 6.3, w: 0.8, h: 1.3, round: 3, part: 'aura-r' },
        { x: 10.0, y: 9.0, w: 1.4, h: 0.8, round: 3, part: 'aura-r' },
      ]

    // Chunks held in the air around the member, largest low and smallest high,
    // which is what makes them read as lifted rather than as falling.
    case 'stone':
      return [
        { x: 0.8, y: 7.9, w: 1.6, h: 1.3, round: 1, part: 'aura-l' },
        { x: 1.6, y: 5.6, w: 1.1, h: 0.9, round: 1, part: 'aura-l' },
        { x: 9.7, y: 8.2, w: 1.5, h: 1.2, round: 1, part: 'aura-r' },
        { x: 9.3, y: 5.9, w: 1.0, h: 0.85, round: 1, part: 'aura-r' },
        { x: 5.9, y: 1.5, w: 0.9, h: 0.75, round: 1, part: 'aura-t' },
      ]

    // Two swipes curving past the member, drawn as an L so each reads as a
    // stroke with a direction rather than as a bar.
    case 'gust':
      return [
        { x: 0.6, y: 4.8, w: 2.2, h: 0.75, round: 3, part: 'aura-l' },
        { x: 0.6, y: 4.8, w: 0.75, h: 1.5, round: 3, part: 'aura-l' },
        { x: 9.4, y: 7.4, w: 2.2, h: 0.75, round: 3, part: 'aura-r' },
        { x: 10.85, y: 6.2, w: 0.75, h: 1.95, round: 3, part: 'aura-r' },
      ]
  }
}

export const POWER_IDS: readonly PowerId[] = [
  'none',
  'aura',
  'blaze',
  'bolts',
  'ring',
  'sparks',
  'speed',
  'shadow',
  'tide',
  'stone',
  'gust',
]
