---
title: Section nav
description: Fixed left-margin rail that tracks the active section as the visitor scrolls. Hidden below xl and during the hero beat
---

# Section nav

Appears as a fixed rail in the left margin once the visitor scrolls past the hero. Tracks which of the four story sections currently sits in the reading area, and lets the visitor jump between them.

## Wide (≥1280px)

```plaintext
┌─[viewport]─────────────────────────────────────────────────┐
│                                                            │
│  About me       [section content fills the column]         │
│ │Experience│                                               │
│  Projects                                                  │
│  Looking for                                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

The active label sits on a rounded ground carrying an accent edge, the same ground the contact dock renders in the opposite margin, and steps right out of the column of labels around it. Inactive labels render muted on nothing. It replaced a 2px left accent border on 2026-08-20, which stated the same thing in the same color with less of it.

Only the active label is grounded. Grounding all four was built and rejected: four grounded labels read as a navigation menu rather than as a position indicator, and they make the rail heavier than the control it faces.

A label reads as the heading it points at rather than as the anchor id behind it. `looking-for` rendered as a hyphenated slug until 2026-08-18, which was the one place on the site showing a reader an id. A project route passes its own labels, lowercase, because that surface sets its headings lowercase.

## Below xl (≤1280px)

Hidden. From md (768px) through lg (1024px) there is never a gutter wide enough for both the rail and content. At lg the projects section fills the viewport edge-to-edge, putting the rail on top of card content. Below xl the page is short enough that scroll-tracking adds marginal value, so the rail hides entirely.

Hiding it no longer leaves the viewport without navigation. The sticky bar in `.claude/wireframes/site-bar.md` carries a way back to the top at every width, so the rail states position and the bar covers reach. Until 2026-08-19 the rail was the only navigation on the site, and below xl there was none at all.

## Behavior

- A fixed rail in the left margin, vertically centered. Visible only at `xl` and up.
- Labels take the body face in sentence case at label size. The active label takes the shared elevated ground, an accent edge, foreground text, and a step to the right. Inactive labels render muted on nothing. Hover lifts any label toward the foreground and lights the site's glow behind it, which stacks on the active label's ground rather than replacing it.
- The step is what makes reading down the page hand the ground from label to label, each one leaning right and settling back. Every label holds the grounded box whether or not it is painted, so nothing reflows on the handover, and the step is a transform rather than a margin for the same reason. Under a reduced-motion preference the step is dropped entirely and the ground alone marks the row.
- They carried the monospace face, authored lowercase and set to capitals by CSS, until 2026-08-17, when mono contracted to literal machine values and uppercase to the eyebrow and diagram chrome. A rail label is neither, and the casing rule the project writes for nav items asks for sentence case.
- The label carries three marks answering to different things. Its focus ring appears when the reader reaches it and belongs to the operable role. Its ground and edge track scroll position, sit there under a reader who never clicked, and belong to the accent. Its glow answers the pointer alone. Read the marks rather than the element, since the label is a clickable anchor and reading it by that alone puts the edge on the wrong color. The timeline's current node carries the same position mark.
- The rail tracks which story section the visitor is reading and marks its label active. Clicking a label smooth-scrolls to that section.
- Over the hero the rail is hidden. It fades in once the visitor scrolls into the content and stays visible for the rest of the page, footer included. The bar reveals on the same beat, so the two never appear apart. They read that beat differently and arrive at the same moment anyway: the rail measures half the viewport and the bar half the hero, which coincide wherever the rail is visible, because the hero holds the full viewport height from md up.
- On a project route the rail is present from first paint with no fade, since those pages are otherwise static.
- Without JS the rail stays hidden. The page reads correctly without it.

Scroll-position tracking, the reveal gate, the click-intent lock, and the `instant` prop: see `.claude/context/section-nav.md`.
