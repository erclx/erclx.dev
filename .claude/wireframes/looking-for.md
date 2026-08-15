---
title: Looking-for
description: Sits below the projects section as the page's closing call to action. System-card surfacing recruit-funnel criteria
---

# Looking-for

Appears below the projects section as the page's closing call to action. Sits on a tinted card panel with rounded corners and generous padding, no border, so it reads as a distinct block within the page's flat editorial flow rather than a framed widget.

The panel pairs a single `looking-for` kicker with four short criteria rows. Availability lives in the hero's `OPEN TO WORK` pill, so the panel does not restate it. What it adds instead is specificity: which roles, which team profile, which level, which terms.

## Desktop (≥768px)

```plaintext
┌──────────────────────────────────────────────────────────┐
│  looking-for                                             │
│                                                          │
│  roles         AI tooling · LLM apps · devex             │
│  setup         small to mid teams · Gothenburg or remote │
│  level         junior to mid                             │
│  terms         full-time or contract                     │
└──────────────────────────────────────────────────────────┘
```

## Behavior

- The panel sits on a tinted card surface with rounded corners and generous padding, no border. The card tint alone separates it from the page canvas.
- Mono labels carry the system-card character for the kicker and the four row labels.
- The kicker is a single `looking-for` mono label. No availability statement, no status dot, no build-date stamp. The hero already carries the live status via its `OPEN TO WORK` pill, and the panel earns its space by adding specificity rather than restating that signal.
- Four criteria rows render as a definition list with short fragment values (3-6 words each), not prose sentences. Values carry the same treatment a project card link does, which is what ties the panel to the page: the label face against the body face at one size, sharing a baseline with the mono label beside it. Setting them in the display serif at prose size put a third face in one small card, read as a change of face rather than a change of level, and left every row's two columns off the same baseline. Detail belongs on the resume PDF, not the closing block of the landing page.
- The label column and its value sit close enough to read as one row. A wide channel between them makes the eye travel, which reads as two lists rather than four pairs.

## Cascade reveal

On scroll-in the kicker and the four rows reveal in a top-to-bottom cascade. Mechanism: `.claude/context/motion.md`.

## Row hover state

Each criteria row carries a left border that turns primary on hover, paired with its mono label shifting from muted to foreground. Only the criteria rows respond to hover. The kicker line stays non-interactive.

## Peek character

A small filled-silhouette character peeks from behind the top-right corner of the card. It stays hidden behind the card until the section enters the viewport, then springs up to a peeked position with paws gripping the visible card edge.

When the cursor enters the card the character ducks back behind it. When the cursor leaves, it pops back up. Under reduced motion the character stays peeked with no transitions.

The character SVG carries its own fixed palette of a warm tan body, a cream face mask, and dark brown features. That palette stays consistent across light and dark themes rather than tracking the page tokens, so the character keeps one identity. Its body extends below its head so the lower portion clips naturally behind the card edge.
