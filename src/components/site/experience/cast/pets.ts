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
 * A bird was drawn twice and cut, and the reason bounds what else can join this
 * family. A quadruped silhouette survives 44px because four feet under a low
 * body is the whole of it, where a bird needs a beak, a wing and a tail to read
 * as one at all, and three features inside twelve cells at 3.7px each come out
 * as one shape with a dark slot in it. The first draft also put a crest on top,
 * which read as the antenna that marks the lead. A second pet is available at a
 * larger ship size, and at that size it stops reading as a pet.
 */

export type PetId = 'dog'

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
      : // A bar rather than a smaller dot. Shrinking a dot to say closed reads
        // as a smaller open eye at this size, where a bar reads as a lid.
        {
          x: at.x - 0.15,
          y: at.y + 0.3,
          w: 1.25,
          h: 0.5,
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
  }
}

export const PET_IDS: readonly PetId[] = ['dog']
