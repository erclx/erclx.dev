import { streamsField } from './fields/streams'
import { mountShaderField } from './mount'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

declare global {
  interface Window {
    __shaderStill?: boolean
  }
}

export function initShaderField(): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>(
    '[data-shader-field]',
  )
  if (!canvas) return () => {}

  const fallback = document.querySelector<HTMLElement>(
    '[data-shader-field-fallback]',
  )
  const content = document.querySelector<HTMLElement>('[data-shader-content]')
  const portrait = document.querySelector<HTMLElement>('header [data-portrait]')
  // `e2e/fixtures.ts` is the only writer of the still request, so a visitor
  // never carries it and the suite stops paying for a loop drawn in software.
  const animate =
    !window.matchMedia(reducedMotionQuery).matches &&
    window.__shaderStill !== true

  // A still surface is drawn on arrival like a moving one, so the observer
  // gates both rather than only the loop. What it saves under reduced motion is
  // the compile and the single draw on a page whose header is never reached.
  let cleanup: () => void = () => {}
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // No share damping here, which the page ground carries. This surface
          // damps around a heading rather than around prose, and at phone width
          // that heading is most of the screen, so a curve written for a
          // reading column would empty the band behind the name.
          cleanup = mountShaderField(canvas, fallback, content, streamsField, {
            animate,
            portrait,
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
