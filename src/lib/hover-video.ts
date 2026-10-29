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
  const hosts = new Map<HTMLElement, Clip[]>()
  for (const video of document.querySelectorAll<HTMLVideoElement>(
    '[data-media-video]',
  )) {
    const host = video.closest<HTMLElement>('[data-media-host]')
    if (!host) continue
    hosts.set(host, [...(hosts.get(host) ?? []), clipFor(video)])
  }

  // A host is active while hovered or in view. A theme toggle swaps which clip
  // the stylesheet displays without moving the pointer or the scroll, so an
  // active host would keep playing the clip it just hid.
  const active = new Set<HTMLElement>()
  const start = (host: HTMLElement) => {
    active.add(host)
    for (const clip of hosts.get(host) ?? []) clip.play()
  }
  const stop = (host: HTMLElement) => {
    active.delete(host)
    for (const clip of hosts.get(host) ?? []) clip.pause()
  }

  for (const host of hosts.keys()) {
    if (canHover) {
      host.addEventListener('pointerenter', () => start(host))
      host.addEventListener('pointerleave', () => stop(host))
      continue
    }

    if (host.dataset.mediaHost !== 'view') continue
    if (!('IntersectionObserver' in window)) continue

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start(host)
          else stop(host)
        }
      },
      { threshold: VIEWPORT_VISIBLE_RATIO },
    )
    observer.observe(host)
  }

  new MutationObserver(() => {
    for (const host of active) {
      for (const clip of hosts.get(host) ?? []) {
        if (clip.isShown()) clip.play()
        else clip.pause()
      }
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

interface Clip {
  play: () => void
  pause: () => void
  isShown: () => boolean
}

function clipFor(video: HTMLVideoElement): Clip {
  let pendingPlay = false

  // A host can carry one clip per theme, and the stylesheet hides the other,
  // so only the clip on screen is fetched and played.
  const isShown = () => getComputedStyle(video).display !== 'none'

  const play = () => {
    if (!isShown()) return
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

  return { play, pause, isShown }
}
