export const config = {
  particleCount: 200,
  noiseScale: 0.0025,
  noiseSpeed: 0.0006,
  particleSpeed: 0.6,
  cursorRadius: 180,
  cursorStrength: 0.35,
  trailLength: 10,
  baseAlpha: 0.2,
  minLifespan: 200,
  maxLifespan: 600,
  lowEndConcurrency: 4,
  lowEndParticleRatio: 0.5,
  lowEndFps: 30,
  perfWindowMs: 2000,
  perfFloorFps: 50,
} as const

export type FlowFieldConfig = typeof config
