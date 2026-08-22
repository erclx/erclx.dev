/**
 * Draws the agent cast from a cell grid.
 *
 * Three roles carry meaning and the hat carries flavour. A lead takes the
 * antenna and appears once, a worker takes any hat from the pool, and an idle
 * is seated. That split is what lets the pool hold six hats without the cast
 * reading as six species, since every member shares the body, the face, the
 * feet, and the ink.
 *
 * Two constraints are load-bearing and neither is obvious from the drawing.
 * Narrowing a body reads as the same member squeezed rather than as a second
 * one, so members differ by a feature or by whether they stand. And two eyes on
 * a block reads as a saucer, which either limbs or a mouth fixes: this family
 * carries no limbs above the mouth line, so the mouth is what carries it.
 *
 * Every shape is tagged with a part class so a stylesheet moves one limb
 * without the drawing knowing anything about motion.
 */

const CELL = 8
const GRID = 12
const SIZE = CELL * GRID
const RADIUS = 0.25 * CELL

const GROUND = 11.2
const BODY_WIDTH = 7
const BODY_HEIGHT = 5.8
const FOOT_HEIGHT = 1.7

export type HatId =
  | 'none'
  | 'antenna'
  | 'plume'
  | 'halo'
  | 'mane'
  | 'ears'
  | 'earsTall'
  | 'horns'
  | 'crown'
  | 'band'

import {
  eyeCells,
  type Face,
  markCells,
  type MoodId,
  MOODS,
  mouthCells,
} from './faces'
import { gearCells, type GearId } from './gear'
import { petCells, type PetId, type PetMood } from './pets'
import { powerCells, type PowerId, REACH } from './powers'

export interface Member {
  readonly hat: HatId
  readonly arms: boolean
  /** Rests on the ground with no feet under it, so it reads as one that stopped. */
  readonly seated: boolean
  /** A named pairing from the expression inventory. Defaults to neutral. */
  readonly mood?: MoodId
  /** What the member holds, drawn in front of it. */
  readonly gear?: GearId
  /**
   * Which way the member looks. Mirroring happens inside the drawing rather
   * than as a CSS transform, because the wrapper already carries the arrival
   * and the body already carries a behavior, and a third transform on either
   * would overwrite one of them.
   */
  readonly facing?: 1 | -1
}

type PartName =
  | 'body'
  | 'hat'
  | 'hat-l'
  | 'hat-r'
  | 'arm-l'
  | 'arm-r'
  | 'foot-l'
  | 'foot-r'
  | 'eye-l'
  | 'eye-r'
  | 'mouth'
  | 'mark'
  | 'aura-l'
  | 'aura-r'
  | 'aura-t'
  | 'aura-b'
  | 'gear'
  | 'gear-head'
  | 'gear-grip'
  | 'pet-body'
  | 'pet-head'
  | 'pet-foot'
  | 'pet-tail'
  | 'pet-eye'

interface Shape {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly ink: 'body' | 'eye' | 'aura' | 'shade'
  readonly part: PartName
  readonly round?: number
}

const toPixels = (cells: number) => cells * CELL

function drawShape(shape: Shape): string {
  return (
    `<rect class="bn-${shape.part}"` +
    ` x="${toPixels(shape.x)}" y="${toPixels(shape.y)}"` +
    ` width="${toPixels(shape.w)}" height="${toPixels(shape.h)}"` +
    ` rx="${shape.round ?? RADIUS}" fill="var(--cast-${shape.ink})"/>`
  )
}

/**
 * Hats derive from the body's own top edge and width, so none of them holds a
 * coordinate that stops agreeing when the body changes.
 *
 * `horns` loses its step and `crown` merges into a lump below 96px. Both are
 * large-member hats and neither belongs on a scattered small one.
 */
function buildHat(
  hat: HatId,
  left: number,
  top: number,
  width: number,
): Shape[] {
  const solid = (shape: Omit<Shape, 'ink'>): Shape => ({
    ...shape,
    ink: 'body',
  })
  const inset = width * 0.16
  const center = GRID / 2

  switch (hat) {
    case 'none':
      return []
    case 'antenna':
      return [
        solid({ x: center - 0.3, y: top - 1.5, w: 0.6, h: 1.5, part: 'hat' }),
        solid({ x: center - 0.95, y: top - 2.4, w: 1.9, h: 1, part: 'hat' }),
      ]
    // Three lead hats, and none of them joins the worker pool. The antenna
    // marks a role and carries almost no mass, which is measurable: the lead
    // ranked second by painted area behind a horned member a sixth larger than
    // him, and a role marker that weighs nothing cannot make a figure read as
    // the lead. Each of these keeps the antenna's stalk so the role still reads,
    // and adds the weight it never had.
    case 'plume':
      return [
        solid({ x: center - 0.35, y: top - 1.9, w: 0.7, h: 1.9, part: 'hat' }),
        solid({ x: center - 1.0, y: top - 3.0, w: 2.0, h: 1.1, part: 'hat' }),
        solid({ x: left + 0.4, y: top - 1.4, w: 1.0, h: 1.5, part: 'hat-l' }),
        solid({ x: left + 1.6, y: top - 2.1, w: 1.0, h: 2.2, part: 'hat-l' }),
        solid({ x: left + 4.4, y: top - 2.1, w: 1.0, h: 2.2, part: 'hat-r' }),
        solid({ x: left + 5.6, y: top - 1.4, w: 1.0, h: 1.5, part: 'hat-r' }),
      ]
    // A bar held clear of the head on two posts. The only hat in the family
    // that does not touch the body, which is what makes it read as worn rather
    // than as grown.
    case 'halo':
      return [
        solid({
          x: left + 0.2,
          y: top - 3.1,
          w: width - 0.4,
          h: 1.0,
          part: 'hat',
        }),
        solid({ x: center - 1.9, y: top - 2.1, w: 0.8, h: 1.2, part: 'hat-l' }),
        solid({ x: center + 1.1, y: top - 2.1, w: 0.8, h: 1.2, part: 'hat-r' }),
        solid({ x: center - 0.35, y: top - 1.6, w: 0.7, h: 1.6, part: 'hat' }),
        solid({ x: center - 0.9, y: top - 2.3, w: 1.8, h: 0.9, part: 'hat' }),
      ]
    // A graduated crest, tallest at the centre. Heaviest of the three, and the
    // one that changes the silhouette rather than sitting on top of it.
    case 'mane':
      return [
        solid({
          x: left + 0.3,
          y: top - 1.0,
          w: width - 0.6,
          h: 1.1,
          part: 'hat',
        }),
        solid({ x: left + 0.5, y: top - 2.2, w: 0.9, h: 1.4, part: 'hat-l' }),
        solid({ x: left + 1.8, y: top - 3.0, w: 0.9, h: 2.2, part: 'hat-l' }),
        solid({ x: center - 0.45, y: top - 3.6, w: 0.9, h: 2.8, part: 'hat' }),
        solid({ x: left + 4.3, y: top - 3.0, w: 0.9, h: 2.2, part: 'hat-r' }),
        solid({ x: left + 5.6, y: top - 2.2, w: 0.9, h: 1.4, part: 'hat-r' }),
      ]
    case 'ears':
      return [
        solid({ x: left + inset, y: top - 1.1, w: 1.5, h: 1.2, part: 'hat-l' }),
        solid({
          x: left + width - inset - 1.5,
          y: top - 1.1,
          w: 1.5,
          h: 1.2,
          part: 'hat-r',
        }),
      ]
    case 'earsTall':
      return [
        solid({ x: left + inset, y: top - 2.6, w: 1.3, h: 2.7, part: 'hat-l' }),
        solid({
          x: left + width - inset - 1.3,
          y: top - 2.6,
          w: 1.3,
          h: 2.7,
          part: 'hat-r',
        }),
      ]
    // Stepped outward rather than tapered, since a diagonal is the one thing
    // this grammar has none of.
    case 'horns':
      return [
        solid({ x: left + inset, y: top - 1.2, w: 1.3, h: 1.3, part: 'hat-l' }),
        solid({
          x: left + inset - 0.8,
          y: top - 2.2,
          w: 1.1,
          h: 1.1,
          part: 'hat-l',
        }),
        solid({
          x: left + width - inset - 1.3,
          y: top - 1.2,
          w: 1.3,
          h: 1.3,
          part: 'hat-r',
        }),
        solid({
          x: left + width - inset + 0.5,
          y: top - 2.2,
          w: 1.1,
          h: 1.1,
          part: 'hat-r',
        }),
      ]
    case 'crown':
      return [
        solid({
          x: left + inset,
          y: top - 0.9,
          w: width - inset * 2,
          h: 1,
          part: 'hat',
        }),
        ...[0, 1, 2].map((index) =>
          solid({
            x: left + inset + 0.35 + index * ((width - inset * 2 - 1.6) / 2),
            y: top - 1.9,
            w: 0.9,
            h: 1.1,
            part: 'hat' as const,
          }),
        ),
      ]
    case 'band':
      return [
        solid({ x: left + 0.6, y: top - 1, w: width - 1.2, h: 1, part: 'hat' }),
        solid({ x: left - 0.9, y: top - 0.6, w: 1.5, h: 2.4, part: 'hat-l' }),
        solid({
          x: left + width - 0.6,
          y: top - 0.6,
          w: 1.5,
          h: 2.4,
          part: 'hat-r',
        }),
      ]
  }
}

export function renderMember(member: Member): string {
  const center = GRID / 2
  const footHeight = member.seated ? 0 : FOOT_HEIGHT
  const bodyBottom = GROUND - footHeight
  const bodyTop = bodyBottom - BODY_HEIGHT
  const left = center - BODY_WIDTH / 2

  const shapes: Shape[] = [...buildHat(member.hat, left, bodyTop, BODY_WIDTH)]

  if (member.arms) {
    // Below the mouth line. Level with the eyes they read as a second pair of
    // ears, which is the slot the hats need.
    const armTop = bodyTop + BODY_HEIGHT * 0.56
    shapes.push({
      x: left - 1.1,
      y: armTop,
      w: 1.1,
      h: 2,
      ink: 'body',
      part: 'arm-l',
    })
    shapes.push({
      x: left + BODY_WIDTH,
      y: armTop,
      w: 1.1,
      h: 2,
      ink: 'body',
      part: 'arm-r',
    })
  }

  if (!member.seated) {
    shapes.push({
      x: left + 0.9,
      y: bodyBottom,
      w: 1.9,
      h: FOOT_HEIGHT,
      ink: 'body',
      part: 'foot-l',
    })
    shapes.push({
      x: left + BODY_WIDTH - 2.8,
      y: bodyBottom,
      w: 1.9,
      h: FOOT_HEIGHT,
      ink: 'body',
      part: 'foot-r',
    })
  }

  shapes.push({
    x: left,
    y: bodyTop,
    w: BODY_WIDTH,
    h: BODY_HEIGHT,
    ink: 'body',
    part: 'body',
    round: RADIUS * 2.4,
  })

  shapes.push(...faceShapes(member.mood ?? 'neutral', center, bodyTop, left))

  // Last, so a held item passes in front of the arm holding it.
  shapes.push(
    ...gearCells(member.gear ?? 'none').map((cell) => ({
      x: cell.x,
      y: cell.y,
      w: cell.w,
      h: cell.h,
      ink: cell.ink ?? ('body' as const),
      part: cell.part,
      round: cell.round,
    })),
  )

  const drawn = shapes.map(drawShape).join('')
  const body =
    member.facing === -1
      ? `<g transform="translate(${SIZE} 0) scale(-1 1)">${drawn}</g>`
      : drawn

  return (
    `<svg class="bn" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true" focusable="false">` +
    body +
    `</svg>`
  )
}

/**
 * The power layer, drawn on the member's own grid and stacked behind it.
 *
 * Its own drawing rather than part of the member, for two reasons that are not
 * about the shapes. A power needs its own clock, since an aura pulses while the
 * body is doing something else, and a single SVG carrying both would make one
 * animation fight the other. And a candidate power can then be swapped without
 * re-rendering the member, which is what lets the whole vocabulary be served
 * live for a pick.
 *
 * Gear stays inside the member for the same test read the other way: it moves
 * with the hand that holds it, so it has no clock of its own to want.
 *
 * The ink is `aura` rather than the body's. Drawn in the body fill a power
 * merges with the silhouette and reads as anatomy: the flanking tongues became
 * a second pair of ears and the standing shadow became a lump on the back.
 */
/**
 * A companion, drawn on the member family's own grid so the two read as one
 * page. It takes no power layer and no gear: a pet that emits is a member, and
 * the whole point of the family is that it is not one.
 */
export function renderPet(
  pet: PetId,
  mood: PetMood,
  facing: 1 | -1 = 1,
): string {
  const drawn = petCells(pet, mood)
    .map((cell) =>
      drawShape({
        x: cell.x,
        y: cell.y,
        w: cell.w,
        h: cell.h,
        ink: cell.ink,
        part: cell.part,
        round: cell.round,
      }),
    )
    .join('')

  return (
    `<svg class="bn" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true" focusable="false">` +
    (facing === -1
      ? `<g transform="translate(${SIZE} 0) scale(-1 1)">${drawn}</g>`
      : drawn) +
    `</svg>`
  )
}

/**
 * How far the power layer reaches past the member, as a share of the member's
 * own size. Placement adds it to a cluster's gap so a power cannot cross the
 * reading column, and the stylesheet reads it to size the layer, so the two
 * cannot disagree. Measured rather than assumed: the layer overlapped the
 * column by 10px on the 88px member before the gap accounted for it.
 */
export const POWER_OVERHANG = REACH / GRID

export function renderPower(power: PowerId, facing: 1 | -1 = 1): string {
  const drawn = powerCells(power)
    .map((cell) =>
      drawShape({
        x: cell.x,
        y: cell.y,
        w: cell.w,
        h: cell.h,
        ink: cell.ink ?? 'aura',
        part: cell.part,
        round: cell.round,
      }),
    )
    .join('')

  // The viewBox is padded by the reach on every side and the layer's own box
  // grows to match, so the member's grid still maps to the member's own pixels.
  // Scaling the drawing down inside a box with no padding would shrink the figure the
  // power is drawn against, which is the one thing that has to stay fixed.
  const pad = REACH * CELL
  const span = SIZE + pad * 2

  return (
    `<svg class="bn bn-power" viewBox="${-pad} ${-pad} ${span} ${span}" aria-hidden="true" focusable="false">` +
    (facing === -1
      ? `<g transform="translate(${SIZE} 0) scale(-1 1)">${drawn}</g>`
      : drawn) +
    `</svg>`
  )
}

/**
 * Every hat a worker draws from. The lead's own hats are not in it, since those
 * mark a role rather than flavour.
 */
export const HAT_POOL: readonly HatId[] = [
  'none',
  'ears',
  'band',
  'horns',
  'crown',
  'earsTall',
]

/**
 * The face, assembled from the expression inventory rather than drawn here.
 *
 * Each slot is laid out in its own box and the inventory returns cells in units
 * of that box, so a new eye or mouth is added there without this function
 * knowing it exists.
 */
function faceShapes(
  mood: MoodId,
  center: number,
  bodyTop: number,
  left: number,
): Shape[] {
  const face: Face = MOODS[mood]
  const shapes: Shape[] = []

  const eyeSize = BODY_WIDTH * 0.17
  const eyeTop = bodyTop + BODY_HEIGHT * 0.32
  const eyeOffset = BODY_WIDTH * 0.21

  for (const side of [-1, 1] as const) {
    const originX = center + side * eyeOffset - eyeSize / 2
    for (const cell of eyeCells(face.eyes, side)) {
      shapes.push({
        x: originX + cell.x * eyeSize,
        y: eyeTop + cell.y * eyeSize,
        w: cell.w * eyeSize,
        h: cell.h * eyeSize,
        ink: 'eye',
        part: side === -1 ? 'eye-l' : 'eye-r',
        round: cell.round,
      })
    }
  }

  const mouthWidth = BODY_WIDTH * 0.26
  const mouthOriginX = center - mouthWidth / 2
  const mouthTop = bodyTop + BODY_HEIGHT * 0.56
  for (const cell of mouthCells(face.mouth)) {
    shapes.push({
      x: mouthOriginX + cell.x * mouthWidth,
      y: mouthTop + cell.y * mouthWidth,
      w: cell.w * mouthWidth,
      h: cell.h * mouthWidth,
      ink: 'eye',
      part: 'mouth',
      round: cell.round ?? 1,
    })
  }

  // Beside the head rather than on it, in body ink, so it reads as something in
  // the air rather than as a hole cut in the drawing.
  //
  // The scale was 0.42 and the marks that carry internal structure lost it: a
  // bolt read as a squiggle and a spiral as two squares. A mark is a symbol
  // rather than a detail, so it is sized to be read rather than to be noticed.
  const markScale = BODY_WIDTH * 0.56
  const markX = left + BODY_WIDTH - markScale * 0.18
  const markY = bodyTop - markScale * 0.42
  for (const cell of markCells(face.mark)) {
    shapes.push({
      x: markX + cell.x * markScale,
      y: markY + cell.y * markScale,
      w: cell.w * markScale,
      h: cell.h * markScale,
      ink: 'body',
      part: 'mark',
      round: cell.round,
    })
  }

  return shapes
}
