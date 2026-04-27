# erclx.dev

Single-page personal landing site for Eric Le. Static Astro build with React islands, Tailwind v4, and shadcn/ui. Content is sourced from the parent career repo and synced into the page via `.claude/SYNC-QUEUE.md`.

## Tech stack

- Astro v6 with static output
- React for interactive islands
- Tailwind CSS v4 via `@tailwindcss/vite`
- shadcn/ui on the radix base
- TypeScript strict
- Bun for runtime, install, and scripts

## Setup

```bash
bun install
bunx playwright install chromium
```

## Commands

| Command              | Action                                       |
| :------------------- | :------------------------------------------- |
| `bun run dev`        | Start the dev server on `localhost:4321`     |
| `bun run build`      | Type-check and build to `dist/`              |
| `bun run preview`    | Preview the production build locally         |
| `bun run typecheck`  | Run `astro check`                            |
| `bun run lint`       | Run ESLint with zero warnings allowed        |
| `bun run check`      | Full verification, auto-formats then asserts |
| `bun run test:run`   | One-shot unit tests with vitest              |
| `bun run test:e2e`   | Run Playwright e2e tests                     |
| `bun run screenshot` | Capture light and dark screenshots per route |

## Structure

See `.claude/ARCHITECTURE.md` for the file tree and key technical decisions, and `.claude/REQUIREMENTS.md` for scope and non-goals.

## Content

Page copy is canonical in the parent career repo. After v1 ships, content updates land via `.claude/SYNC-QUEUE.md`. Do not author copy in this repo.
