---
name: stack-ship
description: Cuts a run's commits into a chain of pull requests, each targeting the one below it, then rebases the chain from the bottom as each branch merges. Use on the ship signal when a run holds several slices, or when asked to "open the stack", "cut the branches", "stack these pull requests", or "rebase the stack after that merge". Do NOT use to review a stack, which is `stack-review`, and do NOT use to answer findings across one, which is `stack-address`.
allowed-tools: Bash, Read, Grep, Glob, Skill
---

# Stack ship

A run that opens one pull request for many slices has failed whatever the diff looks like. Two runs ended at 25 and 30 commits in one review, which is what every rule here exists to prevent.

Read `.claude/context/stacked-shipping.md` before the first cut. It carries how git behaves under a stack, which this skill acts on and does not restate.

## Guards

- If no batch table or equivalent slice plan exists, stop: `❌ No declared slices. The pull request boundary is a planning decision, not a ship step.`
- If the operator has not given the ship signal, stop: `❌ No ship signal. Root CLAUDE.md § Shipping owns when a push is allowed.`
- If a slice's commits are not contiguous on the branch, stop: `❌ Slice <n> commits are interleaved and cannot be lifted onto their own branch. Ship the run as one pull request and record what welded it.`

## Phase 1: test the cut

Run both tests against every slice before cutting anything. Both have to pass.

1. The slice is one surface or one coherent change, which is the test the planning skill already applied.
2. The slice is observable on its own, at its own commit and after the one above it lands.

The second is the one nothing else states. One slice renumbered fade delays across five pages while every element on those pages still carried a value resolving to full opacity at parse, so nothing transitioned and the renumbered values were never read. The branch above then overwrote the same property from its observer. The change had no effect at its own commit and no effect after the one above it landed, which is the test failing in both directions.

### Rules

- State how the slice is observed, not that it is. A slice whose effect nobody can name is one the reviewer cannot check and the operator cannot judge.
- Fold a slice failing the second test into the branch whose behavior it changes, rather than giving it a review of its own.
- Do not set a depth or size ceiling. The observability test already bounds a stack, since a chain whose pieces are individually observable is one whose depth follows from the work.

## Phase 2: cut the chain

1. Cut one branch per slice in the order the slices were committed, each branched off the one before it. The bottom branches off the trunk.
2. Run `git-stage` inside a branch holding more than one concern, so its own commits are focused.
3. Open a pull request per branch with `git-pr`, bottom first, each targeting the branch below it.
4. Name the chain in every body: which branch this one sits on, and what it depends on. A reviewer arriving on a middle branch has no other way to learn it is in a stack.
5. Hand the whole chain over at once. Do not hand branches over as they open.

### Rules

- Open every branch before asking for a review rather than opening the next when the last lands. The slices were built in order and already depend on each other in that order, so the whole chain is reviewable at once and holding it back buys nothing.
- Say how many pull requests the run will open before the first is written. A count that first appears at ship time was never a boundary.
- Read a green check on a stacked branch as covering the chain below it, since the branch already carries every commit under it. What it reports nothing about is whether the base is current, so it is never the clearance to merge. See `.claude/context/stacked-shipping.md` § The merge order is forced by the squash.

## Phase 3: rebase behind each merge

`stack-review` recommends the merge order and this executes behind it. Cite that skill rather than deriving an order here.

1. After a merge lands, take the branch directly above it and run `git rebase --onto main <old-base> <branch>`, where `<old-base>` is the tip the branch was cut from rather than the merged commit.
2. Force-push it, then move up one branch and repeat with the rebased head as the new target: `git rebase --onto <new-head-below> <old-base> <branch>`. Only the branch directly above the merge rebases onto the trunk. Passing `main` to any branch further up replays it straight onto the trunk and drops every branch between them out of the chain.
3. Repeat upward until every surviving branch is rebased.
4. Confirm each rebase landed by reading the merge base against the head of the branch below, and the file count on the pull request diff against what the branch is meant to touch.

### Rules

- Never read the mergeable flag as evidence the base is current. It reports clean on a stale branch whose content the trunk already holds, which is the state that merges the branch below a second time under the wrong title.
- Rebase every branch above the merge, not only the one that was retargeted. A squash is an ancestor of nothing stacked on the pre-merge tip, so the staleness runs the full height of the chain.
- Report each push as a pure rebase or as one carrying edits, so the reviewer can check the claim with `git diff` rather than re-reading the branch.
- Do not merge a branch until this phase has rebased it and read the result. A clean state on a stale base is silent.

## What this delegates

Cite these rather than restating them. A step reimplemented here rots against the skill that owns it.

- `.claude/context/stacked-shipping.md` carries the git behavior under a stack and the four-role model
- `stack-review` reads the chain and states the merge order
- `stack-address` answers findings across the chain and pushes every branch together
- `visual-batch` plans the slices and runs the eyeball loop when the work is visual
- `git-stage` and `git-pr` carry the commits and the pull requests
- Root `CLAUDE.md` § Shipping owns when a commit and a push are allowed

## Provenance

These rules were written from a run that had already lost its split, and shipped inside it, so the branch carrying them was the case they describe. The operator refused a retro split there: a sweep and an out-of-order fix had welded the slices, two reviews had passed the branch clean, and seven new heads would have thrown that away to reshape work nobody disputed. Read that as the cost of finding it late rather than as the rules being optional.

Most of what is here is not specific to this repository, so the generic half is a candidate for the upstream orchestrator and handback skills once a second stack has used it. Writing it here first keeps each rule beside the measurement that produced it. That promotion is an open question rather than a filed task.
