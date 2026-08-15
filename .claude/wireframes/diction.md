---
title: diction case study
subtitle: Long-form sub-page at /diction covering the calibration failure, the per-sound fix, and the held-out result
description: Long-form sub-page at /diction covering the calibration failure, the per-sound fix, and the held-out result
---

# diction case study

Reached from the diction project card on the landing page. Carries six measured figures, which is what separates its layout from the other two case studies. The card that leads here shows the tool running, so this page is where the measurement lands rather than the card.

## All viewports

```plaintext
┌──────────────────────────────────────────────────────────┐
│ ← Eric Le                                      [ theme ] │  ← thin bar, way back and toggle
├──────────────────────────────────────────────────────────┤
│                                                          │
│   case study                                             │  ← mono eyebrow
│   diction                                                │  ← display heading
│   A pronunciation trainer that scores each sound         │  ← the claim, one sentence
│   against what a native speaker actually sounds like.    │
│   GitHub                                                 │  ← link row
│                                                          │
│   problem                                                │
│   The drill told native speakers they were wrong ...     │
│                                                          │
│   data                                                   │
│   ┌────────────────────────────────────────────────┐     │
│   │        ┌──────────────────┐                    │     │  ← tall figure, capped and centred
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
├──────────────────────────────────────────────────────────┤
│   ← Back to Eric Le                                      │  ← the way home at the foot
└──────────────────────────────────────────────────────────┘
```

The section-nav rail sits in the left margin from `xl`, tracking the five section eyebrows. See `.claude/wireframes/section-nav.md`.

## Behavior

- Renders static. Reveal animations are no-ops and the nav rail is passed `instant`, so nothing fades on a page read for depth.
- Carries no roadmap or "what's next" section, matching the other case studies.
- Two controls lead home and both carry the same arrow, one in the top bar and one at the foot. Neither is boxed. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the case study directly lands at the top, since there is nowhere else to return to. Mechanism: `.claude/context/case-study-navigation.md`.
- Clicking a chart opens it over the page with its caption under it and a close control clear of the image. The whole chart is visible without scrolling, whatever its shape. Escape, the close control, and a click outside all close it, and the page behind stays where it was rather than scrolling under the open panel.

## Figures

Two widths, decided by the source rather than by the section. A portrait figure is capped in height and centred so the column is not handed to one image, and a landscape figure fills the column width. Each carries a caption naming what it shows, and the alt text states the finding rather than the file.

Both widths render far below the source resolution in the column, so every chart opens on click. A landscape chart fills the width of the panel. A portrait chart is bounded by the height of the screen instead, which is what keeps it from opening taller than the viewport and forcing a scroll to read one figure. Either way the whole chart is on screen at once. See `.claude/context/case-study-figures.md` for the mechanism.

The score table is built from layout and type rather than from an image, so it carries no opening treatment. The table scrolls inside its own panel on a narrow viewport, so the page body never scrolls sideways.

## Copy

Every string is templated from the copy the parent career checkout holds. Correct wording there and re-render rather than editing the page.
