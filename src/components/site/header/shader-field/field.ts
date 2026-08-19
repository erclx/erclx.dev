export type Rgb = readonly [number, number, number]

export type UniformLocations = Record<string, WebGLUniformLocation | null>

export interface ContentBox {
  readonly centerX: number
  readonly centerY: number
  readonly halfX: number
  readonly halfY: number
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
  /** Null where the reading column could not be measured, which lifts damping. */
  readonly content: ContentBox | null
  readonly tone: Rgb
  readonly accent: Rgb
  readonly isDark: boolean
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
