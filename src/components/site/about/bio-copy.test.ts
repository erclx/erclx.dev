/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { BIO_PARAGRAPHS } from './bio-copy'

const README_PATH = fileURLToPath(
  new URL('../../../../README.md', import.meta.url),
)

describe('the README bio', () => {
  it.each(BIO_PARAGRAPHS)(
    'should carry the About paragraph %s',
    (paragraph) => {
      const readme = readFileSync(README_PATH, 'utf8')
      expect(readme).toContain(paragraph)
    },
  )
})
