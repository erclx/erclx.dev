---
description: Visual verification for Astro component, layout, page, and stylesheet changes
paths:
  - 'src/components/**'
  - 'src/layouts/**'
  - 'src/pages/**'
  - 'src/styles/global.css'
---

# SCREENSHOT VERIFICATION STANDARDS

## Before a change

- Read the current captures in `.claude/review/screenshots/` for the surfaces involved before proposing a UI change.
- Do not propose a visual change from a wireframe alone.

## After a change

- Re-run `bun run screenshot` and verify the diff before reporting the work as done.
- Pass `SCREENSHOT_FILTER=<term>[,<term>]` on targeted polish loops, matching a landing section or a case-study route. Omit it for whole-site verification before a PR.
- Read a case-study capture at native size. Each route is captured whole, so the reviewer's fitted view of a long page shows arrangement rather than detail.

## Choosing between options

- Render every candidate and compose them into one sheet before asking which wins. Do not put a call about size, weight, color, spacing, or arrangement as described options.
- Call `captureVariants` from `e2e/variants.ts`. Keep the per-decision configuration in session scratch.
- Record instead of shooting when the decision is about motion. Pass `video: true`.
- Open the composed sheet before sending it. A sheet whose images failed to load shoots blank.

## Handoff

- End every UI change with a reachable URL, naming the dev-server address and the routes that changed.
- Leave that dev server running. Do not report the address of a preview or capture run that has exited.
- Verify breakpoints, dark mode, narrow-viewport overflow, animation triggers, and regressions from the captures and the e2e suite, and report what the run found.
- Hand over only what a run cannot settle: aesthetic judgment, whether a layout compromise is acceptable, and whether copy reads right.
- Do not hand over a checklist of dimensions the captures and the e2e suite already settle.
