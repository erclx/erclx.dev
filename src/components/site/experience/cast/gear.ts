/**
 * The gear vocabulary: what a member holds, drawn in front of it.
 *
 * A held item is a slot rather than a hat because the two answer different
 * questions. A hat says which of three roles a member has and is the only thing
 * separating a lead from a worker, so loading it with a sword would spend the
 * one signal the cast has for role on flavour instead. Gear says what a member
 * is doing, which is the thing the section has never been able to say.
 *
 * Cells are in grid units, the same 12 by 12 the body uses, and every item is
 * drawn on the right of the member. The whole drawing mirrors for a member
 * facing the other way, so nothing here needs a side.
 *
 * Items reach the arm line rather than the head, because arms sit below the
 * mouth in this family and an item level with the eyes reads as a second hat.
 * Strokes are 0.7 cells or wider for the reason `powers.ts` records.
 */

export type GearId =
  | 'none'
  | 'sword'
  | 'shield'
  | 'spear'
  | 'staff'
  | 'keyboard'
  | 'mug'
  | 'orb'
  | 'banner'
  | 'wrench'

export interface GearCell {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly round?: number
  /**
   * Which piece of the item this is, so a stylesheet can swing a blade without
   * moving the hand that holds it.
   */
  readonly part: 'gear' | 'gear-head' | 'gear-grip'
  /**
   * An item held clear of the silhouette reads in the body's own fill. One
   * overlapping the body does not: the keyboard sat across the chest in body
   * ink and rendered as nothing at all, and the shield's rim disappeared into
   * its own plate. Those take a contrasting ink instead.
   */
  readonly ink?: 'body' | 'aura' | 'shade'
}

/** Where the arms reach on the right, so an item meets a hand rather than floating beside one. */
const ARM_RIGHT = 10.6

export function gearCells(id: GearId): readonly GearCell[] {
  switch (id) {
    case 'none':
      return []

    // Held high and slightly forward, which is a ready stance rather than a
    // salute. Point up: a blade angled down reads as one being put away.
    case 'sword':
      return [
        {
          x: ARM_RIGHT - 0.05,
          y: 2.4,
          w: 0.8,
          h: 5.0,
          round: 1,
          part: 'gear-head',
        },
        { x: ARM_RIGHT - 0.85, y: 7.3, w: 2.2, h: 0.7, round: 2, part: 'gear' },
        { x: ARM_RIGHT, y: 7.9, w: 0.7, h: 1.2, round: 2, part: 'gear-grip' },
      ]

    // A plate with a rim, which is what separates it from a plain box at the
    // size this ships. Without the rim it reads as luggage.
    case 'shield':
      return [
        { x: 9.7, y: 5.4, w: 2.3, h: 3.4, round: 3, part: 'gear-head' },
        {
          x: 10.25,
          y: 6.1,
          w: 1.2,
          h: 0.75,
          round: 2,
          part: 'gear',
          ink: 'shade',
        },
        {
          x: 10.25,
          y: 7.2,
          w: 1.2,
          h: 0.75,
          round: 2,
          part: 'gear',
          ink: 'shade',
        },
      ]

    // Taller than the member and thinner than a sword, so the two never read as
    // the same item at a glance.
    case 'spear':
      return [
        {
          x: ARM_RIGHT + 0.05,
          y: 2.6,
          w: 0.7,
          h: 7.4,
          round: 1,
          part: 'gear-grip',
        },
        {
          x: ARM_RIGHT - 0.15,
          y: 1.5,
          w: 1.1,
          h: 1.3,
          round: 1,
          part: 'gear-head',
        },
        {
          x: ARM_RIGHT + 0.05,
          y: 0.6,
          w: 0.7,
          h: 1.1,
          round: 1,
          part: 'gear-head',
        },
      ]

    // The magician's answer to a spear: the weight is at the top and it is a
    // shape rather than a point.
    case 'staff':
      return [
        {
          x: ARM_RIGHT + 0.05,
          y: 3.4,
          w: 0.7,
          h: 6.6,
          round: 1,
          part: 'gear-grip',
        },
        {
          x: ARM_RIGHT - 0.6,
          y: 1.8,
          w: 2.0,
          h: 2.0,
          round: 6,
          part: 'gear-head',
        },
      ]

    // Across the front at the arm line, which is the only item that says a
    // member is working rather than fighting. Keys rather than a slab: a plain
    // bar there reads as a table edge.
    case 'keyboard':
      return [
        {
          x: 1.5,
          y: 8.5,
          w: 9.0,
          h: 1.4,
          round: 2,
          part: 'gear-head',
          ink: 'shade',
        },
        {
          x: 2.3,
          y: 8.85,
          w: 0.85,
          h: 0.75,
          round: 1,
          part: 'gear',
          ink: 'aura',
        },
        {
          x: 3.6,
          y: 8.85,
          w: 0.85,
          h: 0.75,
          round: 1,
          part: 'gear',
          ink: 'aura',
        },
        {
          x: 4.9,
          y: 8.85,
          w: 0.85,
          h: 0.75,
          round: 1,
          part: 'gear',
          ink: 'aura',
        },
        {
          x: 6.2,
          y: 8.85,
          w: 0.85,
          h: 0.75,
          round: 1,
          part: 'gear',
          ink: 'aura',
        },
        {
          x: 7.5,
          y: 8.85,
          w: 0.85,
          h: 0.75,
          round: 1,
          part: 'gear',
          ink: 'aura',
        },
        {
          x: 8.8,
          y: 8.85,
          w: 0.85,
          h: 0.75,
          round: 1,
          part: 'gear',
          ink: 'aura',
        },
      ]

    case 'mug':
      return [
        { x: 9.6, y: 7.2, w: 1.8, h: 2.0, round: 2, part: 'gear-head' },
        { x: 11.2, y: 7.7, w: 0.7, h: 1.0, round: 3, part: 'gear' },
        {
          x: 10.0,
          y: 7.5,
          w: 1.0,
          h: 0.7,
          round: 2,
          part: 'gear',
          ink: 'shade',
        },
      ]

    // Held out rather than up, and round, so it reads as something being
    // carried carefully rather than as a weapon.
    case 'orb':
      return [
        { x: 9.9, y: 6.4, w: 2.1, h: 2.1, round: 8, part: 'gear-head' },
        { x: 10.5, y: 8.5, w: 0.9, h: 0.7, round: 2, part: 'gear-grip' },
      ]

    // A pole with a cloth, which is the one item that can carry motion on its
    // own without the member moving at all.
    case 'banner':
      return [
        { x: 9.7, y: 2.0, w: 0.7, h: 8.0, round: 1, part: 'gear-grip' },
        { x: 10.4, y: 2.3, w: 1.6, h: 1.6, round: 1, part: 'gear-head' },
        { x: 10.4, y: 4.1, w: 1.0, h: 0.8, round: 1, part: 'gear-head' },
      ]

    case 'wrench':
      return [
        { x: ARM_RIGHT, y: 5.2, w: 0.8, h: 3.6, round: 2, part: 'gear-grip' },
        {
          x: ARM_RIGHT - 0.5,
          y: 4.1,
          w: 1.8,
          h: 1.3,
          round: 1,
          part: 'gear-head',
        },
        { x: ARM_RIGHT - 0.1, y: 4.1, w: 0.8, h: 0.7, round: 1, part: 'gear' },
      ]
  }
}

export const GEAR_IDS: readonly GearId[] = [
  'none',
  'sword',
  'shield',
  'spear',
  'staff',
  'keyboard',
  'mug',
  'orb',
  'banner',
  'wrench',
]
