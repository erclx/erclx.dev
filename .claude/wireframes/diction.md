---
title: diction project
subtitle: Long-form sub-page at /diction covering the calibration failure, the per-sound fix, and the held-out result
description: Long-form sub-page at /diction covering the calibration failure, the per-sound fix, and the held-out result
---

# diction project

Reached from the diction project card on the landing page. Carries six measured figures, which is what separates its layout from the other two case studies. The card that leads here shows the tool running, so this page is where the measurement lands rather than the card.

It opens on a gallery of the app rather than on one still, which is the other thing separating it. Five screenshots sit in a peek carousel: one centred, a sliver of each neighbor either side, and a click on a sliver centres it. A click on the centred one opens the same carousel larger in a dialog. The six charts below it keep the plate-and-caption treatment and are unaffected.

## All viewports

```plaintext
┌──────────────────────────────────────────────────────────┐
│   ← Eric Le                                  [ theme ]   │  ← thin bar, way back and toggle
│   ────────────────────────────────────────────────────   │  ← the rule stops at the text column
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   diction                                                │  ← display heading
│   A pronunciation trainer that scores each sound         │  ← the claim, one sentence
│   against what a native speaker actually sounds like.    │
│   GitHub                                                 │  ← link row
│                                                          │
│  ┌─┐ ┌──────────────────────────────┐ ┌─┐                │  ← peek carousel, breaks out of
│  │ │ │                              │ │ │                │    the prose column
│  │ │ │      centred screenshot      │ │ │                │  ← slivers of the neighbors,
│  └─┘ └──────────────────────────────┘ └─┘                │    dimmed and scaled back
│           ‹   ● ○ ○ ○ ○   ›                              │  ← arrows and dots, each on a
│                                                          │    44px target
│   problem                                                │
│   I wanted to assess my own English ...                  │  ← the reason, at lede weight
│   The drill told native speakers they were wrong ...     │  ← the framing, demoted to body
│                                                          │
│   data                                                   │
│   ┌────────────────────────────────────────────────┐     │
│   │        ┌──────────────────┐                    │     │  ← tall figure on a plate sized to it
│   │        │                  │                    │     │
│   │        └──────────────────┘                    │     │
│   │ every sound sits somewhere different           │     │  ← caption under the image
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
│   On unseen speech it false-flags native readings 7% ... │
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

The section-nav rail sits in the left margin from `xl`, tracking the five section eyebrows. See `.claude/wireframes/section-nav.md`.

## Behavior

- Renders static. Reveal animations are no-ops and the nav rail is passed `instant`, so nothing fades on a page read for depth.
- Carries no roadmap or "what's next" section, matching the other case studies.
- Each section opens on a line set one step above the paragraphs under it, and the deck under the title reads at that same step. A reader finds where a section starts by size rather than by shade, which is what the opening line leaned on before the step existed.
- Two controls lead home and both carry the same arrow, one in the top bar and one at the foot. Neither is boxed. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- The top bar's controls and the rule under them sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it. The foot already closed this way and the bar now matches it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the case study directly lands at the top, since there is nowhere else to return to. Mechanism: `.claude/context/case-study-navigation.md`.
- Clicking a chart opens it over the page with its caption under it and a close control clear of the image. The whole chart is visible without scrolling, whatever its shape. Escape, the close control, and a click outside all close it, and the page behind stays where it was rather than scrolling under the open panel.

## Screenshot gallery

The opening carousel and the dialog behind it are one carousel rendered twice, so a reader meets one set of rules at both sizes. The centred screenshot is readable, a sliver of each neighbor shows on either side, and clicking a sliver centres it. Clicking the centred one opens the dialog on that same screenshot. Clicking it inside the dialog does nothing, since it has nowhere further to go.

The ends stop rather than wrap, and the first and last centre exactly as the middle three do, so the row reads as a set with two ends rather than a loop. Arrows, dots, a swipe, and the left and right arrow keys all move it, and the keys act on the track whenever focus sits inside the gallery.

Every screenshot is one size, captured at one viewport. That is a constraint on the source rather than a layout rule: the app's sidebar is exactly one viewport tall, so a capture taken longer than the viewport shows it stopping partway down with a gap under it, which reads as a defect in the app.

Distinct from the chart treatment below, and deliberately so. A chart is drawn on paper and wants a light plate and a magnifier. A screenshot is a picture of this app and keeps the page's own dark card. See `.claude/context/case-study-figures.md` for the chart dialog, which is a separate mechanism.

## Figures

Two shapes, decided by the source rather than by the section. A landscape figure breaks out past the prose and fills that wider column. A portrait figure takes a plate sized to itself, since a tall chart cannot fill a width chosen for wide ones and a wide plate under a narrow chart is mostly empty. Each carries a caption naming what it shows, and the alt text states the finding rather than the file.

Both shapes render far below the source resolution in the column, so every chart opens on click, and the six open as one sequence rather than six separate views. A reader steps between them without closing, since the argument on this page runs across the charts in order and comparing two otherwise means going back to the page.

An opened chart arrives whole, bounded by the width of the panel or the height of the screen so it never scrolls. A second click magnifies it to its own pixels and the panel becomes a pan, which is the first size at which a portrait chart is readable: fitting one buys almost nothing over its size in the column, where magnifying it reaches three times that. See `.claude/context/case-study-figures.md` for the mechanism.

Every chart is drawn on a light ground, so the panel behind one stays light in both themes and the figure reads as a framed card the page holds rather than a bright rectangle cut through it. Its caption and its focus ring darken to match, so both stay readable on that panel. The dark theme is what this is for, and the light theme renders as it did before.

The score table is built from layout and type rather than from an image, so it carries no opening treatment and keeps the panel the rest of the page uses. Two panel treatments sitting in one section is the intended reading: an image sits on paper and type sits on the page. The table scrolls inside its own panel on a narrow viewport, so the page body never scrolls sideways.

## Copy

Every string is templated from the copy the parent career checkout holds. Correct wording there and re-render rather than editing the page.
