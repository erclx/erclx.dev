# Wireframes

ASCII wireframes for the v1 landing page. Structure and layout only, not final design. Update this doc when a new surface is designed or a layout decision changes.

## Page

The single page at `/`. Three sections stack vertically inside the body. The header carries its own background band that runs edge-to-edge. Projects and footer sit on the page canvas.

```plaintext
┌──────────────────────────────────────────────────────────┐
│ [header band, bg-secondary, border-b]                    │
│   [pill]                                  [theme toggle] │
│   Eric Le · Gothenburg, Sweden                           │
│   I build LLM agents and developer tools                 │
│   [body paragraph, max-w-xl]                             │
│   [GitHub] [LinkedIn] [me@erclx.dev]                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   PROJECTS                                               │
│   ┌──────────────────────────────────────────────────┐   │
│   │ [project card: Stackr]                           │   │
│   └──────────────────────────────────────────────────┘   │
│   ┌──────────────────────────────────────────────────┐   │
│   │ [project card: Caret]                            │   │
│   └──────────────────────────────────────────────────┘   │
│   Plus Toolkit, an agent-first CLI ...                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│   ──────── (border-t hairline) ────────                  │
│   © 2026 Eric Le · Gothenburg, Sweden                    │
└──────────────────────────────────────────────────────────┘
```

## Header

Appears at the top of the page on every viewport. Carries identity, status, headline, narrative, and primary contact links. Sits inside a tinted band that visually separates it from the rest of the page.

### Desktop (≥768px)

```plaintext
┌─[bg-secondary]──────────────────────────────────────────────┐
│                                                             │
│   ● OPEN TO WORK                                    [☾]     │  ← row 1: status pill ↔ theme toggle
│   ERIC LE · GOTHENBURG, SWEDEN                              │  ← row 2: identity meta
│                                                             │
│   I build LLM agents and developer tools                    │  ← display heading
│                                                             │
│   Applied AI engineer working in LLM applications and       │
│   prompt engineering. Spent 1.5 years building natural      │  ← body paragraph, max-w-xl
│   language data agents at Volvo ...                         │
│                                                             │
│   GitHub    LinkedIn    me@erclx.dev                        │  ← contact links row
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Narrow (≤320px)

```plaintext
┌─[bg-secondary]───────────────────┐
│                                  │
│   ● OPEN TO WORK          [☾]    │
│   ERIC LE · GOTHENBURG,          │  ← identity wraps to two lines
│   SWEDEN                         │
│                                  │
│   I build LLM agents and         │
│   developer tools                │
│                                  │
│   [body paragraph wraps]         │
│                                  │
│   GitHub    LinkedIn             │
│   me@erclx.dev                   │
│                                  │
└──────────────────────────────────┘
```

### Behavior

- Status pill and theme toggle anchor opposite ends of the same row. Toggle stays inside the header column rather than fixed to the viewport.
- Identity meta line sits directly under the status pill, tightly spaced, so the two read as one block of meta information.
- Body paragraph caps at `max-w-xl` so line length stays readable on wide viewports while the band itself runs full width.
- Contact links wrap to a new row when the viewport cannot hold all three on one line. Links are same-tab.

## Projects

Appears below the header. Lists shipped tools as cards stacked in a single column. The page intentionally keeps to one reading axis, so the layout never branches into a grid.

```plaintext
┌──────────────────────────────────────────────────────────┐
│   PROJECTS                                               │  ← section label, uppercase
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Stackr                                           │   │  ← display heading
│   │                                                  │   │
│   │ VS Code extension for multi-file LLM context     │   │  ← description body
│   │ preparation. 1,000+ downloads on Open VSX ...    │   │
│   │                                                  │   │
│   │ VS Code Marketplace   Open VSX   GitHub          │   │  ← link row, wraps when needed
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   ┌──────────────────────────────────────────────────┐   │
│   │ Caret                                            │   │
│   │ ...                                              │   │
│   │ Chrome Web Store   GitHub                        │   │
│   └──────────────────────────────────────────────────┘   │
│                                                          │
│   Plus Toolkit, an agent-first CLI that installs and     │  ← inline link to Toolkit
│   syncs governance, skills, and standards across         │
│   projects.                                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Behavior

- Cards stack in document order. No filtering, no sorting, no interactivity beyond the link clicks.
- Card link rows wrap when the viewport cannot hold every link on one line. Wrap is expected at 320px on cards with three or more links.
- The trailing "Plus Toolkit" paragraph is a deliberate downgrade for the third project: the strategy is one inline mention rather than a third card.

## Footer

Appears at the bottom of the page. Carries the copyright line only. Contact links live in the header so the footer does not duplicate them. A resume PDF link is queued for this slot once the PDF ships. Separated from the projects section by a hairline `border-t`.

```plaintext
┌──────────────────────────────────────────────────────────┐
│   ─────────────────────────────────────────────────────  │  ← border-t
│                                                          │
│   © 2026 Eric Le · Gothenburg, Sweden                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Behavior

- Single text row, left-aligned to match the body rhythm at every viewport.
- Year derives from the current build time. Copyright text matches the header identity meta verbatim.

## Theme toggle

Appears in the top-right of the header content column, anchored to the same row as the status pill. Single button that toggles `dark` on `documentElement` and persists the preference to `localStorage`.

```plaintext
[☾] light mode      [☼] dark mode
```

### Behavior

- Initial render reflects the resolved theme from the inline script in the layout, with no flash of the wrong scheme.
- Click swaps the theme synchronously and writes the new value to storage.
- Toggle scrolls with the page rather than staying fixed. Acceptable on a one-screen landing.
