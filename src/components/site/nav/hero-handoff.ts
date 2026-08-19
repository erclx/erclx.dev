const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
// Long enough to cover a slow load and a delayed reveal, short enough that a
// page which never finishes still gets a placed control rather than an empty
// slot in the bar.
const PLACEMENT_WAIT_MS = 3000

// The name in the hero and the name in the bar are one continuous move rather
// than two elements trading places. A third element does the traveling and the
// other two stay hidden while it flies, because the hero heading carries a
// floated portrait and an overflow-hidden ancestor that a transformed child
// cannot escape. The flyer is fixed, so neither constraint reaches it.
export function initHeroHandoff(): void {
  if (typeof window === 'undefined') return

  const source = document.querySelector<HTMLElement>('[data-hero-name]')
  const flyer = document.querySelector<HTMLElement>('[data-hero-flyer]')
  const target = document.querySelector<HTMLElement>('[data-bar-name-slot]')
  if (!source || !flyer || !target) return

  // Without motion the hero keeps its name and the bar slot shows its own,
  // which is the same information with none of the travel. The toggle still
  // moves, because its position has to stay continuous for the control to be
  // reachable at every scroll, and a scroll-linked position plays nothing on
  // its own for the preference to object to.
  const stillName = window.matchMedia(REDUCED_MOTION_QUERY).matches

  let from = { x: 0, y: 0, size: 0, height: 0 }
  let to = { x: 0, y: 0, size: 0 }
  let landedY = 0
  let travel = 1

  // The hero reveals by translating its rows into place over 16px, so a box read
  // while that runs describes where the row is passing through rather than where
  // it comes to rest, and a fixed copy placed from it holds that position for
  // good. The first placement waits the reveal out, which leaves the resize
  // below as the one caller that can still land mid-reveal. Discounting the
  // reveal's own offset yields the settled box whenever it is read.
  const settledBox = (element: HTMLElement): DOMRect => {
    const box = element.getBoundingClientRect()
    const revealing = element.closest<HTMLElement>('[data-fade]')
    if (!revealing) return box
    const transform = getComputedStyle(revealing).transform
    if (transform === 'none') return box
    const { e, f } = new DOMMatrix(transform)
    return new DOMRect(box.left - e, box.top - f, box.width, box.height)
  }

  // Both anchors want the position the page holds at scroll 0. The hero's is in
  // flow, so its own offset plus the current scroll is that position and no
  // scrolling is needed to read it. The bar is fixed and already reports
  // viewport coordinates, which is what the paint clamps against.
  const measure = () => {
    const sourceBox = settledBox(source)
    const targetBox = settledBox(target)
    from = {
      x: sourceBox.left,
      y: sourceBox.top + window.scrollY,
      height: sourceBox.height,
      size: parseFloat(getComputedStyle(source).fontSize),
    }
    to = {
      x: targetBox.left,
      y: targetBox.top,
      size: parseFloat(getComputedStyle(target).fontSize),
    }
    // The flyer scales from its top-left, so its landed box is a fraction of
    // the height it started at. Aiming at the slot's top would leave the name
    // riding above the toggle beside it, so the landing is centred on the slot
    // rather than aligned to its edge.
    const landedHeight = from.height * (to.size / from.size)
    landedY = targetBox.top + targetBox.height / 2 - landedHeight / 2
    // The vertical distance the name covers is the gap between where it starts
    // and where it lands, which is also how far the page scrolls to bring it
    // there. Reading it rather than declaring it keeps the pair correct at any
    // viewport, where the hero is full height on a desktop and 348px on a phone.
    travel = Math.max(1, from.y - landedY)

    // Transparent rather than hidden. `visibility: hidden` would take the
    // page's only h1 out of the accessibility tree, leaving the heading with
    // no accessible name while the flyer, which is decoration, carries the
    // glyph a sighted reader sees.
    source.style.opacity = '0'
    source.style.pointerEvents = 'none'
    flyer.style.visibility = ''
  }

  const paint = () => {
    paintToggle()
    if (stillName) return
    const progress = Math.min(1, Math.max(0, window.scrollY / travel))
    const scale = from.size === 0 ? 1 : to.size / from.size
    const x = from.x + (to.x - from.x) * progress
    // Until it lands the name rides the scroll, which is what makes the move
    // read as the page carrying it rather than as an animation playing over it.
    const y = Math.max(landedY, from.y - window.scrollY)
    flyer.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${1 + (scale - 1) * progress})`
  }

  // The toggle travels on its own measurements, because it starts higher in
  // the hero than the name does and therefore lands first. Syncing the two
  // would mean one of them moving at a rate the scroll does not, which is the
  // quality that makes the pair read as carried by the page.
  const toggle = document.querySelector<HTMLElement>('[data-theme-toggle]')
  const host = document.querySelector<HTMLElement>('[data-toggle-host]')
  const toggleSlot = document.querySelector<HTMLElement>(
    '[data-bar-toggle-slot]',
  )
  const home = document.querySelector<HTMLElement>('[data-hero-toggle-home]')
  let toggleFrom = { x: 0, y: 0 }
  let toggleTo = { x: 0, y: 0 }

  const measureToggle = () => {
    if (!toggle || !host || !toggleSlot || !home) return
    // The home slot centres on the row by offsetting half its own height and
    // hangs off the column's right edge, so with the control promoted away it
    // collapses to a point 22px low and 44px right of where the control
    // belongs. Returning the control for the reading keeps its own box the one
    // source of the hero position, where a reserved size would restate the
    // control's dimensions somewhere they could drift.
    const wasFocused = document.activeElement === toggle
    if (toggle.parentElement !== home) home.appendChild(toggle)

    const homeBox = settledBox(home)
    const slotBox = settledBox(toggleSlot)
    toggleFrom = { x: homeBox.left, y: homeBox.top + window.scrollY }
    toggleTo = { x: slotBox.left, y: slotBox.top }

    if (toggle.parentElement !== host) host.appendChild(toggle)
    // Re-parenting drops focus, and a resize while the reader is on the control
    // is exactly when that would strand them.
    if (wasFocused) toggle.focus()
    host.style.visibility = ''
  }

  const paintToggle = () => {
    if (!toggle || !host) return
    const distance = Math.max(1, toggleFrom.y - toggleTo.y)
    const progress = Math.min(1, Math.max(0, window.scrollY / distance))
    const x = toggleFrom.x + (toggleTo.x - toggleFrom.x) * progress
    const y = Math.max(toggleTo.y, toggleFrom.y - window.scrollY)
    host.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  let frame: number | null = null
  const schedule = () => {
    if (frame === null) {
      frame = window.requestAnimationFrame(() => {
        frame = null
        paint()
      })
    }
  }

  const place = () => {
    measureToggle()
    if (!stillName) measure()
    paint()
  }

  // Promotion waits on two things, and measuring before either would freeze the
  // control somewhere the page never puts it.
  //
  // A module script does not wait for stylesheets the way a parser-blocking one
  // does, so this can run against an unstyled document. Measured in WebKit
  // against the built page, that put the control at the body's default 8px
  // margin, 868px off the row it belongs to, and nothing afterwards corrected
  // it. Readiness is the guarantee the stylesheet has been applied.
  //
  // The hero then reveals by translating its rows into place. Until that rests,
  // the name and the control are still in the row and ride it, where a fixed
  // copy placed at the settled position would hang 16px off the row for the
  // length of the reveal. Reduced motion runs no transition, so the transform
  // reads none and that half passes straight through.
  //
  // Neither condition is guaranteed to arrive. A stalled subresource holds
  // readiness open, and the reveal is driven by an observer elsewhere that does
  // nothing at all without IntersectionObserver, which would leave the row
  // translated for good. Waiting forever would spin a frame callback for the
  // life of the page and leave the bar's reserved slot empty, so the wait gives
  // up and places the control where it can read it.
  const revealing = (toggle ?? source).closest<HTMLElement>('[data-fade]')
  const waitStartedAt = performance.now()
  const promote = () => {
    const styled = document.readyState === 'complete'
    const resting =
      !revealing || getComputedStyle(revealing).transform === 'none'
    const spent = performance.now() - waitStartedAt > PLACEMENT_WAIT_MS
    if (!spent && (!styled || !resting)) {
      window.requestAnimationFrame(promote)
      return
    }
    place()
    // Announced after the first paint rather than after the measurement, so a
    // reader of this flag never finds a control that has been measured and not
    // yet placed.
    if (host) host.dataset.ready = 'true'
  }
  promote()

  // A resize arrives per pixel of a window drag, and on a phone the address bar
  // collapsing fires one mid-scroll. Placement re-parents the control to read
  // its home, so coalescing to a frame keeps that off the critical path.
  let placement: number | null = null
  const schedulePlacement = () => {
    if (placement !== null) return
    placement = window.requestAnimationFrame(() => {
      placement = null
      place()
    })
  }

  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedulePlacement)
}
