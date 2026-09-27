---
title: Section nav
description: Fixed left-margin rail that tracks the active section as the visitor scrolls. Hidden below xl and during the hero beat
---

# Section nav

Appears as a fixed rail in the left margin once the visitor scrolls past the hero. Tracks which of the four story sections currently sits in the reading area, and lets the visitor jump between them.

## Regions

- At 1280 and wider: a fixed rail in the left margin, vertically centered, beside the section content column. One label per section, stacked in document order, opposite the contact dock in the right margin

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

- Active label: the one label on a rounded ground carrying an accent edge, the same ground the contact dock renders in the opposite margin, stepped right out of the column of labels around it. Inactive labels render muted on nothing
- Opening row, on a project route only: a first row above the section labels, labelled with the project name, pointing at the route's opening section
- Below 1280: no rail. From md (768px) through lg (1024px) there is never a gutter wide enough for both the rail and content, and at lg the projects section fills the viewport edge-to-edge, putting the rail on top of card content. The sticky bar in `canon/wireframes/site-bar.md` carries a way back to the top at every width, so the rail states position and the bar covers reach

## States

| State      | Reached when                                                                              | Shows                                                                                  | Evidence       |
| ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------- |
| `hidden`   | Scripts run and the reader is over the landing page's hero, or the viewport is below 1280 | Nothing                                                                                | `not captured` |
| `tracking` | The first section reaches the reading area, or a project route paints                     | The rail with the label of the section being read grounded and stepped                 | `not captured` |
| `hovered`  | The pointer rests on a label                                                              | That label lifted toward the foreground, an accent edge, and the site's glow behind it | `not captured` |
| `no-js`    | Scripts do not run                                                                        | The rail at rest with no label grounded, each label a plain link to its section        | `not captured` |

## Copy

- Landing page labels, top to bottom: `About me`, `Experience`, `Projects`, `Looking for`
- A label reads as the heading it points at rather than as the anchor id behind it. `looking-for` rendered as a hyphenated slug until 2026-08-18, which was the one place on the site showing a reader an id
- Project route labels: passed by each route, lowercase, because that surface sets its headings lowercase. The opening row takes the project name
- Labels take the body face in sentence case at label size. They carried the monospace face, authored lowercase and set to capitals by CSS, until 2026-08-17, when mono contracted to literal machine values and uppercase to the eyebrow and diagram chrome. A rail label is neither, and the casing rule the project writes for nav items asks for sentence case

## Behavior

- The rail tracks which story section the visitor is reading and marks its label active. Clicking a label smooth-scrolls to that section, and jumps instead for a reader who asked for less motion, which the bar's own control has always done and this one did not until 2026-08-24.
- Reading down the page hands the ground from label to label, each one leaning right and settling back, and nothing reflows on the handover. Under a reduced-motion preference the step is dropped entirely and the ground alone marks the row.
- The label carries three marks answering to different things. Its focus ring appears when the reader reaches it and belongs to the operable role. Its ground tracks scroll position, sits there under a reader who never clicked, and belongs to the accent. Its glow answers the pointer, and stacks on the active label's ground rather than replacing it. Read the marks rather than the element, since the label is a clickable anchor and reading it by that alone puts the ground on the wrong color. The timeline's current node carries the same position mark.
- The accent edge answers both scroll position and the pointer, so what separates being inside a section from pointing at one is the ground, the blur, and the step.
- Over the hero the rail is hidden. It fades in once the reader reaches the first section and stays visible for the rest of the page, footer included. It arrives naming a row rather than before it has one.
- The sticky bar arrives before the rail.
- On a project route the rail is present from first paint and names its opening row on arrival, rather than naming none for the first 700 to 900px. The landing rail has no equivalent because it is hidden over its hero. See `canon/context/section-nav.md` § The route's opening leads its rail.
- Without JS the rail stays visible and marks no row. Its labels are plain links, so the browser's own navigation still reaches every section.

Scroll-position tracking, the reveal gate, the click-intent lock, the step's mechanics, the bar's earlier gate, and the `instant` prop: see `canon/context/section-nav.md`.

## Not on this surface

- No rail below 1280. Below xl the page is short enough that scroll-tracking adds marginal value.
- Only the active label is grounded. Grounding all four was built and rejected: four grounded labels read as a navigation menu rather than as a position indicator, and they make the rail heavier than the control it faces.
- No stand-down over the footer. The rail carries looking-for through the rest of the page.
