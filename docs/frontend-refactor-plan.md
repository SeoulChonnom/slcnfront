# Frontend Refactor Progress

## Goal
React + Vite + TypeScript frontend refactor, test, and E2E verification.

## Current Status
- [x] Explore
- [x] Baseline verification
- [x] Plan
- [x] Step 1: `strict: true` 적용 (probe 0 errors → 즉시 적용, tsc+235 tests PASS)
- [x] Step 2~4: 중복 제거 완료 (formatDisplayDate / parseOrThrow / useAssetObjectUrls)
- [x] Step 5: useTravelRegisterForm 특성화 테스트 — `src/domains/travel/hooks/__tests__/useTravelRegisterForm.test.ts` 신규, 31 tests PASS (region 미검증·decrement 0박 floor 등 현재 동작 주석과 함께 고정)
- [ ] Implement
- [x] Typecheck
- [x] Lint (Biome)
- [x] Unit/Component Test (62 files / 266 tests)
- [x] Build
- [x] E2E (10/10 flows)
- [x] Fresh Review (APPROVE, 이슈 0건)
- [x] Final Report — 완료 (2026-07-02)

## Remaining Risks / Follow-ups
- `pnpm lint`(eslint)는 flat config 부재로 baseline부터 실패 — eslint.config 추가 또는 스크립트를 Biome으로 교체 필요 (후속 과제)
- 모든 페이지에서 발생하는 400 백그라운드 요청 — 기존 동작, 원인 조사 권장 (후속 과제)
- knip baseline 18건(미사용 travel export/파일) — travel 기능 진행에 따라 정리 (후속 과제)
- `useTravelRegisterForm` 실제 분리(#5), TravelRegisterForm DateField/FileDropzone 추출(#6), CalendarSection 훅 추출(#10), files API 통합(#9) — Out of Scope로 이월. 이번에 추가한 특성화 테스트 31개가 #5의 안전망이 됨
- E2E 스크린샷은 세션 scratchpad(`.../scratchpad/e2e/`)에 저장 — 세션 종료 시 소멸될 수 있음

## Environment Baseline
- Branch: `feature/travel` (origin 대비 3 commits ahead), 작업 트리 clean (untracked: `.antigravitycli/`, `.sisyphus/`)
- Baseline commit: `b6b9605` (feat: vite proxy 추가)
- Package manager: **pnpm** (pnpm-lock.yaml, pnpm-workspace.yaml)
- Node: 24 (AGENTS.md 기준)
- Scripts:
  - `pnpm dev` — Vite dev server (현재 5173 포트에서 실행 중, 로그인 id/pw: `string`/`string`)
  - `pnpm build` — `tsc -b && vite build`
  - `pnpm lint` — ESLint
  - `pnpm test` — Vitest run
  - `pnpm knip` — unused 검사 (기존 known 항목 있음)
  - 별도 typecheck 스크립트 없음 → `pnpm exec tsc -b` 사용
- Stack: React 19, react-router-dom 7, TanStack Query 5, Zustand 5, Tailwind 4, zod 4, dayjs, FullCalendar
- Test: Vitest 4 + @testing-library/react + jsdom + msw (setup: `src/test/setup.ts`)
- Formatter/Linter: Biome (`biome.json`) — 완료 전 `npx @biomejs/biome check --write src/` 실행 필요

## Baseline Verification (변경 전, 2026-07-02)
| Step | Command | Result | Notes |
|---|---|---|---|
| Typecheck | `pnpm exec tsc -b --force` | PASS | ~3.4s |
| Lint | `pnpm lint` (eslint .) | **FAIL (pre-existing)** | `eslint.config.*` 없음 — baseline부터 깨져 있음. 실질 lint는 Biome |
| Lint (Biome) | `npx @biomejs/biome check src/` | PASS | 244 files, 0 diagnostics |
| Test | `pnpm test` | PASS | 61 files / 235 tests |
| Build | `pnpm build` | PASS | 경고 없음. vendor 357.69kB(gzip 110), fullcalendar 270.23kB(gzip 79.9) |
| Knip | `pnpm run knip` | exit 1 (known) | 18 findings — 아래 baseline 목록 |

### Knip baseline (18 findings — 기존 known, 새로 추가되는 것만 이슈로 취급)
- Unused files (2): `src/domains/travel/components/AddPhotoModal.tsx`, `AddPlaceModal.tsx`
- Unused exports (11): travel-schemas.ts 5개(travelPhotoCdo/travelReviewUdo/travelPlaceUdo/travelDayUdo/travelPlaceCdo), usePutTravel, travel-mappers.ts 5개
- Unused exported types (5): FileBoxItem, TravelPhotoCdo, TravelReviewUdo, TravelPlaceCdo, TravelTagCdo (`src/domains/travel/types.ts`)

## Explore 결과 요약 (frontend-explorer)
구조: `/main/*`, `/mobile/*` 이중 네임스페이스 SPA. 전 라우트 React.lazy + Suspense 적용됨. Auth는 Zustand(phase 상태머신) + 세션 복원만 TanStack Query. 도메인: auth/trip/calendar/shoes/travel(최신, 이 브랜치).

### 리팩토링 후보 (위험도/크기)
1. blob object-URL 훅 중복 — `useTripAssetObjectUrls` vs `useTravelAssetObjectUrls` 88줄 동일 → `src/lib/hooks/`로 제네릭 추출 (LOW/S)
2. `formatDisplayDate` 중복 — `TravelDayEditor.tsx`에 private 복사본 → travel-mappers import (LOW/XS)
3. `parseXxxResponse` safeParse 보일러플레이트 4개 스키마 파일 반복 → `parseOrThrow` 헬퍼 (LOW/S)
4. `HomeHubPage`(352줄) desktop/mobile 트리 중복 — NAV_ITEMS config 추출 (LOW/M)
5. `useTravelRegisterForm`(302줄, 테스트 없음) 관심사 혼재 → 분리 (MED/M)
6. `TravelRegisterForm`(393줄) inline SVG/필드 중복 → DateField/FileDropzone 추출 (MED/M)
7. tsconfig.app.json `strict: true` 미설정 (MED/M)
8. `TravelDetailSection` no-op 콜백 스텁 → TODO 주석 (LOW/XS)
9. `/assets/files/:fileId` 다운로드 API trip/travel 중복 (LOW/S)
10. `CalendarSection`(314줄) 매니저 상태 인라인 → 훅 추출 (MED/M)

### 위험 파일 (신중히)
auth-store.ts, AuthBootstrap.tsx, SessionRestoreBootstrap.tsx, guards.tsx, lazy-route-pages.tsx, route-manifest.tsx

### 테스트 갭
useTravelRegisterForm(핵심), useTravelList/Detail, TravelListSection/DetailSection/DayEditor, useTripRegisterForm 위저드, travel 페이지 스모크

## Approved Plan (frontend-architect, 2026-07-02)

### Scope
- [x] Step 1: strict probe → 0 errors → `tsconfig.app.json`에 `"strict": true` 적용 (검증: tsc-b PASS, 235 tests PASS)
- [ ] Step 2: `TravelDayEditor.tsx`의 private `formatDisplayDate` 제거, travel-mappers에서 import
- [ ] Step 3: `src/lib/api/errors.ts`에 `parseOrThrow` 헬퍼 추가, 4개 `*-schemas.ts`의 safeParse 보일러플레이트 치환 (context 문자열·export 시그니처 보존)
- [ ] Step 4: `src/lib/hooks/useAssetObjectUrls.ts` 제네릭 훅 추출, trip/travel 훅은 thin wrapper로 (이름·시그니처·테스트 보존)
- [ ] Step 5: `useTravelRegisterForm` 특성화 테스트 신규 작성 (프로덕션 코드 변경 없음)

### Out of Scope (후속 과제)
- #4 HomeHubPage NAV_ITEMS 추출 — 아키텍트 검증 결과 실제로는 완전 중복 아님(클래스/SVG 크기/카피/Film 처리 상이), 시각 회귀 위험 대비 이득 낮음
- #5 useTravelRegisterForm 실제 분리 — Step 5 테스트 안전망 확보 후 다음 세션
- #6 TravelRegisterForm DateField/FileDropzone 추출 — 393줄 시각 컴포넌트, 테스트 없음, 회귀 위험
- #10 CalendarSection 매니저 훅 추출 — 안정 도메인, 긴급도 낮음
- #8/#9 (TODO 주석, files API 통합) — 저가치, 시간 남으면
- `pnpm lint`(eslint flat config 부재) 수리 — baseline 이슈

### Verification Gates
- [x] Gate 1a: typecheck — `pnpm exec tsc -b` PASS (strict 포함)
- [x] Gate 1b: Biome — `npx @biomejs/biome check src/` 246 files, 0 diagnostics
- [x] Gate 2: `pnpm test` — 62 files / 266 tests PASS (baseline 235 + 신규 31)
- [x] Gate 3: `pnpm build` — PASS, 경고 없음, 청크 크기 baseline 동일 (vendor 357.69kB, fullcalendar 270.23kB)
- [x] Gate 3b: `pnpm run knip` — baseline 18개 정확히 유지 (`createInvalidResponseError` un-export로 +1 해소)
- [x] Gate 4: E2E — Playwright(포트 5173, 세션 시작 시 서버 미기동 상태여서 에이전트가 기동), **10/10 플로우 PASS**, 스크린샷 13장. Zod/INVALID_RESPONSE 에러 0건. 관찰된 콘솔 에러 2종(모든 페이지의 400 백그라운드 요청, 대표 이미지 검증 경고)은 기존 동작으로 리팩토링과 무관
- [x] Gate 5: fresh reviewer — **APPROVE** (CRITICAL/HIGH/MEDIUM/LOW 모두 0건; 훅 의미론·context 문자열·details shape 보존 검증됨)
- [ ] Gate 6: 증거 정리(최종 보고)

## Modified Files (HEAD b6b9605 대비)
- `tsconfig.app.json` — `"strict": true` 추가
- `src/lib/api/errors.ts` — `parseOrThrow` 헬퍼 추가, `createInvalidResponseError` un-export(내부 전용화)
- `src/domains/trip/api/trip-schemas.ts`, `src/domains/travel/api/travel-schemas.ts`, `src/domains/calendar/api/calendar-schemas.ts`, `src/domains/auth/api/auth-schemas.ts` — parse 함수 본문을 parseOrThrow 위임으로 치환 (이름/시그니처/context 문자열 보존)
- `src/domains/travel/components/TravelDayEditor.tsx` — private formatDisplayDate 제거, mappers import
- `src/lib/hooks/useAssetObjectUrls.ts` — 신규 제네릭 훅
- `src/domains/trip/hooks/internal/useTripAssetObjectUrls.ts`, `src/domains/travel/hooks/internal/useTravelAssetObjectUrls.ts` — thin wrapper화
- `src/domains/travel/hooks/__tests__/useTravelRegisterForm.test.ts` — 신규 특성화 테스트 31개
- `docs/frontend-refactor-plan.md` — 진행 문서

## Decisions
- Lint 게이트는 Biome(`npx @biomejs/biome check src/`)을 기준으로 판정한다. `pnpm lint`(eslint) 실패는 baseline 이슈로 별도 후속 과제로 분리.
- strict probe가 0 에러였으므로 즉시 적용(계획의 결정 규칙 준수).

## Modified Files
- (none yet)

## Verification Evidence
- (pending)

## Remaining Risks
- (pending)
