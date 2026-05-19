const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function initProjectMedia(): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]')

  for (const card of cards) {
    const video = card.querySelector<HTMLVideoElement>('[data-media-video]')
    if (!video) continue

    let pendingPlay = false

    const play = () => {
      if (pendingPlay) return
      pendingPlay = true
      video.currentTime = 0
      const result = video.play()
      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          pendingPlay = false
        })
      }
    }

    const pause = () => {
      pendingPlay = false
      video.pause()
      video.currentTime = 0
    }

    card.addEventListener('pointerenter', play)
    card.addEventListener('pointerleave', pause)
  }
}
