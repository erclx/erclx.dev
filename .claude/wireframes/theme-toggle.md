---
title: Theme toggle
description: Top-right of the header content column, anchored to the same row as the status pill
---

# Theme toggle

Appears in the top-right of the header content column, anchored to the same row as the status pill. A tri-state cycle button that rotates through light, dark, and system on each click.

```plaintext
[☼] light  →  [☾] dark  →  [▢] system  →  [☼] light
```

## Behavior

- Each click cycles to the next mode (light → dark → system → light) and applies the resolved theme immediately. The button shows the icon for the current mode, not the next.
- The chosen mode persists across loads. In `system` mode the page follows the OS color-scheme preference, including when it flips while the page is open.
- The page resolves the theme before first paint, so there is no flash of the wrong icon or wrong scheme.
- Hover or keyboard focus surfaces a native tooltip labelled `Cycle theme`. Screen readers receive the same generic action label rather than narrating every mode.

## Icons

Light, dark, and system each show a distinct icon (sun, moon, monitor), sized and stroked to match the rest of the header chrome.

First-paint resolution, the cycle script, and the CSS-driven icon swap: see `.claude/context/theming.md`.
