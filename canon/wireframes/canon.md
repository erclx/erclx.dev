---
title: canon project
subtitle: Long-form sub-page at /canon covering the problem, the single source for standards, the shipped workflow, parallel work, and agent-driven verification
description: Long-form sub-page at /canon covering the problem, the single source for standards, the shipped workflow, parallel work, and agent-driven verification
---

# canon project

Reached from the canon project card on the landing page. Carries the depth a visitor opted into by following the link, so it expands where the card compresses.

## Regions

- Route bar: the thin sticky bar at the top, carrying the way home, the route's name, and the theme toggle, with no rule under it. `canon/wireframes/site-bar.md` owns it
- Opening: under the bar, the eyebrow, the display heading, the one-sentence claim, and the link row, on the prose column. The link row carries no `Project` link back to itself
- Recording: directly under the opening, breaking past the prose column, the one figure on the page
- Sections: five prose sections under the recording, each a lowercase heading above its paragraphs. Each section opens on a line set one step above the paragraphs under it, and the first paragraph of `problem` carries the reason at that step, with the framing under it dropping to body
- Section rail: the left margin from 1280 up, leading with the route's opening and then tracking the five sections. `canon/wireframes/section-nav.md` owns it
- Foot: the closing way home, on the prose column's left edge

### At every viewport

```plaintext
┌──────────────────────────────────────────────────────────┐
│   e▮ Eric Le            canon                [ theme ]   │  ← route bar, way home, name, toggle
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   canon                                                  │  ← display heading
│   [claim, one sentence]                                  │  ← the claim
│   GitHub   npm   Live build                              │  ← link row, no Project link back to itself
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │  ← the recording, breaking past the prose
│ │ [canon's landing page, one real session]           │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│   problem                                                │  ← section heading, repeats per section
│   [the reason, at lede weight]                           │
│   [the framing, demoted to body]                         │
│                                                          │
│   standards                                              │
│   [opening line, then body paragraphs]                   │  ← install and sync in prose
│                                                          │
│   workflow                                               │
│   [opening line, then body paragraphs]                   │
│                                                          │
│   parallel                                               │
│   [opening line, then body paragraphs]                   │
│                                                          │
│   agents                                                 │
│   [opening line, then body paragraphs]                   │
│                                                          │
│                                                          │
│   ← Back to Eric Le                                      │  ← closing way home, on the
│                                                          │    prose column's left edge
└──────────────────────────────────────────────────────────┘
```

## States

| State               | Reached when                                                          | Shows                                                           | Evidence     |
| ------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- | ------------ |
| `reading`           | The route loads                                                       | The regions above, with the recording resting on its poster     | not captured |
| `recording-playing` | The recording is hovered, or on screen on a pointer that cannot hover | One real session the toolkit ran on itself, on its landing page | not captured |

## Copy

- Eyebrow: `Project`
- Heading: `canon`
- Link row: `GitHub`, `npm`, `Live build`
- Section headings: `problem`, `standards`, `workflow`, `parallel`, `agents`
- Foot: `Back to Eric Le`
- Claim and section prose: sourced from `career/assets/portfolio/canon.md`, every blockquote rendered as written, and cited at `src/pages/canon.astro` rather than duplicated here
- Section headings and the recording's aria-label: the lines written in this repository

## Behavior

- The prose reveals the way the landing page's does, and the chrome arrives with it. Mechanism: `canon/context/motion.md`.
- A reader finds where a section starts by size rather than by shade, since the opening line sits one step above the paragraphs under it and the deck under the title reads at that same step. The opening line leaned on shade before the step existed.
- Two controls lead home, the lockup in the top bar and the arrowed link at the foot. Neither is boxed. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- The top bar's controls sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it. The foot already closed this way and the bar now matches it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the route directly lands at the top, since there is nowhere else to return to. Mechanism: `canon/context/case-study-navigation.md`.
- The recording of canon's landing page plays while hovered, and on a pointer that cannot hover it plays while it is on screen. The career source places the install still there instead, and the recording stays at the operator's direction.

## Not on this surface

- No roadmap or "what's next" section, matching the other routes
- No figure opens on click. The pronunciation route is the only one carrying charts that do
