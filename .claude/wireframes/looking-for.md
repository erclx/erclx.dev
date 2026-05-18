---
title: Looking-for
description: Sits below the projects section as the page's closing call to action. System-card surfacing recruit-funnel criteria.
---

# Looking-for

Appears below the projects section as the page's closing call to action. Sits on a `bg-card` panel with rounded corners and generous padding, but no border, so it reads as an elevated block within the page's flat editorial flow rather than a framed widget. The panel pairs a single `looking-for` kicker with four short criteria rows. Availability information lives in the hero's `[●] OPEN TO WORK` pill, so the panel does not restate it. The panel adds specificity (which roles, which team profile, which level, which terms) rather than restating the hero.

## Desktop (≥768px)

```plaintext
┌──────────────────────────────────────────────────┐
│  looking-for                                     │
│                                                  │
│  roles         AI tooling · LLM apps · devex     │
│  setup         small to mid teams · GBG/remote   │
│  level         junior to mid                     │
│  terms         full-time or contract             │
└──────────────────────────────────────────────────┘
```

## Behavior

- Panel chrome is `bg-card` with `rounded-lg` and `p-6 md:p-10`. No border. The card tint alone separates it from the page canvas.
- Mono labels (`font-mono text-label text-muted-foreground`) carry the system-card character throughout.
- The kicker is a single `looking-for` mono label. No availability statement, no status dot, no build-date stamp. The hero already carries the live status via its `[●] OPEN TO WORK` pill, and the panel earns its space by adding specificity rather than restating that signal.
- Four criteria rows render as a `<dl>` with short fragment values (3-6 words each), not prose sentences. Detail belongs on the resume PDF, not in the closing block of the landing page.

## Cascade reveal

On scroll-in, the card's interior reveals in sequence via the page's existing 700ms fade-and-rise pattern. Per-element delays: kicker 0ms, roles 150ms, setup 250ms, level 350ms, terms 450ms. Reuses the `data-fade` + `--fade-delay` vocabulary already on the page. No new motion primitives.

## Row hover state

Each criteria row carries a transparent 2px left border that becomes `border-primary` on hover, paired with the row's mono label shifting from `text-muted-foreground` to `text-foreground`. Negative left margin compensates for the border-side padding so card content does not shift on hover. Only the criteria rows respond to hover. The kicker line stays non-interactive.
