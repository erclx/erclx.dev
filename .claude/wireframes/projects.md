---
title: Projects
description: Below the experience timeline. Shipped tools as cards, one column on narrow viewports and two from lg.
---

# Projects

Appears below the experience timeline, with about and experience between it and the header. Lists shipped tools as cards, one per shipped project, each linking to the route that project owns. The heading stands alone, with no line counting the cards under it.

## Narrow and mobile

```plaintext
┌──────────────────────────────────────────────────────────┐
│   Projects                                               │  ← serif heading, aligned with the grid
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
│  05 ┌───────────────────────────────────────────────────────┐      │  ← trailing card closes the section across both columns
│     │ ┌──────────────────────┐  diction                     │      │  ← still on one half, text on the other
│     │ │        still         │  Pronunciation trainer ...    │      │
│     │ └──────────────────────┘  Case study   GitHub          │      │
│     └───────────────────────────────────────────────────────┘      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Behavior

- Cards stack in document order. No filtering and no sorting.
- Every card owns a route and opens it from anywhere on the card, so the whole card is the control its `Project` link advertises.
- The links inside a card keep their own destinations, including on a card that opens as a whole.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- The `Project` link comes first in the row, ahead of the artifact's own listings.
- A link leaving the site opens in a new tab. The case-study link stays in the current one.
- An odd card count would leave the trailing card alone beside an empty half from `lg`, so that card runs the full width instead and turns the remainder into a deliberate closer. It lays its still beside its text rather than above it, which keeps its height in the range the cards above it sit in. The four cards above are untouched and the grid keeps two columns.
- Cards in a row share a lower edge. A card whose text runs short holds the row's height rather than closing early.

## Card media

Every card carries a still. A card whose project has a recorded clip plays it on pointer enter and returns to the still on leave, and a card with no clip stays on the still. The two are indistinguishable until the reader hovers.

A still whose content sits flush against its left edge is anchored left rather than centred, because the slot is shallower than the image and a centred crop takes the leading edge off.

For the hover-play mechanism and the parallax tilt, see `.claude/context/project-cards.md`.

## Editorial numerals

Each project card carries a large Fraunces numeral (`01`, `02`, ...) dimmed so it reads as ambient typography rather than a label. On wide viewports the numeral hangs partly into the card's side margin so the visible portion has weight without becoming a label, alternating sides to follow the column the card sits in. On narrow viewports it sits faintly behind the card content. The numeral is decorative, hidden from assistive tech and non-interactive, so it never disrupts reading order.
