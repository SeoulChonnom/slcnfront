# Trip Register Wizard — Performance & Theming Audit

Surface audited: `TripRegisterWizard.tsx`, `TripRegisterStepBasic.tsx`, `TripRegisterStepMaps.tsx`,
`TripRegisterStepQuiz.tsx`, `useTripRegisterForm.ts`, `FileDropzone.tsx`, `RadioGroup.tsx`,
`TextField.tsx`, `Button.tsx`, `Modal.tsx`, `ConfirmDialog.tsx`, `Card.tsx`, plus every CSS file
that is globally loaded and therefore reachable from this route
(`tokens.css`, `utilities.css`, `components-common.css`, `components-pc.css`,
`components-mobile.css`, `globals.css`).

Methodology: source reading for static claims (memoization, literal-token audit, event-listener
hygiene); Playwright (`chromium.launch()`, dev server at `localhost:5173`, logged in via the
documented dev account) for everything dynamic — keystroke latency, `sessionStorage.setItem`
cost (patched `Storage.prototype.setItem` via `context.addInitScript` before app boot),
`URL.createObjectURL`/`revokeObjectURL` balance, `requestAnimationFrame` frame-time sampling
during step transition and dialog open, and computed-style diffing between a `colorScheme:
'light'` and a `colorScheme: 'dark'` browser context. Border-width cascade resolution was
double-checked with a raw CDP session (`CSS.getMatchedStylesForNode`) because a source-level
specificity read and the rendered `getComputedStyle()` value disagreed (see THEME-P2-3). This is
a Vite dev server; no bundle-size or network-transfer numbers are quoted anywhere below.

---

## PERFORMANCE

### [P3] FileDropzone thumbnail has no `decoding` attribute
**Location**: `src/components/ui/FileDropzone.tsx:253-258`
**Category**: Performance
**Impact**: Negligible. `decoding="async"` would let the browser decode off the main thread, but
the thumbnail is a ~44px `object-fit: cover` image built from a local `blob:` URL the user just
picked — there is no network fetch to overlap with, and decode cost for a thumbnail this size is
sub-millisecond.
**Evidence**: `<img src={previewUrl ?? undefined} alt='' aria-hidden='true' className='slcn-file-dropzone__thumbnail' />` — no `loading` or `decoding` prop anywhere in the file (`grep -n "loading=\|decoding=" FileDropzone.tsx` returns nothing).
**Recommendation**: Optional `decoding="async"` for hygiene; `loading="lazy"` would buy nothing here since the element is already in the viewport the instant it renders. Not worth a dedicated change.

### [P3] Fonts are not preloaded; relies entirely on `font-display: swap`
**Location**: `src/main.tsx:3-4` (imports `pretendard/dist/web/static/Pretendard-Regular.css`, `-SemiBold.css`); `index.html` has no `<link rel="preload" as="font">`
**Category**: Performance
**Impact**: On a cold cache, Pretendard is discovered only after the JS module graph resolves and its CSS is fetched, so there is a window where fallback-font text is visible before swap. `font-display: swap` (confirmed in `node_modules/pretendard/dist/web/static/Pretendard-Regular.css:5`) is already the correct choice — it avoids invisible text (no FOIT) — so this is about first-paint polish, not a blocking bug. Not independently measured (would need cache-cleared network throttling); flagged from source only.
**Recommendation**: Not worth doing for a private two-user tool behind a login gate; low priority.

### [P3] One borderline dropped frame when the ConfirmDialog opens
**Location**: `src/styles/components-common.css:318` (`.slcn-modal-backdrop { backdrop-filter: blur(4px); }`)
**Category**: Performance
**Impact**: Negligible, one-time. Sampled `requestAnimationFrame` deltas for 800ms starting at the moment the 취소 button was clicked (opens `ConfirmDialog`): 92 frames, 1 frame at 25.4ms (vs. a 16.7ms budget), average 8.77ms. A single ~25ms frame during a dialog's opening paint is imperceptible; the blur is bounded (4px) and only active while the modal is mounted, not persistent.
**Evidence**: Measured via `requestAnimationFrame` sampling in-page (method used because CDP `Performance` domain trace parsing for actual dropped-frame classification adds more noise than it removes at this scale): `{"frameCount": 92, "droppedFrames_gt25ms": 1, "worstFrameMs": "25.40", "avgFrameMs": "8.77"}`.
**Recommendation**: None. Documented as a data point, not an action item.

---

### Verified working (Performance)

- **Draft-persistence `sessionStorage` write is not measurably costly.** Instrumented `Storage.prototype.setItem` before app boot and typed 100 characters into the "나들이 이름" field (each keystroke fires the effect in `useTripRegisterForm.ts:283-303`, which does `JSON.stringify` of the serializable form and writes it). Result: 100 `setItem` calls, total time 0.800ms, average 0.008ms/call, max 0.100ms. Total wall time for the 100 keystrokes (Playwright dispatch + React update + effect + write) was 189ms, so the write itself is ~0.4% of the per-keystroke cost. **Debouncing this write would buy nothing measurable and is not warranted.**
- **`FileDropzone` never leaks object URLs.** Instrumented `URL.createObjectURL`/`revokeObjectURL` globally and tested three scenarios: (1) selecting 4 files in a row into the same dropzone — 4 creates, 4 revokes, 0 leaked; (2) selecting a file then clicking the clear button — revoked correctly; (3) selecting a file then leaving the wizard via the in-app 취소 → 나가기 flow (a real React-Router client-side unmount, not a full page reload) — 1 create, 1 revoke, 0 leaked. The cleanup function returned from the `useEffect` in `FileDropzone.tsx:77-92` (keyed on `[file]`) fires correctly in every case because `onClear` and the parent's `onFieldChange(key, null)` both change the `file` prop reference, which re-triggers the effect and its prior cleanup.
- **No layout thrashing.** `grep -n "getBoundingClientRect\|offsetHeight\|offsetWidth\|offsetTop\|scrollTop\|scrollHeight\|clientHeight\|clientWidth"` across all 12 target files (wizard, 3 steps, hook, and all 7 UI components including `Modal.tsx`'s focus-trap code) returns zero matches. `Modal.tsx`'s `getFocusableElements` uses `querySelectorAll`, a DOM query, not a layout-property read, and only runs on open/Tab — not interleaved with any style write.
- **No `will-change` misuse anywhere in the app.** `grep -rn "will-change" src/styles/*.css` returns nothing — not scoped-broad, not left on at rest, because it's simply never used.
- **Every CSS transition reachable from this surface animates composited/paint-only properties.** Read every `transition:`/`animation:` block in `components-common.css` and `components-mobile.css` that could apply to this surface (buttons, cards, fields, checkboxes/radios, modal, file-dropzone clear button, calendar chip/toggle rules that share `.slcn-field`/`.slcn-button` base classes). Properties transitioned: `opacity`, `background-color`/`background`, `color`, `border-color`, `transform`, `box-shadow`. None animate `width`, `height`, `top`, `left`, `margin`, or `padding`. `backdrop-filter: blur(4px)` on `.slcn-modal-backdrop` (line 318) is not itself transitioned/animated — it's a static value applied only while the modal is mounted.
- **Step transitions are smooth.** Filled step 1, clicked 다음, and sampled frames for 1200ms starting at the click (covers the `useEffect`-driven `window.scrollTo({ top: 0, behavior: 'smooth' })` in `TripRegisterWizard.tsx:127-146`): 145-146 frames, 0 frames slower than 25ms, worst frame 10.4-17.0ms, average ~8.3ms. No jank.
- **Only the active step renders; hidden steps cost nothing.** `TripRegisterWizard.tsx:239` calls `activeStep.render(form)` for exactly one step — the other two `TRIP_REGISTER_STEP_CONFIGS` entries are never invoked while inactive. `TRIP_REGISTER_STEP_CONFIGS` itself is a module-level `const`, not recreated per render.
- **The lack of `useCallback`/`useMemo` in `useTripRegisterForm.ts` and the fresh object/array literals passed as props (e.g. the `options={[...]}` array literal in `TripRegisterStepBasic.tsx:73-76`, the mapped `options` array in `TripRegisterStepQuiz.tsx:177-180`) cost nothing measurably.** None of the 7 UI components in this surface (`TextField`, `RadioGroup`, `FileDropzone`, `Button`, `Modal`, `ConfirmDialog`, `Card`) are wrapped in `React.memo`, so a new prop reference never skips or forces an extra render that wouldn't have happened anyway — the child re-renders whenever its parent does, memoized or not. Per-keystroke measured wall time (Playwright round-trip, includes CDP + React + effect overhead) averaged 1.89-4.19ms across two separate runs, an order of magnitude under a 16.7ms frame budget, for a form with ~15 fields total and at most ~10 fields live on one step (quiz). **Adding memoization here would add code without a measurable benefit — correctly identified as a non-issue at this scale, not a gap.**

---

## THEMING

### [P2] Wrong-token use: danger button text reads `--color-canvas-pure`, not `--color-error-on`
**Location**: `src/components/ui/Button.tsx` → `.slcn-button[data-variant="danger"]`, `src/styles/components-common.css:66` — `background: var(--color-error); color: var(--color-canvas-pure);`
**Category**: Theming
**Impact**: `ConfirmDialog`'s confirm button (`confirmVariant='danger'` on the 나가기 action in `TripRegisterWizard.tsx:273-281`) uses this variant. `--color-error-on` is the token DESIGN.md §3 explicitly defines and verifies for on-fill text against `--color-error` (5.47:1 light, 5.36:1+ dark, per the documented semantic-triad table); `--color-canvas-pure` was never verified for that pairing — it happens to equal white in light mode (coincidence: both tokens are `#ffffff` there) but resolves to `#242124` (a dark surface colour) in dark mode, while `--color-error-on` there is `#1b1b1b`. The two tokens are not aliases of each other and diverge in dark mode.
**Evidence**: Computed dark-mode `color` on `.slcn-confirm-dialog .slcn-button[data-variant="danger"]` is `rgb(36, 33, 36)` (= `--color-canvas-pure`'s dark value `#242124`), not `rgb(27, 27, 27)` (= `--color-error-on`'s dark value `#1b1b1b`), against a `background-color` of `rgb(255, 107, 107)` (`--color-error` dark). Computed contrast works out to ≈5.74:1 by luminance, so this does not currently fail WCAG — it is a semantic wrong-token bug that happens not to have broken contrast yet, not a contrast bug itself.
**Recommendation**: Change `color: var(--color-canvas-pure)` to `color: var(--color-error-on)` on the danger button variant so the fill/text pairing is tied to the verified token instead of a coincidence.

### [P2] Wizard's field control drifts from the documented `text-input` spec: 46px/`border-strong`, not 48px/hairline
**Location**: `src/styles/components-common.css:1953-1956`
**Category**: Theming
**Impact**: `DESIGN.md:454` specifies `text-input: { minHeight: 48px, border: "1px solid {colors.hairline}" }`, and the base (non-wizard) `.slcn-field__control` rule at `components-common.css:112-120` matches it exactly (`min-height: 3rem` = 48px, `border: 1px solid var(--color-hairline)`). The wizard overrides both:
```css
.slcn-trip-register-wizard .slcn-field__control {
  border-color: var(--color-border-strong);
  min-height: 2.875rem;
}
```
This makes every text field in the wizard (date, name, drive link, quiz title/options/answer texts) 2px shorter and one border-shade darker than the spec and than the same control used elsewhere in the app (login page, search bar).
**Evidence**: Rendered computed style on the wizard's `.slcn-field__control`: `min-height: 46px`, actual `getBoundingClientRect().height: 47px` (border included), `border-top-width: 1px`, `border-top-color: rgb(234, 217, 223)` (= `--color-border-strong`, not `--color-hairline`'s `rgb(239,224,229)`… note border-strong is in fact darker as intended, this half of the override is a deliberate style choice, but paired with a height that undercuts the 44px touch-target floor by less margin and diverges from the documented control).
**Recommendation**: Either restate the 48px/hairline spec in the wizard override (drop the override entirely if the intent was just the darker border) or update DESIGN.md if 46px/border-strong is now the intended wizard-specific treatment — right now source and spec disagree with no comment explaining why.

### [P2] 1.5px border declared for wizard radio/dropzone renders as 1px — no visual distinction from the standard hairline
**Location**: `src/styles/components-common.css:1994-1998` (`.slcn-trip-register-wizard .slcn-radio-group--inline .slcn-radio-group__option { border-width: 1.5px; border-color: var(--color-border-strong); ... }`) and `:1969` (`.slcn-trip-register-wizard .slcn-file-dropzone__label { border: 1.5px dashed var(--color-border-strong); ... }`)
**Category**: Theming
**Impact**: The codebase's own comment on `--color-border-strong` (`tokens.css:47-50`) says it's "used where a dashed or load-bearing edge has to read on its own" — i.e. the 1.5px width is intentional, meant to visually distinguish this border from the app's normal 1px hairline. It does not: measured rendered `border-top-width` is `1px`, confirmed at both 1x and 2x `deviceScaleFactor`, i.e. this is not device-pixel rounding at a particular DPR — it reproduces identically at both.
**Evidence**: Confirmed via raw CDP `CSS.getMatchedStylesForNode` that the cascade *does* resolve `border-width: 1.5px` as the winning declaration for this element (highest-specificity matched rule, `.slcn-trip-register-wizard .slcn-radio-group--inline .slcn-radio-group__option`), yet `getComputedStyle(el).borderTopWidth` reports `"1px"` in both a `deviceScaleFactor: 1` and `deviceScaleFactor: 2` browser context. The declared value and the rendered used-value disagree; the visual result is indistinguishable from every other 1px-hairline border in the app.
**Recommendation**: If the intent is a visibly thicker border, use `2px` (a value Chromium will not snap away) instead of `1.5px`. If 1px is actually fine, drop the `border-width` override and the now-inaccurate "load-bearing" framing, since it isn't achieving anything at this width.

### [P3] 12 one-off spacing/sizing literals in wizard CSS, none matching the `--space-N` scale
**Location**: `src/styles/components-common.css` — `1538` (`padding: 0 1.625rem`), `1757` (`padding: 1.625rem`), `1796` (`gap: 0.5625rem`), `1798` (`padding: 0.5625rem 1rem`), `1876` (`gap: 1.125rem`), `1901` (`min-height: 2.875rem`), `1954` (`min-height: 2.875rem` — see the P2 above), `1962` (`font-size: 0.9375rem`), `1963` (`padding: 0.6875rem 0`), `1968` (`padding: 2.125rem`), `1995` (`padding: 0.9375rem 1.125rem`)
**Category**: Theming
**Impact**: Minor — `DESIGN.md` §16 rule 1 says "Reference design tokens instead of repeating literal values," and this is the wizard's CSS repeatedly not doing that. This is the *lesser* of the two possible findings the audit brief distinguishes: checked each value against the actual `--space-N` scale in `tokens.css:174-183` (`--space-1: 0.25rem` … `--space-6: 1.5rem`, `--space-8: 2rem`, `--space-10: 2.5rem`) and **none of these 7 distinct values (`1.625rem`, `0.5625rem`, `2.125rem`, `0.9375rem`, `1.125rem`, `0.6875rem`, `2.875rem`) has a matching token to have ignored** — they all fall between scale steps (e.g. `1.625rem` sits between `--space-6` (1.5rem) and `--space-8` (2rem); there is no `--space-7`). This is a token-scale gap, not a case of authors skipping a token that already existed.
**Evidence**: Values quoted above are read directly from source at the cited lines; the scale is quoted verbatim from `tokens.css:174-183`.
**Recommendation**: Low priority given the scale genuinely has no matching step. If this pattern recurs elsewhere, it's worth adding intermediate space tokens (`--space-7`, a `0.9375rem`/15px step) rather than continuing to hand-author values per-component.

### [P3] DESIGN.md §17's "no remaining raw colour literals outside tokens.css" claim is false, though not on the wizard's own visual surface
**Location**: `src/styles/components-common.css:737,750`, `src/styles/components-mobile.css:265` (all three: `var(--slcn-event-color, #fe9fc8)` — a calendar event-color fallback), `src/styles/utilities.css:7` (`linear-gradient(180deg, var(--color-primary) 0%, #f793c2 100%)` — the pink-mesh gradient end colour)
**Category**: Theming
**Impact**: These four literals are real counterexamples to the DESIGN.md §17 claim, and all four files are globally imported (`globals.css` → `utilities.css`/`components-common.css`/`components-mobile.css`, loaded on every route including the trip register wizard), so they are technically "reachable from this surface" per the audit brief's grep instruction. That said, none of them render as part of the wizard, its steps, or its dialogs — they belong to the calendar event-color feature and the app-header pink-mesh background respectively. Flagged for completeness against the specific documentation claim, not as a wizard defect.
**Evidence**: `grep -n -E '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' src/styles/*.css | grep -v color-mix` on the reachable files surfaced exactly these four (plus prose-comment matches that aren't live declarations). No raw colour literals were found in any of the 12 target TSX component files — `grep -n -E '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|style='` on all of them returns nothing.
**Recommendation**: Either tokenize `#fe9fc8`/`#f793c2` or soften the DESIGN.md §17 claim to name these two known, intentional exceptions.

---

### Verified working (Theming)

- **No raw colour literals or inline `style=` props anywhere in the 12 target TSX files.** Every colour on this surface goes through a CSS custom property.
- **Dark mode is themed correctly for essentially everything on the surface.** Captured computed `color`/`background-color`/`border-color` for 19 selectors spanning both steps' chrome, field labels/controls/inputs, the radio group, the file dropzone (label, icon, title, hint), error text, the wizard's action buttons, the card, and (separately) validation-error states and the `ConfirmDialog` (backdrop, dialog surface, title, description, both action buttons) in both a `light` and a `dark` browser context. 17 of 19 differ correctly between themes (e.g. wizard card: `#ffffff`/`rgb(239,224,229)` border in light → `rgb(36,33,36)`/`rgb(58,52,56)` border in dark). The 2 that are identical across themes are intentional per the adjacent CSS comments and DESIGN.md — the current-step indicator's Seoul Pink fill and the primary button's Seoul Pink fill are documented as deliberately theme-invariant (`components-common.css:1828-1837`: "this fill stays Seoul Pink in both themes — use --color-on-primary, the token already verified for text on this exact fill (9.03:1 in both themes)"). No element was found that stayed identical *without* such a documented reason — i.e. no un-themed element was found.
- **No un-verified contrast pairs found in the states actually checked.** The `--color-error`/error-surface/error-border triad used by validation errors and the file-dropzone error border renders with DESIGN.md's documented verified values in both themes (light `#c53030`, dark `#ff6b6b`).
- **Photographs and user-supplied colours** (the file-dropzone thumbnail image content, calendar event colours) are correctly out of scope per the audit brief and were not flagged.

---

## Scores

**Performance: 4** — Every dynamic behavior actually measured (draft-write cost, object-URL lifecycle, frame timing during step transition and dialog open, per-keystroke latency) came back clean, and every static check (transition property list, `will-change`, layout-property reads, re-render fan-out) confirmed no real cost at this scale. The three P3s found are genuine but sub-perceptible; nothing rises above that. This is a two-user private form and the implementation is already appropriately un-optimized in the places that don't matter (no premature memoization) and correctly careful in the places that do (object URL cleanup, composited-only transitions).

**Theming: 3** — The token system itself is comprehensive and dark mode parity is close to perfect across everything actually rendered on this surface, including error states and the confirm dialog. What pulls this off 4 is concrete: one real wrong-token bug (danger button text), one real spec-vs-implementation drift with no documented justification (46px/border-strong vs. the written 48px/hairline `text-input` contract), and one border-width value that doesn't render as authored. These are minor-hardcoded-value/inconsistency-class problems, not an absence of theming or a broken system, which is exactly the "3" band.

---

## Severity counts

- P0: 0
- P1: 0
- P2: 3 (all Theming)
- P3: 5 (3 Performance, 2 Theming)
