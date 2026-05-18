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

- Initial render reflects the resolved theme. The inline script reads `localStorage.theme` and falls back to `prefers-color-scheme` when the value is absent. No flash of the wrong scheme.
- Click cycles to the next mode and applies the resolved theme synchronously. The icon swaps to reflect the new current state, not the next click.
- In `system` mode, a `matchMedia` listener re-applies the theme whenever the OS preference flips while the page is open.
- `title` attribute updates per mode for a native browser tooltip that names the current state and the next click. The `aria-label` stays generic so screen readers do not narrate every cycle.

## Icons

- Light state: sun glyph (Lucide-style circle plus eight rays).
- Dark state: moon glyph (single crescent path).
- System state: monitor glyph (rectangle plus stand).

All three render at `width="18"` with `currentColor` stroke at 1.5px, matching the rest of the header chrome.
