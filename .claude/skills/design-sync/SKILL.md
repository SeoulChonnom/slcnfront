---
name: design-sync
description: Match the app UI to the design prototype (docs/SeoulChonnom_Prototype.html) via a capture → compare → fix → re-capture loop. Use when the user asks to sync, verify, or fix design/UI against the prototype, or mentions 디자인 동기화/프로토타입 비교.
---

# Design Sync Protocol

Reference (source of truth): `docs/SeoulChonnom_Prototype.html`. Everything else (`.pen` files, older docs) is outdated — ignore it.

## Hard rules

1. **Never Read the prototype HTML whole** (~2MB). Use Grep for selectors/tokens, or Read with offset/limit.
2. The prototype's **top navigation bar (1440/390/관리자ON/디자인시스템/404/로그인 buttons) is NOT part of the target design** — never replicate it.
3. Verdicts on screenshot comparisons are made by the main agent. Capture work may be delegated; judgment may not.
4. "Looks close" is not done. Done = a re-capture after the fix shows the difference is gone.

## Setup

- App: `pnpm dev`, then log in through the UI (ID `string` / PW `string`) before visiting protected routes. Desktop = `/main/...` at 1440px, mobile = `/mobile/...` at 390px.
- Prototype: open `docs/SeoulChonnom_Prototype.html` directly in the browser (playwright-cli). Use its own nav to switch viewport/pages.
- If the backend lacks data, mock API responses with Playwright route interception (`localhost:8080`), or ask the user to seed data — do not skip the page.

## Capture matrix

For each target page, capture prototype AND app at both 1440 and 390:
main/home, trip list, trip detail, calendar, shoes, travel list, travel detail, travel register, travel edit — plus **every modal, popup, and interactive state** on those pages (open them before capturing). Save all captures under `screenshots/` with names like `proto-{page}-{w}.png` / `app-{page}-{w}.png`.

## Comparison checklist (known weak spots — check these explicitly)

Past sessions repeatedly failed on exactly these; check them one by one, per page:

- **Fonts actually rendering**: run `document.fonts.check('16px Inter')` (or the current font) in both pages. A token declaration is not a loaded font.
- **Spacing**: compare computed `margin`/`padding`/`gap` of section containers, cards, and list items — not just the CSS source.
- **Typography detail**: `font-size`, `line-height`, `letter-spacing`, `font-weight` as computed values.
- **Alignment**: text alignment, flex/grid alignment, icon–text baseline.
- **Modals/popups**: open every one; compare size, radius, backdrop, button placement.

Use `getComputedStyle` via playwright-cli JS evaluation for numeric comparison; don't rely on eyeballing screenshots alone.

## Loop

1. Capture matrix (delegate to subagents in parallel; haiku/sonnet).
2. Main agent compares pairs, lists concrete diffs (element, property, proto value vs app value).
3. Fix diffs (sonnet subagents per area).
4. Re-capture only the changed pages and re-compare. Repeat until the diff list is empty or every remaining item is documented as impossible.
5. Write the result to `docs/` (what matched, what was fixed, what is impossible and why), and report with the Definition of Done evidence from AGENTS.md.
