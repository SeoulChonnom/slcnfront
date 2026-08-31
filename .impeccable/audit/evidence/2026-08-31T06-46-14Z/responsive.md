# 나들이 등록 위저드 — Responsive Design Audit

Scope: `src/domains/trip/components/TripRegisterWizard.tsx` + `TripRegisterStepBasic.tsx` / `TripRegisterStepMaps.tsx` / `TripRegisterStepQuiz.tsx`, CSS in `src/styles/components-common.css` and `src/styles/components-mobile.css`. Desktop route `/main/map/register`, mobile route `/mobile/map/register`. All measurements taken against the running dev server (localhost:5173) with Playwright/Chromium, logged-in session.

---

## Findings

### [P0] Text scaling to 200% breaks the mobile wizard and makes 다음 unclickable
- **Location**: `src/styles/components-mobile.css:601-613` (`.slcn-shell-detail-mobile .slcn-trip-register-wizard__step-indicator` — `flex-wrap: nowrap`, and its `> li` — `white-space: nowrap`), rendered via `TripRegisterWizard.tsx:171-206`. Route `/mobile/map/register` @ 390px.
- **Impact**: A user with OS/browser text scaled to 200% (`document.documentElement.style.fontSize = '32px'`, a real, common accessibility setting — WCAG 1.4.4/1.4.10 require content to reflow up to 200% without loss of function) cannot reliably reach or click the 다음 button on step 1, 2, or 3.
- **Evidence**:
  - `document.documentElement.scrollWidth` = 668 vs `clientWidth` = 390 (diff **278px**) on step1, step2, and step3, all with identical culprit: `<div class="slcn-card slcn-trip-register-wizard__card">`, measured `right: 668`, `width: 636`.
  - The step-indicator itself (`<ol class="slcn-trip-register-wizard__step-indicator">`) measured `scrollWidth: 530` = `clientWidth: 530` — it does not scroll internally, it just grows to 530px wide (unconstrained) because its three pills are forced `white-space: nowrap` + `flex-wrap: nowrap` in the mobile override, and nothing above it clips horizontally.
  - Attempting a real click on 다음 timed out after 5s (Playwright `locator.click`) on both step1→step2 and step1(file)→step2 transitions. Diagnostic: the button's own bounding box was `x: -19.6, y: 744, width: 409.6, height: 100` — **partially off the left edge of the viewport** — and `document.elementFromPoint` at its center resolved to `<div class="slcn-trip-register-step">` / `<label class="slcn-file-dropzone__label">` instead of the button, i.e. another element visually stacked over it intercepted the click.
- **Recommendation**: Let the step-indicator pills wrap (drop the mobile-only `flex-wrap: nowrap` + `white-space: nowrap` override above a text-scale threshold, or switch to `clamp()`-based padding that shrinks the pill footprint as available inline space shrinks) so the row never forces the card past 100% width; add `overflow-x: hidden` or `min-width: 0` at the `.slcn-trip-register-wizard__card` level as a backstop.

### [P0] Same failure at 150% text scale
- **Location**: same as above.
- **Impact**: same as above, less extreme but still blocking.
- **Evidence**: `scrollWidth` = 504 vs `clientWidth` = 390 (diff **114px**) on step1 and step2, same `.slcn-card.slcn-trip-register-wizard__card` culprit (`right: 503`, `width: 479`). 다음 click again timed out and was intercepted by `<label class="slcn-file-dropzone__label">` at step1.
- **Recommendation**: same fix as above; verify at both 150% and 200% after the fix.

### [P1] Desktop wizard ignores DESIGN.md's container widths — 1116px single-line text input
- **Location**: `.slcn-shell-desktop__main` (`src/styles/components-pc.css:141-145`, `max-width: 77.5rem` = 1240px) and `.slcn-trip-register-wizard__card` (`src/styles/components-common.css:1756-1761`, no `max-width` of its own). Route `/main/map/register` @ 1440px.
- **Impact**: DESIGN.md (`/DESIGN.md:686-690`) defines three container widths — 760px (text), 1080px (standard), 1440px (wide) — and the wizard uses none of them. The card simply fills the shell, so a single-line text input stretches edge-to-edge.
- **Evidence**: At 1440px viewport: `.slcn-shell-desktop__main` width = 1240px (`max-width: 1240px`, confirmed via computed style). `.slcn-trip-register-wizard__card` bounding box = `{x:120, y:194, width:1200, height:647}`. The 나들이 이름 `<input>` bounding box = `{x:162, y:502, width:1116, height:44.5}` — a **1116px-wide single-line text field**.
- **Recommendation**: Cap the wizard card at DESIGN.md's `content-text` (760px) or `content-standard` (1080px) token so a one-line field doesn't force excessive eye travel; the file-dropzone/quiz-option grids can stay full-card-width if desired, but the plain text fields (나들이 이름, 버튼 1/2, 드라이브 링크, quiz title/answer text fields) shouldn't stretch past ~760-800px.

### [P3] `.slcn-file-dropzone__clear` sits exactly at the 44px touch-target floor with zero margin
- **Location**: `src/styles/components-common.css:2305-2322` (`.slcn-file-dropzone__clear`, `width/height: 2.75rem` = 44px exactly). Route `/mobile/map/register` @ 390px.
- **Impact**: Not a WCAG violation today (measured 44×44 exactly meets the 2.5.5 AA floor), but it has no slack — any future padding/border-box change silently drops it below 44px with no test currently guarding it.
- **Evidence**: measured bounding box `{x:294, y:633, width:44, height:44}`.
- **Recommendation**: Bump to 2.875rem (46px) to match the sibling controls' pattern (`보기 삭제` measured 46.48×46, `.slcn-trip-register-step__quiz-option > .slcn-button` sets `min-height: 2.875rem`) or add the same `::after` hit-area expansion used elsewhere in the file (`components-common.css:383-411`).

---

## Verified working

- **FileDropzone `min-width: 0` fix holds.** With the long Korean filename (`서울촌놈-부암동-지도-캡처-2026년-09월.png`) selected in 로고/지도1/지도2, `document.documentElement.scrollWidth === clientWidth` at every mobile width tested — 320, 360, 375, 390, 414, 430 — e.g. at 320px: `scrollWidth 320 / clientWidth 320`. No shrink-to-fit triggered.
- **320px step-indicator padding fix holds at 100% text scale.** At 320px, every state (step1/2/3 empty, all-errors, file-selected, 2번 지도 expanded, 6-quiz-options, 취소 dialog open) measured `scrollWidth === clientWidth === 320`. The regression only reappears under text-zoom (see P0 findings above, which is a distinct, previously-untested axis, not a regression of the same 100%-zoom bug).
- **No document-level overflow anywhere in the full width × state matrix at default (100%) zoom.** All of 320/360/375/390/414/430 (mobile route) and 768/1024/1280/1440/1920 (main route) returned `scrollWidth === clientWidth` for: step1/2/3 empty, all-errors-showing, file-selected (long Korean filename), 2번 지도 expanded, 6-quiz-options added, and 취소 dialog open. Full log: `full_output.log` lines 1-110.
- **Long text content does not break layout.** 120-char Korean string and 60-char unbroken 60-char Latin string (`AAAA…`, no spaces) filled into 나들이 이름 produced `document.documentElement.scrollWidth === clientWidth` at both 390px (mobile) and 1024px (desktop). The `<input>` itself scrolls internally as expected for a single-line text input (`inputScrollWidth: 957` vs `inputWidth: 274` at 390px for the Korean string; `900` vs `900`, no internal scroll needed, for the Latin string at 1024px) — this is normal native `<input>` behavior, not a bug; the page never grew past the viewport.
- **No hard-coded px text-container dimensions in the wizard's CSS.** Grepped every rule block under `.slcn-trip-register-*`, `.slcn-file-dropzone-*`, `.slcn-radio-group-*` in both `components-common.css` and `components-mobile.css`; the only `px` values present are 1-2px borders/hairlines, background-pattern strokes, and the intentional 44px touch-target minimums. All width/height/padding on actual containers use `rem`, which is consistent with the desktop route surviving 200% zoom cleanly (see below) — the mobile-only overflow is a `flex-wrap: nowrap` / `white-space: nowrap` layout constraint, not a units problem.
- **Desktop route survives 200% text scale.** At 1024px, `/main/map/register` step1/2/3 all measured `scrollWidth === clientWidth === 1024` with root font-size at 32px (200%). The step-indicator wraps normally there because it isn't forced `nowrap` outside the mobile shell override.
- **Radio inputs have an adequately large clickable area despite a small visual circle.** Raw `<input type="radio">` is 20×20px, but it's wrapped by `<label class="slcn-radio-group__option">`, measured `{width:146, height:54.5}` for both 아영/일권 options at 390px — well above 44×44.
- **Mobile top-bar back arrow's effective hit area meets 44×44 despite a 40×40 visible box.** `.slcn-mobile-topbar__leading` measured `{width:40, height:40}`, but `components-common.css:383-411` gives it a `::after` pseudo-element sized `max(100%, 44px)` under `@media (max-width: 640px), (pointer: coarse)` — exactly the pattern documented in the CSS comment ("the target grows behind them rather than the box growing"). Working as designed.
- **Touch targets on the mobile action row all clear 44×44**: 취소 `{48.2×50}`, 다음 `{243.8×50}`, 이전 `{79.9×50}`, 저장 `{151.9×50}`, 보기 추가 `{115.4×48}`, 보기 삭제 `{46.5×46}`. Adjacent spacing between 취소 and 이전 is 12px (91.2→103.2 x-gap), a workable gap.
- **Landscape phone (844×390, `isMobile: true`) survives.** `scrollWidth === clientWidth === 844` (no horizontal overflow). The action row sits at `y:638`, below the 390px-tall viewport, so it requires vertical scroll to reach — but the scroll + click was attempted for real (fill all step-1 fields, `scrollIntoViewIfNeeded`, click 다음) and **succeeded** with no exception.
- **취소 confirm dialog at 320×568 is fully on-screen and clickable.** With the form dirtied (so the dialog actually opens instead of navigating straight out), 나가기 measured `{x:217.5, y:496, width:77.5, height:48}` and 계속 쓸게요 `{x:94.6, y:496, width:110.9, height:48}` — both entirely within the 320×568 viewport. A real click on 계속 쓸게요 succeeded (dialog closed).

---

## Not measured

- **Text scaling at 150% (24px) for step 3 on mobile, and the entire 150% pass on the desktop route (1024px, step1/2/3).** The original sweep script was killed mid-run (after mobile step1/step2 at 150%) to avoid overrunning; step1/step2 at 150% already reproduce the same overflow pattern as 200% (same culprit, same click-block), so step3 very likely matches, but this was not independently confirmed. Desktop at 200% (the more extreme case) showed zero overflow, so 150% on desktop failing is unlikely but was not directly measured either.
- **Full 4-state (empty/errors/file/expanded) matrix under 150%/200% text scale** — only the "empty-ish, then filled to advance" path was exercised per step under scaling; the error and 2번-지도-expanded states were not separately re-tested at 150%/200% (though they add content in the same card, so they would only be equally or more prone to the same overflow, not less).

---

## Proposed score: 2 — works on mobile with rough edges

Default-zoom behavior (100%) is genuinely solid: every previously-shipped fix holds, the full width × state matrix (320–1920px, 8 states each) never overflows, touch targets clear 44×44, long content and long filenames are handled correctly, and landscape phone and the small-viewport dialog both work. But text reflow up to 200% — a baseline accessibility requirement, not an edge case — breaks the mobile wizard hard enough that the primary action button becomes unclickable via a normal click, which is a genuine P0. That single axis is what keeps this out of the 3-4 range; everything else audited is close to clean.

**Counts by severity**: P0: 2, P1: 1, P2: 0, P3: 1.
