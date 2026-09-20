# Design: hand-coded ambition

## Personality

Engineering depth made visible. The page should read as hand-built rather than assembled, carried by ambient and editorial motion rather than by copy or claims. Generous whitespace and disciplined typography anchor the reading experience and frame that motion rather than replace it, with serif display headings giving weight without nostalgia.

What is rejected is the shortcut rather than the medium. Mesh-gradient generators, drop-in animation packs, and installed shader presets read as the default AI-era visual, and a preset is rejected at proposal time whatever it draws. An authored surface is the opposite claim: the hero runs a fragment shader written here, mounted on a lifecycle written here, and it is evidence of the ability the page asserts rather than decoration bought in. This line rejected shader work as a category until 2026-08-20, which read as a ban on the technique when what it always meant was a ban on installing one.

Two things separate an authored surface from the shortcut it is not. It is drawn rather than configured, so every value in it answers to a measurement or to a decision recorded beside it. And it is judged against the running page rather than against a gallery, with the arms that lose deleted rather than left behind a flag.

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

Accent and interactive are two accent-shaped roles and the division is what keeps a surface from reaching for the wrong one. Interactive answers what a visitor can act on: a link, a focus ring, a control responding to a press. Accent answers where the visitor already is and what the page wants read.

The test is what the mark offers. Not what its element does, and not what raised it. A mark offering an action takes interactive. A mark offering only emphasis or position takes the accent, whether the page computed it or the reader raised it.

Two cases carry the whole rule, and each defeats one of the readings that look right.

The rail defeats reading by the element. Its label is an anchor that scrolls to a section, so the element is operable, and its focus ring is interactive on those grounds. The active border beside it tracks scroll position and would sit there under a reader who never clicked anything, so it is accent. Two roles on one element rather than a contradiction. A pointer raises that same border on any row, which changes nothing here: the mark offers emphasis either way, and the case below is the one that settles it.

The closing block's criteria rows defeat reading by the trigger. Their border is raised by a hover, which is the reader acting, and it still takes the accent, because the rows are read rather than operated and the border offers emphasis rather than an affordance. A hover raising emphasis on something inert is not an action mark.

Two persistent placements is the ceiling. A third turns a mark that means "here" into decoration, and the hover on the closing block's rows is transient rather than a third.

Warmth is carried by hue temperature and lightness rather than by hue count. Every neutral carrying a hue sits in the 60 to 82 band that the shipped icon and the closing character already occupy, and the surfaces holding pure white carry no hue to place. The dark canvas lifts off near-black to #1A1815, the icon's own ground. A many-hued palette is rejected rather than unconsidered: it reads as consumer rather than engineering and would collide with the case-study charts, which carry their own teal and rust and are the actual content.

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

Hero H1 holds the display size. Projects H2 sits one step smaller, and the footer masthead one step under the hero, so the page closes without competing with the opener. Surface-specific sizes live in the relevant `canon/wireframes/<surface>.md`.

The sizes above are flat across every viewport on the landing page. A project route is the one surface that scales its prose and its column together, and `canon/context/layout-measure.md` owns those clamps along with the figure overhang that tracks them.

## Spacing

| Step | Multiplier | Value | Tailwind step |
| ---- | ---------- | ----- | ------------- |
| xs   | 0.5        | 4px   | `1`           |
| sm   | 1          | 8px   | `2`           |
| md   | 2          | 16px  | `4`           |
| lg   | 3          | 24px  | `6`           |
| xl   | 5          | 40px  | `10`          |

Use only the `1 / 2 / 4 / 6 / 10` Tailwind steps for micro-spacing inside a section: paddings, gaps, and margins between adjacent elements. The steps `3`, `5`, `7`, `8`, and `9` produce off-scale values that read as arbitrary, so avoid them. Section-level vertical rhythm uses `16` and `20` (md:) for normal sections, plus `24` and `32` for the hero. Those larger values compose with the scale without inventing intermediate steps.

The page's own inset is not on that scale and cannot be. It is `--page-inset`, a clamp from 24px to 48px, because below the width where the reading column starts capping itself that inset is the only margin the page has, and a fixed step gives less margin the wider the viewport gets: a 24px constant measured 7.5% of the width at 320 and 3.1% at 768. Every full-bleed surface reads that one value rather than restating it, after it sat in fourteen files as a literal and the routes had already drifted from the landing page.

Anything positioned against the page edge derives from that value rather than picking its own. The sticky bar's detached shape floors its inset at the page inset minus a stated padding, which is what keeps the name off the curve. The two were independent until 2026-08-20, and the gap between them collapsed to 8px on a phone while reading 22px at 768.

That generalizes past the page inset. A value relating two elements is arithmetic over named values, never a literal, and what is banned is a literal standing in for a relationship two other values already fix. A nudge centering one element against another is the shape to refuse: it encodes both of their current widths and goes wrong the moment either one moves. `canon/context/site-bar.md` carries the case that settled it.

A mark that has to line up with type derives from the type's own metrics for the same reason. An origin dot centers inside a box one line-height tall, a rail segment spans `calc(1lh / 2)` to the next row rather than a measured offset, and a status dot centers on a box one cap-height tall resting on the label's baseline.

A value that sets something rather than relating two things stays a literal. That covers the spacing steps above, the type sizes, and the 44px tap minimum.

## Borders

| Role    | Radius | Width | When used                                      |
| ------- | ------ | ----- | ---------------------------------------------- |
| default | 8px    | 1px   | a still inside a card, an input                |
| pill    | 999px  | 1px   | the sticky bar once it detaches, tags, chips   |
| none    | 0      | 0     | edge-to-edge surfaces, and every reading plate |

A line is drawn where it divides content a reader scans, and nowhere else. The page carried an outline on every project card, a rule under the hero band, one under the sticky bar, one over the footer, and one per row in the closing ask. All but the last came out on 2026-08-20, because none of them divided anything: they drew boxes around surfaces that whitespace was already separating.

Three tests decide whether a line stays.

A line dividing rows a reader compares stays, which is why the closing ask keeps the rule above its criteria and the timeline keeps its rail. A line drawn under something a drawing rests on stays, which is the same rule reaching the ask's top edge, where a character is occluded by it. A line stating where a surface ends comes out, and what replaces it is a ground that fades, a gap, or a shape revealed under a pointer.

A bound a reader needs only while pointing is revealed rather than drawn. An unboxed card states its extent by lighting a shape larger than its content on hover, so the grid stays borderless at rest and a pointer still lands on something.

## Elevation and response

Two token sets sit in `:root`, and every floating or interactive control resolves them from there rather than declaring its own. Elevation answers what lifts off the page. Response answers what a pointer does to a control.

The elevation set carries `--surface-elevated` rather than reusing `--card`. The two had to be separated before either could move, because `--card` also grounds the white chart plates on a project route, so one token was answering two unrelated questions.

The response set has a single source rather than a set of surfaces kept in agreement. The project card's four values moved out of it unchanged and every other bounded control reads them back. Where a control already carries a ground at rest, the glow stacks on top rather than replacing it, since swapping one shadow for the other makes a lit control appear to drop as it lights.

Which controls take the glow is decided by the same test the card settled. A control with bounds takes it. A link sitting inline in a paragraph keeps its underline instead, since a ground behind a word reads as a highlighter and fights the sentence around it.

Both sets have ceilings that are lower than their token values suggest, and neither is visible from a token name. `canon/context/theming.md` § What the palette cannot do owns them, including why they are read off painted pixels rather than off composited values.

## Focus

The focus ring takes the site's accent rather than the component library's default blue. It measures 5.48:1 in light and 5.42:1 in dark against a 3:1 floor for a non-text indicator. `--light-ring` resolves to the light accent, so a control focused inside a chart plate carries the site's ring too rather than losing it to the pinned palette.

An outline follows its element's own radius, so a control declaring no radius draws a rectangular ring around a rounded shape. A radius floor in `@layer base` fixes that without maintaining a list of components: an unlayered component rule and a Tailwind utility both outrank a layered declaration, so a control carrying its own shape keeps it and only the shapeless ones take the floor.

The glow lands on the same test as the card's hover glow, with one difference in reach. A focus indicator has to reach every control, where a hover response can afford to be selective, so the inline link that declines the glow still gets a ring.

A focus ring only answers a Tab, where a pointer response is checked on every visual pass, which is why `e2e/focus-inventory.ts` sweeps every control's focus state rather than leaving it to review.

## Links

A prose link inside a case study is accent-colored text with an always-on underline, applied as utilities per link rather than a named class, matching how the header and footer links are styled directly.

The underline is always on rather than raised by a pointer. WCAG's caution against color as the only visual means of conveying information means a link inside a paragraph has to identify itself without relying on color perception, and a hover-only underline fails that for a keyboard or touch reader outright.

An inline link is exempt from the site's 44px tap-target minimum when its computed `display` resolves to `inline`, since a word sized to its own text inside a sentence cannot clear that floor without inflating the line it sits in. That is the case WCAG's own criterion exempts rather than a shortcut taken here.

## Motion

150ms ease-out for hover and focus state changes. A 700ms fade-and-rise pattern is permitted on entry into the viewport, gated on `[data-js='true']` and `prefers-reduced-motion: no-preference` so the no-JS and reduced-motion experience stays static. Additional ambient and editorial motion lives in the per-surface wireframes and context entries: the hero surface in `canon/context/shader-field.md`, the H1 annotation in `canon/wireframes/header.md`, project card media, card tilt, and section reveal in `canon/wireframes/projects.md`, footer masthead and signature wipe in `canon/wireframes/footer.md`. Anything not named in those entries defaults back to the static rule.

Travel to a scroll target eases rather than jumping, declared once on the root under `prefers-reduced-motion: no-preference` so every control resolves it instead of deciding for itself. The curve and the duration belong to the engine, since CSSOM-View defines neither, which puts this outside the numbered rules above rather than beside them. A caller that means to arrive rather than to travel says so explicitly. See `canon/ARCHITECTURE.md` § One declaration decides how the page travels, and every caller resolves it.

Ambient motion carries a ceiling the hover rule does not. Motion detected with no fixed reference to judge it against sits near 0.1 to 0.3 degrees per second, roughly 4 to 11px per second at a desk, and anything inside that band pulls the eye without rewarding it. The hero surface's fastest term runs 0.13px per second and renews its pattern over about two minutes, an order of magnitude under the band, which is what lets it read as alive rather than as something to watch. An ambient surface that has to be watched is a defect whatever it draws, and this number is the test rather than a preference.

Two rules follow from that. Every time-driven term on one surface scales from a single clock, since rates set independently drift apart and the fastest one becomes what a reader tracks. And a reveal is immediate while its release is slow, so a pointer crossing a grid trails rather than snapping off at every gap.

## Iconography

Lucide outline icons at 1.5px stroke. No custom icons. Interactive color reserved for the rare interactive icon, since an icon a visitor operates takes the operable role rather than the emphasis one.
