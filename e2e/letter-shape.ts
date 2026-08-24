import type { Page } from '@playwright/test'

export interface LetterShape {
  readonly inked: number
  readonly largestHole: number
}

export type InkClassifier =
  | {
      readonly mode: 'luminance'
      readonly threshold: number
      readonly direction: 'below' | 'above'
    }
  | {
      readonly mode: 'colorMatch'
      readonly target: readonly [number, number, number]
      readonly tolerance: number
    }

/**
 * Loads `href` as an image, draws it scaled to `size`, classifies each pixel
 * as ink or ground per `classifier`, and flood-fills the ground to find the
 * largest region that never touches the frame's edge. That region is a hole
 * in the drawing, the eye of the `e` this mark is built around, and a filled
 * shape carries more ink than an open one, so a plain ink-coverage count
 * rises as the letter fails rather than falling.
 */
export async function measureLetterShape(
  page: Page,
  href: string,
  size: number,
  classifier: InkClassifier,
): Promise<LetterShape> {
  return page.evaluate(
    async ({ href, size, classifier }) => {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const candidate = new Image()
        candidate.onload = () => resolve(candidate)
        candidate.onerror = () => reject(new Error(`failed to load ${href}`))
        candidate.src = href
      })

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) throw new Error('no 2d context')
      context.drawImage(image, 0, 0, size, size)
      const { data } = context.getImageData(0, 0, size, size)

      const isInk = (x: number, y: number) => {
        const offset = (y * size + x) * 4
        const red = data[offset] ?? 0
        const green = data[offset + 1] ?? 0
        const blue = data[offset + 2] ?? 0

        if (classifier.mode === 'luminance') {
          const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue
          return classifier.direction === 'below'
            ? luminance < classifier.threshold
            : luminance > classifier.threshold
        }

        const [targetRed, targetGreen, targetBlue] = classifier.target
        const distance = Math.sqrt(
          (red - targetRed) ** 2 +
            (green - targetGreen) ** 2 +
            (blue - targetBlue) ** 2,
        )
        return distance < classifier.tolerance
      }

      let inked = 0
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) if (isInk(x, y)) inked += 1
      }

      const seen = new Set<number>()
      let largestHole = 0

      for (let startY = 0; startY < size; startY += 1) {
        for (let startX = 0; startX < size; startX += 1) {
          if (seen.has(startY * size + startX)) continue
          if (isInk(startX, startY)) continue

          const queue = [{ x: startX, y: startY }]
          let holeSize = 0
          let touchesEdge = false

          while (queue.length) {
            const point = queue.pop()
            if (!point) break
            const key = point.y * size + point.x
            if (seen.has(key)) continue
            if (
              point.x < 0 ||
              point.x > size - 1 ||
              point.y < 0 ||
              point.y > size - 1
            ) {
              touchesEdge = true
              continue
            }
            if (isInk(point.x, point.y)) continue
            seen.add(key)
            holeSize += 1
            queue.push(
              { x: point.x + 1, y: point.y },
              { x: point.x - 1, y: point.y },
              { x: point.x, y: point.y + 1 },
              { x: point.x, y: point.y - 1 },
            )
          }

          if (!touchesEdge && holeSize > largestHole) largestHole = holeSize
        }
      }

      return { inked, largestHole }
    },
    { href, size, classifier },
  )
}
