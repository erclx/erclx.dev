---
title: Projects
description: Below the header. Shipped tools as cards, one column on narrow viewports and two from lg.
---

# Projects

Appears below the header. Lists shipped tools as cards. The heading stands alone, with no line counting the cards under it.

## Narrow and mobile

```plaintext
┌──────────────────────────────────────────────────────────┐
│   Projects                                               │  ← Fraunces serif heading, second editorial anchor
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ ┌──────────────────────────────────────────────┐ │   │  ← media slot, still with optional hover video
│   │ └──────────────────────────────────────────────┘ │   │
│   │                                                  │   │
│   │ aitk                                             │   │  ← display heading
│   │                                                  │   │
│   │ CLI that installs one set of agent rules,        │   │  ← description body
│   │ skills, and standards into every project ...     │   │
│   │                                                  │   │
│   │ Case study   GitHub   npm                        │   │  ← link row, wraps when needed
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Jobtriage                                        │   │
│   │ ...                                              │   │
│   │ Live demo   Case study   GitHub                  │   │
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   (Stackr, Caret, diction follow in the same shape)      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## From lg

```plaintext
┌────────────────────────────────────────────────────────────────────┐
│   Projects                                                         │
│                                                                    │
│  01 ┌─────────────────────────┐   ┌─────────────────────────┐ 02   │  ← numerals hang into the outer margin
│     │ aitk                    │   │ Jobtriage               │      │
│     └─────────────────────────┘   └─────────────────────────┘      │
│                                                                    │
│  03 ┌─────────────────────────┐   ┌─────────────────────────┐ 04   │
│     │ Stackr                  │   │ Caret                   │      │
│     └─────────────────────────┘   └─────────────────────────┘      │
│                                                                    │
│  05 ┌─────────────────────────┐                                    │  ← trailing card sits alone in the left column
│     │ diction                 │                                    │
│     └─────────────────────────┘                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Behavior

- Cards stack in document order. No filtering, no sorting, no interactivity beyond the link clicks.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- A card leading to a case study carries that link first in its row, ahead of the artifact's own listings.
- The odd card count leaves a gap beside the trailing card from `lg`. The grid keeps two columns rather than reflowing the four cards above it.

## Card media

Every card carries a still. A card whose project has a recorded clip plays it on pointer enter and returns to the still on leave, and a card with no clip stays on the still. The two are indistinguishable until the reader hovers.

A still whose content sits flush against its left edge is anchored left rather than centred, because the slot is shallower than the image and a centred crop takes the leading edge off.

For the hover-play mechanism and the parallax tilt, see `.claude/context/project-cards.md`.

## Editorial numerals

Each project card carries a large Fraunces numeral (`01`, `02`, ...) dimmed so it reads as ambient typography rather than a label. On wide viewports the numeral hangs partly into the card's side margin so the visible portion has weight without becoming a label, alternating sides to follow the column the card sits in. On narrow viewports it sits faintly behind the card content. The numeral is decorative, hidden from assistive tech and non-interactive, so it never disrupts reading order.
