---
title: Section nav
description: Fixed left-margin rail that tracks the active section as the visitor scrolls. Hidden below xl and during the hero and footer beats
---

# Section nav

Appears as a fixed rail in the left margin once the visitor scrolls past the hero. Tracks which of the three story sections (origin, projects, looking-for) currently sits in the reading area, and lets the visitor jump between them. Extends the mono-kicker vocabulary established by the `origin` and `looking-for` section labels rather than introducing a new control type.

## Wide (≥1280px)

```plaintext
┌─[viewport]─────────────────────────────────────────────────┐
│                                                            │
│  origin         [section content fills the column]         │
│ │projects │                                                │
│  looking-for                                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

The active label sits inside a 2px primary left border. Inactive labels render muted with a transparent border, matching the active-row treatment in `origin.md` and `looking-for.md`.

## Below xl (≤1280px)

Hidden. From md (768px) through lg (1024px) there is never a gutter wide enough for both the rail and content. At lg the projects section fills the viewport edge-to-edge, putting the rail on top of card content. Below xl the page is short enough that scroll-tracking adds marginal value, so the rail hides entirely.

## Behavior

- A fixed rail in the left margin, vertically centered. Visible only at `xl` and up.
- Labels are lowercase mono, mirroring the `origin` and `looking-for` kickers. The active label takes a 2px primary left border and foreground text. Inactive labels render muted with a transparent border. Hover lifts an inactive label toward the foreground color.
- The rail tracks which story section the visitor is reading and marks its label active. Clicking a label smooth-scrolls to that section.
- Over the hero the rail is hidden. It fades in once the visitor scrolls into the content and fades back out as the footer comes into view.
- On the Jobtriage case study the rail is present from first paint with no fade, since that page is otherwise static.
- Without JS the rail stays hidden. The page reads correctly without it.

Scroll-position tracking, reveal and footer gates, the click-intent lock, and the `instant` prop: see `.claude/context/section-nav.md`.
