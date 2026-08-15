const CONTROL_SELECTOR = '[data-way-home]'

/**
 * Unwinds history when the visitor arrived from the landing page, so the
 * browser restores the scroll position they left from rather than dropping
 * them at the hero. A visitor who opened the case study directly has no such
 * entry, and the control stays the ordinary link to the landing page it is
 * written as.
 */
export function initWayHome(): void {
  if (typeof window === 'undefined') return
  if (!cameFromLandingPage()) return
  if (window.history.length < 2) return

  const controls =
    document.querySelectorAll<HTMLAnchorElement>(CONTROL_SELECTOR)
  for (const control of controls) {
    control.addEventListener('click', (event) => {
      if (isModifiedClick(event)) return

      event.preventDefault()
      window.history.back()
    })
  }
}

function cameFromLandingPage(): boolean {
  if (!document.referrer) return false
  try {
    const referrer = new URL(document.referrer)
    return (
      referrer.origin === window.location.origin && referrer.pathname === '/'
    )
  } catch {
    return false
  }
}

/**
 * A click carrying a modifier or a non-primary button is the visitor asking for
 * a new tab or window, which the link already does correctly.
 */
function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
}
