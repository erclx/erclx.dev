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

Each project card carries a large Fraunces numeral (`01`, `02`, ...) dimmed so it reads as ambient typography rather than a label. On wide viewports the numeral hangs partly into the card's side margin so the visible portion has weight without becoming a label. On narrow viewports it sits faintly behind the card content. The numeral is decorative, hidden from assistive tech and non-interactive, so it never disrupts reading order.

## Card media and tilt

For the per-card hover-play video and parallax tilt, see `.claude/context/project-cards.md`.
