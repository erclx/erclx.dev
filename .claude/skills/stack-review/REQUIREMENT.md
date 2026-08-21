---
name: stack-review
description: Why a chain of pull requests cannot be reviewed one at a time, and where its boundary against the single-branch review and the handback falls
---

# Stack review requirement

## Gap

Without this skill, a session reviewing a chain of pull requests:

- Reviews and posts on the bottom branch while the ones above are still unread. The bottom is then fixed inside the hour, which leaves the branch above based on a commit that no longer exists at the head of its own base and produces a merge conflict nobody caused.
- Misses the defect no single branch carries. Two branches were each correct read alone and wrong as a pair, and the pair was found only because all of them were held at once.
- Attempts a rebase to discover whether the bases are current, rather than reading it. `git merge-tree --write-tree` reports it in one command with no working tree touched and nothing to undo.
- Trusts the mergeable flag. Measured on a branch reporting `MERGEABLE` and `CLEAN` while its merge base sat two merges back, whose diff carried eleven files instead of two.
- Re-reads a whole branch after a rebase, because a rebase rewrites every commit above the merge and leaves no way to tell a pure one from one carrying edits. `git diff <reviewed-oid> <new-head>` settles it and reports empty on a pure rebase. A full re-read was paid twice on one run before this was written down.
- Posts nothing on a branch a pass found nothing on, so the operator reads a thread nobody answered and does not merge it.
- Leaves a close-out standing on a commit the branch no longer carries after a rebase, so the thread reads as a review predating the head whatever the trees say. Written as a rule once and broken an hour later on the same chain, with the verification sitting in the session channel while the thread showed a close-out on a dead commit.
- Resolves the dispatch target from a session listing. Work running in linked worktrees surfaced as neither, so the listing reported four branches as held by nobody while one session held every one.
- Recommends a merge order derived from the diff rather than from the check trigger, which gates the bottom branch alone.

## Must

- Resolve the chain and trial-merge every base against the head below it before reading any branch.
- Read every branch against the head of the one below it, bottom to top, and hold every finding until the last is read.
- Read the chain a second time as a whole, for the defect no single branch carries.
- Post a close-out on every branch every time, including a branch carrying no finding and a branch that only rebased.
- Name the comparison that cleared a rebased branch, rather than asserting it is clear.
- Post one handback covering the whole stack, naming the branch each finding sits on.
- State the merge order and what each merge unlocks, as the consequence of the check trigger rather than as a standing truth.
- Correct the pull request body as well as the thread when a finding invalidates what the body claims.

## Must not

- Post a finding on any branch before the whole chain has been read.
- Read the mergeable flag as evidence a base is current.
- Take the worker's claim that a push was a pure rebase without checking it.
- Let a finding, a fix, or a withdrawal reach only the session channel. That surface dies with the session and the operator merges off the thread.

## Guards

The refusal strings sit in the body, since the runtime loads that file and ignores this one. Two conditions stop a run: a chain whose branches and bases cannot be resolved, and a dispatch that does not declare the whole chain open and pushed.

## Out of scope

- `claude-pr-review` owns what a review looks for inside one branch. This owns what a chain needs on top of that, and invokes the per-branch reading rather than restating it.
- `stack-ship` cuts the chain and rebases behind each merge. This reads the chain and recommends the order that rebasing follows.
- `stack-address` fixes what this finds. This never edits a branch.
- `.claude/context/stacked-shipping.md` carries how git behaves under a stack. This carries what a reviewer does about it.

## Collision

Nothing else in the corpus states a merge order, and this is where it is stated. `stack-ship` and `stack-address` both act on the order and both cite this file, because a rule appearing in three skills by necessity has to be owned by one of them or all three drift.
