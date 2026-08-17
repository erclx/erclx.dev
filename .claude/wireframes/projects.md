---
title: Projects
description: Below the header. Shipped tools as cards, one column on narrow viewports and two from lg.
---

# Projects

Appears below the header. Lists shipped tools as cards. The heading stands alone, with no line counting the cards under it.

## Narrow and mobile

```plaintext
┌──────────────────────────────────────────────────────────┐
│   Projects                                               │  ← serif heading, held at the page measure
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
- A card owning a case study opens it from anywhere on the card, so the whole card is the control its `Case study` link advertises. A card with no case study has no single destination and stays inert between its links.
- The links inside a card keep their own destinations, including on a card that opens as a whole.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- A card leading to a case study carries that link first in its row, ahead of the artifact's own listings.
- A link leaving the site opens in a new tab. The case-study link stays in the current one.
- An odd card count would leave the trailing card alone beside an empty half from `lg`, so that card runs the full width instead and turns the remainder into a deliberate closer. It lays its still beside its text rather than above it, which keeps its height in the range the cards above it sit in. The four cards above are untouched and the grid keeps two columns.
- Cards in a row share a lower edge. A card whose text runs short holds the row's height rather than closing early.

## Card media

Every card carries a still. A card whose project has a recorded clip plays it on pointer enter and returns to the still on leave, and a card with no clip stays on the still. The two are indistinguishable until the reader hovers.

A still whose content sits flush against its left edge is anchored left rather than centred, because the slot is shallower than the image and a centred crop takes the leading edge off.

For the hover-play mechanism and the parallax tilt, see `.claude/context/project-cards.md`.

## Editorial numerals

Each project card carries a large Fraunces numeral (`01`, `02`, ...) dimmed so it reads as ambient typography rather than a label. On wide viewports the numeral hangs partly into the card's side margin so the visible portion has weight without becoming a label, alternating sides to follow the column the card sits in. On narrow viewports it sits faintly behind the card content. The numeral is decorative, hidden from assistive tech and non-interactive, so it never disrupts reading order.
