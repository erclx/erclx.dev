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

export interface Member {
  readonly hat: HatId
  readonly arms: boolean
  /** Rests on the ground with no feet under it, so it reads as one that stopped. */
  readonly seated: boolean
  /** A named pairing from the expression inventory. Defaults to neutral. */
  readonly mood?: MoodId
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

interface Shape {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly ink: 'body' | 'eye'
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

/** Every hat a worker draws from. The lead's antenna is not in it, since that hat marks a role. */
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
