/**
 * One member acts on its own every few seconds, and never two at once.
 *
 * `canon/ARCHITECTURE.md` records expressive motion being moved to a pointer on
 * the reading that a margin full of characters performing at a reader who has
 * not looked at them is the ambient motion problem restated. This does not
 * reverse that. The band `canon/DESIGN.md` bars is *sustained* motion with no
 * fixed reference, at 4 to 11px per second, and every term here is a reaction
 * that crosses it in a fraction of its own cycle. What changes is who triggers
 * one, not what a trigger runs.
 *
 * So the whole of it is a scheduler over the reactions that already exist. It
 * writes the same `data-reacting` a tap writes and the same `animationend`
 * clears it, which is why no keyframe and no selector moved for this.
 */

export const SOLO_GAP_MS = 5200
/** Spread, so the cast never settles into a countable rhythm. */
export const SOLO_JITTER_MS = 2600

/**
 * Everything the loop reads that a simulated DOM cannot answer for. The page's
 * own state stays on the page: `field` is queried live rather than tracked, so
 * the pointer and the in-flight member are read where a reader leaves them and
 * nothing here can disagree with them.
 *
 * The rest are the boundaries a test cannot afford to wait on. The clock and
 * the random draw are injected because a wall clock is what made these policies
 * cost a 20-second window each, and `isReacting` is injected rather than stubbed
 * on a global because `getAnimations` does not exist outside a browser.
 */
export interface SchedulerHost {
  field: HTMLElement
  /** Whether the section is on screen. */
  isWatching: () => boolean
  isPageHidden: () => boolean
  prefersStillMotion: () => boolean
  isReacting: (member: HTMLElement) => boolean
  settle: (member: HTMLElement) => void
  /** `Math.random`'s own shape, a draw in `[0, 1)`. */
  random: () => number
  setTimer: (run: () => void, delayMs: number) => number
  clearTimer: (handle: number) => void
  /** How long a member holds when no animation carries it. */
  reactionMs: number
}

/**
 * Arms the loop and hands back the way to stop it. A timer that re-arms itself
 * with no way to clear it is the shape the concurrency standard bars whatever
 * the page does.
 */
export const startScheduler = (host: SchedulerHost): (() => void) => {
  const {
    field,
    isWatching,
    isPageHidden,
    prefersStillMotion,
    isReacting,
    settle,
    random,
    setTimer,
    clearTimer,
    reactionMs,
  } = host

  const actOnce = () => {
    // A reader's own pointer outranks the schedule, and a member already moving
    // is what the one-at-a-time rule is about. Both are read off the page rather
    // than tracked, so nothing here can disagree with it.
    if (!isWatching() || isPageHidden() || prefersStillMotion()) return
    if (field.querySelector('[data-reacting]')) return
    // Gated on the same pointer test the hover reactions answer to. WebKit
    // applies `:hover` to a tapped element and holds it until something else is
    // tapped, so ungated this silences the scheduler for the life of the page
    // the moment a reader taps a member on a touch screen. The failure is
    // silence, which is indistinguishable from a cast that is quiet on purpose.
    if (
      field.dataset.pointer !== undefined &&
      field.querySelector('[data-cast-member]:hover')
    )
      return

    const idle = [
      ...field.querySelectorAll<HTMLElement>('[data-cast-member]'),
    ].filter((member) => member.dataset.reacting === undefined)
    if (idle.length === 0) return

    const chosen = idle[Math.floor(random() * idle.length)]
    chosen.dataset.reacting = ''

    // A term that starts no animation is never ended by one, which is the trap
    // the tap path already carries. Here it costs more, because a member left
    // marked would take the scheduler's one slot for the life of the page and
    // the cast would go quiet with nothing saying why.
    setTimer(() => {
      if (!isReacting(chosen)) settle(chosen)
    }, reactionMs)
  }

  let pending = setTimer(
    function gap() {
      actOnce()
      pending = setTimer(gap, SOLO_GAP_MS + random() * SOLO_JITTER_MS)
    },
    SOLO_GAP_MS + random() * SOLO_JITTER_MS,
  )

  return () => clearTimer(pending)
}
