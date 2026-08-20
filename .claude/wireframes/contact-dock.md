---
title: Contact dock
description: Fixed right-margin control carrying contact and the résumé between the hero and the footer, mirroring the section rail on the left
---

# Contact dock

Sits fixed in the page's bottom-right margin on the landing page. Carries GitHub, LinkedIn, the address, and the résumé. Arrives once the reader has passed half the hero and stands down over the footer.

It answers the stretch between the hero and the footer, where the destinations the hero opens with were unreachable for the whole scroll. It mirrors the section rail on the opposite margin, so the two read as a pair: the rail states position and the dock offers reach.

## At rest

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

## Hovered or focused

```plaintext
┌─[viewport]──────────────────────────────────────────────┐
│                                     GitHub      ( ⌥ )   │
│                                   LinkedIn      ( in )  │
│                              me@erclx.dev       ( ✉ )   │
│                                   Résumé        ( 📄 )  │  ← nearest the mark
│                                                 ( @ )   │  ← resting mark holds its place
└─────────────────────────────────────────────────────────┘
```

## Behavior

- The stack grows up out of the resting mark, which stays put. Rendered in order the mark sat at the top of a group anchored to the bottom and moved every time the set opened.
- The résumé renders nearest the resting mark, so the shortest travel from the control belongs to the destination most readers came for.
- The resting mark is an at sign rather than an envelope. The envelope is one of the destinations below it, so an envelope would draw the control that opens the set as a member of it.
- The set collapses, never the links. All four keep their place in the tab order and expand on focus as well as on hover.
- The collapsed stack fades and translates and never scales. Scaling it put the links at 43px square against the 44px phone tap minimum.
- A button expands the stack where no pointer is available. It carries the expanded state rather than the links carrying it, so a keyboard reaches the links through ordinary focus and never through the button.
- Each name sits to the left of its icon, because the dock is pinned to the right edge. At 1280 every label lands inside the frame, the longest starting at 1082.
- The name beside each icon is hidden from assistive technology. The link already carries the same string as its accessible name, so exposing the label reads every destination twice.
- Links leaving the site open in a new tab. The résumé does too, which is the one internal destination the link rule exempts, because a reader browses it for a while and comes back rather than navigating away.

## The résumé lives in two places

The résumé is in the dock and stays in the footer. It is the one duplicated destination on the page and that is deliberate: it is the highest-intent link on a page whose job is hiring, and it existed once, as the last thing on the page.

The hero was considered as a third home and declined. The dock arrives at half the hero, so the only stretch it does not cover is the top half of the first screen, and the hero's three links are identity where a résumé is a document.

## Gates

The dock arrives on the same half-hero gate the sticky bar uses and stands down over the footer, which carries the same destinations.

The footer gate is a defect the dock inherited by copying the section rail. See `.claude/context/contact-dock.md`.
