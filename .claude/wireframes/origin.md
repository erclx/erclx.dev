---
title: Origin
description: Career git-log timeline that bridges the hero narrative into the projects section
---

# Origin

Appears between the header band and the projects section, replacing a prose paragraph in the same slot. Renders the career story as a single commit rail rather than as a list beside a diagram.

A display heading opens it, matching the projects and looking-for headings so a reader scanning for a section finds all three at the same weight. Under it a vertical rail runs down the gutter with one dot per beat sitting on it, and the newest beat carries a row of chips naming the artifacts it produced.

## Desktop (≥768px)

```plaintext
Origin
  ← display heading, same weight as Projects

 ●  2026 · shipping independently, open to the next thing
 │     Every project below started as something that was slowing me down.
 │     ( aitk ) ( Jobtriage ) ( Stackr ) ( Caret ) ( diction )
 │
 ○  2025 · upskilling, and working out what to build
 │     Going deeper on the tooling side before building anything worth showing.
 │
 ○  2024 to 2025 · eighteen months at volvo technology
 │     It started as a master's thesis, an agent that turned plain
 │     questions into ...
 │
 ○  2022 to 2024 · msc in complex adaptive systems, chalmers
 │     How simple agents and their environment produce behavior nobody designed.
 │
 ○  2019 to 2022 · bsc in engineering physics, chalmers
 ┊     Taught me to break a problem down before reaching for a tool, which
 ┊     is most of the job now.
       ← rail fades out below the oldest dot

    Each entry made the next one possible.
              — Fraunces italic, label size
```

## Behavior

- The section runs at the page measure, the same one the header and looking-for hold. Nothing sits outside that column: a figure hanging into the margin left the text centered while the section read as offset, which is why the earlier diagram beside the list is gone.
- The rail starts at the newest dot and fades to nothing under the oldest one, so the record reads as continuing behind the first entry rather than stopping at a dot.
- Each row is a dot in the gutter beside a block carrying a log line of span and head separated by a middle dot, then a supporting sentence under it. The supporting sentence takes the body face so a reader tells the log line from the prose under it, which is the one place this surface departs from mono throughout. The dot aligns to the log line rather than to the block.
- Every dot sits exactly on its own row, which a fixed figure could never do once rows started running to different heights.
- One row is highlighted at a time as the "current state" anchor. The first row is highlighted by default. Hovering another row transfers the highlight to it. On leaving the list the highlight walks back row by row to the first row.
- The highlighted dot fills with the warm accent and carries a soft ring, so one warm point marks where the reader is on a timeline that is otherwise muted. The rail marker in `section-nav.md` states position the same way and takes the same color.
- The closing kicker line sits below the timeline in Fraunces italic, muted, bridging the timeline into a single narrative thought without competing with the rows.

## Artifact chips

The newest beat carries one chip per card in the projects section, in the order those cards render, because the copy under that beat says every project below came out of it and the chips are what make the claim reachable.

Each chip links to its own card rather than to the section, so a reader lands on the artifact they picked. They are ordinary links with visible labels, which keyboard users reach in sequence. The earlier version hid the same targets inside a decorative graphic where only a pointer could use them. A chip clears the phone tap minimum rather than sizing to its label, which the tap-target spec holds every link on this page to.

A card added below earns a chip here, and a test compares the two lists so the pair cannot drift.

## Cascade reveal

On scroll-in the heading, then the rows, reveal in a top-to-bottom cascade. Mechanism: `.claude/context/motion.md`.
