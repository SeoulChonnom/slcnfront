# Repository Guidelines

## Project Structure & Module Organization

This frontend uses `Vite + React + TypeScript`. Application code lives under `src/` and is organized by responsibility:

- `src/app/`: app bootstrap, providers, router, and shells
- `src/pages/`: route-level pages for `main`, `mobile`, `public`, and shared flows
- `src/domains/`: domain modules such as `auth`, `trip`, `calendar`, and `shoes`
- `src/components/`: reusable layout and UI primitives
- `src/lib/`: shared API, env, routing, and utility helpers
- `src/styles/`: global tokens and CSS layers
- `src/test/`: test setup, helpers, and regression smoke tests
- `public/`: static assets served as-is
- `docs/`: refactoring notes, API spec, and design references

Keep new code close to its domain. For example, add `useTripList.ts` under `src/domains/trip/hooks/`, not a generic shared folder.

## Build, Test, and Development Commands

Use Node.js 24 and `pnpm`.

- `pnpm dev`: start the Vite dev server
- `pnpm build`: run TypeScript project builds, then create a production bundle
- `pnpm typecheck`: run TypeScript project reference checks without emitting files
- `pnpm preview`: serve the built app locally from `dist/`
- `pnpm lint`: run ESLint across `ts` and `tsx` files
- `pnpm test`: run the Vitest suite once
- `pnpm test:watch`: run Vitest in watch mode during development

## Coding Style & Naming Conventions

Follow existing TypeScript + React patterns with 2-space indentation and ES module imports. Use `PascalCase` for components and pages (`TripRegisterPage.tsx`), `camelCase` for hooks and utilities (`useRestoreSession.ts`, `trip-validation.ts`), and colocate tests in `__tests__/`.
Biome is configured in `biome.json`. Before finishing your job, run `npx @biomejs/biome check --write src/` and make sure it reports no remaining problems.
Before finishing your job, run `pnpm run knip` for checking unused files, dependencies, and exports. The current baseline should be clean; if it fails, distinguish whether the failure was introduced by your change.

## Testing Guidelines

Tests use `Vitest`, `@testing-library/react`, `jsdom`, and `msw`. Global setup lives in `src/test/setup.ts`; shared render helpers and mock server utilities are under `src/test/helpers/`.

Name tests `*.test.ts` or `*.test.tsx`. Place feature tests next to the code they cover, for example `src/app/router/__tests__/guards.test.tsx`. Run `pnpm test` before opening a PR, and add or update regression coverage when routing, auth bootstrap, or API behavior changes.

## Playwright Capture Guidelines

Most app routes under `/main/*` and `/mobile/*` are protected by the router auth guard. If Playwright opens a protected route without an authenticated session, the app redirects to the matching login route (`/main/login` or `/mobile/login`) with a `redirect` query. When taking screenshots or inspecting UI with Playwright, do not treat a login page capture as the target page unless the login page is the explicit subject.

Before capturing protected pages, sign in through the UI using the development server account:

- ID: `string`
- Password: `string`

After submitting login, wait for the redirect target or expected protected route to render before taking screenshots. For desktop captures, use `/main/...` routes; for mobile captures, use `/mobile/...` routes and a mobile-sized viewport.

## Definition of Done (Evidence Required)

Never claim a task is complete without evidence produced in the current session:

- Code changes: show the actual outputs of `npx @biomejs/biome check --write src/`, `pnpm typecheck` (or `pnpm build`), and `pnpm test` run after your last edit. "It should pass" is not evidence.
- UI changes: capture the changed screens with Playwright at 1440px (`/main/...`) and 390px (`/mobile/...`) and compare against the reference before reporting done.
- Verify rendered results, not declared styles. A font/token declared in CSS is not proof it loads — check `document.fonts.check(...)` or the rendered screenshot. (Past incident: Inter was declared in `tokens.css` but never loaded; static analysis missed it repeatedly.)
- Every completion report must state explicitly: what was verified (with the command/screenshot), and what was NOT verified and why.
- If verification fails, report the failure with output. Do not soften or omit it.

## Context Budget

- Never read large files whole. `docs/SeoulChonnom_Prototype.html` is ~2MB (over 1.5M tokens) — use Grep on it, or Read with `offset`/`limit`. A PreToolUse hook blocks whole reads of files over 1MB.
- Delegate bulk work (mass screenshot analysis, many-file reads, mechanical edits) to subagents so the main context stays small; subagents start with fresh context and are the primary defense against compaction-driven quality loss.
- Write intermediate artifacts (screenshots, analysis dumps, reports) to `screenshots/`, `docs/tmp/`, or the session scratchpad — never paste bulk content into the conversation.

## Model Routing & Orchestration

| Task type | Model |
|---|---|
| Mechanical work: captures, file moves, codemods, bulk renames | haiku |
| Scoped implementation with a clear spec (a component, a hook, a mapper) | sonnet |
| Visual diff judgment, architecture decisions, open-ended debugging | opus or stronger |

- On large multi-part jobs the main agent orchestrates only; implementation runs in parallel subagents. Screenshot-comparison verdicts are made by the main agent directly, never delegated.
- When background agents run in parallel, actively monitor them (TaskList/TaskOutput). If an agent shows no progress, inspect its output and intervene — do not wait passively for it to finish.
- Escalate honestly: if an open-ended problem has resisted two genuine attempts, say so and recommend a stronger model or human review instead of iterating in circles.

## Design Sync

For any "match the prototype" work, use the `/design-sync` skill (`.claude/skills/design-sync/`). The design source of truth is `docs/SeoulChonnom_Prototype.html`; its top prototype navigation header is NOT part of the target design. The `.pen` file under `docs/design/` is outdated — do not use it.

## Commit & Pull Request Guidelines

Recent history uses short conventional messages such as `feat: ...`, `fix: ...`, and `chore: ...`. Keep that format, use the imperative mood, and scope each commit to one logical change.

PRs should include a concise summary, linked issue or task when available, and screenshots or short recordings for visible UI changes. Call out route changes, API contract updates, and any follow-up work reviewers should track.
