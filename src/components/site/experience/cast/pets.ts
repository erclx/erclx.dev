/**
 * The companions that keep a lone member company.
 *
 * A pet is its own drawing rather than a small member, and the reason is the
 * rule the member family already carries: members differ by a feature or by
 * whether they stand, never by width, because a narrowed body reads as the same
 * member squeezed. Shrinking a member produces exactly that, so a pet has to
 * differ in what it is made of. Four feet, ears or a crest, a tail, and no arms
 * is enough that nothing here reads as an agent at half scale.
 *
 * They share the grid, the cell size, the ink and the stepped grammar, so the
 * two families still read as one page. `#d4a574` is the dog's tan on the about
 * surface, which is the figure a pet here is nearest to.
 *
 * Strokes are 0.9 cells or wider. A pet ships smaller than any member, so one
 * cell is 3.7px at 44px against the member family's 4.5px at 54, and the 3px
 * floor bites sooner.
 *
 * **One bold feature each, and that is the whole rule.** A bird was drawn twice
 * and cut because it needed three at once, a beak and a wing and a tail, and
 * three features inside twelve cells at 3.7px each come out as one shape with a
 * slot in it. Every creature here carries a low body, legs, and exactly one
 * thing that is large enough to name it from across the page: a flame, a pair
 * of ears, a bulb, a shell. That feature runs at least 2.5 cells in its long
 * direction, which is 9px at ship size, against the 1.4 cells an ear costs.
 *
 * Anything secondary stays under a cell and a half, so it reads as detail once
 * the silhouette has already landed rather than competing to be the thing seen
 * first. The bird's crest broke that twice over: it was secondary and it was
 * also the antenna that marks the lead, so the pet read as a small boss.
 *
 * **Two creatures may not carry the same kind of feature.** A bulb on the back
 * and a shell on the back both read as a mass behind the head, so they were one
 * silhouette drawn twice however different the masses were. The three that ship
 * differ by where the weight sits: a quadruped with none, an up-swept tail, and
 * a pair of tall ears.
 *
 * **A creature defined by more than one appendage does not fit this grid, and a
 * winged dragon is the proof.** It was drawn six times and cut. Each draft
 * failed differently and the sequence is the finding: a one-sided fan read as
 * the tail above, flat wings and a short snout read as a bird, a square head on
 * a square body read as a totem pole, fourteen shapes answering that came out
 * as a tangle, stripping back left the body a plain rectangle, and a taper with
 * a rising tail put two shapes at the same height on one side where they merged
 * into a slab.
 *
 * Two rules survive it. **Detail is not the cure for a shape that does not
 * read**, and **two shapes at the same height on the same side become one
 * shape**. What they add up to is that twelve cells hold a body, a head and one
 * feature, and a dragon needs wings and a neck and a muzzle and a tail at once.
 * The three that ship are compact creatures whose silhouette is a single idea.
 */

export type PetId = 'dog' | 'ember' | 'spark'

/** What the eyes do. A pet carries no mouth, so this is the whole of its face. */
export type PetMood = 'alert' | 'resting'

export interface PetCell {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly round?: number
  readonly ink: 'body' | 'eye'
  readonly part: 'pet-body' | 'pet-head' | 'pet-foot' | 'pet-tail' | 'pet-eye'
}

/** The floor every figure in this domain stands on. */
const GROUND = 11.2

/**
 * How far apart two eyes have to sit, in cells.
 *
 * A resting eye is a lid, which has to be wider than it is tall to read as one,
 * and two lids closer together than their own width merge into a single slot
 * across the face. The dragon's eyes sat 1.0 apart inside a narrow head and
 * rendered as one bar at every size.
 *
 * The lid cannot be made thin instead. One cell is 3.7px at ship size and the
 * floor is 3px, so a lid has almost no height to give up before it stops
 * holding its shape, which is why the fix is spacing rather than weight.
 */
export const EYE_PITCH = 1.6

function eyes(
  mood: PetMood,
  positions: ReadonlyArray<{ x: number; y: number }>,
): PetCell[] {
  return positions.map((at) =>
    mood === 'alert'
      ? {
          x: at.x,
          y: at.y,
          w: 0.95,
          h: 0.95,
          round: 4,
          ink: 'eye' as const,
          part: 'pet-eye' as const,
        }
      : // A lid rather than a smaller dot. Shrinking a dot to say closed reads
        // as a smaller open eye at this size.
        {
          x: at.x - 0.15,
          y: at.y + 0.35,
          w: 1.35,
          h: 0.9,
          round: 2,
          ink: 'eye' as const,
          part: 'pet-eye' as const,
        },
  )
}

export function petCells(id: PetId, mood: PetMood): readonly PetCell[] {
  switch (id) {
    case 'dog':
      return [
        // Wider than tall and sitting low, which is the whole silhouette
        // difference from a member standing upright.
        {
          x: 2.4,
          y: 6.2,
          w: 7.2,
          h: 3.8,
          round: 2.6,
          ink: 'body',
          part: 'pet-body',
        },
        {
          x: 3.0,
          y: 5.0,
          w: 1.4,
          h: 1.4,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 7.6,
          y: 5.0,
          w: 1.4,
          h: 1.4,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 9.5,
          y: 6.6,
          w: 1.7,
          h: 0.95,
          round: 2,
          ink: 'body',
          part: 'pet-tail',
        },
        {
          x: 10.3,
          y: 5.5,
          w: 0.95,
          h: 1.3,
          round: 2,
          ink: 'body',
          part: 'pet-tail',
        },
        ...[3.0, 4.5, 7.0, 8.5].map((x) => ({
          x,
          y: GROUND - 1.2,
          w: 1.2,
          h: 1.2,
          round: 1,
          ink: 'body' as const,
          part: 'pet-foot' as const,
        })),
        ...eyes(mood, [
          { x: 3.9, y: 7.3 },
          { x: 6.9, y: 7.3 },
        ]),
      ]

    // The weight is in the tail, and it sweeps up rather than back. Drawn level
    // with the body it butted against it in the same ink and the pair read as
    // one rectangle with ears, which is the merge the power layer hit for the
    // same reason. Rising above the body's top edge is what breaks the
    // silhouette, since a gap small enough to fit here is 2px and reads as
    // nothing.
    //
    // An earlier draft made this a stepped spine and it read as a dinosaur
    // rather than as something anyone would keep.
    case 'ember':
      return [
        {
          x: 2.8,
          y: 7.2,
          w: 4.2,
          h: 2.8,
          round: 2.6,
          ink: 'body',
          part: 'pet-body',
        },
        {
          x: 3.1,
          y: 5.5,
          w: 1.2,
          h: 1.9,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 5.3,
          y: 5.5,
          w: 1.2,
          h: 1.9,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 6.6,
          y: 7.4,
          w: 1.5,
          h: 1.8,
          round: 2,
          ink: 'body',
          part: 'pet-tail',
        },
        {
          x: 7.2,
          y: 4.2,
          w: 2.9,
          h: 3.6,
          round: 7,
          ink: 'body',
          part: 'pet-tail',
        },
        ...[3.4, 5.4].map((x) => ({
          x,
          y: GROUND - 1.2,
          w: 1.1,
          h: 1.2,
          round: 1,
          ink: 'body' as const,
          part: 'pet-foot' as const,
        })),
        ...eyes(mood, [
          { x: 3.4, y: 7.9 },
          { x: 5.2, y: 7.9 },
        ]),
      ]

    // Tall stepped ears, which is the whole silhouette. The body is deliberately
    // the smallest in the family so the ears carry it.
    case 'spark':
      return [
        {
          x: 3.5,
          y: 7.1,
          w: 4.4,
          h: 2.9,
          round: 2.4,
          ink: 'body',
          part: 'pet-body',
        },
        {
          x: 3.8,
          y: 4.1,
          w: 1.2,
          h: 3.1,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 3.2,
          y: 3.0,
          w: 1.2,
          h: 1.3,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 6.4,
          y: 4.1,
          w: 1.2,
          h: 3.1,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 7.0,
          y: 3.0,
          w: 1.2,
          h: 1.3,
          round: 1,
          ink: 'body',
          part: 'pet-head',
        },
        {
          x: 8.1,
          y: 8.0,
          w: 1.4,
          h: 1.0,
          round: 1,
          ink: 'body',
          part: 'pet-tail',
        },
        ...[4.1, 6.1].map((x) => ({
          x,
          y: GROUND - 1.2,
          w: 1.1,
          h: 1.2,
          round: 1,
          ink: 'body' as const,
          part: 'pet-foot' as const,
        })),
        ...eyes(mood, [
          { x: 4.1, y: 7.9 },
          { x: 6.0, y: 7.9 },
        ]),
      ]
  }
}

export const PET_IDS: readonly PetId[] = ['dog', 'ember', 'spark']
