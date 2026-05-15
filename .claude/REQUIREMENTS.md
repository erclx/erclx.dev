# Requirements

## Problem

erclx.dev is the canonical landing page for Eric Le. Recruiters, collaborators, and visitors arriving from Linkedin, Github, or search need a coherent introduction in one place under his own domain. The three external surfaces each tell fragments of the story without a hub.

## Goals

- Visitors arriving from search, a Github profile, or a Linkedin link get a coherent summary of who he is and what he ships in one scroll
- The page reflects the same facts as Linkedin, the resume, and the Github profile without drift
- Content updates flow from the parent career repo so the page never holds a divergent copy

## Non-goals

- Blog posts, content management, or per-project deep dives
- Authentication, comments, analytics dashboards, or any backend
- Multiple pages or routes beyond the apex
- Hand-written copy that diverges from canonical career sources

## MVP features

1. Header: identity, role, location, headline, contact links
2. Narrative: short prose paragraphs sourced from resume and intent
3. Projects: cards for Stackr, Caret, and Toolkit pulled from the github profile
4. Footer: identity links plus a downloadable resume PDF

## Tech stack

- Astro v6 with static output
- React for interactive islands
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn/ui on the radix base with the Nova preset
- TypeScript strict
- Bun for runtime, install, and scripts
- Vitest, Playwright, ESLint, Prettier, cspell

## Constraints

- Content is downstream of the parent career repo. After v1, page copy lands via `.claude/briefs/SYNC-QUEUE.md` and is never edited in place here.
- Static rendering by default. Components opt into client-side hydration via `client:*` directives.
- Single page at the apex. No additional routes without a goal change.
