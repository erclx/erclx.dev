---
title: About me
description: Personal surface directly under the header, carrying where the person is from and one thing that is not work
---

# About me

Sits directly under the header and above the experience timeline, so a reader meets the person before the claim, the path, the evidence, and the ask. Added on 2026-08-17.

Three short paragraphs of prose and nothing else. No figure, no rows, no portrait. The header carries the one portrait on the page, and a second image here would make this surface compete with the one a reader met three seconds earlier.

## Desktop (≥768px)

```plaintext
About me
  ← display heading, same weight as Experience and Projects

I was born in Vietnam and came to Sweden in 2006, when I was six. First
Borås, then south to Värnamo, which is where I grew up before Gothenburg.

Outside work I listen to a lot of music, enough that one year it added up
to over 4,000 hours, and I have played guitar since I was twelve.
Otherwise I try to get some calisthenics in, or play tennis and badminton
when the weather allows.

Most summers I travel, lately London, Copenhagen, Prague, and Hanoi.
  ← three body paragraphs, muted, at the page measure
```

## Behavior

- The section runs at the page measure that every landing section holds, and nothing on it breaks out. It is the only surface on the page carrying prose alone, which is what the position asks for: a reader arriving from a full-height header wants a sentence rather than another visual event.
- The heading reads `About me` rather than `About`, and the rail label matches it word for word. A rail label states the heading it points at rather than the anchor id behind it.
- The two halves stay separate paragraphs with no connective claim between them. Drafts that bridged the origin to the hobbies with an authored characterization read as shoehorned, and drafts stating each fact on its own read as choppy. The shipped shape takes neither.

## Copy provenance

This surface is the one place on the page a session may not write. Every sentence is the operator's own, given in answer to direct questions rather than compressed from the record, and no canonical asset holds any of it. A session that drafts here reproduces the provenance failure that removed an earlier personal line from the timeline closer.

Wording was tightened on 2026-08-18 against drafts he chose between rather than ones he wrote, which the copy source records separately as the weaker provenance it is. No fact changed and none was added.

## Cascade reveal

On scroll-in the heading, then the paragraphs, reveal in a top-to-bottom cascade. Mechanism: `.claude/context/motion.md`.
