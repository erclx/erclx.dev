---
title: Origin
description: Career git-log timeline that bridges the hero narrative into the projects section
---

# Origin

Appears between the header band and the projects section. Renders the career story two ways at once. A stylized git log on the left carries the temporal sequence as text rows. A small SVG career-graph on the right shows the same six entries as a DAG, with volvo as the branching hub and three parallel side projects converging into the current state. Replaces a prose paragraph in the same slot. Mono font ties the surface to the looking-for card at the bottom of the page.

## Desktop (≥768px)

```plaintext
origin

●  2026   ready for the next role               ●
○  2026   jobtriage published                  ↗|↖
○  2026   stackr published, 1,300 on open vsx   ●  ●  ●
○  2026   caret published                      ↖|↗
○  2025   volvo contract iii wrapped            ●
○  2024   chalmers engineering physics graduate ●

    Each entry made the next one possible.
              — Fraunces italic, label size
```

## Behavior

- A mono kicker `origin` heads the section, mirroring the `looking-for` label and pairing the two as the page's mono system-surfaces.
- Below the kicker sits a two-column grid: the timeline list on the left, the SVG career-graph on the right. The graph hides on narrow viewports so the timeline keeps full width.
- The timeline renders as an ordered list in mono. Each row is a three-column layout of marker dot, fixed-width year, and event text. No glyph separator between year and event. Column structure carries the alignment, and digits align across rows.
- One row is highlighted at a time as the "current state" anchor. The first row is highlighted by default. Hovering another row transfers the highlight to it. On leaving the list the highlight walks back row by row to the first row.
- The closing kicker line sits below the timeline in Fraunces italic, muted, bridging the timeline into a single narrative thought without competing with the rows.

## Career graph

A small SVG to the right of the timeline shows the six entries as nodes connected into a DAG. Chalmers sits at the bottom as the foundation. Volvo above it is the branching hub. Three side projects (caret left, stackr center, jobtriage right) spread horizontally above volvo as parallel siblings, then converge into `ready` at the top. Edges read as the causal chain that produced the current state.

The graph mirrors the timeline's active row. Hovering either the row or its matching node highlights the same entry, so the eye can land on either side and feel the link. The SVG is `aria-hidden` because the timeline text already conveys everything. The graph is a redundant visualization for sighted users.

## Cascade reveal

On scroll-in the kicker, timeline rows, and graph reveal in a top-to-bottom cascade, and the graph edges draw from the foundation up. Mechanism: `.claude/context/motion.md`.
