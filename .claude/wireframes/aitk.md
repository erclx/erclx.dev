---
title: aitk case study
subtitle: Long-form sub-page at /aitk covering the adoption thesis, the install taxonomy, and the operating model
description: Long-form sub-page at /aitk covering the adoption thesis, the install taxonomy, and the operating model
---

# aitk case study

Reached from the aitk project card on the landing page. Carries the depth a visitor opted into by following the link, so it expands where the card compresses.

## All viewports

```plaintext
┌──────────────────────────────────────────────────────────┐
│ ← Eric Le                                      [ theme ] │  ← thin bar, way back and toggle
├──────────────────────────────────────────────────────────┤
│                                                          │
│   case study                                             │  ← mono eyebrow
│   aitk                                                   │  ← display heading
│   A CLI that installs one set of agent rules, skills,    │  ← the claim, one sentence
│   and standards into every project and keeps them in     │
│   step.                                                  │
│   GitHub   npm                                           │  ← link row, no case-study link back to itself
│                                                          │
│   problem                                                │  ← mono section eyebrow, repeats per section
│   Every repository re-authors the same agent             │
│   scaffolding ...                                        │
│                                                          │
│   thesis                                                 │
│   ┌────────────────────────────────────────────────┐     │
│   │ │ pull in its own context                      │     │  ← the three prescriptions, rule-marked
│   │ │ break work into loops and routines           │     │
│   │ │ let the agent start other agents             │     │
│   └────────────────────────────────────────────────┘     │
│                                                          │
│   taxonomy                                               │
│   install   Overwrites. Runs once to bootstrap.          │  ← operation and behavior, mono pairs
│   sync      Updates only files already present.          │
│   build     Derives a payload from current state.        │
│   ┌────────────────────────────────────────────────┐     │
│   │ content kinds and their merge rule             │     │  ← panel, label and value pairs
│   └────────────────────────────────────────────────┘     │
│                                                          │
│   model                                                  │
│   ┌────────────────────────────────────────────────┐     │
│   │            orchestrator, warm                  │     │  ← panel diagram, one node over two
│   │                    │                           │     │
│   │        ┌───────────┴───────────┐               │     │
│   │   plans and reviews      workers, cold         │     │
│   └────────────────────────────────────────────────┘     │
│                                                          │
│   agents                                                 │
│   Every command has a non-interactive path ...           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│   ← Back to Eric Le                                      │  ← the way home at the foot
└──────────────────────────────────────────────────────────┘
```

The section-nav rail sits in the left margin from `xl`, tracking the five section eyebrows. See `.claude/wireframes/section-nav.md`.

## Behavior

- Renders static. Reveal animations are no-ops and the nav rail is passed `instant`, so nothing fades on a page read for depth.
- Carries no roadmap or "what's next" section, matching the other case studies.
- The screencast this page is owed is not yet recorded, and no placeholder stands in for it.
- Two controls lead home and both carry the same arrow, one in the top bar and one at the foot. Neither is boxed. The pair is deliberate: a reader who wants out partway through should not have to reach the end to find the way.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the case study directly lands at the top, since there is nowhere else to return to. Mechanism: `.claude/context/case-study-navigation.md`.
- Every figure here is built from layout and type, so none of them opens on click. The pronunciation case study is the only route carrying charts that do.

## Copy

Every string is templated from the copy the parent career checkout holds. Correct wording there and re-render rather than editing the page.
