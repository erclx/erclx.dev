---
title: Jobtriage project
description: Long-form sub-page at /jobtriage covering the problem framing, the two demo paths, the canvas, the retrieval evaluation, and the system stack
---

# Jobtriage project

Lives at `erclx.dev/jobtriage`, served from `src/pages/jobtriage.astro`. The landing page name-drops Jobtriage. This page is where a recruiter or technical interviewer reads the depth: the framing, the two demo paths, the canvas with its pinned spatial tools, the retrieval choices the ablation justifies, and the stack. Reuses the landing page's tokens, fonts, and chrome so the site reads as one product despite the extra route.

## Desktop (≥768px)

```plaintext
┌────────────────────────────────────────────────────────────────┐
│   ←  Eric Le                                     [theme]       │  ← thin top bar, way back + theme toggle
│   ─────────────────────────────────────────────────────        │  ← the rule stops at the text column
│   PROJECT                                                      │  ← eyebrow
│   Jobtriage                                                    │  ← Fraunces display
│   A job-search application over Sweden's public JobTech API,   │  ← the claim, Inter body
│   with an agent that turns a profile and a question into a     │
│   visual shortlist.                                            │
│   [Live demo]    [GitHub]    [Walkthrough]                     │  ← header-row CTA links
├────────────────────────────────────────────────────────────────┤
│   problem                                                      │  ← section heading
│   I was job hunting, and Sweden's job API is public. So I      │  ← the reason, at lede weight
│   built against it.                                            │
│   Job boards return a list ...                                 │  ← the framing, demoted to body
├────────────────────────────────────────────────────────────────┤
│   try                                                          │
│   Two paths share the same interface ...                       │  ← mock replay and bring your own key
├────────────────────────────────────────────────────────────────┤
│   canvas                                                       │
│   The agent does not stop at a paragraph of text ...           │
│   data tool         → spatial tool                            │  ← two-column mapping list
│   searchJobs        → placeAds                                │
│   triageBatch       → groupAds                                │
│   matchProfile      → connectProfileToAds                     │
│   compareRoles      → pairAdsForCompare                       │
│   deadlineWatch     → placeAdsOnTimeline                      │
│   trackStatus       → markStatus                              │
├────────────────────────────────────────────────────────────────┤
│   retrieval                                                    │
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
│   │ encoder                 P@1     R@10    dim        │      │
│   │ MiniLM, English         0.700   0.855   384        │      │
│   │ e5-base, multilingual   0.780   0.965   768        │      │
│   │ e5-large, multilingual  0.860   0.945   1024       │      │
│   └────────────────────────────────────────────────────┘      │
├────────────────────────────────────────────────────────────────┤
│   system                                                       │
│   Two postures share one agent shell ...                      │
│                                                                │
│   Frontend: Next.js App Router on Vercel, Vercel AI SDK       │  ← stack list, mono
│   Backend: FastAPI on Cloud Run europe-west1, 1Gi memory      │
│   Retrieval: BM25 and multilingual-e5-base dense, fused by RRF │
│   BYOK: Anthropic, OpenAI, Gemini, local Ollama, mock replay  │
│   Domain: Cloudflare A record fronting Vercel                 │
│                                                                │
│   ←  Back to Eric Le                                           │  ← closing way home, on the
│                                                                │    prose column's left edge
└────────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌──────────────────────────────────┐
│ ←  Eric Le             [theme]   │
├──────────────────────────────────┤
│   PROJECT                        │
│   Jobtriage                      │
│   A job-search application over  │
│   Sweden's public JobTech API... │
│   [Live demo]                    │
│   [GitHub]                       │
│   [Walkthrough]                  │
├──────────────────────────────────┤
│   problem                        │
│   [body paragraph wraps]         │
├──────────────────────────────────┤
│   try                            │
│   [body paragraphs wrap]         │
├──────────────────────────────────┤
│   canvas                         │
│   [tool-pairing list wraps as    │
│    two lines per pair]           │
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

## Behavior

- Reuses the landing page's layout, theme toggle, and section-nav rail. The rail is present from first paint with no fade, since the page is otherwise static.
- A thin top bar carries the way back to `/` on the left and the theme toggle on the right. The case study earns a quieter opening than the landing hero, so there is no tinted band. It is the only exit the route carries, and it answers at any scroll position rather than at one end.
- The bar's controls and the rule under them sit at the same measure as the prose, so the frame agrees with the column instead of spanning past it.
- A reader who arrived from the landing page returns to the place they left rather than to the top of it, and the landing page does not replay its reveal animations on the way back. A reader who opened the case study directly lands at the top, since there is nowhere else to return to. Mechanism: `canon/context/case-study-navigation.md`.
- Section padding matches the landing surfaces, so the editorial pace reads identical across the site. The eyebrow reads `Project` and the section names are headings rather than mono kickers, both changed once mono contracted to literal machine values.
- The display title sits one step smaller than the landing hero so the page reads as secondary to the apex.
- Each section opens on a line set one step above the paragraphs under it, and the deck under the title reads at that same step. A reader finds where a section starts by size rather than by shade, which is what the opening line leaned on before the step existed.
- The page renders static. Long-form depth optimizes for reading speed, so the cascade reveal stays on the landing page where each section is a focal moment.
- In-page navigation between landing and case study is same-tab. `Live demo`, `GitHub`, and `Walkthrough` open in a new tab because they leave the site.

## Sections

- **Problem.** The reason first, that the author was job hunting against a public API, then a framing paragraph on why a ranked list is not shaped for a profile-driven decision.
- **Try.** The two demo paths, a mock replay without a key and a live agent with the reader's own, then the split between the deployed path on live JobTech data and local development on a fixed corpus.
- **Canvas.** The agent's tool calls driving a React Flow canvas, and a two-column data-tool-to-spatial-tool mapping list under the note that the pairings are pinned in the system prompt.
- **Retrieval.** A lead saying the evaluation covers the local corpus, the 50-query Swedish golden set and 59-ad corpus, then two tables in card containers: the hybrid retrieval ablation and the multilingual encoder comparison. Each carries a caption framing its headline. The ablation notes dense wins P@1 here, against the usual assumption. The encoder notes e5-large lifts P@1 but gives back recall, so e5-base ships as default.
- **System.** A lead on the two postures sharing one agent shell, a five-row stack list, and a closing line on the four React Flow canvas views. The route carries no diagram of the shell.

## Foot

A single `← Back to Eric Le` control carrying an arrow, on the left edge every line of prose starts from, with no rule above it. The landing page's signature wipe and résumé link stay on the landing page, and forward-motion content is reserved for live interview conversation. `src/components/site/case-study/route-foot.astro` renders it for all five routes.

It carries almost no top padding of its own. The last section closes on `pb-20` already, so a foot adding a full step of its own stacks two closes: measured at 184px above the control against 48 below it, which is the shape that shipped for part of 2026-08-21. It holds 104px above and 80px below.

## Hold for interviews

The following stays off the page deliberately. Sourcing it in conversation is more valuable than publishing it:

- Specific prompt revisions and the reasoning behind each.
- Cross-encoder reranking, deferred in v1, surfacing only if asked.
- Internal evaluation harness implementation.
- Scoring threshold tuning beyond the named `JOBTRIAGE_RRF_FLOOR=0.025` constant.

The published surface stays on what is observable from the GitHub repo and the deployed app. The conversation surface stays on the judgment calls behind those artifacts.
