const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const MAX_TILT_DEG = 6
const MAX_PARALLAX_PX = 8
const LERP = 0.18

interface TiltState {
  card: HTMLElement
  targetX: number
  targetY: number
  currentX: number
  currentY: number
  active: boolean
}

export function initTilt(): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]')
  if (cards.length === 0) return

  const states: TiltState[] = []
  for (const card of cards) {
    states.push({
      card,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      active: false,
    })
  }

  let rafId = 0

  const tick = () => {
    let needsNext = false
    for (const state of states) {
      const dx = state.targetX - state.currentX
      const dy = state.targetY - state.currentY
      if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) {
        state.currentX = state.targetX
        state.currentY = state.targetY
      } else {
        state.currentX += dx * LERP
        state.currentY += dy * LERP
        needsNext = true
      }
      writeStyles(state)
    }
    rafId = needsNext ? requestAnimationFrame(tick) : 0
  }

  const ensureLoop = () => {
    if (rafId === 0) rafId = requestAnimationFrame(tick)
  }

  for (const state of states) {
    state.card.addEventListener('pointermove', (event) => {
      const rect = state.card.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      state.targetX = clamp(py * -2, -1, 1)
      state.targetY = clamp(px * 2, -1, 1)
      state.active = true
      ensureLoop()
    })
    state.card.addEventListener('pointerleave', () => {
      state.targetX = 0
      state.targetY = 0
      state.active = false
      ensureLoop()
    })
  }
}

function writeStyles(state: TiltState): void {
  state.card.style.setProperty(
    '--tilt-x',
    `${(state.currentX * MAX_TILT_DEG).toFixed(2)}deg`,
  )
  state.card.style.setProperty(
    '--tilt-y',
    `${(state.currentY * MAX_TILT_DEG).toFixed(2)}deg`,
  )
  state.card.style.setProperty(
    '--parallax-x',
    `${(state.currentY * MAX_PARALLAX_PX * -1).toFixed(2)}px`,
  )
  state.card.style.setProperty(
    '--parallax-y',
    `${(state.currentX * MAX_PARALLAX_PX).toFixed(2)}px`,
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
