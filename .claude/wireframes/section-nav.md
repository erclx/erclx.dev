---
title: Section nav
description: Fixed left-margin rail that tracks the active section as the visitor scrolls. Hidden below xl and during the hero and footer beats
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

The active label sits inside a 2px left border in the warm accent. Inactive labels render muted with a transparent border, matching the active-row treatment in `experience.md` and `looking-for.md`.

A label reads as the heading it points at rather than as the anchor id behind it. `looking-for` rendered as a hyphenated slug until 2026-08-18, which was the one place on the site showing a reader an id. A project route passes its own labels, lowercase, because that surface sets its headings lowercase.

## Below xl (≤1280px)

Hidden. From md (768px) through lg (1024px) there is never a gutter wide enough for both the rail and content. At lg the projects section fills the viewport edge-to-edge, putting the rail on top of card content. Below xl the page is short enough that scroll-tracking adds marginal value, so the rail hides entirely.

Hiding it no longer leaves the viewport without navigation. The sticky bar in `.claude/wireframes/site-bar.md` carries a way back to the top at every width, so the rail states position and the bar covers reach. Until 2026-08-19 the rail was the only navigation on the site, and below xl there was none at all.

## Behavior

- A fixed rail in the left margin, vertically centered. Visible only at `xl` and up.
- Labels take the body face in sentence case at label size. The active label takes a 2px left border in the warm accent and foreground text. Inactive labels render muted with a transparent border. Hover lifts an inactive label toward the foreground color.
- They carried the monospace face, authored lowercase and set to capitals by CSS, until 2026-08-17, when mono contracted to literal machine values and uppercase to the eyebrow and diagram chrome. A rail label is neither, and the casing rule the project writes for nav items asks for sentence case.
- The label carries two marks answering to different things. Its focus ring appears when the reader reaches it and belongs to the operable role. Its active border tracks scroll position, sits there under a reader who never clicked, and belongs to the accent. Read the marks rather than the element, since the label is a clickable anchor and reading it by that alone puts the border on the wrong color. The timeline's current node carries the same position mark.
- The rail tracks which story section the visitor is reading and marks its label active. Clicking a label smooth-scrolls to that section.
- Over the hero the rail is hidden. It fades in once the visitor scrolls into the content and fades back out as the footer comes into view. The bar reveals on the same beat, so the two never appear apart. They read that beat differently and arrive at the same moment anyway: the rail measures half the viewport and the bar half the hero, which coincide wherever the rail is visible, because the hero holds the full viewport height from md up.
- On a project route the rail is present from first paint with no fade, since those pages are otherwise static.
- Without JS the rail stays hidden. The page reads correctly without it.

Scroll-position tracking, reveal and footer gates, the click-intent lock, and the `instant` prop: see `.claude/context/section-nav.md`.
