---
title: Projects
description: Below the experience timeline. Shipped tools as unboxed cards, one column on narrow viewports and two from lg.
---

# Projects

Appears below the experience timeline, with about and experience between it and the header. Lists shipped tools as cards, one per shipped project, each linking to the route that project owns. The heading stands alone, with no line counting the cards under it.

A card carries no outline. Its still, its heading, and its link row sit on the page ground, and the gutter between two cards is what separates them. The dotted frames below mark where a card's bounds fall and are not drawn on the page.

## Narrow and mobile

```plaintext
┌──────────────────────────────────────────────────────────┐
│   Projects                                               │  ← serif heading, aligned with the grid
│                                                          │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│     ┌──────────────────────────────────────────────┐     │  ← media slot, still with optional hover video
│     └──────────────────────────────────────────────┘     │
│                                                          │
│     aitk                                                 │  ← display heading
│                                                          │
│     CLI that installs one set of agent rules,            │  ← description body
│     skills, and standards into every project ...         │
│                                                          │
│     GitHub   npm                                         │  ← link row, wraps when needed
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
│                                                          │
│   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐    │
│     Jobtriage                                            │
│     ...                                                  │
│     Live demo   GitHub                                   │
│   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘    │
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
│  01 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ 02       │  ← numerals hang into the outer margin
│       aitk                        Jobtriage                        │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                 ↑                                  │
│  03 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │ 48px gutter, halo reaches 44px   │
│       Stackr                      Caret                       04   │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                                                    │
│  05 ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐          │  ← trailing card closes the section across both columns
│       ┌──────────────────────┐  diction                            │  ← still on one half, text on the other
│       │        still         │  Pronunciation trainer ...          │
│       └──────────────────────┘  GitHub                             │
│     └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘          │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Behavior

- One line opens the section under its heading, saying that these came out of the author's own work and that each carries a page of its own. It landed on 2026-08-22, into the only section on the page that had opened straight onto its content. A count opened it until 2026-08-14 and came out because a number small enough to count is one to leave unstated.
- That line names the routes rather than sorting the cards by what they can prove. Every project owns one, which is what stops a card with a live link and a card without reading as a ranking, and a route is otherwise reachable only by clicking a card's name. A draft splitting the cards on which carry measured results was rejected on both counts, the second being that it was false: all five have a route.
- Cards stack in document order. No filtering and no sorting.
- Every card owns a route and opens it from anywhere on the card. The card name is the link that says so, which is also the one a keyboard reaches: the full-card link is hidden from assistive technology and held out of the tab order.
- The links inside a card keep their own destinations, including on a card that opens as a whole.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- The link row holds outbound destinations alone, in the order the artifact is reached in. A row link labelled `Project` led it until 2026-08-20 and repeated what the whole card already does, so the name took the job and the row lost the label.
- A link leaving the site opens in a new tab. The card name, which stays on the site, opens in the current one.
- An odd card count would leave the trailing card alone beside an empty half from `lg`, so that card runs the full width instead and turns the remainder into a deliberate closer. It lays its still beside its text rather than above it, which keeps its height in the range the cards above it sit in. The four cards above are untouched and the grid keeps two columns.
- Cards in a row share a lower edge. A card whose text runs short holds the row's height rather than closing early.

## Card bounds

Pointing at a card lights a soft shape behind it, inset outward from the content and drawn under it, which is the only thing stating where the card ends. Nothing is drawn at rest.

The shape reaches 44px past the content into a 48px gutter. A shape wider than the gutter meets its neighbor, so pointing at one card lights the one beside it.

It leaves slower than it arrives. The reader moving from one card to the next sees the one behind them still lit, which reads as a trail rather than as a lag.

`.claude/DESIGN.md` § Borders carries the tests deciding whether a line stays anywhere on the page.

## Card media

Every card carries a still. A card whose project has a recorded clip plays it on pointer enter and returns to the still on leave, and a card with no clip stays on the still. The two are indistinguishable until the reader hovers.

A still whose content sits flush against its left edge is anchored left rather than centred, because the slot is shallower than the image and a centred crop takes the leading edge off.

For the hover-play mechanism and the parallax tilt, see `.claude/context/project-cards.md`.

## Editorial numerals

Each project card carries a large Fraunces numeral (`01`, `02`, ...) dimmed so it reads as ambient typography rather than a label. On wide viewports the numeral hangs partly into the card's side margin so the visible portion has weight without becoming a label, alternating sides to follow the column the card sits in. On narrow viewports it sits faintly behind the card content. The numeral is decorative, hidden from assistive tech and non-interactive, so it never disrupts reading order.

It also leads the card in. Each card is watched as its own group, so the numeral arrives and the card follows 220ms later. That lead already existed by accident, since the numeral sits above and outside the card and crosses the viewport edge first, but it ran 199, 198, 226, and 197ms on the four two-column cards and collapsed to 56ms on the wide one closing the section. Grouping per card evens it to 222 through 247ms, and it matters most on a phone, where one column makes every card the wide case. The grid itself is not a group: at 1477px against a 900px viewport, watching it lights the last card while that card is still off screen. Mechanism: `.claude/context/motion.md`.
