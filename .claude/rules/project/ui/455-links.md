---
description: Link target defaults for rendered anchors in Astro components and pages
paths:
  - 'src/**/*.astro'
---

# LINK STANDARDS

## Target

- The installed link-behavior rule sets the same-tab default and the mailto: exception. This rule adds what it leaves to the project: which destinations qualify for `target="_blank"` here, and the noopener requirement it does not state.
- On this site, a résumé PDF, a long-form article, or an artifact page such as a repository, a package listing, a marketplace entry, or a live demo is what qualifies as a destination worth leaving the page for.
- Never set `target="_blank"` without `rel="noopener"`.
