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

- The component is a plain Astro `<button>` with an inline `<script>`. No React island, no hydration cost. All three icons render in the markup. CSS shows only the one matching the current mode via `html[data-theme-mode='<mode>'] [data-theme-icon='<mode>']`.
- The base layout's inline first-paint script reads `localStorage.theme`, computes the resolved mode, applies the `dark` class, and sets `data-theme-mode` on `documentElement` before the icons render. No flash of the wrong icon or wrong scheme.
- Click cycles to the next mode and applies the resolved theme synchronously. The CSS-driven icon swap reflects the new current state, not the next click.
- In `system` mode, a `matchMedia` listener re-applies the theme whenever the OS preference flips while the page is open.
- Hover or keyboard focus surfaces the browser's native `title` tooltip with the label `Cycle theme`. The `aria-label` carries the same string so screen readers receive a generic action label rather than narrating every mode cycle.

## Icons

- Light state: inline Lucide `Sun` SVG.
- Dark state: inline Lucide `Moon` SVG.
- System state: inline Lucide `Monitor` SVG.

All three render at `width={18}` `height={18}` with `currentColor` stroke at 1.5px, matching the rest of the header chrome. The icons are inlined as raw SVG markup so no JavaScript runs to render them.
