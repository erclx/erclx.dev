---
title: Contact dock
description: The margin control carrying contact and the resume between the hero and the footer, and the gates at both ends
---

# Contact dock

## Overview

A control in the page's right margin carrying GitHub, LinkedIn, the address, and the resume. Lives at `src/components/site/contact-dock/contact-dock.astro` and mounts on the landing page.

It answers the stretch between the hero and the footer, where the destinations the hero opens with were unreachable for the whole scroll.

## Decisions

- It sits opposite the section rail, so the two margins read as a pair of controls rather than as one control and one ornament.
- It arrives on the same half-hero gate the sticky bar uses, and stands down over the footer, which carries the same destinations.
- The stack reverses, so the resting mark sits nearest the corner and the set grows up out of it. Rendered in order, the mark sat at the top of a group anchored to the bottom and moved every time the set opened.
- The resting mark is an at sign rather than an envelope. The envelope is one of the destinations below it, so the control opening the set was drawn as a member of it.
- The resume is in the dock and stays in the footer. It is the highest-intent link on a page whose job is hiring and it existed once, as the last thing on the page. It renders nearest the resting mark, so the shortest travel from the control belongs to the destination most readers came for.
- The hero was considered as a third home for the resume and declined. The dock arrives at half the hero, so the only stretch it does not cover is the top half of the first screen, and the hero's three links are identity where a resume is a document.

## Gotchas

- The set collapses, never the links, so all four keep their place in the tab order and expand on focus as well as on hover. That is true only once the dock has arrived. Before it does, the dock is `inert`, because opacity and `pointer-events: none` hide it from sight and from the pointer and leave every link tabbable, which put focus on four off-screen destinations with no ring to follow on all three engines.
- Reach and inertness are one state written through one function. Two observers own half of it each, and letting each toggle the attribute it knows about leaves the other half stale over the footer. Scaling the collapsed stack put them at 43px square against the 44px phone tap minimum, caught by the tap-target spec mid-transition. It fades and translates and never scales.
- A collapsed stack takes no pointer events, so a test reaching straight for an item times out against the container. The dock is hovered first, which is the order a reader does it in.
- The name beside each icon is hidden from assistive technology. The link already carries the same string as its accessible name, so exposing the label too reads every destination in the set twice.
- The name sits to the left because the dock is pinned to the right edge. Measured at 1280, every label lands inside the frame with the longest starting at 1082.

## The footer gate

The dock stands down over the footer using a plain intersection with no root margin. Shrinking the observation root to its top half never fires: the footer sits in the lower part of the last screen by definition, so the region watched is one the footer cannot reach.

The capped root is what the section rail shipped with, and this dock reproduced it before the same reading fixed both. See `.claude/context/section-nav.md`. Measured at 1440x900 scrolled to the end: the footer spans 622 to 900 and the capped root ends at 450, so the two never meet.
