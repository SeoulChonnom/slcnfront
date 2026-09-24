# 임장 기록 — FE 구현 결정 사항

[`api.md`](./api.md)(2026-09-22 갱신)와 [`docs/api_spec.json`](../api_spec.json)을 기준으로
**FE가 무엇을 어떻게 만들 것인지**만 담는다. BE에 요청할 것은 없다 — 계약 논의는 끝났다.

화면 설계는 [`screen_design.md`](./screen_design.md), 도메인 규칙은
[`requirements_specification.md`](./requirements_specification.md)가 기준이다.
이 문서와 `screen_design.md`가 어긋나는 곳은 **이 문서가 이긴다**(§4에 수정 대상을 적었다).

---

## 1. 모듈 배치

```text
src/domains/inspection/
  api/        inspection-api.ts · inspection-schemas.ts · inspection-files-api.ts
  hooks/      useInspectionAreaList.ts · useInspectionAreaDetail.ts · ...
  mappers/    DTO → 화면 모델 정규화 (§3-①·②)
  components/ AreaRow · VisitRail · InterestStars · RevisitIntentMark · AnswerField · ...
  utils/      property-linking.ts(정규화 일치) · inspection-validation.ts
  types.ts
```

`src/domains/travel/`과 같은 구조다. 쿼리 키는 `src/lib/api/query-keys.ts`에 다른 도메인과
같은 문법으로 더한다.

```ts
export const inspectionQueryKeys = {
  all: ['inspection'] as const,
  areaList: (params: AreaListParams) => [...inspectionQueryKeys.all, 'area-list', params] as const,
  areaDetail: (areaId: string, visitId: string | null) =>
    [...inspectionQueryKeys.all, 'area-detail', areaId, visitId] as const,
  areaProperties: (areaId: string, complexName: string, name: string) =>
    [...inspectionQueryKeys.all, 'area-properties', areaId, complexName, name] as const,
  property: (propertyId: string) => [...inspectionQueryKeys.all, 'property', propertyId] as const,
  visitList: (params: VisitListParams) => [...inspectionQueryKeys.all, 'visit-list', params] as const,
  tags: (keyword: string, scope: TagScope) => [...inspectionQueryKeys.all, 'tags', keyword, scope] as const,
  complexNames: (visitId: string, scope: ComplexNameScope) =>
    [...inspectionQueryKeys.all, 'complex-names', visitId, scope] as const,
  questions: (includeDisabled: boolean, withAnswerCount: boolean) =>
    [...inspectionQueryKeys.all, 'questions', includeDisabled, withAnswerCount] as const,
  questionVersions: (questionId: string) =>
    [...inspectionQueryKeys.all, 'question-versions', questionId] as const,
};
```

응답은 전부 zod로 파싱한다(`inspection-schemas.ts`). 에러 envelope(`{ success, message }`)는
스펙에 모델링돼 있지 않으므로 기존 `src/lib/api/errors.ts` 처리를 그대로 쓴다.

---

## 2. 라우터

`screen_design.md` §2에서 확정한 7개 라우트를 `BASE_PROTECTED_ROUTES`에 더한다.

```ts
{ path: 'inspection', page: 'inspectionAreaList' },
{ path: 'inspection/register', page: 'inspectionRegister' },
{ path: 'inspection/questions', page: 'inspectionQuestions', requireRole: 'admin' },
{ path: 'inspection/:areaId', page: 'inspectionAreaDetail' },
{ path: 'inspection/:areaId/property/:propertyId', page: 'inspectionPropertyDetail' },
{ path: 'inspection/:areaId/visit/:visitId/edit', page: 'inspectionVisitEdit' },
{ path: 'inspection/:areaId/visit/:visitId/property/:propertyId/edit', page: 'inspectionPropertyEdit' },
```

`RoutePageKey`에 7개 키를 더하고 `lazy-route-pages.tsx`에 `main`/`mobile` 양쪽 로더를 채운다.
셸은 전부 기본값을 쓴다 — 별도 셸이 필요한 화면은 없다.

### 역할 가드를 새로 만든다

질문 관리는 `GET`이 `USER`에게도 열려 있고 **저장할 때만 `403`**이다(`api.md` §9).
즉 서버가 화면 진입을 막아 주지 않으므로 라우터에서 막는다.

현재 `src/app/router/guards.tsx`에는 `RequireAuth`뿐이고, 보호 라우트는
`render-device-routes.tsx`에서 **하나의 `<Route element={<RequireAuth />}>` 아래 평면으로**
렌더된다. 그래서 `Outlet` 기반 가드를 하나 더 겹치는 대신 **요소를 감싸는 방식**을 쓴다.

1. `BaseRouteDefinition`에 `requireRole?: Role`을 더한다
2. `renderProtectedRoutes`에서 그 값이 있으면 요소를 감싼다

```tsx
element={
  route.requireRole
    ? <RequireRole role={route.requireRole} fallbackPath={routeConfig.notFoundPath}>
        {renderLazyRoutePage(device, route.page)}
      </RequireRole>
    : renderLazyRoutePage(device, route.page)
}
```

`RequireRole`은 `useAuthStore`의 `userInfo.roleList`를 본다. 이 값은 스토어에 persist되어
세션 복원 후에도 살아 있다(`src/domains/auth/api/auth-api.ts`의 `mapRole`이 `ADMIN` → `admin`으로
내린다). **권한 부족은 로그인으로 보내지 않고 404로 보낸다** — 인증은 됐고 권한만 없는 상태에서
로그인 화면으로 튕기면 사용자가 계정을 의심한다.

메뉴에도 노출하지 않는다. `/{device}/inspection/questions` 직접 진입만 허용한다.

---

## 3. API 계약에서 FE가 지켜야 할 것

### ① 회차 id 필드명이 두 가지다 — 매퍼에서 정규화한다

| 응답 | 필드명 |
| --- | --- |
| 지역 상세 `visits[]`, 지역 목록 `latestVisit` | `visitId` |
| 임장 목록·상세, 매물 상세 | `inspectionVisitId` |

같은 값이다. 화면 모델에서는 **`visitId` 하나로 통일**하고, 변환은 매퍼에서만 한다.
컴포넌트가 두 이름을 아는 순간 실수가 난다.

### ② 회차 간 매물 연결 — 정규화는 FE가, 조회는 필터로

```text
GET /inspection-areas/{areaId}/properties?complexName={정규화값}&name={정규화값}
```

정규화 규칙(앞뒤 공백 제거 + 연속 공백 1칸, 정확 일치)은 `utils/property-linking.ts`에 둔다.
**정규화한 값을 쿼리로 보낸다.** 유사도 매칭은 쓰지 않는다. 오탐 가능성이 있으므로 문구는
`같은 이름으로 기록된 다른 회차`로 두고 **연결 해제**를 항상 옆에 둔다.

### ③ 목록 래퍼와 카운트

응답은 `{ items, totalCount, hasNext }`다. 지역 목록에는 `revisitIntentCounts`와 `totals`가 더 온다.

- **`revisitIntentCounts.total`은 `YES + MAYBE + NO`와 다르다.** `total`은 지역 총 수이고,
  나머지는 최신 회차에 재방문 의사가 채워진 지역만 센다
- → **필터 칩에 「미정 N」을 하나 더 둔다.** 칩 4개(`전체`·`YES`·`MAYBE`·`NO`)만 두면 합이
  전체와 안 맞아 사용자가 숫자를 의심한다. `미정`은 최신 회차가 DRAFT라 의사를 안 적은
  지역으로 가는 길이 되므로 오히려 쓸모가 있는 칩이다. `미정 = total - (YES+MAYBE+NO)`
- 헤더 문장(`N개 지역을 M번 걸었고, 매물 K건을 봤습니다`)은 `totals`를 쓴다.
  `revisitIntentCounts`·`totals`는 `keyword`·`revisitIntent`·`page`에 영향받지 않으므로
  필터를 걸어도 숫자가 흔들리지 않는다

### ④ 회차 이어받기 — 상수를 박지 않는다

지역 상세가 `hasMoreVisits: true`를 주면 응답의 **`visitPageSize`를 그대로 `size`로 넘긴다.**

```text
GET /inspection-visits?areaId={areaId}&page=1&size={visitPageSize}
```

두 조회의 정렬 키가 같아서(`visitedAt` 내림차순 → `visitId` 오름차순) 경계에서 중복·누락이
없다. **`50`을 코드에 쓰지 않는다** — BE가 절단 개수를 바꿔도 따라간다.

### ⑤ `keyword`와 `tag`의 규칙이 다르다

| 파라미터 | 규칙 |
| --- | --- |
| `keyword` | 대소문자 무시. 지역명·지역 설명·단지명·매물명·태그 5종 매칭 |
| `tag` | **대소문자까지 정확히 일치.** 복수 지정은 AND |

태그 칩·자동완성에서 고른 값을 **가공 없이 그대로** 넘긴다. `trim`이나 `toLowerCase`를 끼우면
조용히 0건이 된다. 무결과 문구는 검색 범위 5종을 밝힌다.

매물이 걸리면 그 지역 행의 `matchedProperty`가 채워진다. 이때는 `topProperty` 자리에
`matchedProperty`를 그린다. `null`이면 `topProperty`를 쓴다.

### ⑥ 낙관적 잠금이 없다 — 덮어쓰기를 UI로 줄인다

요청에 버전을 싣지 않으므로 `409`(`INSPECTION_VISIT_CONFLICT`·`VIEWED_PROPERTY_CONFLICT`)는
**드물게 나는 재시도 안내** 수준으로만 붙인다. 충돌이 막힌다고 가정하지 않는다.

FE에서 할 수 있는 완화는 두 가지다.

- 수정 화면 진입 시 최신 데이터를 다시 받는다(`staleTime: 0`)
- 저장 성공 후 상세·목록 쿼리를 무효화해 다른 탭이 오래된 값을 들고 있지 않게 한다

### ⑦ 상태가 서버에서 자동으로 내려간다

`COMPLETED` 임장에 매물을 추가하거나 매물을 `DRAFT`로 되돌리면 **임장도 `DRAFT`로 내려간다.**
에러가 아니다. 응답에 바뀐 상태가 담기므로 **배지를 응답 기준으로 갱신**한다.
낙관적 업데이트로 상태를 직접 계산하지 않는다 — 계산이 서버와 어긋난다.

### ⑧ 사진

- 업로드는 `POST /assets/files?type=inspection`, **6장 단위로 나눠 올린다**(요청 전체 60MB 상한).
  받은 `fileAssetId`를 모아 한 번에 저장한다. 진행률을 노출한다 — 파생본 생성이 동기다
- 조회에는 `variant`를 **반드시** 지정한다. 목록·썸네일 `home-thumb`, 상세 갤러리 `home-feature`,
  확대·다운로드는 원본. 빼면 서명 URL이 `no-store`로 내려와 캐시가 전혀 먹지 않는다
- `files`를 생략하면 기존 연결 유지, 보내면 그 그룹이 통째로 치환. 유지할 항목은 `id`를 함께 보낸다

### ⑨ 문답

- 렌더링은 **응답에 담긴 스냅샷 값**(`question`·`answerType`·`choiceOptions`)만 쓴다.
  `isCurrentVersion`·`questionEnabled`는 **배지 전용**이다. 이걸로 렌더링을 바꾸면 과거 기록이
  그때 그대로라는 보장이 깨진다
- 타입에 맞는 값 필드만 보낸다. 섞으면 `400`
- **값 필드에 `null`을 보내면 그 답변이 지워진다.** DRAFT에서 잘못 쓴 답을 비우는 경로로 쓴다
- 요청에 없는 `questionId`는 그대로 남으므로 **부분 저장**이 된다. 자동 저장에 이걸 쓴다

---

## 4. `screen_design.md`에서 고칠 곳

구현 전에 설계 문서를 아래대로 수정한다.

| 위치 | 수정 |
| --- | --- |
| §5.4 ③ | `작성을 시작한 2026.09.24 14:22 시점 구성으로 고정` → **매물 기준**으로 고친다. 문답 스냅샷은 매물 생성 시점에 잡힌다. §5.3의 `2026.09.17 임장 시점` 문구는 그대로 정확하다 |
| §5.3 | 매물 사진 `캡션 필수` → **권장**. 서버에 캡션 검증이 없다. 다만 캡션이 곧 대체 텍스트이므로, 비면 `alt=""`로 두고 입력 유도 문구를 남긴다 |
| §5.1 | `태그 상위 3개 + N` → **`태그 3개 + N`**. 태그 순서는 현재 가나다순이고 입력 순서가 보존되지 않는다. "상위"라고 쓰면 없는 기준을 약속하게 된다 |
| §5.1 | 썸네일 출처를 `최신 회차 앞 2장` → **`최신 회차부터 거슬러 올라가며 2장`**. 최신 회차에 사진이 1장이면 2번째는 지난 회차 사진이다 |
| §5.1 | 필터 칩에 **`미정 N`** 추가 (§3-③) |
| §5.4 ② | 자동 저장 시작 시점을 명시한다 (§5 참조) |
| §5.4 ④ | 완료 검증의 선택지를 **1개로 줄인다** (§5 참조) |
| §2 | 질문 관리를 "관리자 전용"이 아니라 **"조회는 열려 있고 FE가 라우터에서 막는다"**로 적는다 |

---

## 5. 화면 동작 결정 2건

### 자동 저장은 `visitedAt`을 채운 뒤에 시작한다

`visitedAt`은 DRAFT에서도 필수다(목록 정렬 축). ①단계 직후 DRAFT를 만들려면 현재 시각으로
채워 POST해야 하고, 그러면 사용자가 날짜를 고치기 전까지 **오늘 날짜 기록이 목록에 섞여 보인다.**

→ ②단계에서 `visitedAt`을 입력하기 전까지 **서버 POST를 미루고 로컬 초안만 유지**한다.
`14:22에 임시 저장됨` 표시는 첫 POST 이후부터 켠다. 그전에는 `아직 저장되지 않았습니다`를
같은 자리에 둔다 — 자리를 비우면 저장된 것처럼 읽힌다.

이후 자동 저장은 `PUT /inspection-visits/{visitId}`와 문답 부분 저장으로 이어간다.

### 완료 검증의 선택지는 1개만 둔다

`screen_design.md` §5.4 ④는 「남은 두 매물을 마저 쓰기」와 「두 매물을 이 임장에서 빼고
완료하기」 두 갈래를 그렸다. 후자는 **현재 API로 구현할 수 없다** — 임장 완료 조건이
"등록된 매물이 전부 `COMPLETED`"이고, 빼는 수단은 삭제뿐이다. 완료 버튼 옆에 삭제를 두면
사용자가 적어 둔 내용이 사라진다.

→ 1차에서는 **「마저 쓰기」만 남긴다.** 대신 막다른 화면이 되지 않게 **막힌 매물별로 그 매물의
편집 화면으로 바로 가는 링크**를 놓는다.

```text
⚠ 매물 2건이 아직 작성 중입니다
    102동 1501호 — 주차 대수, 관리비 수준 미작성      [이어서 쓰기 →]
    105동 803호 — 관심도와 필수 문답 5개 미작성        [이어서 쓰기 →]
```

BE에 `excluded`가 들어오면 두 번째 선택지를 복원한다.

---

## 6. BE 후속을 기다리는 것

구현은 지금 시작하고, 아래는 들어오는 시점에 화면만 바꾼다. **지금 화면이 막히지는 않는다.**

| 대기 항목 | 지금 | 들어오면 |
| --- | --- | --- |
| `ViewedProperty.excluded` | 완료 검증 선택지 1개 (§5) | 「빼고 완료하기」 복원 |
| 태그 입력 순서 보존 | `태그 3개 + N` (가나다순) | `상위 3개` 문구 복원 |
| 질문 버전 생성 시각 | 버전 이력 날짜 자리에 `날짜 미상` fallback | 실제 날짜 표시 |
| `answerCount` 쿼리 통합 | §5.5 진입 시 `?withAnswerCount=true`, 스켈레톤으로 버틴다 | 스켈레톤 시간 단축 |
| 경량 지역 검색(`?summary=false`) | 작성 ①단계가 집계까지 받는다. 지역 수가 적어 감당된다 | 요청 크기 축소 |

---

## 7. 구현 순서

조회 → 작성 → 관리 순이다. 앞 단계가 뒤 단계의 검증 도구가 된다.

1. **기반** — 스키마·API 클라이언트·쿼리 키·매퍼(§3-①), 라우터 7개 + `RequireRole`(§2)
2. **지역 리스트** — 래퍼·카운트·칩·정렬·검색(§3-③·⑤). 스켈레톤·빈 상태·무결과까지 함께
3. **지역 상세** — 회차 레일 + `?visit=` 동기, 매물 목록 `complexName` 그룹핑
4. **매물 상세** — `GET /inspection-properties/{propertyId}` 단건, breadcrumb·이전/다음,
   회차 연결 스트립(§3-②), 문답 렌더(§3-⑨)
5. **작성 플로우** — 3단계 + 매물 편집 + 완료 검증. 자동 저장(§5), 사진 업로드(§3-⑧)
6. **질문 관리** — 목록·순서·필수·미사용·버전 모달

각 단계가 끝날 때 `AGENTS.md`의 Definition of Done을 지킨다 — biome·typecheck·test 출력과
1440px/390px 캡처를 근거로 남기고, 검증하지 않은 것을 명시한다.
