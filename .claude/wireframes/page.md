---
title: Page
description: Single page at /. Six sections stack vertically over a shared ground, with two margin controls beside them.
---

# Page

The single page at `/`. Six sections stack vertically inside the body. The header carries its own band that runs edge-to-edge, while about, the experience timeline, projects, looking-for, and the footer sit on the page canvas.

The narrative arc reads as person, then path, then proof, then ask, then close. About carries the person, experience the path, projects the proof, looking-for the ask, and the footer the close. The order was reversed on 2026-08-17: about sat after the project cards until then, which deferred the person until a reader had met five artifacts.

## The shared ground

One drawing runs behind every section. The header renders it moving, and the rest of the page carries the same field held to a single frame at a fraction of its weight, fixed behind the content. It damps inside the reading measure so contours sit in the margins and off the prose.

The two are not separate treatments meeting at a seam. The header's band fades into the page over its last stretch rather than ending on a line, and what continues underneath is the same surface. See `.claude/context/shader-field.md` and `.claude/context/page-ground.md`.

## Where lines are drawn

Almost nowhere. Project cards carry no outline, the header ends on no rule, the sticky bar draws none under it, and the footer opens on none. The one rule on the page runs above the closing ask's criteria, and it stays because the character perches on it.

A card's bounds are revealed under the pointer instead of drawn at rest. `.claude/DESIGN.md` § Borders carries the tests.

## Desktop (≥768px)

```plaintext
      ╭─[sticky bar, arrives past half the hero]────╮
      │  Eric Le                              [☾]   │
      ╰─────────────────────────────────────────────╯
┌──────────────────────────────────────────────────────────┐
│ [header band, shader field, fading into the page below]  │  ← runs edge-to-edge, full height
│   Eric Le                                 [theme toggle] │  ← name at its own tier
│   Welcome, this is my corner of the internet.            │
│   [GitHub] [LinkedIn] [me@erclx.dev]      [portrait]     │
│                                                          │  ← no rule; the band dissolves
│   About me                                               │
│                                                          │
│   [three body paragraphs, prose only, no figure]         │
│                                                          │
│   Experience                                             │
│                                                          │
│   I build the layer between a language model and the     │  ← the claim, display face
│   job it has to do.                                      │
│   [two body paragraphs elaborating it]                   │
│                                                          │
│   Where that happened                                    │
│   ( ⬤ VOLVO )   ( BAC HA )   ( CHALMERS )                │
│                                                          │
│   2026                 ●  shipping independently         │
│   jun to dec 2025      ○  working out what to build      │
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
│     [card: Stackr]         [card: Caret]                 │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ┘              │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐          │  ← odd count, so the last spans
│     [card: diction, still beside text]                   │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                                          │
│   Looking for                                            │
│   ● Open to work                             ( ᴥ )       │  ← status anchors it, character on the rule
│   ────────────────────────────────────────────────────   │  ← the page's one rule
│   What I want to build  AI tooling · LLM apps · devex    │
│   Team                  small to mid · close to product  │
│   Where                 Sweden, Gothenburg · remote      │
│   Experience            two years in                     │
│   Terms                 full-time or contract            │
│                                                          │
│              (handwritten signature)                     │  ← no rule above it
│   📎 Résumé      Designed and built with coding agents,  │
│                  which is also the work.                 │
│                  Updated August 2026                     │
└──────────────────────────────────────────────────────────┘
```

## Margin controls

Two controls sit in the page margins, one per side, each revealed once the reader has scrolled far enough into the page to need it. Each answers to its own gate. See `.claude/context/section-nav.md` and `.claude/context/contact-dock.md`.

- The section rail sits left, from 1280px, and states position. See `.claude/wireframes/section-nav.md`.
- The contact dock sits right, at every width, and offers reach. See `.claude/wireframes/contact-dock.md`.

The split is deliberate. One tells the reader where they are and the other gives them somewhere to go, which is the division `.claude/REQUIREMENTS.md` § Navigation draws.
