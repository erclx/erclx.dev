---
description: Link target defaults for rendered anchors in Astro components and pages
paths:
  - 'src/**/*.astro'
---

# LINK STANDARDS

## Target

- Default outbound links to same-tab.
- Reserve `target="_blank" rel="noopener"` for a destination the visitor browses for a while and returns from: a résumé PDF, a long-form article, or an artifact page such as a repository, a package listing, a marketplace entry, or a live demo.
- Keep internal navigation in the current tab. A `mailto:` link is a handoff to a mail client rather than a destination, so it takes the same-tab default and would otherwise leave a blank tab behind.
- Never set `target="_blank"` without `rel="noopener"`.
