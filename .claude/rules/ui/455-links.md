---
description: Link target defaults for rendered anchors in Astro components and pages
paths:
  - 'src/**/*.astro'
---

# LINK STANDARDS

## Target

- Default outbound links to same-tab.
- Reserve `target="_blank" rel="noopener"` for long-form resources the visitor keeps open while the page stays in another tab, such as resume PDFs and long-form articles.
- Never set `target="_blank"` without `rel="noopener"`.
