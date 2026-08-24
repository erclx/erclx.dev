/**
 * Runs one wave of light across the timeline's project chips as the row arrives.
 *
 * The chips are controls rather than decoration, which is what rules a loop out
 * here and does not rule one out for the agent cast a few pixels away. A cast
 * member is `aria-hidden` and leads nowhere, so a reader classifies it as
 * scenery and stops tracking it. A chip is a link, and a control that lights
 * itself on a schedule claims something happened there, which the reader has to
 * check before deciding it meant nothing. The row also sits inside the reading
 * column rather than in the margin beside it.
 *
 * So the gesture is spent at the one moment it costs nothing, when the row
 * enters view and attention is already moving, and it says something true: the
 * five chips are one set, in order, and they are reachable. Then the section is
 * quiet for the whole read.
 *
 * Four candidates were served live and driven before this one was picked. A
 * single chip at intervals and a wave on a loop both read as a notification on a
 * control, and a light traveling continuously through the row sat closest to
 * the band `.claude/DESIGN.md` bars and lit the row's ground rather than the
 * controls on it.
 */

/** How long one chip's light takes to arrive, hold, and leave. */
const LIT_MS = 1_480
/** The step between chips, which is what makes the wave read as one gesture. */
const STEP_MS = 90

/**
 * The row has to be this visible before the wave runs, and entirely gone before
 * it can run again. The gap between the two is the whole point: a reader parked
 * with the row at the edge of the viewport sits inside it, so no amount of
 * scroll jitter re-fires the wave.
 */
const ENTER_RATIO = 0.6
const REARM_RATIO = 0

const LIST = '[data-chip-row]'
const CHIP = '[data-chip]'

export function initChipLife(): void {
  const list = document.querySelector<HTMLElement>(LIST)
  if (!list) return

  const chips = Array.from(list.querySelectorAll<HTMLElement>(CHIP))
  if (chips.length === 0) return

  const stillWanted = window.matchMedia('(prefers-reduced-motion: reduce)')

  let isArmed = true

  // Every timer a wave has in flight: one per chip still waiting to light, one
  // per chip already lit and waiting to go out. darken() clears all of them, so
  // a wave cut short by the preference or by scrolling away cannot still land a
  // light on a chip nobody asked for.
  const pendingTimers = new Set<number>()

  const darken = () => {
    for (const timer of pendingTimers) window.clearTimeout(timer)
    pendingTimers.clear()
    for (const chip of chips) delete chip.dataset.lit
  }

  /** A chip's whole term: it lights, and it puts itself out. */
  const light = (chip: HTMLElement) => {
    chip.dataset.lit = 'true'
    const extinguish = window.setTimeout(() => {
      pendingTimers.delete(extinguish)
      delete chip.dataset.lit
    }, LIT_MS)
    pendingTimers.add(extinguish)
  }

  const wave = () => {
    chips.forEach((chip, index) => {
      const arrival = window.setTimeout(() => {
        pendingTimers.delete(arrival)
        light(chip)
      }, index * STEP_MS)
      pendingTimers.add(arrival)
    })
  }

  // The motion preference is the only thing that suppresses the wave, and it is
  // read off the page at the moment of the arrival rather than tracked.
  //
  // A pointer resting on the row deliberately does not. The agent cast stands
  // down under a hand because it acts on a schedule, and standing down is what
  // stops it interrupting a reader repeatedly. A wave that runs once has nothing
  // to repeat, so the same rule here would only cost that reader the gesture
  // entirely, with nothing to tell them it was spent. A chip under the pointer
  // simply keeps the hover treatment, which outranks this one by source order.
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio <= REARM_RATIO) {
          isArmed = true
          darken()
        } else if (isArmed && entry.intersectionRatio >= ENTER_RATIO) {
          isArmed = false
          if (!stillWanted.matches) wave()
        }
      }
    },
    { threshold: [REARM_RATIO, ENTER_RATIO] },
  )
  watcher.observe(list)

  // A reader can turn the preference on while the page is open, and a wave
  // already in flight has to come down rather than play out.
  stillWanted.addEventListener('change', () => {
    if (stillWanted.matches) darken()
  })
}
