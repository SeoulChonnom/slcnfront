# Step 09. Quality, Cutover, And Migration

## 1. 목적

이전 단계에서 구현된 기능을 기존 Vue 서비스와 비교해 회귀 여부를 확인하고, 최종 라우팅/도메인/디자인 품질을 점검한 뒤 안전하게 마무리하는 단계다.

## 2. 범위

- 공개 URL 회귀 점검
- 인증 흐름 점검
- Trip/Calendar/Shoes 기능 점검
- 접근성 점검
- 디바이스 라우팅 점검
- 최종 정리와 cutover 체크

전체 테스트 체계를 대규모로 바꾸는 것은 이 단계 범위가 아니다.

## 3. 참조 소스

- `docs/refactoring_plan/00_master_plan.md`
- `docs/refactoring_plan/06_trip_domain.md`
- `docs/refactoring_plan/07_calendar_domain.md`
- `docs/refactoring_plan/08_shoes_domain.md`
- `../old/slcnfront/src/*`

## 4. 확정 결정

- 전체 테스트 전략은 확대하지 않는다.
- 앞선 단계의 단위 테스트 결과를 최종 품질 입력으로 사용한다.
- 이 단계는 통합 관점의 회귀 검증과 마감 정리에 집중한다.

## 5. 구현 대상

### 5.1 회귀 체크

- 로그인
- 공개 URL 진입
- `/main/*`, `/mobile/*` 분기
- 나들이 목록/퀴즈/상세/등록
- 일정 월간/주간/CRUD
- 신발 목록/상세
- 404

### 5.2 품질 점검

- focus-visible
- 라벨 연결
- 이미지 alt
- 모달 keyboard interaction
- sticky CTA와 bottom nav 충돌
- 모바일 safe area

### 5.3 마감 작업

- dead code 제거
- starter asset 제거
- 라우트/타입/토큰 naming 정리
- README 또는 개발 문서 최소 갱신

## 6. 파일/폴더 목표 구조

이 단계에서 새 도메인 구조를 크게 늘리지는 않는다. 대신 아래와 같은 검증/정리 항목을 반영한다.

```text
src/
  test/
    regression/
      public-routes.test.tsx
      navigation-smoke.test.tsx
      auth-smoke.test.tsx
```

필요 시 간단한 smoke 수준만 추가한다.

## 7. 타입/API/라우트 계약

### 7.1 공개 URL 계약

아래 주소는 최종 상태에서 유효해야 한다.

- `/login`
- `/`
- `/map`
- `/map/register`
- `/map/:date`
- `/calendar`
- `/calendar/week`
- `/shoesRecom`
- `/:brand/:shoesName`

### 7.2 내부 라우트 계약

- `/main/*`
- `/mobile/*`

외부 사용자는 내부 라우트 prefix를 직접 알 필요가 없지만, direct hit에도 정상 렌더링되어야 한다.

## 8. 작업 순서

1. 공개 URL 기준으로 smoke 테스트를 수행한다.
2. auth/session 회귀를 점검한다.
3. 각 도메인의 핵심 플로우를 수동 및 테스트로 확인한다.
4. 접근성과 모바일 레이아웃 문제를 수정한다.
5. starter 코드와 불필요한 중복 코드를 제거한다.
6. README/개발 문서 최소 업데이트를 수행한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `public-routes.test.tsx`
  - 공개 URL 접근과 내부 라우트 분기 smoke 검증
- `navigation-smoke.test.tsx`
  - 주요 내비게이션 링크 검증
- `auth-smoke.test.tsx`
  - 로그인/세션 복원/가드 흐름 검증

추가로, 이전 단계의 단위 테스트 전체를 다시 실행한다.

테스트 게이트:

- 현재 단계 smoke 테스트 + 기존 단계 테스트 모두 통과해야 마감 가능

## 10. 완료 기준

- 공개 URL 기준 기능 회귀가 없다.
- `/main/*`, `/mobile/*` 라우트 분기가 안정적이다.
- Trip, Calendar, Shoes 핵심 플로우가 모두 검증되었다.
- 접근성/레이아웃 주요 이슈가 정리되었다.
- 단계 전용 단위 테스트와 기존 단계 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- 전체 e2e 부재로 인해 브라우저별 차이가 남을 수 있다.
  - 이번 단계에서는 smoke 수준만 수행하고, 필요한 경우 후속 과제로 남긴다.
- UA 판별의 경계 케이스는 일부 기기에서 추가 보정이 필요할 수 있다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- PM: 최종 scope/완료 기준 검수
- FE: 회귀 수정
- 퍼블리셔: responsive/a11y 미세 조정

### 권장 스킬

- `playwright` 필요 시 브라우저 smoke 확인용
- `vercel-react-best-practices`

### 구현 주의사항

- 이 단계에서 새 기능을 넣지 않는다.
- 마감 단계의 수정은 회귀 수정과 정리로 제한한다.
