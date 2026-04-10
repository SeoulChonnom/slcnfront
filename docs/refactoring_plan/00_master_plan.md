# SLCN Refactoring Master Plan

## 1. 목적

이 문서는 `slcnfront` React 전환 프로젝트의 최상위 실행 기준이다. 구현 에이전트는 이 문서와 단계별 문서를 함께 읽고, 별도 의사결정 없이 바로 작업을 시작할 수 있어야 한다.

핵심 목표는 아래 3가지다.

- 기존 Vue 서비스의 기능과 사용자 흐름을 손실 없이 보존한다.
- Vite + React + TypeScript 구조로 재구성해 유지보수성과 테스트 가능성을 높인다.
- `docs/design/design.pen` 기준의 Pencil 디자인을 PC/Mobile 각각에 적용한다.

## 2. 기준 문서

우선순위 순으로 아래 자료를 기준으로 삼는다.

1. `docs/new_design_improvement_report.md`
2. `../old/slcnfront/src/*`
3. `docs/design/design.pen`
4. `docs/react_component_plan.md`
5. `docs/frontend_component_design.md`
6. `docs/ia_report.md`
7. `docs/wireframe.md`
8. `docs/api_spec.json`

충돌 시 해석 규칙은 아래와 같다.

- 기능/데이터 계약: old Vue 구현 우선
- 신규 화면 구조/비주얼: Pencil 디자인 우선
- 범위 확정/보류 판단: `docs/new_design_improvement_report.md` 우선

## 3. 잠긴 결정

### 3.1 범위

- 이번 작업은 기능 보존형 리팩터링이다.
- 신규 기능 추가는 하지 않는다.
- 유지 대상:
  - 로그인
  - 메인 대시보드
  - 나들이 목록/퀴즈/상세/등록
  - 일정 월간/주간
  - 신발 추천 목록/상세
  - 404
- 제외 대상:
  - `MyPage`
  - `Record`
  - `Membership`
  - `Profile`
  - `/map` 검색 기능

### 3.2 기술 결정

- 번들러/프레임워크: `Vite + React 19 + TypeScript`
- 스타일링: `Tailwind only`
- 서버 상태: `TanStack Query`
- HTTP 클라이언트: `native fetch wrapper`
- 폼: `React Hook Form + Zod`
- 소규모 전역 UI 상태: `Zustand`
- 캘린더: `FullCalendar`

### 3.3 라우팅 결정

- 공개 URL은 기존과 동일하게 유지한다.
- 내부 디바이스 라우트 prefix는 아래로 고정한다.
  - PC: `/main/*`
  - Mobile: `/mobile/*`
- 엔트리 라우트는 UA + viewport 기반으로 `/main/*` 또는 `/mobile/*`로 리다이렉트한다.
- 라우트 매칭 우선순위는 정적 경로가 동적 경로보다 항상 먼저 온다.
- `/:brand/:shoesName`는 최후순위 공개 라우트로 두고, 아래 prefix는 동적 신발 라우트가 점유하지 못하는 예약 경로로 고정한다.
  - `login`
  - `map`
  - `calendar`
  - `shoesRecom`
  - `main`
  - `mobile`

### 3.4 테스트 결정

- 각 구현 단계 종료 직후 해당 단계의 단위 테스트를 반드시 작성 또는 갱신하고 통과시킨다.
- 단위 테스트 통과 전에는 다음 단계로 진행하지 않는다.
- 전체 테스트 전략은 크게 확장하지 않는다.

## 4. 구현 원칙

- 기능 보존이 디자인 단순화보다 우선이다.
- 디자인은 Pencil 시안을 따르되, 시안에 없는 필드도 기존 기능 유지에 필요하면 노출한다.
- PC와 Mobile은 공통 도메인 로직을 공유하고 프레젠테이션만 분리한다.
- 백엔드 계약은 유지한다. 단, 프론트 내부 adapter/type 계층은 새로 정리한다.
- old Vue 코드를 그대로 옮기지 말고, 도메인 단위로 재구성한다.
- 결정이 필요한 지점은 각 단계 문서에서 추가로 남기지 않는다. 단계 문서는 구현자가 그대로 실행 가능한 상태여야 한다.

## 5. 대상 라우트와 내부 매핑

| 공개 URL | PC 내부 라우트 | Mobile 내부 라우트 | 비고 |
| --- | --- | --- | --- |
| `/` | `/main` | `/mobile` | 인증 후 메인 |
| `/login` | `/main/login` | `/mobile/login` | 공개 라우트 |
| `/map` | `/main/map` | `/mobile/map` | 목록 |
| `/map/register` | `/main/map/register` | `/mobile/map/register` | 등록 |
| `/map/:date` | `/main/map/:date` | `/mobile/map/:date` | 상세 |
| `/calendar` | `/main/calendar` | `/mobile/calendar` | 월간 |
| `/calendar/week` | `/main/calendar/week` | `/mobile/calendar/week` | 주간 |
| `/shoesRecom` | `/main/shoesRecom` | `/mobile/shoesRecom` | 목록 |
| `/:brand/:shoesName` | `/main/:brand/:shoesName` | `/mobile/:brand/:shoesName` | 상세 |
| `*` | `/main/404` | `/mobile/404` | 내부 전용 404 |

공개 URL은 사용자가 직접 진입하는 주소다. 내부 라우트는 앱 내부 구현과 디바이스 분기에만 사용한다.

## 6. 단계 로드맵

| 단계 | 문서 | 핵심 결과물 | 선행 단계 |
| --- | --- | --- | --- |
| 0 | `00_master_plan.md` | 공통 기준 고정 | 없음 |
| 1 | `01_baseline_audit.md` | 기능/데이터/라우트 기준선 확보 | 0 |
| 2 | `02_foundation_architecture.md` | 패키지/폴더/API/테스트 기반 구축 | 1 |
| 3 | `03_design_system_and_pencil_mapping.md` | Pencil 기반 UI 시스템 구축 | 2 |
| 4 | `04_app_shell_and_dual_routing.md` | `/main/*`, `/mobile/*` 라우팅과 shell 완성 | 2, 3 |
| 5 | `05_auth_and_shared_data_layer.md` | 인증/세션/API/공통 타입 완성 | 2, 4 |
| 6 | `06_trip_domain.md` | 나들이 도메인 완성 | 5 |
| 7 | `07_calendar_domain.md` | FullCalendar 월간/주간 완성 | 5 |
| 8 | `08_shoes_domain.md` | 정적 신발 도메인 완성 | 5 |
| 9 | `09_quality_cutover_and_migration.md` | 회귀 점검/전환/마감 | 6, 7, 8 |

## 7. 단계별 완료 정의

모든 단계는 아래를 동시에 만족해야 완료로 본다.

1. 단계 문서에 정의된 파일/폴더 목표 구조가 반영됨
2. 단계 문서에 정의된 계약과 UI/상태 흐름이 구현됨
3. 단계 문서의 단위 테스트가 통과함
4. 다음 단계가 이전 단계의 가정을 다시 수정하지 않아도 됨

## 8. 공통 폴더 목표 구조

```text
src/
  app/
    providers/
    router/
    shells/
  assets/
  components/
    ui/
    layout/
  domains/
    auth/
    calendar/
    common/
    shoes/
    trip/
  hooks/
  lib/
    api/
    env/
    routing/
    utils/
  pages/
    main/
    mobile/
    public/
  styles/
  test/
    fixtures/
    helpers/
  types/
```

세부 구조는 각 단계 문서에서 더 좁힌다.

## 9. 리스크와 대응

### 9.1 캘린더 리스크

- 리스크: 기존 TOAST UI의 UX와 API shape가 FullCalendar와 다르다.
- 대응: `ScheduleEventDto ↔ CalendarEventModel` adapter를 별도 계층으로 고정한다.

### 9.2 나들이 등록 리스크

- 리스크: 디자인 시안이 실제 백엔드 입력 필드를 완전하게 드러내지 않는다.
- 대응: Step 3 구성은 시안보다 기능 보존을 우선한다.

### 9.3 이중 라우팅 리스크

- 리스크: 공개 URL과 내부 라우트가 분리되면서 redirect loop나 deep-link 문제가 생길 수 있다.
- 대응: Step 4에서 엔트리 resolver 테스트를 먼저 통과시킨다.
- 리스크: `/:brand/:shoesName`가 정적 경로를 가로채면 `/calendar/week`, `/map/register` 같은 경로가 잘못 해석될 수 있다.
- 대응: 정적 경로 우선 라우트 순서와 예약 세그먼트 규칙을 문서와 테스트에 동시에 고정한다.

### 9.4 정적 자산 리스크

- 리스크: old Vue의 `require()` 기반 신발 데이터와 이미지 참조를 React에서 그대로 쓸 수 없다.
- 대응: Step 8에서 데이터 마이그레이션과 asset import 방식을 타입 기반으로 재정의한다.

## 10. 구현 에이전트 운영 규칙

### 10.1 역할 분담

- PM 서브에이전트
  - 범위 확인
  - 완료 정의 검수
  - 단계 간 의존성 점검
- FE 서브에이전트
  - 라우팅, 상태, API, 테스트, 도메인 로직 구현
- 퍼블리셔 서브에이전트
  - Pencil 매핑
  - Tailwind 클래스 설계
  - 접근성/레이아웃 검수

### 10.2 권장 스킬

- `frontend-design`
  - Pencil 시안의 의도와 스타일 방향을 React UI로 번역할 때 사용
- `vercel-react-best-practices`
  - 라우터, 상태, 렌더링 구조, 비동기 흐름, 성능 패턴 점검 시 사용

### 10.3 권장 MCP / 도구

- Pencil MCP
  - `get_editor_state`
  - `batch_get`
  - `get_screenshot`
- 터미널 도구
  - `rg`로 old Vue 구현 추적
  - 테스트는 단계 문서 기준의 최소 단위만 먼저 실행

## 11. 문서 작성 규칙

각 단계 문서는 아래 섹션을 공통으로 가진다.

- 목적
- 범위
- 참조 소스
- 확정 결정
- 구현 대상
- 파일/폴더 목표 구조
- 타입/API/라우트 계약
- 작업 순서
- 단계 종료 직후 단위 테스트
- 완료 기준
- 리스크 / 보류 항목
- 코딩 에이전트 가이드

구현 에이전트는 마스터 문서와 현재 단계 문서를 동시에 읽고 작업한다.
