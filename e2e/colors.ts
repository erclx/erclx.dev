import type { Locator } from '@playwright/test'

type Rgb = [number, number, number]

type ColorProperty = 'backgroundColor' | 'color' | 'outlineColor'

// Read the color the engine actually paints. A token declared in oklch comes
// back from getComputedStyle in whichever form the engine prefers, so the
// canvas parses it into channels every engine agrees on.
export async function paintedColor(
  target: Locator,
  property: ColorProperty,
): Promise<Rgb> {
  return target.evaluate((element, styleProperty) => {
    const declared = getComputedStyle(element)[styleProperty as ColorProperty]
    const context = document.createElement('canvas').getContext('2d')
    if (!context) throw new Error('Canvas 2D context is unavailable')
    context.fillStyle = declared
    context.fillRect(0, 0, 1, 1)
    const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
    return [red, green, blue] as [number, number, number]
  }, property)
}

export function relativeLuminance([red, green, blue]: Rgb): number {
  const channel = (value: number): number => {
    const ratio = value / 255
    return ratio <= 0.03928 ? ratio / 12.92 : ((ratio + 0.055) / 1.055) ** 2.4
  }
  return (
    0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
  )
}

export function contrastRatio(first: Rgb, second: Rgb): number {
  const [lighter, darker] = [
    relativeLuminance(first),
    relativeLuminance(second),
  ].sort((left, right) => right - left)
  return (lighter + 0.05) / (darker + 0.05)
}
