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
export function initHeroHandoff(onArrive?: (arrived: boolean) => void): void {
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
  }

  // The name's distance is read even when the name does not fly, because the
  // toggle runs on it too and the bar's gate reads it. Only the takeover below
  // belongs to the flying case.
  const takeOverName = () => {
    // Transparent rather than hidden. `visibility: hidden` would take the
    // page's only h1 out of the accessibility tree, leaving the heading with
    // no accessible name while the flyer, which is decoration, carries the
    // glyph a sighted reader sees.
    source.style.opacity = '0'
    source.style.pointerEvents = 'none'
    flyer.style.visibility = ''
  }

  // The bar has to be behind the controls by the time the first of them lands,
  // so the moment reported is the shorter of the two travels rather than the
  // name's alone. The toggle starts higher in the hero and therefore lands
  // first, and under reduced motion the name does not travel at all.
  let arrived = false
  let placed = false
  const reportArrival = () => {
    if (!onArrive) return
    // Nothing has been measured until placement runs, and the scroll listener
    // attaches while that wait is still open. Reporting from those defaults
    // puts the landing distance at 1, so any scroll at all reads as landed and
    // opens the bar around a transparent name and an empty toggle slot while
    // both controls are still down in the hero.
    if (!placed) return
    // One distance now, because both controls run on it and land together.
    // The bar has to be behind whichever arrives first, and an earlier gate
    // for the toggle would open it hundreds of pixels before the name lands,
    // where a separate one for each left the toggle in the bar's slot over
    // page content with no bar behind it.
    const landing = window.scrollY >= travel
    if (landing === arrived) return
    arrived = landing
    onArrive(landing)
  }

  const paint = () => {
    paintToggle()
    reportArrival()
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

  // Both controls run on the name's distance, so they arrive together and the
  // bar opens under them in the same moment. The toggle's own travel is the
  // wrong clock for it: its corner sits 28px above the bar's slot and hundreds
  // to the right, because the corner aligns to the viewport and the bar to the
  // content column, so keying the crossing to that 28px sent it across the
  // page inside a thumb's worth of scroll.
  //
  // Its position is interpolated rather than ridden. Riding the scroll the way
  // the name does would put it at the slot after those same 28px, which is the
  // dart again by another route.
  const paintToggle = () => {
    if (!toggle || !host) return
    const progress = Math.min(1, Math.max(0, window.scrollY / travel))
    const x = toggleFrom.x + (toggleTo.x - toggleFrom.x) * progress
    // `toggleFrom.y` is a document position, and at rest it is also the
    // viewport position the corner sits at.
    const y = toggleFrom.y + (toggleTo.y - toggleFrom.y) * progress
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
    measure()
    if (!stillName) takeOverName()
    placed = true
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
  //
  // Both anchors are watched rather than one. The toggle and the name reveal on
  // separate delays, 190ms apart at 1280x800, so waiting on either alone can
  // measure the other while it is still moving.
  const revealing = [toggle, source]
    .map((element) => element?.closest<HTMLElement>('[data-fade]'))
    .filter(
      (element): element is HTMLElement =>
        element !== null && element !== undefined,
    )

  // A reveal reaches this in three states and only two of them are worth
  // waiting on. Reading the transform alone sees one, because an element parked
  // at its pre-reveal offset and one moving through that same offset report the
  // same matrix.
  //
  // Marked and still transitioning is the state the wait was written for.
  //
  // Unmarked with the row still on screen is a reveal about to run, and placing
  // through it pins the name at its settled position while the row around it is
  // still rising. That is the doubled arrival a reader sees as the title
  // correcting itself after everything else has landed.
  //
  // Unmarked with the row scrolled past is a reveal that can never run. A
  // refresh restores the scroll, the hero lands above the viewport, and an
  // IntersectionObserver only reports an element becoming intersecting, so
  // nothing will ever mark it. Waiting there can only time out: measured at
  // 1440x900, that held the bar's slots empty for 3057ms against 876ms on a
  // fresh load. `settledBox` already discounts the parked offset, so the
  // position is readable without the reveal ever running.
  // `bottom > 0` rather than a share of the row's height, and `REVEAL_THRESHOLD`
  // is deliberately not read here. That constant is the observer's `threshold`,
  // which decides when a callback fires and not what `entry.isIntersecting`
  // reports, and `initReveal` marks on `isIntersecting` alone. Measured on all
  // three engines, a row lands marked at 0.006 of its own height visible. So any
  // sliver on screen is a row the observer will mark, and the predicate that
  // matches the marking is the one written here.
  //
  // Reading the threshold instead is the change to avoid. It would place through
  // a row between 0 and 0.15 visible, which the observer still marks, and pin
  // the name at its landed position while that row is about to rise. That is
  // the doubled arrival the direction guard below exists to catch, reintroduced
  // in a narrow band.
  const stillArriving = (element: HTMLElement): boolean => {
    if (element.getAttribute('data-visible') !== 'true') {
      return element.getBoundingClientRect().bottom > 0
    }
    return getComputedStyle(element).transform !== 'none'
  }

  const waitStartedAt = performance.now()
  const promote = () => {
    const styled = document.readyState === 'complete'
    const resting = !revealing.some(stillArriving)
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
