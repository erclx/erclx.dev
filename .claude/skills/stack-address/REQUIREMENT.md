---
name: stack-address
description: Why findings across a chain of pull requests are answered in one pass, and where its boundary against the single-branch handback and the ship skill falls
---

# Stack address requirement

## Gap

Without this skill, a session answering findings on a chain of pull requests:

- Fixes one branch and hands it back, which leaves every branch above it based on a commit that no longer exists at the head of its own base. Measured on a chain where the bottom was fixed inside the hour and the branch above produced a merge conflict nobody caused.
- Lands a repair on the top of the chain rather than on the branch that introduced the defect, which welds two slices together and removes the split with one commit.
- Pushes each branch as it is fixed, so the reviewer re-reads the chain as many times as it has branches while every fix was known at the moment the handback arrived.
- Says nothing about whether a push carried edits, so the reviewer cannot tell a pure rebase from real work and falls back to a full re-read of content already read. Paid twice on one run.
- Leaves a branch that only rebased with no comment, so its standing close-out names a dead commit and the thread reads as a review predating the head.
- Reports a fix through the session channel alone. Written as a rule once and broken an hour later on the same chain, with the verification in the channel while the thread showed a close-out on a dead commit followed by a rebase notice.
- Replies to a finding while the pull request body still claims the thing the finding invalidated, so the operator reads a branch that looks unresolved.
- Ships after the first of a masked pair. One defect masks another whenever the first suppresses the conditions the second needs, so repairing either exposes its pair and a run that re-verifies only the fix ships both.

## Must

- Group every finding by the branch it sits on before editing anything.
- Walk the chain bottom to top, fixing each branch and rebasing the one above onto its fixed head.
- Fix a finding on the branch that introduced it.
- Run the project's verify commands on each branch a fix changed, before moving up.
- Push every branch together, after the whole chain is fixed.
- Post a response on every branch the walk touched, including one that only rebased.
- State for each push whether it was a pure rebase or one carrying edits, so the claim is checkable.
- Correct the pull request body as well as the thread when a finding invalidates what the body claims.
- Report the batch back through the channel the dispatch arrived on.

## Must not

- Push a branch before the whole chain is fixed.
- Land a fix for an earlier branch on the top of the chain.
- Let a fix, a withdrawal, or a correction reach only the session channel. The operator merges off the thread.
- Derive a merge order. `stack-review` states it once and this cites it.

## Guards

The refusal strings sit in the body, since the runtime loads that file and ignores this one. Two conditions stop a run: a handback that does not attribute findings to branches, and a finding naming a branch outside the resolved chain.

## Out of scope

- `claude-address-review` owns how one finding is answered on one branch. This owns what a chain needs on top of that, and invokes the per-branch answer rather than restating it.
- `stack-review` produces the handback this consumes and owns the merge order.
- `stack-ship` cut the chain and owns the rebase mechanics behind each merge, cited from here.
- `.claude/context/stacked-shipping.md` carries how git behaves under a stack. This carries what a worker does about it.

## Collision

Nothing contradicts this today. The one shared rule is the merge order, which appears here because the walk rebases behind it, and which `stack-review` owns so three skills acting on it cannot drift apart.
