/**
 * Renders each page of the résumé PDF to an image for the `/resume` route.
 *
 * The PDF syncs in from compass, and the route shows its pages as images so a
 * phone and a desktop see the same page. The images are committed rather than
 * rendered at build, since Cloudflare never builds and a PDF renderer in CI
 * would be a dependency for two files.
 *
 * Committed images go stale silently when the PDF changes beside them, so the
 * run also records the PDF's hash. The rendered suite compares it against the
 * file on every `bun run check`, which turns a sync without a rerun into a
 * failure.
 *
 * Needs `pdftoppm`, from `poppler-utils`.
 *
 * Run: bun run resume-pages
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const PDF = 'public/resume.pdf'
const OUT_DIR = 'src/assets/resume'
// 200 dpi puts an A4 page at 1654px wide, twice the widest the route draws it.
const DPI = '200'

await mkdir(OUT_DIR, { recursive: true })

execFileSync('pdftoppm', ['-png', '-r', DPI, PDF, `${OUT_DIR}/page`], {
  stdio: 'inherit',
})

const hash = createHash('sha256')
  .update(await readFile(PDF))
  .digest('hex')
await writeFile(`${OUT_DIR}/source.sha256`, `${hash}\n`)

console.log(`Rendered ${PDF} to ${OUT_DIR}/page-*.png at ${DPI} dpi`)
