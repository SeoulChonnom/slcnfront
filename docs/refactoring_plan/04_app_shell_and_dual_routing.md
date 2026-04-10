# Step 04. App Shell And Dual Routing

## 1. 목적

공개 URL 유지와 디바이스별 별도 화면 구성을 동시에 만족시키기 위해, `/main/*`와 `/mobile/*` 라우트 체계를 도입하는 단계다. 이 단계의 결과는 이후 모든 도메인 페이지가 동일한 shell과 redirect 규칙 위에서 동작하도록 만드는 것이다.

## 2. 범위

- 공개 URL → 내부 디바이스 라우트 resolver 구현
- shell 구조 구현
- 라우터 계층화
- auth 이전/이후 라우트 배치
- 404/redirect 정책 정의

## 3. 참조 소스

- `docs/refactoring_plan/02_foundation_architecture.md`
- `docs/refactoring_plan/03_design_system_and_pencil_mapping.md`
- `../old/slcnfront/src/router/index.js`
- `docs/wireframe.md`

## 4. 확정 결정

- 공개 URL은 사용자의 canonical URL이다.
- 내부 페이지 컴포넌트는 `/main/*`와 `/mobile/*`에 각각 둔다.
- UA와 viewport 기준으로 초기 디바이스를 판정하되, 앱 내 리사이즈만으로 강제 라우트 재분기는 하지 않는다.
- 공개 URL direct access 시 항상 적절한 내부 라우트로 1회 리다이렉트한다.
- 사용자가 이미 `/main/*` 또는 `/mobile/*` 내부 라우트로 진입한 경우에는 재분기하지 않는다.
- 수동 디바이스 override를 위한 query string, localStorage, cookie 정책은 이번 범위에 두지 않는다.
- 공개 라우트 매칭 순서는 아래로 고정한다.
  1. `/login`
  2. `/`
  3. `/map/register`
  4. `/map/:date`
  5. `/map`
  6. `/calendar/week`
  7. `/calendar`
  8. `/shoesRecom`
  9. `/:brand/:shoesName`
  10. `*`

## 5. 구현 대상

### 5.1 라우트 계층

```text
public entry routes
  /login
  /
  /map
  /map/register
  /map/:date
  /calendar
  /calendar/week
  /shoesRecom
  /:brand/:shoesName

device routes
  /main/*
  /mobile/*
```

### 5.2 Shell 종류

- `PublicShell`
  - 로그인 전용
- `MainDesktopShell`
  - Desktop header + footer
- `MainMobileShell`
  - Mobile top bar + bottom nav
- `DetailMobileShell`
  - top bar + sticky CTA, bottom nav 없음

### 5.3 Resolver 정책

- `/login`
  - unauthenticated 접근 허용
  - device 판정 후 `/main/login` 또는 `/mobile/login`
- 나머지 공개 URL
  - device 판정 후 대응되는 `/main/*` 또는 `/mobile/*`로 이동
  - 실제 인증 확인은 auth guard에서 수행

디바이스 판정 알고리즘은 아래 순서로 고정한다.

1. 현재 pathname이 이미 `/main/` 또는 `/mobile/`로 시작하면 그대로 사용
2. `window.matchMedia('(max-width: 767px)')`가 `true`면 mobile
3. 그렇지 않으면 main
4. viewport 정보를 읽을 수 없는 테스트 환경에서는 main을 기본값으로 사용

## 6. 파일/폴더 목표 구조

```text
src/
  app/
    router/
      app-router.tsx
      public-entry-routes.tsx
      main-routes.tsx
      mobile-routes.tsx
      guards.tsx
      public-entry-resolver.ts
    shells/
      PublicShell.tsx
      MainDesktopShell.tsx
      MainMobileShell.tsx
      DetailMobileShell.tsx
  pages/
    public/
      LoginEntryPage.tsx
      RouteEntryPage.tsx
```

## 7. 타입/API/라우트 계약

### 7.1 공개 URL → 내부 라우트 규칙

| 공개 URL | 내부 대상 |
| --- | --- |
| `/` | `/main` or `/mobile` |
| `/login` | `/main/login` or `/mobile/login` |
| `/map` | `/main/map` or `/mobile/map` |
| `/map/register` | `/main/map/register` or `/mobile/map/register` |
| `/map/:date` | `/main/map/:date` or `/mobile/map/:date` |
| `/calendar` | `/main/calendar` or `/mobile/calendar` |
| `/calendar/week` | `/main/calendar/week` or `/mobile/calendar/week` |
| `/shoesRecom` | `/main/shoesRecom` or `/mobile/shoesRecom` |
| `/:brand/:shoesName` | `/main/:brand/:shoesName` or `/mobile/:brand/:shoesName` |

정적 경로 예약 규칙:

- 아래 세그먼트는 신발 상세의 `brand`로 사용할 수 없다.
  - `login`
  - `map`
  - `calendar`
  - `shoesRecom`
  - `main`
  - `mobile`

### 7.2 Guard 계약

- 인증 필요 라우트는 token/session 미존재 시 공개 `/login`으로 보낸다.
- 내부 `/main/login`, `/mobile/login`은 로그인 성공 시 각 디바이스 메인으로 이동한다.

### 7.3 Shell 계약

- Desktop shell
  - header, main, footer
- Mobile shell
  - top bar, main, optional bottom nav
- 상세/등록 mobile shell
  - bottom nav 제거
  - sticky action 허용

## 8. 작업 순서

1. 공개 엔트리 라우트와 내부 라우트 상수를 분리한다.
2. `public-entry-resolver.ts`를 구현한다.
3. shell 컴포넌트를 만든다.
4. `app-router.tsx`에 public/main/mobile 계층을 구성한다.
5. guard와 404 처리를 연결한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `public-entry-resolver.test.ts`
  - 공개 URL이 올바른 `/main/*`, `/mobile/*`로 변환되는지 검증
- `guards.test.tsx`
  - 인증 필요 라우트의 로그인 리다이렉트 검증
- `app-router.test.tsx`
  - public/main/mobile 라우트 트리와 404 fallback 검증
- `shells.test.tsx`
  - desktop/mobile/detail shell의 고정 요소 노출 검증

테스트 게이트:

- resolver와 guard 테스트 통과 전 Step 05 이후로 진행 금지

## 10. 완료 기준

- 공개 URL 유지와 디바이스별 내부 라우팅이 동시에 작동한다.
- shell이 도메인 페이지와 독립적으로 재사용 가능하다.
- 이후 도메인 페이지는 각 route slot에 콘텐츠만 넣으면 된다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- UA 기반 판별이 일부 태블릿에서 애매할 수 있다.
  - 기본값은 viewport 우선, UA 보조로 고정한다.
- dynamic shoe route가 정적 경로를 가로챌 수 있다.
  - 라우트 정의 순서와 예약 세그먼트 검증 테스트를 함께 둔다.
- 로그인 후 디바이스가 바뀌는 상황까지 완전 자동 대응하면 복잡도가 커진다.
  - 초기 진입 기준으로만 분기하고, 세션 중 자동 이동은 하지 않는다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- PM은 route 정책과 canonical URL 검수

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- 도메인 페이지 구현 전에 라우터 구조를 먼저 안정화한다.
- 컴포넌트 내부에서 `window.location` 직접 조작 금지, 라우터 API만 사용한다.
