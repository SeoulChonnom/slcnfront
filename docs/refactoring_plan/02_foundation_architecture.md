# Step 02. Foundation Architecture

## 1. 목적

React 전환의 공통 기반을 먼저 고정하는 단계다. 이 단계의 목적은 이후 도메인 작업이 라우터, 패키지, API client, 테스트 환경, 공통 타입 방향을 다시 고민하지 않도록 만드는 것이다.

## 2. 범위

- 필수 패키지 도입
- 기본 폴더 구조 생성
- 테스트 러너/RTL/MSW 기반 설정
- 공통 provider 뼈대 생성
- 환경 변수 접근 레이어 생성
- 라우터 상수와 route builder 기본 구조 생성

## 3. 참조 소스

- `docs/refactoring_plan/01_baseline_audit.md`
- `package.json`
- `vite.config.ts`
- `tsconfig*.json`
- `docs/react_component_plan.md`

## 4. 확정 결정

- 패키지 기준
  - `react-router-dom`
  - `@tanstack/react-query`
  - `react-hook-form`
  - `zod`
  - `zustand`
  - `tailwindcss`
  - `@tailwindcss/vite`
  - `clsx`
  - `tailwind-merge`
  - `dayjs`
  - 테스트: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `msw`
- UI 프레임워크 컴포넌트 라이브러리는 도입하지 않는다.
- Tailwind는 유틸리티 중심으로 사용하고, 디자인 토큰은 CSS 변수 + Tailwind theme로 연결한다.
- `cn.ts`는 `clsx` + `tailwind-merge` 조합으로 고정한다.
- HTTP 클라이언트는 `axios`를 도입하지 않고, `fetch` 기반 wrapper로 고정한다.

### 4.1 패키지 채택 기준

| 패키지 | 채택 여부 | 이유 |
| --- | --- | --- |
| `react-router-dom` | 필수 | 공개 URL과 `/main/*`, `/mobile/*` 내부 라우트를 동시에 운영해야 한다. |
| `@tanstack/react-query` | 필수 | trip/calendar 중심의 서버 상태 캐시, invalidation, mutation 관리가 필요하다. |
| `react-hook-form` | 필수 | 로그인 폼과 나들이 등록 3-step 폼의 상태/검증 비용을 줄인다. |
| `zod` | 필수 | 로그인/등록 폼 validation schema를 정형화한다. API 응답 전체 검증은 선택 적용한다. |
| `zustand` | 필수 | auth session과 소규모 전역 UI 상태를 Context보다 간단하게 유지한다. |
| `tailwindcss` | 필수 | Pencil 디자인을 utility-first로 빠르게 이식한다. |
| `@tailwindcss/vite` | 필수 | Vite 환경에서 Tailwind를 가장 단순하게 연결한다. |
| `clsx` | 필수 | 조건부 class 조합을 단순화한다. |
| `tailwind-merge` | 필수 | Tailwind class 충돌 정리를 자동화한다. |
| `dayjs` | 필수 | trip 등록 날짜 포맷, calendar 주간 범위 계산, 표시 포맷을 일관되게 처리한다. |
| `vitest` | 필수 | Vite 기반 단위 테스트 러너로 사용한다. |
| `@testing-library/react` | 필수 | 컴포넌트 렌더링/상호작용 검증이 필요하다. |
| `@testing-library/user-event` | 필수 | 로그인, step form, toolbar 등 실제 사용자 상호작용 검증에 필요하다. |
| `jsdom` | 필수 | 브라우저 DOM 테스트 환경이 필요하다. |
| `msw` | 필수 | `fetch` 기반 data layer와 hook 테스트를 실제 네트워크 없이 검증한다. |

### 4.2 지금 도입하지 않는 패키지

- `axios`
  - `TanStack Query`와 역할이 겹치지 않지만, 이 프로젝트에 필요한 HTTP 기능은 `fetch` wrapper로 충분하다.
  - `AbortSignal` 연동도 `fetch`가 더 자연스럽다.
- `@testing-library/jest-dom`
  - 있으면 편리하지만 필수는 아니다.
  - 초기에 의존성을 최소화하고, matcher 가독성이 실제로 부족해질 때만 추가한다.
- `@tanstack/react-query-devtools`
  - 개발 편의 도구일 뿐 구현 필수 요소는 아니다.
  - 기본 기능 구현과 테스트가 안정화된 뒤 필요 시 추가한다.

## 5. 구현 대상

### 5.1 앱 부트스트랩

- `main.tsx` 정리
- global style 진입점 정리
- QueryClientProvider
- RouterProvider 또는 BrowserRouter 기반 루트 구성

### 5.2 공통 디렉터리

```text
src/
  app/
    providers/
    router/
    shells/
  components/
    layout/
    ui/
  domains/
    auth/
    calendar/
    common/
    shoes/
    trip/
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
    helpers/
```

### 5.3 테스트 기반

- `vite.config.ts` 내 `vitest` 설정으로 통일한다.
- `src/test/helpers/render.tsx`
- `src/test/helpers/server.ts`
- `src/test/helpers/query-client.ts`

## 6. 파일/폴더 목표 구조

이 단계 완료 시 최소 아래 파일들이 존재해야 한다.

```text
src/
  app/
    providers/
      AppProviders.tsx
      QueryProvider.tsx
    router/
      route-constants.ts
      public-entry-resolver.ts
  lib/
    api/
      api-client.ts
    env/
      env.ts
    routing/
      route-builders.ts
    utils/
      cn.ts
  styles/
    globals.css
    tokens.css
  test/
    helpers/
      render.tsx
      query-client.ts
      server.ts
```

## 7. 타입/API/라우트 계약

### 7.1 환경 변수 계약

최소 아래 환경 변수를 다룬다.

- `VITE_API_URL`
- 필요 시 `VITE_FILE_BASE_URL`은 별도 두지 않고 API URL 기반으로 조합

env 접근은 반드시 `lib/env/env.ts`를 경유한다. 컴포넌트에서 `import.meta.env` 직접 참조 금지.

### 7.2 API client 계약

`api-client.ts`는 아래 책임만 가진다.

- base URL 설정
- `fetch` 기반 JSON 요청/응답 처리
- 인증 토큰 주입
- 공통 에러 normalize
- file/blob 요청 분리
- `AbortSignal` 전달
- `FormData` 요청 처리

도메인별 endpoint 함수는 Step 05에서 분리한다.

### 7.3 라우트 상수 계약

공개 URL과 내부 디바이스 라우트를 상수화한다.

- 공개 라우트 상수
- `/main/*` 상수
- `/mobile/*` 상수
- path builder 함수

문자열 하드코딩 금지.

## 8. 작업 순서

1. starter `App.tsx` 구조를 제거하고 app-root 구조로 변경한다.
2. Tailwind 설정과 global CSS 진입점을 추가한다.
3. 테스트 러너와 RTL/MSW 환경을 세팅한다.
4. `AppProviders`와 QueryProvider를 만든다.
5. env, api-client, route constants, route builder를 추가한다.
6. 테스트 헬퍼를 추가한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `env.test.ts`
  - 필수 env 파싱과 누락 처리 검증
- `route-builders.test.ts`
  - 공개 URL, `/main/*`, `/mobile/*` 빌더 검증
- `api-client.test.ts`
  - JSON 요청, blob 요청, 에러 normalize 검증
- `render.test.tsx`
  - 공통 render helper가 provider를 올바르게 감싸는지 검증

테스트 게이트:

- 공통 기반 테스트가 통과하기 전 Step 03, 04, 05 시작 금지

## 10. 완료 기준

- 앱이 더 이상 Vite 예제 UI를 사용하지 않는다.
- 공통 provider, env, api-client, route builder, 테스트 헬퍼가 준비되어 있다.
- 이후 단계는 도메인 코드만 추가하면 된다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- Tailwind 설정과 tokens.css 책임 분리가 흐려질 수 있다.
  - 기준: 색/폰트/spacing token은 `tokens.css`, 실제 조합은 Tailwind utility.
- 패키지 선택이 문서 간에 흔들릴 수 있다.
  - 기준: 여기 정의한 패키지 목록을 이후 단계에서 다시 바꾸지 않는다.
- QueryClient 기본 옵션은 이후 도메인에서 조정이 필요할 수 있다.
  - 이 단계에서는 conservative 기본값만 잡는다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- PM은 범위 과도 확장 여부만 점검

### 권장 스킬

- `vercel-react-best-practices`

### 권장 구현 방식

- 공통 유틸과 provider를 먼저 넣고, 도메인 코드는 아직 추가하지 않는다.
- 테스트 헬퍼를 반드시 먼저 만들어 이후 단계의 테스트 비용을 낮춘다.
