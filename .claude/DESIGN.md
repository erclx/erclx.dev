# Design: editorial minimal

## Personality

Quiet senior-IC confidence. The page reads like a thoughtful long-form essay. Restraint over flourish, generous whitespace, one accent color used sparingly. A visitor should feel they have arrived at the home of someone who has been doing this for a while and does not need to shout about it. Serif display headings give it weight without nostalgia.

## Color

| Role       | Intent                       | Value   |
| ---------- | ---------------------------- | ------- |
| background | warm off-white page canvas   | #FAFAF7 |
| surface    | clean white cards and panels | #FFFFFF |
| text       | near-black primary body      | #18181B |
| muted      | secondary text and captions  | #71717A |
| accent     | deep blue link and action    | #1E40AF |
| success    | restrained forest green      | #15803D |
| warning    | muted amber caution          | #B45309 |
| error      | dark red failure state       | #B91C1C |

## Typography

| Role    | Family         | Weight | Size | Line height |
| ------- | -------------- | ------ | ---- | ----------- |
| display | Fraunces       | 600    | 56px | 64px        |
| heading | Fraunces       | 600    | 28px | 36px        |
| body    | Inter          | 400    | 17px | 28px        |
| label   | Inter          | 500    | 14px | 20px        |
| code    | JetBrains Mono | 400    | 14px | 22px        |

### Page hierarchy

Three Fraunces serif elements anchor the page from top to bottom: the hero H1, the `Projects` H2, and the footer masthead. They render at distinct sizes so the eye reads them as a hierarchy, not three competing focal points. Hero H1 stays at `text-display`. Projects H2 sits one step smaller at `text-[2.25rem] md:text-[2.75rem]`. Footer masthead at `clamp(2rem, 4vw + 1rem, 3rem)`, slightly under the hero so the page closes without competing with the opener.

### Editorial numerals

Each project card carries a Fraunces 600 numeral (`01`, `02`) absolutely positioned per card, set in `--color-foreground` and dimmed via alpha so it reads as ambient typography rather than a label. At `lg`+ the numeral hangs in the side margin of the card (left of the first column, right of the second) at 0.25 alpha, ~8rem, and a 3rem outdent so it clears the card's dark image area. Below `lg` the grid collapses to one column and the numeral sits behind the card content at 0.10 alpha and ~5rem. The element is `aria-hidden`, `pointer-events-none`, and `select-none` so it never disrupts reading order or interaction.

### Footer masthead

The footer opens with a Fraunces 600 `Eric Le` mark sized via `clamp(2rem, 4vw + 1rem, 3rem)` so it scales smoothly down to 320px without overflowing. The Résumé link and copyright drop below the mark as small meta in the existing `text-label` rendering. Sized one step under the hero H1 so the footer reads as a closing statement, not a second title.

## Spacing

| Step | Multiplier | Value | Tailwind step |
| ---- | ---------- | ----- | ------------- |
| xs   | 0.5        | 4px   | `1`           |
| sm   | 1          | 8px   | `2`           |
| md   | 2          | 16px  | `4`           |
| lg   | 3          | 24px  | `6`           |
| xl   | 5          | 40px  | `10`          |

Use only the `1 / 2 / 4 / 6 / 10` Tailwind steps for micro-spacing inside a section: paddings, gaps, and margins between adjacent elements. The steps `3`, `5`, `7`, `8`, and `9` produce off-scale values that read as arbitrary, so avoid them. Section-level vertical rhythm uses `16` and `20` (md:) for normal sections, plus `24` and `32` for the hero. Those larger values compose with the scale without inventing intermediate steps.

## Borders

| Role    | Radius | Width | When used             |
| ------- | ------ | ----- | --------------------- |
| default | 8px    | 1px   | cards, inputs         |
| pill    | 999px  | 0     | tags, status chips    |
| none    | 0      | 0     | edge-to-edge surfaces |

## Motion

150ms ease-out for hover and focus state changes. A 700ms fade-and-rise pattern is permitted on entry into the viewport, gated on `[data-js='true']` and `prefers-reduced-motion: no-preference` so the no-JS and reduced-motion experience stays static. Additional motion is permitted only as defined in `## Motion and media`.

## Motion and media

Ambient and editorial motion is permitted only as named below. Each entry states scope, dependency budget, and the reduced-motion fallback. Anything not named here defaults back to the static `## Motion` rule.

### Project card media

- One muted MP4 per project, dark theme only, ≤500kb, 720p, h.264 baseline. Poster is a single dark PNG extracted from the same clip.
- `preload="none"`. Video loads on first pointer-enter and plays muted, looping. Pointer-leave pauses the video and resets it to frame 0.
- Poster sits underneath the video. Video fades in over 200ms once playback starts. Touch devices and `prefers-reduced-motion: reduce` see the poster only.
- Media slot frames the dark clip as embedded media so it sits cleanly on either page theme: rounded inner corners, hairline ring, soft shadow, light surface inset around the clip.

### Card tilt

- Cards under `[data-tilt]` rotate up to 6° toward the cursor on `pointermove`. The inner media slot translates up to 8px against the rotation for parallax depth.
- A single `requestAnimationFrame` loop reads pointer state across all cards. Per-card values smooth via lerp at factor 0.18 so motion feels physical without CSS transitions fighting the JS update.
- Skipped entirely under `prefers-reduced-motion: reduce`.

### Hero flow field

A vanilla TypeScript particle flow-field renders behind the hero header band as the page's signature. Particles drift along a 2D simplex noise field at ~200 active particles, with cursor proximity adding a falloff-weighted attractive force. Color tracks `--color-foreground` at 0.2 alpha so the field reads quietly on either theme. The canvas is `pointer-events: none`, clipped to the rounded header band, paused on `visibilitychange`, and degrades to half particle count and 30fps when the rolling 2-second average drops below 50fps. Mounted via `IntersectionObserver` so the rAF loop never runs off-screen. Theme changes are tracked by a `MutationObserver` on the document `class` attribute. Under `prefers-reduced-motion: reduce`, the canvas is hidden and a single hand-authored SVG snapshot at 0.08 alpha takes its place. No shader libraries or third-party physics deps.

### One annotation per page

A single phrase in the H1 carries a `rough-notation` underline drawn ~950ms after the H1 fade settles. Drawn once per page-load, never replayed. `rough-notation` (~9kb gz) is dynamically imported from a client `<script>` so it executes browser-only. Skipped entirely under `prefers-reduced-motion: reduce`. The annotation stroke uses `--color-foreground`. Only one phrase per page may carry an annotation. The rule is editorial restraint.

### Section reveal

The projects section unfurls from the bottom edge as it enters the viewport. The reveal is a `clip-path` animating from `inset(100% 0 0 0)` to `inset(0)`, scroll-tied to a named view-timeline (`view-timeline-name: --projects`) on the section element so progress tracks the scroll position rather than time. The animation range is `entry 0% cover 40%` so the section finishes revealing well before its midpoint reaches the viewport center. Bound natively via `animation-timeline: view()` with no library and no JS. Browsers without scroll-driven animation support (notably Safari) hit the `@supports not (animation-timeline: view())` branch and render the section statically with `clip-path: inset(0)`. The same static reveal applies under `prefers-reduced-motion: reduce`. Only one section on the page carries this treatment so the reveal stays a deliberate gesture, not a pattern.

### Signature wipe

The footer signature is an inlined SVG of filled paths sized to ~6rem wide via an explicit aspect-ratio wrapper, rendered in `--color-foreground`. The signature is fully visible by default so a JS or observer failure does not hide it. On viewport entry an `IntersectionObserver` at threshold 0.1 with a -10% bottom rootMargin toggles `data-revealed='true'` once, which activates a CSS keyframe animation wiping `clip-path: inset(0 100% 0 0)` to `inset(0)` over 1200ms ease-out. The animation rule is gated on `[data-js='true']` and `prefers-reduced-motion: no-preference` so the no-JS and reduced-motion paths render statically. Filled paths from auto-vectorization preclude `stroke-dashoffset`, so the wipe substitutes for the stroke-draw effect at footer scale.

## Iconography

Lucide outline icons at 1.5px stroke. No custom icons. Accent color reserved for the rare interactive icon.
