---
title: Jobtriage project
description: Long-form sub-page at /jobtriage covering the problem framing, the two demo paths, the canvas, the retrieval evaluation, and the system stack
---

# Jobtriage project

Lives at `erclx.dev/jobtriage`, served from `src/pages/jobtriage.astro`, and reached from the Jobtriage project card on the landing page. This page is where a recruiter or technical interviewer reads the depth: the framing, the two demo paths, the canvas with its pinned spatial tools, the retrieval choices the ablation justifies, and the stack. Reuses the landing page's tokens, fonts, and chrome so the site reads as one product despite the extra route.

## Regions

- Route bar: the thin sticky bar at the top, carrying the way home, the route's name, and the theme toggle, with no rule under it. `canon/wireframes/site-bar.md` owns it
- Opening: under the bar, the eyebrow, the display title one step smaller than the landing hero, the one-sentence claim, and the link row, on the prose column. No tinted band, since the route earns a quieter opening than the landing hero
- Canvas demo: directly under the opening, breaking past the prose column, so a reader sees what triage looks like before the prose argues it
- Sections: five prose sections under the demo, each a lowercase heading above its paragraphs, in the order below. Each opens on a line set one step above the paragraphs under it
  - `problem`: the reason first at lede weight, a question Sweden's job board can filter toward but cannot answer, then a framing paragraph at body weight on why a ranked list is not shaped for a decision made against a profile
  - `try`: the two demo paths, a mock replay without a key and a live agent with the reader's own, then the split between the deployed path on live JobTech data and local development on a fixed corpus
  - `canvas`: the agent's tool calls driving a React Flow canvas, and a two-column table headed `Data tool` and `Spatial tool` under the note that the pairings are pinned in the system prompt and that the table is the local set
  - `retrieval`: a lead saying the evaluation covers the local corpus, the 50-query Swedish golden set and 59-ad corpus, then two tables in card containers breaking past the prose, the hybrid retrieval ablation and the multilingual encoder comparison, each under a caption framing its headline
  - `system`: a lead on the two postures sharing one agent shell, a five-row stack list, a line on the four React Flow canvas views, and a closing paragraph on the ten scripted probes the live agent is measured on
- Section rail: the left margin from 1280 up, leading with the route's opening and then tracking the five sections. `canon/wireframes/section-nav.md` owns it
- Foot: a single `← Back to Eric Le` control carrying an arrow, on the left edge every line of prose starts from, with no rule above it. `src/components/site/case-study/route-foot.astro` renders it for every route

### At 768 and wider

```plaintext
┌────────────────────────────────────────────────────────────────┐
│   e▮ Eric Le              Jobtriage              [theme]       │  ← route bar, way home, name, toggle
│   PROJECT                                                      │  ← eyebrow
│   Jobtriage                                                    │  ← Fraunces display
│   [claim, one sentence]                                        │  ← the claim, Inter body
│   [Live demo]    [GitHub]    [Walkthrough]                     │  ← header-row CTA links
│ ┌──────────────────────────────────────────────────────────┐   │  ← the canvas demo, breaking
│ │ [ads grouped into clusters, each with a score]           │   │    past the prose
│ └──────────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────────┤
│   problem                                                      │  ← section heading
│   [the reason, at lede weight]                                 │
│   [the framing, demoted to body]                               │
├────────────────────────────────────────────────────────────────┤
│   try                                                          │
│   [body paragraphs]                                            │  ← mock replay and bring your own key
├────────────────────────────────────────────────────────────────┤
│   canvas                                                       │
│   [body paragraphs]                                            │
│   Data tool         Spatial tool                              │  ← two-column mapping table, headed
│   searchJobs        placeAds                                  │
│   triageBatch       groupAds                                  │
│   matchProfile      connectProfileToAds                       │
│   compareRoles      pairAdsForCompare                         │
│   deadlineWatch     placeAdsOnTimeline                        │
│   trackStatus       markStatus                                │
├────────────────────────────────────────────────────────────────┤
│   retrieval                                                    │
│   [lead paragraphs]                                            │
│                                                                │
│   ┌─ hybrid retrieval ablation ────────────────────────┐      │
│   │ configuration    P@1     R@10    p95 ms            │      │  ← mono table, tabular-nums
│   │ [four configurations]                              │      │
│   └────────────────────────────────────────────────────┘      │
│                                                                │
│   ┌─ multilingual encoder comparison (dense) ──────────┐      │
│   │ encoder                 P@1     R@10    dim        │      │
│   │ [three encoders]                                   │      │
│   └────────────────────────────────────────────────────┘      │
├────────────────────────────────────────────────────────────────┤
│   system                                                       │
│   [lead paragraph]                                             │
│                                                                │
│   Frontend   [value]                                           │  ← stack list, mono
│   Backend    [value]                                           │
│   Retrieval  [value]                                           │
│   Providers  [value]                                           │
│   Domain     [value]                                           │
│   [canvas views line, then the probes paragraph]               │  ← closes the section
│                                                                │
│   ←  Back to Eric Le                                           │  ← closing way home, on the
│                                                                │    prose column's left edge
└────────────────────────────────────────────────────────────────┘
```

### At 320 and narrower

The link row stacks one link to a line, the tables scroll sideways inside their own cards, and the stack list wraps.

```plaintext
┌──────────────────────────────────┐
│ e▮ Eric Le  Jobtriage  [theme]   │
├──────────────────────────────────┤
│   PROJECT                        │
│   Jobtriage                      │
│   [claim wraps]                  │
│   [Live demo]                    │
│   [GitHub]                       │
│   [Walkthrough]                  │
│   [canvas demo]                  │
├──────────────────────────────────┤
│   problem                        │
│   [body paragraph wraps]         │
├──────────────────────────────────┤
│   try                            │
│   [body paragraphs wrap]         │
├──────────────────────────────────┤
│   canvas                         │
│   [tool-pairing table, two       │
│    columns]                      │
├──────────────────────────────────┤
│   retrieval                      │
│   [tables horizontal-scroll]     │
├──────────────────────────────────┤
│   system                         │
│   [stack list wraps]             │
│                                  │
│   ←  Back to Eric Le             │  ← closing way home
│                                  │
└──────────────────────────────────┘
```

## States

| State          | Reached when                                                           | Shows                                                                          | Evidence     |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| `reading`      | The route loads                                                        | The regions above, with the canvas demo resting on its opening frame           | not captured |
| `demo-playing` | The demo is hovered, or it is on screen on a pointer that cannot hover | Stockholm nursing ads grouped into clusters, each with a score and a rationale | not captured |

## Copy

- Eyebrow: `Project`
- Heading: `Jobtriage`
- Link row: `Live demo`, `GitHub`, `Walkthrough`
- Section headings: `problem`, `try`, `canvas`, `retrieval`, `system`
- Canvas table headings: `Data tool`, `Spatial tool`
- Retrieval table captions: `hybrid retrieval ablation`, `multilingual encoder comparison (dense)`
- Stack list keys: `Frontend`, `Backend`, `Retrieval`, `Providers`, `Domain`
- Foot: `Back to Eric Le`
- Claim, section prose, table values, and stack values: sourced from `career/assets/portfolio/jobtriage.md`, every blockquote rendered as written, and cited at `src/pages/jobtriage.astro` rather than duplicated here
- Section headings, the two table captions, and the demo's aria-label: the lines written in this repository

## Behavior

- Reuses the landing page's layout, theme toggle, and section-nav rail. The prose reveals the way the landing page's does, and the chrome arrives with it. Mechanism: `canon/context/motion.md`.
- Two controls lead home, the lockup in the top bar and the arrowed link at the foot. The bar answers at any scroll position and the foot when the read is over.
- The bar's controls sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the route directly lands at the top, since there is nowhere else to return to. Mechanism, including the foot's padding: `canon/context/case-study-navigation.md`.
- Section padding matches the landing surfaces, so the editorial pace reads identical across the site. The eyebrow reads `Project` and the section names are headings rather than mono kickers, both changed once mono contracted to literal machine values.
- A reader finds where a section starts by size rather than by shade, since the opening line sits one step above the paragraphs under it and the deck under the title reads at that same step. The opening line leaned on shade before the step existed.
- In-page navigation between landing and route is same-tab. `Live demo`, `GitHub`, and `Walkthrough` open in a new tab because they leave the site.
- The ablation notes dense wins P@1 here, against the usual assumption. The encoder comparison notes e5-large lifts P@1 but gives back recall, so e5-base ships as default.

## Not on this surface

- No diagram of the agent shell
- No signature wipe and no résumé link at the foot. Both stay on the landing page, and forward-motion content is reserved for live interview conversation
- The following stays off the page deliberately, since sourcing it in conversation is more valuable than publishing it. The published surface stays on what is observable from the GitHub repo and the deployed app, and the conversation surface stays on the judgment calls behind those artifacts:
  - Specific prompt revisions and the reasoning behind each
  - Cross-encoder reranking, deferred in v1, surfacing only if asked
  - Internal evaluation harness implementation
  - Scoring threshold tuning beyond the named `JOBTRIAGE_RRF_FLOOR=0.025` constant
