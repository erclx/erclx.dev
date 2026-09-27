import { type BrowserContext, test as base } from '@playwright/test'

/**
 * Asks every page in the context to draw the hero once and hold it, the way
 * reduced motion does, while leaving the motion preference itself alone. The
 * live loop under SwiftShader was what set the suite's pace, and a spec asserts
 * on the page around the hero rather than on the hero moving.
 */
export async function holdShaderStill(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    window.__shaderStill = true
  })
}

export const test = base.extend<{ shaderLive: boolean }>({
  shaderLive: [false, { option: true }],
  context: async ({ context, shaderLive }, use) => {
    if (!shaderLive) await holdShaderStill(context)
    await use(context)
  },
})

export { expect } from '@playwright/test'
