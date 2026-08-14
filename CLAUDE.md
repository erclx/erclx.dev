# erclx.dev

Personal landing site. Astro v6 static build with Tailwind v4, deployed to Cloudflare Pages at https://erclx.dev.

## Context

The project uses a three-tier context model. Know which tier holds what before reading or writing:

- Always loaded: root `CLAUDE.md`, `.claude/REQUIREMENTS.md`, `.claude/ARCHITECTURE.md`, and the `.claude/context/index.md` and `.claude/wireframes/index.md` discovery anchors. Project-wide invariants, product scope, and the anchors for on-demand domain and surface context.
- Path-scoped lazy: `.claude/rules/*.md` with `paths:` frontmatter. Coding standards that load only when files matching the glob are touched. Always-on rules apply every session.
- On-demand lookup: `.claude/context/<domain>.md` entries and `.claude/wireframes/<surface>.md` surfaces. Per-domain narrative and per-surface layout, loaded only when that domain or surface is touched. Use the always-loaded index files to pick which to read.

@.claude/LOCAL.md
@.claude/REQUIREMENTS.md
@.claude/ARCHITECTURE.md
@.claude/context/index.md
@.claude/wireframes/index.md

## Behavior

- Flag concerns or alternatives when a proposed change has tradeoffs worth discussing.
- When facing a judgment call with 2-3 reasonable options mid-flow, pick one and state the tradeoff in one sentence. Enumerate options only when the user's preference is the deciding factor.
- Match edit scope to the request. Ship minimal v1 and queue extensions as follow-ups. Edit only what the user named on simplification requests. Do not add features they did not ask for.
- When rewriting a section, preserve existing code blocks, tables, and grouped examples unless the user asked to remove them.
- When planning an edit to `CLAUDE.md`, show the proposed change as a fenced `diff` block in chat first, then wait for approval before calling `Edit`.
- This is a public repo. Do not write personal names into READMEs, `.claude/` planning docs and context entries, source comments, or commit messages. Use neutral phrasing like "the user", "a recruiter", or "a local file". Brief content under `.tmp/` is local context, not output.
- Do not cite `.claude/` paths (TASKS.md, plans, review, .tmp) from PR bodies, READMEs, or other artifacts a reviewer reads. Inline the context or use neutral phrasing like "queued as a follow-up".
- For deploy infrastructure (Vercel, Cloudflare), prefer CLI over the dashboard. Run inspection, redeploy, env-var, and domain commands from Bash rather than asking the user to click through. Confirm before destructive operations (delete project, force-push production, change live DNS).
- Before any multi-path `rm` or `rm -rf`, list every target path in chat and wait for explicit confirmation. "Clean up X" authorizes a different destructive action than a previous one, never a blanket nuke.
- Before proposing a new doc home for a convention (screenshot output path, fixture format, scratch convention), grep `CLAUDE.md` and `.claude/context/` for the topic. Extend the existing entry over creating a new section.

## Indexes

- When a folder has an `index.md`, check it before reading individual files in that folder.
- For folders where an agent browses to pick a document, `index.md` is regenerated from each file's frontmatter. Do not hand-edit `index.md`. Code folders and scratch folders do not need one.
- Every `index.md` carries its own frontmatter (`title`, `subtitle`) that the walker preserves. To keep a folder's `index.md` hand-edited, add `auto: false` to its frontmatter.
- Before searching source in a domain or touching a UI surface, consult the relevant `index.md` (`.claude/context/`, `.claude/wireframes/`) and read the matching entry first. It orients faster than a blind grep.
- When a diff adds a new top-level source domain folder, draft its `.claude/context/<domain>.md` entry at ship time per `.claude/standards/context.md`. `claude-docs` only refreshes existing entries and never auto-creates.

## Markdown

- Before writing a PR, commit, branch name, or snippet, read its standard in `.claude/standards/` and follow it. File-edit standards (prose, README, context, wireframes, skills, rules) route automatically via `.claude/rules/claude/`.
- Keep `README.md` user-facing. Technical detail belongs in `.claude/context/`.

## Commands

- Run `bun run check` before committing. Full script reference in `.claude/context/development.md`.

## Shipping

- After implementing a feature, run `bun run check` plus any test suite for the surfaces you touched. Fix what fails before opening a PR.
- After implementing a feature, run it end-to-end against the real surface (deployed preview, live page) and paste the output into the PR body under a `## Live smoke` section. If a live run is impossible, say so explicitly instead of claiming success.
- Keep PR bodies evergreen. Beyond the `## Live smoke` block, run logs, follow-up notes, and polish narratives go into PR comments via `gh pr comment`, not the body.
- After a local commit on a feature branch, stop and hand control back. Push only when the user signals after browser verification. User-invoked skills that push by design (`/toolkit:git-ship`, `/toolkit:git-followup`) are exempt for that invocation only. Manual edits made between skill invocations require a fresh push signal.
- Hold the diff in the worktree across multi-step flows. Do not commit between visual-tuning iterations or between items in a multi-item batch. Commit on explicit ship signal and use `/toolkit:git-stage` to split into focused commits at that point.
- When `public/resume.pdf` shows modified, it is an upstream résumé sync, not a stray edit. Always include it in the commit set as its own `chore(assets): sync resume pdf` commit. Do not stop and flag it as out of scope.

## Output

- After creating or modifying a file, include its path on its own line so terminal emulators can make it clickable. Do not paraphrase paths into prose ("the seeds folder", "your CLAUDE.md").
- Use the path the user's editor can resolve. The editor is rooted at the main project root.
- In the main worktree: relative from `pwd` works because `pwd` equals the editor root.
- In a linked worktree (under `.claude/worktrees/<name>/`): use absolute paths. Relative paths from worktree `pwd` would not resolve against the editor's project root.
- When the response covers multiple files, group paths under headers: `**Created:**`, `**Modified:**`, `**Deleted:**`. For single-file changes, the path on its own line is enough.

## Key paths

- `src/`: Astro source for the single-page site (pages, layouts, components, styles, assets)
- `.claude/`: planning docs (requirements, architecture, wireframes, design, tasks)
- `.claude/rules/`: path-scoped coding standards loaded by Claude Code on file match
- `.claude/context/`: per-domain narrative (how a domain is structured, decisions, gotchas), indexed via `.claude/context/index.md`
- `.claude/standards/`: authoring conventions for prose, commits, PRs, and the `.claude/` docs themselves
- `.claude/snippets/`: reusable prompts invoked with `@`
- `.claude/review/`: gitignored scratch for review and UI-test output, overwritten on each run
- `.claude/TASKS.md`: gitignored task board

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
