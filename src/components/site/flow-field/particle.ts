import { config } from './config'

export interface ParticlePool {
  count: number
  trailLength: number
  positions: Float32Array
  velocities: Float32Array
  ages: Float32Array
  lifespans: Float32Array
  history: Float32Array
  historyHead: Uint16Array
  historyFilled: Uint8Array
}

export function createPool(count: number, trailLength: number): ParticlePool {
  return {
    count,
    trailLength,
    positions: new Float32Array(count * 2),
    velocities: new Float32Array(count * 2),
    ages: new Float32Array(count),
    lifespans: new Float32Array(count),
    history: new Float32Array(count * trailLength * 2),
    historyHead: new Uint16Array(count),
    historyFilled: new Uint8Array(count),
  }
}

export function spawn(
  pool: ParticlePool,
  index: number,
  width: number,
  height: number,
): void {
  const { minLifespan, maxLifespan } = config
  const x = Math.random() * width
  const y = Math.random() * height
  pool.positions[index * 2] = x
  pool.positions[index * 2 + 1] = y
  pool.velocities[index * 2] = 0
  pool.velocities[index * 2 + 1] = 0
  pool.ages[index] = 0
  pool.lifespans[index] =
    minLifespan + Math.random() * (maxLifespan - minLifespan)
  pool.historyHead[index] = 0
  pool.historyFilled[index] = 0
  const base = index * pool.trailLength * 2
  for (let k = 0; k < pool.trailLength; k++) {
    pool.history[base + k * 2] = x
    pool.history[base + k * 2 + 1] = y
  }
}

export function spawnAll(
  pool: ParticlePool,
  width: number,
  height: number,
): void {
  for (let i = 0; i < pool.count; i++) spawn(pool, i, width, height)
}

interface UpdateContext {
  width: number
  height: number
  noiseT: number
  cursorX: number
  cursorY: number
  cursorActive: boolean
  noise2D: (x: number, y: number) => number
}

export function step(pool: ParticlePool, ctx: UpdateContext): void {
  const { width, height, noiseT, cursorX, cursorY, cursorActive, noise2D } = ctx
  const { noiseScale, particleSpeed, cursorRadius, cursorStrength } = config
  const cursorRadiusSq = cursorRadius * cursorRadius
  const trailLength = pool.trailLength

  for (let i = 0; i < pool.count; i++) {
    const px = i * 2
    const py = i * 2 + 1
    let x = pool.positions[px]
    let y = pool.positions[py]

    const angle = noise2D(x * noiseScale + noiseT, y * noiseScale) * Math.PI * 2
    let vx = Math.cos(angle) * particleSpeed
    let vy = Math.sin(angle) * particleSpeed

    if (cursorActive) {
      const dx = cursorX - x
      const dy = cursorY - y
      const distSq = dx * dx + dy * dy
      if (distSq < cursorRadiusSq && distSq > 1) {
        const dist = Math.sqrt(distSq)
        const falloff = 1 - dist / cursorRadius
        const force = falloff * falloff * cursorStrength
        vx += (dx / dist) * force * particleSpeed * 4
        vy += (dy / dist) * force * particleSpeed * 4
      }
    }

    x += vx
    y += vy
    pool.velocities[px] = vx
    pool.velocities[py] = vy

    pool.ages[i] += 1
    const offBounds = x < -20 || x > width + 20 || y < -20 || y > height + 20
    if (pool.ages[i] >= pool.lifespans[i] || offBounds) {
      spawn(pool, i, width, height)
      continue
    }

    pool.positions[px] = x
    pool.positions[py] = y

    const head = (pool.historyHead[i] + 1) % trailLength
    pool.historyHead[i] = head
    if (pool.historyFilled[i] < trailLength) pool.historyFilled[i]++
    const histBase = i * trailLength * 2 + head * 2
    pool.history[histBase] = x
    pool.history[histBase + 1] = y
  }
}
