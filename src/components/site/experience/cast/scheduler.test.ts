import { describe, expect, it } from 'vitest'

import {
  type SchedulerHost,
  SOLO_GAP_MS,
  SOLO_JITTER_MS,
  startScheduler,
} from './scheduler'

/**
 * These cover the policies that used to be read off a wall clock in
 * `e2e/cast-scheduler.spec.ts`, where each one cost a 20-second window because
 * the only observable scheduler was the one running in a browser. The gates and
 * the one-at-a-time rule answer to an injected clock here and prove the same
 * facts in milliseconds.
 *
 * One policy is deliberately absent. The scheduler stands down while a pointer
 * rests on a member, which it reads through `[data-cast-member]:hover`, and
 * jsdom never matches `:hover`. That case exists for WebKit's own hit testing
 * and stays in the browser for the same reason.
 */

/** What a member is told to hold when no animation carries it. */
const REACTION_MS = 1400

/**
 * A working clock with the wall taken out. Timers fire in due order and a
 * callback arming another inside the same advance is honoured, which is the
 * whole of what a self-rescheduling loop needs from one.
 */
const fakeClock = () => {
  const timers = new Map<number, { run: () => void; at: number }>()
  let now = 0
  let nextHandle = 1

  const due = (until: number) =>
    [...timers.entries()]
      .filter(([, timer]) => timer.at <= until)
      .sort(([, one], [, other]) => one.at - other.at)[0]

  return {
    setTimer: (run: () => void, delayMs: number) => {
      const handle = nextHandle
      nextHandle += 1
      timers.set(handle, { run, at: now + delayMs })
      return handle
    },
    clearTimer: (handle: number) => {
      timers.delete(handle)
    },
    advance: (ms: number) => {
      const until = now + ms
      for (let next = due(until); next; next = due(until)) {
        const [handle, timer] = next
        timers.delete(handle)
        now = timer.at
        timer.run()
      }
      now = until
    },
    armed: () => timers.size,
  }
}

const fieldOf = (memberCount: number) => {
  const field = document.createElement('div')
  field.dataset.castField = ''
  for (let index = 0; index < memberCount; index += 1) {
    const member = document.createElement('div')
    member.dataset.castMember = ''
    field.append(member)
  }
  return field
}

const marked = (field: HTMLElement) =>
  field.querySelectorAll('[data-reacting]').length

/**
 * The real reset, so a released slot is observed on the page the way the
 * scheduler's own gate reads it rather than through a double's call count.
 */
const settle = (member: HTMLElement) => {
  delete member.dataset.reacting
}

/**
 * Every gate open and nothing animating, so a caller states only the one term
 * its case is about. `random` reads zero, which takes the jitter out of the gap
 * and lands the choice on the first idle member, so both of the scheduler's
 * draws are pinned without scripting a call sequence.
 */
const hostFor = (
  field: HTMLElement,
  clock: ReturnType<typeof fakeClock>,
  overrides: Partial<SchedulerHost> = {},
): SchedulerHost => ({
  field,
  isWatching: () => true,
  isPageHidden: () => false,
  prefersStillMotion: () => false,
  isReacting: () => false,
  settle,
  random: () => 0,
  setTimer: clock.setTimer,
  clearTimer: clock.clearTimer,
  reactionMs: REACTION_MS,
  ...overrides,
})

describe('the cast scheduler', () => {
  it('should start a member once its first gap has passed', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock))

    clock.advance(SOLO_GAP_MS)

    expect(marked(field)).toBe(1)
  })

  it('should leave the cast alone until that gap has passed', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock))

    clock.advance(SOLO_GAP_MS - 1)

    expect(marked(field)).toBe(0)
  })

  it('should never hold two members at once while one is still animating', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock, { isReacting: () => true }))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(marked(field)).toBe(1)
  })

  it('should release the slot when nothing is left animating', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock))

    clock.advance(SOLO_GAP_MS + REACTION_MS)

    expect(marked(field)).toBe(0)
  })

  it('should hold the slot while an animation is still running', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock, { isReacting: () => true }))

    clock.advance(SOLO_GAP_MS + REACTION_MS)

    expect(marked(field)).toBe(1)
  })

  it('should act again on the gap after a slot is released', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock))

    clock.advance(SOLO_GAP_MS + REACTION_MS)
    // The reaction was spent inside the gap that follows it, so this is the
    // rest of that gap rather than another whole one.
    clock.advance(SOLO_GAP_MS - REACTION_MS)

    expect(marked(field)).toBe(1)
  })

  it('should spread the gap across the jitter rather than fire on the floor', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    // Half the spread, which is a draw `Math.random` can actually make. The
    // source is documented as its shape, and 1 is the one value it never
    // returns, so a test reading it there would index past the idle members.
    const halfSpread = SOLO_GAP_MS + SOLO_JITTER_MS / 2
    startScheduler(hostFor(field, clock, { random: () => 0.5 }))

    clock.advance(halfSpread - 1)
    const early = marked(field)
    clock.advance(1)

    expect({ early, late: marked(field) }).toEqual({ early: 0, late: 1 })
  })

  it('should hold the cast still for a reader who asked for less motion', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock, { prefersStillMotion: () => true }))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(marked(field)).toBe(0)
  })

  it('should stand down while the section is off screen', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock, { isWatching: () => false }))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(marked(field)).toBe(0)
  })

  it('should stand down while the page is hidden', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock, { isPageHidden: () => true }))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(marked(field)).toBe(0)
  })

  it('should go on acting once a closed gate opens again', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    let watching = false
    startScheduler(hostFor(field, clock, { isWatching: () => watching }))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 3)
    watching = true
    clock.advance(SOLO_GAP_MS + SOLO_JITTER_MS)

    expect(marked(field)).toBe(1)
  })

  it('should stand down while a pet is mid-reaction', () => {
    const field = fieldOf(3)
    const pet = document.createElement('div')
    pet.dataset.castPet = ''
    pet.dataset.reacting = ''
    field.append(pet)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(
      field.querySelectorAll('[data-cast-member][data-reacting]'),
    ).toHaveLength(0)
  })

  it('should do nothing on a field holding no members', () => {
    const field = fieldOf(0)
    const clock = fakeClock()
    startScheduler(hostFor(field, clock))

    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(marked(field)).toBe(0)
  })

  it('should arm no further gap once it is stopped', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    const stop = startScheduler(hostFor(field, clock))

    stop()

    expect(clock.armed()).toBe(0)
  })

  it('should leave the cast alone once it is stopped', () => {
    const field = fieldOf(3)
    const clock = fakeClock()
    const stop = startScheduler(hostFor(field, clock))

    stop()
    clock.advance((SOLO_GAP_MS + SOLO_JITTER_MS) * 6)

    expect(marked(field)).toBe(0)
  })
})
