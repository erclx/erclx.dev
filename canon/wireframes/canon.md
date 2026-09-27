---
title: canon project
subtitle: Long-form sub-page at /canon covering the problem, the single source for standards, the shipped workflow, parallel work, and agent-driven verification
description: Long-form sub-page at /canon covering the problem, the single source for standards, the shipped workflow, parallel work, and agent-driven verification
---

# canon project

Reached from the canon project card on the landing page. Carries the depth a visitor opted into by following the link, so it expands where the card compresses.

## All viewports

```plaintext
┌──────────────────────────────────────────────────────────┐
│   ← Eric Le                                  [ theme ]   │  ← thin bar, way back and toggle
│   ────────────────────────────────────────────────────   │  ← the rule stops at the text column
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   canon                                                  │  ← display heading
│   How I build with AI coding agents, packaged so any     │  ← the claim, one sentence
│   repository can install it: one session plans, ...      │
│   GitHub   npm   Live build                              │  ← link row, no Project link back to itself
│                                                          │
│   problem                                                │  ← section heading, repeats per section
│   Every project I started got the same scaffolding ...   │  ← the reason, at lede weight
│   Drift on this surface is quiet ...                     │  ← the framing, demoted to body
│                                                          │
│   standards                                              │
│   Content reaches a project through two operations ...   │  ← install and sync in prose
│                                                          │
│   workflow                                               │
│   The rules are not the whole product ...                │
│                                                          │
│   parallel                                               │
│   Work runs across parallel Claude Code sessions ...     │
│                                                          │
│   agents                                                 │
│   All of it depends on agents being able to drive ...    │
│                                                          │
│                                                          │
│   ← Back to Eric Le                                      │  ← closing way home, on the
│                                                          │    prose column's left edge
└──────────────────────────────────────────────────────────┘
```

The section-nav rail sits in the left margin from `xl`, tracking the five section eyebrows. See `canon/wireframes/section-nav.md`.

## Behavior

- Renders static. Reveal animations are no-ops and the nav rail is passed `instant`, so nothing fades on a page read for depth.
- Carries no roadmap or "what's next" section, matching the other case studies.
- Each section opens on a line set one step above the paragraphs under it, and the deck under the title reads at that same step. A reader finds where a section starts by size rather than by shade, which is what the opening line leaned on before the step existed.
- Two controls lead home and both carry the same arrow, one in the top bar and one at the foot. Neither is boxed. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- The top bar's controls and the rule under them sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it. The foot already closed this way and the bar now matches it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the case study directly lands at the top, since there is nowhere else to return to. Mechanism: `canon/context/case-study-navigation.md`.
- The page carries one figure, the recording of canon's landing page under the opening, which plays in view and does not open on click. The career source places the install still there instead, and the recording stays at the operator's direction. The pronunciation case study is the only route carrying charts that do.

## Copy

Sourced from `career/assets/portfolio/canon.md`, every blockquote rendered as written. The section labels and the recording's aria-label are the lines written here.
