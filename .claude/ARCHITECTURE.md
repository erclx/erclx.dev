# Architecture

## Overview

Static Astro site that renders one page at the erclx.dev apex. The build emits HTML, CSS, and a small JS bundle for any interactive islands. Content is authored once in the parent career repo and flows here through a sync queue.

## Structure

```plaintext
src/
├── pages/
│   └── index.astro      ← single page composed from layout + section components
├── components/
│   └── ui/              ← shadcn primitives, owned by this repo
├── lib/
│   └── utils.ts         ← cn() and shared helpers
└── styles/
    └── global.css       ← tailwind entry, theme tokens, base layer
```

## Key technical decisions

### Astro over Next or a static React app

Astro renders zero JS by default. The page is mostly prose and links, so shipping React on every visit would waste bytes. React only loads where an island opts in via `client:*`. Next would force a runtime model the site does not need.

### Tailwind v4 via the Vite plugin

The v3 Astro integration is deprecated. v4 ships as a Vite plugin and reads its config from a CSS-first `@theme` block, which matches the shadcn token model. This avoids a JS-side `tailwind.config` file entirely.

### shadcn with the radix base and Nova preset

Radix primitives provide accessible interactive components without locking in a design system. Nova ships a usable starting set of tokens and Lucide icons. Components live in `src/components/ui/` under repo ownership, so the team can edit them directly without forking a package.

### Content sourced via SYNC-QUEUE.md

Page copy is canonical in the parent career repo, never authored here. Updates land in `.claude/SYNC-QUEUE.md` as full text. This prevents drift between Linkedin, the resume, the github profile, and the live page.

## Risks / open questions

- The first build seeds copy directly from career sources. The cutover to the queue-only model after v1 needs a clear marker so future sessions do not fall back to reading career files.
- Resume PDF hosting: serve from `public/` or link to the canonical Github copy
- Project card data shape: card content is currently free prose in `github-profile.md`, not structured data, so the component contract has to handle prose blocks rather than fields
