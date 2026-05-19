---
title: Theme toggle
description: Top-right of the header content column, anchored to the same row as the status pill.
---

# Theme toggle

Appears in the top-right of the header content column, anchored to the same row as the status pill. Tri-state cycle button that rotates through light, dark, and system on each click. Persists the chosen mode to `localStorage`, except for `system` which clears the key so the page falls back to `prefers-color-scheme` on subsequent loads.

```plaintext
[☼] light  →  [☾] dark  →  [▢] system  →  [☼] light
```

## Behavior

- The component is a React island mounted via `client:only="react"`. Initial state reads `localStorage.theme` on mount. The base layout's inline first-paint script bridges the resolved theme onto `documentElement` before the island hydrates so there is no flash of the wrong scheme.
- Click cycles to the next mode and applies the resolved theme synchronously. The rendered icon swaps to reflect the new current state, not the next click.
- In `system` mode, a `matchMedia` listener re-applies the theme whenever the OS preference flips while the page is open.
- The button is wrapped in a shadcn `Tooltip` from `src/components/ui/tooltip.tsx`. Hover or keyboard focus surfaces a single mode-agnostic label `Cycle theme`. The `aria-label` stays generic so screen readers do not narrate every cycle.

## Icons

- Light state: Lucide `Sun`.
- Dark state: Lucide `Moon`.
- System state: Lucide `Monitor`.

All three render at `size={18}` with `currentColor` stroke at 1.5px, matching the rest of the header chrome.
