---
title: Looking-for
description: Sits below the projects section as the page's closing call to action. Flat criteria list surfacing recruit-funnel specifics
---

# Looking-for

Appears below the projects section as the page's closing call to action. Sits flat on the page canvas under a drawn contour, carrying no panel and no tint, so it reads as an editorial block in the flow the experience timeline already uses rather than as a framed widget.

The section pairs a display heading with the availability status and four short criteria rows, one question each. Team shape and location were one merged row until 2026-08-17 and answered neither cleanly. The status moved here from the header on the same day, and it anchors the section rather than joining the rows: a sixth label would add a line to a surface that needs weight instead.

## Regions

- Heading: the display serif heading at the top left, at the weight the projects heading carries
- Status anchor: the availability status directly under the heading, a dot and its label
- Contour: a drawn contour between the heading and the rows, the only separator, at the same measure as the text under it
- Peek character: a small filled-silhouette character perched near the right end of the contour, spanning 78 to 93% of its length from 1024 up and 72 to 100% of it at 390. It rises past the heading's own line and shares a band with it rather than being given clearance below it. The two never meet because the heading sits at the left edge and the character at the right, at every width down to the narrowest
- Criteria rows: four rows under the contour, a label column and its value beside it
- At 768 and wider: the layout drawn below

```plaintext
   Looking for                                              ← display serif heading, matching Projects

   ● Open to work                                           ← status anchor, body size, foreground

                                                   ( ᴥ )    ← character perched on the contour
   ‿‿⁀‿‿‿⁀‿‿‿‿‿⁀‿‿‿⁀‿‿‿‿‿⁀‿‿‿⁀‿‿‿‿‿⁀‿‿‿⁀‿‿‿‿⁀‿‿‿‿‿    ← drawn contour at the text measure

   What I want to build   AI agents and LLM applications, developer tools, full-stack products
   Team                   small to mid, close to the product, with engineers to learn from
   Where                  Sweden, Gothenburg preferred, remote
   Terms                  full-time or contract
```

## States

| State            | Reached when                                 | Shows                                                                                                       | Evidence       |
| ---------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------- |
| `offscreen`      | The section has not yet entered the viewport | The character hidden below the contour                                                                      | `not captured` |
| `peeked`         | The section enters the viewport              | The character sprung up with paws gripping the contour, the status halo pinging outward on its loop         | `not captured` |
| `row-hovered`    | A pointer rests on a criteria row            | The row's glow and warm left edge, its answer lifted to the foreground, the character ducked below the line | `not captured` |
| `reduced-motion` | The reader asks for reduced motion           | The character peeked with no transitions, and the dot's static ring with no halo                            | `not captured` |

### Row hovered

Each criteria row lights the site's glow behind it and warms a 2px accent edge at its left, paired with its answer lifting from the reading weight to the foreground. The rows are read rather than operated, so the edge marks emphasis rather than an affordance, which is why it takes the warm accent and not the color a link or a focus ring carries. Only the criteria rows respond to hover. The heading stays non-interactive.

The edge is drawn as its own layer rather than as the row's left border. A negative z-index child paints above its parent's border, so the glow reached the border box and laid its fill over the accent: the edge should paint near rgb(165,70,28) and measured rgb(219,181,164) once the glow arrived, appearing at full strength on the first frame and washing out as the glow faded in.

## Copy

- Heading: `Looking for`
- Status: `Open to work`
- Criteria rows, label then value:
  - `What I want to build`: `AI agents and LLM applications, developer tools, full-stack products`
  - `Team`: `small to mid, close to the product, with engineers to learn from`
  - `Where`: `Sweden, Gothenburg preferred, remote`
  - `Terms`: `full-time or contract`

## Behavior

- The section sits flat on the page canvas. The contour takes the hero field's own contour ink and weight rather than the border token, and it curves rather than running straight, so the closing surface reads as terrain the character stands on. `canon/context/agent-cast.md` carries the measured reasoning and the amplitude ramp.
- Experience answers the same brief, a short list of factual fragments, and it sits flat under a heading of the same weight. Matching that arrangement is what ties this section to the page, so the two bracket the projects grid as a pair.
- Row labels and values both take the body face in sentence case at label size, and both sit on the muted token. Weight separates the key from the answer, the label a step lighter than the value, with the 13rem column between them doing most of the work. Color separated them until 2026-08-20, first with the value at full foreground and then with the label stepped back, and neither survived measurement: the value at foreground measured 3.35x the contrast of every paragraph on the page, and the stepped-back label measured 2.53:1 against a 4.5:1 floor. The muted token is already 4.82:1 in light, so there is no room to lighten beneath it and lightness cannot be the third step.
- The status dot takes the size and the ring the experience section's active marker carries, so the two read as one shape language. Its color stays its own: green states availability where the accent states position. The dot centres on a box one cap height tall resting on the label's baseline.
- The heading names the section and the availability status sits directly under it, anchoring the surface. The status carries the live signal and the rows carry the specificity.
- The heading takes the display serif at the weight the projects heading carries, reversing the label-size mono kicker on 2026-08-17. That earlier call was measured and it was right about this section on its own: a serif heading does read large over four short rows. What outweighed it is the page rather than the section. Three of the four sections were findable at a glance and this one was not, and a reader scanning for what a stranger is looking for should not have to find a label the size of a row label. Experience moved the same way and for the same reason.
- Four criteria rows render as a definition list with short fragment values (3-6 words each), not prose sentences.
- A gap separates the rows. The pairing scans without rules, which is the only job the list has.
- Each row keeps its vertical padding after the rules came off. The left border lighting on hover is an affordance rather than a division, and it needs a row tall enough to draw against.
- The contour above the rows stays and is not an exception left behind. The character peeks over that edge, which makes it the ledge a drawing sits on rather than table chrome, and removing it leaves the character with nothing to hide behind.
- The answer carries the hover rather than the label. It sits at reading weight at rest and lifts to the foreground under a pointer, which puts the response on the half a reader came to read.
- The label column and its value sit close enough to read as one row. A wide channel between them makes the eye travel, which reads as two lists rather than four pairs.
- On scroll-in the heading and the criteria rows reveal in a top-to-bottom cascade, which holds at any scroll speed rather than depending on which of them crossed the viewport edge together. Mechanism: `canon/context/motion.md`.
- The character stays hidden below the line until the section enters the viewport, then springs up to a peeked position with paws gripping it. When the cursor enters the rows the character ducks back below the line. When the cursor leaves, it pops back up. Under reduced motion the character stays peeked with no transitions.
- The character needs an edge to rise out of rather than a panel to hide behind, which is what lets the section carry no panel and keep the peek. It sits in a window of its own, and that window is clipped by the contour itself rather than by its own rectangle, so the paws grip wherever the line happens to be.
- The line's amplitude is what keeps the grip readable, and 390 is the width that sets it. Read `canon/context/agent-cast.md` before changing either the curve or the window.
- Painting the rows block in the page's own background is what did the clipping job until 2026-08-21, and it made this the one section on the site that hid the ground behind it while every other section let the field through. A reader on a tablet described the section as solid against transparent siblings, and the fill was the whole cause. Clip the character rather than plating what sits over it.
- The character SVG carries its own fixed palette of a warm tan body, a cream face mask, and dark brown features. That palette stays consistent across light and dark themes rather than tracking the page tokens, so the character keeps one identity. Its body extends below its head so the lower portion clips against its window's lower edge.
- Its resting and peeked positions are stated against that window rather than against the section, so fully down is fully clipped and the peeked position shows the top of it. A reader of those two values needs to know which box they are measured from, since the same character reads at a different height under either reading.
- The availability dot holds steady and a halo pings outward from it on a slow loop, so the status reads as live rather than as a printed label. It is the only always-on motion on the page. Under reduced motion the halo does not exist and the static ring remains. Mechanism: `canon/context/motion.md`.

## Not on this surface

- No panel and no tint. A tinted panel is what the flat section replaces, and the reason is worth keeping. Every other panel on the page is a project card, and a card earns its surface by holding a still. A panel around four short rows read as a widget among editorial blocks, which is what made the section the one thing on the page that did not belong.
- No rule between the rows. A rule per row made this the last surface on the page reading as a table, on a page whose hero seam, bar, cards, and footer had all stopped drawing lines.
- No build-date stamp and no sixth row.
- No monospace. The labels carried mono in uppercase until 2026-08-17, when mono contracted to literal machine values and uppercase to the eyebrow and diagram chrome. A monospace glyph holds a fixed advance, so at body size every character occupies 10px and the same string runs a fifth wider than in a proportional face, which reads as sparse and larger than its actual size. Neither this block nor the timeline rows use mono, so the shared arrangement carries the match on both surfaces and neither leans on the face.
- No display serif on the values. Setting them in it put a third face in one small block and read as a change of face rather than a change of level.
- No detail beyond the fragments. Detail belongs on the resume PDF, not the closing block of the landing page.
- No clearance below the heading for the character. Buying that clearance vertically pushed the heading roughly five times further from its rows than the experience heading sits from its own, which read as a floating label.
