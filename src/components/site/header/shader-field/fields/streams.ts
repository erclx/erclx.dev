import type { FieldFrame, FieldSpec, UniformLocations } from '../field'
import { columnBlock, noise3Block, noiseBlock, precisionBlock } from './prelude'

export const streamsConfig = {
  fieldCyclesAcross: 2.2,
  lineCount: 13,
  lineHalfWidth: 0.85,
  edgeSoftness: 0.6,
  gradientStep: 1,

  /**
   * Rate along the noise's third axis. Time is an axis of the field rather than
   * a translation of where it is sampled, so the contours form and dissolve
   * where they stand instead of being carried past the viewport. A drift vector
   * is what reads as a current running one way, and this surface carries none.
   *
   * The value is a pace rather than a preference. The fastest term on the
   * surface is the sheen below, whose screen velocity is its drift over its
   * scale: 0.13px per second here, and the pattern renews over roughly two
   * minutes. Ambient motion detected without a reference to judge it against
   * sits near 0.1 to 0.3 degrees per second, which is about 4 to 11px per
   * second at a desk. Anything in that band pulls the eye without rewarding it,
   * which is what an earlier ten-times-faster setting did. This runs an order
   * of magnitude under it, so the band reads as alive rather than as watchable.
   */
  evolveRate: 0.0075,

  sheenCyclesAcross: 1.1,
  // A slow brightness wash over the contours. Its rate was once set apart from
  // the field's and ran four times faster, which made it the fastest thing on
  // the surface and the one a reader actually tracked.
  sheenDriftX: 0.0011,
  sheenDriftY: 0.0004,
  sheenDepth: 0.35,

  contentPadding: 12,
  contentFeather: 90,
  contentDamp: 0.4,
  contentRevealDamp: 0.7,

  // The share of the viewport the reading column takes where damping starts to
  // tighten, and where it reaches its narrow value.
  //
  // The band runs from 0.40 rather than from the 0.45 a first pass used. A
  // tablet at 1366 holds 0.56, which that band answered with a 9% change in
  // damping, so the treatment was a no-op on the only device the complaint
  // came from. The widest desktop sits at 0.40 and stays where it is.
  columnShareLow: 0.4,
  columnShareHigh: 0.75,
  // The floor the damping walks down to, rather than off. At 0.08 the field
  // left the column entirely on a tablet, and the sections far enough down the
  // page for the hero's own surface to have scrolled away read as a flat plate
  // where the sections near the top still borrow that surface. One weight over
  // prose has to mean a weight rather than nothing.
  narrowColumnDamp: 0.25,

  // The pointer raises a hill in the stream function, and the lighting below
  // then picks out its flanks, so the surface reads as displaced rather than
  // recolored under the cursor.
  cursorRadius: 230,
  bumpDepth: 0.34,
  revealRadius: 230,
  revealTint: 0.85,

  /**
   * A click drops a disturbance into the stream function and it travels out
   * from where it landed. It is added to the same value the pointer's hill is
   * added to, before contours are extracted, which is what makes the field go
   * on evolving underneath it and recover on its own once it has passed.
   * Nothing restores anything.
   */
  rippleSpeed: 520,
  rippleWidth: 130,
  rippleFreq: 0.026,
  /**
   * How far a disturbance pushes the stream function, which decides how many
   * contour levels one lobe crosses and therefore how many rings a reader
   * counts. At `lineCount` 13 this draws about nine.
   *
   * It was judged against 0.50, 0.26, and a narrower arm at 0.30, all served
   * live so the choice was driven rather than watched. 0.50 crosses thirteen
   * levels and reads as the surface breaking up rather than reacting.
   */
  rippleDepth: 0.36,
  rippleDecay: 0.85,
  rippleSpread: 420,

  // The gradient runs small in field units per pixel, so the normal needs
  // scaling before it tilts far enough off vertical to shade anything.
  reliefScale: 420,
  heightTint: 0.7,
  // Up and to the left, tilted out of the plane. A light along an axis makes
  // every ridge running that way vanish, which reads as a rendering fault.
  lightDirection: [-0.55, 0.68, 0.48] as const,

  // Cream on near-black reads dimmer than near-black on cream at one alpha, so
  // each theme carries its own rather than deriving from the other.
  lightAlpha: 0.62,
  darkAlpha: 0.82,
  lightRevealAlpha: 0.85,
  darkRevealAlpha: 0.95,
} as const

/** How many clicks can be in flight at once. The oldest is displaced. */
export const RIPPLE_SLOTS = 4

const fragmentSource = `
#define RIPPLE_SLOTS ${RIPPLE_SLOTS}
${precisionBlock}

uniform float uPixelRatio;
uniform float uEvolve;
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
uniform float uBumpDepth;
// Position and age per live click. WebGL1 needs the loop bound to be a
// constant, so the count is fixed here and the mount displaces the oldest.
uniform vec3 uRipples[RIPPLE_SLOTS];
uniform float uRippleActive;
uniform float uRippleSpeed;
uniform float uRippleWidth;
uniform float uRippleFreq;
uniform float uRippleDepth;
uniform float uRippleDecay;
uniform float uRippleSpread;
uniform vec3 uLightDirection;
uniform float uReliefScale;
uniform float uHeightTint;
uniform float uRevealRadius;
uniform float uRevealTint;
uniform float uRevealAlpha;
uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uAlpha;
uniform float uContentDamp;
uniform float uContentRevealDamp;

${noiseBlock}
${noise3Block}
${columnBlock}

float streamFunction(vec2 px) {
  vec3 q = vec3(px * uFieldScale, uEvolve);
  float sum = gradientNoise3(q) * 0.65;
  sum += gradientNoise3(q * 2.17 + 13.7) * 0.35;

  float r = distance(px, uCursor) / uCursorRadius;
  sum += uBumpDepth * uCursorStrength * exp(-r * r);

  // Each live click contributes a wave packet: an oscillation held inside a
  // traveling envelope. The envelope's centre is the wavefront, so at the
  // moment of the click it sits on the click and reads as the drop, and it
  // moves outward from there.
  //
  // Three terms take it back to nothing without anything restoring it. The
  // envelope confines the disturbance to a band, so the field ahead of and
  // behind the front is untouched. Age fades the whole packet. Distance
  // spreads its energy the way a ring on water loses height as it widens.
  //
  // The whole block is skipped while nothing is in flight, which is the
  // surface's resting state and almost all of its life. One uniform decides
  // it, so every fragment takes the same side and the branch stays coherent.
  // Without it a resting page paid four exponential and four sine terms per
  // sample, at three samples per fragment, for a term summing to zero.
  if (uRippleActive > 0.5) {
    for (int i = 0; i < RIPPLE_SLOTS; i++) {
      vec3 rip = uRipples[i];
      // A masked term rather than a branch, since inside the block an empty
      // slot has to cost what a full one costs for every fragment.
      float alive = step(0.0, rip.z);
      float d = distance(px, rip.xy);
      float band = d - rip.z * uRippleSpeed;
      float envelope = exp(-(band * band) / (uRippleWidth * uRippleWidth));
      float decay = exp(-rip.z * uRippleDecay);
      float spread = uRippleSpread / (uRippleSpread + d);
      sum +=
        uRippleDepth * alive * envelope * decay * spread *
        sin(band * uRippleFreq);
    }
  }

  return sum;
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

  // The same gradient that evens the line width is the surface normal of the
  // field read as a height map, so lighting it costs no extra sampling.
  vec3 normal = normalize(vec3(-gradient * uReliefScale, 1.0));
  float lambert = clamp(dot(normal, normalize(uLightDirection)), 0.0, 1.0);
  float relief = 0.35 + 1.25 * lambert;

  // Height read off the field itself, so low ground sits back from high ground
  // where the lighting happens to run edge-on and states nothing.
  float height = clamp(psi * 1.4 + 0.5, 0.0, 1.0);
  float depth = mix(1.0, 0.55 + 0.65 * height, uHeightTint);

  float sheen = gradientNoise(px * uSheenScale + uSheenDrift);
  float travel = mix(1.0 - uSheenDepth, 1.0, 0.5 + 0.5 * sheen);

  float reveal =
    uCursorStrength *
    (1.0 - smoothstep(0.0, uRevealRadius, distance(px, uCursor)));

  float column = columnWeight(px);

  // The resting field and the reveal damp by different amounts. One value for
  // both leaves a lit line dimmer than the ambient field around it, so the
  // reveal disappears exactly where a reader's pointer spends its time.
  float restAlpha =
    uAlpha * travel * relief * depth * mix(1.0, uContentDamp, column);
  float liftAlpha = uRevealAlpha * mix(1.0, uContentRevealDamp, column);

  vec3 tone = mix(uColor, uAccent, reveal * uRevealTint);
  float alpha = mix(restAlpha, liftAlpha, reveal);

  gl_FragColor = vec4(tone, clamp(alpha, 0.0, 1.0) * coverage);
}
`

const uniformNames = [
  'uPixelRatio',
  'uEvolve',
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
  'uBumpDepth',
  'uRipples[0]',
  'uRippleActive',
  'uRippleSpeed',
  'uRippleWidth',
  'uRippleFreq',
  'uRippleDepth',
  'uRippleDecay',
  'uRippleSpread',
  'uLightDirection',
  'uReliefScale',
  'uHeightTint',
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

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * The fraction the field's resting alpha is multiplied by inside the reading
 * column.
 *
 * One flat fraction is what shipped and it holds at every width, while the
 * column's share of the pattern does not. The field's scale divides by the
 * viewport, so the whole drawing squeezes as the screen narrows and the column
 * crosses steadily more contours at an unchanged weight. Measured inside the
 * column in the dark theme, the field lays 0.08% of its pixels at 1920 and
 * 1.29% at 390, which is the difference a reader met as contours crossing the
 * prose on a tablet and staying off it on a desktop.
 */
function resolveColumnDamp(frame: FieldFrame): number {
  const { content, width, columnTreatment } = frame
  if (!content) return 1

  if (columnTreatment === 'share') {
    // The measured box carries the padding the mount added around it, which is
    // margin rather than column, so reading it as column overstates the share
    // on exactly the narrow widths this treatment exists for.
    const columnWidth = (content.halfX - streamsConfig.contentPadding) * 2
    const travel = smoothstep(
      streamsConfig.columnShareLow,
      streamsConfig.columnShareHigh,
      columnWidth / width,
    )
    return (
      streamsConfig.contentDamp +
      (streamsConfig.narrowColumnDamp - streamsConfig.contentDamp) * travel
    )
  }

  return streamsConfig.contentDamp
}

export const streamsField: FieldSpec = {
  fragmentSource,
  uniformNames,

  writeUniforms(
    gl: WebGLRenderingContext,
    uniforms: UniformLocations,
    frame: FieldFrame,
  ): void {
    const { content, time } = frame

    gl.uniform1f(uniforms.uPixelRatio ?? null, frame.pixelRatio)
    gl.uniform1f(uniforms.uEvolve ?? null, time * streamsConfig.evolveRate)
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
      time * streamsConfig.sheenDriftX,
      time * streamsConfig.sheenDriftY,
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
    gl.uniform1f(uniforms.uBumpDepth ?? null, streamsConfig.bumpDepth)

    // One flat buffer covering every slot, written from the location of the
    // array's first element. A slot the mount is not using carries a negative
    // age, which the shader reads as empty.
    const ripples = new Float32Array(RIPPLE_SLOTS * 3)
    for (let i = 0; i < RIPPLE_SLOTS; i++) {
      const live = frame.ripples[i]
      ripples[i * 3] = live?.x ?? 0
      // Flipped into the fragment's own space, where the origin is the bottom
      // left rather than the top. The cursor above takes the same correction,
      // and a ripple written without it starts its wave at the click's mirror
      // image about the horizontal midline.
      ripples[i * 3 + 1] = frame.height - (live?.y ?? 0)
      ripples[i * 3 + 2] = live?.age ?? -1
    }
    gl.uniform3fv(uniforms['uRipples[0]'] ?? null, ripples)
    gl.uniform1f(
      uniforms.uRippleActive ?? null,
      frame.ripples.length > 0 ? 1 : 0,
    )
    gl.uniform1f(uniforms.uRippleSpeed ?? null, streamsConfig.rippleSpeed)
    gl.uniform1f(uniforms.uRippleWidth ?? null, streamsConfig.rippleWidth)
    gl.uniform1f(uniforms.uRippleFreq ?? null, streamsConfig.rippleFreq)
    gl.uniform1f(uniforms.uRippleDepth ?? null, streamsConfig.rippleDepth)
    gl.uniform1f(uniforms.uRippleDecay ?? null, streamsConfig.rippleDecay)
    gl.uniform1f(uniforms.uRippleSpread ?? null, streamsConfig.rippleSpread)
    gl.uniform3f(
      uniforms.uLightDirection ?? null,
      ...streamsConfig.lightDirection,
    )
    gl.uniform1f(uniforms.uReliefScale ?? null, streamsConfig.reliefScale)
    gl.uniform1f(uniforms.uHeightTint ?? null, streamsConfig.heightTint)
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
      (frame.isDark ? streamsConfig.darkAlpha : streamsConfig.lightAlpha) *
        frame.alphaScale,
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
    gl.uniform1f(uniforms.uContentDamp ?? null, resolveColumnDamp(frame))
    gl.uniform1f(
      uniforms.uContentRevealDamp ?? null,
      content ? streamsConfig.contentRevealDamp : 1,
    )
  },
}
