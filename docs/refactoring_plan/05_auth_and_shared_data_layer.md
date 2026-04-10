# Step 05. Auth And Shared Data Layer

## 1. 목적

모든 도메인이 공통으로 의존하는 인증, 세션, API endpoint, DTO adapter, query key를 정리하는 단계다. 이 단계가 끝나면 trip/calendar/shoes 구현자는 네트워크 계층과 세션 처리 규칙을 다시 결정할 필요가 없다.

## 2. 범위

- auth session 모델
- 로그인/세션 복원 흐름
- auth guard와 연동되는 store
- domain API module 골격
- 공통 DTO 타입과 mapper
- query key 규칙

## 3. 참조 소스

- `docs/refactoring_plan/01_baseline_audit.md`
- `docs/refactoring_plan/02_foundation_architecture.md`
- `../old/slcnfront/src/store/useUserStore.js`
- `../old/slcnfront/src/utils/apiUtils.js`
- `../old/slcnfront/src/config/index.js`
- `docs/api_spec.json`

## 4. 확정 결정

- 서버 상태는 TanStack Query가 관리한다.
- auth token 보관은 session 기반으로 유지한다.
- refresh token 복원 로직은 앱 시작 시 1회 시도한다.
- API module은 도메인별로 분리한다.
- API 응답을 바로 UI에 넘기지 않고, 최소한의 mapper/adapter를 거친다.
- HTTP 요청은 `fetch` 기반 `api-client.ts`를 통해서만 보낸다.
- old Vue 동작을 따라 access token은 메모리 상태로 두고, 사용자 식별 정보만 `sessionStorage`에 보관한다.
- `sessionStorage` key는 `slcn.auth.user-info`로 고정한다.

## 5. 구현 대상

### 5.1 인증 모델

최소 아래 타입을 정식 정의한다.

```ts
type Role = 'admin'

type UserInfo = {
  name: string
  userName: string
  roleList: Role[]
}

type AuthSession = {
  accessToken: string | null
  userInfo: UserInfo | null
  hydrated: boolean
}
```

### 5.2 API module 구조

```text
src/
  domains/
    auth/
      api/
      hooks/
      store/
      types.ts
    calendar/
      api/
      types.ts
    trip/
      api/
      types.ts
    shoes/
      data/
      types.ts
```

### 5.3 Query key 규칙

- `auth.session`
- `trip.list`
- `trip.detail(date)`
- `trip.file(path)`
- `schedule.month(year, month)`
- `schedule.week(startDate)`
- `shoes.catalog`
- `shoes.detail(brand, shoesName)`

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    auth/
      api/
        auth-api.ts
      hooks/
        useLogin.ts
        useRestoreSession.ts
      store/
        auth-store.ts
      types.ts
    calendar/
      api/
        schedule-api.ts
      types.ts
    trip/
      api/
        trip-api.ts
        trip-files-api.ts
      types.ts
    shoes/
      data/
        shoes-data.ts
      types.ts
  lib/
    api/
      errors.ts
      query-keys.ts
```

## 7. 타입/API/라우트 계약

### 7.1 auth API 계약

- `login(payload)`
  - 입력 타입 이름은 `LoginFormValues`를 사용
  - 실제 request body는 `{ username, password }`
  - 출력: access token + user info
- `restoreSession()`
  - silent refresh 시도

세션 복원 순서는 아래로 고정한다.

1. 앱 시작 시 `sessionStorage`에서 `userInfo` hydrate
2. access token은 비어 있는 상태로 시작
3. `restoreSession()` 호출
4. 성공 시 access token과 userInfo 동기화
5. 실패 시 token은 null 유지, userInfo는 로그인 화면에서 재설정 가능

### 7.2 trip API 계약

- `getTripList()`
- `getTripDetail(date)`
- `registerTrip(formData)`
- `downloadTripFile(path)`

`registerTrip(formData)`는 `fetch`에 `FormData`를 그대로 전달한다. `Content-Type`은 수동 지정하지 않고 브라우저가 boundary를 포함해 생성하도록 둔다.

### 7.3 schedule API 계약

- `getCurrentSchedules()`
- `getSchedulesByMonth(year, month)`
- `createSchedule(payload)`
- `updateSchedule(payload)`
- `deleteSchedule(id)`

### 7.4 shoes data 계약

- API 없음
- static data loader에서 normalized catalog 반환

### 7.5 fetch client 계약

- 공통 `api-client.ts`는 `fetch` wrapper다.
- wrapper 책임:
  - base URL 조합
  - auth header 주입
  - JSON body 직렬화
  - `FormData`는 직렬화 없이 그대로 전달
  - blob 응답 분기
  - 실패 응답을 공통 `AppError`로 normalize
  - `AbortSignal` 전달
- domain API module은 `fetch` 옵션 객체를 직접 구성하지 않고 wrapper helper를 사용한다.

## 8. 작업 순서

1. auth session 타입과 store를 만든다.
2. 로그인/세션 복원 API와 hook을 만든다.
3. domain API module을 만들고 query key를 정리한다.
4. DTO → UI model mapper를 분리한다.
5. blob/file 요청 helper를 trip 전용으로 분리한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `auth-store.test.ts`
  - hydrate, login success, logout, restoreSession 상태 검증
- `auth-api.test.ts`
  - 로그인/세션 복원 요청 shape와 에러 처리 검증
- `query-keys.test.ts`
  - key 생성 안정성 검증
- `trip-api.test.ts`
  - trip endpoint와 multipart builder 분리 검증
- `schedule-api.test.ts`
  - month/week/crud endpoint 호출 규칙 검증

테스트 게이트:

- 공통 data-layer 테스트 통과 전 Step 06, 07, 08 진행 금지

## 10. 완료 기준

- 인증과 데이터 접근 규칙이 코드 레벨로 정리되어 있다.
- 각 도메인은 API helper를 조합하기만 하면 된다.
- query key와 DTO mapper 규칙이 고정되었다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- backend 응답 shape가 문서와 실제 구현 사이에 다를 수 있다.
  - old Vue 동작 기준 fixture를 우선 신뢰한다.
- refresh token 처리 방식이 환경에 따라 달라질 수 있다.
  - store/hook은 실패 시 조용히 로그인 화면으로 남는 정책을 유지한다.
- 로그인 폼 필드명과 실제 API body 필드명이 다르다.
  - UI 값은 `userName`, API payload는 `username`으로 mapper에서 변환한다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- PM은 세션 정책 확인

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- UI 컴포넌트가 `fetch` 응답 객체를 직접 다루지 않게 한다.
- auth/session 상태와 query 캐시를 분리해 책임을 명확히 한다.
