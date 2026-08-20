export type Rgb = readonly [number, number, number]

export type UniformLocations = Record<string, WebGLUniformLocation | null>

export interface ContentBox {
  readonly centerX: number
  readonly centerY: number
  readonly halfX: number
  readonly halfY: number
}

/** A disturbance a click left behind, traveling outward from where it landed. */
export interface Ripple {
  readonly x: number
  readonly y: number
  /** Seconds since the click. Negative marks the slot as carrying nothing. */
  readonly age: number
}

/** The per-frame state the mount owns and every field reads. */
export interface FieldFrame {
  readonly time: number
  readonly width: number
  readonly height: number
  readonly pixelRatio: number
  readonly cursorX: number
  readonly cursorY: number
  readonly cursorStrength: number
  /**
   * Always the same length, so the shader's loop bound stays constant and an
   * empty slot is one carrying a negative age rather than one that is absent.
   */
  readonly ripples: readonly Ripple[]
  /** Null where the reading column could not be measured, which lifts damping. */
  readonly content: ContentBox | null
  readonly tone: Rgb
  readonly accent: Rgb
  readonly isDark: boolean
  /**
   * Scales the resting alpha the field would otherwise carry. One surface is
   * the page's opener and another is the ground under its prose, and the same
   * drawing has to sit at two weights without becoming two drawings.
   */
  readonly alphaScale: number
}

/**
 * One authored look. The mount owns everything a surface needs regardless of
 * what it draws, so a field supplies only its own program and the values that
 * program reads.
 */
export interface FieldSpec {
  readonly fragmentSource: string
  readonly uniformNames: readonly string[]
  writeUniforms(
    gl: WebGLRenderingContext,
    uniforms: UniformLocations,
    frame: FieldFrame,
  ): void
}
