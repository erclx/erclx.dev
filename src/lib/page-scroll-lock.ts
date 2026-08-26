/**
 * Holds the page still under an open modal, and returns a reader to where
 * they were (or to an element they navigated to while it was open) once it
 * closes. Shared by every dialog on the site rather than reimplemented per
 * caller, since a second copy is where the two drift.
 *
 * Where the reader was when the lock engaged. Hiding the body's overflow
 * takes the document's scroll to zero, because that overflow propagates to
 * the viewport when the scrolling element is the root, so releasing it alone
 * drops the reader at the top of the page.
 */
let lockedScrollY = 0

/**
 * The scrollbar this removes is replaced by padding of the same width, so
 * the page behind does not jump sideways as the modal opens.
 */
export function lockPageScroll(): void {
  lockedScrollY = window.scrollY
  const gap = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (gap > 0) document.body.style.paddingRight = `${gap}px`
}

/**
 * `landOn` is the element to land beside instead of the original position,
 * for a caller whose modal let the reader move to something else while it
 * was open. Null restores the exact scroll position instead.
 */
export function releasePageScroll(landOn: HTMLElement | null): void {
  document.body.style.removeProperty('overflow')
  document.body.style.removeProperty('padding-right')

  if (landOn) {
    landOn.scrollIntoView({ block: 'center', behavior: 'instant' })
    return
  }
  window.scrollTo({ top: lockedScrollY, behavior: 'instant' })
}
