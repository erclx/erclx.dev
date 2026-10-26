---
title: Shipping
description: Stacked pull request chains, the skills that cut, review, and answer them, the bottom-up merge order, and the git traps under a squash
---

# Shipping

## Overview

Owns how a chain of dependent pull requests is cut, reviewed, answered, and merged. A stack exists when each slice can be observed on its own, even though every branch rewrites the files below it, so the disjoint-file test that splits parallel work does not apply to it.

Merge a chain bottom first, since a squash makes the merged commit an ancestor of nothing stacked above it. Anything that decides a merge goes on the pull request thread, since the channel between sessions dies with them.

## Layout

### `.claude/skills/`

Holds the three stack skills, one per role, since the worker and the reviewer run in separate sessions and each reads only its own half.

- `stack-ship` cuts the chain from a run's commits and rebases it as each branch merges
- `stack-review` reads every branch before posting anything, since a cross-branch defect exists only between branches, then recommends the merge order
- `stack-address` answers a whole handback bottom to top, pushing and replying on each branch as it finishes it
- `visual-batch` plans visual work into batches and hands a stack to `stack-ship` when the batches depend on each other

## Gotchas

- A squash breaks every base above it, so rebase each branch with `git rebase --onto`, bottom to top, onto the rebased head below it. Only the branch directly above the merge targets the trunk.
- `MERGEABLE` and `CLEAN` say nothing about a stale base, and a conflict can show or hide it. Compare the merge base with the trunk head, or the diff's file count with the branch's scope.
- `git merge-tree --write-tree <base> <head>` reports a conflict without touching the tree, so run it before the first finding rather than after a rebase fails
- `git diff <reviewed-oid> <new-head>` reports empty on a pure rebase, which makes a worker's no-edits claim checkable rather than a full re-read
- The session listing can report a branch held by nobody while a linked worktree holds it, so a dispatch names the worktree and branch it believes the reader holds
