import { hasHoverPointer } from '@/lib/pointer'

import type {
  ColumnTreatment,
  ContentBox,
  FieldSpec,
  PortraitBox,
  Rgb,
  UniformLocations,
} from './field'
import { vertexSource } from './fields/prelude'
import { RIPPLE_SLOTS, streamsConfig } from './fields/streams'

/** The amplitude a disturbance is considered retired below. */
const RIPPLE_RETIREMENT_FRACTION = 1 / 1000

export const mountConfig = {
  // Matches a dense display rather than sitting under one. At 1.5 the field is
  // drawn below the resolution the screen paints at and the panel interpolates
  // the difference, which softens every contour and pulls its peak down: a
  // tablet reporting a ratio of 2 was being handed a surface rendered at 1.5
  // and stretched, so the same drawing read crisp on a desktop and washed out
  // there. The frame guard below is what protects a device that cannot afford
  // this, by measuring what it actually draws rather than by capping up front.
  maxPixelRatio: 2,
  lowEndPixelRatio: 1,
  degradedPixelRatio: 1,
  lowEndConcurrency: 4,
  lowEndFps: 30,
  // Per frame, so the pointer term reaches most of its travel in about half a
  // second rather than an eighth of one. The faster value made the raised hill
  // dart to the cursor, which reads as reacting rather than responding.
  cursorEase: 0.045,
  // Where the field's own decay has taken a disturbance under a thousandth of
  // its starting amplitude. The decay rate is what sets how long one lasts, so
  // this reads that rate rather than restating its consequence: a slot held
  // past the retirement costs every fragment a term contributing nothing, and
  // one retired early cuts the disturbance off while it is still visible.
  rippleLifetimeSeconds:
    Math.log(1 / RIPPLE_RETIREMENT_FRACTION) / streamsConfig.rippleDecay,
  contentPadding: 12,
  perfWindowMs: 2000,
  // A fraction of whatever rate the throttle targets rather than a fixed count.
  // Held at 45 against a 30fps throttle it marked every frame a failure, since
  // the throttle itself holds elapsed near 33.3ms, so a device reporting four
  // cores degraded inside its first window whatever it could actually draw.
  perfFloorRatio: 0.75,
  /** How far a press may travel and still read as a tap rather than a drag. */
  tapSlopPx: 10,
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

// Clearing the inline values rather than assigning them, so the canvas returns
// to its own display and the fallback to the class that hides it.
function hideFallback(
  canvas: HTMLCanvasElement,
  fallback: HTMLElement | null,
): void {
  canvas.style.display = ''
  if (fallback) fallback.style.display = ''
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
  /** Defaults to one damping fraction at every width. */
  readonly columnTreatment?: ColumnTreatment
  /**
   * The photo a field may bend its contours around. Absent on every surface
   * that floats none, which leaves the field reading exactly as it does today.
   */
  readonly portrait?: HTMLElement | null
}

export function mountShaderField(
  canvas: HTMLCanvasElement,
  fallback: HTMLElement | null,
  content: HTMLElement | null,
  field: FieldSpec,
  options: MountOptions,
): () => void {
  const {
    animate,
    alphaScale = 1,
    columnTreatment = 'flat',
    portrait = null,
  } = options
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
  // The reserved accent, which the experience timeline's active dot and the
  // rail's position marker already carry, so one warm accent answers the whole
  // page. An amber arm was built against it and is removed with its switch.
  const accentToken = '--accent'

  let renderer = createRenderer(gl, field)
  if (!renderer) {
    revealFallback(canvas, fallback)
    return () => {}
  }

  let pixelRatio = Math.min(window.devicePixelRatio || 1, ceilingPixelRatio)
  let width = 0
  let height = 0
  let contentBox: ContentBox | null = null
  let portraitBox: PortraitBox | null = null
  let time = 0
  let tone = readToneRgb()
  let accent = readToken(accentToken)
  let dark = isDark()
  let cursorX = 0
  let cursorY = 0
  let cursorStrength = 0
  let cursorTarget = 0
  // Where a press landed, and whether it is still a candidate for a tap.
  let pressX = 0
  let pressY = 0
  let pressed = false
  // Ages in seconds, oldest first. A click appends and the oldest is dropped
  // once the set is full, so a reader clicking repeatedly always gets an
  // answer and the shader's loop bound never has to change.
  let ripples: { x: number; y: number; age: number }[] = []
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

  // The photo is a circle inscribed in a square box, so its radius is half of
  // either side. Reading the width alone would report an ellipse's semi-axis
  // the moment the frame stops being square.
  function measurePortrait(canvasRect: DOMRect): void {
    if (!portrait) {
      portraitBox = null
      return
    }
    const box = portrait.getBoundingClientRect()
    portraitBox = {
      radius: Math.min(box.width, box.height) / 2,
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
    measurePortrait(rect)
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
      ripples,
      content: contentBox,
      portrait: portraitBox,
      tone,
      accent,
      isDark: dark,
      alphaScale,
      columnTreatment,
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
    const floorFps = (1000 / targetFrameMs) * mountConfig.perfFloorRatio
    if (1000 / (total / frameSamples.length) < floorFps) degrade()
    frameSamples.length = 0
    perfWindowStart = now
  }

  function advance(elapsed: number): void {
    const seconds = elapsed / 1000
    time += seconds
    cursorStrength += (cursorTarget - cursorStrength) * mountConfig.cursorEase

    // A disturbance is retired once its own decay has taken it under a
    // thousandth of its starting amplitude, rather than at a duration written
    // here. The decay rate is what sets how long one lasts, so a retirement
    // keyed to anything else drifts from it the moment that rate is tuned.
    for (const ripple of ripples) ripple.age += seconds
    ripples = ripples.filter(
      (ripple) => ripple.age < mountConfig.rippleLifetimeSeconds,
    )
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
    // The window restarts, so the samples in it do too. Frames measured before
    // a hidden tab would otherwise average into the first window after it
    // returns, where the gap across the hidden stretch is not a slow frame.
    frameSamples.length = 0
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

  // A tap read off the pointer itself, rather than off `pointerdown` or off a
  // click.
  //
  // `pointerdown` alone is contact and not intent: a finger landing to scroll
  // fires it before anything else, so every scroll a touch reader started
  // dropped a disturbance they had not asked for.
  //
  // A `click` bound on the window looks like the answer and is not. WebKit does
  // not dispatch one to the window for a tap on an element that is not natively
  // interactive, so the response worked on a desktop and did nothing at all on
  // a phone. Nothing in a headless run reports that, and it took a device.
  //
  // A press that does not travel and is not taken over by a scroll is the act
  // on every engine. The browser fires `pointercancel` at the moment it claims
  // the gesture for scrolling, so that is what separates the two, and the slop
  // covers the movement a finger makes while resting still.
  function handlePointerDown(event: PointerEvent): void {
    pressX = event.clientX
    pressY = event.clientY
    pressed = true
  }

  function handlePointerCancel(): void {
    pressed = false
  }

  function handlePointerUp(event: PointerEvent): void {
    if (!pressed) return
    pressed = false
    const distance = Math.hypot(event.clientX - pressX, event.clientY - pressY)
    if (distance > mountConfig.tapSlopPx) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return
    // A click on something a reader meant to operate is not a click on the
    // field, so a control keeps its own meaning and the surface behind it
    // stays still.
    if ((event.target as Element | null)?.closest('a, button, [role="button"]'))
      return
    ripples.push({ x, y, age: 0 })
    if (ripples.length > RIPPLE_SLOTS) ripples.shift()
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
      // The backing store follows the display the canvas is on. A zoom, or a
      // drag onto a screen of a different density, fires this and nothing else,
      // so a ratio read once at mount renders for the density the page loaded
      // with. A degraded surface holds its reduced ratio rather than climbing
      // back to a ceiling the frame guard already rejected.
      const ceiling = degraded
        ? mountConfig.degradedPixelRatio
        : ceilingPixelRatio
      pixelRatio = Math.min(window.devicePixelRatio || 1, ceiling)
      resize()
      if (!animate) draw()
    })
  }

  // A lost context leaves the canvas holding whatever it last drew, which is
  // nothing once the browser clears it, so the band renders empty until a
  // restore that is never guaranteed to arrive. The fallback is what stands in
  // for the surface meanwhile.
  function handleContextLost(event: Event): void {
    event.preventDefault()
    contextLost = true
    stop()
    revealFallback(canvas, fallback)
  }

  function handleContextRestored(): void {
    contextLost = false
    renderer = createRenderer(gl, field)
    if (!renderer) {
      revealFallback(canvas, fallback)
      return
    }
    hideFallback(canvas, fallback)
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
    // The cursor raises a hill under a pointer resting on the surface, which a
    // finger dragging the page past it is not doing. The click above is bound
    // on every device, since it answers an act rather than a position.
    if (hasHoverPointer()) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerleave', handlePointerLeave)
    }
    // Bound on every device, since a tap is an act rather than a position.
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerCancel)
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
    window.removeEventListener('pointerdown', handlePointerDown)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerCancel)
    document.removeEventListener('visibilitychange', handleVisibility)
    canvas.removeEventListener('webglcontextlost', handleContextLost)
    canvas.removeEventListener('webglcontextrestored', handleContextRestored)
  }
}
