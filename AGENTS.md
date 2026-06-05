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
- `pnpm preview`: serve the built app locally from `dist/`
- `pnpm lint`: run ESLint across `ts` and `tsx` files
- `pnpm test`: run the Vitest suite once
- `pnpm test:watch`: run Vitest in watch mode during development

## Coding Style & Naming Conventions

Follow existing TypeScript + React patterns with 2-space indentation and ES module imports. Use `PascalCase` for components and pages (`TripRegisterPage.tsx`), `camelCase` for hooks and utilities (`useRestoreSession.ts`, `trip-validation.ts`), and colocate tests in `__tests__/`.
Biome is configured in `biome.json`. Before commit, please run `npx @biomejs/biome check --write` for formatting and linting.
Before commit, please run `pnpm run knip` for checking unused files, dependencies, and exports. It is configured and executable, but currently reports known existing unused files, dependencies, and exports. Do not treat those as newly introduced unless a change adds to them.

## Testing Guidelines

Tests use `Vitest`, `@testing-library/react`, `jsdom`, and `msw`. Global setup lives in `src/test/setup.ts`; shared render helpers and mock server utilities are under `src/test/helpers/`.

Name tests `*.test.ts` or `*.test.tsx`. Place feature tests next to the code they cover, for example `src/app/router/__tests__/guards.test.tsx`. Run `pnpm test` before opening a PR, and add or update regression coverage when routing, auth bootstrap, or API behavior changes.

## Commit & Pull Request Guidelines

Recent history uses short conventional messages such as `feat: ...`, `fix: ...`, and `chore: ...`. Keep that format, use the imperative mood, and scope each commit to one logical change.

PRs should include a concise summary, linked issue or task when available, and screenshots or short recordings for visible UI changes. Call out route changes, API contract updates, and any follow-up work reviewers should track.
