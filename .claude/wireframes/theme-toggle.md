---
title: Theme toggle
description: Top-right of the header content column, anchored to the same row as the status pill.
---

# Theme toggle

Appears in the top-right of the header content column, anchored to the same row as the status pill. Single button that toggles `dark` on `documentElement` and persists the preference to `localStorage`.

```plaintext
[☾] light mode      [☼] dark mode
```

## Behavior

- Initial render reflects the resolved theme from the inline script in the layout, with no flash of the wrong scheme.
- Click swaps the theme synchronously and writes the new value to storage.
- Toggle scrolls with the page rather than staying fixed. Acceptable on a one-screen landing.
