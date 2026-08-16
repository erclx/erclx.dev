# Design: hand-coded ambition

## Personality

Engineering depth made visible. The page should read as hand-built rather than assembled, carried by ambient and editorial motion rather than by copy or claims. Preset-library shortcuts are rejected at proposal time, since mesh-gradient generators, off-the-shelf shader presets, and drop-in animation packs read as the default AI-era visual. Generous whitespace and disciplined typography anchor the reading experience and frame that motion rather than replace it, with serif display headings giving weight without nostalgia.

## Color

| Role        | Intent                               | Value   |
| ----------- | ------------------------------------ | ------- |
| background  | warm off-white page canvas           | #F8F4ED |
| surface     | clean white cards and panels         | #FFFFFF |
| text        | warm near-black primary body         | #1A1815 |
| muted       | secondary text and captions          | #776E67 |
| accent      | warm rust reserved for rare emphasis | #A4471C |
| interactive | links and focus rings                | #133DAA |
| success     | restrained forest green              | #15803D |
| warning     | muted amber caution                  | #B45309 |
| error       | dark red failure state               | #B91C1C |

Values name the light theme. The dark theme carries its own value per role rather than a derivation, since the theme control follows the operating system and roughly half of visitors meet each.

Accent and interactive are two accent-shaped roles and the division is what keeps a surface from reaching for the wrong one. Interactive answers what a visitor operates: a link, a focus ring, a control that responds to a click. Accent answers where the visitor is and what the page wants read, which the rail marker and the timeline's current node both carry.

The test between them is whether clicking the thing does something. A rail marker moves as the page scrolls and cannot be operated, so it states position rather than offering an action, and takes the accent. Two persistent placements is the ceiling. A third turns a mark that means "here" into decoration, and the hover on the closing block's rows is transient rather than a third.

Warmth is carried by hue temperature and lightness rather than by hue count. Every neutral sits in the 60 to 82 hue band that the shipped icon and the closing character already occupy, and the dark canvas lifts off near-black to #1A1815, the icon's own ground. A many-hued palette is rejected rather than unconsidered: it reads as consumer rather than engineering and would collide with the case-study charts, which carry their own teal and rust and are the actual content.

Accent, canvas, and text are derived from the artwork the site already ships rather than picked. The icon carries rust #A4471C, cream #F4EFE6, and ground #1A1815, and the closing character carries a warm tan and the same cream. The character keeps its own fixed fills across both themes rather than tracking tokens, so it holds one identity, and the accent it donates is how it reaches the rest of the page.

## Typography

| Role    | Family         | Weight | Size | Line height |
| ------- | -------------- | ------ | ---- | ----------- |
| display | Fraunces       | 600    | 56px | 64px        |
| heading | Fraunces       | 600    | 28px | 36px        |
| lede    | Inter          | 400    | 21px | 30px        |
| body    | Inter          | 400    | 17px | 28px        |
| label   | Inter          | 500    | 14px | 20px        |
| code    | JetBrains Mono | 400    | 14px | 22px        |

Lede sits between heading and body and answers the opening paragraph of a section, where a surface would otherwise carry body size and separate itself by color alone. Reach for it once per section at most. A second lede in one section makes neither read as the opener.

### Page hierarchy

Three Fraunces serif elements anchor the page from top to bottom: the hero H1, the `Projects` H2, and the footer masthead. They render at distinct sizes so the eye reads them as a hierarchy rather than three competing focal points.

Hero H1 holds the display size. Projects H2 sits one step smaller, and the footer masthead one step under the hero, so the page closes without competing with the opener. Surface-specific sizes live in the relevant `.claude/wireframes/<surface>.md`.

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

150ms ease-out for hover and focus state changes. A 700ms fade-and-rise pattern is permitted on entry into the viewport, gated on `[data-js='true']` and `prefers-reduced-motion: no-preference` so the no-JS and reduced-motion experience stays static. Additional ambient and editorial motion lives in the per-surface wireframes and context entries: hero flow field and H1 annotation in `.claude/wireframes/header.md`, project card media, card tilt, and section reveal in `.claude/wireframes/projects.md`, footer masthead and signature wipe in `.claude/wireframes/footer.md`. Anything not named in those entries defaults back to the static rule.

## Iconography

Lucide outline icons at 1.5px stroke. No custom icons. Interactive color reserved for the rare interactive icon, since an icon a visitor operates takes the operable role rather than the emphasis one.
