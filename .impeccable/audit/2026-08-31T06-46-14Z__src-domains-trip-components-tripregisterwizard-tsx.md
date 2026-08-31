---
target: 나들이 등록 화면 (모바일/PC)
total_score: 14
max_score: 20
p0_count: 2
p1_count: 3
p2_count: 7
p3_count: 14
timestamp: 2026-08-31T06-46-14Z
slug: src-domains-trip-components-tripregisterwizard-tsx
baseline_commit: 420180c
---
Method: four parallel dimension auditors (a11y · responsive · performance+theming · implementation
integrity), read-only, measured with Playwright/Chromium against the running dev server on a
logged-in session. Every headline finding was independently re-verified by the main agent.

대상: 나들이 등록 위저드 — `src/domains/trip/components/TripRegisterWizard.tsx`
경로: 데스크톱 `/main/map/register` · 모바일 `/mobile/map/register`, 라이트/다크 양쪽
기준 커밋: `420180c` (harden 패스 직후)

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | 파일 드롭존 3개 전부 포커스 표시가 보이지 않음 (WCAG 2.4.7 AA 실패) |
| 2 | Performance | 4 | 실측 전부 정상 — 드래프트 저장 100회 0.8ms, object URL 누수 0, 드롭 프레임 0 |
| 3 | Responsive Design | 2 | 텍스트 200% 확대 시 모바일 위저드가 깨지고 다음 버튼을 누를 수 없음 |
| 4 | Theming | 3 | danger 버튼이 `--color-error-on` 대신 `--color-canvas-pure`를 사용 |
| 5 | Implementation Integrity | 2 | 공유 프리미티브 3개를 34개 선언으로 로컬 리스킨, 억제 주석 11개 유발 |
| **Total** | | **14/20** | **Good (약한 차원부터 보강)** |

## Implementation Integrity Verdict

**PASS.** 이 화면은 일반적인 SaaS 온보딩 폼으로 대체 가능한 껍데기가 아니다. 근거는 다운스트림에
있다 — `TripQuizModal.tsx`의 `RecordLock`(자물쇠 걸쇠 위치로 정답 여부를 표현하는 SVG)과
"그날 남겨 둔 말" / "아직 잠겨 있어요" 카피는 PRODUCT.md가 말하는 "퀴즈가 상대에게 남기는 메시지"를
그대로 구현한 것이고, 이 위저드는 정확히 그 콘텐츠를 저작하는 화면이다. `AYO`/`RYU` 라디오가 실제
두 사람 이름이라는 점, 드라이브 비밀번호가 입사일이라는 힌트가 상세 화면의 "암호 🔒 : 입사일"과
일치한다는 점도 확인됐다.

**단, 하나의 집중된 드리프트가 있다.** `components-common.css`의
`/* ---- Register: match prototype field/dropzone/radio styling ---- */` 블록이 `TextField` ·
`FileDropzone` · `RadioGroup` 세 프리미티브를 **34개 선언**으로 다시 칠한다. 그 결과 같은 파일의
base 규칙에 `noDescendingSpecificity` 억제 주석이 **11개** 필요해졌고("base style defined after
wizard context override"), 드래그/에러 상태 규칙은 손으로 유지되는 두 번째 사본을 갖게 됐다.
이 억제 11개는 전부 harden 커밋 이전부터 있던 것으로 확인했다(harden이 추가한 것은 0개).
CSS 주석이 이유를 밝힌다 — 이 화면은 DESIGN.md가 아니라 프로토타입에 맞춰졌다.

## Executive Summary

- Audit Health Score: **14/20** (Good — 약한 차원부터 보강)
- 총 26건: **P0 2 · P1 3 · P2 7 · P3 14**
- P0 2건은 같은 뿌리(모바일 스텝 인디케이터의 `flex-wrap: nowrap` + `white-space: nowrap`)가
  150%와 200% 두 배율에서 각각 터진 것이다.

**가장 중요한 5가지**

1. **[P0] 텍스트 확대 시 모바일 위저드 붕괴.** 390px 뷰포트에서 문서가 150%에 504px,
   200%에 668px로 넓어진다(`clientWidth` 390). 카드가 636px까지 자라고, 다음 버튼 위로 다른
   요소가 겹쳐 실제 클릭이 5초 타임아웃으로 실패했다. WCAG 1.4.4 / 1.4.10 AA 실패.
2. **[P1] 파일 드롭존 3개 모두 포커스 표시가 없다.** 포커스를 받는 것은 `clip: rect(0,0,0,0)`이
   걸린 **1×1px** input이라 2px 링이 통째로 잘려나가고, 눈에 보이는 1146×150 드롭 타깃은
   `outline: none`이다. WCAG 2.4.7 AA 실패. harden 패스가 남긴 결함이다.
3. **[P1] 데스크톱이 1440px를 넓은 모바일 폼으로 쓴다.** 한 줄짜리 텍스트 입력이 1116px로
   늘어난다. DESIGN.md가 정의한 컨테이너 폭(760/1080/1440) 중 어느 것도 쓰지 않는다.
4. **[P1] 공유 프리미티브 3개의 로컬 리스킨**(위 Integrity Verdict 참조).
5. **[P2] danger 버튼의 잘못된 토큰.** `--color-error-on`이 존재하고 DESIGN.md §3이 그 조합을
   검증했는데도 `--color-canvas-pure`를 쓴다. 라이트에서는 둘 다 흰색이라 우연히 같지만
   다크에서 `#242124` vs `#1b1b1b`로 갈린다. 지금은 대비가 깨지지 않는 **의미론적** 버그다.

## Detailed Findings by Severity

전체 근거와 측정값은 차원별 리포트에 있다. 아래는 요약이다.

### P0 — Blocking

**[P0] 텍스트 150%/200% 확대 시 모바일 위저드 리플로우 실패**
- **Location**: `src/styles/components-mobile.css:601-613`
  (`.slcn-shell-detail-mobile .slcn-trip-register-wizard__step-indicator` — `flex-wrap: nowrap`,
  `> li` — `white-space: nowrap`), 렌더는 `TripRegisterWizard.tsx:171-206`
- **Category**: Responsive Design
- **Impact**: OS/브라우저 글자 크기를 키운 사용자가 1·2·3단계 어디서도 다음 버튼을 누르지 못한다.
- **WCAG**: 1.4.4 Resize Text (AA), 1.4.10 Reflow (AA)
- **Evidence**: 390px에서 `scrollWidth` 100% → 390, 150% → **504**, 200% → **668**.
  카드가 636px, 인디케이터 `<ol>`이 530px까지 성장. 다음 버튼 실클릭 시도는 타임아웃했고
  `elementFromPoint`가 버튼 대신 `.slcn-trip-register-step` / `.slcn-file-dropzone__label`을 반환.
- **Recommendation**: 모바일 전용 `flex-wrap: nowrap` + `white-space: nowrap`을 텍스트 배율이
  커질 때 해제하거나 `clamp()` 기반 패딩으로 전환하고, `.slcn-trip-register-wizard__card`에
  `min-width: 0`을 백스톱으로 둔다. 320px 대응으로 넣은 패딩 축소는 100% 배율만 해결했다.
- **Suggested command**: `/impeccable adapt`

### P1 — Major

**[P1] 파일 드롭존 3개에 보이는 포커스 표시가 없다**
- **Location**: `src/components/ui/FileDropzone.tsx` + `.slcn-file-dropzone__input`
- **Category**: Accessibility · **WCAG**: 2.4.7 Focus Visible (AA)
- **Evidence**: 포커스된 input은 `1×1`, `clip: rect(0px, 0px, 0px, 0px)`, `outline: 2px solid`.
  보이는 `.slcn-file-dropzone__label`은 `1146×150`에 `outline-style: none`, `box-shadow: none`.
- **Recommendation**: `.slcn-file-dropzone:has(> .slcn-file-dropzone__input:focus-visible)
  .slcn-file-dropzone__label`에 링을 그린다.
- **Suggested command**: `/impeccable polish`

**[P1] 데스크톱 폼 컬럼 폭이 통제되지 않는다 — 한 줄 입력이 1116px**
- **Location**: `.slcn-trip-register-wizard` (max-width 없음) · **Category**: Responsive Design
- **Evidence**: 1440px에서 카드 1200px, 입력 1116px. DESIGN.md의 760/1080/1440 어디에도 없음.
- **Recommendation**: 폼 컬럼을 640~760px로 제한하고 남는 공간을 프리뷰/요약에 쓴다.
- **Suggested command**: `/impeccable adapt`

**[P1] 공유 프리미티브 3개를 로컬에서 리스킨**
- **Location**: `src/styles/components-common.css` Register 블록 · **Category**: Implementation Integrity
- **Evidence**: 34개 선언 / 12개 규칙 블록, `noDescendingSpecificity` 억제 11개 유발.
- **Recommendation**: 프리미티브에 토큰 기반 variant를 추가해 흡수한다.
- **Suggested command**: `/impeccable extract`

### P2 — Minor (7건)

- **[P2] danger 버튼 잘못된 토큰** — `components-common.css:68`이 `--color-canvas-pure`,
  `--color-error-on`이 정답 (`tokens.css:146`/`:294`). 다크에서 값이 갈림. *Theming*
- **[P2] 위저드 필드가 DESIGN.md `text-input` 규격에서 이탈** — 실측 `min-height: 46px`,
  렌더 높이 47px, 테두리 `border-strong`. 문서는 48px/hairline. *Theming*
- **[P2] `1.5px` 테두리가 실제로는 1px로 렌더** — DPR 1·2 양쪽에서 동일 확인. 선언한 값과
  사용된 값이 불일치해 "load-bearing edge" 의도가 달성되지 않는다. *Theming*
- **[P2] 라디오 포커스 링이 20×20 네이티브 input에만 그려진다** — 클릭 타깃은 데스크톱 567×55,
  모바일 146×54.5. WCAG 2.4.11 Focus Appearance 미충족. 이전 critique의 P3가 그대로 남았다. *A11y*
- **[P2] `DESIGN.md` §15.4가 낡았다** — `드라이브 링크`·`나들이 이름`·`버튼 1/2`·퀴즈 정답/오답
  4개 필드가 문서에 없고, harden이 추가한 취소·초안 알림·파일 미리보기도 반영되지 않았다. *Integrity*
- **[P2] 최종 `submit()`이 3단계만 재검증** — 1·2단계 필드는 "단계 이동 게이트"라는 암묵적
  불변식에만 의존한다. 지금은 안전하지만 스텝 점프를 추가하면 조용히 깨진다. *Integrity*
- **[P2] 첫 오류 포커스 이동 보일러플레이트가 3개 스텝에 복붙** — 약 45줄 중복. *Integrity*

### P3 — Polish (14건, 발췌)

- **초안 복원의 죽은 분기** — `setStep(hasMissingFiles ? 1 : draft.step)`에서 `draft.step > 1`이면
  로고 파일명이 반드시 기록돼 있어 `hasMissingFiles`가 항상 참이다. 즉 사실상 항상 1단계다.
  harden 패스가 추가한 테스트 중 하나는 앱이 만들 수 없는 상태를 검증하고 있다. *Integrity*
- **드롭존 힌트가 실제 허용 형식을 축소해 안내** — `accept`와 검증은 GIF·SVG를 받는데
  힌트는 "PNG · JPG"만 말한다. *Integrity*
- **`RadioGroup.tsx:70`의 단독 Tailwind 클래스 `mt-1`** — 이 저장소에서 유일. *Integrity*
- **`submitError`가 훅 밖에서 전혀 읽히지 않는다** — knip이 못 보는 종류의 죽은 반환값. *Integrity*
- **위저드 CSS의 일회성 수치 12개** — 다만 `1.625rem`·`0.5625rem` 등 7개 값 모두 `--space-N`
  스케일에 대응 토큰이 **없다**. 토큰을 무시한 게 아니라 스케일에 빈칸이 있는 것. *Theming*
- **`DESIGN.md` §17의 "raw colour literal 없음" 주장은 거짓** — `#fe9fc8` ×3, `#f793c2` ×1.
  단 넷 다 캘린더/헤더 소속이고 위저드 화면에는 렌더되지 않는다. *Theming*
- **유형 라디오 그룹의 required가 프로그램적으로 노출되지 않는다** — `*`는 `aria-hidden`. *A11y*
- **모달 닫기 버튼이 `✕` 글리프** — 옆의 파일 지우기 버튼은 진짜 SVG다. *A11y*
- **헤더 로고 `image-redundant-alt`** — `alt="SLCN"`이 옆 워드마크와 중복. 셸 소속. *A11y*
- **드롭존 지우기 버튼이 44×44 정확히 하한** — 여유 0. *Responsive*
- **썸네일에 `decoding` 없음 / 폰트 preload 없음 / 다이얼로그 오픈 시 경계선상 드롭 프레임 1회** *Performance*
- **`nextButtonText`/`previousButtonText` API 필드명이 실제 용도(지도 탭 라벨)와 불일치** *Integrity*

## Patterns & Systemic Issues

1. **100% 배율만 검증된 반응형.** 320px 넘침은 고쳤지만 같은 규칙이 텍스트 확대에서 다시 터진다.
   `nowrap` 제약은 남아 있고, 배율이라는 축은 한 번도 테스트되지 않았다.
2. **포커스 표시가 "보이는 컨트롤"이 아니라 "포커스를 받는 요소"에 붙는다.** 드롭존(1×1 클립)과
   라디오(20×20)가 같은 실수의 두 사례다. 전역 `:focus-visible` 링은 잘 깔려 있지만, 네이티브
   입력을 숨기고 라벨을 그리는 패턴에서는 링을 라벨로 옮기는 후속 규칙이 필요하다.
3. **프로토타입이 디자인 시스템을 이겼다.** 34개 선언의 리스킨, 46px vs 48px, 1.5px 테두리,
   스케일 밖 수치 12개는 모두 한 원인의 다른 얼굴이다.
4. **문서가 구현을 따라오지 못한다.** DESIGN.md §15.4(필드 누락)와 §17(색 리터럴 주장)이 둘 다
   현재 코드와 어긋난다.

## Positive Findings

- **성능은 실측으로 깨끗하다.** sessionStorage 드래프트 저장은 100회 합계 0.8ms(디바운스 불필요),
  object URL은 연속 선택·클리어·언마운트 세 경우 모두 누수 없음, 스텝 전환·다이얼로그 오픈에서
  드롭 프레임 0. 규모에 맞지 않는 선제적 메모이제이션이 없다는 점도 옳다.
- **axe-core가 위저드 안에서 위반 0건.** 7개 상태 × 데스크톱/모바일 × 라이트/다크 전부.
  유일한 히트는 위저드 밖 헤더 로고다.
- **대비는 양 테마 전부 AA 통과.** 15쌍 + placeholder 재계산: 라이트 4.63~17.22:1,
  다크 5.74~16.65:1. placeholder는 5.55:1 / 10.38:1.
- **모달 포커스 관리가 세 가지 모두 정확하다.** 열릴 때 포커스가 파괴적 액션이 아닌 안전한
  `계속 쓸게요`로 들어가고, 탭 6회가 다이얼로그 안에서만 순환하며, Escape가 닫고 포커스를
  `취소` 버튼으로 되돌린다.
- **`prefers-reduced-motion`이 전면 차단이 아니라 의도된 대안을 준다.** `reduce`에서 `transform`만
  빠지고 색·투명도 전환 0.16s는 유지된다. 스텝 전환 스크롤도 `matchMedia`로 분기한다.
- **다크 모드 파리티가 거의 완벽하다.** 19개 셀렉터 중 17개가 테마 간 정확히 달라지고, 동일한
  2개는 CSS 주석과 DESIGN.md가 의도적 불변으로 명시한 Seoul Pink 채움이다. 테마가 안 먹은
  요소는 발견되지 않았다.
- **시맨틱 구조가 완전하다.** 페이지당 `<h1>` 정확히 1개(모바일은 visually-hidden),
  landmark 4종, 스텝 인디케이터가 실제 `<ol>`/`<li>`, 그리고 모든 `aria-describedby`가 실재 id로 해석된다.
- **100% 배율 반응형은 견고하다.** 320~1920px × 8개 상태 전 조합에서 `scrollWidth === clientWidth`.
  긴 한글 파일명, 120자 한글, 60자 무공백 라틴 문자열 모두 레이아웃을 깨지 않는다.
- **퀴즈 어휘가 끝단까지 일관된다.** 라벨·힌트·검증 메시지·aria-label이 전부 "보기"로 정렬됐고
  페이로드에 `정답N` 잔재가 없다. harden 패스의 리네임이 깨끗하게 안착했다.

## Detector Note

번들 디텍터는 대상 7개 파일에 대해 `[]`(0건)을 반환했다. **이는 깨끗하다는 뜻이 아니다.**
합성 파일 대조 실험(인라인 `color:'#999999'`, `transition:'all'`, `fontSize:'9px'`, `<div onClick>`,
Tailwind `text-gray-400`)에서도 동일하게 `[]`가 나왔다. 원인을 추적하니 비-HTML 소스에 대해
regex 엔진이 가진 규칙은 9개(`ai-color-palette`, `border-accent-on-rounded`, `bounce-easing`,
`broken-image`, `gradient-text`, `gray-on-color`, `layout-transition`, `overused-font`, `side-tab`)뿐이고
`low-contrast`·`tiny-text`·`cramped-padding`은 이 엔진에 **구조적으로 존재하지 않는다**.
URL 모드는 `puppeteer` 미설치로 실행 자체가 불가했다(로그인 페이지조차 스캔하지 못함).
이 코드베이스는 외부 스타일시트 + CSS 커스텀 프로퍼티로만 스타일링하므로 정확히 사각지대에 있다.
따라서 이번 회차의 실질 증거는 전부 위의 라이브 DOM 실측이다.

## Out-of-scope observation

`pnpm test`의 기존 실패 2건(`HomeHubPage`, `TripDetailSection`)은 이 화면과 무관하다.
`.env`가 `VITE_API_URL=http://localhost:5173/api`인데 두 테스트는 `http://localhost:8080`을
기대한다. 앱 코드가 아니라 env/테스트 불일치다.

## Recommended Actions

1. **[P0] `/impeccable adapt`** — 모바일 스텝 인디케이터의 `nowrap` 제약을 텍스트 150~200%
   배율에서 해제하고, 데스크톱 폼 컬럼을 640~760px로 제한한다. P0 2건과 P1 1건을 함께 해결한다.
2. **[P1] `/impeccable polish`** — 포커스 링을 보이는 컨트롤로 옮긴다(드롭존 라벨, 라디오 필).
   P1 1건 + P2 1건.
3. **[P2] `/impeccable extract`** — 프로토타입 값을 프리미티브의 토큰 기반 variant로 흡수해
   34개 로컬 선언과 억제 주석 11개를 없앤다.
4. **[P2] `/impeccable document`** — DESIGN.md §15.4의 필드 목록과 §17의 색 리터럴 주장을
   현재 구현에 맞춘다.
5. **[P3] `/impeccable clarify`** — 드롭존 힌트를 실제 `accept`(GIF·SVG 포함)와 일치시킨다.
6. **[P3] `/impeccable polish`** — 죽은 분기, 미사용 `submitError`, `mt-1`, `✕` 글리프 정리.
