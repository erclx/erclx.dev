---
title: diction project
subtitle: Long-form sub-page at /diction covering the calibration failure, the per-sound fix, and the held-out result
description: Long-form sub-page at /diction covering the calibration failure, the per-sound fix, and the held-out result
---

# diction project

Reached by its URL alone, since diction has no project card and nothing on the landing page links it. Carries six measured figures, which is what separates its layout from the other routes. The route is where the measurement lands.

It opens on a gallery of the app rather than on one still, which is the other thing separating it. Five screenshots sit in a peek carousel, and the six charts below it keep the plate-and-caption treatment and are unaffected by it.

## Regions

- Route bar: the thin sticky bar at the top, carrying the way home, the route's name, and the theme toggle, with no rule under it. `canon/wireframes/site-bar.md` owns it
- Opening: under the bar, the eyebrow, the display heading, the one-sentence claim, the offline line, and the link row, on the prose column
- Screenshot gallery: directly under the opening, breaking out of the prose column. One screenshot at the center, a sliver of each neighbor either side, dimmed and scaled back, and arrows and dots under it, each on a 44px target
- Sections: five prose sections under the gallery, each a lowercase heading above its paragraphs. Each section opens on a line set one step above the paragraphs under it, and the first paragraph of `problem` carries the reason at that step, with the framing under it dropping to body
- Charts: six figures inside `data`, `fix`, and `beyond`, each with a caption naming what it shows. The shape comes from the source rather than the section: a landscape chart breaks out past the prose and fills that wider column, and a portrait chart takes a plate sized to itself, since a tall chart cannot fill a width chosen for wide ones and a wide plate under a narrow chart is mostly empty
- Score table: inside `beyond`, ahead of its three charts, a three-column table on the panel the rest of the page uses rather than on a chart plate. It scrolls inside its own panel on a narrow viewport, so the page body never scrolls sideways
- Section rail: the left margin from 1280 up, leading with the route's opening and then tracking the five sections. `canon/wireframes/section-nav.md` owns it
- Foot: the closing way home, on the prose column's left edge

### At every viewport

```plaintext
┌──────────────────────────────────────────────────────────┐
│   e▮ Eric Le            diction              [ theme ]   │  ← route bar, way home, name, toggle
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   diction                                                │  ← display heading
│   [claim, one sentence]                                  │  ← the claim
│   [offline line]                                         │
│   GitHub                                                 │  ← link row
│                                                          │
│  ┌─┐ ┌──────────────────────────────┐ ┌─┐                │  ← peek carousel, breaks out of
│  │ │ │                              │ │ │                │    the prose column
│  │ │ │    screenshot at the center  │ │ │                │  ← slivers of the neighbors,
│  └─┘ └──────────────────────────────┘ └─┘                │    dimmed and scaled back
│           ‹   ● ○ ○ ○ ○   ›                              │  ← arrows and dots, each on a
│                                                          │    44px target
│   problem                                                │
│   [the reason, at lede weight]                           │
│   [the framing, demoted to body]                         │
│                                                          │
│   data                                                   │
│   ┌────────────────────────────────────────────────┐     │
│   │        ┌──────────────────┐                    │     │  ← tall figure on a plate sized to it
│   │        │                  │                    │     │
│   │        └──────────────────┘                    │     │
│   │ [caption]                                      │     │  ← caption under the image
│   └────────────────────────────────────────────────┘     │
│                                                          │
│   fix                                                    │
│   ┌────────────────────────────────────────────────┐     │
│   │        ┌──────────────────┐                    │     │  ← second tall figure
│   │        └──────────────────┘                    │     │
│   └────────────────────────────────────────────────┘     │
│   ┌────────────────────────────────────────────────┐     │
│   │ ┌────────────────────────────────────────────┐ │     │  ← wide figure, fills the column
│   │ └────────────────────────────────────────────┘ │     │
│   └────────────────────────────────────────────────┘     │
│                                                          │
│   holdout                                                │
│   [body paragraphs]                                      │
│                                                          │
│   beyond                                                 │
│   ┌────────────────────────────────────────────────┐     │
│   │ score      what it was       what it is now    │     │  ← three-column table, scrolls when narrow
│   └────────────────────────────────────────────────┘     │
│   (three wide figures follow, each with a caption)       │
│                                                          │
│                                                          │
│   ← Back to Eric Le                                      │  ← closing way home, on the
│                                                          │    prose column's left edge
└──────────────────────────────────────────────────────────┘
```

## States

| State             | Reached when                                        | Shows                                                                      | Evidence     |
| ----------------- | --------------------------------------------------- | -------------------------------------------------------------------------- | ------------ |
| `reading`         | The route loads                                     | The regions above, with the first screenshot at the center of the gallery  | not captured |
| `gallery-moved`   | A sliver, an arrow, a dot, a swipe, or an arrow key | Another screenshot at the center, with its neighbors as slivers            | not captured |
| `gallery-open`    | A click on the screenshot at the center             | The same carousel larger in a dialog, on that same screenshot              | not captured |
| `chart-open`      | A click on a chart                                  | The chart whole over the page, its caption under it, a close control clear | not captured |
| `chart-magnified` | A second click on an open chart                     | The chart at its own pixels, the panel a pan                               | not captured |

### gallery-open

The opening carousel and the dialog behind it are one carousel rendered twice, so a reader meets one set of rules at both sizes. Clicking the screenshot at the center inside the dialog does nothing, since it has nowhere further to go.

The ends stop rather than wrap, and the first and last sit at the center exactly as the middle three do, so the row reads as a set with two ends rather than a loop. Arrows, dots, a swipe, and the left and right arrow keys all move it, and the keys act on the track whenever focus sits inside the gallery.

Every screenshot is one size, captured at one viewport. That is a constraint on the source rather than a layout rule: the app's sidebar is exactly one viewport tall, so a capture taken longer than the viewport shows it stopping partway down with a gap under it, which reads as a defect in the app.

The gallery is distinct from the chart treatment, and deliberately so. A chart is drawn on paper and wants a light plate and a magnifier. A screenshot is a picture of this app and keeps the page's own dark card. See `canon/context/case-study-figures.md` for the chart dialog, which is a separate mechanism.

### chart-open

The whole chart is visible without scrolling, whatever its shape, bounded by the width of the panel or the height of the screen. Escape, the close control, and a click outside all close it, and the page behind stays where it was rather than scrolling under the open panel.

Every chart renders far below its source resolution in the column, so every chart opens on click, and the six open as one sequence rather than six separate views. A reader steps between them without closing, since the argument on this page runs across the charts in order and comparing two otherwise means going back to the page.

Every chart is drawn on a light ground, so the panel behind one stays light in both themes and the figure reads as a framed card the page holds rather than a bright rectangle cut through it. Its caption and its focus ring darken to match, so both stay readable on that panel. The dark theme is what this is for, and the light theme renders as it did before.

### chart-magnified

Magnifying is the first size at which a portrait chart is readable: fitting one buys almost nothing over its size in the column, where magnifying it reaches three times that. See `canon/context/case-study-figures.md` for the mechanism.

## Copy

- Eyebrow: `Project`
- Heading: `diction`
- Link row: `GitHub`
- Section headings: `problem`, `data`, `fix`, `holdout`, `beyond`
- Score table headings: `score`, `what it was`, `what it is now`
- Foot: `Back to Eric Le`
- Claim, offline line, section prose, captions, and alt text: cited at `src/pages/diction.astro` rather than duplicated here. The offline line is ported from the career source, and every other string is authored in this repository
- Alt text: states the finding rather than the file

## Behavior

- The prose reveals the way the landing page's does, and the chrome arrives with it. Mechanism: `canon/context/motion.md`.
- A reader finds where a section starts by size rather than by shade, since the opening line sits one step above the paragraphs under it and the deck under the title reads at that same step. The opening line leaned on shade before the step existed.
- Two controls lead home, the lockup in the top bar and the arrowed link at the foot. Neither is boxed. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- The top bar's controls sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it. The foot already closed this way and the bar now matches it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the route directly lands at the top, since there is nowhere else to return to. Mechanism: `canon/context/case-study-navigation.md`.

## Not on this surface

- No roadmap or "what's next" section, matching the other routes
- No opening treatment on the score table. It is built from layout and type rather than from an image, so an image sits on paper and type sits on the page, and two panel treatments in one section is the intended reading
- No project card and no landing-page link lead here
