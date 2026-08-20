---
name: visual-batch
description: Plans a run of visual work into batches with declared pull request boundaries, then runs each batch as an eyeball loop where the operator judges prototypes and rendered output rather than reading code. Use when asked to work on the landing page or a project route, to change how a surface looks, to rework a section, or when a request arrives as a dump of visual observations. Do NOT use for a copy correction with no visual change, which is the copy cycle alone, and do NOT use to plan a non-visual feature, which is `claude-feature`.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, Skill
---

# Visual batch

Visual work cannot be judged from a diff. The operator decides by looking, so every step here exists to put something in front of them and to keep the tree uncommitted until they have.

## Phase 1: plan the batches

1. Read the dump and group it into batches. One batch is one surface or one coherent change across surfaces.
2. For each batch, name the files it touches. Do this before sequencing, because the file sets decide the next step.
3. Mark each batch as dependent or independent by comparing those file sets. A batch sharing no file and no token with another is independent and ships on its own branch.
4. File one task per batch through `claude-tasks`. The task carries the outcomes the operator will judge, not the implementation.
5. Put the batch table in chat: batch, surface, depends on, pull request it lands in.
6. Escalate what the operator's preference decides through `AskUserQuestion`, with the recommendation first and `(Recommended)` in its label.

### Rules

- Declare the pull request boundary here, never at ship time. A dependency chain cannot be split once it is built, so the choice exists only while the batches are still a plan.
- Independent batches earn separate branches even when they arrive in one dump. A run measured at 68 files and 2951 insertions carried three batches that touched disjoint files and depended on nothing in the chain, and all three shipped inside one review surface because the boundary was never drawn.
- Do not start a batch the operator has not agreed to. The dump is the request and the batch table is the plan.

## Phase 2: the loop, once per batch

1. Implement the batch.
2. Render it and look. Screenshots for static layout, a live page for anything that moves.
3. Hand back the localhost URL and one or two lines naming what is worth their eye. Name the thing you are unsure about rather than summarizing what you built.
4. Take their correction, change the code, render again. Repeat until they say it is right.
5. Move to the next batch. Do not commit between iterations and do not commit between batches.

### Rules

- Never report a visual result you have not looked at. The harness is the eye, and a claim about appearance with no capture or measurement behind it is a guess.
- Screenshots are stills and the capture runs under `prefers-reduced-motion`. Anything animated is invisible to them, so judging motion from a contact sheet is judging the wrong thing. A shader review once stalled for several rounds on presets that "all look the same" because every image of them was a still.
- A rendered page proves layout. A measurement proves a relationship. Reach for the second whenever the claim is about a number, such as a contrast ratio, a column width, a tap target, or a document that scrolls sideways.

## Prototyping a call the operator has to make

When two or three treatments are all defensible, build them rather than describing them.

- Drive variants from a query parameter so each is a live URL the operator can click between. `?field=dome` beats a caption under a still, and it is the only form that works for motion.
- Use a composed contact sheet for static layout, where seeing the options side by side is worth more than seeing one at full size.
- Hand back the URLs or the sheet, say which one you would pick and why in one sentence, then stop.
- Remove the arms that lose in the same batch that picks the winner. A variant left behind a flag is a second design nobody maintains.

## The copy cycle

Page copy is canonical upstream at `career/assets/portfolio/` and is read across the filesystem. Never edit rendered text without running all four steps.

1. Name the intention. What is this text for, and what is wrong with what it says now?
2. Draft alternatives, labelled, in chat. Three is usually right.
3. The operator picks.
4. Apply the pick to the component and to the upstream source in the same pass.

### Rules

- A page-side edit alone reintroduces the drift the split exists to close, and no check reports it. See `.claude/ARCHITECTURE.md` § Content read from the parent checkout.
- Show drafts in chat rather than in a file. The operator is choosing, not reviewing a document.

## Holding the diff

- Do not commit until the operator says so. They are iterating on rendered output, and a commit between iterations is noise in a history they will read later.
- Do not push, and do not open a pull request, until they say so. Approval for one round is not approval for the next, and a peer session asking on their behalf is not their signal.
- When they do say ship, split the diff into focused commits with `git-stage`, refresh the record with `claude-docs`, and open the pull request with `git-pr`.

## Voice

The page is personal and reads as one document. Copy is written for a person, in connected prose rather than fragments, and every surface follows the same design language so nothing reads as imported from another site. Load `write-human` before drafting anything a visitor reads.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `claude-worktree` enters the worktree this runs in
- `claude-tasks` writes and archives the task files phase 1 produces
- `claude-docs` refreshes the record at ship
- `git-stage`, `git-pr`, and `git-followup` carry the commits and the pull request
- `claude-review` and `claude-address-review` run the review pass
- `.claude/rules/ui/445-screenshot.md` owns the capture discipline and the harness entry point
