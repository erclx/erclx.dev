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

1. Header: identity, a greeting, contact links, and the portrait
2. About: where the person is from and one thing that is not work, sitting directly under the header
3. Experience: the claim, the short prose paragraphs sourced from resume and intent that elaborate it, and the timeline of beats
4. Projects: cards for Jobtriage, Stackr, and Caret pulled from the github profile, plus a trailing one-liner for Toolkit
5. Looking for: the criteria rows a reader filters on, anchored by the availability signal
6. Footer: identity links plus a downloadable resume PDF

The header lost the role, the headline, and the location on 2026-08-17. The claim and its elaboration moved to experience, because the elaboration opens on a pronoun standing for the claim and splitting the two left that pronoun without an antecedent on either surface. The location moved to the closing ask, where the rows already state it as a filter. The availability signal moved with it.

## Navigation

- A visitor can reach the top of the site from anywhere on it, at any viewport. The section rail is hidden below 1280px and states position rather than offering reach, so it does not satisfy this on its own
- A reader arriving on a project route from a shared link has a way back that does not require scrolling to the end of the page
- The way back is one persistent control plus one closing affordance. The bar answers at any scroll position and the foot answers when the read is over, so the two differ in what they are for rather than repeating one exit. A third would be repetition
- Navigation chrome holds one column across every surface, so it does not resize as a reader moves between the landing page and a route

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
