import { streamsField } from './fields/streams'
import { mountShaderField } from './mount'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

export function initShaderField(): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>(
    '[data-shader-field]',
  )
  if (!canvas) return () => {}

  const fallback = document.querySelector<HTMLElement>(
    '[data-shader-field-fallback]',
  )
  const content = document.querySelector<HTMLElement>('[data-shader-content]')
  const animate = !window.matchMedia(reducedMotionQuery).matches

  // A still surface is drawn on arrival like a moving one, so the observer
  // gates both rather than only the loop. What it saves under reduced motion is
  // the compile and the single draw on a page whose header is never reached.
  let cleanup: () => void = () => {}
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          cleanup = mountShaderField(canvas, fallback, content, streamsField, {
            animate,
          })
          observer.disconnect()
          break
        }
      }
    },
    { rootMargin: '0px' },
  )
  observer.observe(canvas)

  return () => {
    observer.disconnect()
    cleanup()
  }
}
