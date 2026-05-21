---
title: Jobtriage case study
description: Long-form sub-page at /jobtriage that surfaces the problem framing, system posture, retrieval evaluation, agent loop, and queued improvements for the Jobtriage retrieval agent.
---

# Jobtriage case study

Lives at `erclx.dev/jobtriage`, served from `src/pages/jobtriage.astro`. The landing page name-drops Jobtriage. This page is where a recruiter or technical interviewer reads the depth: the framing, the two-posture system, the retrieval choices the ablation justifies, the agent loop with its pinned spatial tools, and what is queued next. Reuses the landing page's tokens, fonts, and chrome so the site feels like one product despite the additional route.

## Desktop (≥768px)

```plaintext
┌────────────────────────────────────────────────────────────────┐
│ ←  Eric Le                                          [theme]    │  ← thin top bar, back-link + theme toggle
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   case study                                                   │  ← mono kicker
│                                                                │
│   Jobtriage                                                    │  ← Fraunces display
│   Live agent triages Swedish job ads against any profile.      │  ← Inter body, max-w-xl, mirrors screencast subtitle
│                                                                │
│   [Live demo]    [GitHub]                                      │  ← header-row CTA links
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   problem                                                      │  ← mono kicker
│   Job boards rank for the platform's monetization, not the     │
│   candidate's fit. Profile-driven match should be a            │
│   first-class operation, not a retrieval-as-a-feature bolt-on. │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   system                                                       │  ← mono kicker
│   Two postures share one agent shell.                          │
│   ┌──────────────────────────────────────────────────────┐     │
│   │                                                      │     │
│   │   ┌─ deploy ─┐                  ┌─ local ─┐          │     │
│   │   │ lookupConcept                │ hybrid retrieval  │     │
│   │   │ searchJobs                   │ deadline filtering│     │  ← two columns, branching from the agent shell
│   │   │ matchProfile                 │ engagement track  │     │
│   │   │ compareRoles                 │                   │     │
│   │   └────┬─────┘                  └───┬─────┘          │     │
│   │        ▼                            ▼                │     │
│   │   live JobTech APIs              SQLite corpus       │     │
│   │                                                      │     │
│   └──────────────────────────────────────────────────────┘     │
│                                                                │
│   Same prompt, same tools, different data path. Deploy runs   │
│   against the JobTech taxonomy + JobSearch APIs. Local CLI    │
│   and local dev run the hybrid retrieval stack against a      │
│   SQLite corpus.                                              │
│                                                                │
│   Frontend: Next.js App Router on Vercel, Vercel AI SDK       │  ← stack list, font-mono text-label
│   Backend: FastAPI on Cloud Run europe-west1, 1Gi memory      │
│   Retrieval: BM25 + multilingual-e5-base dense + RRF / SQLite │
│   BYOK: Anthropic, OpenAI, Gemini, local Ollama, mock replay  │
│   Domain: Cloudflare A record fronting Vercel                 │
│                                                                │
│   The mock-replay path lets a recruiter try the surface in    │
│   five seconds. BYOK lets a technical visitor drive the agent │
│   with their own key. Most agent demos punt on both.          │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   retrieval                                                    │  ← mono kicker
│   50-query Swedish golden set against a 59-ad corpus from     │
│   Spotify, Klarna, Volvo Group, Volvo Cars, Ericsson, HT      │
│   Engineering, Stig Ericsson Bil, Montico, and Isaksson       │
│   Rekrytering. Embeddings from intfloat/multilingual-e5-base. │
│                                                                │
│   ┌─ hybrid retrieval ablation ────────────────────────┐      │
│   │ configuration    P@1     R@10    p95 ms            │      │
│   │ filter-only      0.020   0.150   0.0               │      │  ← mono table, tabular-nums
│   │ bm25-only        0.680   0.920   1.2               │      │
│   │ dense-only       0.780   0.965   7.8               │      │
│   │ hybrid           0.720   0.950   15.2              │      │
│   └────────────────────────────────────────────────────┘      │
│                                                                │
│   Dense alone wins P@1 by 6 points over hybrid on this corpus.│
│   Hybrid earns its place on adversarial queries where exact   │
│   keyword matches (model names, employer jargon) dominate. An │
│   RRF score floor at JOBTRIAGE_RRF_FLOOR=0.025 suppresses     │
│   low-relevance noise at the API boundary.                    │
│                                                                │
│   ┌─ multilingual encoder comparison (dense) ──────────┐     │
│   │ encoder          P@1     R@10    dim      p95 ms   │     │
│   │ MiniLM (en)      0.700   0.855   384      4.2      │     │
│   │ e5-base (ml)     0.780   0.965   768      6.0      │     │  ← second table, dense rows only
│   │ e5-large (ml)    0.860   0.945   1024     9.8      │     │
│   └────────────────────────────────────────────────────┘     │
│                                                                │
│   English-only MiniLM loses 11 points of recall@10 against    │
│   e5-base on the Swedish golden set. BM25 fusion recovers 7   │
│   of those points but the 4-point residual gap holds. e5-large│
│   lifts P@1 by 8 points over e5-base for ~70% more dense      │
│   latency. The MiniLM dense numbers run slightly suppressed   │
│   because the e5 prefix tokens it never trained on read as    │
│   noise. The multilingual encoder choice was load-bearing,    │
│   not aesthetic.                                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   agent                                                        │  ← mono kicker
│   Spatial tool pairings are pinned in the system prompt.      │
│   After every data tool the agent fires a spatial tool. The   │
│   canvas is the answer, not a decoration.                     │
│                                                                │
│   data tool         → spatial tool                            │  ← two-column mapping list, font-mono
│   searchJobs        → placeAds                                │
│   triageBatch       → groupAds                                │
│   matchProfile      → connectProfileToAds                     │
│   compareRoles      → pairAdsForCompare                       │
│   deadlineWatch     → placeAdsOnTimeline                      │
│   trackStatus       → markStatus                              │
│                                                                │
│   React Flow surfaces four canonical views: triage clusters,  │
│   deadline timeline, side-by-side compare, and pinned         │
│   shortlist. Custom nodes per view, not the React Flow        │
│   defaults.                                                   │
│                                                                │
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
│   [two-posture diagram stacks    │
│    deploy column over local      │
│    column, full width]           │
│   [stack list wraps]             │
├──────────────────────────────────┤
│   retrieval                      │
│   [tables horizontal-scroll or   │
│    collapse to label/value pairs │
│    per row]                      │
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

- Route lives at `src/pages/jobtriage.astro`, served at `erclx.dev/jobtriage`. Uses the same `BaseLayout` as the landing page so fonts, tokens, dark-mode wiring, and the theme toggle stay shared.
- Top bar is a thin chrome row. Left-anchored `←  Eric Le` link back to `/`, the existing `<ThemeToggle>` on the right. No `bg-secondary` band. The case study earns a quieter opening than the landing hero.
- Page-wide vertical rhythm uses the same `px-6 py-16 md:py-20` section padding as origin and looking-for so the editorial pace is identical.
- Mono kickers (`case study`, `problem`, `system`, `retrieval`, `agent`) extend the vocabulary established by `origin` and `looking-for` on the landing page. They render in `font-mono text-label text-muted-foreground`.
- The page reuses the existing `<SectionNav>` component with section ids `problem`, `system`, `retrieval`, `agent` and the `instant` prop set so the rail does not fade in on a page that is otherwise static. Visibility breakpoint stays `xl:flex`. Active tracking via the scroll-position handler.
- All in-page navigation between landing and case study is same-tab. `Live demo` and `GitHub` open in a new tab via `target="_blank" rel="noopener"` because they leave the site.

## Header row

- Mono kicker `case study` telegraphs the page type at a glance, matching the origin and looking-for vocabulary.
- Display title `Jobtriage` renders in Fraunces at one step smaller than the landing hero so the page reads as secondary to the apex. Subtitle mirrors the screencast copy `Live agent triages Swedish job ads against any profile.` in Inter body, capped at `max-w-xl`. Avoids the urge to re-author prose. The screencast subtitle already carries the framing.
- `Live demo` and `GitHub` render as plain text links with `underline-offset-4 hover:underline` matching the landing page's link treatment. Single row that wraps under `sm` if needed.

## Problem section

- Two short sentences. Frames the hook: ranking-for-monetization vs ranking-for-fit, and the move to profile-driven match as a first-class operation. Holds back implementation detail since the rest of the page handles that. Caps at `max-w-2xl`.

## System section

- Opens with a one-line lead about the two-posture split sharing one agent shell.
- A single SVG figure shows the agent shell branching into the deploy column (`lookupConcept → searchJobs → matchProfile → compareRoles` → live JobTech APIs) and the local column (hybrid retrieval, deadline filtering, engagement tracking → SQLite corpus). Sits in a card container with `bg-card` and `rounded-lg`, padding `p-6 md:p-10`, centered. Hand-drawn line weights so it matches the origin DAG vocabulary rather than reading as Mermaid output. Width clamps with `clamp(20rem, 60vw, 40rem)`. Stacks deploy-over-local on narrow viewports.
- Below the figure, a single paragraph explains the same-prompt-same-tools-different-data-path principle.
- A stack list follows in `font-mono text-label` with five rows: Frontend, Backend, Retrieval, BYOK, Domain. Each row is one line. Tight, scannable, no marketing flavor.
- Closes with a single paragraph about the mock-replay + BYOK dual posture as the differentiator. Names what most agent demos punt on. Resists the urge to over-explain.

## Retrieval section

- Opens with a single paragraph naming the 50-query Swedish golden set, the 59-ad corpus and its sourcing across Spotify / Klarna / Volvo Group / Volvo Cars / Ericsson / HT Engineering / Stig Ericsson Bil / Montico / Isaksson Rekrytering, and the embedding model.
- First table: hybrid retrieval ablation. Four configurations (filter-only, bm25-only, dense-only, hybrid). Columns: P@1, R@10, p95 ms. Sits in a card container with the same treatment as the system diagram.
- Caption below the first table frames the headline narrative: dense wins P@1 on this corpus, hybrid earns its place on recall and adversarial keyword-dominant queries. Names the RRF score floor (`JOBTRIAGE_RRF_FLOOR=0.025`) as the noise suppressor at the API boundary.
- Second table: multilingual encoder comparison, dense rows only. Three encoders (MiniLM English-only, e5-base multilingual, e5-large multilingual). Columns: P@1, R@10, dim, p95 ms. Same card treatment. The dim column carries the model dimension (384 / 768 / 1024) rather than a derived memory figure, since the README source only ships the dimension and the memory delta lives in the prose narrative.
- Caption below the second table frames the choice: English-only MiniLM loses 11 points of recall@10 against e5-base on the Swedish golden set, BM25 fusion recovers 7 of those points and the 4-point residual gap holds, e5-large lifts P@1 by 8 points over e5-base for ~70% more dense latency. Closes with the technical note that MiniLM dense numbers run slightly suppressed because the e5 prefix tokens it never trained on read as noise. The multilingual encoder was load-bearing.
- Both tables render in `font-mono` with `tabular-nums` for column alignment. Same treatment as origin's year column. Numbers are not links.

## Agent section

- Opens with a one-line lead about the pinned spatial tool pairings.
- Two-column mapping list. Left column data tools, right column spatial tools. Six rows: searchJobs → placeAds, triageBatch → groupAds, matchProfile → connectProfileToAds, compareRoles → pairAdsForCompare, deadlineWatch → placeAdsOnTimeline, trackStatus → markStatus. Renders in `font-mono text-label`. Arrow uses a Unicode `→` or a styled `→` glyph, not an ASCII `->`. Aligns cleanly with `tabular-nums` for the data-tool column width.
- Below the list, a single paragraph names the four canonical React Flow views (triage clusters, deadline timeline, side-by-side compare, pinned shortlist) and notes the nodes are custom per view.

## Footer

- Hairline `border-t` separator, then a single `← Back to Eric Le` link. The landing page footer's signature wipe and résumé link stay on the landing page only. The case-study footer is a quiet return path, not a second closing beat. Page closes on the agent section's "the canvas is the answer" beat, not on a roadmap section. Forward-motion content is reserved for live interview conversation.

## Animation

- The case study renders static. The `data-fade` markers stay on each element to keep markup consistent with the landing page, but `data-visible='true'` is set at server render so the fade is a no-op. Long-form depth content optimizes for reading speed. The cascade reveal vocabulary stays on the landing page where each section is a focal moment with limited content.

## Project card update

- The landing page's Jobtriage project card adds a third link `Case study` alongside the existing `Live demo` and `GitHub`. Renders in the same `flex` link row that already wraps under narrow viewports. No paperclip icon or other visual differentiator on first cut, since adding chrome to one card out of three would read as inconsistency rather than emphasis.
- The two existing links remain unchanged. `Live demo` still routes to the deployed app, `GitHub` still routes to the repo. The case study earns its own affordance instead of hijacking either.

## Hold for interviews

The following stays off the page deliberately. Sourcing them in conversation is more valuable than publishing them:

- Specific prompt revisions and the reasoning behind each.
- Cross-encoder reranking, explicitly deferred in v1, surfacing only if asked.
- Internal evaluation harness implementation.
- Scoring threshold tuning beyond the named `JOBTRIAGE_RRF_FLOOR=0.025` constant.

The published surface stays on what is observable from the GitHub repo and the deployed app. The conversation surface stays on the judgment calls behind those artifacts.
