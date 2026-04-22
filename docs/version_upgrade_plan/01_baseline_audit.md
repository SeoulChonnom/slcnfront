# Step 01. Baseline Audit And Contract Capture

## 1. 목적

현재 React 예제 프로젝트를 실제 서비스 기준선으로 바꾸기 위한 감사 단계다. 이 단계의 목적은 “무엇을 보존해야 하는가”를 코드와 테스트로 고정하는 것이다.

이 단계가 끝나면 이후 구현자는 기존 Vue 동작을 다시 해석하지 않고, 캡처된 계약과 체크리스트만 보고 개발을 진행할 수 있어야 한다.

## 2. 범위

- 현 저장소의 Vite 예제 상태를 제거 대상/유지 대상 관점으로 분석
- `../old/slcnfront`의 라우트, 상태, API, 정적 데이터, 파일 업로드 규칙 정리
- Pencil 시안과 old Vue 기능 간의 충돌 지점 기록
- 이후 단계에서 사용할 fixture/contract/test input 정의

이번 단계에서는 UI 구현을 시작하지 않는다. 대신 구현 단계에서 따라야 할 기준선 산출물을 만든다.

## 3. 참조 소스

- `src/App.tsx`, `src/main.tsx`, `src/index.css`
- `../old/slcnfront/src/router/index.js`
- `../old/slcnfront/src/views/*`
- `../old/slcnfront/src/store/*`
- `../old/slcnfront/src/service/*`
- `../old/slcnfront/src/config/index.js`
- `../old/slcnfront/src/global/global.js`
- `docs/new_design_improvement_report.md`
- `docs/ia_report.md`
- `docs/api_spec.json`

## 4. 확정 결정

- old Vue의 기능과 데이터 계약이 보존 기준이다.
- `docs/new_design_improvement_report.md`의 확정 사항을 재판단하지 않는다.
- `/map` 검색과 범위 밖 메뉴는 구현하지 않는다.
- 공개 URL은 유지하되, 내부 구현은 `/main/*`, `/mobile/*` 구조를 따른다.

## 5. 구현 대상

### 5.1 감사 산출물

아래 내용을 코드 레벨 산출물로 남긴다.

- 라우트 보존 매트릭스
- API endpoint 매트릭스
- 주요 DTO/도메인 shape 초안
- 나들이 등록 multipart 계약 표
- 정적 신발 데이터 shape 표
- 디자인 충돌 항목과 보정 규칙

### 5.2 테스트 입력 산출물

이 단계에서 아래 fixture를 만든다.

```text
src/test/fixtures/
  auth/
  schedule/
  shoes/
  trip/
```

예상 fixture 항목:

- 로그인 성공/실패 응답 예시
- 일정 조회/등록/수정/삭제 payload 예시
- 나들이 목록/상세 payload 예시
- 나들이 등록 payload + 파일 조합 예시
- `globalShoes` 마이그레이션 전/후 예시

## 6. 파일/폴더 목표 구조

이 단계의 결과로 최소 아래 구조를 만든다.

```text
src/
  test/
    fixtures/
      auth/
      schedule/
      shoes/
      trip/
    contracts/
      legacy-routes.test.ts
      schedule-contract.test.ts
      trip-contract.test.ts
      shoes-contract.test.ts
  types/
    legacy/
      auth.ts
      schedule.ts
      shoes.ts
      trip.ts
```

`types/legacy/*`는 이후 정식 타입 정의의 초안 역할을 한다.

## 7. 타입/API/라우트 계약

### 7.1 라우트 보존 계약

반드시 아래 공개 URL이 동작해야 한다.

- `/login`
- `/`
- `/map`
- `/map/register`
- `/map/:date`
- `/calendar`
- `/calendar/week`
- `/shoesRecom`
- `/:brand/:shoesName`

### 7.2 인증 계약

- 로그인 요청은 userName/password 기반이다.
- 세션 복원은 refresh token 기반 silent login 흐름을 유지한다.
- 인증 실패 시 `/login` 복귀 규칙을 유지한다.

### 7.3 나들이 계약

- 목록: `GET /trip`
- 상세: `GET /trip/:date`
- 파일 다운로드: `GET /depot?path=...`
- 등록: multipart
  - JSON part: `tripRegisterRequest`
  - files: `logo`, `map1`, `map2`

### 7.4 일정 계약

- 조회
  - 현재 월/기본: `/schedule`
  - 특정 월: `/schedule/date?year=...&month=...`
- 등록/수정/삭제 endpoint는 old Vue config 기준으로 유지한다.

### 7.5 신발 계약

- 데이터 소스는 API가 아니라 `globalShoes`
- 브랜드/상품 조합은 기존 데이터 그대로 유지

## 8. 작업 순서

1. Vite starter 코드와 실제 서비스 간 차이를 문서화한다.
2. old Vue 라우트와 화면을 기준으로 공개 URL 매트릭스를 만든다.
3. old store/service/config를 기준으로 endpoint와 payload shape를 분리 정리한다.
4. `globalShoes` 구조를 타입 초안과 fixture로 고정한다.
5. 나들이 등록 payload, 상세 멀티맵, 퀴즈 데이터를 fixture로 고정한다.
6. 이후 단계에서 재사용할 contract test를 추가한다.

## 9. 단계 종료 직후 단위 테스트

이 단계의 테스트 목적은 “기준선 캡처가 올바른가”를 검증하는 것이다.

필수 테스트:

- `legacy-routes.test.ts`
  - 보존 대상 공개 URL 목록이 누락 없이 정의되었는지 검증
- `schedule-contract.test.ts`
  - 일정 fixture가 월간/주간 구현에 필요한 최소 필드를 갖는지 검증
- `trip-contract.test.ts`
  - 나들이 목록/상세/등록 fixture가 기존 필드를 빠뜨리지 않았는지 검증
- `shoes-contract.test.ts`
  - 브랜드/상품 slug와 원본 데이터 shape가 예상 구조와 일치하는지 검증

테스트 게이트:

- 기준선 fixture와 타입 초안이 통과하기 전 Step 02로 진행 금지

## 10. 완료 기준

- 보존 대상 공개 URL과 내부 대응 개념이 정리되어 있다.
- old Vue의 API/데이터 계약이 fixture와 타입 초안으로 고정되어 있다.
- 이후 단계가 old Vue 코드를 다시 뒤져서 의사결정할 필요가 없다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- old Vue의 일부 필드명은 백엔드 문서와 완전히 일치하지 않을 수 있다.
  - 이 단계에서는 old Vue 동작을 우선 기준으로 채택한다.
- 일정 삭제 API는 REST 관점에서 비정형적일 수 있다.
  - 실제 endpoint shape는 old config 기준 그대로 유지한다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- PM: 범위 누락 여부 점검
- FE: 타입 초안, fixture, contract test 작성

### 권장 스킬

- `vercel-react-best-practices`
  - 테스트와 구조 분리를 먼저 잡을 때 유용

### 권장 MCP / 도구

- `rg`로 old Vue 라우트와 store 추적
- 필요 시 Pencil MCP는 사용하지 않아도 된다

### 구현 주의사항

- 이 단계에서 실제 UI 컴포넌트 구현을 시작하지 않는다.
- fixture는 향후 도메인 단계의 테스트 데이터로 재사용 가능한 형태로 만든다.
