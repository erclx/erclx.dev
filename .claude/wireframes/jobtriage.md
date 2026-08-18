---
title: Jobtriage project
description: Long-form sub-page at /jobtriage covering the problem framing, two-posture system, retrieval evaluation, and agent loop
---

# Jobtriage project

Lives at `erclx.dev/jobtriage`, served from `src/pages/jobtriage.astro`. The landing page name-drops Jobtriage. This page is where a recruiter or technical interviewer reads the depth: the framing, the two-posture system, the retrieval choices the ablation justifies, and the agent loop with its pinned spatial tools. Reuses the landing page's tokens, fonts, and chrome so the site reads as one product despite the extra route.

## Desktop (≥768px)

```plaintext
┌────────────────────────────────────────────────────────────────┐
│   ←  Eric Le                                     [theme]       │  ← thin top bar, way back + theme toggle
│   ─────────────────────────────────────────────────────        │  ← the rule stops at the text column
│   PROJECT                                                      │  ← eyebrow
│   Jobtriage                                                    │  ← Fraunces display
│   Live agent triages Swedish job ads against any profile.      │  ← Inter body, mirrors screencast subtitle
│   [Live demo]    [GitHub]                                      │  ← header-row CTA links
├────────────────────────────────────────────────────────────────┤
│   problem                                                      │  ← section heading
│   Job boards rank for the platform's monetization, not the     │
│   candidate's fit. Profile-driven match should be a            │
│   first-class operation, not a retrieval-as-a-feature bolt-on. │
├────────────────────────────────────────────────────────────────┤
│   system                                                       │  ← section heading
│   Two postures share one agent shell.                          │
│   ┌──────────────────────────────────────────────────────┐     │
│   │                ┌ agent shell ┐                       │     │
│   │            ┌───────────┴───────────┐                 │     │
│   │     ┌ deploy ──────────┐   ┌ local ───────────┐      │     │
│   │     │ JobTech taxonomy   │   │ SQLite corpus,    │      │     │
│   │     │ and JobSearch APIs │   │ hybrid retrieval  │      │     │
│   │     └───────────────────┘   └───────────────────┘      │     │
│   └──────────────────────────────────────────────────────┘     │
│   Same prompt, same tools, different data path.               │
│                                                                │
│   Frontend: Next.js App Router on Vercel, Vercel AI SDK       │  ← stack list, mono
│   Backend: FastAPI on Cloud Run europe-west1, 1Gi memory      │
│   Retrieval: BM25 + multilingual-e5-base dense + RRF over SQLite │
│   BYOK: Anthropic, OpenAI, Gemini, local Ollama, mock replay  │
│   Domain: Cloudflare A record fronting Vercel                 │
├────────────────────────────────────────────────────────────────┤
│   retrieval                                                    │  ← section heading
│   50-query Swedish golden set against a 59-ad corpus.         │
│                                                                │
│   ┌─ hybrid retrieval ablation ────────────────────────┐      │
│   │ configuration    P@1     R@10    p95 ms            │      │  ← mono table, tabular-nums
│   │ filter-only      0.020   0.150   0.0               │      │
│   │ bm25-only        0.680   0.920   1.2               │      │
│   │ dense-only       0.780   0.965   7.8               │      │
│   │ hybrid           0.720   0.950   15.2              │      │
│   └────────────────────────────────────────────────────┘      │
│                                                                │
│   ┌─ multilingual encoder comparison (dense) ──────────┐      │
│   │ encoder          P@1     R@10    dim               │      │
│   │ MiniLM (en)      0.700   0.855   384               │      │
│   │ e5-base (ml)     0.780   0.965   768               │      │
│   │ e5-large (ml)    0.860   0.945   1024              │      │
│   └────────────────────────────────────────────────────┘      │
├────────────────────────────────────────────────────────────────┤
│   agent                                                        │  ← section heading
│   data tool         → spatial tool                            │  ← two-column mapping list
│   searchJobs        → placeAds                                │
│   triageBatch       → groupAds                                │
│   matchProfile      → connectProfileToAds                     │
│   compareRoles      → pairAdsForCompare                       │
│   deadlineWatch     → placeAdsOnTimeline                      │
│   trackStatus       → markStatus                              │
├────────────────────────────────────────────────────────────────┤
│   ─────────────── (border-t hairline) ──────────────────       │
│   ←  Back to Eric Le                                           │  ← the way home at the foot
└────────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌──────────────────────────────────┐
│ ←  Eric Le             [theme]   │
├──────────────────────────────────┤
│   PROJECT                        │
│   Jobtriage                      │
│   Live agent triages Swedish     │
│   job ads against any profile.   │
│   [Live demo]                    │
│   [GitHub]                       │
├──────────────────────────────────┤
│   problem                        │
│   [body paragraph wraps]         │
├──────────────────────────────────┤
│   system                         │
│   [diagram stacks the deploy     │
│    box over the local box]       │
│   [stack list wraps]             │
├──────────────────────────────────┤
│   retrieval                      │
│   [tables horizontal-scroll]     │
├──────────────────────────────────┤
│   agent                          │
│   [tool-pairing list wraps as    │
│    two lines per pair]           │
├──────────────────────────────────┤
│   ──────────────                 │
│   [ ←  Back to Eric Le ]         │
└──────────────────────────────────┘
```

## Behavior

- Reuses the landing page's layout, theme toggle, and section-nav rail. The rail is present from first paint with no fade, since the page is otherwise static.
- A thin top bar carries a way back to `/` on the left and the theme toggle on the right. The case study earns a quieter opening than the landing hero, so there is no tinted band. The foot carries the same control, so a reader can leave from either end.
- The bar's controls and the rule under them sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it. The foot already closed this way and the bar now matches it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the case study directly lands at the top, since there is nowhere else to return to. Mechanism: `.claude/context/case-study-navigation.md`.
- Section padding matches the landing surfaces, so the editorial pace reads identical across the site. The eyebrow reads `Project` and the section names are headings rather than mono kickers, both changed once mono contracted to literal machine values.
- The display title sits one step smaller than the landing hero so the page reads as secondary to the apex.
- Each section opens on a line set one step above the paragraphs under it, and the deck under the title reads at that same step. A reader finds where a section starts by size rather than by shade, which is what the opening line leaned on before the step existed.
- The page renders static. Long-form depth optimizes for reading speed, so the cascade reveal stays on the landing page where each section is a focal moment.
- In-page navigation between landing and case study is same-tab. `Live demo` and `GitHub` open in a new tab because they leave the site.

## Sections

- **Problem.** Two short sentences framing the hook: job boards rank for monetization, not fit, and profile-driven match should be a first-class operation.
- **System.** A lead on the two-posture split, then a diagram of the shared agent shell branching into a deploy data path (live JobTech APIs) and a local data path (SQLite corpus). Below it, a five-row stack list and a closing paragraph on the mock-replay plus BYOK posture as the differentiator.
- **Retrieval.** A lead on the 50-query Swedish golden set and 59-ad corpus, then two tables in card containers: the hybrid retrieval ablation and the multilingual encoder comparison. Each carries a caption framing its headline. The ablation notes dense wins P@1 here. The encoder notes e5-large lifts P@1 but gives back recall, so e5-base ships as default.
- **Agent.** A lead on the pinned spatial tool pairings, a two-column data-tool-to-spatial-tool mapping list, and a closing paragraph on the four React Flow canvas views.

## Footer

A hairline separator, then a single `← Back to Eric Le` control carrying an arrow icon, unboxed and matching the one in the top bar. The landing page's signature wipe and résumé link stay on the landing page. The case study closes on the agent section's "the canvas is the answer" beat, not a roadmap section. Forward-motion content is reserved for live interview conversation.

## Hold for interviews

The following stays off the page deliberately. Sourcing it in conversation is more valuable than publishing it:

- Specific prompt revisions and the reasoning behind each.
- Cross-encoder reranking, deferred in v1, surfacing only if asked.
- Internal evaluation harness implementation.
- Scoring threshold tuning beyond the named `JOBTRIAGE_RRF_FLOOR=0.025` constant.

The published surface stays on what is observable from the GitHub repo and the deployed app. The conversation surface stays on the judgment calls behind those artifacts.
