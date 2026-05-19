---
title: Origin
description: Career git-log timeline that bridges the hero narrative into the projects section.
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

- Section sits on the page canvas at `px-6 py-16 md:py-20`.
- A mono kicker label `origin` (`font-mono text-label text-muted-foreground`) heads the section, mirroring the `looking-for` label and pairing the two as the page's mono system-surfaces.
- The kicker sits above a two-column stage grid (`1fr 120px` at `md`+, single column below). Left column carries the timeline list. Right column carries the SVG career-graph. The graph hides on narrow viewports so the timeline keeps full width.
- Timeline renders as an ordered list in `font-mono` at `text-body` size. Each row is a three-column grid: marker, fixed-width year column (3rem), event text. No glyph separator between year and event. Column structure carries the alignment.
- Each row carries a CSS-drawn marker dot (border circle, fillable via background-color). The active row gets a filled primary dot, full-foreground text, and a primary left bar. Inactive rows show an outline marker and muted text.
- Year column uses `tabular-nums` so digit widths align across rows.
- The closing kicker line sits below the timeline in Fraunces italic label size, muted, capped at `max-w-xl`. Bridges the timeline into a single narrative thought without competing with the timeline rows.
- One row is highlighted at a time. The first row is highlighted by default as the "current state" anchor. Hovering any other row transfers the highlight to it and deactivates the first row. On `pointerleave` of the whole list the highlight walks back row by row, landing on the first row. Step delays follow a quadratic ease-out curve from 40ms to 160ms (fast at the start, slow as it settles), so the highlight reads as a ball settling into the anchor rather than a constant-speed march. JS owns the active-row state via `[data-active]`. The first row's `[data-default-active]` keeps the no-JS path rendering with row one highlighted. At JS init the script removes that attribute and from then on `[data-active]` drives everything. Under `prefers-reduced-motion: reduce` the walk-back snaps instantly to the first row. The 2px left border, marker fill, and color shift all transition at 150ms ease-out per the design motion rule. Negative left margin compensates for the border-side padding so content does not shift.

## Career graph

A small SVG to the right of the timeline shows the six entries as nodes connected by edges, laid out as a DAG. Chalmers sits at the bottom as the foundation. Volvo above it acts as the branching hub. Three side projects (caret left, stackr center, jobtriage right) spread horizontally above volvo as parallel siblings. The three converge into ready at the top. Edges read as the causal chain that produced the current state.

- ViewBox is `100 × 210` with `preserveAspectRatio="xMidYMid meet"` and CSS `aspect-ratio: 100 / 210` so the SVG box matches the viewBox without distortion.
- Node fill is `var(--muted-foreground)` at 0.5 opacity. Edges are 1px non-scaling strokes in the same color. Active node bumps to `var(--primary)` fill, opacity 1, radius 5.
- Each node carries `data-node-idx={i}` matching the row index. The first node also carries `data-default-active` for the no-JS path.
- The graph extends the existing row-active script: `setActive(idx)` toggles both `[data-active]` on the row and `[data-node-active]` on the matching SVG node. Hover works bidirectionally. Pointerenter on either a timeline row or a graph node activates the same index, so the eye can land on either side and feel the link. The pointerleave listener moves up to the stage wrapper that contains both the list and the graph, so the walk-back only fires when the cursor exits the whole pair, not when crossing between them.
- The SVG is `aria-hidden="true"` because all information is already conveyed by the timeline text. The graph is a redundant visualization for sighted users.

## Cascade reveal

On scroll-in, each timeline row reveals via the page's 700ms fade-and-rise pattern with `--fade-delay` cascading top to bottom. The `origin` kicker lands first at 0ms, then the timeline rows cascade from 150ms to 650ms, and the closing italic line follows at 750ms. The graph SVG also carries `data-fade` so it fades in alongside the timeline. The graph edges additionally animate stroke-dashoffset from 1 to 0 in three batches: the chalmers-to-volvo trunk at 150ms, the three volvo-to-side-project branches at 300ms, and the three side-project-to-ready converges at 500ms, so the diamond reads as building from the foundation up. Under `prefers-reduced-motion: reduce` edges render at full length immediately. Reuses the `data-fade` + `--fade-delay` vocabulary already on the page.
