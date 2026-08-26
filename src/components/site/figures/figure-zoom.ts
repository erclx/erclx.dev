import { lockPageScroll, releasePageScroll } from '@/lib/page-scroll-lock'

const TRIGGER_SELECTOR = '[data-figure-zoom]'
const DIALOG_SELECTOR = '[data-figure-dialog]'
const DIALOG_IMAGE_SELECTOR = '[data-figure-dialog-image]'
const DIALOG_CAPTION_SELECTOR = '[data-figure-dialog-caption]'
const CLOSE_SELECTOR = '[data-figure-close]'
const SCROLL_SELECTOR = '[data-figure-scroll]'
const PREV_SELECTOR = '[data-figure-prev]'
const NEXT_SELECTOR = '[data-figure-next]'
const POSITION_SELECTOR = '[data-figure-position]'

/**
 * Opens a route's raster figures into the page's single `<dialog>` as a
 * sequence. The native modal carries focus trapping, the backdrop, and
 * Escape-to-close, and returns focus to the trigger on close. It does not stop
 * the page behind from scrolling, which is what `lockPageScroll` covers.
 *
 * A reader moves between figures without closing, because a route's argument
 * runs across its figures in order and comparing two otherwise means closing
 * and reopening. An opened figure arrives fitted, which is what makes it
 * readable at a glance and never scrolls, and a second click magnifies it to
 * its own pixels. The fitted state is the default deliberately: opening at
 * full size puts a portrait chart two to three screens tall and forces a
 * scroll to read one figure.
 */
export function initFigureZoom(): void {
  if (typeof window === 'undefined') return

  const dialog = document.querySelector<HTMLDialogElement>(DIALOG_SELECTOR)
  if (!dialog || typeof dialog.showModal !== 'function') return

  const image = dialog.querySelector<HTMLImageElement>(DIALOG_IMAGE_SELECTOR)
  const caption = dialog.querySelector<HTMLElement>(DIALOG_CAPTION_SELECTOR)
  const scroller = dialog.querySelector<HTMLElement>(SCROLL_SELECTOR)
  const previous = dialog.querySelector<HTMLButtonElement>(PREV_SELECTOR)
  const next = dialog.querySelector<HTMLButtonElement>(NEXT_SELECTOR)
  const position = dialog.querySelector<HTMLElement>(POSITION_SELECTOR)
  if (!image) return

  const triggers = Array.from(
    document.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR),
  )
  if (triggers.length === 0) return
  if (triggers.length === 1) dialog.setAttribute('data-single', '')

  let index = 0
  let openedAt = 0

  const setMagnified = (on: boolean): void => {
    dialog.toggleAttribute('data-magnified', on)
    if (!on && scroller) {
      scroller.scrollTop = 0
      scroller.scrollLeft = 0
    }
  }

  /** Shows the figure at `at`, always fitted, whether opened or stepped to. */
  const show = (at: number): void => {
    index = at
    const source = triggers[index]?.querySelector('img')
    if (!source) return

    image.src = source.currentSrc || source.src
    image.alt = source.alt

    if (caption) {
      const figcaption = triggers[index]
        ?.closest('figure')
        ?.querySelector('figcaption')
      caption.textContent = figcaption?.textContent?.trim() ?? ''
    }
    if (position) position.textContent = `${index + 1} / ${triggers.length}`
    // The ends stop rather than wrap. A sequence that wraps gives a reader no
    // signal that they have seen everything.
    if (previous) previous.disabled = index === 0
    if (next) next.disabled = index === triggers.length - 1

    setMagnified(false)
  }

  const step = (by: number): void => {
    const at = index + by
    if (at < 0 || at >= triggers.length) return
    show(at)
  }

  for (const [at, trigger] of triggers.entries()) {
    trigger.addEventListener('click', () => {
      openedAt = at
      show(at)
      lockPageScroll()
      dialog.showModal()
    })
  }

  /**
   * The magnified width comes from the opened picture rather than from the one
   * on the page, and is written once that picture has its pixels.
   *
   * Reading it off the inline figure looks equivalent and is not. Figures
   * further down a route load lazily, so a reader stepping to one they have
   * not scrolled past reads a natural width of 0, and the magnified picture
   * collapses to nothing: measured on the sixth figure of the pronunciation
   * route, reached by stepping, where a click at the picture's own coordinates
   * landed on the panel behind it.
   */
  const writeNaturalWidth = (): void => {
    if (!image.naturalWidth) return
    image.style.setProperty('--figure-natural-width', `${image.naturalWidth}px`)
  }
  image.addEventListener('load', writeNaturalWidth)

  // The opened figure is the control for its own second state, which is where
  // a reader's pointer already is.
  image.addEventListener('click', () => {
    writeNaturalWidth()
    setMagnified(!dialog.hasAttribute('data-magnified'))
  })

  previous?.addEventListener('click', () => step(-1))
  next?.addEventListener('click', () => step(1))

  // Escape is the dialog's own. The arrows are what this adds, and they are
  // ignored while magnified, where the same keys pan the picture instead.
  dialog.addEventListener('keydown', (event) => {
    if (dialog.hasAttribute('data-magnified')) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  })

  dialog.addEventListener('close', () => {
    setMagnified(false)
    releasePageScroll(index === openedAt ? null : triggers[index])
  })

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close()
  })

  dialog.querySelector(CLOSE_SELECTOR)?.addEventListener('click', () => {
    dialog.close()
  })
}
