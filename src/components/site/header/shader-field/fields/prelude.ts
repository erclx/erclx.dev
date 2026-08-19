export const vertexSource = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

// Highp is optional in WebGL1 fragment shaders. The hash below folds large
// coordinates through sin(), which bands visibly under mediump.
export const precisionBlock = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`

/** Hash and gradient noise, shared by every field rather than pasted per look. */
export const noiseBlock = `
const float TAU = 6.2831853;

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  vec2 q = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(q) * 43758.5453123);
}

float gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 g00 = -1.0 + 2.0 * hash2(i);
  vec2 g10 = -1.0 + 2.0 * hash2(i + vec2(1.0, 0.0));
  vec2 g01 = -1.0 + 2.0 * hash2(i + vec2(0.0, 1.0));
  vec2 g11 = -1.0 + 2.0 * hash2(i + vec2(1.0, 1.0));
  return mix(
    mix(dot(g00, f), dot(g10, f - vec2(1.0, 0.0)), u.x),
    mix(dot(g01, f - vec2(0.0, 1.0)), dot(g11, f - vec2(1.0, 1.0)), u.x),
    u.y
  );
}
`

/**
 * Signed distance from the reading column, feathered outward only, so the calm
 * region carries no gradient across the text and no visible edge around it.
 */
export const columnBlock = `
uniform vec2 uContentCenter;
uniform vec2 uContentHalf;
uniform float uContentFeather;

float columnWeight(vec2 px) {
  vec2 toEdge = abs(px - uContentCenter) - uContentHalf;
  float outside =
    length(max(toEdge, 0.0)) + min(max(toEdge.x, toEdge.y), 0.0);
  return 1.0 - smoothstep(0.0, uContentFeather, outside);
}
`
