# Architecture

## Overview

Static Astro site that renders one page at the erclx.dev apex and one route per shipped project. The build emits HTML, CSS, and a small JS bundle for any interactive islands. Page copy is authored in this repository.

This record holds at most 11 decisions.

Every session pays for this file before any work starts, so it carries the system's shape and nothing else: the stack, the delivery, the boundaries a check enforces, the layout, and the principles that change work in more than one domain. A decision about how one surface behaves lives in that domain's entry under `canon/context/`, which `canon/context/index.md` lists. For the source and test layout, see `canon/context/development.md` § Layout.

## Key technical decisions

### Astro renders the site, and React is a capability that renders nothing

Astro ships zero JS by default and the page is mostly prose and links, so a framework that shipped a runtime on every visit would spend bytes on nothing a visitor uses. Next was the alternative and it would force that runtime model. React loads only where an island opts into `client:*`, and today nothing does: the site ships zero directives and holds one unreferenced component at `src/components/ui/button.tsx`.

The React toolchain stays anyway. An interactive surface is a plausible next increment and standing the integration back up costs more than carrying it does. Read that as settled rather than as an oversight, since a session auditing the tree without it proposes removing the toolchain, which has happened once. `canon/context/development.md` carries the package bill a removal would have to weigh, which is larger than the direct dependency list suggests.

Tailwind v4 arrives through `@tailwindcss/vite` rather than the deprecated v3 Astro integration, and it reads a CSS-first `@theme` block instead of a JS-side `tailwind.config`, which is the same token model shadcn uses. shadcn sits on the radix base with the Nova preset, so the interactive primitives are accessible without locking the project into a design system, and the components live under `src/components/ui/` in this repository rather than behind a package that would have to be forked to edit.

### Cloudflare Pages, deployed from Actions behind the test gate

The apex domain already lives in Cloudflare, so Pages attaches it without a DNS migration and serves the apex and `www` from one project. Vercel and Netlify would need DNS pointed away from Cloudflare or a CNAME-flattening dance, and GitHub Pages serves static files fine but offers no per-PR previews and ties the project's lifecycle to repository settings rather than a host project.

The deploy runs from GitHub Actions through `cloudflare/wrangler-action` rather than through Cloudflare's own Git integration, which would deploy on every push without honoring the test gate and would build in Cloudflare's environment against a separately pinned bun. Direct upload keeps production behind the full check suite and keeps the build environment the same one CI already runs. `canon/context/deployment.md` carries the pipeline, the domain setup, and the shorter gate a preview deploy takes.

### What a check enforces here, and what nothing watches

Almost nothing here is enforced mechanically, so knowing which boundary a check actually holds is what keeps a session from trusting one that does not.

No standard installs into this project. The corpus resolves through the toolkit at `aitk standards <name>`, and `.claude/rules/project/` does not exist, so a policy written only in a project rule has nothing enforcing it and stays visible in git history rather than in a checked-out file. What that costs is stated rather than hidden: a guard keyed to a file's existence reports success the moment that file stops existing, and two hooks reading the standards tree at run time went silently inert when the tree was deleted, until each was rewired to call the toolkit directly and run against a probe carrying known violations before being trusted.

What nothing watches is whether an instrument asks about the thing a reader sees. A check reading an element's geometry passes on an element painted nowhere, so a panel can measure at exactly the right size while sitting off screen and a placement check can clear every figure while most of them are unpainted. Assert that a surface is visible where a reader would meet it, not only that it has the right shape, and read the paint rather than the state. Nothing in the suite enforces that about a check yet to be written.

The one content boundary that is enforced is authorship of the bio. `src/components/site/about/bio-copy.ts` holds the two paragraphs the root `README.md` and the site's own About section share verbatim, and `src/components/site/about/bio-copy.test.ts` fails when the two drift apart. `scripts/card-copy.ts` holds the same shape for the share card's claim. Prefer that shape over a second copy whenever one string has to appear on two surfaces.

### Agent context split by load cost

Always-loaded context is paid on every session whatever the task, so only project-wide invariants sit in that tier. Everything else keys to a trigger: path-scoped rules load when a file matches their `paths:` glob, and per-domain narrative loads on demand through an index. `CLAUDE.md` § Context carries the tier map a session reads to place a given file.

### A pointer is hardware rather than an event

A response keyed to a pointer being over something is gated on a device reporting a pointer, a response keyed to a deliberate act never is, and a decision about what a finger does is judged on a device rather than in emulation, which reproduces the events and not the hardware.

### A value relating two elements is arithmetic over named values

A measurement that positions one element against another is written as arithmetic over the values that already fix the relationship, never as a literal standing in for it, while a value that sets something rather than relating two things stays a literal.

### A line is drawn where it divides, and a bound is revealed rather than drawn

A rule earns its ink only where it separates things a reader compares, since whitespace and a fading ground already state where a surface ends, and a control's bounds are revealed by a response rather than outlined at rest.

### One declaration decides how the page travels

The motion preference is read once at the root and every scroll-triggering caller resolves it rather than naming a behavior, a caller that means to arrive rather than travel says so explicitly, and a control that scrolls a reader inside the page they are already on replaces its URL entry rather than pushing one.

### A control gets an arrival where decoration gets a schedule

Decoration may run on a schedule, and a control announces itself once when it first comes into view and then waits for the reader.

### A visual decision is served as an arm the operator drives

A decision about how something feels to cause is settled by serving candidate treatments live from the running page for the operator to drive, rather than argued in prose or inferred from a capture, since both are passive and the question is not.

## Risks / open questions

`canon context audit` reads the cap clause above, and nothing in this project runs the verb. `scripts/verify.sh` calls no `canon` command, so the cap holds only while a session reads it and is not gated by any check that fails.
