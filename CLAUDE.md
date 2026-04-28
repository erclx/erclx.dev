# Project

[One-line description]

## Context

- Check `.claude/` state docs (`TASKS.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`, `DESIGN.md`, `WIREFRAMES.md`) for context before making changes, when present. The `claude-feature` skill reads them in parallel when planning a feature.
- Coding standards live in `.claude/rules/` and load automatically. Always-on rules apply every session. Path-scoped rules apply to files matching their `paths:` glob.

## Behavior

- Flag concerns or alternatives when a proposed change has tradeoffs worth discussing.
- When facing a judgment call with 2-3 reasonable options mid-flow, pick one and state the tradeoff in one sentence. Enumerate options only when the user's preference is the deciding factor.
- Match edit scope to the request. Ship minimal v1 and queue extensions as follow-ups. Edit only what the user named on simplification requests. Do not add features they did not ask for.
- When rewriting a section, preserve existing code blocks, tables, and grouped examples unless the user asked to remove them.

## Indexes

- When a folder has an `index.md`, check it before reading individual files in that folder.
- For folders where an agent browses to pick a document, `index.md` is regenerated from each file's frontmatter. Do not hand-edit `index.md`. Code folders and scratch folders do not need one.
- Every `index.md` carries its own frontmatter (`title`, `subtitle`) that the walker preserves. To keep a folder's `index.md` hand-edited, add `auto: false` to its frontmatter.

## Markdown

- When editing any markdown file, follow `standards/prose.md`.

## Commands

- Run `bun run check` before committing. Full script reference in `docs/development.md`.

## Local development

- Keep `bun run dev` running in the background on port 4321 during landing-page sessions so visual changes are immediately visible at http://localhost:4321.
- Screenshots run through `bun run screenshot` and bind a separate preview server on port 4173 (`PREVIEW_PORT=4173 bash scripts/screenshot.sh`) so they do not collide with the dev server.
- Outputs land in `screenshots/` (gitignored). Read them with the Read tool to verify changes. Both states render: light by default and dark via `emulateMedia`.

## UI conventions

- Outbound links default to same-tab. Use `target="_blank" rel="noopener"` only when the link opens a long-form resource the visitor likely wants to keep open while the page stays in another tab (resume PDFs, long-form articles).
- After editing any file under `src/components/`, `src/layouts/`, `src/pages/`, or `src/styles/global.css`, re-run `bun run screenshot` and verify the diff before reporting work as done.

## Playwright MCP

- The Playwright MCP server is configured in `.mcp.json` and runs via `bunx @playwright/mcp@latest`. Use it when verification needs interaction (hover states, responsive viewports, link clicks, computed-style inspection) rather than a static screenshot diff.
- Reach for screenshots when checking pure layout or content-vs-canonical-source. Reach for Playwright MCP when checking behavior, accessibility, or anything that requires the page to react to input.

## Key paths

- `src/`: [description]
- `.claude/`: planning docs (requirements, architecture, wireframes, design, tasks)
- `.claude/review/`: gitignored scratch for review and UI-test output, overwritten on each run
- `.claude/SYNC-QUEUE.md`: gitignored queue of pending content updates from the career repo

## Sync queue

- Content on the landing page is downstream of the career repo. Pending updates arrive as entries in `.claude/SYNC-QUEUE.md`.
- On sync or landing-page work, read `.claude/SYNC-QUEUE.md` for the protocol and the queue
- At the start of any landing-page work session, check `.claude/SYNC-QUEUE.md` for pending entries and offer to drain them before starting new work
- Never read career files for content once v1 has shipped. Use queue entries only.

## Spelling

- When cspell flags a word, rewrite typos. Add real terms to the appropriate dictionary in `cspell.json`.
- Keep dictionary files sorted alphabetically.

## Snippets

- When a snippet is referenced with `@`, execute its instructions immediately using available session context.

## Tasks

- `.claude/TASKS.md` is gitignored local session scratch. Use it freely without worrying about staging or reverting before commits.
- Only create a task for work that spans multiple sessions or has real dependencies. Handle small edits immediately without a task entry.
- Do not add tasks retroactively for work already completed. Completed work is visible in git.
- When a task needs execution detail beyond `.claude/TASKS.md`, create a plan in `.claude/plans/` and link to it from the task block's intro paragraph. When that task ships, delete its plan file.
- Write the plan in the same session as the task block. The session that executes the plan later inherits reasoning context it would otherwise have to re-derive.

## Memory

- Write all memory files to `.claude/memory/`, not `~/.claude/projects/`.
- Save a feedback memory only when the same mistake happens twice in the session, or when the user explicitly corrects you. First-occurrence slips are noise.
- Keep feedback memories to 3 lines: the rule, a one-line Why, and a one-line How to apply. Capture the pattern, not the recovery narrative.
- Before creating a new memory file, check for an existing one on the same topic. Update rather than duplicate.

## Scratch

- Write temporary files to `.claude/.tmp/<slug>/<file>.md` in the project root. Use a kebab-slug tied to the topic. Never use `/tmp` or a flat `<slug>-<file>.md`.

## Worktrees

- Shared session scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`) lives at the main worktree root, not inside a linked worktree. From a linked worktree, resolve these paths against the main root via `git worktree list --porcelain | awk '/^worktree /{print $2}' | head -1`. Fall back to `pwd` if not a git repo.
- From a linked worktree, every `Edit` or `Write` to a tracked file (source, docs, `TASKS.md`) must use a path starting with `pwd`. Only untracked scratch (`.claude/plans/`, `.claude/review/`, `.claude/memory/`) resolves to the main worktree root.
