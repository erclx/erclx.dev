import { lockPageScroll, releasePageScroll } from '@/lib/page-scroll-lock'

const GALLERY_SELECTOR = '[data-screenshot-gallery]'
const PREVIEW_SELECTOR = '[data-gallery-preview]'
const SCROLLER_SELECTOR = '[data-peek-scroller]'
const TRACK_SELECTOR = '[data-peek-track]'
const SLIDE_SELECTOR = '[data-peek-slide]'
const DOT_SELECTOR = '[data-gallery-dot]'
const PREV_SELECTOR = '[data-gallery-prev]'
const NEXT_SELECTOR = '[data-gallery-next]'
const PREVIEW_CLOSE_SELECTOR = '[data-gallery-preview-close]'
const PREVIEW_POSITION_SELECTOR = '[data-gallery-preview-position]'
const PREVIEW_CAPTION_SELECTOR = '[data-gallery-preview-caption]'

interface PeekCarousel {
  readonly goTo: (at: number, options?: { readonly instant?: boolean }) => void
  readonly getActive: () => number
}

interface PeekCarouselOptions {
  readonly dots?: readonly HTMLButtonElement[]
  readonly prev?: HTMLButtonElement | null
  readonly next?: HTMLButtonElement | null
  readonly onCenterClick?: (index: number) => void
  readonly onActiveChange?: (index: number) => void
}

/**
 * Wires one peek track, inline or inside the preview dialog. A peeking slide
 * centers on click, on a dot, or on the prev/next pair passed in; the
 * already-centered slide calls `onCenterClick` instead, since a click there
 * has nowhere left to advance to. The centered slide itself is read back
 * from an `IntersectionObserver` rather than from whichever control fired,
 * since a swipe or a scroll centers a slide with no control involved at
 * all.
 */
function initPeekCarousel(
  root: ParentNode,
  options: PeekCarouselOptions = {},
): PeekCarousel | null {
  const scroller = root.querySelector<HTMLElement>(SCROLLER_SELECTOR)
  const track = root.querySelector<HTMLElement>(TRACK_SELECTOR)
  const slides = Array.from(
    root.querySelectorAll<HTMLButtonElement>(SLIDE_SELECTOR),
  )
  if (!scroller || !track || slides.length === 0) return null

  const { dots = [], prev, next, onCenterClick, onActiveChange } = options
  let active = 0

  /**
   * Where a control said to go, held until the scroll arrives there. The
   * observer defers to it in the meantime, per the note on that callback.
   *
   * A reader who grabs the track mid-flight clears it, so a scroll that never
   * reaches its destination cannot leave the observer deferring to a
   * destination nothing is traveling to.
   */
  let pending: number | null = null

  const setActive = (at: number): void => {
    active = at
    for (const [index, slide] of slides.entries()) {
      slide.toggleAttribute('data-active', index === at)
      // Roving tabindex, so Tab reaches the centered slide and not the four
      // a reader cannot see. It also keeps the focus ring off a slide that
      // is no longer the one being looked at, which is what made the ring
      // read as marking the previous slide rather than the current one.
      slide.tabIndex = index === at ? 0 : -1
    }
    for (const [index, dot] of dots.entries()) {
      dot.toggleAttribute('data-active', index === at)
      dot.setAttribute('aria-selected', String(index === at))
    }
    // Read before disabling, because a browser blurs an element the moment it
    // becomes disabled and `document.activeElement` is `body` by the time the
    // assignment below returns.
    const focusedBefore = document.activeElement
    if (prev) prev.disabled = at === 0
    if (next) next.disabled = at === slides.length - 1

    // An arrow that disables under the reader's own focus drops that focus to
    // the body, and the keydown handler below then never fires again, so the
    // carousel is stuck at whichever end they reached. Measured: pressing
    // ArrowRight to the last slide left `document.activeElement` on `body`
    // with every later press doing nothing. Focus lands on the centered slide
    // instead, which is inside the track and keeps the keys working.
    const lostFocus =
      (focusedBefore === prev && prev?.disabled === true) ||
      (focusedBefore === next && next?.disabled === true)
    if (lostFocus) slides[at]?.focus({ preventScroll: true })

    onActiveChange?.(at)
  }

  /**
   * Scrolls to center a slide by a computed offset rather than
   * `scrollIntoView`. That API resolves the snap target against the
   * scale-transformed box mid-transition, which drifted onto a neighboring
   * slide on every programmatic call: measured landing on index 2 for a
   * click aimed at index 1.
   *
   * Measured in layout space rather than from a bounding rect, because a rect
   * carries the slide's own `scale`. A slide is 0.94 at rest and 1 centered
   * over a 320ms transition, so a rect read mid-transition is inset by up to
   * 16px while the `offsetWidth` beside it in the same expression is not, and
   * the two disagree by enough to land the scroll on a neighbor. `offsetLeft`
   * resolves against `offsetParent`, which is the same ancestor for the track
   * and every slide, so the difference between them is the slide's position
   * inside the track whatever sits above it.
   *
   * That also makes the target absolute rather than relative to the current
   * `scrollLeft`, so a click arriving while an earlier scroll is still in
   * flight computes the same destination as one arriving at rest.
   */
  const goTo: PeekCarousel['goTo'] = (at, { instant = false } = {}) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, at))
    const slide = slides[clamped]
    if (!slide || !track) return
    const target =
      slide.offsetLeft -
      track.offsetLeft -
      (scroller.clientWidth - slide.offsetWidth) / 2

    // A slide holding focus while a different one is centered puts the focus
    // ring on the slide a reader has just left. Focus follows the carousel in
    // that case alone: with focus on an arrow, a dot, or the preview's close
    // button, the ring is already on the control being used and moving it
    // into the track would take it off the thing the reader is operating.
    // `preventScroll` because focusing a button scrolls it into view, which
    // is the same fight with the snap the offset above exists to avoid.
    const focusHeldBySlide = slides.some(
      (candidate) => candidate === document.activeElement,
    )

    // A control names its destination, so the state follows the control rather
    // than waiting to be inferred back from geometry. The observer below is
    // what reads a swipe or a free scroll, where nothing declared an intent,
    // and it corrects this if the scroll lands anywhere else.
    //
    // Waiting for it here makes a click's outcome depend on the scroll
    // finishing and on a threshold being crossed on the way, which is a race a
    // loaded machine loses: measured as a dot click leaving the row on the
    // previous slide with the attribute never arriving.
    pending = clamped
    setActive(clamped)

    if (!instant) {
      scroller.scrollTo({ left: target })
      if (focusHeldBySlide) slide.focus({ preventScroll: true })
      return
    }
    // The preview opens directly on the requested slide rather than
    // animating there, which the shared `scroll-behavior: smooth` would
    // otherwise apply to every call.
    const previousBehavior = scroller.style.scrollBehavior
    scroller.style.scrollBehavior = 'auto'
    scroller.scrollTo({ left: target })
    scroller.style.scrollBehavior = previousBehavior
    if (focusHeldBySlide) slide.focus({ preventScroll: true })
  }

  for (const [index, slide] of slides.entries()) {
    slide.addEventListener('click', () => {
      if (index === active) {
        onCenterClick?.(index)
        return
      }
      goTo(index)
    })
  }
  for (const [index, dot] of dots.entries()) {
    dot.addEventListener('click', () => goTo(index))
  }
  prev?.addEventListener('click', () => goTo(active - 1))
  next?.addEventListener('click', () => goTo(active + 1))

  // Arrow keys navigate the track, which is what a composite widget owes a
  // keyboard reader. Bound on the mount rather than on the window, so the
  // event only arrives while focus is inside this carousel and the keys go
  // on scrolling the page everywhere else.
  //
  // The browser already scrolls the nearest scrollable ancestor on an arrow
  // press, and snap lands that on a neighbor, so this is not what makes the
  // keys work. What it adds is that a press moves exactly one slide rather
  // than a pixel distance the snap then resolves, which is the difference
  // between one press being one step and being however far the engine
  // scrolls. Measured: the native path advances one slide on all three
  // engines, so read this as determinism rather than as a repair.
  root.addEventListener('keydown', (event) => {
    if (!(event instanceof KeyboardEvent)) return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const at = Math.max(
      0,
      Math.min(
        slides.length - 1,
        active + (event.key === 'ArrowRight' ? 1 : -1),
      ),
    )
    goTo(at)
    // The keys operate the track, so the ring belongs on the track. Pressing
    // them with focus on an arrow otherwise leaves the ring pinned to that
    // arrow while the screenshots move underneath it, which is the inline
    // gallery reading differently from the preview for no reason a reader
    // could infer.
    slides[at]?.focus({ preventScroll: true })
  })

  /**
   * How much of each slide the scroller currently shows, held across
   * callbacks because one callback carries only the slides that crossed a
   * threshold rather than the whole set.
   *
   * The centered slide is the one showing most of itself, read as the largest
   * of these rather than as the first intersecting entry in the batch. A
   * step moves two slides across a threshold at once and the batch is not
   * ordered by how centered they are, so taking the first put the active row
   * on whichever the engine happened to list first: measured landing on
   * index 3 after a click on index 4, which left the dots a slide behind for
   * the rest of the track.
   */
  const shown = new Array<number>(slides.length).fill(0)

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const at = slides.indexOf(entry.target as HTMLButtonElement)
        if (at !== -1) shown[at] = entry.intersectionRatio
      }
      let centered = 0
      for (let at = 1; at < shown.length; at += 1) {
        if ((shown[at] ?? 0) > (shown[centered] ?? 0)) centered = at
      }
      if ((shown[centered] ?? 0) === 0) return

      // A control's declared destination outranks what the geometry says
      // while the scroll to it is still running. Every slide the scroll
      // passes over is briefly the one showing most of itself, so without
      // this the row walks through the slides between here and there and
      // lands right only once the animation ends.
      if (pending !== null) {
        if (centered !== pending) return
        pending = null
      }
      setActive(centered)
    },
    // Stepped rather than a single 0.6, so a slide's ratio is re-reported as
    // it moves rather than only as it crosses one line. The comparison above is
    // only as current as the last ratio each slide reported.
    { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 0.95, 1] },
  )
  for (const slide of slides) observer.observe(slide)

  // A reader touching the track outranks a scroll already traveling, so the
  // observer gets its authority back the moment they take over. Without this
  // a swipe interrupting a click's scroll would leave the destination pending
  // forever and the row frozen where the click aimed.
  for (const event of ['pointerdown', 'wheel', 'touchstart'] as const) {
    scroller.addEventListener(event, () => {
      pending = null
    })
  }

  setActive(0)

  return { goTo, getActive: () => active }
}

export function initScreenshotGallery(): void {
  if (typeof window === 'undefined') return

  const galleryRoot = document.querySelector<HTMLElement>(GALLERY_SELECTOR)
  if (!galleryRoot) return

  const preview = initPreview((at) => inline?.goTo(at, { instant: true }))

  const inline = initPeekCarousel(galleryRoot, {
    dots: Array.from(
      galleryRoot.querySelectorAll<HTMLButtonElement>(DOT_SELECTOR),
    ),
    prev: galleryRoot.querySelector<HTMLButtonElement>(PREV_SELECTOR),
    next: galleryRoot.querySelector<HTMLButtonElement>(NEXT_SELECTOR),
    onCenterClick: (index) => preview?.open(index),
  })
}

interface Preview {
  readonly open: (at: number) => void
}

/**
 * `syncInline` carries wherever the reader stepped to inside the preview
 * back onto the inline carousel when it closes, since the two are one
 * carousel shown at two sizes rather than two independent positions to
 * reconcile.
 */
function initPreview(syncInline: (at: number) => void): Preview | null {
  const dialog = document.querySelector<HTMLDialogElement>(PREVIEW_SELECTOR)
  if (!dialog || typeof dialog.showModal !== 'function') return null

  const position = dialog.querySelector<HTMLElement>(PREVIEW_POSITION_SELECTOR)
  const caption = dialog.querySelector<HTMLElement>(PREVIEW_CAPTION_SELECTOR)
  const slides = Array.from(
    dialog.querySelectorAll<HTMLButtonElement>(SLIDE_SELECTOR),
  )

  const carousel = initPeekCarousel(dialog, {
    onActiveChange: (at) => {
      if (position) position.textContent = `${at + 1} / ${slides.length}`
      if (caption) {
        caption.textContent = slides[at]?.querySelector('img')?.alt ?? ''
      }
    },
  })
  if (!carousel) return null

  let openedAt = 0

  dialog.addEventListener('close', () => {
    const at = carousel.getActive()
    if (at !== openedAt) syncInline(at)
    releasePageScroll(null)
  })
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })
  dialog
    .querySelector(PREVIEW_CLOSE_SELECTOR)
    ?.addEventListener('click', () => {
      dialog.close()
    })

  return {
    open: (at) => {
      openedAt = at
      lockPageScroll()
      dialog.showModal()
      carousel.goTo(at, { instant: true })
      // `showModal` focuses the first focusable descendant, which is the
      // close button, so the first arrow key press drew the ring around the
      // close control while the carousel moved underneath it. Focus opens on
      // the screenshot being viewed instead, which is what the arrow keys
      // act on and what the ring should mark.
      slides[at]?.focus({ preventScroll: true })
    },
  }
}
