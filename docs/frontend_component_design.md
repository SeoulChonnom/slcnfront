# Frontend 컴포넌트 설계 문서

---

# 0. 문서 메타

| 항목              | 내용                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **작성일**        | 2026-03-05                                                                                                                           |
| **대상 프로젝트** | Seoul CHONNOM (SLCN) — slcnfront                                                                                                     |
| **작성자**        | Claude (Senior Frontend Architect)                                                                                                   |
| **전환 범위**     | Vue 3 + JavaScript → React + TypeScript                                                                                              |
| **참고 자료**     | 디자인 HTML 10개 / IA 리포트(ia_report.md) / 와이어프레임(wireframe.md) / 프롬프트 설계서(front_component_refactor_prompt_design.md) |
| **기반 프롬프트** | docs/prompts/front_component_refactor.md                                                                                             |

---

# 1. 목표 및 범위

## 1.1 목표 (UI/UX + 기술 전환)

- **UI/UX**: AI 생성 리디자인(10개 화면)을 기반으로 "Duo-tone (핑크 + 블랙)" 디자인 시스템 확립
- **기술 전환**: Vue 3 + Composition API → React 18 + TypeScript + Vite 스택으로 전환
- **접근성**: 현행 전무 수준의 A11y를 WCAG 2.1 AA 수준으로 향상
- **반응형**: PC(1280px) / Tablet(768px) / Mobile(375px) 3-tier 대응
- **상태 품질**: 모든 화면에 Loading / Empty / Error 상태 UX 구현
- **공통 컴포넌트 체계**: 반복 패턴을 추출하여 재사용 가능한 컴포넌트 라이브러리 구축

## 1.2 비목표 (이번 전환에서 하지 않을 것)

- 백엔드 API 변경 (기존 REST API 그대로 사용, 필요시 API 변경)
- 국제화(i18n) 체계 구축 (한국어 단일 서비스 유지)
- 신규 기능 추가 (D-day, 신발추천, 나들이, 달력 기능 범위 동일 유지, 필요시 기능 추가)
- CI/CD 파이프라인 변경

## 1.3 전환 가정/제약

| #    | 내용                                                                                 | 근거                                   |
| ---- | ------------------------------------------------------------------------------------ | -------------------------------------- |
| C-01 | 기존 백엔드 API(`/user`, `/trip`, `/schedule`, `/depot`) 그대로 활용                 | ia_report.md API 목록 기반             |
| C-02 | 디자인 시스템 색상 토큰은 리디자인 HTML에서 추출한 `#FE9FC8` / `#000000` 계열로 확립 | 전체 HTML Tailwind config 공통 확인    |
| C-03 | 폰트는 "Plus Jakarta Sans" (UI) + 한 가지 Handwritten 폰트 (Display) 조합으로 통일   | 화면별 폰트 편차 존재 → 통합 정책 적용 |
| C-04 | React Router v6 + Tanstack Query(React Query) + Zustand 조합 채택                    | 상태 설계 섹션 참고                    |
| C-05 | 서비스는 사실상 2인 커플 전용 폐쇄형 서비스 (`admin` 역할만 존재)                    | ia_report.md 라우터 분석               |

---

# 2. 화면/기능 인벤토리

| Screen                | Route                | Primary Actions                        | Data Dependencies                           | Notes                                                                |
| --------------------- | -------------------- | -------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| SCR-01 로그인         | `/login`             | 로그인 제출, 비밀번호 토글             | `POST /user/login`, `GET /user/token`       | 유일한 공개 라우트. 리프레시 토큰 자동 로그인                        |
| SCR-02 메인 대시보드  | `/`                  | D-day 탭, 각 기능 카드 탭              | D-day 계산(정적), 최근 나들이 썸네일 API    | 5개 카드: D-day / 달력 / 나들이 / 신발 / Choi's Film. Blob 형태 카드 |
| SCR-03 나들이 목록    | `/map`               | 나들이 카드 탭(→ 퀴즈), 새 나들이 추가 | `GET /trip`, `GET /depot?path=`             | 퀴즈 통과 후 상세 진입. 로딩/빈/에러 상태 3종 필요                   |
| SCR-04 나들이 등록    | `/map/register`      | 스텝 폼 진행(3단계), 파일 업로드, 등록 | `POST /trip` (multipart/form-data)          | 관리자 전용. 현행 단일 긴 폼 → 3-step wizard로 개선                  |
| SCR-05 나들이 상세    | `/map/:date`         | 지도 탭 전환, 드라이브 링크 열기       | `GET /trip/:date`, `GET /depot?path=`       | 퀴즈 통과 후만 진입. 뒤로가기 버튼 신규 추가                         |
| SCR-06 달력 (월간)    | `/calendar`          | 일정 생성/수정/삭제, 달 이동           | `GET /schedule`, `GET /schedule/date`, CRUD | TOAST UI Calendar → 커스텀 구현 또는 유지 결정 필요(TBD)             |
| SCR-07 신발 추천 목록 | `/shoesRecom`        | 브랜드별 신발 카드 탭                  | `global.js` 정적 데이터                     | 정적. 브랜드 앵커 내비 (NB / Nike / Asics)                           |
| SCR-08 신발 상세      | `/:brand/:shoesName` | 인스타 링크, 유튜브 재생               | `global.js` 정적 데이터                     | 잘못된 파라미터 접근 시 404 처리. 뒤로가기 추가                      |
| SCR-E1 에러/404       | `*`                  | 메인으로 이동                          | 없음                                        | 신규 추가 제안 (현행 없음)                                           |
| SCR-QZ 퀴즈 모달      | (Modal, 라우트 없음) | 선택지 선택, 확인, 취소                | `trip.quiz` 데이터                          | 나들이 목록 카드 탭 시 표시. 취소 버튼 신규 추가                     |

**화면 간 네비게이션**

```
/login ──→ / (로그인 성공)
/ ──→ /map, /calendar, /shoesRecom, 외부링크
/map ──→ /map/:date (퀴즈 통과 후), /map/register (관리자)
/map/:date ←── ← 뒤로가기 버튼 ──→ /map
/:brand/:shoesName ←── ← 뒤로가기 버튼 ──→ /shoesRecom
* ──→ / (404 복구)
```

---

# 3. IA/레이아웃 통합 제안 (App Shell)

## 3.1 공통 레이아웃 정책

### GNB (Global Navigation Bar)

**편차 현황 (HTML 분석 결과)**

| 화면               | GNB 형태                                                      |
| ------------------ | ------------------------------------------------------------- |
| SCR-01 로그인      | GNB 없음                                                      |
| SCR-02 메인        | 중앙 SLCN Blob 로고, 우측 다크모드 토글                       |
| SCR-03 나들이 목록 | 좌측 메뉴 버튼(모바일), 중앙 SLCN Blob 로고, 우측 프로필 버튼 |
| SCR-04 나들이 등록 | 상단 백버튼 + 타이틀 (Top App Bar 형태)                       |
| SCR-QZ 퀴즈 모달   | 상단 SLCN 로고 + 수평 nav 링크                                |
| SCR-06 달력        | 좌측 SLCN 로고 + nav 링크 수평 배치                           |
| SCR-07 신발 추천   | 좌측 SLCN 텍스트 로고 + nav 링크 + 우측 유저 아이콘           |
| SCR-08 신발 상세   | SCR-07과 동일                                                 |

**통합 원칙 (App Shell 기준)**

```
┌─────────────────────────────────────────────────────────┐
│  [SLCN 로고]    [나들이] [달력] [신발] [필름]    [유저]  │
│  height: 64px  nav links (인증 후)         avatar icon  │
│  sticky, bg: #FE9FC8, border-bottom: 2px solid #000    │
└─────────────────────────────────────────────────────────┘
```

- **위치/높이**: sticky top-0, height: 64px (PC) / 56px (Mobile)
- **로고**: 좌측 SLCN 로고 (blob 형태 아이콘 + 텍스트 또는 텍스트만)
- **Nav Links**: 로그인 후에만 표시. PC는 헤더 인라인, Mobile은 Bottom Nav로 분리
- **예외 규칙**: 로그인 화면(`/login`)에는 GNB 완전 숨김. 상세 페이지 모바일에서는 Bottom Nav 숨기고 Top App Bar의 ← 버튼으로 대체

### Footer

- PC: `© {YEAR} SLCN. Made with love in Seoul.` — 최하단 고정
- Mobile: Bottom Nav가 있는 화면에서 Footer 숨김 (Bottom Nav가 Footer 역할 대체)
- 높이: 56px

### Container / Spacing 규칙

| 뷰포트              | max-width | padding |
| ------------------- | --------- | ------- |
| PC (≥1280px)        | 960px     | 0 24px  |
| Tablet (768–1279px) | 100%      | 0 24px  |
| Mobile (<768px)     | 100%      | 0 16px  |

## 3.2 화면별 편차 및 수렴 방안

| 편차                                                                                  | 수렴 방안                                                                                   |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| GNB 로고 형태 불일치 (Blob vs 텍스트 vs SVG 아이콘)                                   | `<SLCNLogo>` 단일 컴포넌트로 통합. variant props로 `icon` / `text` / `full` 제공            |
| 폰트 불일치 (Plus Jakarta Sans / Gochi Hand / Patrick Hand 등)                        | Display 타이틀: 단일 Handwritten 폰트 1종 선택(Gochi Hand 권장). UI Body: Plus Jakarta Sans |
| Nav 링크 텍스트 언어 불일치 (Schedule / Catalog / Membership vs 나들이 / 달력 / 신발) | 한국어 통일: 나들이 / 달력 / 신발 / 필름                                                    |
| 일부 화면 다크모드 토글 존재, 일부 없음                                               | 다크모드는 이번 전환 비목표. 다크모드 토글 제거하고 단일 라이트 모드 기준으로 통일          |
| 퀴즈 모달 레이아웃 불일치 (상단 전체 헤더 vs 모달만)                                  | 퀴즈는 Modal 컴포넌트로 구현. GNB는 배경 뒤로 유지                                          |

---

# 4. 컴포넌트 아키텍처 개요 (React Design Patterns 준수)

## 4.1 설계 원칙

- **Composition over Inheritance**: 컴포넌트를 children과 slot pattern으로 조합
- **단방향 데이터 흐름**: props down / events up. 상태 끌어올리기(lifting state up) 기준 명확화
- **상태 최소화**: 서버 상태는 Tanstack Query에 위임, 로컬 UI 상태는 useState/useReducer, 전역 UI 상태만 Zustand
- **접근성(A11y)**: 모든 인터랙티브 요소에 `aria-label`, `role`, keyboard navigation 기본 적용
- **타입 안정성**: `any` 사용 금지. Props/이벤트/상태 타입 전부 명시. API 응답은 Zod 런타임 검증 권장

## 4.2 패턴 선택 가이드

| 패턴                           | 적용 대상                                                          | 적용 근거                                                                                  |
| ------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Presentational / Container** | TripCard, ShoeCard, ScheduleEvent                                  | 데이터 로딩 로직(Container)과 렌더링(Presentational)을 분리하면 테스트와 재사용성이 높아짐 |
| **Compound Components**        | QuizModal, StepForm(SCR-04), BlobCard                              | 내부 상태를 공유하는 연관 컴포넌트 그룹에서 사용. Context로 내부 상태 공유                 |
| **Custom Hooks**               | `useTripList`, `useSchedule`, `useAuth`, `useQuiz`, `useImageBlob` | API 호출, 로딩/에러 상태, 비즈니스 로직 캡슐화. 컴포넌트를 순수 UI로 유지                  |
| **Controlled / Uncontrolled**  | TextInput, FileUpload, DatePicker                                  | 폼 전체는 React Hook Form으로 controlled 관리. 비폼 UI는 uncontrolled 허용                 |
| **Context + Reducer**          | Toast/Alert 전역 상태, 인증 컨텍스트                               | 앱 전체에서 접근하되 단순한 `useContext` + `useReducer` 조합으로 충분                      |
| **Polymorphic Components**     | `<Button>`, `<Card>`                                               | `as` prop으로 `<button>` / `<a>` / `<div>` 렌더링 변형 지원                                |

---

# 5. 컴포넌트 분해 (핵심 섹션)

## 5.1 컴포넌트 트리 (페이지별)

### SCR-01 로그인

```
LoginPage
└── LoginCard
    ├── SLCNLogo (variant="full")
    ├── TextInput (id="username", label="아이디")
    ├── TextInput (id="password", label="비밀번호", type="password", showToggle)
    ├── Button (type="submit", variant="primary", fullWidth)
    └── InlineError (role="alert")
```

### SCR-02 메인 대시보드

```
MainPage
├── AppShell
│   ├── GlobalHeader
│   └── BottomNav (Mobile only)
└── DashboardGrid
    ├── DdayBlobCard
    ├── QuickNavBlobCard (to="/calendar")
    ├── TripPreviewCard (with TripThumbnailStrip)
    ├── QuickNavBlobCard (to="/shoesRecom")
    └── ExternalLinkBlobCard (href=CHOI_FILM_URL)
```

### SCR-03 나들이 목록

```
TripListPage
├── AppShell
├── PageHeader (title="서울 촌놈 나들이 기록 📸", action=<AddButton>)
├── TripListContainer (uses useTripList hook)
│   ├── SkeletonTripCard × 3 (loading state)
│   ├── EmptyState (empty state)
│   ├── ErrorState (error state)
│   └── TripCard × N (normal state)
│       ├── TripLogo (Blob image)
│       └── TripMeta (date + name)
├── QuizModal (Compound)
│   ├── QuizModal.Question
│   ├── QuizModal.Options (RadioGroup)
│   ├── QuizModal.Footer (취소/확인 버튼)
│   └── QuizModal.Result (정답/오답 표시)
└── StickyBottomBar (관리자만 노출)
    └── Button (to="/map/register")
```

### SCR-04 나들이 등록

```
TripRegisterPage
├── AppShell (TopAppBar with 뒤로가기)
├── StepProgressIndicator (currentStep, totalSteps=3)
├── StepForm (Compound)
│   ├── StepForm.Step1 — 기본정보
│   │   ├── RadioGroup (유형: 아영/일권)
│   │   ├── DatePicker (날짜)
│   │   ├── TextInput (나들이 이름)
│   │   └── TextInput (드라이브 링크)
│   ├── StepForm.Step2 — 이미지 업로드
│   │   ├── FileUpload (로고)
│   │   ├── FileUpload (지도 1)
│   │   └── MultiMapToggle → FileUpload (지도 2) + TextInput × 2 (버튼명)
│   └── StepForm.Step3 — 퀴즈 설정
│       ├── TextInput (퀴즈 제목)
│       ├── TextInput × 4 (선택지 1~4)
│       ├── RadioGroup (정답 선택: 선택지 1~4)
│       ├── TextInput × 2 (정답 메시지 제목/내용)
│       └── TextInput × 2 (오답 메시지 제목/내용)
└── StepFormNavBar (이전/다음/등록 버튼)
```

### SCR-05 나들이 상세

```
TripDetailPage
├── AppShell (TopAppBar with "← 나들이 목록")
├── MapSegmentControl (복수 지도일 때만)
├── MapImageViewer (현재 지도 이미지)
│   └── SkeletonImage (loading)
└── StickyBottomBar
    └── Button (드라이브 링크 열기)
```

### SCR-06 달력

```
CalendarPage
├── AppShell
├── CalendarHeader
│   ├── MonthNavigator (◀ YYYY년 MM월 ▶)
│   └── TodayButton
├── CalendarGrid (TOAST UI or 커스텀)
│   ├── WeekdayRow (일~토, 한국어)
│   └── DayCell × N
│       └── EventChip (색상 coded)
├── EventModal (생성/수정/삭제)
│   ├── TextInput (일정 제목)
│   ├── DatePicker (시작/종료)
│   └── Button × 3 (저장/수정/삭제)
└── EmptyState (일정 없는 달)
```

### SCR-07 신발 추천 목록

```
ShoesRecomPage
├── AppShell
├── BrandAnchorNav (sticky, NB/Nike/Asics)
└── BrandSection × 3 (Compound)
    ├── BrandSection.Header (로고 + 설명)
    └── BrandSection.Grid
        └── ShoeCard × N
            ├── ShoeImage
            ├── ShoeName
            ├── ShoePrice
            └── DetailLink
```

### SCR-08 신발 상세

```
ShoeDetailPage
├── AppShell (TopAppBar with "← 신발 추천")
├── ShoeHero
│   ├── ShoeImage (정방형)
│   └── ShoeInfo (이름 + 설명 목록)
├── YoutubeEmbed (영상 있는 신발만)
└── ReviewSection
    └── ReviewCard × 2
        ├── ReviewImage
        ├── ReviewCaption
        └── InstagramLink
```

## 5.2 컴포넌트 카탈로그

| Component Name          | Responsibility                 | Props                                                                                                                                                    | State                                            | Events/Callbacks                       | Variants                                                  | Accessibility Notes                                            | Reusability | Pattern                |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- | ----------- | ---------------------- |
| `Button`                | CTA 버튼 렌더링                | `variant: 'primary'\|'secondary'\|'ghost'`, `size: 'sm'\|'md'\|'lg'`, `as: 'button'\|'a'`, `disabled: boolean`, `loading: boolean`, `fullWidth: boolean` | 없음                                             | `onClick`                              | primary(검정 배경), secondary(핑크 배경), ghost(테두리만) | `role="button"`, `aria-disabled`, `aria-busy` (loading 시)     | High        | Polymorphic            |
| `TextInput`             | 텍스트/비밀번호 입력           | `id: string`, `label: string`, `type: string`, `placeholder: string`, `error?: string`, `showToggle?: boolean`                                           | showPassword(내부)                               | `onChange`, `onBlur`                   | default, error, disabled                                  | `<label for>` 연결, `aria-describedby` (error), `autocomplete` | High        | Controlled             |
| `FileUpload`            | 파일 드래그&드롭/클릭 업로드   | `accept: string`, `maxSize: number`, `label: string`, `preview?: boolean`, `error?: string`                                                              | file, preview, dragOver                          | `onFileChange`, `onError`              | default, error, withPreview                               | `role="button"`, `aria-label`, keyboard 활성화                 | Med         | Controlled             |
| `RadioGroup`            | 라디오 버튼 그룹               | `name: string`, `options: RadioOption[]`, `value: string`, `label: string`, `error?: string`                                                             | 없음                                             | `onChange`                             | default, inline, card-style                               | `role="radiogroup"`, `aria-labelledby`, focus ring             | High        | Controlled             |
| `BlobCard`              | Blob 형태 카드 (메인 대시보드) | `blobVariant: 1\|2\|3\|4\|5`, `as: 'div'\|'a'\|'button'`, `children: ReactNode`                                                                          | hover(CSS)                                       | `onClick`                              | 5가지 blob shape                                          | `role="link"` 또는 `role="button"`, `aria-label`               | High        | Polymorphic + Compound |
| `TripCard`              | 나들이 목록 카드               | `trip: Trip`, `onSelect: (trip: Trip) => void`                                                                                                           | 없음                                             | `onSelect`                             | default, skeleton                                         | `role="button"`, `aria-label` = `${trip.name} 나들이 선택`     | Med         | Presentational         |
| `QuizModal`             | 나들이 잠금 해제 퀴즈          | `quiz: Quiz`, `onSuccess: (date: string) => void`, `onClose: () => void`                                                                                 | selectedOption, phase: 'quiz'\|'success'\|'fail' | `onSuccess`, `onClose`                 | 퀴즈 중 / 정답 / 오답                                     | `role="dialog"`, `aria-modal`, focus trap, `aria-labelledby`   | Low         | Compound + Context     |
| `StepForm`              | 다단계 폼 컨테이너             | `steps: StepConfig[]`, `onSubmit`                                                                                                                        | currentStep                                      | `onStepChange`, `onSubmit`, `onCancel` | 3-step                                                    | `aria-current="step"`, step 이동 시 focus 상단으로             | Low         | Compound + Controlled  |
| `StepProgressIndicator` | 스텝 진행 표시                 | `current: number`, `total: number`, `labels: string[]`                                                                                                   | 없음                                             | 없음                                   | default                                                   | `role="progressbar"`, `aria-valuenow`, `aria-valuemax`         | Med         | Presentational         |
| `MapImageViewer`        | 지도 이미지 표시 + 전환        | `maps: MapImage[]`, `initialIndex?: number`                                                                                                              | currentIndex                                     | `onMapChange`                          | 단일, 복수(세그먼트 컨트롤)                               | `<img alt>` 필수, 전환 버튼 `aria-label`                       | Low         | Controlled             |
| `ShoeCard`              | 신발 카탈로그 카드             | `shoe: Shoe`                                                                                                                                             | hover(CSS)                                       | `onClick`                              | default                                                   | `<img alt>` = 신발명, `role="link"`                            | Med         | Presentational         |
| `EmptyState`            | 빈 데이터 안내                 | `icon: string`, `title: string`, `description?: string`, `action?: ReactNode`                                                                            | 없음                                             | 없음                                   | default, with-cta                                         | `aria-live="polite"`                                           | High        | Presentational         |
| `ErrorState`            | 에러 안내 + 재시도             | `message: string`, `onRetry?: () => void`                                                                                                                | 없음                                             | `onRetry`                              | default, with-retry                                       | `role="alert"`, `aria-live="assertive"`                        | High        | Presentational         |
| `SkeletonCard`          | 로딩 스켈레톤                  | `variant: 'trip'\|'shoe'\|'image'`, `count?: number`                                                                                                     | 없음                                             | 없음                                   | trip, shoe, image                                         | `aria-busy="true"`, `aria-label="로딩 중"`                     | High        | Presentational         |
| `GlobalHeader`          | 상단 GNB                       | `showNav?: boolean`                                                                                                                                      | 없음                                             | 없음                                   | default, minimal(로그인 숨김)                             | `<nav>`, `<a aria-current="page">`                             | High        | Presentational         |
| `BottomNav`             | 모바일 하단 탭 바              | `currentPath: string`                                                                                                                                    | 없음                                             | 없음                                   | default                                                   | `role="navigation"`, `aria-label="하단 메뉴"`, `aria-current`  | High        | Presentational         |
| `StickyBottomBar`       | 하단 고정 CTA 영역             | `children: ReactNode`                                                                                                                                    | 없음                                             | 없음                                   | default                                                   | `role="complementary"`                                         | High        | Presentational         |
| `InlineError`           | 폼 인라인 에러 메시지          | `id: string`, `message: string`                                                                                                                          | 없음                                             | 없음                                   | default                                                   | `role="alert"`, `aria-live="assertive"`                        | High        | Presentational         |
| `Toast`                 | 전역 알림                      | `message: string`, `type: 'success'\|'error'\|'info'`, `duration?: number`                                                                               | 없음 (useToastStore)                             | 없음                                   | success, error, info                                      | `role="status"` / `role="alert"`, `aria-live`                  | High        | Context+Reducer        |

## 5.3 공통 컴포넌트 후보

| 컴포넌트       | 우선순위    | 도입 비용 | 기대 효과                                | 현행 중복                                           |
| -------------- | ----------- | --------- | ---------------------------------------- | --------------------------------------------------- |
| `Button`       | P1 (최우선) | 낮음      | 모든 화면 CTA 통일, variant 체계 확립    | SweetAlert 버튼 / 각 페이지 개별 button 스타일 혼재 |
| `TextInput`    | P1          | 낮음      | 폼 접근성 일괄 처리 (label for, aria)    | 로그인/등록 폼 개별 스타일                          |
| `EmptyState`   | P1          | 낮음      | 전 화면 빈 상태 일괄 처리                | 현재 미구현 (전무)                                  |
| `ErrorState`   | P1          | 낮음      | 전 화면 에러 상태 일괄 처리              | 현재 미구현 (전무)                                  |
| `SkeletonCard` | P2          | 낮음      | 전 화면 로딩 UX 통일                     | 현재 미구현 (전무)                                  |
| `BlobCard`     | P2          | 중간      | 메인 + 목록의 Blob 카드 아이덴티티 확립  | 각 화면별 별도 blob CSS                             |
| `Modal`        | P2          | 중간      | QuizModal, EventModal, ConfirmModal 기반 | SweetAlert2 단일 의존 → 제거 가능                   |
| `FileUpload`   | P2          | 중간      | 나들이 등록 파일 업로드 재사용           | 현행 단일 사용이나 재사용 예상                      |
| `RadioGroup`   | P3          | 낮음      | 등록 폼 퀴즈 정답 / 나들이 유형 통일     | 개별 radio input                                    |
| `Toast`        | P3          | 중간      | SweetAlert2 의존성 제거 가능             | SweetAlert2 전용                                    |

---

# 6. 상태/데이터 설계

## 6.1 상태 분류

| 상태 종류              | 내용                                                       | 관리 도구          |
| ---------------------- | ---------------------------------------------------------- | ------------------ |
| **서버 상태**          | 나들이 목록, 나들이 상세, 일정 목록, 이미지 Blob           | Tanstack Query     |
| **클라이언트 UI 상태** | 모달 열림/닫힘, 현재 지도 인덱스, 퀴즈 단계, 로딩 오버레이 | useState / Zustand |
| **폼 상태**            | 로그인 폼, 나들이 등록 폼                                  | React Hook Form    |
| **인증 상태**          | access token, user role, 로그인 여부                       | Zustand (persist)  |
| **전역 알림 상태**     | Toast 메시지 큐                                            | Zustand (간단)     |

## 6.2 상태 관리 전략

**서버 상태 — Tanstack Query**

- 쿼리 키 설계: `['trips']`, `['trip', date]`, `['schedules', year, month]`
- staleTime: 5분 (나들이 데이터는 잘 안 변함)
- 에러 처리: `onError` 콜백에서 Toast 전역 알림
- 재시도: 기본 3회 → 401은 즉시 로그아웃 처리

**클라이언트 UI 상태 — Zustand**

```typescript
// auth store
interface AuthStore {
  token: string | null;
  role: 'admin' | null;
  setToken: (token: string) => void;
  logout: () => void;
}

// ui store
interface UIStore {
  isLoading: boolean;
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

**폼 상태 — React Hook Form**

- Zod 스키마로 validation 연결
- StepForm은 `useFormContext`로 Context 공유

**캐싱/동기화 전략**

- 나들이 등록 성공 → `queryClient.invalidateQueries(['trips'])`
- 일정 CRUD 성공 → `queryClient.invalidateQueries(['schedules', year, month])`
- 이미지 Blob URL → `useImageBlob` hook 내 `URL.createObjectURL` + cleanup

**비동기 상태 UX 정책**

| 상태               | 처리 방법                                     |
| ------------------ | --------------------------------------------- |
| 로딩 중            | `isLoading` → SkeletonCard 렌더링             |
| 에러               | `isError` → ErrorState + 재시도 버튼          |
| 빈 데이터          | `data.length === 0` → EmptyState + CTA        |
| 부분 업데이트 실패 | 달력 수정/삭제 실패 시 Optimistic Update 롤백 |
| 401 응답           | 즉시 `logout()` + `router.replace('/login')`  |

## 6.3 타입 설계 (TypeScript)

**도메인 타입 / DTO 타입 분리**

- `types/domain/` — 앱 내부 도메인 모델
- `types/api/` — 백엔드 API 응답 DTO
- `api/mappers/` — DTO → 도메인 변환 함수

**주요 타입**

```typescript
// types/domain/trip.ts
export interface Trip {
  id: string;
  date: string; // 'YYYY-MM-DD'
  name: string;
  type: 'ayoung' | 'ilkwon';
  logoPath: string;
  mapPaths: string[];
  driveLink: string;
  quiz: Quiz;
  buttonNames?: [string, string]; // 복수 지도일 때
}

export interface Quiz {
  title: string;
  options: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3; // 0-based
  successMessage: QuizMessage;
  failMessage: QuizMessage;
}

export interface QuizMessage {
  title: string;
  content: string;
}

// types/domain/schedule.ts
export interface Schedule {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string;
  calendarId: 'ayo' | 'rik';
  color?: string;
}

// types/domain/shoe.ts
export interface Shoe {
  brand: 'newbalance' | 'nike' | 'asics';
  name: string;
  displayName: string;
  price: number;
  imagePath: string;
  description: string[];
  youtubeId?: string;
  reviews: ShoeReview[];
}

export interface ShoeReview {
  imagePath: string;
  caption: string;
  instagramUrl: string;
}
```

**타입 네이밍 규칙**

- 도메인 모델: PascalCase (e.g., `Trip`, `Schedule`)
- Props 타입: `ComponentNameProps` (e.g., `TripCardProps`)
- API DTO: `DTOName` + DTO suffix 없이 `api/` 폴더로 구분
- Enum 대신 Union Type 우선

---

# 7. 라우팅/네비게이션 설계

## 7.1 Route 구조 (React Router v6)

```tsx
<Routes>
  {/* 공개 */}
  <Route path="/login" element={<LoginPage />} />

  {/* 인증 필요 (ProtectedRoute wrapper) */}
  <Route element={<ProtectedRoute />}>
    <Route element={<AppShell />}>
      <Route index element={<MainPage />} />

      {/* 나들이 */}
      <Route path="map">
        <Route index element={<TripListPage />} />
        <Route path="register" element={<TripRegisterPage />} />
        <Route path=":date" element={<TripDetailPage />} />
      </Route>

      {/* 달력 */}
      <Route path="calendar" element={<CalendarPage />} />

      {/* 신발 추천 */}
      <Route path="shoesRecom">
        <Route index element={<ShoesRecomPage />} />
        <Route path=":brand/:shoesName" element={<ShoeDetailPage />} />
      </Route>
    </Route>
  </Route>

  {/* 에러/404 */}
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

**기존 라우트 충돌 해결**: `/map/register`를 `/map/:date` 앞에 선언하여 충돌 방지. React Router v6의 정적 경로 우선 매칭으로 안전.

**신발 라우트 개선**: 기존 루트 레벨 `/:brand/:shoesName` → `/shoesRecom/:brand/:shoesName`으로 이동하여 루트 오염 방지.

## 7.2 ProtectedRoute 전략

```typescript
// 인증 체크 → 미인증 시 /login 리다이렉트
// 퀴즈 통과 상태는 sessionStorage 또는 URL state로 전달
// (예: navigate(`/map/${date}`, { state: { quizPassed: true } }))
// → TripDetailPage에서 state 없으면 /map으로 리다이렉트
```

## 7.3 에러 처리 경로

| 상황                                        | 처리                                                              |
| ------------------------------------------- | ----------------------------------------------------------------- |
| 미인증 라우트 접근                          | `ProtectedRoute` → `/login` redirect                              |
| 401 API 응답                                | Tanstack Query `onError` → `useAuthStore.logout()` → `/login`     |
| 존재하지 않는 URL                           | `<Route path="*">` → `<NotFoundPage>` → 메인 이동 버튼            |
| 잘못된 `/:brand/:shoesName`                 | `ShoeDetailPage` onMount에서 데이터 없으면 `/shoesRecom` redirect |
| 퀴즈 미통과 상태에서 `/map/:date` 직접 접근 | location.state 없으면 `/map` redirect                             |

## 7.4 레이아웃 분리

- **루트 Layout**: `<AppShell>` — GlobalHeader + BottomNav(모바일) + `<Outlet>`
- **로그인**: AppShell 없음 (별도 전체 화면 레이아웃)
- **상세 페이지 모바일**: Bottom Nav 숨김, TopAppBar 활성화 (SCR-05, SCR-08)

---

# 8. 스타일링/디자인 시스템

## 8.1 스타일링 방식

**후보**

1. **Tailwind CSS v4** — 유틸리티 우선, 빠른 프로토타이핑, 기존 HTML 자산 100% 재활용 가능
2. **CSS Modules + PostCSS** — 스코프 격리, 번들 사이즈 최적화, 커스텀 유연성

**추천: Tailwind CSS v4** — 이유: 기존 리디자인 HTML 10개 전부 Tailwind CSS로 작성됨. 동일 스타일 클래스를 React 컴포넌트로 이식 시 최소 변환 비용으로 UI 정합성을 확보할 수 있음. `cn()` (clsx + tailwind-merge) 유틸리티로 조건부 클래스 관리.

## 8.2 디자인 토큰

### 색상 토큰

| Token                  | Value             | 용도                       |
| ---------------------- | ----------------- | -------------------------- |
| `--color-primary`      | `#FE9FC8`         | 메인 배경, Bottom Nav 배경 |
| `--color-ink`          | `#000000`         | 텍스트, 테두리, 아이콘     |
| `--color-paper`        | `#FFFFFF`         | 카드 배경, 인풋 배경       |
| `--color-paper-soft`   | `#F8F5F7`         | 인풋 배경 (밝은 버전)      |
| `--color-ink-muted`    | `rgba(0,0,0,0.4)` | 보조 텍스트, 비활성 상태   |
| `--color-error`        | `#E53E3E`         | 에러 메시지, 에러 상태     |
| `--color-success`      | `#38A169`         | 성공 메시지                |
| `--color-calendar-ayo` | `#FE9FC8`         | 아영 일정 색상             |
| `--color-calendar-rik` | `#000000`         | 일권 일정 색상             |

### 타이포그래피 토큰

| Token            | Value                             | 용도                                |
| ---------------- | --------------------------------- | ----------------------------------- |
| `--font-display` | `'Gochi Hand', cursive`           | 대형 타이틀, D-day, 카드 헤더       |
| `--font-ui`      | `'Plus Jakarta Sans', sans-serif` | 일반 UI 텍스트, 폼 레이블, 버튼     |
| `--font-korean`  | `'Gaegu', cursive`                | 한국어 감성 텍스트 (나들이 기록 등) |
| `--text-xs`      | `0.75rem / 1rem`                  | 보조 텍스트, 날짜                   |
| `--text-sm`      | `0.875rem / 1.25rem`              | 레이블, 설명                        |
| `--text-base`    | `1rem / 1.5rem`                   | 기본 본문                           |
| `--text-xl`      | `1.25rem / 1.75rem`               | 카드 제목                           |
| `--text-3xl`     | `1.875rem / 2.25rem`              | 페이지 타이틀                       |

### 간격 토큰

| Token        | Value  | 용도               |
| ------------ | ------ | ------------------ |
| `--space-1`  | `4px`  | 최소 간격          |
| `--space-2`  | `8px`  | 아이콘-텍스트 간격 |
| `--space-4`  | `16px` | 컴포넌트 내부 패딩 |
| `--space-6`  | `24px` | 컴포넌트 간격      |
| `--space-8`  | `32px` | 섹션 간격          |
| `--space-12` | `48px` | 페이지 상단 여백   |

### Shadow 토큰 (Sketch/Brutal 스타일)

| Token                   | Value                     | 용도            |
| ----------------------- | ------------------------- | --------------- |
| `--shadow-brutal`       | `4px 4px 0px 0px #000000` | 카드, 버튼 기본 |
| `--shadow-brutal-hover` | `2px 2px 0px 0px #000000` | 호버/활성 상태  |
| `--shadow-brutal-lg`    | `8px 8px 0px 0px #000000` | 로그인 카드     |

## 8.3 반응형 정책

| Breakpoint | Width      | 주요 변경사항                                   |
| ---------- | ---------- | ----------------------------------------------- |
| Mobile     | < 768px    | Bottom Nav 표시, 1열 레이아웃, TopAppBar 활성화 |
| Tablet     | 768–1279px | 2열 그리드, GNB 인라인 nav 표시                 |
| PC         | ≥ 1280px   | 3열 그리드, max-width 960px 컨테이너            |

```css
/* Tailwind 커스텀 breakpoint */
screens: {
  'sm': '640px',
  'md': '768px',   /* Tablet 시작 */
  'lg': '1024px',
  'xl': '1280px',  /* PC 시작 */
}
```

---

# 9. 파일/폴더 구조 (React + TS 기준)

```
src/
├── app/
│   ├── App.tsx                    # 라우팅 루트, Provider 구성
│   ├── providers.tsx              # QueryClientProvider, 인증 등 Provider 조합
│   └── router.tsx                 # React Router 라우트 정의
│
├── pages/                         # 페이지 컴포넌트 (라우트 1:1 매핑)
│   ├── LoginPage.tsx
│   ├── MainPage.tsx
│   ├── trip/
│   │   ├── TripListPage.tsx
│   │   ├── TripDetailPage.tsx
│   │   └── TripRegisterPage.tsx
│   ├── CalendarPage.tsx
│   ├── shoes/
│   │   ├── ShoesRecomPage.tsx
│   │   └── ShoeDetailPage.tsx
│   └── NotFoundPage.tsx
│
├── features/                      # 도메인 기능 단위
│   ├── auth/
│   │   ├── components/            # LoginCard, ProtectedRoute
│   │   ├── hooks/                 # useAuth, useLogin
│   │   └── store/                 # useAuthStore (Zustand)
│   ├── trip/
│   │   ├── components/            # TripCard, TripListContainer, MapImageViewer
│   │   ├── quiz/                  # QuizModal (Compound)
│   │   ├── register/              # StepForm (Compound), FileUpload
│   │   └── hooks/                 # useTripList, useTripDetail, useImageBlob
│   ├── calendar/
│   │   ├── components/            # CalendarGrid, EventModal
│   │   └── hooks/                 # useSchedule
│   └── shoes/
│       ├── components/            # ShoeCard, BrandSection, ReviewCard
│       ├── hooks/                 # useShoeDetail
│       └── data/                  # global.ts (기존 global.js 타입 변환)
│
├── shared/                        # 전역 공통 컴포넌트 / 유틸
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── TextInput/
│   │   ├── RadioGroup/
│   │   ├── FileUpload/
│   │   ├── Modal/
│   │   ├── Toast/
│   │   ├── EmptyState/
│   │   ├── ErrorState/
│   │   ├── SkeletonCard/
│   │   └── BlobCard/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── GlobalHeader.tsx
│   │   ├── BottomNav.tsx
│   │   ├── StickyBottomBar.tsx
│   │   └── TopAppBar.tsx
│   └── hooks/
│       ├── useToast.ts
│       └── useWindowSize.ts
│
├── api/
│   ├── client.ts                  # axios instance + 인터셉터
│   ├── endpoints.ts               # API URL 상수
│   ├── trip.ts                    # Trip API 함수
│   ├── schedule.ts                # Schedule API 함수
│   └── user.ts                    # Auth API 함수
│
├── types/
│   ├── domain/
│   │   ├── trip.ts
│   │   ├── schedule.ts
│   │   └── shoe.ts
│   └── api/
│       ├── tripDto.ts
│       └── scheduleDto.ts
│
├── styles/
│   ├── globals.css                # Tailwind 기본 지시자, CSS 변수 토큰
│   └── fonts.css                  # 폰트 import
│
├── utils/
│   ├── date.ts                    # 기존 dateUtils.js → TS 전환
│   ├── validation.ts              # Zod 스키마 + 기존 validationUtils.js
│   └── cn.ts                      # clsx + tailwind-merge
│
└── assets/
    ├── images/
    └── icons/
```

---

# 10. 구현 체크리스트 & 단계적 마이그레이션 플랜

## 1단계: 레이아웃 통일 (App Shell)

**목표**: 전체 GNB / BottomNav / TopAppBar / Footer 통일

| 작업 항목                             | 파일                                       |
| ------------------------------------- | ------------------------------------------ |
| AppShell 컴포넌트 구현                | `shared/layout/AppShell.tsx`               |
| GlobalHeader (PC Nav) 구현            | `shared/layout/GlobalHeader.tsx`           |
| BottomNav (Mobile) 구현               | `shared/layout/BottomNav.tsx`              |
| TopAppBar (상세 페이지 뒤로가기) 구현 | `shared/layout/TopAppBar.tsx`              |
| SLCNLogo 컴포넌트 통일                | `shared/ui/SLCNLogo.tsx`                   |
| CSS 토큰 정의 (Tailwind config)       | `tailwind.config.ts`, `styles/globals.css` |

**Done of Definition**

- 모든 화면에서 동일한 GNB 렌더링 확인
- Mobile에서 Bottom Nav 정상 작동
- SCR-05, SCR-08에서 TopAppBar 뒤로가기 작동

**리스크/대응**

- TOAST UI Calendar 기존 스타일과 GNB 충돌 가능 → z-index 체계 명시적 정의

---

## 2단계: 공통 UI 컴포넌트 구축

**목표**: shared/ui 하위 공통 컴포넌트 완성

| 작업 항목                        | 우선순위 |
| -------------------------------- | -------- |
| Button (variant, polymorphic)    | P1       |
| TextInput (label, error, toggle) | P1       |
| EmptyState                       | P1       |
| ErrorState                       | P1       |
| SkeletonCard                     | P1       |
| Modal (base)                     | P2       |
| Toast / useToast                 | P2       |
| RadioGroup                       | P2       |
| FileUpload                       | P2       |
| BlobCard                         | P2       |

**Done of Definition**

- 각 컴포넌트 Storybook(또는 별도 데모) 페이지에서 모든 variant 확인
- `aria-*` 속성 크롬 접근성 트리에서 확인
- TypeScript 타입 에러 0

**리스크/대응**

- FileUpload 드래그&드롭 모바일 미지원 → 클릭 업로드 fallback 필수

---

## 3단계: 페이지 단위 이관

**순서**: SCR-01 → SCR-02 → SCR-03 → SCR-07 → SCR-08 → SCR-05 → SCR-06 → SCR-04

_이유: 공통 컴포넌트 의존도가 낮은 페이지부터 시작_

| 페이지             | 주요 작업                                           |
| ------------------ | --------------------------------------------------- |
| SCR-01 로그인      | useLogin hook, 인라인 에러로 전환 (SweetAlert 제거) |
| SCR-02 메인        | BlobCard 구현, TripPreviewStrip (최근 3개 썸네일)   |
| SCR-03 나들이 목록 | useTripList, QuizModal, Loading/Empty/Error 상태    |
| SCR-07 신발 목록   | 정적 데이터 TS 타입 변환, BrandSection, ShoeCard    |
| SCR-08 신발 상세   | YoutubeEmbed, ReviewCard, 404 처리                  |
| SCR-05 나들이 상세 | useImageBlob, MapImageViewer, MapSegmentControl     |
| SCR-06 달력        | TOAST UI Calendar locale:ko 설정 + 에러 처리 보강   |
| SCR-04 나들이 등록 | StepForm (Compound), 3-step 검증, React Hook Form   |

**Done of Definition**

- 각 페이지: Loading / Empty / Error 상태 3종 모두 렌더링 확인
- 기존 Vue API 호출과 동일한 동작 확인 (수동 E2E)

**리스크/대응**

- Blob 이미지 URL 생성/해제 메모리 누수 → `useImageBlob`에서 cleanup 필수
- 나들이 등록 multipart 파일 업로드 → axios FormData 처리 검증 필요

---

## 4단계: 상태/데이터 계층 정리

| 작업 항목                                                     |
| ------------------------------------------------------------- |
| Tanstack Query 쿼리 키 체계 통일                              |
| Zustand auth store persist 설정 (localStorage)                |
| API 응답 타입 → Zod 스키마 검증 연결 (선택적)                 |
| 401 자동 로그아웃 인터셉터 구현                               |
| 나들이 상세 캐시 중복 저장 버그 수정 (기존 useTripStore TODO) |

**Done of Definition**

- 네트워크 탭에서 불필요한 중복 API 호출 없음
- 토큰 만료 시 자동 로그인 페이지 이동 확인

---

## 5단계: 접근성 / 성능 / 테스트 보강

| 작업 항목                                            |
| ---------------------------------------------------- |
| axe-core 또는 ESLint jsx-a11y 설정                   |
| 모든 이미지 alt 텍스트 검수                          |
| 폼 `<label for>` 연결 전체 점검                      |
| 키보드 네비게이션 테스트 (Tab, Enter, Escape)        |
| Lighthouse 성능/접근성 점수 측정 (목표: 접근성 90+)  |
| 공통 컴포넌트 단위 테스트 (Vitest + Testing Library) |
| 주요 페이지 통합 테스트 (로그인 플로우, 퀴즈 플로우) |

**Done of Definition**

- Lighthouse 접근성 점수 90+
- 키보드만으로 로그인 → 나들이 목록 → 퀴즈 완료 플로우 완성

---

# 11. 리스크 & 오픈 이슈

| #    | 리스크                                                                                       | 심각도 | 완화책                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| R-01 | AI 생성 리디자인 화면 간 폰트/스타일 편차 → 통합 비용 발생                                   | 중간   | 섹션 8.2 토큰 확립 후 일괄 적용. 폰트는 2종으로 통일                                                     |
| R-02 | TOAST UI Calendar → React 전환 시 `@toast-ui/react-calendar` 존재하나 마지막 업데이트 오래됨 | 높음   | Option A: `@toast-ui/react-calendar` 사용, Option B: react-big-calendar 등 대체 라이브러리 검토. **TBD** |
| R-03 | `GET /depot?path=` Blob 이미지 API — 대용량 이미지 로딩 시 메모리/성능 문제                  | 중간   | `useImageBlob` hook에서 `URL.revokeObjectURL` cleanup, 이미지 lazy loading                               |
| R-04 | 디자인 시스템 부재 — Storybook 등 문서화 없으면 팀 협업 시 스타일 드리프트 재발              | 중간   | 공통 컴포넌트 구축 후 Storybook 도입 권장 (이번 범위 외)                                                 |
| R-05 | SweetAlert2 제거 후 Toast/Modal 자체 구현 품질 저하                                          | 낮음   | 2단계에서 Modal + Toast 충분히 구현 후 SweetAlert2 의존 제거                                             |
| R-06 | 퀴즈 통과 상태 보안 — URL 직접 입력으로 `/map/:date` 접근 가능                               | 낮음   | 폐쇄형 서비스 특성상 보안 위협 낮음. `location.state` 검사로 처리                                        |
| R-07 | 나들이 등록 3-step 폼 전환 중 데이터 유실                                                    | 낮음   | React Hook Form이 스텝 간 값을 유지. 취소 시 확인 팝업으로 UX 보호                                       |

---

# 12. 부록

## 용어 정리

| 용어                     | 정의                                                                           |
| ------------------------ | ------------------------------------------------------------------------------ |
| **App Shell**            | GNB + Footer + Content Area로 구성되는 전체 레이아웃 컨테이너                  |
| **Blob Shape**           | 유기적인 곡선 border-radius로 만든 불규칙 타원 형태                            |
| **Duo-tone**             | 핑크(`#FE9FC8`) + 블랙(`#000000`) 두 색상으로만 구성된 이 서비스의 디자인 컨셉 |
| **Brutal/Sketch Shadow** | `4px 4px 0px 0px #000000` 형태의 오프셋 그림자. 손으로 그린 느낌               |
| **퀴즈 장벽**            | 나들이 상세 진입 전 퀴즈를 통과해야 하는 의도적 게임화 요소                    |
| **useTripStore**         | 기존 Vue Pinia 스토어. React 전환 시 Tanstack Query + Zustand로 대체           |
| **multiMap**             | 나들이에 지도가 2개 첨부된 경우. `mapPaths.length === 2`                       |

## 참고: React Design Patterns 요약

| 패턴                         | 핵심 개념                                                  | 이 프로젝트 적용                   |
| ---------------------------- | ---------------------------------------------------------- | ---------------------------------- |
| **Compound Components**      | 관련 컴포넌트 그룹이 Context로 내부 상태 공유              | QuizModal, StepForm                |
| **Presentational/Container** | UI 렌더링과 데이터 로직 분리                               | TripCard(P) + TripListContainer(C) |
| **Custom Hooks**             | 상태/이펙트/비즈니스 로직 캡슐화                           | useTripList, useImageBlob, useAuth |
| **Controlled/Uncontrolled**  | 폼 상태를 외부(parent)에서 제어할지 내부에서 제어할지 결정 | TextInput(Controlled)              |
| **Polymorphic Components**   | `as` prop으로 렌더링 엘리먼트 교체                         | Button, BlobCard                   |
| **Context + Reducer**        | 전역 UI 상태를 Context + useReducer로 관리                 | Toast, Auth                        |

## 산출물 검수 체크리스트

- [x] 0~12 섹션 존재
- [x] 화면 인벤토리 표 완성 (10개 화면 + 퀴즈 모달)
- [x] App Shell 통합 규칙 존재 + 예외 규칙 존재
- [x] 공통 컴포넌트 후보 10개 제시
- [x] 타입/접근성/마이그레이션 단계별 DoD 존재
- [x] 가정(Assumption) 명시 항목 존재
- [x] any 사용 없음 (타입 섹션 전부 구체적 타입)
