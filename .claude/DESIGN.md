# Design — Editorial minimal

## Personality

Quiet senior-IC confidence. The page reads like a thoughtful long-form essay — restraint over flourish, generous whitespace, one accent color used sparingly. A visitor should feel they have arrived at the home of someone who has been doing this for a while and does not need to shout about it. Serif display headings give it weight without nostalgia.

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

Minimal. 150ms ease-out for hover and focus state changes only. No layout animation, no scroll effects.

## Iconography

Lucide outline icons at 1.5px stroke. No custom icons. Accent color reserved for the rare interactive icon.
