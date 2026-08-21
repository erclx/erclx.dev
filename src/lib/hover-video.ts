import { hasHoverPointer } from '@/lib/pointer'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const VIEWPORT_VISIBLE_RATIO = 0.5

// A video plays while its host is hovered. A host declaring `view` also plays
// where the pointer cannot hover, so a phone still sees the motion its copy
// describes. A host leaving that out stays hover-only, which is what a card
// wants: its video is revealed by a hover-driven opacity and playing it on a
// touch device would run a frame nobody can see.
export function initHoverVideo(): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  // A `view` host routed on `(hover: none)` instead would send Playwright's
  // Firefox back to the intersection branch, which is the defect the shared
  // query exists to close. The devices `view` was written for are phones, which
  // report a coarse pointer and still reach it.
  const canHover = hasHoverPointer()
  const videos =
    document.querySelectorAll<HTMLVideoElement>('[data-media-video]')

  for (const video of videos) {
    const host = video.closest<HTMLElement>('[data-media-host]')
    if (!host) continue

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

    if (canHover) {
      host.addEventListener('pointerenter', play)
      host.addEventListener('pointerleave', pause)
      continue
    }

    if (host.dataset.mediaHost !== 'view') continue
    if (!('IntersectionObserver' in window)) continue

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) play()
          else pause()
        }
      },
      { threshold: VIEWPORT_VISIBLE_RATIO },
    )
    observer.observe(host)
  }
}
