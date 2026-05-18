---
title: Projects
description: Below the header. Shipped tools stacked as cards in a single column.
---

# Projects

Appears below the header. Lists shipped tools as cards stacked in a single column. The page intentionally keeps to one reading axis, so the layout never branches into a grid.

```plaintext
┌──────────────────────────────────────────────────────────┐
│   Projects                                               │  ← Fraunces serif heading, second editorial anchor
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Stackr                                           │   │  ← display heading
│   │                                                  │   │
│   │ VS Code extension for multi-file LLM context     │   │  ← description body
│   │ preparation. 1,300 downloads on Open VSX ...     │   │
│   │                                                  │   │
│   │ VS Code Marketplace   Open VSX   GitHub          │   │  ← link row, wraps when needed
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Caret                                            │   │
│   │ ...                                              │   │
│   │ Chrome Web Store   GitHub                        │   │
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   Plus Toolkit, an agent-first CLI that installs and     │  ← inline link to Toolkit
│   syncs governance, skills, and standards across         │
│   projects.                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Behavior

- Cards stack in document order. No filtering, no sorting, no interactivity beyond the link clicks.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- The trailing "Plus Toolkit" paragraph is a deliberate downgrade for the third project: the strategy is one inline mention rather than a third card.

## Editorial numerals

Each project card carries a Fraunces 600 numeral such as `01` or `02` positioned per card, set in `--foreground` and dimmed via alpha so it reads as ambient typography rather than a label. At `lg`+ the numeral hangs in the side margin of the card, left of the first column and right of the second, at 0.40 alpha, ~8rem, with a 3rem outdent so the visible margin portion has weight without becoming a label. Below `lg` the grid collapses to one column and the numeral sits behind the card content at 0.15 alpha and ~5rem. The element is `aria-hidden`, `pointer-events-none`, and `select-none` so it never disrupts reading order or interaction.

## Section reveal

The projects section unfurls from the bottom edge as it enters the viewport. The reveal is a `clip-path` animating from `inset(100% 0 0 0)` to `inset(0)`, scroll-tied to a named view-timeline `view-timeline-name: --projects` on the section element so progress tracks the scroll position rather than time. The animation range is `entry 0% cover 40%` so the section finishes revealing well before its midpoint reaches the viewport center. Bound natively via `animation-timeline: view()` with no library and no JS. Browsers without scroll-driven animation support fall to the `@supports not (animation-timeline: view())` branch and render the section statically with `clip-path: inset(0)`. The same static reveal applies under `prefers-reduced-motion: reduce`. Only one section on the page carries this treatment so the reveal stays a deliberate gesture, not a pattern.

## Card media and tilt

For the per-card hover-play video and parallax tilt, see `.claude/context/project-cards.md`. Visual budget: dark MP4 ≤500kb at 720p, poster as a dark PNG, video fades in over 200ms once playback starts, media slot uses rounded inner corners with a hairline ring and soft shadow on a light surface inset.
