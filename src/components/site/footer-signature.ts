export function initFooterSignature(): void {
  const target = document.querySelector<HTMLElement>('[data-signature]')
  if (!target) return
  if (!('IntersectionObserver' in window)) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        ;(entry.target as HTMLElement).dataset.revealed = 'true'
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.4 },
  )

  observer.observe(target)
}
