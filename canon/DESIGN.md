---
themes:
  - ':root'
  - '.dark'
---

# Design

Values live in `src/styles/global.css`, light under `:root` and dark under `.dark`. This record holds the intent behind them.

## Overview

Engineering depth made visible. The page reads as hand-built rather than assembled, carried by authored motion rather than claims. Generous whitespace and disciplined type frame that motion, and serif display headings give weight without nostalgia. An installed preset is rejected whatever it draws, since the hero's shader is written here as evidence.

## Colors

- Accent marks position, emphasis, prose links, and the focus ring, and two persistent placements on one screen is its ceiling
- `--primary` keeps the operable role for a control a reader presses, and no rendered surface reads it yet
- Neutrals hold hues 60 to 82, and accent, canvas, and text derive from the icon's rust, cream, and ground

| Role        | Property             | Intent                                                             |
| ----------- | -------------------- | ------------------------------------------------------------------ |
| canvas      | `--background`       | warm off-white page in light, the icon's near-black in dark        |
| text        | `--foreground`       | warm near-black body text                                          |
| surface     | `--card`             | pure white plates and cards, so a chart drawn on white has no seam |
| elevated    | `--surface-elevated` | bars and floating controls lifting off the page                    |
| muted text  | `--muted-foreground` | secondary text and captions, the lowest layer text can take        |
| accent      | `--accent`           | warm rust for position and emphasis                                |
| interactive | `--primary`          | a control a reader operates                                        |
| focus       | `--ring`             | the focus ring, resolving to the accent                            |
| error       | `--destructive`      | a failure state                                                    |

## Typography

- Fraunces sets display and headings, Inter sets body, lede, and labels, and JetBrains Mono sets code
- Lede opens a section once at most, since a second lede in one section makes neither read as the opener
- A prose link is accent text with an always-on underline, since color alone cannot identify it

## Spacing

- Micro-spacing inside a section takes only the Tailwind steps 1, 2, 4, 6, and 10, and section rhythm takes 16, 20, 24, and 32
- `--page-inset` is the page's own margin, a clamp every full-bleed surface reads rather than restating
- A value relating two elements is arithmetic over named values, and a value that sets something stays a literal

## Layout

- The landing page holds a fixed reading column, and a project route scales `--prose-column` with the viewport
- `--figure-column` lets a route's figures overhang its prose symmetrically
- The section rail and the cast show from 1280, since the margins below it are too narrow to hold them

## Shapes

- A line is drawn only where it divides content a reader compares, and whitespace states where a surface ends
- A bound a reader needs only while pointing is revealed by a glow under the pointer rather than drawn at rest
- Every focusable control inherits a radius floor, so its focus ring follows its shape

| Role     | Property            | When used                                                 |
| -------- | ------------------- | --------------------------------------------------------- |
| default  | `--radius`          | a still inside a card, an input, and the focus ring floor |
| glow     | `--glow-shadow`     | a bounded control under a pointer, stacked on any ground  |
| floating | `--floating-shadow` | a bar or control lifting off the page                     |

## Motion

- Hover and focus changes take 150ms ease-out, and entry into the viewport takes a 700ms fade-and-rise
- Ambient motion stays under 4px per second, below the band that pulls the eye, and every term on a surface scales from one clock
- Smooth scroll is declared once on the root, and reduced motion renders every reveal and scroll in place

## Iconography

- Lucide outline icons at 1.5px stroke, with no custom icons
- An icon a reader operates takes the operable role rather than the accent
