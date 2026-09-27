---
title: Stackr project
subtitle: Sub-page at /stackr covering the context problem, named tracks, and the runtime stance
description: Sub-page at /stackr covering the context problem, named tracks, and the runtime stance
---

# Stackr project

Reached from the Stackr project card on the landing page. Carries the depth a visitor opted into by following the link, so it expands where the card compresses.

Added on 2026-08-18, when every shipped project earned a route. This one has no measured result to report, so it says what the thing does and why it exists rather than manufacturing a number.

## Regions

- Route bar: the thin sticky bar at the top, carrying the way home, the route's name, and the theme toggle, with no rule under it. `canon/wireframes/site-bar.md` owns it
- Opening: under the bar, the eyebrow, the display heading, the one-sentence deck, and the link row, on the prose column
- Demo: directly under the opening, breaking past the prose column, so it closes the opening rather than interrupting it
- Sections: three prose sections under the demo, each a lowercase heading above its paragraphs. The first paragraph of `problem` carries the reason at lede weight, and the framing under it drops to body
- Section rail: the left margin from 1280 up, tracking the sections. `canon/wireframes/section-nav.md` owns it
- Foot: the closing way home, on the prose column's left edge

### At every viewport

```plaintext
┌──────────────────────────────────────────────────────────┐
│   e▮ Eric Le            Stackr               [ theme ]   │  ← route bar, way home, name, toggle
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   Stackr                                                 │  ← display heading
│   [deck, one sentence]                                   │  ← the deck
│   VS Code Marketplace   Open VSX   GitHub                │  ← link row
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │  ← the demo, breaking past the prose
│ │ [staged files, a track, the copied payload]        │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│   problem                                                │  ← section heading, above the prose
│   [the reason, at lede weight]                           │
│   [the framing, demoted to body]                         │
│                                                          │
│   tracks                                                 │
│   [body paragraphs]                                      │
│                                                          │
│   runtime                                                │
│   [body paragraphs]                                      │
│                                                          │
│                                                          │
│   ← Back to Eric Le                                      │  ← closing way home, on the
│                                                          │    prose column's left edge
└──────────────────────────────────────────────────────────┘
```

Prose holds the route measure and the demo breaks past it, which is the arrangement every project route shares. Both scale with the viewport from the widest breakpoint up.

## States

| State          | Reached when                                                           | Shows                                                       | Evidence     |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------- | ------------ |
| `reading`      | The route loads                                                        | The regions above, with the demo resting on its first frame | not captured |
| `demo-playing` | The demo is hovered, or it is on screen on a pointer that cannot hover | Files staged into a track and the payload copied out        | not captured |

## Copy

- Eyebrow: `Project`
- Heading: `Stackr`
- Link row: `VS Code Marketplace`, `Open VSX`, `GitHub`
- Section headings: `problem`, `tracks`, `runtime`
- Foot: `Back to Eric Le`
- Deck and section prose: sourced from `career/assets/portfolio/stackr.md`, every blockquote rendered as written, and cited at `src/pages/stackr.astro` rather than duplicated here
- Section headings and the demo's aria-label: the lines written in this repository

## Behavior

- A reader sees the thing working before the prose argues for it, since the demo closes the opening.
- The rail lists the three section names in lowercase, matching the headings on this surface rather than the sentence case the landing rail carries.

## Not on this surface

- No measured result, because the project has none that a reader could check
- No release section. The release mechanics are the part a reader skims, so they take one paragraph under `runtime` rather than a section of their own, which leaves three sections rather than four
