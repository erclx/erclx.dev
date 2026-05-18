---
title: Looking-for
description: Sits below the projects section as the page's closing call to action. System-card surfacing recruit-funnel criteria.
---

# Looking-for

Appears below the projects section as the page's closing call to action. Sits on a `bg-card` panel with rounded corners and generous padding, but no border, so it reads as an elevated block within the page's flat editorial flow rather than a framed widget. The availability row is promoted to a focal block at the bottom of the criteria list, signaling the page's most time-sensitive recruiter fact.

## Desktop (≥768px)

```plaintext
┌──────────────────────────────────────────────────┐
│  ● looking-for              synced 2026-05-18    │
│                                                  │
│  roles         AI tooling, LLM apps, devex       │
│  setup         Small to mid teams ...            │
│  level         Junior to mid. 18 months ...      │
│  ──────────────────────────────────────────      │
│  availability                                    │
│  ▸ Available immediately, full-time or contract_ │
│  ──────────────────────────────────────────      │
│  EU citizen · no sponsorship · SV, EN, VI        │
└──────────────────────────────────────────────────┘
```

## Behavior

- Panel chrome is `bg-card` with `rounded-lg` and `p-6 md:p-10`. No border. The card tint alone separates it from the page canvas.
- Mono labels (`font-mono text-label text-muted-foreground`) carry the system-card character throughout.
- The header row pairs a `looking-for` label with a small pulsing green dot on the left and a `synced YYYY-MM-DD` build-date stamp on the right, framing the panel as a live status board rather than a static card. The synced date renders from `new Date()` at build time, so it stays honest with no fabricated relative time.
- Three criteria rows render as a `<dl>` with label-value pairs.
- Availability row sits below a hairline divider as its own block. The value renders in `text-body font-mono` with a `text-primary` `▸` prefix and a blinking `_` cursor at the end. Emphasis comes from the mono treatment, the accent glyph, and the live cursor rather than weight, so the value stays in scale with the mono labels above it.
- Footer metadata row sits below a second hairline divider, carrying work-auth and languages as supporting data.

## Cascade reveal

On scroll-in, the card's interior reveals in sequence via the page's existing 700ms fade-and-rise pattern. Per-element delays: `looking-for` label 0ms, roles 150ms, setup 250ms, level 350ms, availability block 600ms (deliberate pause for emphasis), footer row 750ms. Reuses the `data-fade` + `--fade-delay` vocabulary already on the page. No new motion primitives.

## Cursor blink and live dot

A blinking `_` cursor follows the availability value at the end of the line. CSS-only `steps(2)` keyframe with a 1.1s cycle, scoped to the component. The header row carries a slow `2.6s` ease-in-out opacity pulse on the live dot, scoped to the component. Both are `aria-hidden`. Both are skipped entirely under `prefers-reduced-motion: reduce`. Together with the hero flow field, these are the page's continuous-motion elements. They stay tiny and slow so they signal "system is live" without competing with the flow-field signature at the top of the page.

## Availability typewriter

The availability value types out character by character on scroll-in. An IntersectionObserver at threshold 0.1 fires the moment the availability line peeks into the viewport, so typing completes well before the user reaches the footer. A 25ms-per-character interval reveals the text into the live DOM, ending on the full string. Typing overlaps with the `data-fade` reveal rather than waiting for it to settle, which reads as "live system populating." The cursor stays anchored to the right of the typing span so it appears to track the insertion point. The full text renders in server output for the no-JS path and stays untouched under `prefers-reduced-motion: reduce`.

## Row hover state

Each criteria row carries a transparent 2px left border that becomes `border-primary` on hover, paired with the row's mono label shifting from `text-muted-foreground` to `text-foreground`. Negative left margin compensates for the border-side padding so card content does not shift on hover. Only the criteria rows respond to hover. The availability block and footer row stay non-interactive.
