/**
 * @vitest-environment node
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * A comment block in the cast's stylesheet was closed one line early, which
 * left the prose after it as live stylesheet source. A parser reads that prose
 * as a selector, consumes to the next brace, and swallows the rule behind it
 * whole. The rule it swallowed carried the positioning ancestor and the
 * stacking context a shipped feature depended on. Every check passed, because
 * nothing in the pipeline parses CSS and a stylesheet error-recovers rather
 * than failing, and it survived four branches before a person running a parser
 * by hand caught it.
 *
 * Counting openers against terminators is the narrow check for that defect
 * rather than a general parse guard, which has nothing to compare a parse
 * against except the file itself. What it cannot see is listed beside the
 * fixtures below.
 */

/** The extensions that carry block comments in this tree. */
const COMMENT_BEARING_EXTENSIONS = ['.css', '.astro'] as const

/**
 * What each extension held when this guard was written, and what the walk has to
 * keep reaching. A floor rather than a count, so a file added passes and a walk
 * that quietly narrows fails. Raise a floor once the tree outgrows it, and lower
 * one only alongside the deletion that earned it.
 *
 * Written out rather than derived, because the walk is the thing under guard and
 * a floor read from it would move with every narrowing it exists to report.
 */
const MEASURED_COUNTS: Record<
  (typeof COMMENT_BEARING_EXTENSIONS)[number],
  number
> = {
  '.css': 2,
  '.astro': 26,
}

const MEASURED_TOTAL = Object.values(MEASURED_COUNTS).reduce(
  (total, count) => total + count,
  0,
)

const SOURCE_ROOT = fileURLToPath(new URL('../', import.meta.url))

const countBlockCommentMarkers = (source: string) => ({
  openers: source.split('/*').length - 1,
  terminators: source.split('*/').length - 1,
})

const hasBalancedBlockComments = (source: string) => {
  const { openers, terminators } = countBlockCommentMarkers(source)
  return openers === terminators
}

const collectCommentBearingFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectCommentBearingFiles(path)
    return COMMENT_BEARING_EXTENSIONS.some((extension) =>
      entry.name.endsWith(extension),
    )
      ? [path]
      : []
  })

/**
 * Enumerated rather than listed by hand. A list goes stale the first time
 * somebody adds a stylesheet, and going stale is silent, which is the failure
 * mode this whole check exists for.
 */
const sourceFiles = collectCommentBearingFiles(SOURCE_ROOT)

const findUnbalancedFiles = (paths: readonly string[]) =>
  paths
    .filter((path) => !hasBalancedBlockComments(readFileSync(path, 'utf8')))
    .map((path) => relative(SOURCE_ROOT, path))

/**
 * The shape the defect actually had, condensed from the stylesheet as it stood
 * before the repair. The block closes at the end of the first paragraph, so the
 * second reaches the parser as a selector and the rule below it never takes
 * effect. The block's intended terminator then reads as a stray, which is what
 * puts the file one terminator ahead of its openers.
 */
const CLOSED_EARLY = `/* An aura marks the member rather than lighting the ground under it, so a
   member that leaves it strands a glow over nothing. */

It is not the control glow. Those sit on things a reader operates, and a
   member is decoration that plays back, so nothing promises a destination. */
.cast-member {
  position: relative;
  isolation: isolate;
}
`

/** The same block with its terminator where it was meant to close. */
const CLOSED_WHERE_INTENDED = `/* An aura marks the member rather than lighting the ground under it, so a
   member that leaves it strands a glow over nothing.

   It is not the control glow. Those sit on things a reader operates, and a
   member is decoration that plays back, so nothing promises a destination. */
.cast-member {
  position: relative;
  isolation: isolate;
}
`

/**
 * Written down rather than left to be discovered. An opener inside a string or
 * a url() is counted and is not one, the same hazard is larger in a component
 * file where the characters reach JavaScript and regular expressions, a line
 * comment has no terminator and cannot be covered at all, a block closed early
 * and reopened later still balances, and a bare three-character opener whose
 * closing slash doubles as its own terminator balances while closing nothing.
 * Each is a file nobody has written yet rather than a file failing today.
 */

const filesWithExtension = (extension: string) =>
  sourceFiles.filter((path) => path.endsWith(extension))

// A narrowed walk passes every balance case below while reading a fraction of
// the tree, which is the silent staleness this file exists to catch arriving
// through the file's own instrument. Both guards here read a floor rather than
// zero, because one file per extension satisfies mere presence and leaves the
// twenty-six components guarded at one of them.
describe('the tree under guard', () => {
  it('should walk at least the files each extension held when this was written', () => {
    const belowFloor = COMMENT_BEARING_EXTENSIONS.filter(
      (extension) =>
        filesWithExtension(extension).length < MEASURED_COUNTS[extension],
    )

    expect(belowFloor).toEqual([])
  })

  it('should find a block comment in at least as many files as carried one', () => {
    const carryingComments = sourceFiles.filter((path) =>
      readFileSync(path, 'utf8').includes('/*'),
    )

    expect(carryingComments.length).toBeGreaterThanOrEqual(MEASURED_TOTAL)
  })
})

describe('block comment balance', () => {
  it('should close every opener across every stylesheet and component', () => {
    expect(findUnbalancedFiles(sourceFiles)).toEqual([])
  })

  it('should report a block closed one line early', () => {
    expect(hasBalancedBlockComments(CLOSED_EARLY)).toBe(false)
  })

  it('should count the stray terminator an early close leaves behind', () => {
    expect(countBlockCommentMarkers(CLOSED_EARLY)).toEqual({
      openers: 1,
      terminators: 2,
    })
  })

  it('should accept the same block once its terminator closes it', () => {
    expect(hasBalancedBlockComments(CLOSED_WHERE_INTENDED)).toBe(true)
  })
})
