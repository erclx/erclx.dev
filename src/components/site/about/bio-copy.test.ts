/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { BIO } from './bio-copy'

const README_PATH = fileURLToPath(
  new URL('../../../../README.md', import.meta.url),
)

describe('the README bio', () => {
  it('should carry the same paragraph as the About section', () => {
    const readme = readFileSync(README_PATH, 'utf8')
    expect(readme).toContain(BIO)
  })
})
