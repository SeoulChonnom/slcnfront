# Implementation Integrity Audit — 나들이 등록 위저드 (TripRegisterWizard)

## 1. Detector results

Raw run on the seven surface files:

```
node .claude/skills/impeccable/scripts/detect.mjs --json \
  src/domains/trip/components/TripRegisterWizard.tsx \
  src/domains/trip/components/TripRegisterStepBasic.tsx \
  src/domains/trip/components/TripRegisterStepMaps.tsx \
  src/domains/trip/components/TripRegisterStepQuiz.tsx \
  src/components/ui/FileDropzone.tsx \
  src/components/ui/RadioGroup.tsx \
  src/components/ui/TextField.tsx
→ []
```

URL mode was attempted per instructions:
```
node .claude/skills/impeccable/scripts/detect.mjs --json --viewport 1440x900 \
  "http://localhost:5173/main/trips/register"
→ Error: puppeteer is required for URL scanning. Install: npm install puppeteer
→ []
```
URL mode is **not usable at all** in this environment (no puppeteer installed) — it did not even reach the login-page redirect, it failed before navigating. So no URL-mode scan of any page (wizard or login) exists for this audit; the `[]` from URL mode is a tooling failure, not a clean scan of anything.

**Synthetic-file control experiment.** Wrote a file containing an inline `style={{ color: '#999999', transition: 'all 0.5s', fontSize: '9px', padding: '1px' }}` on a `<div onClick>`, plus Tailwind classes `text-gray-400 text-[9px] p-0`, saved to the scratchpad and scanned directly:
```
node .claude/skills/impeccable/scripts/detect.mjs --json <synthetic.tsx>
→ []
```
Confirmed. Root cause traced in `.claude/skills/impeccable/scripts/detector/engines/regex/detect-text.mjs`: for non-HTML/non-full-page sources the entire rule set is the 9 IDs found via `grep -oE "id: '[a-z0-9-]+'"`:
```
ai-color-palette, border-accent-on-rounded, bounce-easing, broken-image,
gradient-text, gray-on-color, layout-transition, overused-font, side-tab
```
There is **no** `low-contrast`, `tiny-text`, or `cramped-padding` rule anywhere in this engine — not "didn't fire," structurally absent. These are narrow AI-slop-pattern matchers (side-tabs, gradient text, overused Google fonts, bouncy easing, broken `<img>`, monochrome AI palettes), not general contrast/sizing/spacing auditors. A literal `color: '#999999'` inline style and a 9px Tailwind text size are simply not inputs any of these 9 rules look at. The page-level analyzers (`flat-type-hierarchy`, `monotonous-spacing`, `em-dash-overuse`, `marketing-buzzword`, `aphoristic-cadence`, `dark-glow`) exist but only run when `shouldRunPageAnalyzers()`/`isFullPage()` is true — a `.tsx` component fragment never qualifies.

**What the detector can/cannot see here:** it can catch a handful of visually-loud "AI slop" motifs if they appear as literal Tailwind classes, inline `style={{}}`, or CSS-in-JS template text. It categorically cannot see contrast, type size, padding, spacing rhythm, or anything expressed through this project's actual styling mechanism (external stylesheets keyed by BEM-ish `.slcn-*` classes + CSS custom properties) — because the CSS files were not included in the scan and the regex engine's DOM-dependent checks never run without a browser. A `[]` result here is uninformative about this codebase; the previous audit's conclusion is confirmed.

## 2. Integrity verdict

**PASS** — this is a coherent, largely product-specific system with one concentrated, quantifiable design-system-drift problem and several smaller, verified shortcuts. It is not interchangeable SaaS-onboarding filler: the quiz sub-system (`TripQuizModal.tsx`'s `RecordLock` open/closed-lock metaphor, "그날 남겨 둔 말" / "아직 잠겨 있어요" copy) is a genuinely distinctive mechanic that only exists because this product frames the nature-outing quiz as a message one partner leaves the other, and the register wizard is the authoring surface for exactly that content. Real engineering care is visible (mobile-320px pixel-budget fixes with dated rationale comments, deliberate WCAG-driven token substitution in the step indicator, `prefers-reduced-motion`-aware scroll, `beforeunload` + sessionStorage draft recovery). Against that: 34 CSS declarations across 12 rule blocks locally re-skin three shared primitives (TextField/FileDropzone/RadioGroup) to chase `docs/SeoulChonnom_Prototype.html` pixel-for-pixel, at the cost of 11 `biome-ignore` suppressions elsewhere in the same stylesheet — a real, measured departure from Implementation Rule 1, contained to this one surface.

## 3. Findings

### [P1] Design-system drift: wizard fully re-skins three shared primitives instead of extending them
**Location:** `src/styles/components-common.css:1936-2011` (block titled `/* ---- Register: match prototype field/dropzone/radio styling ---- */`), consumed by `TripRegisterStepBasic.tsx`, `TripRegisterStepMaps.tsx`, `TripRegisterStepQuiz.tsx` via `TextField`, `FileDropzone`, `RadioGroup`.
**Impact:** The wizard does not extend the app's shared field/dropzone/radio look — it silently replaces it. The base `FileDropzone` uses a brand-tinted dashed border (`color-mix(in srgb, var(--color-primary) 45%, ...)`, `components-common.css:2197-2198`) and a 45°, 1px/10px pink-tinted stripe (`:2205-2211`); the wizard override (`:1966-1979`) swaps in a flat gray dashed border (`var(--color-border-strong)`), a 135°, 10px/20px neutral stripe using `--color-stripe-highlight`, literal `padding: 2.125rem` (not on the `--space-*` scale: nearest tokens are `--space-8` = 2rem and `--space-10` = 2.5rem), and `min-height: auto` overriding the base `9rem`. The icon color changes from `var(--color-primary)` to `var(--color-icon-soft)`. The radio-group's checked state swaps `var(--color-primary)`/`var(--color-surface-soft)` for `var(--color-brand-pink)`/`var(--color-canvas)` — a documented "backward-compat alias" (`tokens.css:114-126`: "safe to leave as literals... mirror `--color-primary`") that new code is not supposed to reach for.
**Evidence:** `grep -c "^\s\+[a-z-]\+:\s" <lines 1936-2020>` = 34 declarations across 12 rule blocks. Separately, `grep -c "noDescendingSpecificity: base style defined after wizard context override"` = **11** — the base `FileDropzone`/`RadioGroup` rules (`:2181-2261`) each carry a lint suppression, and the comment at `:2252` states outright: *"The wizard restyles the dropzone, so its drag and error states have to be restated at the same specificity or the base rules never land."* That is a second, hand-maintained copy of the drag/error state rules that exists only because the override broke the file's normal base-before-consumer ordering.
**Recommendation:** Fold the prototype-matching values into either (a) new named variants on `FileDropzone`/`RadioGroup`/`TextField` (e.g. a `tone="neutral"` prop) driven by tokens, or (b) dedicated `--space-*`-aligned tokens if the prototype's spacing genuinely differs from the rest of the app — either removes the need for 11 specificity suppressions and stops this screen silently diverging the next time `--color-primary` or the dropzone stripe treatment changes elsewhere.

### [P2] `DESIGN.md` §15.4 is stale/incomplete against both `PRODUCT.md` and the shipped wizard
**Location:** `DESIGN.md:1267-1286` vs. `src/domains/trip/components/TripRegisterStepMaps.tsx`, `TripRegisterStepQuiz.tsx`, `TripRegisterWizard.tsx`.
**Impact:** Anyone using §15.4 as the spec for this screen gets an incomplete picture of what step 2 and step 3 actually require, and doesn't learn about entire UI elements a hardening pass added.
**Evidence:** `grep -n "드라이브\|나들이 이름\|버튼 1\|button1\|정답 제목\|answerTitle\|quizAnswerTitle" DESIGN.md` → **no matches**. Yet:
- Step 1 renders a required `나들이 이름` (`info2`) `TextField` (`TripRegisterStepBasic.tsx:92-100`) — unmentioned; §15.4 lists only "Logo image FileDropzone + trip type RadioGroup + date TextField."
- Step 2 renders a required `드라이브 링크` field, an optional `button1`/`button2` pair with map-tab-label hints, and a static drive-password hint (`TripRegisterStepMaps.tsx:123-156`) — unmentioned; §15.4 lists only two `FileDropzone`s.
- Step 3 renders four required text fields (`정답 제목`, `정답 텍스트`, `오답 제목`, `오답 텍스트`, `TripRegisterStepQuiz.tsx:193-230`) beyond the quiz question/options/answer §15.4 describes.
- The hardening pass added a `취소` cancel action + `ConfirmDialog` (`TripRegisterWizard.tsx:247-281`), a restored-draft notice with "이어서 쓰기"/"새로 쓰기" (`:208-237`), and file preview rows in `FileDropzone` (`FileDropzone.tsx:250-287`) — none reflected in §15.4's five-item outline.

These are two distinct gaps: `driveUrl`/`button1`/`button2`/quiz-copy fields are core `trip` data per `PRODUCT.md` ("드라이브 URL, 이전/다음 버튼 문구... 퀴즈") and were *already* missing from §15.4 before any hardening pass — that's stale documentation, a real finding, not implementation drift. The 취소/draft-notice/file-preview additions are genuinely new and functionally sound (they serve `PRODUCT.md`'s private-archive, don't-lose-my-writing concerns) but are undocumented scope growth on a surface the audit brief calls out specifically. Recommend updating §15.4 to reflect the actual five-plus-N field set and the three added elements, distinguishing "structural template" (what §15.4 already covers reasonably well) from "field inventory" (what it does not).
**Recommendation:** Update `DESIGN.md` §15.4 to list the full field set per step and add a line for cancel/draft-recovery/file-preview affordances so the doc stops undercounting what a "trip register wizard" conformant to this doc must include.

### [P2] Final `submit()` re-validates only step 3 — correctness depends on an unenforced navigation invariant
**Location:** `src/domains/trip/hooks/useTripRegisterForm.ts:478-501`, specifically `const nextErrors = validateTripRegisterStep(3, values);`
**Impact:** `validateTripRegisterStep` (`trip-validation.ts:61-163`) branches by step and only checks step-1 or step-2 fields when `step === 1`/`step === 2`. Calling it with `3` at final submit means logo/date/type/map1/drive/button1/button2 are **not re-checked** at the point of truth (the actual network call). Today this is safe only because `goNext()` (`:446-456`) gates every forward transition through `validateCurrentStep`, and step 1/2 fields are not editable while on step 3, so the invariant "steps 1–2 were valid when last visited" always holds by construction. But nothing asserts that invariant at `submit()` itself — the step indicator's `<li>` items already carry `data-state`/`aria-current` and read as a natural place a future change might add click-to-jump navigation (they don't today, confirmed no `onClick` on the `<li>`), at which point this silently stops being safe.
**Evidence:** `validateTripRegisterStep(3, values)` is the only call in `submit()`; no equivalent call for steps 1 or 2 exists anywhere in the submit path.
**Recommendation:** Either validate all three steps at submit time (`[1,2,3].map(s => validateTripRegisterStep(s, values))`, merged) or add a one-line comment at the `submit()` call site stating the invariant it relies on, so the next person touching step navigation doesn't break it silently.

### [P2] Focus-on-first-error boilerplate copy-pasted across all three step components
**Location:** `TripRegisterStepBasic.tsx:42-61`, `TripRegisterStepMaps.tsx:55-79`, `TripRegisterStepQuiz.tsx:91-100`.
**Impact:** Each step component independently declares 2-5 `useRef<HTMLInputElement>` refs and a `useEffect(() => { if (errors.X) { ref.focus(); return; } if (errors.Y) {...} ... }, [errorToken])` chain with the identical shape (sequential guard-and-return, keyed on a shared `errorToken` counter from the hook). This is the exact "same workaround copy-pasted across the three step components" pattern the brief asks to check for — the three components were written to one shared spec and converged on identical plumbing without ever factoring it out.
**Evidence:** Compare `TripRegisterStepBasic.tsx:42-61` (4 branches) and `TripRegisterStepMaps.tsx:55-79` (5 branches, plus `values.hasSecondMap &&` guards) — structurally the same function, hand-duplicated with a different field list each time.
**Recommendation:** Extract a `useFocusFirstError(errorToken, [[hasError, ref], ...])` hook shared by all three steps; removes ~45 duplicated lines and the risk of the three copies drifting (e.g. one step forgetting the `errorToken` dependency).

### [P3] Dead branch: restored-draft step restoration can never resolve to anything but step 1 for `draft.step > 1`
**Location:** `src/domains/trip/hooks/useTripRegisterForm.ts:263-278`, specifically `setStep(hasMissingFiles ? 1 : draft.step);`
**Impact:** `hasMissingFiles` is `Object.values(draftFileNames).some(Boolean)`. Reaching `draft.step === 2` or `3` at save time requires having passed `validateTripRegisterStep(1, values)`, which requires a non-null `values.logo` (`trip-validation.ts:80-84`); `values.logo` is never cleared by advancing steps, so `fileNames.logo` (persisted at every draft write, `:291-295`) is truthy whenever `draft.step > 1`. Therefore `hasMissingFiles` is always `true` whenever `draft.step` is 2 or 3, and the `: draft.step` branch of the ternary is unreachable except when `draft.step === 1` — where both branches already agree. This is a branch that cannot be reached, invisible to `knip` (which only tracks unused exports/files, not intra-function dead branches).
**Recommendation:** Either simplify to `setStep(hasMissingFiles ? 1 : 1)` → just `setStep(1)` when any file name was recorded (which is provably always, for step > 1), or restructure so restoring to step 2/3 is genuinely possible (e.g. only require re-picking the specific missing file rather than forcing back to step 1). Low priority; purely a clarity/dead-code issue, not a behavior bug.

### [P3] `FileDropzone` hint text undersells the file types actually accepted, on all three dropzones
**Location:** `TripRegisterStepBasic.tsx:104` (`hint='PNG · JPG · 최대 10MB'`), `TripRegisterStepMaps.tsx:83-93` and `:112-122` (no `hint` prop → falls back to `FileDropzone`'s default `hintText = hint ?? 'PNG · JPG · 최대 10MB'`, `FileDropzone.tsx:71`).
**Impact:** All three dropzones set `accept='.jpg,.jpeg,.png,.gif,.svg'` and are validated against `IMAGE_EXTENSIONS = ['jpg','jpeg','png','gif','svg']` / matching MIME types (`trip-validation.ts:8-14`), so GIF and SVG files are genuinely accepted and will pass validation — but the hint visible to the user only ever says "PNG · JPG". The label undersells what the data model (and the file picker's own `accept` filter) actually allows.
**Evidence:** `accept='.jpg,.jpeg,.png,.gif,.svg'` appears 3 times (logo, map1, map2); the visible hint text is `'PNG · JPG · 최대 10MB'` in all 3 cases, either explicit or via the component default.
**Recommendation:** Either widen the hint to `'PNG · JPG · GIF · SVG · 최대 10MB'` or narrow `accept`/`IMAGE_EXTENSIONS` to match what the hint promises, so the two stay truthful to each other.

### [P3] Lone Tailwind utility class inside an otherwise token/CSS-class-only design system
**Location:** `src/components/ui/RadioGroup.tsx:70`, `<input ... className='mt-1' .../>`.
**Impact:** Minor but real: this is the only place in `src/components/ui/*.tsx` or `src/domains/trip/components/*.tsx` using a raw Tailwind utility class (confirmed via `grep -rEn "className=['\"][a-zA-Z0-9 _-]+['\"]" ... | grep -vE "slcn-|cn\("` → zero other hits). Every other spacing decision in these files goes through the `.slcn-*` stylesheet. It works (Tailwind is loaded via `@import "tailwindcss"` in `globals.css`), but it's an inconsistent, easy-to-miss styling channel on a component every step of the wizard renders.
**Recommendation:** Move the top-margin into `.slcn-radio-group__option input` in the stylesheet, matching how every sibling spacing rule in this file is expressed.

### [P3] `submitError` returned by the hook is never read outside the hook itself
**Location:** `src/domains/trip/hooks/useTripRegisterForm.ts:512` (`submitError: mutation.error` in the returned object) and `:504` (`deriveSubmitErrorMessage(mutation.error)` already derives everything consumers need).
**Impact:** `TripRegisterWizard.tsx` only destructures/uses `form.submitErrorMessage`; a repo-wide `grep -rn "\.submitError\b" src/ | grep -v submitErrorMessage` returns nothing. `knip` does not see this because it is a property on an object literal returned from a hook, not a module export.
**Recommendation:** Drop `submitError` from the returned object, or if it's meant for future error-code branching in a consumer, leave a comment saying so.

### [P3] `nextButtonText`/`previousButtonText` API field names carry stale semantics inherited from the API contract
**Location:** `src/domains/trip/mappers/trip-mappers.ts:113-119` (`toOptionalTrimmedEntry('nextButtonText', values.button1)`, `toOptionalTrimmedEntry('previousButtonText', values.button2)`).
**Impact:** The wizard's own field semantics are internally consistent (`button1`/`button2`, hinted as "지도 1/2를 여는 탭 이름" — map-tab labels, matching how `TripDetailSection.tsx:33-34` actually consumes them via `TripMapSwitcher`). But the wire payload keys them as `nextButtonText`/`previousButtonText`, which reads as "previous/next navigation" — matching `PRODUCT.md`'s own description of a trip record ("이전/다음 버튼 문구") but not what the field is actually used for anywhere in this codebase (a map-tab switcher, not prev/next trip navigation). This is legacy/API-contract naming, not something the wizard hardening pass introduced, but it is a genuine "label whose words do not match the data model" instance inside an in-scope file (`trip-mappers.ts`).
**Recommendation:** Out of scope to rename without an API contract change; flag for `docs/api_spec.json` reconciliation, and consider a one-line comment at the mapping site noting the semantic gap so a future reader isn't misled by the field name.

## 4. Verified working

- **Step indicator (`DESIGN.md` §15.4 item 2) is well conformant and thoughtfully deviates where the spec is wrong.** `components-common.css:1819-1826` explicitly documents why "complete" steps use `--color-accent-muted` rather than the literal `{colors.primary}` §15.4 calls for: raw Seoul Pink as text on the pale complete-state fill fails 4.5:1 contrast, and the substitute is "the token verified for exactly that pairing (DESIGN.md 3)." This is a deliberate, cited, correctness-driven deviation from the written spec — the opposite of undisciplined drift.
- **Mobile layout was genuinely validated, not just declared (Implementation Rule 7).** `components-mobile.css:600-633` carries a dated comment: *"At 320px the three nowrap pills exceeded min-content and pushed the whole document past the viewport. Tightening the inline padding buys back the ~18px..."* — evidence of an actual narrow-viewport pass, not copy-pasted boilerplate.
- **Motion is reduction-aware (Implementation Rule 6).** `TripRegisterWizard.tsx:138-145` checks `window.matchMedia('(prefers-reduced-motion: reduce)')` before choosing `smooth` vs `auto` scroll behavior on step change.
- **Semantic error color discipline (Implementation Rule 9) holds.** `.slcn-trip-register-step__error`, `.slcn-radio-group__error`, `.slcn-file-dropzone__error` (`components-common.css:2013-2020`) all use `var(--color-error)`, never brand pink.
- **Quiz option vocabulary is now consistent end-to-end**, confirming the hardening-pass rename landed cleanly. `TripRegisterStepQuiz.tsx` labels are `보기${index+1}` (:115-116), the hint text says "보기는 N개에서 M개까지..." (:71) and "모든 보기를 입력해 주세요." (`trip-validation.ts:142`), the aria-labels say "보기N 삭제"/"보기 추가" (:137, :151), and the payload (`trip-mappers.ts:71-74`) uses a generic `text`/`originalIndex` shape with no `정답N` residue anywhere in this path.
- **State is single-sourced, not parallel.** All three step components receive `Pick<TripRegisterWizardValues, ...>` / `Pick<TripValidationErrors, ...>` slices from one `useTripRegisterForm` hook; there is no local component state duplicating form values, so the "parallel state that could drift" risk the brief asks about does not materialize here.
- **`ConfirmDialog` is a real shared primitive, not a wizard-local one-off.** `ConfirmDialog.tsx` wraps `Modal`, is used generically (`confirmVariant` defaults to `'danger'`), and the leave-confirmation copy in `TripRegisterWizard.tsx:274-280` is specific and honest about what is/isn't recoverable ("지금까지 고른 파일은 사라져요... 적어 둔 글은... 다시 들어오면 이어서 쓸 수 있어요") rather than generic "are you sure?" boilerplate.
- **Product specificity is real and, if anything, understated by the wizard's own field labels.** Beyond the previously-identified AYO/RYU radio (`TripRegisterStepBasic.tsx:74-75`, real names of the two users) and drive-password hint (`TripRegisterStepMaps.tsx:154-156`, confirmed to match the literal "암호 🔒 : 입사일" rendered in `TripDetailSection.tsx:61`), the quiz sub-system this wizard authors into is genuinely distinctive: `TripQuizModal.tsx`'s `RecordLock` component (an SVG lock whose shackle position — not color — carries the quiz outcome) and copy ("그날 남겨 둔 말" / "아직 잠겨 있어요") frame the outing quiz as a message one partner leaves for the other to unlock, directly matching `PRODUCT.md`'s "퀴즈가... 기록이 상대에게 남기는 메시지 역할까지 한다." The register wizard's own form fields (`정답 제목`/`정답 텍스트`/`오답 제목`/`오답 텍스트`) read as generic labels in isolation, but they are exactly what feeds that specific downstream mechanic — so "category-interchangeable" is no longer an accurate characterization of the feature as a whole, even though the wizard's authoring UI alone still looks like a plain multi-field form.

## 5. Proposed score

**2 / 4** — several verified issues (1 P1 concentrated design-system drift + 3 P2s + 5 P3s), but the system is coherent and demonstrably product-specific where it matters (quiz lock metaphor, real names, mobile-tested step indicator, reasoned token substitutions). Not systemic drift (0) and not major repeated functional failures (1) — the drift is real but bounded to one CSS block plus a handful of small, independently-fixable shortcuts, none of which are user-facing breakage today.
