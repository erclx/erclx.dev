const UNDERLINE_DELAY_MS = 100

/** Reveal timing read off the element, used only to bound the wait below. */
function revealDurationMs(faded: HTMLElement): number {
  const style = getComputedStyle(faded)
  const seconds = (value: string) => parseFloat(value.split(',')[0]) || 0
  return (
    (seconds(style.transitionDelay) + seconds(style.transitionDuration)) * 1000
  )
}

/**
 * Run once the headline has finished rising. The end of the transition is the
 * signal rather than any figure describing it, because the reveal observer
 * writes the delay at intersection time and creates itself synchronously, while
 * this module waits on a dynamic import: whichever order the two run in, a
 * computed delay read here is either stale or already spent. An element the page
 * rendered visible never transitions, so a settled opacity runs immediately, and
 * the timeout covers a transition that is interrupted before it ends.
 */
function afterReveal(element: HTMLElement, run: () => void): void {
  const faded = element.closest<HTMLElement>('[data-fade]')
  if (!faded || parseFloat(getComputedStyle(faded).opacity) >= 1) {
    window.setTimeout(run, UNDERLINE_DELAY_MS)
    return
  }

  const onEnd = (event: TransitionEvent) => {
    if (event.target !== faded || event.propertyName !== 'opacity') return
    faded.removeEventListener('transitionend', onEnd)
    window.clearTimeout(ceiling)
    window.setTimeout(run, UNDERLINE_DELAY_MS)
  }

  const ceiling = window.setTimeout(
    () => {
      faded.removeEventListener('transitionend', onEnd)
      run()
    },
    revealDurationMs(faded) + UNDERLINE_DELAY_MS,
  )

  faded.addEventListener('transitionend', onEnd)
}

export async function initAnnotations(): Promise<void> {
  const targets = document.querySelectorAll<HTMLElement>('[data-annotate]')
  if (targets.length === 0) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { annotate } = await import('rough-notation')

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        const type = element.dataset.annotate as 'underline' | undefined
        if (type !== 'underline') continue
        const annotation = annotate(element, {
          type: 'underline',
          color: 'currentColor',
          strokeWidth: 1.5,
          padding: 2,
          animationDuration: 600,
          iterations: 2,
        })
        afterReveal(element, () => annotation.show())
        observer.unobserve(element)
      }
    },
    { threshold: 0.5 },
  )

  for (const target of targets) observer.observe(target)
}
