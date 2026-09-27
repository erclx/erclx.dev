---
title: Caret project
subtitle: Sub-page at /caret covering the reuse problem, the trigger palette, and the three-editor adapter
description: Sub-page at /caret covering the reuse problem, the trigger palette, and the three-editor adapter
---

# Caret project

Reached from the Caret project card on the landing page. Carries the depth a visitor opted into by following the link, so it expands where the card compresses.

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
│   e▮ Eric Le            Caret                [ theme ]   │  ← route bar, way home, name, toggle
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   Caret                                                  │  ← display heading
│   [deck, one sentence]                                   │  ← the deck
│   Chrome Web Store   GitHub                              │  ← link row
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │  ← the demo, breaking past the prose
│ │ [trigger typed, palette opens, prompt lands]       │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│   problem                                                │  ← section heading, above the prose
│   [the reason, at lede weight]                           │
│   [the framing, demoted to body]                         │
│                                                          │
│   trigger                                                │
│   [body paragraphs]                                      │
│                                                          │
│   adapters                                               │
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
| `demo-playing` | The demo is hovered, or it is on screen on a pointer that cannot hover | The palette opening at the cursor and the prompt landing    | not captured |

## Copy

- Eyebrow: `Project`
- Heading: `Caret`
- Link row: `Chrome Web Store`, `GitHub`
- Section headings: `problem`, `trigger`, `adapters`
- Foot: `Back to Eric Le`
- Deck and section prose: sourced from `career/assets/portfolio/caret.md`, every blockquote rendered as written, and cited at `src/pages/caret.astro` rather than duplicated here
- Section headings and the demo's aria-label: the lines written in this repository

## Behavior

- A reader sees the palette open before the prose describes it, since the demo closes the opening.
- The rail lists the three section names in lowercase, matching the headings on this surface rather than the sentence case the landing rail carries.
- The recording is a zoomed-out browser view with a small palette at its center, so the poster frame reads as mostly empty at full width. Cropping to a tighter asset is the fix and it has not shipped.

## Not on this surface

- No measured result, because the project has none that a reader could check
- No number stands in where a result would go, so the route says what the thing does and why it exists instead
