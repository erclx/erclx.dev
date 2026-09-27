---
title: Page
description: Single page at /. Six sections stack vertically over a shared ground, with two margin controls beside them.
---

# Page

The single page at `/`. Six sections stack vertically inside the body. The header carries its own band that runs edge-to-edge, while about, the experience timeline, projects, looking-for, and the footer sit on the page canvas.

The narrative arc reads as person, then path, then proof, then ask, then close. About carries the person, experience the path, projects the proof, looking-for the ask, and the footer the close. The order was reversed on 2026-08-17: about sat after the project cards until then, which deferred the person until a reader had met five artifacts.

## Regions

- Sticky bar: fixed above the page, arriving once the reader is past half the hero. See `canon/wireframes/site-bar.md`
- Header: the first section, in its own band running edge-to-edge and fading into the page below. See `canon/wireframes/header.md`
- About: under the header, on the page canvas. See `canon/wireframes/about.md`
- Experience: under about. See `canon/wireframes/experience.md`
- Projects: under experience. See `canon/wireframes/projects.md`
- Looking for: under projects, carrying the page's one rule. See `canon/wireframes/looking-for.md`
- Footer: the last section. See `canon/wireframes/footer.md`
- Shared ground: one drawing behind every section. The header renders it moving, and the rest of the page carries the same field held to a single frame at a fraction of its weight, fixed behind the content. It damps inside the reading measure so contours sit in the margins and off the prose
- Section rail: the left margin control, from 1280px, stating position. See `canon/wireframes/section-nav.md`
- Contact dock: the right margin control, at every width, offering reach. See `canon/wireframes/contact-dock.md`
- At 768 and wider: the layout drawn below

```plaintext
      ╭─[sticky bar, arrives past half the hero]────╮
      │  Eric Le                              [☾]   │
      ╰─────────────────────────────────────────────╯
┌──────────────────────────────────────────────────────────┐
│ [header band, shader field, fading into the page below]  │  ← runs edge-to-edge, full height
│   Eric Le                                 [theme toggle] │  ← name at its own tier
│   I build AI agents and developer tools.                 │
│   [GitHub] [LinkedIn] [me@erclx.dev]      [portrait]     │
│                                                          │  ← no rule; the band dissolves
│   About me                                               │
│                                                          │
│   [two body paragraphs, prose only]                       │
│                                                          │
│   Experience                                             │
│                                                          │
│   Where I've worked and studied                          │
│   ( ⬤ VOLVO )   ( BAC HA )   ( CHALMERS )                │
│                                                          │
│   dec 2025 to present  ●  independent projects, open to work │
│   sep to dec 2025      ○  learning react and typescript  │
│   jan 2024 to jun 2025 ○  eighteen months at volvo       │
│   jun to aug 2023      ○  ten weeks at bac ha, hanoi     │
│   sep 2022 to jun 2024 ○  msc, chalmers                  │
│   sep 2019 to jun 2022 ○  bsc, chalmers                  │
│                                                          │
│   Projects                                               │  ← no line counting the cards
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐              │  ← two columns from lg, unboxed
│     [card: canon]          [card: Jobtriage]             │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘         [@]  │  ← contact dock, right margin
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐              │
│     [card: annex]          [card: Stackr]                │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘              │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐          │  ← odd count, so the last spans
│     [card: Caret, still beside text]                     │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                                          │
│   Looking for                                            │
│   ● Open to work                             ( ᴥ )       │  ← status anchors it, character on the rule
│   ────────────────────────────────────────────────────   │  ← the page's one rule
│   What I want to build  AI agents and LLM applications,  │
│                         developer tools, full-stack      │
│                         products                         │
│   Team                  small to mid, close to the       │
│                         product, with engineers to learn │
│                         from                             │
│   Where                 Sweden, Gothenburg preferred,    │
│                         remote                           │
│   Terms                 full-time or contract            │
│                                                          │
│              (handwritten signature)                     │  ← no rule above it
│   📎 Résumé                      Updated August 2026     │
└──────────────────────────────────────────────────────────┘
```

## States

| State     | Reached when                                                            | Shows                                                                                | Evidence       |
| --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------- |
| `at-top`  | The page loads at `/` with no fragment                                  | The header band filling the viewport, with no sticky bar and neither margin control  | `not captured` |
| `in-page` | The reader scrolls far enough into the page to need the margin controls | The sticky bar above the sections, and each margin control its own gate has revealed | `not captured` |

## Copy

- Section headings, in order: `About me`, `Experience`, `Projects`, `Looking for`
- Each section's own copy: cited at that section's wireframe, not duplicated here. The sketch above repeats some of it for orientation only

## Behavior

- The two grounds are not separate treatments meeting at a seam. The header's band fades into the page over its last stretch rather than ending on a line, and what continues underneath is the same surface. See `canon/context/shader-field.md` and `canon/context/page-ground.md`.
- Lines are drawn almost nowhere. The one rule on the page runs above the closing ask's criteria, and it stays because the character perches on it.
- A card's bounds are revealed under the pointer instead of drawn at rest. `canon/DESIGN.md` § Borders carries the tests.
- Two controls sit in the page margins, one per side, each revealed once the reader has scrolled far enough into the page to need it. Each answers to its own gate. See `canon/context/section-nav.md` and `canon/context/contact-dock.md`.
- The margin split is deliberate. One tells the reader where they are and the other gives them somewhere to go, which is the division `canon/REQUIREMENTS.md` § Navigation draws.

## Not on this surface

- No outline on a project card.
- No rule under the header, under the sticky bar, or above the footer.
- No line counting the project cards.
- No route beyond the apex other than one per shipped project, per `canon/REQUIREMENTS.md` § Non-goals.
- No blog posts, dated post feed, or content management system, per `canon/REQUIREMENTS.md` § Non-goals.
