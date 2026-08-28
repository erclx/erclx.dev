---
title: Contact dock
description: The margin control carrying contact and the resume between the hero and the footer, and the gates at both ends
---

# Contact dock

## Overview

A control in the page's right margin carrying GitHub, LinkedIn, the address, and the resume. Lives at `src/components/site/contact-dock/contact-dock.astro` and mounts from the layout, so every surface carries it. It rendered on the landing page alone until 2026-08-20.

It answers the stretch between the hero and the footer, where the destinations the hero opens with were unreachable for the whole scroll.

## Layout

- `src/components/site/contact-dock/` owns the dock markup and the gates at both ends of its travel

## Decisions

- It sits opposite the section rail, so the two margins read as a pair of controls rather than as one control and one ornament. Both now render the same ground, and the rail's arrived second: see `.claude/context/section-nav.md`.
- Its ground is the elevated surface token rather than the page's own, resolved from the shared values in `src/styles/global.css`. Drawn from the background it measured 1.02:1 against the page behind it, which is the defect the sticky bar had already closed before this control existed. Reading the shared declaration is what stops the two drifting again.
- The fill is at its ceiling and cannot be pushed further. In light the elevated token is white against a page at `oklch(0.968)`, so 1.10:1 is the most a fill can separate by and this reaches 1.09:1. More separation has to come from the edge or the shadow, and the two themes disagree about which: the shadow carries light, the edge carries dark.
- Pointing at a control adds the glow's shadow to the elevation it already carries rather than replacing it. Swapping one for the other makes a lit control appear to drop as it lights.
- It arrives on the same half-hero gate the sticky bar uses, and holds to the end of the page.
- A route renders it reachable at once and attaches no gate. A route has no hero, and the element the gate watches is its sticky bar: measured across a full scroll of a route, the intersection ratio reads 1 and only 1, so the gate would hold the control closed for the whole page. The section rail answers the same problem the same way on the same surfaces.
- The stack reverses, so the resting mark sits nearest the corner and the set grows up out of it. Rendered in order, the mark sat at the top of a group anchored to the bottom and moved every time the set opened.
- The resting mark is an at sign rather than an envelope. The envelope is one of the destinations below it, so the control opening the set was drawn as a member of it.
- The resume is in the dock and stays in the footer. It is the highest-intent link on a page whose job is hiring and it existed once, as the last thing on the page. It renders nearest the resting mark, so the shortest travel from the control belongs to the destination most readers came for.
- The hero was considered as a third home for the resume and declined. The dock arrives at half the hero, so the only stretch it does not cover is the top half of the first screen, and the hero's three links are identity where a resume is a document.

## Gotchas

- The set collapses, never the links, so all four keep their place in the tab order and expand on focus as well as on hover. That is true only once the dock has arrived. Before it does, the dock is `inert`, because opacity and `pointer-events: none` hide it from sight and from the pointer and leave every link tabbable, which put focus on four off-screen destinations with no ring to follow on all three engines.
- Reach and inertness are one state written through one function, so the two halves cannot drift. Scaling the collapsed stack put them at 43px square against the 44px phone tap minimum, caught by the tap-target spec mid-transition. It fades and translates and never scales.
- A collapsed stack takes no pointer events, so a test reaching straight for an item times out against the container. The dock is hovered first, which is the order a reader does it in.
- Three separate things held the set open against the tap meant to close it, and the toggle could only ever open. A touch pointer is destroyed when the finger lifts, so `pointerleave` fired before the click that reads the state and cleared the flag the click was about to toggle. The control kept focus, and `:focus-within` holds the stack open on its own. `:hover` then stays stuck on the last thing a finger touched. The close path answers all three: `pointerleave` acts on a mouse alone, a pointer activation releases the control, and the hover rule is scoped away from a coarse pointer.
- A keyboard activation keeps its focus where a pointer one releases it. Blurring there drops the reader on `body`, so their next tab restarts at the top of the document, and the set stays open under them through `:focus-within` either way.
- The hover rule is written as `not all and (pointer: coarse)` rather than as a requirement for hover. See `.claude/context/project-cards.md` for the engine that reports no pointer capability at all, which a hover-keyed rule strands on the touch path.
- The name beside each icon is hidden from assistive technology. The link already carries the same string as its accessible name, so exposing the label too reads every destination in the set twice.
- The name sits to the left because the dock is pinned to the right edge. Measured at 1280, every label lands inside the frame with the longest starting at 1082.

## Reach at the end of the page

The dock holds to the bottom of every surface and never stands down. The footer is not a second home for its destinations: measured on both surfaces, the landing footer carries the resume alone and a route's carries the way home, against four destinations in the dock. Hiding it there would remove three of them and replace one, at the moment a reader has finished reading a page whose job is hiring.

The rail's own footer gate came out for an unrelated reason, so the two margins arrive and leave together again. See `.claude/ARCHITECTURE.md` § The rail carries looking-for through the footer rather than hiding near it.

A claim that a gate rests on gets measured. Both this entry and `.claude/ARCHITECTURE.md` asserted the footer closed with the hero's three links, and the assertion did not survive a reading of either footer.
