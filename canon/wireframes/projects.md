---
title: Projects
description: Below the experience timeline. Shipped tools as unboxed cards, one column on narrow viewports and two from lg.
---

# Projects

Appears below the experience timeline, with about and experience between it and the header. Lists shipped tools as cards, one per shipped project, each linking to the route that project owns. The section opens straight onto the cards and closes on the last one.

## Regions

- Heading: a serif heading at the top, aligned with the grid
- Cards: below the heading, in document order. Each holds a media slot carrying its still, a display heading naming the project, a description body, and a link row. Its still, its heading, and its link row sit on the page ground, and the gutter between two cards is what separates them. The dotted frames below mark where a card's bounds fall and are not drawn on the page
- Editorial numerals: a large Fraunces numeral (`01`, `02`, ...) per card, dimmed so it reads as ambient typography rather than a label
- Below lg: one column, with each numeral sitting faintly behind its card's content

```plaintext
┌──────────────────────────────────────────────────────────┐
│   Projects                                               │  ← serif heading, aligned with the grid
│                                                          │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│     ┌──────────────────────────────────────────────┐     │  ← media slot, still with optional hover video
│     └──────────────────────────────────────────────┘     │
│                                                          │
│     canon                                                │  ← display heading
│                                                          │
│     (description body)                                   │  ← description body
│                                                          │
│     GitHub   npm   Live build                            │  ← link row, wraps when needed
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                          │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│     Jobtriage                                            │
│     ...                                                  │
│     Live demo   GitHub                                   │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                          │
│   (annex, Stackr, Caret follow in the same shape)        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- At lg and wider: two columns with a 48px gutter. Each numeral hangs partly into the card's side margin so the visible portion has weight without becoming a label, alternating sides to follow the column the card sits in. An odd card count would leave the trailing card alone beside an empty half, so that card runs the full width instead and turns the remainder into a deliberate closer. It lays its still beside its text rather than above it, which keeps its height in the range the cards above it sit in. The four cards above are untouched and the grid keeps two columns

```plaintext
┌────────────────────────────────────────────────────────────────────┐
│   Projects                                                         │
│                                                                    │
│  01 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ 02       │  ← numerals hang into the outer margin
│       canon                       Jobtriage                        │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                 ↑                                  │
│  03 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │ 48px gutter, halo reaches 44px   │
│       annex                       Stackr                      04   │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                                                    │
│  05 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐          │  ← trailing card closes the section across both columns
│       ┌──────────────────────┐  Caret                              │  ← still on one half, text on the other
│       │        still         │  (description body)                 │
│       └──────────────────────┘  Chrome Web Store   GitHub          │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## States

| State          | Reached when               | Shows                                                                            | Evidence       |
| -------------- | -------------------------- | -------------------------------------------------------------------------------- | -------------- |
| `resting`      | No pointer rests on a card | Every card on the page ground with no bounds drawn, each on its still            | `not captured` |
| `card-hovered` | A pointer rests on a card  | A soft shape lit behind the card, and its clip playing where the project has one | `not captured` |
| `card-left`    | The pointer leaves a card  | The shape fading out slower than it arrived, and the card back on its still      | `not captured` |

## Copy

- Heading: `Projects`
- Card names, in order: `canon`, `Jobtriage`, `annex`, `Stackr`, `Caret`
- Link rows, in the order the artifact is reached in:
  - canon: `GitHub`, `npm`, `Live build`
  - Jobtriage: `Live demo`, `GitHub`
  - annex: `Recorded demo`, `GitHub`
  - Stackr: `VS Code Marketplace`, `Open VSX`, `GitHub`
  - Caret: `Chrome Web Store`, `GitHub`
- Numerals: `01` onward, templated from each card's position
- Description bodies: cited at `src/components/site/projects/projects.astro`, not duplicated here

## Behavior

- Every project owns a route, which is what stops a card with a live link and a card without reading as a ranking. A draft splitting the cards on which carry measured results was rejected on both counts, the second being that it was false: all six shipped projects have a route.
- Every card owns a route and opens it from anywhere on the card. The card name is the link that says so, which is also the one a keyboard reaches: the full-card link is hidden from assistive technology and held out of the tab order.
- The links inside a card keep their own destinations, including on a card that opens as a whole.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- The link row holds outbound destinations alone, in the order the artifact is reached in. A row link labelled `Project` led it until 2026-08-20 and repeated what the whole card already does, so the name took the job and the row lost the label.
- A link leaving the site opens in a new tab. The card name, which stays on the site, opens in the current one.
- Cards in a row share a lower edge. A card whose text runs short holds the row's height rather than closing early.
- Pointing at a card lights a soft shape behind it, inset outward from the content and drawn under it, which is the only thing stating where the card ends.
- The shape reaches 44px past the content into a 48px gutter. A shape wider than the gutter meets its neighbor, so pointing at one card lights the one beside it.
- It leaves slower than it arrives. The reader moving from one card to the next sees the one behind them still lit, which reads as a trail rather than as a lag.
- Every card carries a still. A card whose project has a recorded clip plays it on pointer enter and returns to the still on leave, and a card with no clip stays on the still. The two are indistinguishable until the reader hovers.
- A still whose content sits flush against its left edge is anchored left rather than centred, because the slot is shallower than the image and a centred crop takes the leading edge off.
- For the hover-play mechanism and the parallax tilt, see `canon/context/project-cards.md`.
- The numeral is decorative, hidden from assistive tech and non-interactive, so it never disrupts reading order.
- The numeral also leads the card in: it arrives and the card follows, on a phone as on a wide viewport. Mechanism: `canon/context/motion.md`.

## Not on this surface

- No card outline, and no bounds drawn at rest. `canon/DESIGN.md` § Borders carries the tests deciding whether a line stays anywhere on the page.
- No line counting the cards. A count opened the section until 2026-08-14, which came out because a number small enough to count is one to leave unstated.
- No intro sentence. One under the heading carried the link to diction until 2026-09-28.
- No card or link for diction, by the operator's call of 2026-09-28. Its route stays built and is reached by its URL alone.
- No filtering and no sorting.
- No `Project` link in a card's link row.
