---
title: Jobtriage case study
description: Long-form sub-page at /jobtriage covering the problem framing, two-posture system, retrieval evaluation, and agent loop
---

# Jobtriage case study

Lives at `erclx.dev/jobtriage`, served from `src/pages/jobtriage.astro`. The landing page name-drops Jobtriage. This page is where a recruiter or technical interviewer reads the depth: the framing, the two-posture system, the retrieval choices the ablation justifies, and the agent loop with its pinned spatial tools. Reuses the landing page's tokens, fonts, and chrome so the site reads as one product despite the extra route.

## Desktop (≥768px)

```plaintext
┌────────────────────────────────────────────────────────────────┐
│ ←  Eric Le                                          [theme]    │  ← thin top bar, back-link + theme toggle
├────────────────────────────────────────────────────────────────┤
│   case study                                                   │  ← mono kicker
│   Jobtriage                                                    │  ← Fraunces display
│   Live agent triages Swedish job ads against any profile.      │  ← Inter body, mirrors screencast subtitle
│   [Live demo]    [GitHub]                                      │  ← header-row CTA links
├────────────────────────────────────────────────────────────────┤
│   problem                                                      │  ← mono kicker
│   Job boards rank for the platform's monetization, not the     │
│   candidate's fit. Profile-driven match should be a            │
│   first-class operation, not a retrieval-as-a-feature bolt-on. │
├────────────────────────────────────────────────────────────────┤
│   system                                                       │  ← mono kicker
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
│   retrieval                                                    │  ← mono kicker
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
│   agent                                                        │  ← mono kicker
│   data tool         → spatial tool                            │  ← two-column mapping list
│   searchJobs        → placeAds                                │
│   triageBatch       → groupAds                                │
│   matchProfile      → connectProfileToAds                     │
│   compareRoles      → pairAdsForCompare                       │
│   deadlineWatch     → placeAdsOnTimeline                      │
│   trackStatus       → markStatus                              │
├────────────────────────────────────────────────────────────────┤
│   ─────────────── (border-t hairline) ──────────────────       │
│   ←  Back to Eric Le                                           │
└────────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌──────────────────────────────────┐
│ ←  Eric Le             [theme]   │
├──────────────────────────────────┤
│   case study                     │
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
│   ←  Back to Eric Le             │
└──────────────────────────────────┘
```

## Behavior

- Reuses the landing page's layout, theme toggle, and section-nav rail. The rail is present from first paint with no fade, since the page is otherwise static.
- A thin top bar carries a back-link to `/` on the left and the theme toggle on the right. The case study earns a quieter opening than the landing hero, so there is no tinted band.
- Section padding and the mono-kicker vocabulary (`case study`, `problem`, `system`, `retrieval`, `agent`) match origin and looking-for, so the editorial pace reads identical.
- The display title sits one step smaller than the landing hero so the page reads as secondary to the apex.
- The page renders static. Long-form depth optimizes for reading speed, so the cascade reveal stays on the landing page where each section is a focal moment.
- In-page navigation between landing and case study is same-tab. `Live demo` and `GitHub` open in a new tab because they leave the site.

## Sections

- **Problem.** Two short sentences framing the hook: job boards rank for monetization, not fit, and profile-driven match should be a first-class operation.
- **System.** A lead on the two-posture split, then a diagram of the shared agent shell branching into a deploy data path (live JobTech APIs) and a local data path (SQLite corpus). Below it, a five-row stack list and a closing paragraph on the mock-replay plus BYOK posture as the differentiator.
- **Retrieval.** A lead on the 50-query Swedish golden set and 59-ad corpus, then two tables in card containers: the hybrid retrieval ablation and the multilingual encoder comparison. Each table has a caption framing the headline narrative. The ablation caption notes dense wins P@1 on this corpus. The encoder caption notes e5-large lifts P@1 but gives back recall, so e5-base ships as the balanced default.
- **Agent.** A lead on the pinned spatial tool pairings, a two-column data-tool-to-spatial-tool mapping list, and a closing paragraph on the four React Flow canvas views.

## Footer

A hairline separator, then a single `← Back to Eric Le` link. The landing page's signature wipe and résumé link stay on the landing page. The case study closes on the agent section's "the canvas is the answer" beat, not a roadmap section. Forward-motion content is reserved for live interview conversation.

## Hold for interviews

The following stays off the page deliberately. Sourcing it in conversation is more valuable than publishing it:

- Specific prompt revisions and the reasoning behind each.
- Cross-encoder reranking, deferred in v1, surfacing only if asked.
- Internal evaluation harness implementation.
- Scoring threshold tuning beyond the named `JOBTRIAGE_RRF_FLOOR=0.025` constant.

The published surface stays on what is observable from the GitHub repo and the deployed app. The conversation surface stays on the judgment calls behind those artifacts.
