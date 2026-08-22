---
title: Stacked shipping
description: How a chain of dependent pull requests is cut, reviewed, and merged, and what git does under it
---

# Stacked shipping

## Overview

A stack is a chain of pull requests where each branch targets the one below it rather than the trunk, so work built in order is read in order while all of it is open at once. A dependency between two slices is the reason to stack them rather than the reason to fold them into one review.

This entry carries what is not a step. The roles a stack runs under, how git behaves when one of its branches merges, and what a green check on a stacked branch does and does not report all sit here. Every procedure sits in the skill that runs it, and neither surface restates the other.

## Layout

- `.claude/skills/stack-ship/` owns cutting the chain from a run's commits and rebasing it as each branch merges
- `.claude/skills/stack-review/` owns reading the whole chain before posting anything, and the merge order it recommends
- `.claude/skills/stack-address/` owns answering a batch of findings across every branch in one pass

## Decisions

### The roles are separate sessions, so they are separate skills

Four roles run a stack and each gets its own skill. A run is planned and implemented, cut into a chain, reviewed across that chain, and answered across it. `visual-batch` holds the first where the work is visual, and the three skills above hold the rest whatever the work is.

The split falls where a session boundary falls. A skill is invoked, and the worker and the reviewer invoke from separate sessions, so one file covering both hands each party the other's procedure and leaves each reading past half of it. The cost is that the contract between them spans files, which each half pays by stating the other's obligation in one line: the reviewer holds every finding until the whole stack is read, and the worker walks the whole chain bottom to top, pushing and answering each branch as it finishes it.

The two halves of that contract are not a pair, and reading them as one is what kept the worker's half wrong. A reviewer is looking for something not yet found, and a cross-branch defect exists only in the relation between branches, so concluding before the last one is read is concluding early: on one chain, six pull request bodies each reported a plausible test count and the defect was that all six reported the same one, which no single branch carries. A worker is applying findings that are already complete, so holding discovers nothing and leaves the reviewer idle through one gate run per branch. The worker's half read as the mirror of the reviewer's until 2026-08-22, on the symmetry rather than on either reason.

Reaching the right skill without loading all four is what this section is for. A session cutting branches wants `stack-ship`, a session reading them wants `stack-review`, and a session answering a handback wants `stack-address`.

### A stack looks illegal under the disjoint-file test

`visual-batch` marks two batches independent when their file sets share no file and no token, and independence is what earns a separate branch there. Every branch in a stack rewrites the files below it by construction, so a session reading only that test concludes a stack should not exist.

The two tests answer different questions. Disjoint file sets decide whether work can run in parallel, and a stack is explicitly serial. What decides whether a stack should be cut is whether each slice can be observed on its own, which `.claude/skills/stack-ship/SKILL.md` states with the run that failed it.

### The pull request thread is the durable surface

Two sessions running a stack talk over a channel that is faster than the thread and is what lets one handback cover a whole chain. It is also scrollback that dies with the session.

The operator decides every merge by reading the thread. Anything that decides a merge therefore belongs there, and everything else belongs on the channel. A finding, a fix, or a withdrawal that reaches only the channel is lost at merge, and a branch whose thread reads open or reads as nothing does not get merged whatever the channel says.

### The merge order is forced by the squash

Merge the bottom of a chain first and work up. The order follows from what a squash does rather than from anything a session picks: the merged commit is an ancestor of nothing stacked on the pre-merge tip, so merging out of order replays the branch below into the trunk a second time under the wrong title.

The gate does not bear on the order. `verify.yml` fires on `pull_request` with no branch filter, so every branch in a chain is gated from the moment its pull request opens and a whole chain can be reviewed with all of it green. What the order costs is a rebase behind each merge rather than a wait for a branch to receive its first checks.

## Gotchas

### A squash merge breaks every base above it

The commit a squash lands on the trunk is not an ancestor of the branch that was stacked on the pre-merge tip. The merge base falls back below the merge, and the retargeted pull request above then shows the merged work again as its own diff.

Every surviving branch needs `git rebase --onto <new-base-head> <old-base> <branch>` after the merge beneath it, run bottom to top. Only the branch directly above the merge takes the trunk as that target. Every branch further up takes the rebased head of the one below it, since passing the trunk there replays the branch straight onto it and drops the branches between them out of the chain.

### A mergeable state is not evidence the base is current

This is the trap that reaches production, and the conflict is the one that does not. After a squash merge, the branch above reported `MERGEABLE` and `CLEAN` against the trunk while its merge base still sat two merges back. Its own diff carried eleven files instead of the two it touched, and merging it would have squashed the branch below into the trunk a second time under the wrong title. Nothing conflicted, because the content matched what the trunk already held.

Test the merge base against the trunk head, or the file count on the pull request diff against what the branch is meant to touch. Never the mergeable flag, which has to fire where there is no conflict to read.

### A reported conflict is a tell in neither direction

Two branches of one chain reported opposite symptoms from a single cause. One carried a commit the trunk had absorbed and nothing else, so the two histories held one change twice and every line of it read as conflicting while nothing was wrong. The other carried an absorbed commit with its own work on top, so there was nothing to disagree about and the staleness had no symptom at all.

Same staleness, inverted signal, and the silent one is the one that merges. The merge base and the diff file count answered both where the mergeable flag answered neither.

### Staleness is reported before a rebase is attempted

`git merge-tree --write-tree <base> <head>` reports whether two trees conflict in one command, without touching the working tree and without a rebase to undo. It belongs at the start of a review rather than after a conflict surfaces.

What produced it: findings were posted on the bottom branch while the branches above were still being read, the bottom was fixed inside the hour, and the branch above was then based on a commit that no longer existed at the head of its own base. The trial merge would have reported it before the first finding was written.

### A rebase leaves no way to tell it was one

A rebase rewrites every commit above the merge, so a reviewer returning to a branch cannot distinguish a pure rebase from one carrying edits and falls back to re-reading content already read. `git diff <reviewed-oid> <new-head>` settles it and reports empty on a pure rebase, which is what makes the worker's claim checkable rather than trusted. A full re-read was paid twice on one run before this was written down.

### A session listing does not name who holds a branch

Work running in linked worktrees surfaced in the session listing as neither worktree, so the listing reported all four branches as held by nobody while one session held every one. Resolving the target by inference worked and was not checkable, so a dispatch opens by naming the worktree and branch the sender believes the reader holds and asks to be corrected.

## Hidden contracts

- A cross-branch defect is invisible to a per-branch review. Two branches can each be correct read alone and wrong as a pair, which is why the whole chain is read before anything is posted rather than branch by branch.
- A branch's checks run against its own tip, which already carries every commit below it, so a green run on the top of a chain reports the whole chain passing together. What green says nothing about is whether the branch's base is current, which is the state that merges the work below it a second time.
