# Requirements

## Problem

erclx.dev is the canonical landing page for Eric Le. Recruiters, collaborators, and visitors arriving from Linkedin, Github, or search need a coherent introduction in one place under his own domain. The three external surfaces each tell fragments of the story without a hub.

## Goals

- Visitors arriving from search, a Github profile, or a Linkedin link get a coherent summary of who he is and what he ships in one scroll
- The page reflects the same facts as Linkedin, the resume, and the Github profile without drift
- Content updates flow from the parent career repo so the page never holds a divergent copy

## Non-goals

- Blog posts, a dated post feed, or a content management system
- Authentication, comments, analytics dashboards, or any backend
- Routes beyond the apex and one per case study
- Hand-written copy that diverges from canonical career sources

## MVP features

1. Header: identity, role, location, headline, contact links
2. Narrative: short prose paragraphs sourced from resume and intent
3. Projects: one card per shipped artifact, each carrying a still and linking to wherever a reader installs or opens the thing
4. Footer: identity links plus a downloadable resume PDF

## Case studies

- A visitor wanting depth on one shipped project reads its problem framing, system design, and measured results without leaving the domain
- Each case study answers for one project only. A second project earns a second case study rather than a section inside the first
- The landing page stays the entry point, and a case study is reached from the project card that owns it

## Tech stack

- Astro v6 with static output
- React for interactive islands
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn/ui on the radix base with the Nova preset
- TypeScript strict
- Bun for runtime, install, and scripts
- Vitest, Playwright, ESLint, Prettier, cspell

## Constraints

- Content is downstream of the parent career repo. Page copy is canonical there and read across the filesystem, never authored here. A wording change is made at the source and re-rendered.
- Static rendering by default. Components opt into client-side hydration via `client:*` directives.
- The apex is the entry point. A route beyond it is one case study, added as a scope change rather than ad hoc.
