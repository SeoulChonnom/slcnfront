# Step 02. API Response Runtime Validation

## 1. 목적

현재 `api-client.ts`가 제네릭 타입으로 JSON 응답을 바로 신뢰하는 구조를 보완해, 도메인 경계에서 실제 서버 응답을 검증하도록 만드는 단계다. 이 단계의 목적은 타입 안정성을 “컴파일 타임 가정”에서 “런타임 계약”으로 끌어올리는 것이다.

이 단계가 끝나면 구현자는 auth/trip/calendar API 응답이 바뀌거나 깨졌을 때 UI 내부에서 뒤늦게 이상 증상을 맞는 대신, 도메인 API 경계에서 명시적으로 실패를 감지할 수 있어야 한다.

## 2. 범위

- `lib/api/api-client.ts`는 transport 책임만 유지
- auth/trip/calendar domain API에서 runtime validation 추가
- 기존 mapper와 validation 흐름 정리
- validation 실패 시 공통 에러 처리 기준 정리

이번 단계에서는 endpoint 자체를 바꾸지 않는다. 서버와의 계약을 **검증 가능하게** 만드는 것이 범위다.

## 3. 참조 소스

- `src/lib/api/api-client.ts`
- `src/lib/api/errors.ts`
- `src/domains/auth/api/auth-api.ts`
- `src/domains/trip/api/trip-api.ts`
- `src/domains/calendar/api/calendar-api.ts`
- `src/domains/calendar/api/schedule-api.ts`
- `src/domains/trip/mappers/*`
- `src/domains/calendar/mappers/*`
- `src/lib/env/env.ts`
- `src/lib/api/__tests__/api-client.test.ts`

## 4. 확정 결정

- `api-client.ts`는 generic fetch wrapper로 유지한다.
- runtime validation은 transport가 아니라 **도메인 API boundary**에서 수행한다.
- 이미 설치된 `zod`를 우선 사용한다.
- schema parse 후 mapper를 적용하는 순서를 기본으로 한다.
- validation 실패는 조용히 무시하지 않는다. 공통 에러 체계로 surface한다.

## 5. 구현 대상

### 5.1 우선 검증 대상

우선순위는 아래 순서로 진행한다.

1. auth
   - login response
   - restore session response
2. trip
   - trip list item
   - trip detail
   - register response
3. calendar
   - calendar meta
   - schedule event
   - create/update/delete response

### 5.2 추천 구조

```text
src/domains/
  auth/
    api/
      auth-api.ts
      auth-schemas.ts
  trip/
    api/
      trip-api.ts
      trip-schemas.ts
  calendar/
    api/
      calendar-api.ts
      schedule-api.ts
      calendar-schemas.ts
```

schema 파일을 별도로 둘지, API 파일 내부에 둘지는 구현 시 판단할 수 있다. 다만 **검증 책임이 어디 있는지**는 코드에서 즉시 보이도록 해야 한다.

### 5.3 validation 흐름

권장 순서:

1. `apiClient.get/post/...`
2. raw payload 수신
3. `schema.parse(raw)`
4. 필요 시 domain mapper 적용
5. hook/UI로 전달

### 5.4 에러 처리 규칙

- HTTP/network error와 validation error를 구분할 수 있어야 한다.
- 가능하면 `AppError`에 validation 성격의 code를 추가하거나 details에 parse issue를 담는다.
- UI는 validation details를 직접 렌더링하지 않는다.

## 6. 파일/폴더 목표 구조

```text
src/
  lib/
    api/
      api-client.ts
      errors.ts
  domains/
    auth/
      api/
        auth-api.ts
        auth-schemas.ts
    trip/
      api/
        trip-api.ts
        trip-schemas.ts
    calendar/
      api/
        calendar-api.ts
        schedule-api.ts
        calendar-schemas.ts
```

## 7. 타입/API/라우트 계약

### 7.1 transport 계약

- `api-client.ts`는 아래만 책임진다.
  - base URL 조합
  - auth header 주입
  - request body 직렬화
  - response body 파싱
  - HTTP/network error normalize

transport는 feature DTO shape를 몰라야 한다.

### 7.2 domain validation 계약

- auth/trip/calendar API는 schema를 통해 runtime contract를 고정한다.
- schema parse 이전 데이터는 domain model이 아니다.
- mapper는 parse된 데이터에만 적용한다.

## 8. 작업 순서

1. 현재 각 domain API의 response shape와 mapper 위치를 정리한다.
2. auth schema부터 추가한다.
3. trip schema를 추가하고 list/detail/register 흐름에 연결한다.
4. calendar schema를 추가하고 meta/schedule CRUD 흐름에 연결한다.
5. validation 실패를 `AppError` 흐름에 맞춰 surface한다.
6. 기존 테스트와 fixture를 schema 기준으로 정리한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `src/lib/api/__tests__/api-client.test.ts`
  - transport 계층이 validation 책임을 갖지 않는지 검증
- `src/domains/auth/api/__tests__/auth-api.test.ts`
  - valid/invalid login, restore payload 검증
- `src/domains/trip/api/__tests__/trip-api.test.ts`
  - list/detail/register response validation 검증
- `src/domains/calendar/api/__tests__/calendar-api.test.ts`
- `src/domains/calendar/api/__tests__/schedule-api.test.ts`
  - schedule/calendar payload validation 검증

테스트 게이트:

- invalid payload 테스트가 추가되기 전 Step 04~06 진행 금지

## 10. 완료 기준

- auth/trip/calendar 주요 API 응답이 runtime validation을 거친다.
- `api-client.ts`는 여전히 transport 책임만 가진다.
- validation 실패가 조용히 무시되지 않는다.
- 이후 UI/hook refactor가 실제 데이터 계약 위에서 진행 가능하다.

## 11. 리스크 / 보류 항목

- 실제 backend 응답이 문서/기존 가정보다 느슨할 수 있다.
  - 초기에는 schema를 너무 공격적으로 좁히지 않는다.
- validation 도입으로 기존 mock/test fixture가 대량 수정될 수 있다.
  - 도메인별로 점진 적용한다.

## 12. 후속 단계 연결 메모

- Step 04의 Trip asset hook 통합 시, file metadata를 응답에서 해석한다면 이 단계 schema를 재사용한다.
- Step 05~06의 Calendar refactor는 이 단계에서 확정한 `CalendarMeta` / `ScheduleEvent` runtime contract를 기준으로 진행한다.
- 구현 중에 “schema를 transport에 넣을까”라는 유혹이 생기면 이 문서를 다시 본다. 경계 분리를 유지하는 것이 목적이다.

## 13. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- 필요 시 backend contract reviewer 동행

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- schema parse 결과를 다시 `as T`로 덮어쓰지 않는다.
- feature DTO validation과 UI model mapping을 한 함수에 과도하게 섞지 않는다.
- validation failure를 empty fallback으로 숨기지 않는다.
