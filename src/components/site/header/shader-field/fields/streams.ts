import type { FieldFrame, FieldSpec, UniformLocations } from '../field'
import { columnBlock, noiseBlock, precisionBlock } from './prelude'

export const streamsConfig = {
  // Cycles of the stream function across the band's width rather than a fixed
  // wavelength, so a phone meets the same composition a desktop does.
  fieldCyclesAcross: 2.2,
  // Contours drawn per unit of the stream function. The function runs about
  // plus or minus 0.7, so this is roughly the line count across the band.
  lineCount: 13,
  lineHalfWidth: 0.85,
  edgeSoftness: 0.6,
  // The domain travels rather than the lines being advected along themselves,
  // which is what a contour of a moving field does and costs one addition.
  driftX: 0.026,
  driftY: -0.014,
  // A forward difference over one CSS pixel. The gradient converts a distance
  // in stream-function units into one in pixels, which is what holds the lines
  // at an even width where the field steepens.
  gradientStep: 1,
  // A second slow field rides over the lines so a ribbon brightens and fades as
  // it travels, rather than every line holding one value for the whole loop.
  sheenCyclesAcross: 1.1,
  sheenDriftX: 0.05,
  sheenDriftY: 0.018,
  sheenDepth: 0.35,
  contentPadding: 12,
  contentFeather: 90,
  contentDamp: 0.4,
  contentRevealDamp: 0.7,
  // The pointer adds a bump to the stream function, so contours bend around it
  // the way a flow bends around an obstacle. Depth is in stream-function units.
  cursorRadius: 230,
  cursorDepth: 0.16,
  revealRadius: 230,
  revealTint: 0.85,
  // Cream on near-black reads dimmer than near-black on cream at one alpha, so
  // each theme carries its own rather than deriving from the other.
  lightAlpha: 0.62,
  darkAlpha: 0.82,
  lightRevealAlpha: 0.85,
  darkRevealAlpha: 0.95,
} as const

const fragmentSource = `
${precisionBlock}

uniform float uPixelRatio;
uniform vec2 uDrift;
uniform float uFieldScale;
uniform float uLineCount;
uniform float uLineHalfWidth;
uniform float uEdgeSoftness;
uniform float uGradientStep;
uniform vec2 uSheenDrift;
uniform float uSheenScale;
uniform float uSheenDepth;
uniform vec2 uCursor;
uniform float uCursorStrength;
uniform float uCursorRadius;
uniform float uCursorDepth;
uniform float uRevealRadius;
uniform float uRevealTint;
uniform float uRevealAlpha;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uAlpha;
uniform float uContentDamp;
uniform float uContentRevealDamp;

${noiseBlock}
${columnBlock}

// The pointer raises a smooth bump in the stream function. Contours of a field
// plus a bump bend around it, so the flow parts at the cursor rather than the
// lines being pushed sideways by a displacement term.
float cursorBump(vec2 px) {
  float d = distance(px, uCursor) / uCursorRadius;
  return uCursorStrength * uCursorDepth * exp(-d * d);
}

// Two octaves rather than three. The gradient below costs two more evaluations
// of this function, so an octave here is three octaves of cost per pixel.
float streamFunction(vec2 px) {
  vec2 q = px * uFieldScale + uDrift;
  float sum = gradientNoise(q) * 0.65;
  sum += gradientNoise(q * 2.17 + 13.7) * 0.35;
  return sum + cursorBump(px);
}

void main() {
  vec2 px = gl_FragCoord.xy / uPixelRatio;

  float psi = streamFunction(px);

  // Forward differences rather than fwidth(), which would need the derivatives
  // extension WebGL1 makes optional.
  float e = uGradientStep;
  vec2 gradient = vec2(
    streamFunction(px + vec2(e, 0.0)) - psi,
    streamFunction(px + vec2(0.0, e)) - psi
  ) / e;

  // Distance to the nearest contour, carried from stream-function units into
  // pixels by the gradient. Where the field flattens the gradient vanishes and
  // the contours genuinely are far apart, so no line is drawn and none is due.
  float v = psi * uLineCount;
  float toLine = min(fract(v), 1.0 - fract(v));
  float slope = uLineCount * length(gradient);
  float distancePx = toLine / max(slope, 1e-5);

  float coverage =
    1.0 -
    smoothstep(
      uLineHalfWidth - uEdgeSoftness,
      uLineHalfWidth + uEdgeSoftness,
      distancePx
    );

  float sheen = gradientNoise(px * uSheenScale + uSheenDrift);
  float travel = mix(1.0 - uSheenDepth, 1.0, 0.5 + 0.5 * sheen);

  float reveal =
    uCursorStrength *
    (1.0 - smoothstep(0.0, uRevealRadius, distance(px, uCursor)));

  float column = columnWeight(px);

  // The resting field and the reveal damp by different amounts. One value for
  // both leaves a lit line dimmer than the ambient field around it, so the
  // reveal disappears exactly where a reader's pointer spends its time.
  float restAlpha = uAlpha * travel * mix(1.0, uContentDamp, column);
  float liftAlpha = uRevealAlpha * mix(1.0, uContentRevealDamp, column);

  vec3 tone = mix(uColor, uAccent, reveal * uRevealTint);
  float alpha = mix(restAlpha, liftAlpha, reveal);

  gl_FragColor = vec4(tone, alpha * coverage);
}
`

const uniformNames = [
  'uPixelRatio',
  'uDrift',
  'uFieldScale',
  'uLineCount',
  'uLineHalfWidth',
  'uEdgeSoftness',
  'uGradientStep',
  'uSheenDrift',
  'uSheenScale',
  'uSheenDepth',
  'uCursor',
  'uCursorStrength',
  'uCursorRadius',
  'uCursorDepth',
  'uRevealRadius',
  'uRevealTint',
  'uRevealAlpha',
  'uColor',
  'uAccent',
  'uAlpha',
  'uContentCenter',
  'uContentHalf',
  'uContentFeather',
  'uContentDamp',
  'uContentRevealDamp',
] as const

export const streamsField: FieldSpec = {
  fragmentSource,
  uniformNames,

  writeUniforms(
    gl: WebGLRenderingContext,
    uniforms: UniformLocations,
    frame: FieldFrame,
  ): void {
    const { content } = frame

    gl.uniform1f(uniforms.uPixelRatio ?? null, frame.pixelRatio)
    gl.uniform2f(
      uniforms.uDrift ?? null,
      frame.time * streamsConfig.driftX,
      frame.time * streamsConfig.driftY,
    )
    gl.uniform1f(
      uniforms.uFieldScale ?? null,
      streamsConfig.fieldCyclesAcross / frame.width,
    )
    gl.uniform1f(uniforms.uLineCount ?? null, streamsConfig.lineCount)
    gl.uniform1f(uniforms.uLineHalfWidth ?? null, streamsConfig.lineHalfWidth)
    gl.uniform1f(uniforms.uEdgeSoftness ?? null, streamsConfig.edgeSoftness)
    gl.uniform1f(uniforms.uGradientStep ?? null, streamsConfig.gradientStep)
    gl.uniform2f(
      uniforms.uSheenDrift ?? null,
      frame.time * streamsConfig.sheenDriftX,
      frame.time * streamsConfig.sheenDriftY,
    )
    gl.uniform1f(
      uniforms.uSheenScale ?? null,
      streamsConfig.sheenCyclesAcross / frame.width,
    )
    gl.uniform1f(uniforms.uSheenDepth ?? null, streamsConfig.sheenDepth)
    gl.uniform2f(
      uniforms.uCursor ?? null,
      frame.cursorX,
      frame.height - frame.cursorY,
    )
    gl.uniform1f(uniforms.uCursorStrength ?? null, frame.cursorStrength)
    gl.uniform1f(uniforms.uCursorRadius ?? null, streamsConfig.cursorRadius)
    gl.uniform1f(uniforms.uCursorDepth ?? null, streamsConfig.cursorDepth)
    gl.uniform1f(uniforms.uRevealRadius ?? null, streamsConfig.revealRadius)
    gl.uniform1f(uniforms.uRevealTint ?? null, streamsConfig.revealTint)
    gl.uniform1f(
      uniforms.uRevealAlpha ?? null,
      frame.isDark
        ? streamsConfig.darkRevealAlpha
        : streamsConfig.lightRevealAlpha,
    )
    gl.uniform3f(uniforms.uColor ?? null, ...frame.tone)
    gl.uniform3f(uniforms.uAccent ?? null, ...frame.accent)
    gl.uniform1f(
      uniforms.uAlpha ?? null,
      frame.isDark ? streamsConfig.darkAlpha : streamsConfig.lightAlpha,
    )
    gl.uniform2f(
      uniforms.uContentCenter ?? null,
      content?.centerX ?? 0,
      content?.centerY ?? 0,
    )
    gl.uniform2f(
      uniforms.uContentHalf ?? null,
      content?.halfX ?? 0,
      content?.halfY ?? 0,
    )
    gl.uniform1f(uniforms.uContentFeather ?? null, streamsConfig.contentFeather)
    gl.uniform1f(
      uniforms.uContentDamp ?? null,
      content ? streamsConfig.contentDamp : 1,
    )
    gl.uniform1f(
      uniforms.uContentRevealDamp ?? null,
      content ? streamsConfig.contentRevealDamp : 1,
    )
  },
}
