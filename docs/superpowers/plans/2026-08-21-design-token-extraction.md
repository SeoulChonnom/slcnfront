# Design Token Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate repeated, same-intent hard-coded UI colors and effects into the existing Seoul Quiet Editorial design tokens, then migrate every qualifying production use without changing behavior or activating dark mode.

**Architecture:** `src/styles/tokens.css` remains the single token source. Existing semantic tokens are reused first; new tokens are added only when a literal appears at least three times with the same intent and no existing token expresses that intent. Production CSS and inline SVG presentation values migrate to `var(...)` references while dynamic calendar data colors and test fixtures remain literal data.

**Tech Stack:** Vite, React, TypeScript, CSS custom properties, Vitest, Playwright CLI

**Spec:** `DESIGN.md` (especially §§3, 8, 13, 16, and 17)

## Global Constraints

- Preserve the committed “A Quiet Seoul Photo Journal” visual identity and existing behavior.
- Use `src/assets/img/SLCN.png` as the sole brand mark; do not alter it.
- Extract only patterns used at least three times with the same intent.
- Prefer existing semantic tokens over new tokens and do not create aliases solely to mirror a literal.
- Keep runtime/user-provided calendar colors and test fixture values literal because they are data, not design-system declarations.
- Do not activate dark mode, add a theme switch, introduce dependencies, or refactor unrelated code.
- Keep `/main/*` and `/mobile/*` at equal visual quality.
- Preserve accessible focus rings and semantic state colors from `DESIGN.md`.
- Run at most two batched visual inspection rounds: one desktop/mobile inspection, one confirmation after fixes.

---

### Task 1: Inventory and map qualifying values

**Files:**
- Inspect: `src/styles/tokens.css`
- Inspect: `src/styles/components-common.css`
- Inspect: `src/styles/components-pc.css`
- Inspect: `src/styles/components-mobile.css`
- Inspect: `src/styles/profile.css`
- Inspect: `src/styles/travel-detail.css`
- Inspect: `src/styles/travel-list.css`
- Inspect: `src/styles/travel-register.css`
- Inspect: `src/styles/utilities.css`
- Inspect: production `src/**/*.tsx` files containing inline presentation colors
- Create: `docs/tmp/design-token-extraction-inventory.md`

**Interfaces:**
- Consumes: existing CSS custom properties from `src/styles/tokens.css` and the semantic definitions in `DESIGN.md`.
- Produces: a literal-to-token mapping table with occurrence count, intent, target token, affected files, and an explicit keep-literal reason for excluded values.

- [ ] **Step 1: Produce the production-only literal inventory**

Run:

```bash
rg -n --glob '!**/__tests__/**' --glob '*.{css,tsx,ts}' '(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\()' src
```

Classify each result as design presentation, runtime data, CSS fallback, or documentation comment. Do not count values declared in `tokens.css` as migration targets.

- [ ] **Step 2: Write the mapping artifact**

Write `docs/tmp/design-token-extraction-inventory.md` with these columns: `literal`, `normalized value`, `same-intent count`, `intent`, `target existing/new token`, `files`, `decision`. Every new token must show a count of at least three and must not duplicate an existing semantic token.

- [ ] **Step 3: Verify the inventory is complete**

Re-run the command from Step 1 and account for every production result in the mapping artifact. Record the command and count in the artifact.

### Task 2: Extract tokens and migrate production uses

**Files:**
- Modify: `src/styles/tokens.css`
- Modify only as justified by Task 1: `src/styles/components-common.css`
- Modify only as justified by Task 1: `src/styles/components-pc.css`
- Modify only as justified by Task 1: `src/styles/components-mobile.css`
- Modify only as justified by Task 1: `src/styles/profile.css`
- Modify only as justified by Task 1: `src/styles/travel-detail.css`
- Modify only as justified by Task 1: `src/styles/travel-list.css`
- Modify only as justified by Task 1: `src/styles/travel-register.css`
- Modify only as justified by Task 1: `src/styles/utilities.css`
- Modify only as justified by Task 1: production `src/**/*.tsx` files with inline presentation colors

**Interfaces:**
- Consumes: the approved mapping in `docs/tmp/design-token-extraction-inventory.md`.
- Produces: semantic CSS custom properties in `:root` and production styles that consume them.

- [ ] **Step 1: Establish a failing static regression check**

Before editing, save the production-only literal inventory command output and confirm it contains qualifying direct presentation colors outside `tokens.css`. This is the red state for the refactor.

- [ ] **Step 2: Add only justified tokens**

Add any Task 1-approved tokens beside the closest semantic group in `src/styles/tokens.css`. Use `--color-*` for semantic colors and `--shadow-*` for reusable elevation; reference existing tokens inside composite values when CSS syntax permits.

- [ ] **Step 3: Migrate shared and route styles**

Replace mapped literals with their target variables. Preserve gradients, alpha, borders, and shadows exactly unless the mapped literal is an obsolete semantic state color contradicted by `DESIGN.md`; in that case use the verified semantic state token.

- [ ] **Step 4: Migrate inline presentation colors**

For authored SVG strokes/fills, use CSS custom properties through React-compatible `stroke='var(--token)'` or a class. Do not change API payload colors, FullCalendar event data, or test fixtures.

- [ ] **Step 5: Remove migration-created orphans**

Delete only aliases or local custom properties made unused by this task. Preserve pre-existing unrelated dead code.

- [ ] **Step 6: Run focused static verification**

Run the production-only literal inventory again. Any remaining literal outside `tokens.css` must have an explicit keep-literal entry in the Task 1 artifact. Verify no dark-theme selector or toggle was added.

### Task 3: Automated and visual verification

**Files:**
- Update only if behavior assertions require it: colocated `src/**/__tests__/*.test.tsx`
- Create screenshots under: `screenshots/design-token-extraction/`

**Interfaces:**
- Consumes: the completed Task 2 worktree state and inventory artifact.
- Produces: command evidence, desktop/mobile screenshots, rendered-style checks, and a concise pass/fail report.

- [ ] **Step 1: Format and static checks**

Run after the last edit:

```bash
npx @biomejs/biome check --write src/
pnpm typecheck
pnpm run knip
```

All commands must exit 0, or the report must distinguish a pre-existing failure from a regression with evidence.

- [ ] **Step 2: Test suite**

Run after Step 1:

```bash
pnpm test
```

The full Vitest suite must pass.

- [ ] **Step 3: Start the app and authenticate**

Run `pnpm dev`, sign in through the UI with ID `string` and password `string`, and wait for the protected target route before capture.

- [ ] **Step 4: Batched desktop/mobile inspection**

Capture representative changed surfaces at 1440px under `/main/*` and 390px under `/mobile/*`, including profile plus at least one shared-component-heavy surface and one travel/trip surface. Compare rendered output to the pre-change baseline or the current `DESIGN.md` contract. In the same pass verify computed colors, focus visibility, overflow, touch target behavior, and `document.fonts.check('17px Pretendard')`.

- [ ] **Step 5: One bounded fix and confirmation pass if needed**

If the first batch finds defects, fix them together, rerun Steps 1–2, and capture one final desktop/mobile confirmation batch. Stop after that confirmation pass.

- [ ] **Step 6: Final extraction audit**

Confirm every migrated value traces to the Task 1 mapping, no one-off token was introduced, production literals left behind are documented exceptions, and dark mode remains inactive.
