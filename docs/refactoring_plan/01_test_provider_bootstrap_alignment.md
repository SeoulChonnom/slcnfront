# Step 01. Test Provider And Bootstrap Alignment

## 1. 목적

실제 앱의 provider/bootstrap 실행 순서와 테스트 환경의 provider 구성이 어긋난 상태를 먼저 정리하는 단계다. 이 단계의 목적은 이후 API 검증, Modal 보강, Trip asset hook 통합, Calendar refactor를 진행할 때 테스트가 실제 런타임을 충분히 반영하도록 만드는 것이다.

이 단계가 끝나면 구현자는 “테스트는 통과했지만 실제 앱 부트스트랩에서는 다르게 동작하는가”를 다시 의심하지 않고 다음 refactoring 단계로 진행할 수 있어야 한다.

## 2. 범위

- `AppProviders`와 테스트 렌더 helper의 차이 분석
- auth hydrate / session restore 실제 순서 고정
- 테스트 helper를 목적별로 분리하거나 실제 앱 구성을 반영하도록 정리
- auth/bootstrap 관련 회귀 테스트 추가

이번 단계에서는 auth 정책 자체를 바꾸지 않는다. 핵심은 **실행 환경과 테스트 환경의 정합성 확보**다.

## 3. 참조 소스

- `src/app/providers/AppProviders.tsx`
- `src/app/providers/QueryProvider.tsx`
- `src/app/providers/AuthBootstrap.tsx`
- `src/app/providers/SessionRestoreBootstrap.tsx`
- `src/test/helpers/render.tsx`
- `src/test/helpers/query-client.ts`
- `src/app/router/__tests__/guards.test.tsx`
- `src/test/regression/__tests__/auth-smoke.test.tsx`
- `src/domains/auth/store/auth-store.ts`
- `src/domains/auth/hooks/useRestoreSession.ts`

## 4. 확정 결정

- 실제 앱의 provider/bootstrap 순서를 기준선으로 삼는다.
- 이후 단계의 테스트는 가능한 한 `AppProviders`와 동일한 실행 의미를 가져야 한다.
- 테스트 helper는 “간편함”보다 “의도 명확성”을 우선한다.
- helper를 하나로 우겨 넣지 말고, 필요하면 `full` / `minimal` 모드로 분리한다.
- bootstrap 로직을 섣불리 합치지 않는다. 현재는 구조 변경보다 검증 체계 정리가 우선이다.

## 5. 구현 대상

### 5.1 정렬해야 할 런타임 흐름

현재 실제 앱 흐름:

1. `QueryProvider`
2. `AuthBootstrap`
3. `SessionRestoreBootstrap`
4. Router / Page tree

이 흐름을 테스트에서도 선택적으로 재현할 수 있어야 한다.

### 5.2 테스트 helper 재구성

최소 아래 두 가지 helper를 명시적으로 제공하는 방향을 우선 검토한다.

```text
src/test/helpers/
  render-with-app-providers.tsx
  render-with-minimal-providers.tsx
```

또는 기존 `render.tsx`를 유지하더라도 아래 규칙을 만족해야 한다.

- 기본 helper가 실제 앱 부트스트랩을 반영한다.
- bootstrap을 생략하는 helper는 이름에서 의도가 드러난다.
- 개별 테스트에서 ad hoc wrapper를 중복 작성하지 않게 한다.

### 5.3 보강해야 할 회귀 포인트

- hydrate 이전 / 이후 auth phase
- session restore 시도 조건
- restore 성공 / 실패 후 상태 전이
- 로그인 페이지 redirect 동작
- guard가 restoring / anonymous / authenticated 상태를 올바르게 처리하는지

## 6. 파일/폴더 목표 구조

```text
src/
  test/
    helpers/
      render.tsx
      render-with-app-providers.tsx
      render-with-minimal-providers.tsx
    regression/
      __tests__/
        auth-smoke.test.tsx
  app/
    providers/
      AppProviders.tsx
      AuthBootstrap.tsx
      SessionRestoreBootstrap.tsx
```

helper 파일명은 실제 구현 시 다를 수 있지만, “실제 앱 provider stack”과 “테스트 편의 provider stack”이 이름으로 구분되어야 한다.

## 7. 타입/API/라우트 계약

### 7.1 auth 상태 계약

- `hydrated=false`이면 auth phase는 `hydrating`
- hydrated 이후 session이 없고 restoreState가 `idle|pending`이면 `restoring`
- accessToken + userInfo가 모두 있어야 `authenticated`
- restore 실패 후에는 `anonymous`

### 7.2 테스트 helper 계약

- 테스트 helper는 새로운 QueryClient를 기본 생성한다.
- 테스트마다 cache/shared state가 새로워야 한다.
- full helper는 `AppProviders`와 의미가 같아야 한다.
- minimal helper는 bootstrap 생략 여부가 명확해야 한다.

## 8. 작업 순서

1. `AppProviders`와 현재 테스트 helper의 차이를 문서화한다.
2. 현재 테스트들이 어떤 helper/wrapper를 쓰는지 분류한다.
3. helper를 full/minimal 관점으로 정리한다.
4. auth bootstrap 관련 테스트를 새 helper 기준으로 보강한다.
5. ad hoc wrapper를 사용하는 테스트를 정리한다.
6. 이후 단계에서 공통으로 사용할 기본 helper를 확정한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `src/test/helpers/__tests__/render.test.tsx`
  - helper가 QueryProvider/auth bootstrap을 의도대로 반영하는지 검증
- `src/domains/auth/store/__tests__/auth-store.test.ts`
  - hydrate / restore selector / phase 계산 검증
- `src/app/router/__tests__/guards.test.tsx`
  - restoring / anonymous / authenticated 상태 분기 검증
- `src/test/regression/__tests__/auth-smoke.test.tsx`
  - 실제 앱 provider stack 기준의 auth 흐름 smoke 검증

테스트 게이트:

- 이후 Step 02~06 작업은 이 단계의 helper/bootstrapping 테스트가 안정화된 뒤 진행한다.

## 10. 완료 기준

- 테스트 환경과 실제 앱의 provider/bootstrap 의미 차이가 정리되어 있다.
- full / minimal helper의 사용 기준이 문서와 코드에 반영되어 있다.
- auth startup 회귀 테스트가 추가되어 있다.
- 이후 refactor 단계가 동일한 helper 기반으로 TDD를 진행할 수 있다.

## 11. 리스크 / 보류 항목

- helper를 실제 앱과 완전히 동일하게 만들면 일부 순수 UI 테스트가 무거워질 수 있다.
  - 최소 helper를 분리해 해결한다.
- bootstrap side effect가 테스트에서 예상보다 많이 발생할 수 있다.
  - mock 전략과 helper 구분을 같이 정리한다.

## 12. 후속 단계 연결 메모

- Step 02의 API runtime validation 테스트는 반드시 이 단계의 helper 정리 이후 진행한다.
- Modal 관련 테스트도 가능하면 full helper가 아닌 minimal helper를 기본으로 사용하되, auth/router 영향이 필요한 경우만 full helper를 사용한다.
- Calendar 단계에서 새로운 hook 테스트를 만들 때 provider 선택 기준을 이 단계 문서에 맞춘다.

## 13. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- PM/리뷰어는 테스트 helper naming과 사용 규칙 검수

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- helper를 추상화하기 위해 테스트 가독성을 희생하지 않는다.
- bootstrap 로직 자체를 구조 변경하는 단계가 아니라는 점을 잊지 않는다.
- 테스트 편의상 실제 앱 부트스트랩 의미를 숨기지 않는다.
