---
description: Keep memory writes scoped to .canon/memory/ and out of context-owned domains
---

# Memory standards

## Writing memory

- Write all memory files to `.canon/memory/`, not `~/.claude/projects/`
- Write to `.claude/memory/` instead in a project that carries no `.canon/` root, which is one the record move has not reached. The ignore file is the source: `.gitignore` and its manifest counterpart are what keep the fallback spelling out of `git status`, and this rule defers to it. `canon migrate records` is what moves a project from this second spelling to the first. <!-- canon-keep-record-root -->
- A fact about a domain goes to that domain's `.claude/context/` entry, not to memory. `canon:claude-memory-capture` routes it there and `canon:claude-docs` folds it in. Memory keeps only what no context entry owns. Report it rather than proceeding silently when either skill does not resolve. Both ship with the plugin and this rule ships with the CLI, so a project that installed governance alone does not have them.
- Never delete a memory entry. Retire one by moving it to `.canon/tmp/memory-archive/`. A bulk retire runs through the shell, where no file edit fires a path-scoped rule, and the folder is gitignored with nothing to recover from.
- Follow the memory standard for the filename and type prefix, the frontmatter, the body shape each type carries, and the lifecycle. Read it with `canon standards memory`. Check every entry in the pen against that standard and fix what breaks it, since nothing keeps the folder conforming on its own.
