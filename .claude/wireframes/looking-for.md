---
title: Looking-for
description: Sits below the projects section as the page's closing call to action. Flat criteria list surfacing recruit-funnel specifics
---

# Looking-for

Appears below the projects section as the page's closing call to action. Sits flat on the page canvas under a hairline rule, carrying no panel and no tint, so it reads as an editorial block in the flow the origin timeline already uses rather than as a framed widget.

The section pairs a display heading with five short criteria rows, one question each. Team shape and location were one merged row until 2026-08-17 and answered neither cleanly. Availability lives in the hero's `OPEN TO WORK` pill, so the section does not restate it. What it adds instead is specificity: which roles, which team profile, which level, which terms.

## Desktop (≥768px)

```plaintext
   Looking for                                              ← display serif heading, matching Projects

                                                   ( ᴥ )    ← character perched on the rule
   ─────────────────────────────────────────────────────    ← hairline rule at the text measure

   what I want to build   AI tooling · LLM apps · devex
   team                   small to mid · close to the product
   where                  Sweden, Gothenburg preferred · remote
   experience             two years in
   terms                  full-time or contract
```

## Behavior

- The section sits flat on the page canvas. A hairline rule between the heading and the rows is the only separator, drawn at the same measure as the text under it.
- A tinted panel is what this replaces, and the reason is worth keeping. Every other panel on the page is a project card, and a card earns its surface by holding a still. A panel around four short rows read as a widget among editorial blocks, which is what made the section the one thing on the page that did not belong.
- Origin answers the same brief, a short list of factual fragments, and it sits flat under a heading of the same weight. Matching that arrangement is what ties this section to the page, so the two bracket the projects grid as a pair.
- Mono carries the four row labels, at label size. The four values take the body face at body size, which is what a project card description carries.
- The heading names the section and nothing else. No availability statement, no status dot, no build-date stamp. The hero already carries the live status via its `OPEN TO WORK` pill, and the section earns its space by adding specificity rather than restating that signal.
- The heading takes the display serif at the weight the projects heading carries, reversing the label-size mono kicker on 2026-08-17. That earlier call was measured and it was right about this section on its own: a serif heading does read large over four short rows. What outweighed it is the page rather than the section. Three of the four sections were findable at a glance and this one was not, and a reader scanning for what a stranger is looking for should not have to find a label the size of a row label. Origin moved the same way and for the same reason.
- Five criteria rows render as a definition list with short fragment values (3-6 words each), not prose sentences. Values take the body face against the mono label beside them, which is the same size the project card descriptions carry.
- Values also take the muted color, which is the page's rule for the body face rather than a choice this section makes. Measured across the page on 2026-08-17: every sans element at body size is muted, and full-contrast text is mono. These values were the one sans element at full contrast, which made the section read as a different typographic system from a reader's scroll even though the family matched. The value brightens to full contrast on row hover, so the emphasis survives without breaking the rule at rest.
- The values were set in mono first, to match the origin rows exactly, and the face came back off. A monospace glyph holds a fixed advance, so at body size every character occupied 10px and the same string ran a fifth wider than it does now, which read as sparse and as larger than the size it was. Origin keeps mono because its entries are log lines, and these are written phrases, so the shared arrangement carries the match instead of the face.
- Setting the values in the display serif put a third face in one small block and read as a change of face rather than a change of level. Detail belongs on the resume PDF, not the closing block of the landing page.
- The label column and its value sit close enough to read as one row. A wide channel between them makes the eye travel, which reads as two lists rather than four pairs.

## Cascade reveal

On scroll-in the heading and the four rows reveal in a top-to-bottom cascade. Mechanism: `.claude/context/motion.md`.

## Row hover state

Each criteria row carries a left border that warms to the accent on hover, paired with its mono label shifting from muted to foreground. The rows are read rather than operated, so the border marks emphasis rather than an affordance, which is why it takes the warm accent and not the color a link or a focus ring carries. Only the criteria rows respond to hover. The heading stays non-interactive.

## Peek character

A small filled-silhouette character perches at the right end of the hairline rule. It stays hidden below the rule until the section enters the viewport, then springs up to a peeked position with paws gripping the rule.

The character needs an opaque edge to rise out of rather than a panel to hide behind, which is what lets the section carry no panel and keep the peek. The rows block is painted in the page's own background, so it hides the character's body below the rule while showing nothing itself.

The character rises past the heading's own line and shares a band with it rather than being given clearance below it. The two never meet because the heading sits at the left edge and the character at the right, at every width down to the narrowest. Buying that clearance vertically instead pushed the heading roughly five times further from its rows than the origin heading sits from its own, which read as a floating label.

When the cursor enters the rows the character ducks back below the rule. When the cursor leaves, it pops back up. Under reduced motion the character stays peeked with no transitions.

The character SVG carries its own fixed palette of a warm tan body, a cream face mask, and dark brown features. That palette stays consistent across light and dark themes rather than tracking the page tokens, so the character keeps one identity. Its body extends below its head so the lower portion clips naturally behind the card edge.
