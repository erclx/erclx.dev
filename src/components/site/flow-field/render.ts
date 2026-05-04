import { config } from './config'
import type { ParticlePool } from './particle'

export interface RenderContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  strokeColor: string
}

export function render(pool: ParticlePool, rc: RenderContext): void {
  const { ctx, width, height, strokeColor } = rc
  const { baseAlpha } = config

  ctx.clearRect(0, 0, width, height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1
  ctx.strokeStyle = strokeColor

  const trailLength = pool.trailLength

  for (let i = 0; i < pool.count; i++) {
    const filled = pool.historyFilled[i]
    if (filled < 2) continue

    const lifeFraction = pool.ages[i] / pool.lifespans[i]
    const lifeAlpha =
      lifeFraction < 0.1
        ? lifeFraction / 0.1
        : lifeFraction > 0.85
          ? (1 - lifeFraction) / 0.15
          : 1

    ctx.globalAlpha = baseAlpha * lifeAlpha
    ctx.beginPath()

    const head = pool.historyHead[i]
    const histBase = i * trailLength * 2
    const start = (head - filled + 1 + trailLength) % trailLength
    const startIdx = histBase + start * 2
    ctx.moveTo(pool.history[startIdx], pool.history[startIdx + 1])

    for (let k = 1; k < filled; k++) {
      const idx = (start + k) % trailLength
      const offset = histBase + idx * 2
      ctx.lineTo(pool.history[offset], pool.history[offset + 1])
    }
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}
