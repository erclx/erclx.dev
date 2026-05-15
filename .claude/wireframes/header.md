---
title: Header
description: Top-of-page band on every viewport. Carries identity, status, headline, narrative, and primary contact links.
---

# Header

Appears at the top of the page on every viewport. Carries identity, status, headline, narrative, and primary contact links. Sits inside a tinted band that visually separates it from the rest of the page.

## Desktop (≥768px)

```plaintext
┌─[bg-secondary]──────────────────────────────────────────────┐
│                                                             │
│   ● OPEN TO WORK                                    [☾]     │  ← row 1: status pill ↔ theme toggle
│   ERIC LE · GOTHENBURG, SWEDEN                              │  ← row 2: identity meta
│                                                             │
│   I build LLM applications and developer tools              │  ← display heading
│                                                             │
│   Applied AI engineer working in LLM applications and       │
│   prompt engineering. Spent 1.5 years building natural      │  ← body paragraph, max-w-xl
│   language data agents at Volvo ...                         │
│                                                             │
│   GitHub    LinkedIn    me@erclx.dev                        │  ← contact links row
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Narrow (≤320px)

```plaintext
┌─[bg-secondary]───────────────────┐
│                                  │
│   ● OPEN TO WORK          [☾]    │
│   ERIC LE · GOTHENBURG,          │  ← identity wraps to two lines
│   SWEDEN                         │
│                                  │
│   I build LLM applications       │
│   and developer tools            │
│                                  │
│   [body paragraph wraps]         │
│                                  │
│   GitHub    LinkedIn             │
│   me@erclx.dev                   │
│                                  │
└──────────────────────────────────┘
```

## Behavior

- Status pill and theme toggle anchor opposite ends of the same row. Toggle stays inside the header column rather than fixed to the viewport.
- Identity meta line sits directly under the status pill, tightly spaced, so the two read as one block of meta information.
- Body paragraph caps at `max-w-xl` so line length stays readable on wide viewports while the band itself runs full width.
- Contact links wrap to a new row when the viewport cannot hold all three on one line. Links are same-tab.

## H1 annotation

A single phrase in the hero H1 carries a `rough-notation` underline drawn ~950ms after the H1 fade settles. Drawn once per page-load, never replayed. The library imports dynamically from a client `<script>` so it executes browser-only. The stroke uses `--foreground`. Skipped entirely under `prefers-reduced-motion: reduce`. Only one phrase per page may carry an annotation. The rule is editorial restraint.

## Flow field signature

A particle canvas renders behind the header band as the page's visual signature. See `.claude/context/flow-field.md` for the mount lifecycle, perf budget, and reduced-motion fallback contract. Visual budget: zero shader libraries, color tracks `--foreground` at 0.2 alpha, single static SVG snapshot at 0.08 alpha for the reduced-motion fallback.
