---
title: Contact dock
description: Fixed right-margin control carrying contact and the résumé between the hero and the footer, mirroring the section rail on the left
---

# Contact dock

Sits fixed in the page's bottom-right margin on every surface. Carries GitHub, LinkedIn, the address, and the résumé. On the landing page it arrives once the reader has passed half the hero and holds to the end of the page, and on a project route it is reachable from first paint.

It answers the stretch between the hero and the footer, where the destinations the hero opens with were unreachable for the whole scroll. It mirrors the section rail on the opposite margin, so the two read as a pair: the rail states position and the dock offers reach.

## Regions

- Resting mark: a round control in the bottom-right corner of the viewport, opposite the section rail in the left margin. It holds its place whether the stack is open or closed

```plaintext
┌─[viewport]──────────────────────────────────────────────┐
│                                                         │
│   ◤ section rail                                        │
│   ● about                                               │
│   ○ experience                                          │
│   ○ projects                                       ( @ )│  ← resting mark, bottom right
│   ○ looking for                                         │
└─────────────────────────────────────────────────────────┘
```

- Link stack: the four destinations, stacked directly above the resting mark and growing up out of it, with the résumé nearest the mark
- Link name: each destination's name, to the left of its icon, since the dock is pinned to the right edge

```plaintext
┌─[viewport]──────────────────────────────────────────────┐
│                                     GitHub      ( ⌥ )   │
│                                   LinkedIn      ( in )  │
│                              me@erclx.dev       ( ✉ )   │
│                                   Résumé        ( 📄 )  │  ← nearest the mark
│                                                 ( @ )   │  ← resting mark holds its place
└─────────────────────────────────────────────────────────┘
```

## States

| State     | Reached when                                                        | Shows                                                          | Evidence       |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------- | -------------- |
| `hidden`  | The reader is in the top half of the landing page's hero            | Nothing. The dock is out of sight and out of the tab order     | `not captured` |
| `at-rest` | The reader has passed half the hero, or has opened a project route  | The resting mark alone in the bottom-right corner              | `not captured` |
| `open`    | The reader hovers the dock, focuses any of its controls, or taps it | The link stack above the resting mark, each icon with its name | `not captured` |

## Copy

- Resting mark: an at sign, named `Contact` for assistive technology
- Link names, top to bottom: `GitHub`, `LinkedIn`, `me@erclx.dev`, `Résumé`

## Behavior

- The stack grows up out of the resting mark, which stays put.
- The résumé renders nearest the resting mark, so the shortest travel from the control belongs to the destination most readers came for.
- The resting mark is an at sign rather than an envelope. The envelope is one of the destinations above it, so an envelope would draw the control that opens the set as a member of it.
- The set collapses, never the links. All four keep their place in the tab order and expand on focus as well as on hover.
- The collapsed stack fades and translates and never scales, since scaling it shrinks the links below the phone tap minimum.
- A button expands the stack where no pointer is available. It carries the expanded state rather than the links carrying it, so a keyboard reaches the links through ordinary focus and never through the button.
- The name beside each icon is read once. The link already carries the same string as its accessible name, so the visible label is hidden from assistive technology.
- Links leaving the site open in a new tab. The résumé does too, which is the one internal destination the link rule exempts, because a reader browses it for a while and comes back rather than navigating away.
- The dock arrives on the same half-hero gate the sticky bar uses and holds to the bottom of every surface. The footer is not a second home for its destinations, since it carries the résumé on the landing page and the way home on a route.

The arrival gate, the inert state before it, and the touch close path: see `canon/context/contact-dock.md`.

## Not on this surface

- No stand-down over the footer. Hiding the dock there removes three of its four destinations at the moment a reader finishes the page.
- No résumé in the hero. The dock covers everything below the top half of the first screen, and the hero's three links are identity where a résumé is a document.
- The résumé is the one destination the page carries twice, here and in the footer. It is the highest-intent link on a page whose job is hiring, and it existed once, as the last thing on the page.
