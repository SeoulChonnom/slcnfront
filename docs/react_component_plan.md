# SLCN React 컴포넌트 구성 계획

## 1. 목적

이 문서는 현재까지 정리된 Stitch PC 디자인, Pencil Mobile 디자인, 기존 Vue 구현, 그리고 최신 Web Interface Guidelines를 기준으로 SLCN의 React 컴포넌트 구성을 계획한다.

핵심 원칙은 아래 3가지다.

- 기능 보존: 기존 라우트와 데이터 구조를 잃지 않는다.
- 디자인 일관성: 현재 확정된 Pencil/Stitch 화면을 하나의 React App Shell 아래로 수렴한다.
- 반응형 동시 지원: 같은 라우트에서 PC와 Mobile을 함께 지원하고, 데이터/도메인 로직은 공통으로 유지한다.
- 웹 접근성: WCAG 2.1 AA 수준을 목표로 기본 컴포넌트 단계부터 접근성을 내장한다.

## 2. 제품 방향

### 2.1 UI 방향

`frontend-design` 기준으로 SLCN은 평범한 SaaS형 UI보다, 다음 성격이 더 맞다.

- 톤: playful editorial + hand-drawn accent
- 인상 포인트: 핑크 배경, 블랙 스트로크, 손글씨 제목, 라운드/블롭 카드
- 구현 원칙:
  - Display font와 UI font를 분리한다.
  - 단색 배경으로 끝내지 않고, subtle texture 또는 soft gradient layer를 둔다.
  - 애니메이션은 많게가 아니라 "등장 순간" 중심으로 제한한다.
  - 메인 카드, CTA, 세그먼트, 업로드 박스 등 핵심 인터랙션은 모양과 대비가 분명해야 한다.

### 2.2 접근성 방향

`web-design-guidelines` 기준으로 아래를 공통 규칙으로 채택한다.

- 버튼은 항상 `button`, 이동은 항상 `Link` 또는 `a`
- 아이콘 전용 버튼은 반드시 `aria-label`
- 입력 필드는 모두 `label` 연결
- 비동기 상태/검증 메시지는 `aria-live="polite"`
- 포커스 링은 제거하지 않고 `:focus-visible`로 명확하게 표시
- 모달/드로어는 키보드 탐색, ESC 닫기, 포커스 트랩 보장
- 플레이스홀더는 예시형 문구로 쓰고 `…` 사용
- 에러는 필드 옆 인라인 노출, 제출 시 첫 번째 에러 필드로 포커스 이동
- 긴 텍스트/긴 파일명/긴 상품명/긴 일정명은 `min-w-0`, `truncate`, `break-words` 기준 적용
- 이미지에는 `alt`, 크기에는 `width/height` 또는 고정 비율 지정

## 3. 반응형 동시 지원 전략

### 3.1 기본 원칙

이번 React 전환은 `PC 전용 화면`과 `Mobile 전용 화면`을 따로 만드는 방식이 아니다. 같은 route를 유지한 채, 레이아웃만 브레이크포인트별로 분기한다.

- 도메인 로직, 상태, 데이터 모델은 공통 유지
- 내비게이션, 레이아웃, 카드 배치만 반응형 분기
- 하위 UI 프리미티브는 최대한 공통 재사용
- 구조 차이가 큰 경우에만 `Desktop*`, `Mobile*` 컴포넌트를 별도 둔다

### 3.2 브레이크포인트

- Mobile: `0-767px`
- Tablet: `768-1279px`
- Desktop: `1280px+`

### 3.3 레이아웃 원칙

- Desktop
  - 상단 `GlobalHeader`
  - 넓은 centered container
  - 2열 이상 그리드 적극 사용
  - Footer 노출
- Mobile
  - `TopAppBar` 또는 간소화 헤더
  - `BottomNav` 중심 탐색
  - 단일 열 스택
  - Sticky CTA 적극 사용
- Tablet
  - Desktop 구조를 유지하되 열 수와 여백만 축소

### 3.4 구현 원칙

- 레이아웃은 CSS Grid/Flex 우선
- `overflow-x-hidden`, `min-w-0`를 기본 원칙으로 적용
- 긴 텍스트는 `truncate`, `line-clamp`, `break-words` 전략을 사전에 포함
- 접근성 구조는 PC/Mobile 모두 동일한 landmark와 heading 체계를 유지

## 4. 라우트 기준 화면 구성

### 4.1 대상 라우트

- `/login`
- `/`
- `/map`
- `/map/register`
- `/map/:date`
- `/calendar`
- `/calendar/week`
- `/shoesRecom`
- `/:brand/:shoesName`
- `*`

### 4.2 범위 제외

- `MyPage`
- `Record`
- `Membership`
- `Profile`

## 5. 상위 아키텍처

### 5.1 폴더 구조 초안

```text
src/
  app/
    router/
    providers/
    layouts/
  components/
    ui/
    icons/
    motion/
  domains/
    auth/
    home/
    trip/
    calendar/
    shoes/
    common/
  pages/
    LoginPage/
    HomePage/
    TripListPage/
    TripRegisterPage/
    TripDetailPage/
    CalendarMonthPage/
    CalendarWeekPage/
    ShoeCatalogPage/
    ShoeDetailPage/
    NotFoundPage/
  hooks/
  lib/
  styles/
  types/
```

### 5.2 레이어 원칙

- `pages`: 라우트 엔트리와 화면 조립만 담당
- `domains`: 기능별 컨테이너, 훅, 도메인 컴포넌트
- `components/ui`: 버튼, 필드, 모달, 시트, 세그먼트 등 공통 프리미티브
- `app/layouts`: AppShell, Header, BottomNav, PageContainer
- `lib`: API client, formatter, validation, query config

### 5.3 반응형 파일 분리 원칙

구조 차이가 큰 화면은 아래 패턴을 기준으로 구성한다.

```text
domains/trip/list/
  TripListSection.tsx
  TripListDesktop.tsx
  TripListMobile.tsx
  TripCard.tsx
```

- `Section`: 데이터 로딩과 브레이크포인트 분기 담당
- `Desktop` / `Mobile`: 레이아웃만 담당
- `TripCard` 같은 하위 UI는 공통 재사용

## 6. 공통 레이아웃 계획

### 6.1 `AppShell`

책임:

- 헤더/메인/푸터/모바일 하단 내비 배치
- 안전 영역(safe area) 처리
- 페이지별 헤더 타입 분기

props 초안:

```ts
type AppShellProps = {
  header?: 'global' | 'back' | 'minimal' | 'none';
  bottomNav?: boolean;
  footer?: boolean;
  pageTitle?: string;
  backTo?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};
```

접근성:

- `<a href="#main-content">본문으로 건너뛰기</a>` 제공
- `main`에 `id="main-content"`
- sticky header 가릴 수 있으므로 heading anchor에 `scroll-margin-top` 적용

반응형 정책:

- Desktop/Tablet: `header="global"`, `footer=true`
- Mobile 목록형 화면: `bottomNav=true`, `footer=false`
- Mobile 상세/등록 화면: `header="back"`, `bottomNav=false`, `footer=false`

### 6.2 `GlobalHeader`

구성:

- 좌측 로고
- 중앙 또는 우측 GNB
- 우측 사용자/보조 액션

메뉴:

- 나들이 기록
- 일정
- 신발 추천
- 필름

접근성:

- `<nav aria-label="주요 메뉴">`
- 현재 경로는 `aria-current="page"`
- 모바일 메뉴 버튼이 생기면 `aria-expanded`, `aria-controls` 제공

### 6.3 `TopAppBar`

모바일 상세/등록 전용 상단 바.

- 뒤로가기
- 타이틀
- 선택적 우측 액션

접근성:

- 뒤로가기 아이콘 버튼은 `aria-label`
- 라우트 이동이면 `button`보다 `Link` 우선
- 긴 제목은 시각적으로 말줄임, 접근성 이름은 전체 제목 유지

### 6.4 `BottomNav`

모바일 전용.

탭:

- 홈
- 나들이
- 일정
- 신발
- 필름

접근성:

- 탭처럼 보이더라도 라우팅이므로 `Link`
- 아이콘만 쓰지 말고 텍스트 병기
- 활성 상태 대비 강화
- 터치 영역 최소 44x44 확보

## 7. 페이지별 반응형 매핑

| Route | Desktop/Tablet | Mobile |
| --- | --- | --- |
| `/login` | 중앙 카드형 로그인 | 세로 스택 로그인 + 키보드 대응 CTA |
| `/` | 2x3 블롭 카드 그리드 | 2열 또는 1열 카드 스택 + BottomNav |
| `/map` | 상단 타이틀 + 검색 + 리스트 | AppBar + 단일 열 카드 + 하단 CTA |
| `/map/register` | 넓은 중앙 컬럼 step form | 단일 열 step form + sticky action |
| `/map/:date` | 지도 중심 + 정보 카드 | 상단 AppBar + 단일 열 + sticky CTA |
| `/calendar` | 월간 그리드 중심 | compact month grid + BottomNav |
| `/calendar/week` | 시간축 + 7일 컬럼 | 세로 스크롤 주간 뷰 |
| `/shoesRecom` | 브랜드별 분할 카탈로그 | 브랜드 섹션 세로 스택 |
| `/:brand/:shoesName` | 이미지 + 정보 2열 | 이미지/설명/리뷰 순차 스택 |

## 8. 공통 UI 컴포넌트 계획

### 8.1 기본 프리미티브

- `Button`
- `IconButton`
- `TextField`
- `TextAreaField`
- `RadioGroupField`
- `FileUploadField`
- `SegmentedControl`
- `Chip`
- `Card`
- `Dialog`
- `Drawer`
- `ToastRegion`
- `EmptyState`
- `ErrorState`
- `Skeleton`

### 8.2 공통 규칙

#### `Button`

- `variant`: `primary | secondary | ghost | danger`
- `size`: `sm | md | lg`
- `loading` 상태 제공
- 제출 시작 전까지 disable 금지, 요청 시작 시에만 disabled

접근성:

- 아이콘 전용이면 `aria-label` 필수
- `transition: all` 금지
- `:focus-visible` 링 제공

반응형:

- Mobile 기본 높이 48px 이상
- Desktop에서는 compact variant 허용

#### `TextField`

- `label`, `name`, `id`, `error`, `hint`, `required`
- `aria-describedby`로 도움말/에러 연결
- `autocomplete`, `inputMode`, `spellCheck` 정책 포함

예:

- 로그인 아이디: `name="username"`, `autoComplete="username"`
- 비밀번호: `autoComplete="current-password"`
- 드라이브 링크: `type="url"`
- 정답 번호: `inputMode="numeric"`

반응형:

- Mobile은 라벨/필드 세로 고정
- Desktop은 2열 필드 그룹 허용

#### `Dialog`

- 퀴즈 모달, 일정 등록/수정, 삭제 확인 공용 기반

접근성:

- `role="dialog"` 또는 `alertdialog`
- `aria-modal="true"`
- ESC 닫기
- 최초 포커스 지정
- 닫힌 후 트리거로 포커스 복귀
- 모달 내부 `overscroll-behavior: contain`

반응형:

- Desktop: centered modal
- Mobile: bottom sheet variant 지원

## 9. 페이지별 컴포넌트 구성

### 9.1 로그인 `/login`

구성:

- `LoginPage`
- `AuthHero`
- `LoginForm`
- `SessionRestoreGate`

세부:

- `LoginForm`
  - `TextField(username)`
  - `TextField(password)`
  - `PasswordToggleButton`
  - `SubmitButton`
  - `InlineError`

반응형 구성:

- Desktop: `AuthHero + LoginCard`
- Mobile: `MobileLoginStack + StickySubmitArea`

접근성:

- 비밀번호 토글 버튼 `aria-label="비밀번호 보기"` / `aria-label="비밀번호 숨기기"`
- 로딩 텍스트는 `로그인 중…`
- 자동 로그인 시 `aria-live="polite"` 영역에서 상태 전달

### 9.2 메인 `/`

구성:

- `HomePage`
- `DashboardHero`
- `FeatureBlobGrid`
- `FeatureBlobCard`
- `RecentTripPreviewStrip`

카드:

- D-day
- 나들이 기록
- 일정
- 신발 추천
- 필름
- 새 나들이 기록하기

반응형 구성:

- Desktop: `FeatureBlobGridDesktop`
- Mobile: `FeatureBlobGridMobile`

접근성:

- 카드 클릭형 UI는 `button` 또는 `Link`로 구현
- 카드 전체가 인터랙티브면 hover/focus/active 상태를 모두 제공
- 숫자 표시는 `font-variant-numeric: tabular-nums`

### 9.3 나들이 목록 `/map`

구성:

- `TripListPage`
- `TripListHeader`
- `TripSearchBar`
- `TripCardList`
- `TripCard`
- `QuizDialog`
- `TripCreateStickyBar`

`TripCard` 내부:

- 로고
- 날짜
- 나들이 이름
- CTA: `퀴즈 풀기`

반응형 구성:

- Desktop: `TripListHeader + TripCardListDesktop`
- Mobile: `TopAppBar + TripCardListMobile + TripCreateStickyBar`

접근성:

- 검색창은 `type="search"`
- 결과 없음 시 `EmptyState`
- 카드 액션은 한 포커스 타겟으로 정리
- 퀴즈 선택지는 라디오 그룹으로 구현

### 9.4 나들이 등록 `/map/register`

구성:

- `TripRegisterPage`
- `StepProgress`
- `TripRegisterForm`
- `TripBasicStep`
- `TripMediaStep`
- `TripQuizStep`
- `StepActionBar`

반응형 구성:

- Desktop: 중앙 컬럼형 wizard
- Mobile: 단일 열 wizard + 하단 고정 action bar

#### Step 1. 기본 정보

- `TripTypeRadioGroup`
- `DateField`
- `TripNameField`
- `DriveLinkField`

#### Step 2. 미디어/경로

- `LogoUploadField`
- `MapUploadField`
- `MultiMapToggle`
- `Map2UploadField`
- `RouteButtonLabelField`

#### Step 3. 퀴즈

- `QuizTitleField`
- `QuizOptionField x4`
- `QuizAnswerNumberField`
- `QuizSuccessMessageFields`
- `QuizErrorMessageFields`

접근성:

- 스텝 헤더는 시각 요소만이 아니라 현재 단계 텍스트를 읽어줘야 함
- 파일 업로드는 drag 영역이 있어도 실제 `<input type="file">` 연결 유지
- 스텝 전환 시 첫 필드로 포커스 이동
- 이탈 시 미저장 경고 필요

주의:

- 기존 값 기준으로 현재 라벨은 `정답1~4`를 유지하되, React 구현 시 내부 설명 텍스트로 혼란을 줄이는 것이 좋다.
- 이후 정책이 바뀌면 UI 라벨만 `선택지1~4`로 바꿀 수 있게 분리한다.

### 9.5 나들이 상세 `/map/:date`

구성:

- `TripDetailPage`
- `TripDetailHero`
- `MapSegmentedControl`
- `TripMapViewer`
- `DriveInfoCard`
- `DriveLinkButton`

반응형 구성:

- Desktop: 지도와 정보 블록 분리
- Mobile: 지도 우선 단일 열 + sticky CTA

접근성:

- 지도 전환은 `button` 기반 세그먼트
- 현재 선택 탭은 `aria-pressed` 또는 tabs 패턴 사용
- 드라이브 링크는 새 창이면 안내 텍스트 제공

### 9.6 일정 월간 `/calendar`

구성:

- `CalendarMonthPage`
- `CalendarToolbar`
- `CalendarMonthGrid`
- `CalendarDayCell`
- `CalendarEventChip`
- `ScheduleEditorDialog`

반응형 구성:

- Desktop: full month grid
- Mobile: compact month grid + 하단 sheet/dialog

기술 원칙:

- 월간/주간을 같은 데이터 모델로 다룬다.
- 월간 먼저 안정화하고 주간은 같은 domain layer를 재사용한다.

접근성:

- 날짜 셀은 키보드 이동 가능해야 한다.
- 일정 생성/수정/삭제 피드백은 `aria-live`
- 삭제는 즉시 실행 금지, 확인 모달 필요
- 날짜/시간 표시는 `Intl.DateTimeFormat`

### 9.7 일정 주간 `/calendar/week`

구성:

- `CalendarWeekPage`
- `WeekRangeHeader`
- `WeekTimeline`
- `WeekColumn`
- `WeekEventCard`

반응형 구성:

- Desktop: 시간축 + 7일 컬럼
- Mobile: 세로 스크롤 가능한 주간 뷰

주의:

- React 라이브러리가 주간 뷰 품질을 못 맞추면 커스텀 구현 또는 범위 축소 가능
- 페이지 컴포넌트는 유지하되, 내부 렌더러를 교체 가능하게 분리

접근성:

- 시간축/요일축이 스크린리더에서 의미를 잃지 않게 heading/label 구조 부여
- 가로 스크롤이 있으면 스크롤 힌트 제공

### 9.8 신발 추천 목록 `/shoesRecom`

구성:

- `ShoeCatalogPage`
- `BrandAnchorNav`
- `BrandSection`
- `ShoeCard`

데이터:

- `globalShoes` 기준
- 브랜드: `뉴발란스`, `나이키`, `아식스`

반응형 구성:

- Desktop: 브랜드 anchor nav + 다열 카드
- Mobile: 브랜드 섹션 세로 스택

접근성:

- 브랜드 앵커 이동은 `Link`
- 섹션 제목은 heading hierarchy 유지
- 이미지 카드에는 제품명 `alt`

### 9.9 신발 상세 `/:brand/:shoesName`

구성:

- `ShoeDetailPage`
- `ShoeHero`
- `ShoeInfoList`
- `ShoeVideoBlock`
- `ShoeReviewGallery`
- `BackLinkBar`

조건부:

- 영상 없는 상품은 `ShoeVideoBlock` 미렌더
- 리뷰 이미지 2장, 외부 링크 2개는 데이터 기반 렌더

반응형 구성:

- Desktop: hero image + info 2열
- Mobile: 이미지/설명/리뷰 순차 스택

접근성:

- 리뷰 카드가 링크면 `a`
- 외부 이동은 새 창 안내 필요
- 긴 설명은 `break-words`

## 10. 도메인별 커스텀 훅 계획

- `useAuthSession`
- `useLoginMutation`
- `useTripListQuery`
- `useTripDetailQuery`
- `useTripRegisterForm`
- `useQuizDialog`
- `useScheduleMonth`
- `useScheduleWeek`
- `useScheduleEditor`
- `useShoeCatalog`
- `useShoeDetail`

원칙:

- 서버 상태는 TanStack Query
- 폼 상태는 `react-hook-form`
- 복잡한 UI 흐름은 domain hook 또는 reducer

## 11. 디자인 시스템 토큰 계획

### 9.1 토큰

- 색상
  - `--color-bg: #fe9fc8`
  - `--color-fg: #111111`
  - `--color-surface: #ffffff`
  - `--color-border: #111111`
  - `--color-muted: rgba(17,17,17,0.56)`
- 반경
  - `--radius-sm`
  - `--radius-md`
  - `--radius-lg`
  - `--radius-blob-*`
- 그림자
  - `--shadow-card`
  - `--shadow-focus`
- 타이포
  - display font 1종
  - ui font 1종

### 9.2 애니메이션

- 페이지 진입: opacity + translateY
- 카드 진입: stagger
- hover: transform, box-shadow만 사용
- `prefers-reduced-motion` 대응 필수

### 11.3 반응형 토큰

- `--container-max-desktop`
- `--container-max-tablet`
- `--page-padding-mobile`
- `--page-padding-desktop`
- `--header-height-mobile`
- `--header-height-desktop`
- `--bottom-nav-height`

## 12. 접근성 체크리스트

구현 시작 전부터 아래를 PR 체크리스트로 사용한다.

- 모든 폼 필드에 `label` 연결
- 모든 icon button에 `aria-label`
- `outline: none` 단독 사용 금지
- `transition: all` 금지
- 이미지 크기 명시
- 비동기 메시지 `aria-live="polite"`
- 모달 포커스 트랩
- 헤딩 순서 유지
- 버튼 문구를 `저장`, `새 나들이 기록하기`, `드라이브 링크 열기`처럼 구체적으로 유지
- `...` 대신 `…`
- 날짜/숫자 포맷은 `Intl.*`
- 긴 목록/빈 상태/에러 상태 처리
- destructive action 확인 UI 제공
- 모바일 터치 타겟 최소 크기 보장

## 13. 구현 우선순위

### Phase 1. 기반

- `AppShell`
- `GlobalHeader`
- `TopAppBar`
- `BottomNav`
- `Button`, `TextField`, `Dialog`, `EmptyState`, `ErrorState`
- 디자인 토큰 및 타이포 세팅
- 반응형 container와 breakpoint 유틸

### Phase 2. 인증/메인/목록

- `/login`
- `/`
- `/map`
- 퀴즈 모달

### Phase 3. 등록/상세

- `/map/register`
- `/map/:date`

### Phase 4. 캘린더

- `/calendar`
- `/calendar/week`

### Phase 5. 신발 추천

- `/shoesRecom`
- `/:brand/:shoesName`

### Phase 6. 품질 보강

- 접근성 점검
- empty/loading/error 상태 보강
- reduced motion 대응
- 키보드 탐색/포커스 검수

## 14. 최종 제안

이번 React 전환은 단순 Vue 치환이 아니라, 아래 구조로 가는 것이 가장 안전하다.

- 공통 레이아웃은 `AppShell`로 통합
- 페이지는 route entry + domain section 조립 역할만 수행
- Desktop/Mobile은 같은 route를 공유하고, 레이아웃만 분기
- 기능 복잡도가 큰 나들이 등록/캘린더는 domain 중심으로 분리
- UI 프리미티브에 접근성 규칙을 먼저 심고, 페이지는 이를 조합만 하도록 설계

이 기준으로 진행하면 현재까지 만든 Pencil/Stitch 디자인을 유지하면서도, 이후 상세 컴포넌트 디자인 수정이나 캘린더 전략 변경에 유연하게 대응할 수 있다.
