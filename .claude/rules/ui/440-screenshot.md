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
- Pass `SCREENSHOT_FILTER=<section>[,<section>]` on targeted polish loops. Omit it for full-page verification before a PR.

## Handoff

- After pushing a UI branch and stopping short of opening the PR, end with the running dev-server URL and a 4-7 item visual-review checklist covering hierarchy, breakpoints, animation triggers, dark mode, narrow-viewport overflow, and regressions.
