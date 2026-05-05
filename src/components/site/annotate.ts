const FADE_SETTLE_MS = 850
const UNDERLINE_DELAY_MS = 100

export async function initAnnotations(): Promise<void> {
  const targets = document.querySelectorAll<HTMLElement>('[data-annotate]')
  if (targets.length === 0) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const { annotate } = await import('rough-notation')
  const foreground = getComputedStyle(document.documentElement)
    .getPropertyValue('--foreground')
    .trim()

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        const type = element.dataset.annotate as 'underline' | undefined
        if (type !== 'underline') continue
        const annotation = annotate(element, {
          type: 'underline',
          color: foreground || 'currentColor',
          strokeWidth: 1.5,
          padding: 2,
          animationDuration: 600,
          iterations: 2,
        })
        window.setTimeout(
          () => annotation.show(),
          FADE_SETTLE_MS + UNDERLINE_DELAY_MS,
        )
        observer.unobserve(element)
      }
    },
    { threshold: 0.5 },
  )

  for (const target of targets) observer.observe(target)
}
