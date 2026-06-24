# SLCN 전체 페이지 디자인 분석

작성일: 2026-06-18

이 문서는 현재 코드베이스를 Source of Truth로 삼아 SLCN 프론트엔드의 전체 화면, 라우트, 공통 컴포넌트, 상태, 디자인 문제를 정리한 디자인 분석 문서입니다. `DESIGN.md`, `docs/redesign.md`, `docs/design/design.pen`은 디자인 방향 참고로만 사용했습니다.

## 1. 프로젝트 분석 요약

| 항목 | 내용 |
| --- | --- |
| 서비스 이름 | SLCN / Seoul Chonnom |
| 목적 | 서울 나들이 기록, 일정 관리, 걷기 좋은 신발 추천을 담는 개인형 포토 저널 |
| 주요 사용자 | 인증된 일반 사용자, 관리자(admin) |
| 기술 스택 | Vite, React 19, TypeScript, React Router 7, React Query, Zustand, Zod, FullCalendar, Tailwind CSS v4 + 커스텀 CSS |
| 스타일 방식 | `src/styles/*.css`의 토큰/컴포넌트 CSS 중심. 주요 UI는 BEM 계열 클래스 |
| 디자인 기준 문서 | `DESIGN.md`, `docs/redesign.md`, `docs/design/design.pen` |
| 브랜드 방향 | Warm Paper, Seoul Pink, Ink 기반의 조용한 에디토리얼 포토 저널 |
| 라우팅 구조 | `/main/*`, `/mobile/*` 두 라우터 분리. 루트 `/`는 User-Agent로 redirect |
| 핵심 도메인 | `trip`, `calendar`, `shoes`, `auth` |

### 주요 프레임워크와 라이브러리

- React + TypeScript 기반 Vite 앱입니다.
- 라우팅은 React Router를 사용합니다.
- 서버 상태는 TanStack React Query로 관리합니다.
- 인증 세션은 Zustand store를 사용합니다.
- API 응답 검증은 Zod schema를 사용합니다.
- 일정 화면은 FullCalendar를 사용합니다.
- shadcn/ui, MUI, Ant Design 같은 외부 UI 컴포넌트 라이브러리는 사용하지 않고 자체 UI 컴포넌트를 사용합니다.

## 2. 전체 라우트 및 화면 목록

라우트 기준 파일:

- `src/app/router/route-constants.ts`
- `src/app/router/route-manifest.tsx`
- `src/app/router/main-routes.tsx`
- `src/app/router/mobile-routes.tsx`
- `src/app/router/render-device-routes.tsx`

| Desktop Route | Mobile Route | 화면 |
| --- | --- | --- |
| `/` | `/` | 디바이스 감지 후 `/main` 또는 `/mobile`로 이동 |
| `/main/login` | `/mobile/login` | 로그인 |
| `/main` | `/mobile` | 홈 허브 |
| `/main/map` | `/mobile/map` | 나들이 기록 목록 |
| `/main/map/register` | `/mobile/map/register` | 나들이 등록 3단계 Wizard |
| `/main/map/:id` | `/mobile/map/:id` | 나들이 상세 지도 |
| `/main/calendar?date=YYYY-MM-DD` | `/mobile/calendar?date=YYYY-MM-DD` | 월간 일정 |
| `/main/calendar/week?date=YYYY-MM-DD` | `/mobile/calendar/week?date=YYYY-MM-DD` | 주간 일정 |
| `/main/shoesRecom` | `/mobile/shoesRecom` | 신발 추천 카탈로그 |
| `/main/:brand/:shoesName` | `/mobile/:brand/:shoesName` | 신발 상세 |
| `/main/404` | `/mobile/404` | Not Found |

### 조건부 및 내부 화면

- 인증 확인 pending 화면: `세션을 확인하고 있어요.`
- lazy route loading 화면: `페이지를 불러오는 중입니다.`
- 나들이 퀴즈 모달: 로딩, 문항, 제출 중, 정답, 오답, 오류
- 일정 생성/수정 모달
- 캘린더 생성/수정/삭제 관리 모달
- 나들이 목록 empty, 검색 결과 없음, API 오류
- 나들이 상세 지도 이미지 로딩, 지도 파일 없음, API 오류
- 신발 상세 not found fallback
- 신발 상세 영상 패널: 영상 없음이면 미노출
- 캘린더 로딩 skeleton, API 오류, 캘린더 없음, 표시 캘린더 없음

## 3. 공통 레이아웃 분석

| 레이아웃 | 코드 | 구조 |
| --- | --- | --- |
| Desktop Shell | `src/app/shells/MainDesktopShell.tsx` | sticky desktop header, max-width 72rem main, footer |
| Mobile Shell | `src/app/shells/MainMobileShell.tsx` | sticky top bar, max-width 28rem main, fixed bottom nav |
| Mobile Detail Shell | `src/app/shells/DetailMobileShell.tsx` | top bar + back link, no bottom nav |
| Public Shell | `src/app/shells/PublicShell.tsx` | 로그인용 centered shell |
| Header/Nav | `src/components/layout/DesktopHeader.tsx`, `MobileBottomNav.tsx` | 홈, 나들이, 달력, 신발, 외부 필름 링크 |
| Footer | `src/components/layout/Footer.tsx` | desktop shell에만 표시 |

### 내비게이션 구조

공통 navigation item은 `src/components/layout/navigation-items.ts`에서 생성합니다.

- 홈
- 나들이
- 달력
- 신발
- 필름: 외부 링크 `http://naver.me/52RjLNuT`

Desktop은 상단 header에 nav list를 표시합니다. Mobile은 상단 app bar와 하단 nav를 사용합니다. Mobile detail shell에서는 하단 nav 없이 상단 back link만 표시합니다.

### 디자인 토큰

기준 파일:

- `src/styles/tokens.css`
- `DESIGN.md`
- `docs/design/design.pen`

| 분류 | 값 |
| --- | --- |
| Primary | `#FE9FC8` |
| Primary focus | `#FF7FB8` |
| Ink | `#1B1B1B` |
| Body muted | `#6F666A` |
| Canvas | `#FFF8F8` |
| Pure white | `#FFFFFF` |
| Soft surface | `#FFE8EF` |
| Muted surface | `#F8EEF1` |
| Divider | `rgba(27, 27, 27, 0.08)` |
| Hairline | `rgba(27, 27, 27, 0.12)` |
| Error | `#D64545` |
| Success | `#1F9D68` |
| Warning | `#F2A93B` |
| Font | `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Radius | 6, 8, 12, 18, 24, 9999px |
| Motion | 160ms, 240ms, 360ms |
| Shadow | 대부분 없음. image/modal/floating만 허용 |

## 4. 페이지별 상세 분석

### 4.1 로그인

#### 기본 정보

- 페이지 이름: 로그인
- 라우트: `/main/login`, `/mobile/login`
- 목적: 사용자 인증 후 redirect query 또는 device root로 이동
- 주요 사용자: 미인증 사용자
- 진입 경로: 로그인 URL 직접 접근, 보호 라우트 접근 시 자동 redirect
- 다음 화면: redirect target 또는 `/main`, `/mobile`

#### 콘텐츠 구조

1. Public shell 배경
2. 로그인 카드
3. SLCN 로고
4. 아이디 입력
5. 비밀번호 입력
6. Login 버튼
7. 오류 메시지

#### 주요 컴포넌트

- `Card`: 로그인 패널
- `SLCNLogoBlob`: 로고 이미지
- `TextField`: 아이디, 비밀번호
- `Button`: 로그인 submit
- clear icon button: 입력값 삭제

#### 사용자 행동

- 아이디 입력
- 비밀번호 입력
- 입력값 지우기
- 로그인 제출

#### 화면 상태

- 기본 상태
- 입력 focus
- clear button disabled/enabled
- 제출 중 loading
- 로그인 오류
- 이미 인증된 상태에서 redirect

#### 반응형 고려사항

현재 desktop/mobile 모두 같은 shared page를 사용합니다. 새 디자인에서는 desktop은 420~480px 폭의 안정적인 로그인 카드, mobile은 390px 화면에서 full-width에 가까운 카드로 설계해야 합니다.

#### 디자인 우선순위

로고, 입력 필드, Login CTA, 오류 메시지 순으로 강조합니다.

### 4.2 홈 허브

#### 기본 정보

- 페이지 이름: 홈 허브
- 라우트: `/main`, `/mobile`
- 목적: 주요 도메인으로 이동하는 시작점
- 주요 사용자: 인증된 사용자
- 진입 경로: 로그인 후 redirect, global nav home, root redirect
- 다음 화면: 나들이 목록, 달력, 신발 추천, 나들이 등록, 외부 Film Art

#### 콘텐츠 구조

Desktop:

1. Global header
2. 로고와 브랜드 인트로
3. 6개 패널: D-day, Calendar, Map, Shoes, Film, 새 나들이 기록
4. Footer

Mobile:

1. Mobile top bar
2. hero card
3. D-day / Film stats
4. 나들이, calendar, shoes action tiles
5. Mobile bottom nav

#### 주요 컴포넌트

- Logo
- Feature panel
- Stat
- Action tile
- External link
- Footer / bottom nav

#### 사용자 행동

- 도메인 이동
- 외부 Film Art 링크 열기
- 새 나들이 기록으로 이동

#### 화면 상태

- API 상태 없음
- D-day count는 `2024-11-10T00:00:00+09:00` 기준으로 계산
- 긴 제목과 모바일 overflow 고려 필요

#### 반응형 고려사항

현재 desktop과 mobile 마크업이 다릅니다. 새 디자인은 동일한 정보 구조를 desktop grid와 mobile action list로 변환할 수 있어야 합니다.

#### 디자인 우선순위

SLCN 브랜드, 주요 도메인 3개, D-day/Film, 새 기록 순으로 강조합니다.

### 4.3 나들이 기록 목록

#### 기본 정보

- 페이지 이름: 나들이 기록 목록
- 라우트: `/main/map`, `/mobile/map`
- 목적: 나들이 기록 검색과 퀴즈 기반 상세 접근
- 주요 사용자: 인증된 사용자, 관리자
- 진입 경로: 홈, global nav, mobile bottom nav
- 다음 화면: 퀴즈 모달, 상세 지도, 나들이 등록

#### 콘텐츠 구조

1. Desktop page header
2. 검색 hero card
3. 검색 input
4. 관리자용 새 기록 버튼
5. Trip card grid/list
6. 하단 설명
7. 퀴즈 모달

#### 주요 컴포넌트

- `PageSectionHeader`
- `Card`
- Search input
- `TripCard`
- `Skeleton`
- `EmptyState`
- `ErrorState`
- `TripQuizModal`

#### 표시 데이터

- `id`
- `date`
- `displayDate`
- `type`
- `name`
- `logo`

#### 사용자 행동

- 날짜, 이름, type으로 검색
- 관리자일 때 새 기록 이동
- 퀴즈 열기
- 정답이면 상세 지도 이동

#### 화면 상태

- 로딩 skeleton
- API 오류 + retry
- 전체 empty
- 검색 결과 없음
- 로고 이미지 loading
- 퀴즈 loading/submitting/error/success/failure

#### 반응형 고려사항

Desktop은 archive browsing에 적합한 grid 또는 editorial feed가 필요합니다. Mobile은 단일열 카드와 큰 CTA가 적합합니다.

#### 디자인 우선순위

나들이 이미지와 이름, 날짜/type, 퀴즈 CTA, admin 등록 CTA 순으로 강조합니다.

### 4.4 나들이 퀴즈 모달

#### 기본 정보

- 화면 이름: 나들이 퀴즈 모달
- 위치: 나들이 목록 내부
- 목적: 상세 지도 접근 전 퀴즈 확인
- 다음 화면: 정답 시 나들이 상세

#### 콘텐츠 구조

1. Modal title
2. Description 또는 quiz title
3. 보기 버튼 목록
4. Loading text
5. 오류와 retry
6. 정답/오답 feedback

#### 주요 컴포넌트

- `Modal`
- `Button`
- Status text
- Error message

#### 표시 데이터

- `tripName`
- `quiz.title`
- `quiz.options`
- `feedback.title`
- `feedback.description`
- `feedback.isCorrect`

#### 사용자 행동

- 보기 선택
- retry
- 닫기
- 정답 확인 후 상세 이동

#### 화면 상태

- loading
- answer options
- submitting disabled
- error
- correct
- incorrect

#### 반응형 고려사항

Desktop은 centered modal, mobile은 bottom sheet 또는 full-width modal이 적합합니다.

#### 디자인 우선순위

질문, 보기, 결과 CTA 순으로 강조합니다.

### 4.5 나들이 등록 Wizard

#### 기본 정보

- 페이지 이름: 나들이 등록
- 라우트: `/main/map/register`, `/mobile/map/register`
- 목적: 관리자용 나들이 기록 생성
- 진입 경로: 나들이 목록 admin CTA, 홈 새 기록 패널
- 다음 화면: 성공 후 나들이 목록

#### 콘텐츠 구조

1. Desktop page header
2. Wizard card
3. Step indicator: 기본 정보, 지도 정보, 퀴즈 정보
4. Step 1: type, date, name, logo
5. Step 2: map1, optional map2, map switch labels, drive URL
6. Step 3: quiz title, options, answer, success/error copy
7. 이전/다음/저장 actions

#### 주요 컴포넌트

- Step progress
- `RadioGroup`
- `TextField`
- `FileDropzone`
- `Button`
- Inline error

#### 표시 데이터

- `type`
- `date`
- `info2`
- `logo`
- `map1`
- `hasSecondMap`
- `map2`
- `button1`
- `button2`
- `drive`
- `quizTitle`
- `quizOptions`
- `quizAnswer`
- `quizAnswerTitle`
- `quizAnswerText`
- `quizErrorTitle`
- `quizErrorText`

#### 사용자 행동

- type 선택
- 날짜와 이름 입력
- 파일 업로드
- 2번 지도 추가/삭제
- 퀴즈 작성
- 단계 이동
- 저장

#### 화면 상태

- 필드 validation error
- 파일 없음
- 파일 형식 오류
- 10MB 초과
- submit loading
- submit error
- success redirect

#### 반응형 고려사항

Mobile은 detail shell을 사용합니다. 390px에서는 한 step씩 단일열로 보여주고 progress와 현재 step을 강하게 보여줘야 합니다.

#### 디자인 우선순위

현재 step, 필수 입력, 오류, next/save CTA 순으로 강조합니다.

### 4.6 나들이 상세

#### 기본 정보

- 페이지 이름: 나들이 상세 지도
- 라우트: `/main/map/:id`, `/mobile/map/:id`
- 목적: 퀴즈 통과 후 지도 이미지와 드라이브 링크 제공
- 진입 경로: 퀴즈 정답 후 이동
- 다음 화면: 외부 드라이브 링크

#### 콘텐츠 구조

1. Page section header
2. 두 지도 있을 때 segmented switcher
3. 지도 이미지 card
4. Drive card

#### 주요 컴포넌트

- `PageSectionHeader`
- `SegmentedControl`
- Image viewer card
- `Skeleton`
- `EmptyState`
- `Button`

#### 표시 데이터

- `firstMap`
- `secondMap`
- `nextButtonText`
- `previousButtonText`
- `driveUrl`

#### 사용자 행동

- 지도 전환
- 드라이브 링크 새 창 열기

#### 화면 상태

- API loading
- API error
- map asset loading
- map asset unavailable
- single map
- two maps

#### 반응형 고려사항

Mobile은 지도 이미지를 확대해서 볼 수 있는 affordance가 필요합니다. Drive CTA는 지도 아래 명확히 배치해야 합니다.

#### 디자인 우선순위

지도 이미지, 지도 전환, 드라이브 CTA 순으로 강조합니다.

### 4.7 월간/주간 일정

#### 기본 정보

- 페이지 이름: 월간 일정 / 주간 일정
- 라우트: `/main/calendar`, `/main/calendar/week`, `/mobile/calendar`, `/mobile/calendar/week`
- query: `date=YYYY-MM-DD`
- 목적: 일정 조회와 CRUD
- 진입 경로: 홈, nav
- 다음 화면: 일정 모달, 캘린더 관리 모달

#### 콘텐츠 구조

1. Calendar toolbar
2. Eyebrow
3. 현재 월/주 label
4. 이전 / Today / 다음
5. 월/주 segmented control
6. 일정 추가 버튼
7. 캘린더 필터 chips
8. 캘린더 관리 버튼
9. FullCalendar month/week surface
10. empty/error/loading state

#### 주요 컴포넌트

- `CalendarToolbar`
- `SegmentedControl`
- Calendar filter chip
- FullCalendar month grid
- FullCalendar week time grid
- Event pill/block
- `Skeleton`
- `EmptyState`
- `ErrorState`
- `CalendarEventModal`
- `CalendarManageModal`

#### 표시 데이터

Calendar:

- `id`
- `name`
- `backgroundColor`
- `borderColor`
- `textColor`
- `visible`
- `editable`
- `startEditable`
- `durationEditable`
- `defaultSelected`
- `sortOrder`

Schedule:

- `id`
- `calendarId`
- `title`
- `body`
- `start`
- `end`
- `allDay`
- `location`

#### 사용자 행동

- 이전/오늘/다음 이동
- 월/주 전환
- calendar chip toggle
- 일정 추가
- 날짜 클릭
- 범위 선택
- 이벤트 클릭 수정
- drag/drop
- resize

#### 화면 상태

- loading skeleton
- API error + retry
- no calendars
- no visible calendars
- create disabled
- read-only calendar
- many events
- event overflow

#### 반응형 고려사항

현재 mobile은 FullCalendar를 그대로 축소합니다. 새 디자인에서는 mobile 월간은 compact month + agenda list 또는 day detail bottom sheet로 재설계해야 합니다. 주간은 horizontal day tabs + selected day agenda 또는 scrollable week timeline이 적합합니다.

#### 디자인 우선순위

현재 날짜 범위, 일정 event, 필터 상태, 일정 추가 순으로 강조합니다.

### 4.8 일정 생성/수정 모달

#### 기본 정보

- 화면 이름: 일정 생성/수정 모달
- 위치: Calendar 내부
- 목적: schedule CRUD

#### 콘텐츠 구조

1. Title: 일정 만들기 또는 일정 수정
2. Calendar select
3. 제목
4. 설명 textarea
5. 장소
6. 종일 일정 checkbox
7. 시작일/시작 시각
8. 종료일/종료 시각
9. error message
10. 삭제/취소/저장 actions

#### 사용자 행동

- 일정 작성
- 저장
- 수정
- 삭제
- 취소

#### 화면 상태

- 생성 모드
- 수정 모드
- submitting
- validation error
- API error
- delete confirm 필요
- editable calendar 없음

#### 반응형 고려사항

Desktop은 centered modal, mobile은 bottom sheet 또는 full-screen form이 적합합니다.

#### 디자인 우선순위

제목, 시간, 캘린더, 저장 CTA 순으로 강조합니다.

### 4.9 캘린더 관리 모달

#### 기본 정보

- 화면 이름: 캘린더 관리 모달
- 위치: Calendar 내부
- 목적: 캘린더 생성/수정/삭제

#### 콘텐츠 구조

1. Modal title
2. 캘린더 목록 library
3. 새 캘린더 버튼
4. 캘린더 카드: color swatch, name, 수정 가능/읽기 전용 badge
5. 이름 입력
6. 배경/테두리/텍스트 색상 picker + hex input
7. 정렬 순서
8. 권한 toggles
9. error message
10. 삭제/닫기/저장

#### 사용자 행동

- 새 캘린더 생성
- 기존 캘린더 선택
- 색상 변경
- 권한 변경
- 저장
- 삭제

#### 화면 상태

- active selected
- read-only badge
- disabled dependent toggles
- validation error
- submit loading
- delete confirm 필요

#### 반응형 고려사항

Desktop은 library와 form 2 columns, mobile은 stacked sections 또는 tabs가 적합합니다.

#### 디자인 우선순위

캘린더 선택 상태, 색상 preview, 저장/삭제 순으로 강조합니다.

### 4.10 신발 추천 카탈로그

#### 기본 정보

- 페이지 이름: 신발 추천 카탈로그
- 라우트: `/main/shoesRecom`, `/mobile/shoesRecom`
- 목적: 브랜드별 걷기 좋은 신발 추천 탐색
- 다음 화면: 신발 상세

#### 콘텐츠 구조

1. Desktop intro card
2. Brand anchor nav
3. Brand section
4. Shoe card grid
5. Desktop warning card
6. Empty state

#### 주요 컴포넌트

- Intro section
- Brand nav chip
- Brand header
- `ShoeCard`
- Price
- Warning note
- `EmptyState`

#### 표시 데이터

- brand name
- brand desc
- brand image
- shoe name
- shoe desc
- shoe price
- shoe image

#### 사용자 행동

- 브랜드 앵커 이동
- 신발 상세 이동

#### 화면 상태

- catalog empty
- image missing/failure 필요
- long product name
- hover/focus

#### 반응형 고려사항

Desktop은 3열 product grid, mobile은 1열 cards와 sticky horizontal brand chips가 적합합니다.

#### 디자인 우선순위

신발 이미지, 상품명, 가격, 상세 보기 순으로 강조합니다.

### 4.11 신발 상세

#### 기본 정보

- 페이지 이름: 신발 상세
- 라우트: `/main/:brand/:shoesName`, `/mobile/:brand/:shoesName`
- 목적: 신발 상세 정보, 영상, 착용 후기 확인
- 진입 경로: 신발 카탈로그 shoe card
- 다음 화면: 외부 영상/후기 링크, 카탈로그

#### 콘텐츠 구조

1. Desktop header and back link
2. Warning card
3. Product hero image
4. Summary card
5. Optional video panel
6. Reviews section
7. Invalid slug fallback

#### 주요 컴포넌트

- Back link
- Warning card
- Product hero
- Fact list
- Video panel
- Review card
- Fallback card

#### 표시 데이터

- brand
- shoe name
- desc
- price
- image
- info list
- video link/url/description
- reviews

#### 사용자 행동

- 목록으로 돌아가기
- video 재생
- 영상 링크 열기
- 후기 링크 열기

#### 화면 상태

- valid detail
- invalid slug fallback
- no video
- external image loading/failure 필요
- long facts/review caption

#### 반응형 고려사항

Desktop은 image and summary side-by-side, mobile은 image first, summary below, video/reviews single column이 적합합니다.

#### 디자인 우선순위

제품 이미지, 이름/가격, facts, 영상, 후기 순으로 강조합니다.

### 4.12 404 / Loading / Auth Pending

#### 404

- 라우트: `/main/404`, `/mobile/404`
- 콘텐츠: card, 제목, 설명, 홈으로 돌아가기
- 상태: 기본, hover/focus

#### Route Loading

- lazy page loading 시 표시
- 콘텐츠: loading card
- 개선 필요: skeleton 또는 더 명확한 loading 상태

#### Auth Pending

- session hydrating/restoring 중 표시
- 콘텐츠: `세션을 확인하고 있어요.`
- `aria-live="polite"` 적용됨

## 5. 공통 컴포넌트 목록

| 컴포넌트 | 실제 사용 | 필요한 변형/상태 |
| --- | --- | --- |
| Button / LinkButton | 전체 | primary, secondary, ghost, danger, sm/md/lg, fullWidth, loading, disabled |
| TextField / TextareaField | 로그인, 등록, 캘린더 | label, required, hint, error, disabled, leading/trailing |
| Card | 전체 | default, muted, pink, featured/section 용도 |
| Modal | 퀴즈, 일정, 캘린더 관리 | title, description, close, backdrop, focus trap, mobile bottom-sheet 변형 권장 |
| EmptyState | trip, calendar, shoes | icon, title, description, optional action |
| ErrorState | trip, calendar | title, description, retry |
| Skeleton | trip, calendar, asset | 카드/지도/패널 skeleton |
| FileDropzone | trip register | drag/drop, selected filename, error |
| RadioGroup | trip register | selected, error, option description |
| SegmentedControl | calendar view, map switcher | active/inactive, compact |
| Navigation | header, topbar, bottom nav | active, external item, back |
| Select | calendar modal | native select 현재 구현 |
| Checkbox/Switch | calendar modal | all-day, permissions |
| Badge/Chip | calendar filter, trip tags, calendar status | active/inactive, color swatch |
| Toast | 현재 없음 | 저장/삭제 성공 feedback에 재사용 가치 있음. optional |
| Tooltip | 현재 없음 | 아이콘 버튼/색상/외부 링크 설명에 필요 시 사용 |
| Pagination/Table | 현재 주요 화면에 없음 | 디자인 시스템에 필수로 추가하지 않음 |

## 6. 현재 디자인의 문제점

실제 코드에서 확인한 문제:

1. `pink-mesh`가 shell/header/footer/dropzone/empty에 여전히 적용되어 Warm Paper 중심 원칙과 충돌합니다.
   - 근거: `src/styles/utilities.css`, `MainDesktopShell.tsx`, `MainMobileShell.tsx`, `DesktopHeader.tsx`, `MobileTopBar.tsx`, `MobileBottomNav.tsx`

2. `display-hand`, `blob`, `slcn-logo-blob`, modal sticker 등 이전 scrapbook 네이밍/장식 잔재가 남아 있습니다.
   - 근거: `src/components/ui/Modal.tsx`, `src/components/ui/Card.tsx`, `src/styles/utilities.css`

3. Desktop max width가 72rem 중심이라 `DESIGN.md`의 1080/1440 container 체계와 완전히 맞지 않습니다.
   - 근거: `src/styles/components-pc.css`

4. Mobile max width 28rem 고정으로 390px 화면에는 맞지만 태블릿/반응형 확장이 약합니다.
   - 근거: `src/styles/components-mobile.css`

5. 입력 placeholder가 `…` 없이 단순 복붙 형태이고 일부 영문/한글 톤이 섞입니다.
   - 근거: `LoginPage.tsx`, `TripRegisterStep*.tsx`

6. CSS에 `outline: none`이 있어 control wrapper 중심의 focus style 보강이 필요합니다.
   - 근거: `src/styles/components-common.css`

7. Calendar 삭제는 즉시 API 호출이며 별도 확인/undo가 없습니다.
   - 근거: `CalendarEventModal.tsx`, `CalendarManageModal.tsx`

8. Mobile calendar는 FullCalendar 화면을 축소하는 방식이라 정보 밀도와 터치 조작성이 부족할 가능성이 큽니다.
   - 구분: 추론. 코드상 별도 모바일 일정 UI가 없고 같은 `CalendarSection`/FullCalendar를 사용합니다.

9. 신발 리뷰 외부 이미지는 width/height 지정이 없어 CLS와 실패 상태 대응이 약합니다.
   - 근거: `ShoeReviewCard.tsx`

10. 홈의 desktop 새 기록 패널은 관리자 여부와 관계없이 표시됩니다.
    - 구분: 추론. 실제 등록 권한은 API/라우트에서 제한될 수 있으나 UX상 admin 전용 노출 여부 정리가 필요합니다.

## 7. 디자인 개선 우선순위

1. IA 통합: `/main`과 `/mobile`을 같은 정보 구조로 설계하고 viewport별 레이아웃만 달리 표현합니다.
2. 브랜드 일관성: Warm Paper 중심, Seoul Pink는 action/selection, gradient는 매우 제한합니다.
3. 사진 우선순위: 나들이 지도/로고, 신발 이미지, 후기 이미지를 카드 장식보다 크게 보여줍니다.
4. Calendar 모바일 재설계: compact month + agenda/list + bottom sheet 모달을 고려합니다.
5. 상태 디자인 보강: loading, empty, error, no result, permission/read-only, destructive confirm을 명확히 설계합니다.
6. 폼 UX 정리: wizard 진행률, inline error, 파일 업로드 preview, 삭제 확인을 강화합니다.
7. 접근성: focus-visible, 터치 타깃 44px, icon labels, reduced motion, 이미지 dimensions/fallback을 반영합니다.

## 8. 분석하지 못했거나 확인이 필요한 항목

- 실제 API 응답 샘플은 코드 스키마와 타입으로만 확인했습니다. 운영 데이터의 길이, 이미지 비율, 일정 밀도는 확인 필요합니다.
- 브라우저 실행 스크린샷 검증은 하지 않았습니다.
- `docs/design/design.pen`은 top-level 화면과 변수만 확인했습니다. 세부 node 단위 시각 검수는 별도 디자인 리뷰 작업으로 분리하는 것이 적절합니다.
- 권한 정책상 홈의 “새 나들이 기록하기” 노출을 admin 전용으로 바꿀지 제품 결정이 필요합니다.
- Calendar 삭제 UX는 코드상 confirm이 없어, 디자인 결과물에서는 confirm/undo를 요구하는 것이 적절하지만 구현 정책 확인이 필요합니다.
