# 06. FE 개발 계획 — 임장 계획 · 지도 경로

> 작성일: 2026-10-08. BE 전달 문서(05)와 BE `docs/field_research/api.md`(커밋 `159c6f7`)를 FE 코드에 대조해 세운 계획이다.
> **3차 갱신:** 위치 저장 실패 처리(§4)에 BE 제안("위치 오류면 위치를 되돌려 같은 요청을 다시 보낸다")을 반영했다. 자동 저장의 실패 처리 문제(G10)를 더했다.
> **2차 갱신:** BE 답변(G1~G8 확인)과 결정(§6, FD1~FD4)을 반영했다. BE 리뷰 커밋 `43763f9` · `159c6f7`의 변경(좌표 없는 주소 `400`, 위치 길이 제한, 여러 지점에 걸친 구간, 빈 `path`, 지역 상세 기본 선택)도 반영했다.
> 결정 근거는 04(D1~D14), 화면별 규칙은 05 §4를 따른다. 이 문서는 **FE가 무엇을, 어떤 순서로, 어느 파일에서** 하는지만 다룬다.

## 1. 출발점

- BE는 C1~C11과 리뷰 반영이 끝났다(`slcnapp` `04c1c60`~`159c6f7`). 실제 키 연동만 남았다(05 §7).
  - 로컬 BE는 키가 없으면 주소 검색 · 위치 저장 · 경로 · 현재 위치 API가 모두 `503`이다.
  - FE는 **msw 모의 응답으로 개발**하고, 실제 키가 붙으면 통합 확인을 한다.
- FE 커밋 단위는 04 §10.3의 FC1~FC6을 그대로 쓴다. 앞에 문서 동기화(FC0)를 하나 더 둔다.
- FE와 BE는 같은 날 함께 배포한다(D10). **FC1은 반드시 같은 배포에 들어간다.**

## 2. 코드 대조로 찾은 것과 BE 확인 결과

| # | 내용 | 위치 | BE 확인 | FE 대응 (커밋) |
|---|---|---|---|---|
| G1 | 등록 2단계가 **재방문 의사를 필수로 막는다.** 다녀오기 전에는 정할 수 없다 | `useInspectionRegisterWizard.ts` `validateStep2` | BE는 등록 · 수정 때 요구하지 않고 **완료할 때만** 검사한다(`findMissingFieldsForCompletion`). 등록에 필요한 것은 지역과 `visitedAt`뿐 | 2단계 필수는 예정일만. 결과 항목은 등록 마법사에서 숨긴다(FD3) (FC3) |
| G2 | 지역 상세 매물 목록이 **떨어진 같은 단지까지 한 묶음**으로 모은다. 지도 번호와 목록 순서가 어긋난다 | `area-detail/PropertyGroupList.tsx` `groupByComplexName` | BE 응답은 모두 `sortOrder` 순 평면 목록이고, 도보 경로도 **바로 이어지는** 같은 좌표만 합친다 | **연속한 같은 단지만 묶는다**(FD1) (FC4b) |
| G3 | 등록 3단계가 응답을 `sortOrder`로 다시 정렬한다 | `RegisterStepProperties.tsx:31` | api.md §6, 04 §6.2와 일치 | 재정렬을 빼고 응답 배열 순서를 쓴다 (FC4b) |
| G4 | 순서 변경이 HTML5 드래그뿐이다. 휴대폰 터치 동작 미확인, 낙관적 업데이트 없음 | `RegisterStepProperties.tsx` `handleDragEnd` | 순서 API는 부분 요청도 받는다. 위/아래 버튼은 **두 매물의 `sortOrder`만** 바꿔 보내면 된다 | 위/아래 버튼 추가(두 건만 전송), 낙관적 업데이트 (FC4b) |
| G5 | 계획 임장의 매물이 전부 `DRAFT`라 **모든 행에 "작성 중"** 이 붙는다 | `PropertyRow.tsx:126`, `RegisterStepProperties.tsx:107` | BE 동작은 정상. FE 표시 규칙만 고친다 | 임장 `completedAt == null`이면 매물 배지 · 사유 숨김. **수정 중 임장에서만** 매물 "작성 중"을 보인다(FD2) (FC2) |
| G6 | FE의 `docs/field_research/api.md` 사본이 오래됐다 | `docs/field_research/api.md` | 맞다. 리뷰 커밋 `159c6f7`에서도 고쳤다 | **`159c6f7` 이후** BE 사본으로 맞춘다 (FC0) |
| G7 | 매물 수정은 자동 저장이다. 새 주소가 실린 PUT이 위치 조회에 실패하면 메모 등 **함께 실린 입력도 저장되지 않는다** | `InspectionPropertyEditSection.tsx` `useAutosave` | 의도한 동작(D9). 위치 조회가 실패하면 PUT 전체를 거절한다(`400`/`502`/`503`). **FE 보완 필요** | BE 제안(위치 되돌리고 같은 PUT 재전송)을 기본으로 §4.1 (FC4a) |
| G8 | 매물 추가 폼에 주소 입력이 없다 | `AddPropertyForm.tsx` | 등록 POST는 이미 `location`을 받는다(C8). 다만 위치 조회가 실패하면 **등록 전체가 실패**하므로 G7과 같은 처리가 필요하다 | §4.2 "위치 없이 등록할까요?" (FC4a) |
| G9 | 지역 상세에서 `visitId` 없이 열면 BE가 **최근 완료 회차**(없으면 `plannedVisit`)를 펼친다. 회차 목록은 `visitedAt` 내림차순이라 미래 계획이 첫 행인데 다른 회차가 펼쳐질 수 있다 | `VisitRail.tsx`, `InspectionAreaDetailSection.tsx:152` | BE 리뷰(`159c6f7`)에서 규칙 명시 | **이미 충족.** 선택 강조를 `selectedVisit.visitId`로 하고 있다. 회귀 테스트만 더한다 (FC3) |
| G10 | 자동 저장이 보내기 **전에** 값을 "저장됨"으로 표시한다. 저장이 실패해도 같은 값은 다시 보내지 않고, 사용자가 무언가를 더 입력해야 다시 보낸다 | `hooks/useAutosave.ts` `saveLatestIfChanged` | FE 단독 | 실패하면 "저장 안 됨"으로 되돌린다. §4.1의 전제 (FC4a) |

## 3. 커밋 계획

모든 커밋에서 `npx @biomejs/biome check --write src/`, `pnpm typecheck`, `pnpm test`, `pnpm run knip`이 통과해야 한다.
UI가 바뀌는 커밋은 Playwright로 1440px(`/main`)과 390px(`/mobile`)을 캡처한다.

### FC0 `docs: 임장 API 명세를 BE 최신본으로 맞춤`

- `docs/field_research/api.md`를 `slcnapp` **`159c6f7` 이후** 사본으로 교체한다(G6).
- `docs/field_research_map/`(01~06, README)을 함께 커밋한다.

### FC1 `fix: 매물명(동·호수) 빈 값 응답 허용` — **같은 배포 필수**

| 파일 | 변경 |
|---|---|
| `api/inspection-schemas.ts` | 매물 `name` 4곳을 `z.string().nullable()`로: `viewedPropertyBriefSchema`, `matchedPropertySchema`, `areaViewedPropertySchema`, `viewedPropertyDetailSchema` |
| `types.ts`, `mappers/inspection-mappers.ts` | `name: string \| null` |
| `utils/inspection-format.ts` | `formatPropertyName(name)` 추가 → `null`이면 "동·호수 미정" |
| 표시하는 곳 | `RegisterStepProperties`, `PropertyRow`, `AreaListRow`(topProperty · matchedProperty), 매물 상세 breadcrumb · 이전/다음, `PropertyLineageStrip` 등 매물 `.name`을 그리는 곳 전부 |
| `AddPropertyForm.tsx` | `name`을 선택 입력으로. 비우면 `null`로 보낸다 |
| `InspectionPropertyEditSection.tsx` | 폼 값 `name ?? ''`, 저장할 때 빈 문자열 → `null`. 완료가 `400 INVALID_VIEWED_PROPERTY`로 막히면 `missingFields`의 `name`을 "동·호수"로 안내한다 |

- 테스트: 스키마(`name: null` 파싱), 매퍼, 표시("동·호수 미정").
- 기존 응답과도 호환되므로 BE를 붙이지 않고 먼저 끝낼 수 있다.

### FC2 `feat: 임장 계획 · 수정 중 · 완료 배지 구분`

| 파일 | 변경 |
|---|---|
| `api/inspection-schemas.ts` | 임장 스키마 3종(목록 항목, 상세, 요약 = 지역 `latestVisit` · 지역 상세 `visits[]`)에 `completedAt: z.string().nullable()` |
| `utils/visit-phase.ts` (신규) | `getVisitPhase({ status, completedAt })` → `'PLANNED' \| 'REVISING' \| 'COMPLETED'` (05 §4.1 표) + 테스트 |
| `DraftBadge.tsx` | 문구를 인자로 받는다. 임장용 `VisitPhaseBadge`(계획 / 수정 중)를 따로 둔다 |
| `VisitPanel.tsx`, `VisitRail.tsx`, `AreaListRow.tsx` | `status` 대신 `getVisitPhase`로 배지 |
| `PropertyRow.tsx`, `RegisterStepProperties.tsx` | 매물 배지 · 사유는 **임장이 `REVISING`일 때만** 보인다(FD2). 계획에서는 숨기고, 완료 임장의 매물은 원래 `COMPLETED`라 배지가 없다 |
| 문구(F5) | `InspectionVisitEditSection.tsx:282` "작성 중으로 되돌리기" → "완료 해제하고 수정", `CompletionChecklist.tsx:74` "아직 작성 중입니다" → "아직 완료 조건이 남았습니다" |

- `completedAt` 파서: `visitedAt`과 같은 정규식(`^…T\d{2}:\d{2}`)으로 앞부분만 읽으므로 초가 있든 없든 받는다. 테스트에 두 형식을 모두 넣는다.

### FC3 `feat: 계획 임장 등록과 지역 목록의 예정 표시`

**등록 마법사 = 계획 수립 전용(FD3).** 다녀온 뒤 쓰는 결과는 임장 수정 화면에서 쓰고, 완료도 거기서 한다.

| 파일 | 변경 |
|---|---|
| `useInspectionRegisterWizard.ts` | `validateStep2`에서 재방문 의사 필수 제거(G1). `attemptComplete`를 마법사에서 뺀다 |
| `RegisterStepBasicInfo.tsx` | 남기는 것: **예정일**("임장 일시" → "예정일"), 전체 메모, 태그. 숨기는 것: 재방문 의사, 한줄평, 장점 · 단점, 임장 사진. 안내: "다녀온 뒤 임장 수정 화면에서 결과를 쓰고 완료해요" |
| `InspectionRegisterSection.tsx` | 3단계 끝 버튼 "임장 완료" → **"계획 저장"**(완료 전이 없이 지역 상세로 이동). `CompletionChecklist`는 마법사에서만 쓰였으므로 삭제한다(임장 수정 화면은 자체 완료 안내를 쓴다) |
| `api/inspection-schemas.ts` | 지역 행 `plannedVisit`, 요약 `plannedVisitCount` |
| `area-list/format-area-row.ts` | `formatPlannedVisit(plannedVisit, today)` → "예정 10.12" / "미완료 10.05" + 테스트(오늘 경계 포함). `today`는 인자로 받는다 |
| `AreaListRow.tsx` | `visitCount: 0`, `latestVisit: null`인 지역(계획만 있음) 행 표시. `plannedVisitCount > 1`이면 "외 N건" |
| `build-draft-reason.ts`, `format-area-row.ts` | "임장 N건 작성 중" 계열 문구가 이제 "수정 중"만 센다는 점을 반영 |
| `InspectionAreaDetailSection` 테스트 | 미래 계획이 `visits[0]`이고 `selectedVisit`이 다른 회차일 때, 강조가 `selectedVisit` 쪽에 붙는지(G9) |

- 마법사에서 결과 항목을 숨기면 **등록 단계의 입력이 가벼워진다.** 위치 조회 실패(G7 · G8)로 다시 입력할 것이 거의 없다.
- 기존 사용 흐름 변화: 지금까지는 다녀온 뒤 마법사로 한 번에 기록하고 완료했다. 이제는 **마법사(계획) → 임장 수정 화면(결과 · 완료)** 두 단계다. 이미 다녀온 임장을 처음 기록할 때도 같다.
- 매물 수정 화면(마법사 3단계의 "이어서 쓰기")은 모든 항목을 그대로 보인다. 계획 단계에서 매물 메모를 미리 적을 수 있어야 하기 때문이다.

### FC4 `feat: 매물 주소 검색과 지도 표시`

가장 큰 커밋이라 **FC4a(주소 검색 · 위치 저장)** 와 **FC4b(지도)** 로 나눈다.

**FC4a — 주소 검색 · 위치 저장**

| 파일 | 변경 |
|---|---|
| `src/domains/geo/` (신규 도메인) | `api/geo-api.ts`, `api/geo-schemas.ts`(`addressSearchSchema` — `roadAddress` · `jibunAddress` · `buildingName` · `zipNo`는 **nullable**, `coordKeySchema`, `geoPointSchema`), `hooks/useAddressSearch.ts`(디바운스 300ms, 2자 미만이면 호출하지 않음), `components/AddressSearchField.tsx`, `utils/location-error.ts`(§4.3 오류 분류) |
| `api/inspection-schemas.ts` | 매물 상세 · 임장 상세 `properties[]` · 지역 상세 매물에 `location` |
| `types.ts` | `PropertyLocation`, `PropertyLocationInput = { bdMgtSn; roadAddress; coordKey? }`. **`UpdateInspectionPropertyInput.location: PropertyLocationInput \| null` 필수 키**(D9). 등록 입력은 선택 |
| `InspectionPropertyEditSection.tsx` | 주소 필드와 §4.1 처리(즉시 저장 · 위치 오류 시 되돌려 재전송) |
| `hooks/useAutosave.ts` | 저장 실패 시 "저장 안 됨"으로 되돌림(G10) + 테스트 |
| `AddPropertyForm.tsx` | 선택 입력 주소와 §4.2 "위치 없이 등록할까요?". 고르면 단지명이 비어 있을 때 `buildingName`으로 채운다(`null`이면 그대로 둔다) |

- 주소 검색 UI 하나를 매물 위치와 현재 위치(FC6)가 같이 쓴다. 그래서 `inspection`이 아니라 `geo` 도메인에 둔다.
- 후보 표시: `roadAddress`가 `null`이면 `jibunAddress`로 대신한다. 보낼 때 `roadAddress`도 같은 값을 쓴다.
- 테스트(msw): 검색 정상 · 400 · 503, 수정 PUT 본문에 `location`이 **항상** 실리는지(유지 · 새로 고름 · 지움), §4.1 · §4.2의 실패 흐름.

**FC4b — 지도**

| 파일 | 변경 |
|---|---|
| `src/lib/env/env.ts` | `VITE_KAKAO_MAP_JS_KEY` **선택** 값. 없으면 지도 대신 "위치 목록"만 보인다(로컬 · 테스트에서 지도 없이 동작) |
| `src/domains/geo/map/kakao-loader.ts` | `dapi.kakao.com/v2/maps/sdk.js?appkey=…&autoload=false`를 한 번만 넣고 `kakao.maps.load`를 Promise로 감싼다 |
| `src/domains/geo/map/kakao-maps.d.ts` | 쓰는 API만 직접 선언(Map, LatLng, LatLngBounds, CustomOverlay, Polyline). **새 의존성 없음**(FD4) |
| `src/domains/geo/map/RouteMap.tsx` | 입력: `stops`(번호 · 좌표), `segments`(직선 또는 경로 폴리라인), 선택 `origin`(현재 위치). 번호 마커는 `CustomOverlay`로 "2·3" 표시. 하단 출처 "주소·좌표: 행정안전부" |
| `src/domains/geo/utils/route-geometry.ts` | 순수 함수: `haversine`, `estimateWalk(직선 × 1.3 ÷ 4.5km/h)`, `buildStops(properties)`(위치 없는 매물 제외, **연속한** 같은 `bdMgtSn` 병합 — BE 규칙과 동일) + 테스트 |
| `RegisterStepProperties.tsx` | 지도 + 목록. 재정렬 제거(G3), 위/아래 버튼(두 건만 전송) · 낙관적 업데이트(G4), "위치 미지정" 표시 |
| `VisitPanel.tsx` / `PropertyGroupList.tsx` | 지역 상세의 회차에 지도(접기 가능). **연속한 같은 단지만 묶기**(G2, FD1) |
| 매물 상세 | 주소 한 줄만 표시. 지도는 넣지 않는다(범위 밖) |

- 순서는 항상 **응답 배열 순서**다(04 §6.2). 목록 번호와 마커 번호는 같은 `buildStops` 결과에서 만든다.
- 카카오 로고와 저작권 표기를 가리지 않는다(02 문서).

### FC5 `feat: 도보 경로 보기`

| 파일 | 변경 |
|---|---|
| `geo-api.ts`, `geo-schemas.ts` | `POST /inspection-visits/{visitId}/walking-route`, `walkingRouteSchema` |
| `hooks/useWalkingRoute.ts` | `useMutation`(버튼을 눌렀을 때만 호출). 결과는 `visitId` + 매물 순서 키로 **화면 세션 메모리에만** 둔다. 순서가 바뀌면 버린다 |
| `RouteMap.tsx` | `legs[].path`의 `[경도, 위도]`를 `new kakao.maps.LatLng(p[1], p[0])`로 뒤집어 폴리라인. 전체 거리 · 시간 표시 |
| 구간 처리(`159c6f7`) | **`legs.length === stops.length - 1`을 가정하지 않는다.** 한 구간이 여러 지점에 걸칠 수 있다(`toStopIndex - fromStopIndex > 1`). `path`를 그대로 그린다. `path`가 비어 있으면 **그 구간의 지점들을 직선으로** 잇는다 |
| 오류 | `429` "오늘 경로 조회 한도를 넘었습니다", `502` "잠시 후 다시 시도해 주세요", `503` 버튼 비활성. 모두 **직선 표시 유지**. `stops: []`는 오류가 아니다 |
| 안내 | 지난 임장: "화면 순서대로 걸었을 때의 현재 기준 추천 경로예요" |

- 테스트: 좌표 순서 뒤집기(경도·위도), 여러 지점에 걸친 구간, 빈 `path`의 직선 대체, 오류별 직선 유지, 순서 변경 시 캐시 폐기.

### FC6 `feat: 현재 위치 기준 추천 순서 정렬`

| 파일 | 변경 |
|---|---|
| `src/domains/inspection/utils/route-order.ts` | 순수 함수(04 §6.4): 지점 ≤ 8 전수 탐색, 9~13 Held-Karp, 14 이상 최근접 이웃 + 2-opt. 같은 좌표는 한 지점, 위치 없는 매물은 맨 뒤. 동률이면 현재 순서에 가까운 쪽. "출발지로 돌아오기" 옵션 |
| `__tests__/route-order.test.ts` | 작은 입력을 전수 탐색 결과와 대조, 결정성(두 번 돌려 같은 결과), 위치 없는 매물 위치, 돌아오기 옵션 |
| `geo-api.ts` | `POST /geo/current-location` |
| `RecommendOrderPanel.tsx` (신규) | 현재 위치 입력(`AddressSearchField` 재사용) → 미리보기(지도: 현재 위치 → 1 구간은 **직선**, D13) → 총거리 비교 "3.4km → 2.1km" → [적용] `PUT /properties/order` → [되돌리기] 직전 순서로 같은 API |
| 오류 | `ADDRESS_COORDINATE_NOT_FOUND` → "이 주소는 좌표가 없어요. 가까운 다른 건물을 골라 주세요"(위치 없이 진행할 수 없으므로 다시 고르게 한다). `502`/`503`은 §4.3 |
| 표시 조건 | 계획 · 수정 중 임장에서만. **완료 임장에서는 숨긴다** |

- 현재 위치 좌표는 컴포넌트 상태에만 둔다. react-query 캐시, 저장소, URL에 넣지 않는다(04 §4).

## 4. 위치 저장 실패 처리 (G7 · G8 보완)

BE는 위치 조회가 실패하면 요청 전체를 거절한다(D9). 이 규칙은 그대로 두고 FE가 복구한다.
BE 제안(**위치 오류면 위치를 되돌려 같은 요청을 한 번 더 보낸다**)을 기본 규칙으로 삼고, FE 설계(주소를 고르면 즉시 저장, 저장 중 자동 저장 멈춤)를 그 앞에 둔다.

### 4.1 매물 수정 화면

| 단계 | 내용 |
|---|---|
| ① 주소를 고르면 즉시 저장 | 폼의 `location`을 새 값(`coordKey` 포함)으로 바꾸고 **바로 저장(flush)** 한다. 2초 자동 저장을 기다리지 않으므로 주소 저장 결과를 고른 자리에서 알려 줄 수 있다 |
| ② 저장 중 자동 저장 멈춤 | ①이 끝날 때까지 자동 저장을 보내지 않는다. 같은 새 주소로 행안부를 두 번 부르거나, 응답 순서가 뒤바뀌어 위치가 덮이는 일을 막는다 |
| ③ 위치 오류면 되돌리고 다시 보냄 (BE 제안) | §4.3의 "위치 문제"를 받으면 ⓐ 폼의 `location`을 `confirmedLocation`(서버가 마지막으로 돌려준 `{ bdMgtSn, roadAddress }`)으로 되돌린다 ⓑ **같은 PUT을 한 번 더** 보낸다. `bdMgtSn`이 저장된 값과 같으므로 외부 호출이 없고, 함께 실린 메모 등은 저장된다 ⓒ "주소는 저장하지 못했습니다" + 사유를 주소 칸 아래에 보인다 |
| ④ 다시 보내기는 한 번만 | ⓑ도 실패하면 위치와 무관한 저장 오류이므로 기존 저장 오류 안내를 따른다 |
| ⑤ 성공하면 확정 | 응답의 `location`으로 `confirmedLocation`을 바꾼다 |

- ③은 **어느 PUT이든** 적용한다. 즉시 저장(①)이든 자동 저장이든 `save()` 한 곳에서 처리하므로, 새 주소가 다른 입력과 같은 요청에 실려도 메모가 사라지지 않는다.
- 위치 지우기는 `location: null`로 즉시 저장한다. 외부 호출이 없어 위치 오류가 나지 않는다.
- `503 ADDRESS_LOOKUP_UNAVAILABLE`이면 ③ 뒤에 주소 칸을 비활성으로 바꾼다(그 화면 세션 동안).
- `400 ADDRESS_COORDINATE_NOT_FOUND`이면 안내에 "가까운 다른 건물을 고르거나 위치 없이 두세요"를 붙인다.
- 선행 수정(G10): `useAutosave`는 보내기 **전에** 그 값을 "저장됨"으로 표시한다. 저장이 실패해도 같은 값은 다시 보내지 않는다(다음 입력이 있어야 다시 보낸다). ③의 다시 보내기와 별개로, 실패하면 "저장 안 됨"으로 되돌리는 처리를 FC4a에 넣는다.

### 4.2 매물 추가 폼 — "위치 없이 등록할까요?"

- 추가 폼은 단지명 · 동·호수 · 주소 세 칸뿐이라 POST를 한 번에 보낸다.
- 위치 오류(§4.3의 "위치 문제")로 실패하면 **입력값을 그대로 두고** "주소를 저장하지 못했습니다. 위치 없이 등록할까요?"와 사유를 보인다.
  - **[위치 없이 등록]** → `location: null`로 다시 POST한다.
  - **[다른 주소 고르기]** → 주소 칸으로 돌아간다.
- 등록은 자동으로 다시 보내지 않고 사용자에게 묻는다. 수정과 달리 매물이 아직 없으므로, 묻지 않고 위치 없이 만들면 사용자가 고른 주소가 조용히 사라진다.
- 위치는 나중에 매물 수정 화면에서 다시 넣을 수 있다고 안내한다.

### 4.3 오류 분류 (`location-error.ts`)

| 응답 | 분류 | 안내 | 위치 없이 진행 |
|---|---|---|---|
| `400 ADDRESS_COORDINATE_NOT_FOUND` | 위치 문제 | `title` 그대로("좌표 정보가 없는 주소") | 제공 |
| `502 ADDRESS_LOOKUP_FAILED` | 위치 문제 | "주소 확인에 실패했어요. 잠시 후 다시 시도해 주세요" | 제공 |
| `503 ADDRESS_LOOKUP_UNAVAILABLE` | 기능 꺼짐 | "지금은 주소를 쓸 수 없어요". 주소 필드 비활성 | 제공 |
| `400 VALIDATION_FAILED` (`location` 위반) | 위치 문제 | `title` 그대로. 검색 결과를 그대로 보내면 생기지 않는다(`bdMgtSn` 26자, `roadAddress` 300자) | 제공 |
| `400 INVALID_ADDRESS_KEYWORD` | 검색어 문제 | `title`을 검색창 아래에 | — |
| 그 밖 | 일반 저장 오류 | 기존 처리 | — |

## 5. 의존 관계와 진행 순서

```text
FC0 ─ FC1 ─ FC2 ─ FC3
              └─ FC4a ─ FC4b ─ FC5
                             └─ FC6
```

- FC1~FC3은 BE 키와 무관하게 로컬 BE로 바로 확인할 수 있다.
- FC4a 이후는 **msw로 개발**한다. 로컬 BE는 키가 없으면 `503`이라 실제 화면 확인은 키가 붙은 뒤에 한다.
- FC6의 `route-order.ts`는 의존이 없으므로 FC4와 **동시에** 진행할 수 있다.

## 6. 결정 기록

| # | 질문 | 확정 | 근거 |
|---|---|---|---|
| FD1 | 지역 상세 매물을 "연속한 같은 단지"로만 묶는가(G2) | **예** | 지도 번호와 목록이 같은 순서여야 D6이 성립한다. BE도 연속한 같은 좌표만 합친다 |
| FD2 | 계획 임장에서 매물 "작성 중" 배지를 숨기는가(G5) | **예.** 수정 중 임장에서만 보인다 | 계획 단계 매물은 비어 있는 것이 정상이다 |
| FD3 | 등록 마법사에서 결과 항목을 숨기는가 | **숨긴다.** 마법사는 계획 수립 전용, 결과와 완료는 임장 수정 화면 | 등록 단계 입력을 가볍게 해서 위치 실패(G7 · G8)로 잃을 것을 줄인다. D5(계획 → 완료)와도 맞는다 |
| FD4 | 카카오 지도를 직접 감싸는가 | **예** | 쓰는 기능이 마커 · 오버레이 · 폴리라인 · 범위 맞춤뿐이다. 의존성 0 |

## 7. 검증 계획

| 항목 | 방법 | 막히는 조건 |
|---|---|---|
| 스키마 · 매퍼 · 순수 함수 | Vitest | — |
| 화면 동작(주소 검색 · 저장 본문 · §4 실패 흐름) | Vitest + msw | — |
| 지도 렌더링 | jsdom에서 카카오 SDK를 불러올 수 없으므로 `RouteMap`은 테스트에서 가짜로 바꾼다. 실제 확인은 Playwright | 카카오 JS 키 + 콘솔에 `localhost:5173`과 운영 도메인 등록 |
| 실제 주소 검색 · 위치 저장 | 로컬 BE에 `SLCN_JUSO_SEARCH_KEY`, `SLCN_JUSO_COORD_KEY` 설정 후 Playwright | 행안부 좌표 키 승인 |
| 도보 경로 | 로컬 BE에 `SLCN_KAKAO_REST_KEY` 설정 후 확인 | 카카오 앱 활성화 |
| 디자인 | 지도 · 주소 검색 · 추천 정렬은 프로토타입에 없는 화면이다. 기존 토큰과 컴포넌트로 만들고 캡처로 검토한다 | — |

## 8. 남은 외부 일정

- 행안부 좌표제공 API 승인(신청 완료, 대기 중) → FC4a 실제 확인
- 카카오 앱: JS 키 도메인 등록, 도보 경로 API 활성화, **유료 사용은 켜지 않는다**(04 §6.5)
- 배포 날 BE SQL 선행(04 §10.4) — FE 작업은 없지만 FC1이 같은 배포에 들어갔는지 확인한다
