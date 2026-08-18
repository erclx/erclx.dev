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
- Routes beyond the apex and one per shipped project
- Hand-written copy that diverges from canonical career sources

## MVP features

1. Header: identity, role, location, headline, contact links
2. Narrative: short prose paragraphs sourced from resume and intent
3. Projects: cards for Jobtriage, Stackr, and Caret pulled from the github profile, plus a trailing one-liner for Toolkit
4. Footer: identity links plus a downloadable resume PDF

## Project cards

- A visitor sees one card per shipped artifact rather than the fixed roster the MVP named, so a newly shipped project earns a card without a scope change
- Every card carries a still of the artifact rather than a logo or an icon
- Every card links to wherever a reader installs or opens the artifact, which differs per project

## Project routes

- Every shipped project owns a route, so a card carrying a link and a card carrying none never reads as a ranking between them
- A visitor wanting depth on one project reads its problem framing and how it works without leaving the domain. Where the project has measured results the route carries them, and where it has none it says what the thing does and why it exists rather than manufacturing a number
- Each route answers for one project only. A second project earns a second route rather than a section inside the first
- A route carries the demo the project card can only show small. A card renders its still at 498px against a 1280px recording, where a route reaches 896px and 1216px
- The landing page stays the entry point, and a route is reached from the project card that owns it
- The label is `Project` on every route and every card link. `Case study` was retired on 2026-08-18 because it promises measured results, which two of the five routes do not have and should not invent

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
- The apex is the entry point. A route beyond it belongs to one shipped project, added as a scope change rather than ad hoc.
