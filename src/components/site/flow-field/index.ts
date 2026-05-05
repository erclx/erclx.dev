import { config } from './config'
import { createNoise2D } from './noise'
import { createPool, spawnAll, step } from './particle'
import { render } from './render'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function readForegroundColor(): string {
  const root = document.documentElement
  const value = getComputedStyle(root).getPropertyValue('--foreground').trim()
  return value || 'oklch(0.165 0.004 286)'
}

function mountFlowField(canvas: HTMLCanvasElement): () => void {
  const maybeCtx = canvas.getContext('2d', { alpha: true })
  if (!maybeCtx) return () => {}
  const ctx: CanvasRenderingContext2D = maybeCtx

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const lowEnd =
    (navigator.hardwareConcurrency ?? 8) <= config.lowEndConcurrency
  const initialCount = Math.round(
    config.particleCount * (lowEnd ? config.lowEndParticleRatio : 1),
  )
  const targetFrameMs = lowEnd ? 1000 / config.lowEndFps : 1000 / 60

  const pool = createPool(initialCount, config.trailLength)
  const noise2D = createNoise2D()

  let width = 0
  let height = 0
  let cursorX = 0
  let cursorY = 0
  let cursorActive = false
  let noiseT = 0
  let strokeColor = readForegroundColor()
  let degraded = false
  const frameSamples: number[] = []
  let perfWindowStart = 0

  function resize(): void {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, Math.floor(rect.width))
    height = Math.max(1, Math.floor(rect.height))
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    spawnAll(pool, width, height)
  }

  function handlePointerMove(event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
    cursorActive = inside
    if (inside) {
      cursorX = x
      cursorY = y
    }
  }

  function handlePointerLeave(): void {
    cursorActive = false
  }

  function handleVisibility(): void {
    if (document.hidden) stop()
    else start()
  }

  let resizeRaf = 0
  function handleResize(): void {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0
      resize()
    })
  }

  const themeObserver = new MutationObserver(() => {
    strokeColor = readForegroundColor()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  let rafId = 0
  let lastFrameTime = 0
  function tick(now: number): void {
    rafId = requestAnimationFrame(tick)
    const elapsed = now - lastFrameTime
    if (elapsed < targetFrameMs - 1) return
    lastFrameTime = now

    if (!degraded) {
      frameSamples.push(elapsed)
      if (now - perfWindowStart >= config.perfWindowMs) {
        const avg =
          frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length
        const fps = 1000 / avg
        if (fps < config.perfFloorFps) {
          degrade()
        }
        frameSamples.length = 0
        perfWindowStart = now
      }
    }

    noiseT += config.noiseSpeed * (elapsed / 16.6667)
    step(pool, {
      width,
      height,
      noiseT,
      cursorX,
      cursorY,
      cursorActive,
      noise2D,
    })
    render(pool, { ctx, width, height, strokeColor })
  }

  function degrade(): void {
    degraded = true
    const reducedCount = Math.round(initialCount * config.lowEndParticleRatio)
    pool.count = reducedCount
    spawnAll(pool, width, height)
  }

  function start(): void {
    if (rafId) return
    lastFrameTime = performance.now()
    perfWindowStart = lastFrameTime
    rafId = requestAnimationFrame(tick)
  }

  function stop(): void {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  resize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerleave', handlePointerLeave)
  document.addEventListener('visibilitychange', handleVisibility)
  start()

  return function cleanup(): void {
    stop()
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    themeObserver.disconnect()
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerleave', handlePointerLeave)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}

export function initFlowField(): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-flow-field]')
  if (!canvas) return () => {}
  if (window.matchMedia(reducedMotionQuery).matches) {
    canvas.style.display = 'none'
    return () => {}
  }
  let cleanup: () => void = () => {}
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          cleanup = mountFlowField(canvas)
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
