import type { ContentBox, FieldSpec, Rgb, UniformLocations } from './field'
import { vertexSource } from './fields/prelude'
import { readAccentToken, resolveAccentTint } from './tint'

export const mountConfig = {
  maxPixelRatio: 1.5,
  lowEndPixelRatio: 1,
  degradedPixelRatio: 1,
  lowEndConcurrency: 4,
  lowEndFps: 30,
  // Per frame, so the pointer term reaches most of its travel in about half a
  // second rather than an eighth of one. The faster value made the raised hill
  // dart to the cursor, which reads as reacting rather than responding.
  cursorEase: 0.045,
  contentPadding: 12,
  perfWindowMs: 2000,
  perfFloorFps: 45,
} as const

const fallbackRgb: Rgb = [0.102, 0.094, 0.082]

// A full-screen triangle. Three vertices cover the clip volume with no seam
// down the diagonal a two-triangle quad would carry.
const CLIP_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3])

interface Renderer {
  readonly program: WebGLProgram
  readonly buffer: WebGLBuffer
  readonly uniforms: UniformLocations
  readonly position: number
}

// A value the canvas cannot parse leaves fillStyle at whatever it already held,
// so the black seed is what keeps a failed parse from reading as a real color.
function resolveColorToRgb(value: string): Rgb {
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  const ctx = probe.getContext('2d', { willReadFrequently: true })
  if (!ctx) return fallbackRgb

  ctx.fillStyle = '#000000'
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)

  const { data } = ctx.getImageData(0, 0, 1, 1)
  return [(data[0] ?? 0) / 255, (data[1] ?? 0) / 255, (data[2] ?? 0) / 255]
}

function readToken(token: string): Rgb {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim()
  return value ? resolveColorToRgb(value) : fallbackRgb
}

function isDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

// The light theme's foreground is a near-black that reads grey against cream, so
// the resting field takes the warm muted tone instead. Dark already runs warm.
function readToneRgb(): Rgb {
  return readToken(isDark() ? '--foreground' : '--muted-foreground')
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createRenderer(
  gl: WebGLRenderingContext,
  field: FieldSpec,
): Renderer | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, field.fragmentSource)
  if (!vertex || !fragment) return null

  const program = gl.createProgram()
  const buffer = gl.createBuffer()
  if (!program || !buffer) return null

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }

  const uniforms: UniformLocations = Object.fromEntries(
    field.uniformNames.map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ]),
  )

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, CLIP_TRIANGLE, gl.STATIC_DRAW)

  return {
    program,
    buffer,
    uniforms,
    position: gl.getAttribLocation(program, 'aPosition'),
  }
}

function revealFallback(
  canvas: HTMLCanvasElement,
  fallback: HTMLElement | null,
): void {
  canvas.style.display = 'none'
  if (fallback) fallback.style.display = 'block'
}

export interface MountOptions {
  /**
   * False renders one frame and runs no loop, which is what a reader asking
   * for reduced motion gets. It is the surface itself held still rather than
   * an authored stand-in, so both themes stay art-directed and the still
   * cannot drift from what the shader draws.
   */
  readonly animate: boolean
  /** Multiplies the field's resting alpha. Defaults to the field's own weight. */
  readonly alphaScale?: number
}

export function mountShaderField(
  canvas: HTMLCanvasElement,
  fallback: HTMLElement | null,
  content: HTMLElement | null,
  field: FieldSpec,
  options: MountOptions,
): () => void {
  const { animate, alphaScale = 1 } = options
  const maybeGl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  })

  if (!maybeGl) {
    revealFallback(canvas, fallback)
    return () => {}
  }
  const gl: WebGLRenderingContext = maybeGl

  const lowEnd =
    (navigator.hardwareConcurrency ?? 8) <= mountConfig.lowEndConcurrency
  const ceilingPixelRatio = lowEnd
    ? mountConfig.lowEndPixelRatio
    : mountConfig.maxPixelRatio
  const targetFrameMs = lowEnd ? 1000 / mountConfig.lowEndFps : 1000 / 60
  const accentToken = readAccentToken(resolveAccentTint(window.location.search))

  let renderer = createRenderer(gl, field)
  if (!renderer) {
    revealFallback(canvas, fallback)
    return () => {}
  }

  let pixelRatio = Math.min(window.devicePixelRatio || 1, ceilingPixelRatio)
  let width = 0
  let height = 0
  let contentBox: ContentBox | null = null
  let time = 0
  let tone = readToneRgb()
  let accent = readToken(accentToken)
  let dark = isDark()
  let cursorX = 0
  let cursorY = 0
  let cursorStrength = 0
  let cursorTarget = 0
  let degraded = false
  let contextLost = false
  let rafId = 0
  let lastFrameTime = 0
  let perfWindowStart = 0
  const frameSamples: number[] = []

  function measureContent(canvasRect: DOMRect): void {
    if (!content) {
      contentBox = null
      return
    }
    const box = content.getBoundingClientRect()
    contentBox = {
      halfX: box.width / 2 + mountConfig.contentPadding,
      halfY: box.height / 2 + mountConfig.contentPadding,
      centerX: box.left - canvasRect.left + box.width / 2,
      centerY: height - (box.top - canvasRect.top + box.height / 2),
    }
  }

  function resize(): void {
    const rect = canvas.getBoundingClientRect()
    width = Math.max(1, Math.floor(rect.width))
    height = Math.max(1, Math.floor(rect.height))
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(height * pixelRatio)
    gl.viewport(0, 0, canvas.width, canvas.height)
    measureContent(rect)
  }

  function draw(): void {
    if (!renderer) return
    const { program, buffer, uniforms, position } = renderer

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    field.writeUniforms(gl, uniforms, {
      time,
      width,
      height,
      pixelRatio,
      cursorX,
      cursorY,
      cursorStrength,
      content: contentBox,
      tone,
      accent,
      isDark: dark,
      alphaScale,
    })

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  // Fill rate governs this surface rather than geometry, so the degrade path
  // drops resolution where the particle field sheds particles.
  function degrade(): void {
    degraded = true
    pixelRatio = Math.min(pixelRatio, mountConfig.degradedPixelRatio)
    resize()
  }

  function sample(now: number, elapsed: number): void {
    if (degraded) return
    frameSamples.push(elapsed)
    if (now - perfWindowStart < mountConfig.perfWindowMs) return

    const total = frameSamples.reduce((sum, value) => sum + value, 0)
    if (1000 / (total / frameSamples.length) < mountConfig.perfFloorFps)
      degrade()
    frameSamples.length = 0
    perfWindowStart = now
  }

  function advance(elapsed: number): void {
    time += elapsed / 1000
    cursorStrength += (cursorTarget - cursorStrength) * mountConfig.cursorEase
  }

  function tick(now: number): void {
    rafId = requestAnimationFrame(tick)
    const elapsed = now - lastFrameTime
    if (elapsed < targetFrameMs - 1) return
    lastFrameTime = now

    sample(now, elapsed)
    advance(elapsed)
    draw()
  }

  function start(): void {
    if (rafId || contextLost) return
    lastFrameTime = performance.now()
    perfWindowStart = lastFrameTime
    rafId = requestAnimationFrame(tick)
  }

  function stop(): void {
    if (!rafId) return
    cancelAnimationFrame(rafId)
    rafId = 0
  }

  function handlePointerMove(event: PointerEvent): void {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
    cursorTarget = inside ? 1 : 0
    if (inside) {
      cursorX = x
      cursorY = y
    }
  }

  function handlePointerLeave(): void {
    cursorTarget = 0
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
      if (!animate) draw()
    })
  }

  function handleContextLost(event: Event): void {
    event.preventDefault()
    contextLost = true
    stop()
  }

  function handleContextRestored(): void {
    contextLost = false
    renderer = createRenderer(gl, field)
    if (!renderer) {
      revealFallback(canvas, fallback)
      return
    }
    resize()
    if (animate) start()
    else draw()
  }

  const themeObserver = new MutationObserver(() => {
    dark = isDark()
    tone = readToneRgb()
    accent = readToken(accentToken)
    if (!animate) draw()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  resize()
  window.addEventListener('resize', handleResize)
  canvas.addEventListener('webglcontextlost', handleContextLost)
  canvas.addEventListener('webglcontextrestored', handleContextRestored)

  // A still surface reads no pointer and needs no visibility gate, since there
  // is no loop for either to govern.
  if (animate) {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibility)
    start()
  } else {
    draw()
  }

  return function cleanup(): void {
    stop()
    if (resizeRaf) cancelAnimationFrame(resizeRaf)
    themeObserver.disconnect()
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerleave', handlePointerLeave)
    document.removeEventListener('visibilitychange', handleVisibility)
    canvas.removeEventListener('webglcontextlost', handleContextLost)
    canvas.removeEventListener('webglcontextrestored', handleContextRestored)
  }
}
