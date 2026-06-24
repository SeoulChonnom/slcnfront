# Design Diff Notes: Prototype vs Implementation

디자인 프로토타입(`https://claude.ai/design/p/4ab0fb6b-033e-4c37-bb9f-8e63d10c29a2?file=SLCN+Prototype.dc.html`)과 현재 구현의 차이점 및 작업 이력.

---

## 작업 이력

### 세션 1 — 초기 디자인 동기화

| 항목                              | 변경 내용                                                                                                            | 관련 파일                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Inter 폰트**                    | `index.html`에 Google Fonts Inter(400/600/700/800) import 추가                                                       | `index.html`                                                                               |
| **`.slcn-num` 클래스 추가**       | `font-variant-numeric: tabular-nums; font-feature-settings: "tnum"` — 프로토타입에 있는 클래스였으나 프로젝트에 누락 | `src/styles/globals.css`                                                                   |
| **모바일 D-DAY 값 폰트**          | `slcn-num` 클래스 적용으로 숫자 고정폭 처리                                                                          | `src/pages/shared/HomeHubPage.tsx`                                                         |
| **모바일 FILM 스탯 폰트**         | `Choi's Film Art` 줄바꿈 방지 — `1.25rem/800` → `0.9375rem/700` (프로토타입 15px 기준)                               | `src/styles/components-mobile.css`, `src/pages/shared/HomeHubPage.tsx`                     |
| **신발 추천 인트로 카드**         | 모바일에서도 표시 (`showIntro = true`, 기존에는 데스크탑 전용)                                                       | `src/domains/shoes/components/ShoesCatalogSection.tsx`                                     |
| **신발 추천 타이틀 크기**         | 데스크탑 최대 크기 `3.5rem → 2.75rem`                                                                                | `src/styles/components-common.css`                                                         |
| **여행 목록 타이틀 최소 크기**    | `1.75rem → 2rem`                                                                                                     | `src/styles/components-common.css`                                                         |
| **여행 목록 서브타이틀 줄간격**   | `line-height: 1.6` 추가                                                                                              | `src/styles/components-common.css`                                                         |
| **캘린더 eyebrow 색상**           | 어두운 회색 → 핑크(`#c58ea3`)                                                                                        | `src/styles/components-common.css`                                                         |
| **캘린더 eyebrow 자간**           | `0.18em → 0.08em`                                                                                                    | `src/styles/components-common.css`                                                         |
| **캘린더 "오늘" 버튼**            | "Today" → "오늘" 한글 변경                                                                                           | `src/domains/calendar/components/CalendarToolbar.tsx`, 관련 테스트                         |
| **캘린더 칩 활성 스타일 (1차)**   | 활성 칩 배경색 fill → 칩 테두리에 캘린더 색상 적용 (세션 2에서 재수정됨)                                             | `src/domains/calendar/components/CalendarToolbar.tsx`                                      |
| **여행 날짜 형식**                | 백엔드 `2024-09-29` → 화면 `2024.09.29` — 정규식에 `-` 구분자 처리 추가                                              | `src/domains/trip/mappers/trip-mappers.ts`                                                 |
| **캘린더 "일정 추가" 우측 정렬**  | 모바일에서 "일정 추가" 버튼 우측 정렬                                                                                | `src/styles/components-mobile.css`                                                         |
| **신발 브랜드 네비게이션 "전체"** | "전체" 항목 추가, 활성 상태 핑크 스타일                                                                              | `src/domains/shoes/components/ShoesCatalogSection.tsx`, `src/styles/components-common.css` |

---

### 세션 2 — 전면 재비교 및 추가 수정

Playwright로 앱 전체 스크린샷 + 프로토타입 스크린샷을 나란히 비교한 후 차이점 수정.

#### 폰트

| 항목                            | 변경 내용                                                                                                                                                                                                                  | 관련 파일                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Inter 폰트 자가 호스팅 전환** | 프로토타입은 Inter를 base64 woff2 `@font-face`로 내장해 네트워크 없이도 보장. Google Fonts는 외부 네트워크 의존이라 실패할 수 있어 `@fontsource/inter` 패키지(400/600/700/800)로 교체, `index.html` Google Fonts 링크 제거 | `src/main.tsx`, `index.html` |

#### 캘린더

| 항목                             | 변경 내용                                                                                                                                    | 관련 파일                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **이전/다음 → 화살표 아이콘**    | 텍스트 "이전" / "다음" → `‹` / `›` SVG 아이콘 버튼. `aria-label="이전 달"` / `"다음 달"` 추가                                                | `src/domains/calendar/components/CalendarToolbar.tsx`                                     |
| **`+ 일정 추가` 버튼 아이콘**    | "일정 추가" 텍스트 앞에 `+` SVG 아이콘 추가                                                                                                  | `src/domains/calendar/components/CalendarToolbar.tsx`                                     |
| **`⚙ 캘린더 관리` 버튼 아이콘**  | "캘린더 관리" 텍스트 앞에 톱니바퀴 SVG 아이콘 추가                                                                                           | `src/domains/calendar/components/CalendarToolbar.tsx`                                     |
| **캘린더 칩 활성 스타일 재수정** | 세션 1의 `borderColor` 인라인 스타일 제거. 프로토타입 분석 결과 칩에 컬러 테두리 없음 — 흰색 배경 + 컬러 도트만, 비활성 칩은 `opacity: 0.45` | `src/domains/calendar/components/CalendarToolbar.tsx`, `src/styles/components-common.css` |
| **캘린더 필터 한 줄 레이아웃**   | "캘린더 필터" 레이블 → 칩들 → "캘린더 관리" 버튼을 한 줄에 배치. 기존에는 레이블+버튼이 위, 칩이 아래 2행이었음                              | `src/domains/calendar/components/CalendarToolbar.tsx`, `src/styles/components-common.css` |
| **일요일(일) 날짜 빨간색**       | FullCalendar `.fc-day-sun` 선택자로 헤더·날짜 숫자에 `color: #e05473`                                                                        | `src/styles/components-common.css`                                                        |
| **토요일(토) 날짜 파란색**       | FullCalendar `.fc-day-sat` 선택자로 헤더·날짜 숫자에 `color: #4a8cdc`                                                                        | `src/styles/components-common.css`                                                        |
| **오늘 날짜 원형 하이라이트**    | `.fc-day-today .fc-daygrid-day-number`에 핑크 원(`2rem × 2rem`, `border-radius: 999px`, `background: primary`)                               | `src/styles/components-common.css`                                                        |

#### 신발 추천

| 항목                               | 변경 내용                                                                                                         | 관련 파일                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **데스크탑 신발 그리드 3열 → 2열** | 프로토타입은 2열. 3열은 카드 너비가 좁아 이미지·텍스트가 너무 작아지는 문제 있음                                  | `src/styles/components-pc.css`     |
| **모바일 그리드 스코핑 버그 수정** | `components-mobile.css`의 1열 규칙이 `.slcn-shell-mobile`에 스코핑되지 않아 데스크탑에도 1열이 적용되던 버그 수정 | `src/styles/components-mobile.css` |

#### 여행 기록

| 항목                                | 변경 내용                                                                                                                                                                                                                   | 관련 파일                                                                                                                                                   |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **여행 카드 description 필드 준비** | 프로토타입에는 카드에 설명 텍스트 존재. Zod 스키마·타입·매퍼·TripCard 컴포넌트에 `description?: string` 추가. **단, 현재 백엔드 API가 해당 필드를 반환하지 않아 미표시** (백엔드 응답: `id, date, type, name, logo`만 있음) | `src/domains/trip/api/trip-schemas.ts`, `src/domains/trip/types.ts`, `src/domains/trip/mappers/trip-mappers.ts`, `src/domains/trip/components/TripCard.tsx` |

#### 테스트 수정

| 항목                                | 변경 내용                                                                                                                  | 관련 파일                                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **CalendarToolbar 테스트**          | aria-label 변경에 맞게 `'이전'` → `'이전 달'`, `'다음'` → `'다음 달'`                                                      | `src/domains/calendar/components/__tests__/CalendarToolbar.test.tsx` |
| **CalendarSection 테스트 버그픽스** | `element?.className.includes()`가 SVG 요소에서 `SVGAnimatedString` 반환으로 실패 → `element?.classList?.contains()`로 수정 | `src/domains/calendar/components/__tests__/CalendarSection.test.tsx` |

---

## 현재 남은 차이점

### 백엔드 미지원으로 구현 불가

| 항목                      | 프로토타입 내용                                   | 상태                                                                   |
| ------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| **여행 카드 설명 텍스트** | 각 여행에 한 줄 설명 (`성북동에서 부암동까지...`) | 프론트엔드 준비 완료. 백엔드가 `description` 필드를 반환하면 자동 표시 |

### 디자인 잔여 차이 (구현 가능, 미완성)

| 항목                             | 프로토타입                                          | 현재 구현                                   | 우선순위                                                                           |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| **모바일 신발 카드 2열**         | 모바일에서도 2열 그리드                             | 모바일 1열 유지                             | 중간 — 신발 카드 이름 폰트(`2rem`)가 커서 2열 시 너무 좁음. 폰트 축소 후 전환 가능 |
| **캘린더 nav pill 연결형**       | `< 오늘 >` 세 요소가 하나의 연결된 pill 형태로 표시 | 세 개의 독립 버튼                           | 낮음                                                                               |
| **여행 카드 타입 배지 다색**     | 아영(핑크), 일권(파랑) 등 사람마다 다른 색상        | 단일 핑크 배지                              | 낮음 — 타입별 색상 매핑 필요                                                       |
| **여행 카드 썸네일 이미지 로드** | 실제 이미지 표시                                    | 이미지 URL 연동 시 표시. 없으면 placeholder | 낮음                                                                               |

### 의도적 차이 (변경하지 않음)

| 항목                          | 프로토타입                           | 현재 구현                            | 이유                           |
| ----------------------------- | ------------------------------------ | ------------------------------------ | ------------------------------ |
| **우상단 아바타 배지**        | `관` (고정)                          | `관`/`촌` (역할 기반 동적)           | 실 사용자 데이터 반영          |
| **D-DAY 숫자**                | 627 (픽스된 목업값)                  | 실시간 계산                          | 실 서비스는 매일 갱신되어야 함 |
| **프로토타입 디자인 툴 크롬** | 1440/390 토글, 관리자 ON 버튼 등     | 없음                                 | 디자인 툴 전용 UI              |
| **신발 브랜드명**             | Nike, HOKA, New Balance (영문)       | 뉴발란스, 나이키 등 한글             | 실제 API 데이터 사용           |
| **캘린더 칩 색상**            | 아영(핑크), 일권(초록), 기념일(노랑) | 아영(핑크), 일권(파랑), 기념일(핑크) | 실제 API 데이터의 색상 사용    |

---

# 세션 3 — 프로토타입 기준 전수 재검증

> ⚠️ **디자인 기준 정정**: 디자인 소스는 `docs/SeoulChonnom_Prototype.html`(최신)이다. `docs/design/design.pen`은 **예전 디자인**이므로 비교 기준에서 제외한다.

## 1. 이전 작업 요약 분석 (Previous Work Summary)

- 세션 1·2에서 Inter 폰트 자가호스팅, 캘린더 화살표 아이콘/칩/오늘 원형, 신발 그리드 2열, 모바일 그리드 스코핑, 여행 카드 description 필드 등을 수정 보고함.
- **검증 부족했던 점**: 수정 보고는 대부분 "코드 변경" 기준이었고, 프로토타입 캡처 vs 실제 화면 캡처를 화면별로 나란히 대조한 증거가 부족했음.
- **문서상 완료지만 재확인 필요했던 부분**: 캘린더 툴바 레이아웃(실제로는 데스크탑에서 깨져 있었음), 모바일 신발 열 수(문서는 2열 권장이라 했으나 프로토타입 실측은 1열).

## 2. 검증 범위 (Verification Scope)

전체 라우터: 데스크탑 10 + 모바일 10 (route-constants.ts 기준). 이번에 캡처/대조한 화면:

| No | Route | Viewport | Design Source | Product Before | 대조 결과 |
|---|---|---|---|---|---|
| 1 | /main, /mobile (home) | D+M | desktop/mobile-home.png | 동일 | ✅ 일치 |
| 2 | /map (list) | D+M | desktop/mobile-map-list.png | 동일 | ✅ 디자인 일치(데이터 차이만) |
| 3 | /calendar (month) | D+M | desktop/mobile-calendar-month.png | 동일 | ❌ 툴바·날짜·이벤트 차이 |
| 4 | /calendar/week | D+M | desktop/mobile-calendar-week.png | 동일 | ❌ 툴바 동일 이슈(공유) |
| 5 | /shoesRecom (catalog) | D+M | desktop/mobile-shoes-catalog.png | 동일 | ✅ 일치(D 2열 / M 1열) |
| 6 | /:brand/:shoesName (detail) | D | desktop-shoe-detail.png | 동일 | ✅ 구조 일치 |
| 7 | /map/register | D | desktop-map-register.png | 동일 | ❌ 유형 라디오·로고 드롭존 차이 |
| 8 | /login | D+M | (login) | 동일 | (경미, 미세 대조) |
| 9 | /map/:id (detail) | D+M | (퀴즈 해제 후) | 동일 | 구조 일치(데이터 차이) |

## 3. 제외 범위 (Excluded Scope)

| 항목 | 사유 |
|---|---|
| 여행 카드 description 텍스트 | 백엔드 `/api/trip`이 `description` 미반환. 프론트는 수신 준비 완료 |
| 프로토타입 상단 라우팅 Header | 디자인 툴 전용 UI, 구현 대상 아님 |
| 모바일 휴대폰 프레임/베젤 | 목업 장식, 구현 대상 아님 |

## 4. 전역 잔여 이슈 (Global Remaining Issues)

- **폰트**: 모든 화면에서 Inter(라틴)+한글 렌더링이 프로토타입과 **육안상 일치**. 세션 1·2의 `@fontsource/inter` 적용으로 해소된 것으로 판단. (방어적으로 폰트 스택에 한글 폰트 명시는 P2로 권장.)
- **콘텐츠 폭**: 프로토타입 데스크탑 콘텐츠 영역은 1200px, 실제 앱은 1440 뷰포트에서 더 넓게 퍼짐 — 구조 차이는 아니며 의도 범위.

## 5. 화면별 잔여 이슈 (Page-by-Page) — 수정 대상

### 5.1 캘린더 (Calendar) — Desktop + Mobile  ★최대 격차
- Design Source: `design-source/desktop-calendar-month.png`, `mobile-calendar-month.png`
- Product: `product-before/desktop-calendar-month.png`, `mobile-calendar-month.png`
- **차이**:
  - **[P0] 툴바 컨트롤 전폭 늘어남**: `오늘` 버튼과 `월/주` 토글이 컨테이너 전폭으로 늘어나 화살표가 양끝으로 밀리고 `일정 추가`가 별도 줄로 떨어짐. 프로토타입은 `< 오늘 >` 컴팩트 pill + 작은 토글이 한 줄. → 원인: `components-mobile.css`의 `.slcn-calendar-toolbar__nav/__view-toggle { width:100% }`, `__nav > * { flex:1 1 0 }`, `__controls { align-items:stretch }` 가 **`.slcn-shell-mobile`에 스코핑되지 않아** 데스크탑까지 적용됨.
  - **[P1] 날짜 숫자 `일` 접미사**: `1일, 2일…` → 프로토타입은 `1, 2…`. 원인: FullCalendar `koLocale` 기본. `dayCellContent`로 숫자만 표시 필요(`CalendarTimelineView.tsx` / 월뷰).
  - **[P1] 이벤트 pill 스타일**: 실제는 진한 단색 막대. 프로토타입 데스크탑은 옅은 틴트 pill(작은 텍스트), 모바일은 **작은 점(dot)**. `.fc-event` 스타일/`eventContent` 조정 필요.
  - **[P1] 모바일 필터 칩 줄바꿈**: 칩들이 세로로 흩어짐 → 프로토타입은 한 줄 유지.
- Suggested Subagent: frontend/styling

### 5.2 나들이 등록 폼 (Trip Register) — Desktop
- Design Source: `design-source/desktop-map-register.png`
- Product: `product-before/desktop-map-register.png`
- **차이**:
  - **[P1] 유형 라디오**: 프로토타입은 `유형` 라벨 + 아영/일권을 **2열 가로** 배치, 선택 시 핑크 틴트 배경+핑크 테두리. 실제는 라벨 없음 + 세로 스택 + 선택 스타일 약함. (`TripRegisterStepBasic.tsx`의 `RadioGroup`, 공용 `RadioGroup` 컴포넌트/CSS)
  - **[P1] 로고 드롭존**: 프로토타입은 점선+해치 패턴 드롭존 + 업로드 아이콘 + "로고 파일을 끌어다 놓거나 선택하세요" + "PNG · JPG · 최대 10MB". 실제는 솔리드 핑크 박스 + "로고" 헤딩 + 다른 문구. (`FileDropzone` 컴포넌트/CSS)
  - **[P2] 이름 placeholder**: `나들이 이름` → 프로토타입 `예) 부암동 나들이`.

### 5.3 일치 확인 화면 (수정 불필요)
- Home(D/M), Trip List(D/M, 데이터 차이만), Shoes Catalog(D/M), Shoe Detail(D): 디자인 일치.

## 6. 우선순위 (Priority)
- **P0**: 캘린더 툴바 전폭 깨짐 (전 화면 일관성 파괴, 데스크탑/모바일 동시).
- **P1**: 캘린더 날짜 `일` 접미사, 이벤트 pill/점 스타일, 모바일 칩 줄바꿈, 등록 폼 유형 라디오·로고 드롭존.
- **P2**: 등록 폼 placeholder, 폰트 스택 한글 명시.

## 7. 서브에이전트 작업 계획 (Subagent Task Plan)
- **Task A (frontend/styling)** — 캘린더 + 등록 폼 수정. 공용 `components-common.css`를 함께 건드리므로 단일 서브에이전트가 일괄 처리(병렬 시 CSS 충돌 위험).

---

# 세션 3 — Design Recheck Result (수정 결과)

## 1. Summary
프로토타입(`SeoulChonnom_Prototype.html`) 기준으로 전 화면을 캡처·대조한 결과, 핵심 격차는 **캘린더**와 **등록 폼**에 집중되어 있었고 모두 수정 완료. Home/TripList/Shoes는 이미 일치(차이는 데이터). 폰트는 이미 일치 상태로 확인.

## 2. Previous Document Analysis
이전 문서는 "코드 변경" 기준 보고가 많아 실제 화면 검증 증거가 부족했음. 재검증 결과 ① 캘린더 툴바가 데스크탑에서 실제로 깨져 있었고(문서엔 정상으로 기재), ② 모바일 신발은 2열이 아니라 1열이 정답(프로토타입 실측)임을 확인.

## 3. Verified Routes
| No | Route | Viewport | Result |
|---|---|---|---|
| 1 | / (home) | D+M | ✅ 일치 |
| 2 | /map (list) | D+M | ✅ 디자인 일치(데이터 차이) |
| 3 | /calendar | D+M | ✅ 수정 후 일치 |
| 4 | /calendar/week | D+M | ✅ 툴바 공유 수정 반영 |
| 5 | /shoesRecom | D+M | ✅ 일치 |
| 6 | /:brand/:shoesName | D | ✅ 구조 일치 |
| 7 | /map/register | D+M | ✅ 수정 후 일치 |
| 8 | /login | D+M | ✅ 경미, 일치 |
| 9 | /map/:id | D+M | 구조 일치(데이터 차이) |

## 4. Excluded Routes / States
| Route/State | Reason |
|---|---|
| 여행 카드 description | 백엔드 `/api/trip` 미반환 (프론트 수신 준비 완료) |
| 프로토타입 라우팅 Header / 모바일 폰 프레임 | 디자인 대상 아님 |

## 5. Fixed Issues
| Issue | Route/Component | Before | After | Status |
|---|---|---|---|---|
| 툴바 컨트롤 전폭 늘어남(P0) | Calendar (D+M) | product-before/desktop-calendar-month.png | product-after/desktop-calendar-month.png | ✅ |
| 날짜 `일` 접미사(P1) | Calendar | 〃 | 〃 | ✅ |
| 이벤트 단색막대→틴트 pill(D)/점(M)(P1) | Calendar | 〃 | 〃 | ✅ |
| 모바일 필터칩 줄바꿈/관리버튼 행(P1) | Calendar (M) | mobile-calendar-month.png | 〃 | ✅ |
| 데스크탑 날짜 좌측 정렬(P2) | Calendar (D) | 〃 | 〃 | ✅ |
| 유형 라디오 2열+라벨+선택 스타일(P1) | Register | desktop-map-register.png | product-after/desktop-map-register.png | ✅ |
| 로고 드롭존(점선+해치+아이콘)(P1) | Register | 〃 | 〃 | ✅ |
| 이름 placeholder `예) 부암동 나들이`(P2) | Register | 〃 | 〃 | ✅ |

## 6. Remaining Issues
- 여행 카드 description 텍스트: 백엔드가 필드를 반환하면 자동 표시(프론트 준비 완료). 그 외 **검증 가능한 범위 내 잔여 디자인 이슈 없음.**
- 매우 좁은 모바일 폭(<360px)에서는 캘린더 필터칩이 잘릴 수 있음(390px 기준 정상).

## 7. Subagent Work Summary
- **Capture 서브에이전트 3종**(병렬): 프로토타입 design-source 18장, product-before 데스크탑 10장 / 모바일 10장.
- **Fix 서브에이전트 (frontend)**: 캘린더 6종 + 등록 폼 수정. 변경 파일: `components-mobile.css`, `components-common.css`, `CalendarTimelineView.tsx`, `RadioGroup.tsx`, `FileDropzone.tsx`, `TripRegisterStepBasic.tsx`.
- **Polish 서브에이전트 (frontend)**: 데스크탑 날짜 좌측정렬, 모바일 필터칩 행 분리. 변경 파일: `components-common.css`, `components-mobile.css`.
- **Re-capture 서브에이전트 2종**: product-after 캡처.

## 8. Screenshot Evidence
| Screen | Design Source | Before | After |
|---|---|---|---|
| Calendar D | design-source/desktop-calendar-month.png | product-before/… | product-after/… |
| Calendar M | design-source/mobile-calendar-month.png | product-before/… | product-after/… |
| Register D | design-source/desktop-map-register.png | product-before/… | product-after/… |
(경로 루트: `screenshots/design-recheck/`)

## 9. Files Changed
- `src/styles/components-mobile.css` — 캘린더 툴바 전폭 leak 제거(스코핑), 모바일 이벤트 점(dot), 필터칩 행 분리, 모바일 날짜 가운데 정렬 유지.
- `src/styles/components-common.css` — 툴바 nav 컴팩트 pill, 이벤트 틴트 pill(`--slcn-event-color`), 라디오 2열/필드라벨, 드롭존 점선+해치, 데스크탑 날짜 좌측정렬.
- `src/domains/calendar/components/CalendarTimelineView.tsx` — `dayCellContent`로 `일` 제거, `eventDidMount`로 이벤트 색상 변수 주입.
- `src/components/ui/RadioGroup.tsx` — 선택적 `label`/inline variant.
- `src/components/ui/FileDropzone.tsx` — 필드 라벨/업로드 아이콘/안내문구.
- `src/domains/trip/components/TripRegisterStepBasic.tsx` — `유형` 라벨·inline, 드롭존 문구, placeholder.

## 10. Validation Commands
```bash
npx @biomejs/biome check --write src/   # 통과(잔여: 기존 a11y 경고 + FullCalendar inline color 덮어쓰기용 !important 경고)
pnpm test                                # 51 files, 155 tests 전부 통과
pnpm build                               # 성공 (332ms)
```

## 11. Final Judgment
**Mostly matched (검증 가능 범위 내 사실상 일치).** 근거: P0/P1 격차(캘린더 툴바·날짜·이벤트·필터칩, 등록 폼 라디오·드롭존)를 프로토타입 캡처와 1:1 대조해 수정·재검증 완료. 유일한 잔여는 백엔드 미지원(description) 1건으로, 디자인 코드 측 책임 범위 밖.

---

# 세션 4 — 기능 회귀 점검 + 계산 스타일(정적) 분석

## A. 기능 회귀 점검 결과
세션 3 디자인 수정(공용 `FileDropzone`/`RadioGroup`/캘린더) 이후 기능 회귀를 Playwright 상호작용 테스트로 전수 점검.
- **하드 회귀 없음**: 이벤트 클릭→수정 모달, 빈 날짜 클릭→생성, 주(week) 뷰, 툴바(오늘/이전/다음/일정추가/캘린더관리), 라디오 토글, 파일 업로드(`.slcn-file-dropzone__input` 정상), 등록 다단계 이동·값 보존 — 전부 PASS.
- **콘솔 에러 1건은 기존 이슈**: `POST http://localhost:8080/api/user/token` 400 (로그인 화면 부트스트랩 시 1회, 백엔드측). 이번 변경과 무관.
- **개선 1건 적용**: 모바일 캘린더 이벤트 점(dot)의 탭 영역이 6×6px로 과소 → 시각적 점은 6px 유지하되 클릭 가능한 `<a>`를 24px로 확대(내부 `::after`로 점 렌더). `::before` 강조선에 `pointer-events:none` 추가.

## B. 계산 스타일(정적) 분석 — 이미지 비교가 놓친 수치 차이
프로토타입은 디자인 데이터가 인코딩되어 순수 텍스트 diff 불가. 대신 **프로토타입 DOM(인라인 px 스타일) vs 앱 DOM**의 `getComputedStyle`을 텍스트로 매칭해 수치 비교(가장 정밀).

### 결론: 폰트 패밀리는 실제 불일치 아님
프로토·앱 모두 `Inter, system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`로 한글 렌더 동일. (프로토에서 보이던 Arial은 `<button>` 기본 폰트 아티팩트.) → 토큰에 한글 폰트 명시(방어적)로 정정.

### 발견·수정한 수치 차이 (모두 적용·재측정 PASS)
| 항목 | 셀렉터 | 프로토(목표) | 앱(수정 전) | 결과 |
|---|---|---|---|---|
| **버튼 두께(전 화면)** | `.slcn-button` | 700 | **400** | ✅ 700 |
| **캘린더 월 타이틀** | `.slcn-calendar-toolbar__title` | 34px/800 | **56px/400** | ✅ 34px/800 |
| **페이지 헤더 타이틀(등록 등)** | `.slcn-page-section-header__title` | 32px/800 | **43px/700** | ✅ 32px/800 |
| **주말 색** | `.fc-day-sun/sat …` | Sun #D64545 / Sat #3B7DD8 | #E05473 / #4A8CDC | ✅ 정정 |
| **날짜 숫자 두께** | `.fc-daygrid-day-number` | 600 | 700 | ✅ 600 |
| **필드 라벨** | `.slcn-field__label` | 13px/자간 normal/대문자 없음 | 11px/0.11em/uppercase | ✅ 정정 |
| **월·주 토글** | `.slcn-segmented-control__button` | 14px/600 | 16px/700 | ✅ 14px/600 |
| **등록 유형 칩** | `.slcn-radio-group--inline …` | r14px/13.3px | r18px/16px | ✅ 정정 |
| **폰트 토큰(방어)** | `--font-*` (tokens.css) | 한글 폰트 명시 | Segoe UI 등 | ✅ 정정 |

> 가장 큰 격차는 **모든 버튼이 weight 400으로 렌더(설계 700)** 와 **캘린더 월 타이틀 56px/400(설계 34px/800)**. 이미지 비교로는 놓치기 쉬운 두께/사이즈 차이였음.

### 변경 파일 (세션 4)
- `src/styles/components-common.css` — 버튼 두께, 타이틀 2종, 주말색, 날짜 두께, 필드라벨, 토글, 칩, 모바일 점 `::before` 하드닝.
- `src/styles/components-mobile.css` — 모바일 이벤트 점 탭영역 24px.
- `src/styles/tokens.css` — `--font-display/body/caption` 한글 폰트 명시.

### 검증 (세션 4)
- 계산 스타일 재측정: 위 표 전 항목 **PASS**(목표값 일치). Home H1 40px/800 불변 확인.
- `pnpm test` 155/155 통과, `pnpm build` 성공, `biome` 신규 오류 없음.
- 기능 상호작용 테스트 전 항목 PASS(하드 회귀 없음).

---

# 세션 5 — 사용자 지정 항목 정밀 수정 (모달/PC/모바일)

사용자가 직접 정리한 차이 목록을 항목별로 캡처·계산스타일 비교 후 프로토타입에 맞춰 수정. **결정: 기능 필드는 유지하고 디자인만 프로토타입화.**

## A. 모달
| 모달 | 프로토타입 목표 | 수정 |
|---|---|---|
| **퀴즈** | 큰 가운데 제목 → 좌측 작은 eyebrow "🔒 나들이 퀴즈" + "{나들이}·{날짜}" 부제, 질문/보기 좌측 정렬, A/B/C 배지+컴팩트 행, ~460px | ✅ TripQuizModal 재구성 |
| **캘린더 관리** | 복잡한 편집폼 → 단순 토글 리스트(색상점+이름+스위치) + 점선 "새 캘린더 추가". 편집폼은 추가/수정 시 노출 | ✅ list/editor 분리, 기능 유지 |
| **일정 등록** | 가운데 "일정 만들기" → 좌측 "일정 추가", 캘린더 `<select>` → 칩 선택기, placeholder, 컴팩트 폼(설명/장소/종일/시작·종료 유지) | ✅ |

## B. PC
| 항목 | 차이(프로토 vs 앱) | 수정 |
|---|---|---|
| **Header–Title 간격(로그인·메인 제외)** | 8px vs **40px** | ✅ `.slcn-shell-desktop__main` top `0→2rem`, `:has(.slcn-home-hub--desktop)`로 홈/로그인 제외 |
| **신발 추천 전체** | hero 44px/400→**32px/800**, 브랜드명 44px/400→**22px/800**, 카드명 32px/400→**18px/700**, 필터칩 솔리드→틴트, 배지 88→46px, 카드 radius 18→12px 등 | ✅ 다수 |
| **신발 상세 전체** | hero 64px/400→**34px/800**, 가격 18→**24px/800**, 뒤로가기 eyebrow→좌측 chevron 링크, 후기 2열그리드→**세로 스택+가로 카드**, 영상 16:9 | ✅ |
| **나들이 상세 드라이브 카드** | 제목 28px/400→**20px/700**, eyebrow 회색→**핑크 11px/700/대문자**, 카드 radius 18→24px, border 핑크 | ✅ |

## C. 모바일
| 항목 | 차이 | 수정 |
|---|---|---|
| **월별 캘린더 일정/달력** | 셀 cramped, 점 노출 빈약 | ✅ 셀 높이↑(min 3.25rem), 점 영역 정리(시각 6px/탭 24px 유지) |
| **주간 캘린더 전체** | FullCalendar 타임그리드 → 프로토는 **요일 선택 스트립 + 아젠다 리스트** | ✅ 신규 `CalendarWeekAgendaView`(모바일 전용), 데스크탑 주간은 타임그리드 유지 |
| **드라이브 카드** | (PC와 공통 CSS) | ✅ |
| **신발 추천/상세 전체** | (PC와 동일 수치, `.slcn-shell-mobile` 스코프, 모바일 1열 유지) | ✅ |

> **재확인된 전역 패턴**: 여러 제목/가격/eyebrow가 weight **400으로 렌더**(설계 700/800)되고 clamp 폰트가 과대했음 — 세션 4의 버튼 두께 버그와 동일 계열. 신발/상세/드라이브 카드에서 반복 발견·수정.

### 변경 파일(세션 5, 주요)
- 모달: `Modal.tsx`(align/titleVariant/titleIcon), `TripQuizModal.tsx`, `TripListSection.tsx`, `CalendarManageModal.tsx`, `CalendarEventModal.tsx`, `CalendarSection.tsx`
- 모바일 캘린더: `CalendarWeekAgendaView.tsx`(신규), `CalendarSection.tsx`, `components-mobile.css`
- 신발/상세: `ShoeCard.tsx`, `ShoeDetailSection.tsx`, `ShoeVideoPanel.tsx`, `components-common.css`, `components-pc.css`, `components-mobile.css`
- 드라이브 카드/헤더 간격: `components-common.css`, `components-pc.css`

### 검증(세션 5)
- 항목별 프로토타입 캡처/계산스타일 재측정 → 일치 확인(스크린샷 `product-after2/`).
- `pnpm test` **162/162**, `pnpm build` 성공, `biome` 신규 오류 없음. 기능(이벤트 클릭/생성, 모달 저장·삭제, 파일 업로드, 주간 아젠다 탭) 유지.

---

## 기술 메모

- **여행 날짜**: 백엔드 `2024-09-29` → 화면 `2024.09.29` (매퍼 정규식 처리)
- **Inter 폰트**: `@fontsource/inter` 패키지. `src/main.tsx`에서 400/600/700/800 import
- **캘린더**: FullCalendar 라이브러리. 내장 툴바 숨김(`display: none`), `CalendarToolbar` 컴포넌트로 대체
- **신발 그리드 CSS 스코핑**: 모바일/데스크탑이 동일 CSS 공유 → 모바일 전용 스타일은 `.slcn-shell-mobile` 부모 클래스로 스코핑 필요
- **백엔드 로그인 API**: `POST /api/user/login` 요청 body는 `{ username, password }` (not `{ id, password }`)
