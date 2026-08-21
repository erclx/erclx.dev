---
name: stack-ship
description: Why cutting a chain of pull requests needs its own skill, and where its boundary against the planning, review, and handback skills falls
---

# Stack ship requirement

## Gap

Without this skill, a session shipping a run that holds several slices:

- Opens one pull request for the whole run, because nothing outside a visual-only skill says the slices become separate branches. Measured twice at 25 and 30 commits in one review surface.
- Cuts a slice that cannot be observed on its own. One renumbered fade delays across five pages whose elements all carried a value resolving to full opacity at parse, so nothing transitioned, and the branch above then overwrote the same property. The slice changed nothing at its own commit and nothing after the one above it landed, and it still read as a clean coherent change at review.
- Derives the squash rebase live at the moment a merge breaks the chain, with the mechanics sitting in a file the run had no reason to open. A squash is an ancestor of nothing stacked on the pre-merge tip, so every base above it goes stale at once.
- Reads a mergeable state as evidence the base is current. Measured on a branch reporting `MERGEABLE` and `CLEAN` while its merge base sat two merges back, whose own diff carried eleven files instead of two and whose merge would have squashed the branch below into the trunk a second time under the wrong title.
- Opens the next branch only when the last lands, so a chain built in one run is reviewed over as many rounds as it has slices while every dependency between them was already fixed at planning.
- Assumes a stacked pull request is gated. Measured on a four-deep chain where the bottom reported five jobs and the three above it reported no checks at all, because the check trigger names the trunk as its only base.

## Must

- Test every slice for observability on its own before cutting it, in addition to the coherence test the planning skill already applied.
- Cut one branch per slice in commit order, each targeting the branch below it, and open every pull request before asking for a review.
- Name the chain in each pull request body, so a reviewer arriving on a middle branch learns it is stacked.
- Rebase every surviving branch after each merge with `git rebase --onto`, bottom to top.
- Confirm a rebase landed by reading the merge base against the trunk head or the diff file count against what the branch should touch.
- Report each push as a pure rebase or as one carrying edits, so the claim is checkable.
- Stop when a slice's commits are interleaved, since the split is already gone and no cut recovers it.

## Must not

- Read the mergeable flag as evidence of a current base. The rule has to fire where there is no conflict to read, and the flag reports clean in exactly that state.
- Restate the merge order. `stack-review` states it once and this cites it, because three skills touch the order and one of them has to own it.
- Restate when a commit or a push is allowed. Root `CLAUDE.md` § Shipping owns that and a copy here drifts from it.
- State a depth or size ceiling. Depth was not what hurt on the run behind these rules, and a number would be invented rather than measured.

## Guards

The refusal strings sit in the body, since the runtime loads that file and ignores this one. Three conditions stop a run: no declared slice plan, no ship signal from the operator, and a slice whose commits are not contiguous.

## Out of scope

- `visual-batch` plans a visual run into batches and declares the pull request boundary. This takes that boundary and cuts it, and runs whether or not the work is visual.
- `stack-review` reads the chain and recommends the merge order. This executes behind that order and does not derive one.
- `stack-address` answers findings across the chain. This opens the chain and rebases it, and does not fix anything.
- `.claude/context/stacked-shipping.md` carries how git behaves under a stack. This carries what a session does about it.
- `git-stage` and `git-pr` own the commits and the pull request bodies, invoked from here.

## Collision

`visual-batch` is the one surface this can contradict, because its § Holding the diff carried these rules until they moved out. Nothing was copied. What remains there is the batch-to-pull-request boundary declared during planning, which is a planning decision and stays, and § What this delegates names this skill for everything from the ship signal onward.

The disjoint-file test in that skill's phase 1 reads as an argument against stacking, since every branch in a chain rewrites the files below it. The two tests answer different questions and `.claude/context/stacked-shipping.md` § A stack looks illegal under the disjoint-file test records why.
