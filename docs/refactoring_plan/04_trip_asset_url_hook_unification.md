# Step 04. Trip Asset URL Hook Unification

## 1. 목적

Trip asset blob/object URL 로딩이 단건과 복수건에서 서로 다른 방식으로 구현된 상태를 통합하는 단계다. 이 단계의 목적은 이미지/파일 로딩의 캐싱, cleanup, partial failure 처리 기준을 하나로 맞추는 것이다.

이 단계가 끝나면 구현자는 trip asset을 단건으로 쓰든 목록으로 쓰든 동일한 lifecycle 규칙 위에서 동작한다고 신뢰할 수 있어야 한다.

## 2. 범위

- `useTripAssetUrl.ts`와 `useTripAssetUrls.ts` 내부 정책 통합
- object URL 생성/해제 lifecycle 명확화
- list/detail/thumbnail consumer 회귀 확인

이번 단계에서는 asset UI 자체를 바꾸지 않는다. **data-loading policy 일관화**가 범위다.

## 3. 참조 소스

- `src/domains/trip/hooks/useTripAssetUrl.ts`
- `src/domains/trip/hooks/useTripAssetUrls.ts`
- `src/domains/trip/api/trip-files-api.ts`
- `src/lib/api/query-keys.ts`
- `src/domains/trip/components/TripListSection.tsx`
- `src/domains/trip/components/TripCard.tsx`
- `src/domains/trip/components/TripDetailSection.tsx`
- `src/domains/trip/hooks/__tests__/useTripAssetUrls.test.ts`

## 4. 확정 결정

- 단건/복수건 hook은 서로 다른 public shape를 유지해도 된다.
- 하지만 내부 fetch/cache/object URL policy는 최대한 공유한다.
- object URL revoke 시점은 “사용 종료 후”로 명확히 정의한다.
- partial success는 허용하되, 실패 항목이 전체를 깨뜨리지 않게 한다.
- React Query 사용 여부는 통일하되, 억지로 과도한 추상화를 만들지 않는다.

## 5. 구현 대상

### 5.1 현재 문제

- `useTripAssetUrl.ts`
  - Query 기반, 단건 blob -> object URL
- `useTripAssetUrls.ts`
  - 수동 `Promise.allSettled`, ref + state + `queueMicrotask`로 전체 map 관리

이 차이 때문에 아래가 불일치한다.

- fetch/cache 전략
- cleanup 타이밍
- 실패 처리 형태
- 테스트 포인트

### 5.2 목표 구조

추천 방향:

```text
src/domains/trip/hooks/
  internal/
    use-trip-asset-blobs.ts
    object-url-map.ts
  useTripAssetUrl.ts
  useTripAssetUrls.ts
```

구체 구조는 달라도 되지만, 아래 책임은 분리한다.

- blob fetch
- object URL 생성
- object URL revoke
- single / many wrapper

### 5.3 정책 결정 포인트

- list path set이 바뀔 때 전체 revoke/reset을 할지, delta update를 할지
- Query cache에 blob을 둘지, object URL까지 캐시할지
- 실패한 path를 null로 둘지 key 자체를 빼둘지

초기 refactor에서는 **안전한 cleanup + 예측 가능한 결과 shape**를 우선한다. micro-optimization은 후순위다.

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    trip/
      hooks/
        useTripAssetUrl.ts
        useTripAssetUrls.ts
        internal/
          use-trip-asset-blobs.ts
          object-url-map.ts
      components/
        TripListSection.tsx
        TripDetailSection.tsx
```

## 7. 타입/API/라우트 계약

### 7.1 단건 hook 계약

- 입력: `string | null | undefined`
- 출력: query 상태 + `objectUrl`
- path가 없으면 fetch하지 않는다.
- unmount 시 생성한 object URL을 revoke한다.

### 7.2 복수건 hook 계약

- 입력: `(string | null | undefined)[]`
- 출력: `Record<string, string>` 또는 문서화된 동등 구조
- 중복 path는 한 번만 처리한다.
- 일부 path 실패가 전체 map 생성을 막지 않는다.

## 8. 작업 순서

1. 현재 단건/복수건 hook의 fetch/cleanup 차이를 정리한다.
2. 내부 공통 policy를 먼저 정의한다.
3. blob/object URL lifecycle helper를 분리한다.
4. 단건 hook을 공통 policy 위로 옮긴다.
5. 복수건 hook을 공통 policy 위로 옮긴다.
6. Trip list/detail consumer에서 회귀를 확인한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `useTripAssetUrl` 테스트
  - path 없음 / 성공 / 실패 / cleanup 검증
- `useTripAssetUrls` 테스트
  - dedupe / partial success / cleanup 검증
- 필요 시 내부 helper 테스트
  - object URL map 생성/해제 규칙 검증

테스트 게이트:

- cleanup 테스트 없이 Calendar 단계 진행 금지

## 10. 완료 기준

- 단건/복수건 trip asset loading의 내부 정책이 일치한다.
- object URL lifecycle이 테스트로 검증된다.
- Trip list/detail consumer에서 시각적 회귀가 없다.
- 나중에 asset consumer가 늘어나도 같은 패턴으로 확장 가능하다.

## 11. 리스크 / 보류 항목

- object URL revoke 타이밍을 잘못 잡으면 이미지 flicker 또는 leak가 발생한다.
- Query cache와 object URL cache를 혼동하면 메모리 관리가 어려워질 수 있다.
  - 처음에는 blob fetch와 object URL 생성을 분리해 사고한다.

## 12. 후속 단계 연결 메모

- Step 05 Calendar decomposition과 직접 의존하지는 않지만, 동일한 “side effect 분해” 원칙을 적용하는 참고 사례가 된다.
- 만약 trip 이미지가 future preloading 대상이 되면 이 단계에서 정한 공통 policy를 확장해야 한다.

## 13. 코딩 에이전트 가이드

### 권장 역할

- FE 메인

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- 현재 hook의 public contract를 불필요하게 크게 바꾸지 않는다.
- object URL을 Query cache에 직접 넣는 설계는 신중히 검토한다.
- `Promise.allSettled`를 제거하더라도 partial success 요구는 유지한다.
