---
title: Theme toggle
description: Top-right of the header content column, anchored to the same row as the greeting
---

# Theme toggle

Appears in the top-right of the header content column, anchored to the same row as the greeting. It shared that row with the availability status until 2026-08-17, when the status moved to the closing ask. A tri-state cycle button that rotates through light, dark, and system on each click.

## Cycle order

```plaintext
[☼] light  →  [☾] dark  →  [▢] system  →  [☼] light
```

## Behavior

- Each click cycles to the next mode (light → dark → system → light) and applies the resolved theme immediately. The button shows the icon for the current mode, not the next.
- The chosen mode persists across loads. In `system` mode the page follows the OS color-scheme preference, including when it flips while the page is open.
- The page resolves the theme before first paint, so there is no flash of the wrong icon or wrong scheme.
- Hover or keyboard focus surfaces a native tooltip labelled `Cycle theme`. Screen readers receive the same generic action label rather than narrating every mode.
- The control arrives with the hero rather than being in place before it. The marker sits on the button rather than on its slot in the header, because the handoff re-parents it into a fixed host on load and the slot it leaves collapses to a point. Verified at 1280x800: it fades in while rising 16px and still lands on the bar's slot at 0px in both axes. Mechanism: `.claude/context/motion.md`.

## Icons

Light, dark, and system each show a distinct icon (sun, moon, monitor), sized and stroked to match the rest of the header chrome.

First-paint resolution, the cycle script, and the CSS-driven icon swap: see `.claude/context/theming.md`.
