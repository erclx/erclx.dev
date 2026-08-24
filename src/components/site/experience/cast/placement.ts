/**
 * Where every figure stands, and the arithmetic that keeps it inside the margin.
 *
 * Its own module rather than the component's frontmatter, because the guards
 * have to read it. A cluster's own box is what the margin check measures, and
 * the defects this domain has actually shipped live inside that box: two
 * members whose power layers met and read as one shape, and a pet placed where
 * it would have widened the cluster. Neither is visible to a check that sees
 * only the cluster, and neither needs a browser to find.
 *
 * Placement is by cluster rather than by figure. A cluster anchors to the
 * reading column's own edge and everything inside it sits at an offset from
 * that origin, so a pair keeps its relationship to itself while the page
 * resizes. Figures holding page positions could not express a pair at all: two
 * standing near each other would be a coincidence of two literals rather than a
 * group, and nothing would keep it true.
 */

import type { HatId } from './cast'
import { POWER_OVERHANG } from './cast'
import type { MoodId } from './faces'
import type { PetId, PetMood } from './pets'
import type { PowerId } from './powers'

interface ClusterMember {
  readonly hat: HatId
  readonly seated: boolean
  readonly mood: MoodId
  readonly size: number
  /** Offset from the cluster origin, outward and downward. */
  readonly dx: number
  readonly dy: number
  readonly facing: 1 | -1
  /** Shifts this member's whole clock, which is what makes a pair alternate. */
  readonly phase: number
  /**
   * The mood a tap changes it to, held for as long as the reaction runs.
   *
   * A reaction alone answers a pointer with movement and leaves the face
   * saying what it said before, so tapping the sleeping one shook a sleeping
   * member. Changing the mood is what makes a tap an event rather than a
   * gesture, and it is the only thing on this surface a reader can cause a
   * state change with.
   */
  readonly tapMood?: MoodId
  /**
   * Whether this member draws its resting mood's mark, and its tap mood's.
   *
   * Both default off. Every mood in the vocabulary declares a mark, so binding
   * one to a member used to hand it that mark whether or not it said anything:
   * seven of seven emitted one on tap and five of seven standing still, which
   * is what made the margin read as one gesture repeated rather than as a cast.
   * Three are drawn now, on three different members, in one state each.
   */
  readonly hasMark?: boolean
  readonly hasTapMark?: boolean
  /**
   * What the member emits. Drawn as its own layer behind the body, and the
   * same drawing whether the member is resting or reacting: a power is what a
   * member is rather than what it just did, so swapping it on a tap read as
   * the figure becoming somebody else for a second.
   */
  readonly power?: PowerId
}

/**
 * A companion standing near a member. It carries no mood, no power and no
 * reaction: a pet that answers a pointer is a member, and the family exists to
 * not be one.
 */
export interface ClusterPet {
  readonly kind: PetId
  readonly mood: PetMood
  readonly size: number
  readonly dx: number
  readonly dy: number
  readonly facing: 1 | -1
}

export interface Cluster {
  readonly side: 'left' | 'right'
  /** Down the section, as a percentage of its height. */
  readonly top: number
  /** Outward from the column edge. */
  readonly gap: number
  readonly delay: number
  /**
   * Shifts every clock inside this cluster. Member phase alone pulls a pair out of
   * step with itself and leaves the pairs in step with each other, which is the
   * state the operator read as two groups moving as one.
   */
  readonly phase: number
  readonly members: readonly ClusterMember[]
  readonly pets?: readonly ClusterPet[]
}

// A pair is offset down as well as across, and the vertical figure is what
// carries it. Both pairs were laid out when a member was its own box, so adding
// a power layer that reaches a sixth of the member past that box put the lead's
// flames through the member beside him and the two read as one shape. Their
// bodies overlapped 16px and 12px.
//
// Separating across is not available: measured at 1280 the left cluster has 2px
// of headroom before it meets the rail, so any `dx` that clears the bodies puts
// the cluster into it. Down costs nothing, since a cluster's height is bounded
// by nothing.
//
// Two pairs and three singles. A cast that is all pairs reads as staged and a
// cast that is all singles is what the operator asked to move away from, so the
// section carries both and a reader meets a pair twice rather than five times.
//
// No member names a behavior. What each one does follows from its mood, per
// `TEMPERAMENTS`, because a placement free to pick its own motion produces a
// happy face tilting like a disappointed one.
//
// Every mark in the cast appears once. A mood is a pairing of eyes, mouth, and
// mark, and reusing one across members makes two of them answer a pointer with
// the same gesture however different their faces are, which is what the shared
// three dots did to five of them. `e2e/cast.spec.ts` fails a mark used more
// than twice.
//
// The pairs read as beats rather than as states. Determined becomes unleashed,
// working becomes triumphant, thinking becomes charged, frustrated becomes
// exasperated, flustered becomes dizzy, and the sleeping one wakes surprised.
export const clusters: readonly Cluster[] = [
  {
    side: 'left',
    top: 15,
    gap: 8,
    delay: 0,
    phase: 0,
    members: [
      {
        hat: 'antenna',
        seated: false,
        mood: 'assured',
        size: 72,
        power: 'blaze',
        dx: 0,
        dy: 0,
        facing: 1,
        phase: 0,
        tapMood: 'surging',
      },
      {
        hat: 'ears',
        seated: false,
        mood: 'playful',
        size: 54,
        power: 'sparks',
        dx: 56,
        dy: 88,
        facing: -1,
        phase: 1500,
        tapMood: 'starstruck',
        // Sparkle eyes over a smile read as warm and not as smitten, so the
        // heart is the only thing naming what this one is actually feeling.
        hasTapMark: true,
      },
    ],
    pets: [
      { kind: 'ember', mood: 'alert', size: 44, dx: 20, dy: 155, facing: 1 },
    ],
  },
  {
    side: 'right',
    top: 29,
    gap: 22,
    delay: 220,
    phase: 900,
    members: [
      {
        hat: 'band',
        seated: false,
        mood: 'pumped',
        size: 64,
        power: 'speed',
        dx: 0,
        dy: 0,
        facing: -1,
        phase: 0,
        tapMood: 'revved',
      },
    ],
    pets: [
      { kind: 'spark', mood: 'alert', size: 44, dx: 24, dy: 78, facing: -1 },
    ],
  },
  {
    side: 'right',
    top: 50,
    gap: 12,
    delay: 480,
    phase: 2100,
    members: [
      // `horns` loses its step below 96px, so the one member carrying it is the
      // one large member in the cast.
      {
        hat: 'horns',
        seated: false,
        mood: 'frustrated',
        size: 88,
        power: 'bolts',
        dx: 0,
        dy: 0,
        facing: 1,
        phase: 0,
        tapMood: 'exasperated',
      },
      {
        hat: 'none',
        seated: false,
        mood: 'flustered',
        size: 56,
        power: 'gust',
        dx: 76,
        dy: 100,
        facing: -1,
        phase: 1500,
        tapMood: 'dizzy',
      },
    ],
  },
  {
    side: 'left',
    top: 66,
    gap: 30,
    delay: 700,
    phase: 3400,
    members: [
      {
        hat: 'crown',
        seated: false,
        mood: 'rapt',
        size: 68,
        power: 'ring',
        dx: 0,
        dy: 0,
        facing: 1,
        phase: 0,
        tapMood: 'composed',
        // Dot eyes over an open mouth read as blank on their own. The note is
        // what turns that into humming.
        hasTapMark: true,
      },
    ],
  },
  {
    // The idle one does the least, which is what the role is for.
    side: 'right',
    top: 79,
    gap: 34,
    delay: 880,
    phase: 4700,
    members: [
      {
        hat: 'ears',
        seated: true,
        mood: 'asleep',
        size: 64,
        power: 'tide',
        dx: 0,
        dy: 0,
        facing: -1,
        phase: 0,
        // Closed eyes alone could be a member that is content, so this is the
        // one mark carrying a state the face cannot. It is also the only one
        // drawn at rest, and the tap takes it away rather than replacing it,
        // which is what waking up looks like.
        hasMark: true,
        tapMood: 'surprised',
      },
    ],
    // One per cluster, each a different creature. Below rather than beside, so
    // no cluster's width moves and its headroom against the rail or the dock is
    // untouched. The pair fix learned the same thing: across is the axis with a
    // margin at the end of it.
    pets: [
      { kind: 'dog', mood: 'resting', size: 44, dx: 26, dy: 72, facing: -1 },
    ],
  },
]

/**
 * A flat index across every cluster, so a guard can name the member that failed
 * and a candidate arm can address one. Placement is by cluster and both of
 * those are by member, which are two questions about the same list. It stays
 * whether or not an arm is being served: without it `.claude/.tmp` measurements
 * fell back to counting position in a NodeList and reported nothing at all when
 * the selector went stale.
 */
export const memberIndex = (cluster: Cluster, member: ClusterMember) => {
  let index = 0
  for (const each of clusters) {
    for (const one of each.members) {
      if (each === cluster && one === member) return index
      index += 1
    }
  }
  return index
}

/**
 * As wide as its furthest member reaches, that member's own power included.
 * Taking the cluster's largest overhang and adding it to whichever member sits
 * furthest out reserves space for a power on a member that is not there, which
 * cost the 88px cluster 8px it did not need.
 */
export const clusterWidth = (cluster: Cluster) =>
  Math.max(
    ...cluster.members.map(
      (member) => member.dx + member.size * (1 + POWER_OVERHANG),
    ),
    ...(cluster.pets ?? []).map((pet) => pet.dx + pet.size),
  )

/**
 * The declared gap plus what the innermost member's power reaches, so the gap
 * states clearance from the reading column and the reach stays a property of
 * the drawing. Held as two literals they drift the moment either moves, and the
 * drift is a power painted over prose with the cluster guard still passing.
 *
 * The innermost member rather than the largest. Only the figure nearest the
 * column reaches toward it, so taking the cluster's widest overhang reserves
 * room for a power on a member that is not there, which is the same
 * over-reservation `clusterWidth` was changed away from and which stayed on
 * this axis. It costs nothing today because the innermost member is the largest
 * in all five clusters, and that is a coincidence of the current placement
 * rather than a property of one.
 */
export const clusterGap = (cluster: Cluster) => {
  const innermost = cluster.members.reduce((nearest, member) =>
    member.dx < nearest.dx ? member : nearest,
  )
  return cluster.gap + innermost.size * POWER_OVERHANG
}
