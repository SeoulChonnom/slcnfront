# Home Memory Chronicle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the authenticated desktop and mobile home with the approved Memory Chronicle travel-retrieval experience.

**Architecture:** Refocus the home domain hook on independent travel, schedule, and day-out sources without changing API contracts. Compose an unboxed recent-travel feature, client-side year/search retrieval controls, a dense travel-only archive, and subordinate schedule/day-out context in the shared home page; device-specific CSS carries desktop and mobile composition.

**Tech Stack:** React 19, TypeScript, TanStack Query, React Router, Vitest, Testing Library, CSS design tokens.

**Spec:** `.impeccable/surfaces/src-pages-shared-homehubpage-tsx.md`

## Global Constraints

- The surface brief and approved `.impeccable/mocks/decision/home-memory-chronicle.webp` are authoritative.
- Preserve current travel, trip, schedule, asset, and route contracts; no backend or route changes.
- Travel is the home chronology. Day-outs remain a separate destination and schedules remain secondary.
- Desktop is flat and wide; glass remains only on the mobile bottom navigation for this surface.
- Use the supplied logo and factual API content. Do not invent copy, claims, records, or decorative placeholder imagery.
- Preserve loading, empty, no-cover, zero-result, full-error, partial-failure, retry, keyboard, focus, 44px touch-target, dark-theme, and reduced-motion behavior.
- Search uses only already-loaded travel list fields. Year navigation is client-side and newest-first.
- Follow the repository's 2-space TypeScript style and existing design tokens. Do not add dependencies.
- Use strict TDD for behavior changes: write each test, run it and confirm the expected failure, then implement and confirm green.
- Do not commit, reset, or modify unrelated existing/untracked user files.

---

### Task 1: Home retrieval model and behavior

**Files:**
- Modify: `src/domains/home/hooks/useHomeTimeline.ts`
- Modify: `src/domains/home/types.ts`
- Modify or create focused utilities under: `src/domains/home/`
- Create: `src/domains/home/__tests__/home-retrieval.test.ts`
- Create or modify: `src/pages/shared/__tests__/HomeHubPage.test.tsx`

**Interfaces:**
- Consumes: `TravelListItem[]`, `TripListItem[]`, `ScheduleEvent[]`, existing device route builders.
- Produces: a travel-first home model exposing all newest-first travels, nearest schedules, day-out availability, per-source loading/error state, and retry actions; pure filtering/year helpers suitable for component use.

- [ ] **Step 1: Write failing pure-behavior tests**

  Cover newest-first ordering, year derivation, title/region/review search, year-plus-search composition, and empty matches using literal fixtures. Name the production mutation each test catches.

- [ ] **Step 2: Run focused tests and confirm RED**

  Run: `pnpm test -- src/domains/home/__tests__/home-retrieval.test.ts`

  Expected: failures because the retrieval helpers/model do not exist yet.

- [ ] **Step 3: Implement the minimal retrieval model**

  Keep calculations pure and derive state during render/memoization. Expose independent source states so partial failures are visible instead of being collapsed into an empty result. Do not cap the travel array before year/search filtering.

- [ ] **Step 4: Run focused tests and confirm GREEN**

  Run: `pnpm test -- src/domains/home/__tests__/home-retrieval.test.ts`

  Expected: all focused tests pass with no warnings.

- [ ] **Step 5: Write failing component behavior tests**

  Cover the recent-travel feature and direct detail link, travel-only archive, separate day-out destination, nearest schedule link, year navigation, labeled search, missing-cover typography fallback, zero-result recovery, loading, full error/retry, and partial-failure messaging. Mock only external API/query boundaries and use complete response shapes.

- [ ] **Step 6: Run component tests and confirm RED**

  Run: `pnpm test -- src/pages/shared/__tests__/HomeHubPage.test.tsx`

  Expected: failures against the incumbent merged timeline UI.

---

### Task 2: Memory Chronicle production UI

**Files:**
- Modify: `src/pages/shared/HomeHubPage.tsx`
- Replace or remove from use: `src/domains/home/components/HomeTimelineRow.tsx`
- Create focused components under: `src/domains/home/components/`
- Modify: `src/styles/components-common.css`
- Modify: `src/styles/components-pc.css`
- Modify: `src/styles/components-mobile.css`
- Modify only if required for the approved home shell: `src/components/layout/DesktopHeader.tsx`, `src/components/layout/navigation-items.ts`, `src/app/shells/MainDesktopShell.tsx`
- Modify: `src/pages/shared/__tests__/HomeHubPage.test.tsx`
- Update if navigation behavior changes: `src/test/regression/__tests__/navigation-smoke.test.tsx`

**Interfaces:**
- Consumes: Task 1 home model/helpers, `useTravelAssetUrls`, device route builders, existing tokens.
- Produces: responsive Memory Chronicle markup and CSS for `/main` and `/mobile`.

- [ ] **Step 1: Implement the minimum semantic component structure that turns component tests GREEN**

  Build one meaningful `h1`; an eager recent-travel photograph with descriptive alt text when available; a complete no-cover text treatment; a labeled client-side search input; keyboard-operable year navigation with an active-state semantic; an `ol` of one-action travel detail links; compact schedule and separate day-out destinations; and explicit state messages/recovery actions.

- [ ] **Step 2: Run focused component and navigation tests**

  Run: `pnpm test -- src/pages/shared/__tests__/HomeHubPage.test.tsx src/test/regression/__tests__/navigation-smoke.test.tsx`

  Expected: all focused tests pass with no warnings.

- [ ] **Step 3: Replace the incumbent visual layout with the approved composition**

  Desktop: use the wide shell deliberately, keep the header flat for this surface, compose the recent memory asymmetrically without a card, transition by hairline into typographic year navigation/search, and render dense varied-thumbnail rows. Mobile: keep the recent memory compact enough to reveal archive context promptly, use a horizontal year rail, compact touch-safe rows, and retain glass only for bottom navigation. Use Warm Paper, Ink, Seoul Pink, Pretendard, existing tokens, flat surfaces, meaningful density changes, and no decorative gradients/shadows/cards.

- [ ] **Step 4: Add state, theme, motion, and browser-surface styling**

  Verify visible focus via `--color-focus-ring`, minimum 44px interactive targets, dark-theme token behavior, reduced-motion handling, selection/caret styling where home-specific treatment is necessary, image hover only on pointer devices, and stable image aspect boxes.

- [ ] **Step 5: Run focused tests after styling/refactor**

  Run: `pnpm test -- src/pages/shared/__tests__/HomeHubPage.test.tsx src/test/regression/__tests__/navigation-smoke.test.tsx`

  Expected: all focused tests pass with no warnings.

---

### Task 3: Backend follow-up document

**Files:**
- Create: `docs/home-redesign-backend-requirements.md`

**Interfaces:**
- Consumes: implemented client behavior, current travel-list and asset contracts, remaining brief gaps.
- Produces: one self-contained Korean handoff document; it does not change frontend behavior or API code.

- [ ] **Step 1: Audit which approved design requirements are constrained by current backend contracts**

  Distinguish required changes from optional scale/performance improvements. Include search scope and server-side search/pagination only if record growth makes client filtering or eager metadata transfer unsuitable.

- [ ] **Step 2: Write the backend handoff**

  For each item include current limitation, user impact, proposed endpoint/query/response behavior, priority, compatibility/migration note, and frontend fallback already shipped. Do not assert that a backend change is mandatory when the client implementation fully satisfies the brief.

---

### Task 4: Final verification and visual QA

**Files:**
- Verify all changed files.
- Create screenshots under: `screenshots/home-redesign/`

**Interfaces:**
- Consumes: completed tasks and authenticated/mocked local runtime.
- Produces: command evidence and 1440px/390px rendered screenshots.

- [ ] **Step 1: Run repository format and static checks**

  Run: `npx @biomejs/biome check --write src/`

  Run: `pnpm run knip`

  Run: `pnpm typecheck`

- [ ] **Step 2: Run the full test suite**

  Run: `pnpm test`

- [ ] **Step 3: Capture one bounded visual inspection round**

  Capture `/main` at 1440×1000 and `/mobile` at 390×844 after authentication or deterministic API interception. Verify the actual home route rendered, Pretendard loaded via `document.fonts.check(...)`, and compare against the approved comp and incumbent screenshots.

- [ ] **Step 4: Fix all observed defects in one batch and run at most one confirmation round**

  Re-run affected tests and required repository checks after the last edit, then capture confirmation screenshots only if the first inspection found defects.
