---
title: Theme toggle
description: Top-right of the header content column, anchored to the same row as the greeting
---

# Theme toggle

Appears in the top-right of the header content column, anchored to the same row as the greeting. It shared that row with the availability status until 2026-08-17, when the status moved to the closing ask. A tri-state cycle button that rotates through light, dark, and system on each click.

## Regions

- Toggle button: one square icon button at the right end of the greeting's row in the header content column. Light, dark, and system each show a distinct icon (sun, moon, monitor), sized and stroked to match the rest of the header chrome

```plaintext
[☼] light  →  [☾] dark  →  [▢] system  →  [☼] light
```

## States

| State    | Reached when                                                           | Shows                                                         | Evidence       |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- | -------------- |
| `light`  | The reader clicks from `system`, or a stored light choice loads        | The sun icon, over the light theme                            | `not captured` |
| `dark`   | The reader clicks from `light`, or a stored dark choice loads          | The moon icon, over the dark theme                            | `not captured` |
| `system` | The reader clicks from `dark`, or the page loads with no stored choice | The monitor icon, over whichever theme the OS preference sets | `not captured` |

## Copy

- Tooltip and accessible name: `Cycle theme`

## Behavior

- Each click cycles to the next mode (light → dark → system → light) and applies the resolved theme immediately. The button shows the icon for the current mode, not the next.
- The chosen mode persists across loads. In `system` mode the page follows the OS color-scheme preference, including when it flips while the page is open.
- The page resolves the theme before first paint, so there is no flash of the wrong icon or wrong scheme.
- Hover or keyboard focus surfaces a native tooltip labelled `Cycle theme`. Screen readers receive the same generic action label rather than narrating every mode.
- The control arrives with the hero rather than being in place before it, and still lands on the bar's slot. Mechanism: `canon/context/motion.md`.

First-paint resolution, the cycle script, and the CSS-driven icon swap: see `canon/context/theming.md`.

## Not on this surface

- No per-mode label. The button carries one generic action name rather than announcing each mode.
- One toggle per page. The hero's control travels into the sticky bar rather than the bar rendering a second one.
