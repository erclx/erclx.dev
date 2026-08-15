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
│   [ ← Back to Eric Le ]                                  │  ← the one way home, a bordered control
└──────────────────────────────────────────────────────────┘
```

The section-nav rail sits in the left margin from `xl`, tracking the five section eyebrows. See `.claude/wireframes/section-nav.md`.

## Behavior

- Renders static. Reveal animations are no-ops and the nav rail is passed `instant`, so nothing fades on a page read for depth.
- Carries no roadmap or "what's next" section, matching the other case studies.
- Two controls lead home and both carry the same arrow, a quiet one in the top bar and a bordered one at the foot. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- Clicking a chart opens it over the page at nearly the full screen width, with its caption under it. Escape, the close control, and a click outside all return the reader to the same scroll position.

## Figures

Two widths, decided by the source rather than by the section. A portrait figure is capped in height and centred so the column is not handed to one image, and a landscape figure fills the column width. Each carries a caption naming what it shows, and the alt text states the finding rather than the file.

Both widths render far below the source resolution in the column, so every chart opens on click. A landscape chart opens to the full width of the panel and fits on screen. A portrait chart opens taller than the screen and scrolls, bounded so the scroll stays around half a screen rather than running to the two or three a full-resolution chart would take. See `.claude/context/case-study-figures.md` for the mechanism.

The score table is built from layout and type rather than from an image, so it carries no opening treatment. The table scrolls inside its own panel on a narrow viewport, so the page body never scrolls sideways.

## Copy

Every string is templated from the copy the parent career checkout holds. Correct wording there and re-render rather than editing the page.
