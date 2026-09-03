---
target: 여행 등록 화면 (모바일/PC)
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 3
timestamp: 2026-09-01T00-41-32Z
slug: omains-travel-components-travelregistersection-tsx
---
Method: dual-agent (A: design review · B: detector/browser evidence)

Target: `src/domains/travel/components/TravelRegisterSection.tsx` → `/main/travel/register` · `/mobile/travel/register`
This is the TRAVEL (여행) register screen, not the trip/나들이 wizard.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 1/4 | Submit always fails with 400; screen has no idea. Duration reads "1박 2일" with no dates entered |
| 2 | Match System / Real World | 3/4 | 박/일 phrasing and category vocabulary are natural. "Day 1" English; native "연도. 월. 일." date placeholder |
| 3 | User Control and Freedom | 1/4 | Touching any date wipes every entered place. No undo, no draft, no exit confirm |
| 4 | Consistency and Standards | 2/4 | `*` means different things per field. Shared `Button` honors 44px; this screen's own controls all ignore it |
| 5 | Error Prevention | 1/4 | Destructive rebuild is unguarded. end<start only caught on submit |
| 6 | Recognition Rather Than Recall | 3/4 | Day/date/number always co-displayed. But 8 chips per place |
| 7 | Flexibility and Efficiency | 2/4 | No reorder, collapse, or duplicate. Save button not sticky on a form thousands of px long |
| 8 | Aesthetic and Minimalist Design | 2/4 | Two huge pink dropzones dominate a "quiet editorial" system. Half the sections are cards, half aren't |
| 9 | Error Recovery | 1/4 | The only reachable error is unrecoverable — doing what it says fails identically |
| 10 | Help and Documentation | 2/4 | Hints exist, but the most important hint is false |
| **Total** | | **18/40** | **Needs significant work** |

## Design Specificity Verdict

A schema-shaped CRUD form wearing the right palette. Label+input card, two near-identical file dropzones, a category chip picker that belongs in any admin tool, a mechanical "Day N" repeater. Nothing signals a private record of a trip two people actually took. Swap the Korean strings for English and it is indistinguishable from a generic itinerary admin form. The one line where the product's own voice appears — "대표 사진… 반드시 등록해야 저장할 수 있어요" — is exactly the promise the implementation breaks.

Deterministic scan: CLI detector exited 0 with ZERO findings on both invocations. The defects here arrive through a wrong token CHOICE, not hardcoded literals, which the detector structurally cannot catch. The type ramp genuinely is clean (no literal px font sizes in 607 lines of CSS). The problem is colour, not size.

Browser overlay: injection succeeded, live-server on 8400 started and confirmed stopped. Overlay independently reproduced `low-contrast 2.3:1 — text #ff7fb8 on #ffffff`.

## Overall Impression

This screen is not under-designed; it does not work. The biggest opportunity is not visual — it is making the screen do what it says it does. Second is closing the gap between the app's two authoring surfaces.

## What's Working

1. Focus ring is correct. Live-measured `rgb(163,79,109)` = `#A34F6D` = `--color-focus-ring`. The global rule at `globals.css:58` satisfies DESIGN.md §13 with zero page-specific special-casing — unlike login and the trip wizard, which both needed overrides.
2. Type ramp discipline. Zero literal px font sizes across 607 lines of `travel-register.css`; measured 13/14/16/18/24px all sit on the ramp.
3. No horizontal overflow at 1440/768/390/320px (`scrollWidth === clientWidth`). Pretendard verified actually loaded via `document.fonts.check` → true (not a repeat of the Inter incident).

## Priority Issues

### [P0] The travel register cannot save a single record

There is NO upload code anywhere in `src/domains/travel/` — only the comment at `TravelRegisterSection.tsx:28` ("Photo uploads are not wired yet"). `buildTravelDays` (L31-52) hardcodes `photos: []`; `handleSubmit` (L122-168) never reads `coverPhotoFile`. The server requires a cover image: live submit returned `400 AppError: 여행 대표 이미지는 1개여야 합니다`.

Why it matters: the user picks photos, takes the echoed filename as confirmation, saves, and hits an error they cannot diagnose. Doing what the error says changes nothing. There is no recovery path at all. In a product whose PRODUCT.md says "기록이 주인공이다. UI는 사진과 글을 담는 액자", the frame is discarding the photographs.

Fix: wire all three dropzones to the asset upload API (`/assets/files`) and block submit until upload resolves. If that cannot land this cycle, remove the false copy and hide the photo UI so users stop doing work that is thrown away.

Suggested command: `/impeccable harden`

### [P0] Editing a date destroys every place already entered

`updateStartDate`, `updateEndDate`, `incrementDuration` and `decrementDuration` all call `buildDayRows`, which returns fresh rows with `places: []` and replaces the array wholesale (`useTravelRegisterForm.ts:50-85, 189-207, 292-320`). Assessment A reproduced it live: typed a place name and memo into Day 3, clicked `−` once, and it vanished with no dialog and no undo (`pc-09-silent-day-delete.png`).

The real blast radius is wider than A reported: not just decrement — correcting a typo in the START date, or extending the end date by one day, wipes days 1..N as well. Filling in three days and then noticing the start date is off by one is the single most likely scenario on this screen.

There is also no draft persistence, so a refresh or a back-navigation loses everything. The trip wizard has sessionStorage draft recovery ("이어서 쓰기"/"새로 쓰기"); this much longer form has none.

Fix: make `buildDayRows` merge by date key and preserve existing `places`. Confirm only when a day that actually has content is about to be dropped. Reuse the trip wizard's draft pattern.

Suggested command: `/impeccable harden`

### [P1] The required asterisks lie

`pc-05` captures this in one frame: on empty submit, 제목/시작일/종료일 show red errors while 지역 and 대표 사진 — carrying an identical `*` — pass silently. `TravelRegisterFormErrors` has no `region` key (`useTravelRegisterForm.ts:32-37`), `validateForm` (L120-142) checks neither region nor photo, and `TravelRegisterForm.tsx:61-67` does not even pass an `error` prop.

In the same card, while both date fields display "선택해 주세요" errors, the duration row reads "1박 2일". One card contradicts itself. In that state the `+` button is dead — `incrementDuration` starts with `if (!prev.startDate) return prev`.

Fix: either validate 지역 and 대표 사진, or drop their asterisks — one or the other. Render duration as "—" with the stepper disabled until both dates exist.

Suggested command: `/impeccable clarify`

### [P1] Three upload controls are keyboard-unreachable, and the accent colour fails contrast

Keyboard: 대표 사진, 사진 앨범, and each day's 대표 사진 are all a `<label>` wrapping a `display: none` file input (`travel-register.css:301, 556`). `display:none` removes the input from the tab order entirely, so there is no focus stop at all. DESIGN.md §13's "Visible Control Rule" addresses exactly this failure class and the trip wizard fixed it with `:has(… :focus-visible)`; this screen re-rolled its own dropzone instead of using the shared `slcn-file-dropzone`.

Contrast: `travel-register.css` uses `--color-primary-focus` (#FF7FB8) as a TEXT colour in six places (L136, 191, 251, 285, 546, 571). Measured 2.23–2.34:1 against 4.5:1 required. `tokens.css:15` itself documents this value as "2.23/2.34/2.01:1" and says not to use it; the correct token is `--color-accent-muted` (#A34F6D, 5.14:1). One victim is "+ 장소 추가" — the only route to entering a day's actual content, rendered as the faintest, smallest thing in the card, reading like a disabled hint.

Fix: replace the dropzones with the trip wizard's `slcn-file-dropzone` pattern; swap the six text usages to `--color-accent-muted`.

Suggested command: `/impeccable audit`

### [P1] PC never got a layout; mobile got the wrong shell

PC: `TravelRegisterSection`'s `device` prop is used only to build navigation paths and has ZERO effect on layout. At 1440px it is still one 720px column with ~360px dead on each side (`pc-01`). A single `@media (max-width: 600px)` block is the entire responsive story. DESIGN.md's `content-standard: 1080` and `page-gutter-desktop: 48px` are unused. PRODUCT.md principle 4 says neither device path is a byproduct.

Mobile: `mobile-routes.tsx:27` maps `tripRegister: 'detail'` but OMITS `travelRegister`, so it falls through to the default `MainMobileShell`. `mob-01` shows the result: the top bar says "새 여행" and the page then renders `<h1>새 여행 기록하기</h1>` — the title appears twice; the top bar carries a profile avatar instead of a back arrow, so the page bolts on its own "‹ 돌아가기"; and a five-tab bottom nav sits under a long authoring form, one tap from discarding everything with no draft.

Assessment A scored this as a STRENGTH ("mobile gets real device-specific chrome"). That is wrong. The chrome is a default fall-through caused by a missing mapping, and the sibling 나들이 등록 deliberately takes `DetailMobileShell` and avoids all three problems. Physical overlap is correctly prevented by `bottom-spacer` (6rem) — that part is fine.

Also: the shell (`padding: 1rem`) and the section (`padding: 1.25rem 1rem 3rem`) both apply horizontal gutters, so effective content width at 390px is 326px against the system's `page-gutter-mobile: 20px`.

Suggested command: `/impeccable adapt`

## Cognitive Load

- Single focus — FAIL. Metadata + cover photo + N days × M places + album + tags in one unbroken scroll.
- Chunking (<=4) — FAIL. 8 category chips per place; 16 on screen with two places (`pc-04`).
- Visual grouping — PASS. Day cards and place rows are clearly bounded.
- Visual hierarchy — PARTIAL. Section titles are 16px against 15px body; h2 sinks into the paragraph.
- One thing at a time — FAIL. No staging.
- Minimal choices (<=4) — FAIL. Same 8-chip picker, repeated per place.
- Working memory — PARTIAL. Day cards self-label with their date, so no cross-screen recall; but the content about to be deleted cannot be previewed.
- Progressive disclosure — FAIL. All N day cards fully expanded, no collapse. A 7-day trip yields 7 cards.

## Emotional Journey

- Valley (reproduced live): a fully written day disappearing without confirmation. The one emotionally large moment on this screen has zero reassurance.
- No peak: picking a file only changes a filename string. No thumbnail preview, so no visual reward for effort spent.
- End failure: saving never succeeds, so there is no ending. PRODUCT.md's success definition ("다시 열었을 때 그날이 되살아나는 것") is unreachable.

## Persona Red Flags

One-handed logger just back from a trip (mobile): 26-34px chips and a 28px remove button are hard to hit; one mis-tap on the duration stepper erases a day.

Someone fixing a date typo: the most common edit on this screen causes the largest loss.

Keyboard / screen-reader user: the three upload controls take no tab stop. 시작일/종료일 lack the HTML `required` attribute, marked only by an `aria-hidden` asterisk. The tag input has no label at all — while the same domain's `TravelTagSection` correctly carries `aria-label='태그 추가'`.

Partner A (logging late at night before the memory fades): the per-place memo is a single-line `<input type="text">`, not a textarea (`TravelDayEditor.tsx:93-110`). A real sentence gets trapped on one line — undersized for the emotional job the field is meant to do.

Partner B (reopening weeks later to relive it): was given a reason to believe photos were attached (the echoed filename); they were never sent.

## Minor Observations

- At 200% text zoom on 390px, `scrollWidth 486 > 390` — the duration stepper's `+` leaves the screen. At 320px the duration helper text wraps to one character per line. Two independent measurements point at the same component.
- At the default 390px size the duration helper already breaks to four lines (`mob-01`) — broken before any zoom is applied.
- Places with empty names are silently dropped by `buildTravelDays`, with no notice.
- Day cards start with zero place rows, so a 3-day trip produces three empty cards that only say "add something".
- The tag "추가" button (`size='sm'`) does not match the input's height.
- The save button is not sticky, while submit errors render at the very top of the page — the click point and the feedback point are thousands of px apart, with no focus move to the first error.
- Section subtitles, tag chips and day-photo labels use `--text-nav` (13px, line-height 1.0 — a navigation token) for paragraph text.
- Dropzone and stepper borders are `1.5px`, outside DESIGN.md's two-step border system.
- `/api/users/me` returns 401 on load on both routes (does not look specific to this screen; worth a separate look).
- "Day 1" puts English into an otherwise fully Korean colloquial product.

## Not Verified

- A successful save round-trip. Login points at a live API, so no throwaway records were written into what may be the real account. The "photos are never sent" conclusion rests on the live 400 plus source (no upload code, hardcoded `photos: []`), not on a contrast with a working success case.
- Edit mode (`여행 수정`) loading/error states and multi-file album picker behaviour.
- Upload failure states (oversized / wrong type) — no such path exists in source to trigger.
- Dark mode — not yet switched on per DESIGN.md.
- Touch-target numbers come from a 390x844 viewport, not a touch-emulated device profile (the measurements themselves remain valid).
- Assessment B measured touch targets on the EMPTY form, so chips, place-remove and tag-remove are absent from its list. Those figures (chips ~20-26px, place remove 28px, tag remove 16px) are read from CSS.
