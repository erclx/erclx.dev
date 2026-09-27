---
title: annex project
subtitle: Sub-page at /annex covering the retrieval question, the measurement, the citation graph, and the refusal path
description: Sub-page at /annex covering the retrieval question, the measurement, the citation graph, and the refusal path
---

# annex project

Reached from the annex project card on the landing page. Carries the depth a visitor opted into by following the link, so it expands where the card compresses.

Added on 2026-09-21. It carries a measured result, so it reports what the three arms found rather than only what the thing does.

## Regions

- Route bar: the thin sticky bar at the top, carrying the way home, the route's name, and the theme toggle, with no rule under it. `canon/wireframes/site-bar.md` owns it
- Opening: under the bar, the eyebrow, the display heading, the one-sentence claim, and the link row, on the prose column
- Hero still: directly under the opening, the answered-state still in a bordered card like Caret's demo rather than on the chart plate
- Sections: seven prose sections under the still, each a lowercase heading above its paragraphs. `what` comes first, and the first paragraph of `question` carries the reason at lede weight, with the framing under it dropping to body
- Evaluation table: closing `findings`, the three arms on a card plate that breaks past the prose column, captioned above the table
- Section rail: the left margin from 1280 up, leading with the route's opening and then the seven sections. `canon/wireframes/section-nav.md` owns it
- Foot: the closing way home, on the prose column's left edge

### At every viewport

```plaintext
┌──────────────────────────────────────────────────────────┐
│   e▮ Eric Le            annex                [ theme ]   │  ← route bar, way home, name, toggle
│                                                          │
│   PROJECT                                                │  ← eyebrow
│   annex                                                  │  ← display heading
│   [claim, one sentence]                                  │  ← the claim
│   Recorded demo   GitHub                                 │  ← link row
│                                                          │
│ ┌────────────────────────────────────────────────────┐   │  ← the answered-state still,
│ │ [described system, articles returned with cites]   │   │    in the theme the reader is in
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│   what                                                   │  ← section heading, above the prose
│   [body paragraphs]                                      │
│                                                          │
│   question                                               │
│   [the reason, at lede weight]                           │
│   [the framing, demoted to body]                         │
│                                                          │
│   findings                                               │
│ ┌────────────────────────────────────────────────────┐   │  ← the evaluation table, on a
│ │ [caption] arm, recall original and amended, tokens │   │    card plate past the prose
│ └────────────────────────────────────────────────────┘   │
│   graph                                                  │
│   refusal                                                │
│   freshness                                              │
│   limits                                                 │
│                                                          │
│   ← Back to Eric Le                                      │  ← closing way home
└──────────────────────────────────────────────────────────┘
```

## States

| State        | Reached when                   | Shows                                                    | Evidence     |
| ------------ | ------------------------------ | -------------------------------------------------------- | ------------ |
| `reading`    | The route loads in light theme | The regions above, with the light still in the hero card | not captured |
| `dark-theme` | The reader's theme is dark     | The same regions, with the dark still in the hero card   | not captured |

The still is the landing page the annex README opens on, one file per theme, and only the file matching the active theme paints.

## Copy

- Eyebrow: `Project`
- Heading: `annex`
- Link row: `Recorded demo`, `GitHub`
- Section headings: `what`, `question`, `findings`, `graph`, `refusal`, `freshness`, `limits`
- Foot: `Back to Eric Le`
- Claim and section prose: sourced from `career/assets/portfolio/annex.md`, every blockquote rendered as written, and cited at `src/pages/annex.astro` rather than duplicated here
- Evaluation table and its caption: as the career source carries them, cited at `src/pages/annex.astro`
- Hero alt text: the annex README's own line for the same two files, cited at `src/pages/annex.astro`

## Behavior

- The `Recorded demo` link says a visitor reaches a replay of twelve recorded answers, not a live model.
- The rail lists the section names in lowercase, matching the headings on this surface.

## Not on this surface

- No live model behind the demo link. The link reaches a replay of twelve recorded answers
- No chart plate under the hero still, which sits in a bordered card instead
