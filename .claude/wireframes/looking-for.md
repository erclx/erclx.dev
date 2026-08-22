---
title: Looking-for
description: Sits below the projects section as the page's closing call to action. Flat criteria list surfacing recruit-funnel specifics
---

# Looking-for

Appears below the projects section as the page's closing call to action. Sits flat on the page canvas under a hairline rule, carrying no panel and no tint, so it reads as an editorial block in the flow the experience timeline already uses rather than as a framed widget.

The section pairs a display heading with the availability status and five short criteria rows, one question each. Team shape and location were one merged row until 2026-08-17 and answered neither cleanly. The status moved here from the header on the same day, and it anchors the section rather than joining the rows: a sixth label would add a line to a surface that needs weight instead.

## Desktop (≥768px)

```plaintext
   Looking for                                              ← display serif heading, matching Projects

   ● Open to work                                           ← status anchor, body size, foreground

                                                   ( ᴥ )    ← character perched on the rule
   ─────────────────────────────────────────────────────    ← hairline rule at the text measure

   What I want to build   AI tooling · LLM apps · devex
   Team                   small to mid · close to the product
   Where                  Sweden, Gothenburg preferred · remote
   Experience             two years in
   Terms                  full-time or contract
```

## Behavior

- The section sits flat on the page canvas. A hairline rule between the heading and the rows is the only separator, drawn at the same measure as the text under it.
- A tinted panel is what this replaces, and the reason is worth keeping. Every other panel on the page is a project card, and a card earns its surface by holding a still. A panel around four short rows read as a widget among editorial blocks, which is what made the section the one thing on the page that did not belong.
- Experience answers the same brief, a short list of factual fragments, and it sits flat under a heading of the same weight. Matching that arrangement is what ties this section to the page, so the two bracket the projects grid as a pair.
- Row labels and values both take the body face in sentence case at label size, and both sit on the muted token. Weight separates the key from the answer, the label a step lighter than the value, with the 13rem column between them doing most of the work. Color separated them until 2026-08-20, first with the value at full foreground and then with the label stepped back, and neither survived measurement: the value at foreground measured 3.35x the contrast of every paragraph on the page, and the stepped-back label measured 2.53:1 against a 4.5:1 floor. The muted token is already 4.82:1 in light, so there is no room to lighten beneath it and lightness cannot be the third step.
- The labels carried mono in uppercase until 2026-08-17, when mono contracted to literal machine values and uppercase to the eyebrow and diagram chrome.
- The status dot takes the size and the ring the experience section's active marker carries, so the two read as one shape language. Its color stays its own: green states availability where the accent states position. The dot centres on a box one cap height tall resting on the label's baseline.
- The heading names the section and the availability status sits directly under it, anchoring the surface. No build-date stamp and no sixth row, because the status carries the live signal and the rows carry the specificity.
- The heading takes the display serif at the weight the projects heading carries, reversing the label-size mono kicker on 2026-08-17. That earlier call was measured and it was right about this section on its own: a serif heading does read large over four short rows. What outweighed it is the page rather than the section. Three of the four sections were findable at a glance and this one was not, and a reader scanning for what a stranger is looking for should not have to find a label the size of a row label. Experience moved the same way and for the same reason.
- Five criteria rows render as a definition list with short fragment values (3-6 words each), not prose sentences.
- A gap separates the rows and no rule runs between them. A rule per row made this the last surface on the page reading as a table, on a page whose hero seam, bar, cards, and footer had all stopped drawing lines. The pairing still scans without them, which is the only job the list has.
- Each row keeps its vertical padding after the rules came off. The left border lighting on hover is an affordance rather than a division, and it needs a row tall enough to draw against.
- The rule above the rows stays and is not an exception left behind. The character peeks over that edge, which makes it the ledge a drawing sits on rather than table chrome, and removing it leaves the character with nothing to hide behind.
- The answer carries the hover rather than the label. It sits at reading weight at rest and lifts to the foreground under a pointer, which puts the response on the half a reader came to read.
- The values were set in mono first, to match the timeline rows exactly, and the face came back off. A monospace glyph holds a fixed advance, so at body size every character occupied 10px and the same string ran a fifth wider than it does now, which read as sparse and as larger than the size it was. The timeline has since left mono as well, so the shared arrangement carries the match on both surfaces and neither leans on the face.
- Setting the values in the display serif put a third face in one small block and read as a change of face rather than a change of level. Detail belongs on the resume PDF, not the closing block of the landing page.
- The label column and its value sit close enough to read as one row. A wide channel between them makes the eye travel, which reads as two lists rather than four pairs.

## Cascade reveal

On scroll-in the heading and the four rows reveal in a top-to-bottom cascade. Mechanism: `.claude/context/motion.md`.

## Row hover state

Each criteria row lights the site's glow behind it and warms a 2px accent edge at its left, paired with its answer lifting from the reading weight to the foreground. The rows are read rather than operated, so the edge marks emphasis rather than an affordance, which is why it takes the warm accent and not the color a link or a focus ring carries. Only the criteria rows respond to hover. The heading stays non-interactive.

The edge is drawn as its own layer rather than as the row's left border. A negative z-index child paints above its parent's border, so the glow reached the border box and laid its fill over the accent: the edge should paint near rgb(165,70,28) and measured rgb(219,181,164) once the glow arrived, appearing at full strength on the first frame and washing out as the glow faded in.

## Peek character

A small filled-silhouette character perches at the right end of the hairline rule. It stays hidden below the rule until the section enters the viewport, then springs up to a peeked position with paws gripping the rule.

The character needs an edge to rise out of rather than a panel to hide behind, which is what lets the section carry no panel and keep the peek. It sits in a window of its own whose lower edge rests on the rule, so the window clips whatever hangs below it.

Painting the rows block in the page's own background is what did that job until 2026-08-21, and it made this the one section on the site that hid the ground behind it while every other section let the field through. A reader on a tablet described the section as solid against transparent siblings, and the fill was the whole cause. Clip the character rather than plating what sits over it.

The character rises past the heading's own line and shares a band with it rather than being given clearance below it. The two never meet because the heading sits at the left edge and the character at the right, at every width down to the narrowest. Buying that clearance vertically instead pushed the heading roughly five times further from its rows than the experience heading sits from its own, which read as a floating label.

When the cursor enters the rows the character ducks back below the rule. When the cursor leaves, it pops back up. Under reduced motion the character stays peeked with no transitions.

The character SVG carries its own fixed palette of a warm tan body, a cream face mask, and dark brown features. That palette stays consistent across light and dark themes rather than tracking the page tokens, so the character keeps one identity. Its body extends below its head so the lower portion clips against its window's lower edge.

Its resting and peeked positions are stated against that window rather than against the section, so fully down is fully clipped and the peeked position shows the top of it. A reader of those two values needs to know which box they are measured from, since the same character reads at a different height under either reading.

## Status pulse

The availability dot holds steady and a halo pings outward from it on a slow loop, so the status reads as live rather than as a printed label. It is the only always-on motion on the page. Under reduced motion the halo does not exist and the static ring remains. Mechanism: `.claude/context/motion.md`.
