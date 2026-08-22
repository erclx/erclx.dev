import { describe, expect, it } from 'vitest'

import { EYE_IDS, eyeCells, MOODS, MOUTH_IDS, mouthCells } from './faces'
import { GEAR_IDS, gearCells } from './gear'
import { PET_IDS, petCells } from './pets'
import { clusters, clusterWidth } from './placement'
import { POWER_IDS, powerCells, REACH } from './powers'

/**
 * Every guard here found a real defect while this domain was being built, and
 * every one of them lived in a throwaway script until now. Each is a fact about
 * the drawing or the placement rather than about the rendered page, so none of
 * them needs a browser and all of them run on every commit.
 */

/** The grid every figure is laid out on. */
const GRID = 12
/** The smallest member the cast ships, and the size every pet ships at. */
const SMALLEST_MEMBER = 54
const PET_SIZE = 44
/**
 * Under this a stroke stops holding its shape against the ground. It is the
 * floor `faces.ts` has always claimed was guarded and never was.
 */
const STROKE_FLOOR = 3

const thinnestPx = (
  cells: ReadonlyArray<{ w: number; h: number }>,
  size: number,
) => Math.min(...cells.flatMap((cell) => [cell.w, cell.h])) * (size / GRID)

// An instrument reporting nothing wrong and one reporting nothing at all are
// indistinguishable unless something proves it read a population. Every guard
// below filters a list to the offenders and asserts the result is empty, which
// is exactly the shape that passes hardest when the list is empty too.
describe('the vocabularies under guard', () => {
  it('should carry a population for every guard below to read', () => {
    expect(POWER_IDS.length).toBeGreaterThan(0)
    expect(GEAR_IDS.length).toBeGreaterThan(0)
    expect(PET_IDS.length).toBeGreaterThan(0)
    expect(EYE_IDS.length).toBeGreaterThan(0)
    expect(MOUTH_IDS.length).toBeGreaterThan(0)
    expect(
      clusters.flatMap((cluster) => cluster.members).length,
    ).toBeGreaterThan(0)
    expect(clusters.some((cluster) => cluster.pets?.length)).toBe(true)
    expect(
      clusters.some((cluster) =>
        cluster.members.some((member) => member.power),
      ),
    ).toBe(true)
  })
})

describe('powerCells', () => {
  it('should keep every power cell inside the box its viewBox is padded to', () => {
    const outside = POWER_IDS.flatMap((id) =>
      powerCells(id)
        .filter(
          (cell) =>
            cell.x < -REACH ||
            cell.y < -REACH ||
            cell.x + cell.w > GRID + REACH ||
            cell.y + cell.h > GRID + REACH,
        )
        .map(() => id),
    )

    expect(outside).toEqual([])
  })

  it('should draw no power stroke thinner than the floor on the smallest member', () => {
    const thin = POWER_IDS.filter(
      (id) =>
        powerCells(id).length > 0 &&
        thinnestPx(powerCells(id), SMALLEST_MEMBER) < STROKE_FLOOR,
    )

    expect(thin).toEqual([])
  })
})

describe('gearCells', () => {
  // Gear has no layer of its own, so the member's viewBox clips it and a cell
  // outside the grid is silently cut rather than drawn.
  it('should keep every gear cell inside the member box that clips it', () => {
    const outside = GEAR_IDS.flatMap((id) =>
      gearCells(id)
        .filter(
          (cell) =>
            cell.x < 0 ||
            cell.y < 0 ||
            cell.x + cell.w > GRID ||
            cell.y + cell.h > GRID,
        )
        .map(() => id),
    )

    expect(outside).toEqual([])
  })

  it('should draw no gear stroke thinner than the floor on the smallest member', () => {
    const thin = GEAR_IDS.filter(
      (id) =>
        gearCells(id).length > 0 &&
        thinnestPx(gearCells(id), SMALLEST_MEMBER) < STROKE_FLOOR,
    )

    expect(thin).toEqual([])
  })
})

describe('petCells', () => {
  const shipped = PET_IDS.flatMap((id) =>
    (['alert', 'resting'] as const).map((mood) => ({ id, mood })),
  )

  it('should keep every pet cell inside the box that clips it', () => {
    const outside = shipped.filter(({ id, mood }) =>
      petCells(id, mood).some(
        (cell) =>
          cell.x < 0 ||
          cell.y < 0 ||
          cell.x + cell.w > GRID ||
          cell.y + cell.h > GRID,
      ),
    )

    expect(outside).toEqual([])
  })

  // A pet ships smaller than any member, so one cell buys less and the floor
  // bites sooner.
  it('should draw no stroke thinner than the floor at its own ship size', () => {
    const thin = shipped.filter(
      ({ id, mood }) => thinnestPx(petCells(id, mood), PET_SIZE) < STROKE_FLOOR,
    )

    expect(thin).toEqual([])
  })

  // Two lids closer together than their own width merge into one slot across
  // the face, which reads as a visor rather than as shut eyes. No size check
  // can see it, since each cell clears the floor on its own.
  it('should never let two eyes overlap into a single slot', () => {
    const merged = shipped.filter(({ id, mood }) => {
      const eyes = petCells(id, mood).filter((cell) => cell.part === 'pet-eye')
      return eyes.some((one, index) =>
        eyes
          .slice(index + 1)
          .some((two) => one.x < two.x + two.w && two.x < one.x + one.w),
      )
    })

    expect(merged).toEqual([])
  })
})

describe('eyeCells and mouthCells', () => {
  // The claim `faces.ts` carries: a first pass spaced the steps of each chevron
  // exactly and every one broke into three dots at the smallest size. What
  // keeps them a figure is that adjacent cells overlap, so the guard is
  // connectivity rather than size. A single-cell shape has nothing beside it to
  // separate from and is excluded, which is where an earlier reading of this
  // rule went wrong and reported 30 of 34 parts broken.
  const isConnected = (cells: ReadonlyArray<{ x: number; w: number }>) => {
    if (cells.length < 2) return true
    const sorted = [...cells].sort((one, two) => one.x - two.x)
    // Against the furthest right edge reached so far rather than against the
    // cell immediately before. Two cells sharing an x sort in an order the
    // comparison cannot see, so the previous-cell form reported `swirl` broken
    // or whole depending on which of its two same-x cells landed first.
    let reach = sorted[0].x + sorted[0].w
    for (const cell of sorted.slice(1)) {
      if (cell.x > reach) return false
      reach = Math.max(reach, cell.x + cell.w)
    }
    return true
  }

  it('should hold a stepped figure together rather than breaking it into dots', () => {
    const broken = [
      ...EYE_IDS.filter((id) => !isConnected(eyeCells(id, 1))),
      ...MOUTH_IDS.filter((id) => !isConnected(mouthCells(id))),
    ]

    expect(broken).toEqual([])
  })
})

describe('clusters', () => {
  const members = clusters.flatMap((cluster) => cluster.members)

  // The complaint that started the face pass was that the cast read as one
  // figure repeated, and four of seven members wore the same flat mouth. That
  // is what a reader sees, and pairwise pixel difference could not find it:
  // every pair in this cast lands between 8% and 12% whatever the faces say,
  // because a head is mostly body fill either way.
  it('should give every member its own eyes and its own mouth', () => {
    const eyes = members.map((member) => MOODS[member.mood].eyes)
    const mouths = members.map((member) => MOODS[member.mood].mouth)

    expect(new Set(eyes).size).toBe(members.length)
    expect(new Set(mouths).size).toBe(members.length)
  })

  const body = (figure: { dx: number; dy: number; size: number }) => ({
    left: figure.dx,
    right: figure.dx + figure.size,
    top: figure.dy,
    bottom: figure.dy + figure.size,
  })

  // Every offset in the placement was chosen while a member was its own box, so
  // adding a power layer that reaches past it moved both pairs into each other
  // and nothing reported it. Their bodies overlapped 16px and 12px and each
  // pair read as one shape. The margin check cannot see this: the overlap is
  // inside the cluster it measures.
  //
  // Bodies rather than painted extents. Power layers are meant to graze, and
  // the shipped pairs still meet across 3.6% and 7.7% of the smaller figure
  // with no defect in it. What made a pair read as one shape was the two solid
  // silhouettes touching, so that is the line to hold.
  it('should never let two figures of one cluster overlap body to body', () => {
    const meeting = clusters.flatMap((cluster) => {
      const figures = [...cluster.members, ...(cluster.pets ?? [])]
      return figures.flatMap((one, index) =>
        figures.slice(index + 1).filter((two) => {
          const a = body(one)
          const b = body(two)
          return (
            a.left < b.right &&
            b.left < a.right &&
            a.top < b.bottom &&
            b.top < a.bottom
          )
        }),
      )
    })

    expect(meeting).toEqual([])
  })

  // A pet is placed below its member rather than beside it so the cluster's
  // width does not move, which is what keeps its headroom against the rail and
  // the dock untouched. At 1280 the left cluster holds 2px of that headroom.
  it('should let no pet widen the cluster it stands in', () => {
    const widened = clusters.filter((cluster) => {
      if (!cluster.pets?.length) return false
      const membersOnly = clusterWidth({ ...cluster, pets: [] })
      return clusterWidth(cluster) > membersOnly
    })

    expect(widened).toEqual([])
  })
})
