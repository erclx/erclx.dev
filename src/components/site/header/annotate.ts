const UNDERLINE_DELAY_MS = 100

/**
 * How long the reveal on this element still has to run. The observer writes the
 * delay at intersection time, so reading it here is the only way to land the
 * underline on the settle rather than near it. An element revealed at server
 * render carries a transition it will never run, and returns zero.
 */
function remainingRevealMs(element: HTMLElement): number {
  const faded = element.closest<HTMLElement>('[data-fade]')
  if (!faded || faded.dataset.visible === 'true') return 0

  const style = getComputedStyle(faded)
  const seconds = (value: string) => parseFloat(value.split(',')[0]) || 0
  return (
    (seconds(style.transitionDelay) + seconds(style.transitionDuration)) * 1000
  )
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
        window.setTimeout(
          () => annotation.show(),
          remainingRevealMs(element) + UNDERLINE_DELAY_MS,
        )
        observer.unobserve(element)
      }
    },
    { threshold: 0.5 },
  )

  for (const target of targets) observer.observe(target)
}
