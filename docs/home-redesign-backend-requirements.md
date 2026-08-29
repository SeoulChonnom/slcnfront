# 홈 `Memory Chronicle` 백엔드 후속 요구사항

작성일: 2026-08-25  
대상: 인증된 `/main`·`/mobile` 홈 허브  
근거: `docs/api_spec.json`, 현재 홈 구현, `.impeccable/surfaces/src-pages-shared-homehubpage-tsx.md`, Task 1–2 구현 리포트

## 결정 요약

현재 승인된 홈 디자인을 막는 필수 백엔드 변경은 없다. 이 서비스의 주 사용자는 두 명이고, 저장소에는 현재 여행 기록 수·응답 크기·지연시간을 뒷받침하는 측정값이 없다. 따라서 서버 검색이나 페이지네이션을 지금 도입해야 한다고 결론 내리지 않는다.

현재 프론트엔드는 다음 fallback으로 디자인 요구를 충족한다.

- `GET /travels`의 전체 목록을 최신순으로 정렬하고, 목록 응답에 존재하는 `title`, `region`, `oneLineReview`를 브라우저에서 검색한다.
- 연도 목록도 로드된 여행에서 파생하며, 검색 결과와 연도 필터를 함께 적용한다.
- 최신 여행 표지와 현재 필터 결과의 최대 12개 표지를 `/assets/files/{fileId}`에서 Blob으로 받아 표시한다. 표지 `<img>`에는 브라우저의 `fetchPriority="high"` 힌트를 주고, asset hook은 필요한 파일 요청을 동시에 시작하며, 행 썸네일은 지연 로드한다.
- 여행·일정·나들이를 독립 쿼리로 읽고 소스별 loading/error/retry를 표시한다. 하나가 실패해도 다른 소스를 계속 보여 주며, 세 소스가 모두 실패할 때만 전체 오류가 된다.

그러므로 아래 P1/P2 항목은 현재 릴리스의 차단 조건이 아니라, 관측된 규모·지연 또는 새 제품 요구가 생겼을 때 실행할 후속 작업이다.

## 현재 계약과 영향 범위

| 계약 | 현재 응답 | 홈에서의 사용 | 현재 판단 |
| --- | --- | --- | --- |
| `GET /travels` | `TravelRdo[]`; `id`, `travelId`, `title`, `region`, `startDate`, `endDate`, `cover`, `oneLineReview`, `nights`, `days`, `tags` | 여행 연대기, 최신 기록, 연도·텍스트 검색 | 승인된 검색 범위에 충분함. 페이지 경계가 없음 |
| `GET /assets/files/{fileId}` | 이미지 바이트(`Blob`) | 표지 사진을 파일 ID별로 조회 | 동작하지만 변형 크기·캐시 메타데이터 계약은 없음 |
| `GET /trips` | `TripListRdo[]`; `id`, `date`, `type`, `name`, `logo` | 나들이를 여행 연대기와 분리하고 개수/이동 링크 표시 | 여행 검색·페이지네이션과 합치지 않음 |
| `GET /schedule/now` | `ScheduleRdo[]` (API 설명상 이번 달 일정) | 응답에서 현재 시각 이후 가장 가까운 최대 3개 선택 | 보조 영역으로 충분함. 다음 일정의 월 경계 보장은 별도 제품 결정 |

API 명세에 있는 `TravelRdo.cover`/`FileBoxItemRdo.fileAssetId`가 현재 표지 식별자이고, 프론트 mapper도 이 ID를 사용한다. `path`를 공개 URL로 바꾸거나 여행·나들이를 하나의 백엔드 모델로 합치는 것은 이번 범위가 아니다.

### 인증 및 데이터 스코프 원칙

아래에서 제안하는 `/travels/search`와 `/schedule/next`는 기존 보호 endpoint와 동일한 비공개 접근 제어를 전제로 한다. 클라이언트는 현재와 같이 `X-AUTH-TOKEN: <access-token>` 헤더를 보낸다. 서버는 토큰을 검증하고 기존 `/travels`·`/schedule/now`에 적용하는 동일한 로그인 사용자/커플 권한 스코프로만 결과를 반환해야 하며, 토큰이 없거나 유효하지 않으면 기존과 같은 인증 오류를 반환한다. 공개 endpoint, 새로운 public key, 공개 이미지 URL을 만들자는 제안이 아니다.

## 필수: 현재는 백엔드 변경 없음

### R0. 기존 계약 보존

- **현재 제한:** 여행 목록은 전체 배열이고 이미지에는 전용 썸네일 URL이 없으며, 세 홈 소스에 통합 응답도 없다.
- **사용자/디자인 영향:** 현재 확인된 제품 범위와 승인된 Memory Chronicle 구성에서 제한이 최신순 탐색, 연도 이동, 표지 인식, 독립 오류 상태를 막지 않는다. 서버 검색을 추가하지 않아도 현재 검색이 동작한다.
- **제안:** 이번 릴리스에서는 `GET /travels`, `GET /trips`, `GET /schedule/now`, `GET /assets/files/{fileId}`의 경로와 성공 응답 형태를 유지한다. 신규 필드나 envelope를 필수로 요구하지 않는다.
- **우선순위:** P0 릴리스 기준선(변경 작업 없음).
- **호환성/이행:** 기존 클라이언트와 API 명세를 그대로 호환한다. 별도 마이그레이션·백필·feature flag가 필요 없다.
- **출하된 프론트 fallback:** `useHomeTimeline`의 독립 쿼리와 `filterTravelRecords`가 최신순·연도·제목/지역/한 줄 기록 검색을 수행한다. 표지가 없으면 완전한 텍스트 기록을 남기고, 일정/나들이 실패는 해당 섹션만 재시도한다.

## 권장: 규모 또는 성능 임계치가 확인될 때

### R1. 여행 목록의 커서 페이지네이션과 서버 검색

- **현재 제한:** `GET /travels`는 모든 여행의 목록 메타데이터를 한 번에 반환하고, 현재 홈은 모든 항목을 메모리에 올려 필터링한다. 페이지 번호·커서·전체 연도 메타데이터가 없다.
- **사용자/디자인 영향:** 지금은 구현을 단순하게 유지하지만 기록이 많아지면 첫 진입의 전송량·파싱 시간·DOM 수가 늘고, 연도 rail에 표시할 전체 연도를 알 수 없게 된다. 검색 결과가 현재 로드된 페이지에만 한정되는 것도 문제가 된다.
- **실행 임계치:** 아래 중 하나라도 7일 관측에서 먼저 충족될 때 P1로 착수한다. 현재 저장소에는 이 조건을 충족한다는 증거가 없다.
  - 여행 기록 200개 초과
  - `GET /travels` 응답 본문 1 MiB 초과
  - 인증된 홈 진입 시 해당 요청 p95 500 ms 초과
  - 제품 요구가 “전체 기록을 한 번에 로드”가 아닌 명시적 더 보기/무한 스크롤로 바뀜
- **제안 endpoint/query:** 기존 배열 계약을 깨지 않도록 새 endpoint를 추가한다.
  ```http
  GET /travels/search?q={urlencoded-text}&year=YYYY&limit=50&cursor={opaque}
  ```
  `q`는 생략 가능하며 공백 trim 후 대소문자 비구분 부분 문자열로 `title`, `region`, `oneLineReview`에만 적용한다. `year`는 `startDate`의 네 자리 연도, `limit` 기본 50·최대 100, `cursor`는 첫 페이지에서 생략하는 불투명 커서다. 정렬은 출하된 클라이언트와 맞춰 `startDate DESC, id ASC`로 고정하여 커서 간 중복·누락을 방지한다.
- **인증/스코프:** 이 endpoint도 기존 보호 endpoint와 동일하게 `X-AUTH-TOKEN: <access-token>`을 요구하고, 토큰이 허용하는 로그인 사용자/커플 스코프의 여행만 반환한다. 인증된 기존 `/travels` 호출과 다른 공개 접근 경로를 만들지 않는다.
- **제안 response:** 항목의 내부 모양은 기존 `TravelRdo`와 동일하게 유지하고, 전역 연도와 페이지 정보를 envelope에 둔다.
  아래 예시의 `meta.total: 183`은 현재 데이터 수가 아니라 response 형식을 설명하기 위한 예시 값이다.

  ```json
  {
    "items": [
      {
        "id": "...",
        "travelId": "...",
        "title": "...",
        "region": "...",
        "startDate": "2025-06-01",
        "endDate": "2025-06-03",
        "cover": null,
        "oneLineReview": "...",
        "nights": 2,
        "days": 3,
        "tags": []
      }
    ],
    "meta": {
      "limit": 50,
      "nextCursor": "...",
      "hasNext": true,
      "total": 183,
      "availableYears": ["2025", "2024"]
    }
  }
  ```
  `nextCursor`는 마지막 페이지에서 `null`이어야 한다. `total`을 계산하기 어려우면 초기 도입에서는 생략할 수 있지만 `hasNext`, `nextCursor`, `availableYears`는 페이지 연속 탐색과 연도 rail에 필요하다.
- **우선순위:** P1 조건부. 임계치 전에는 구현하지 않는다.
- **호환성/이행:** 기존 `GET /travels`의 배열 응답은 유지한다. 새 endpoint를 feature flag 또는 capability 확인 뒤 선택하고, 서버 검색이 불가능하면 기존 endpoint로 되돌린다. envelope로 기존 `/travels` 응답을 바꾸는 방식은 현재 파서와 다른 클라이언트를 깨뜨리므로 피한다.
- **출하된 프론트 fallback:** 현재는 `/travels` 전체 목록에서 같은 세 필드만 검색하고 연도도 전체 로드 데이터에서 만든다. 검색어·연도 결과가 없으면 초기화 UI를 제공하고, 목록 항목은 여행 상세로 한 번에 이동한다.

### R2. 표지 이미지 변형과 HTTP 캐시

- **현재 제한:** 홈은 표지 파일 ID마다 `/assets/files/{fileId}`를 Blob으로 요청한다. 최신 표지 1개와 필터 결과 앞쪽 최대 12개가 동시에 요청될 수 있으며, 현재 계약에는 요청 크기 변형, 썸네일 URL, `ETag`/캐시 정책, 이미지 차원 메타데이터가 정의되어 있지 않다. 필터를 바꿀 때 object URL이 정리되고 새 파일을 다시 받을 수 있다.
- **사용자/디자인 영향:** 저대역폭 환경에서는 큰 파일을 작은 행 썸네일에 내려받는 비용이 커질 수 있고, 표지 인식의 첫 화면이 늦어질 수 있다. 다만 현재 구현은 요청 수를 최대 13개로 제한하고, 실패한 개별 이미지 때문에 여행 기록 전체를 실패시키지 않으므로 현재 릴리스의 기능 차단은 아니다.
- **제안 endpoint/query:** 기존 파일 endpoint를 유지하면서 query로 변형을 협상한다.
  ```http
  GET /assets/files/{fileId}?variant=home-feature&width=960&format=webp
  GET /assets/files/{fileId}?variant=home-thumb&width=320&format=webp
  ```
  응답 본문은 JSON envelope가 아닌 이미지 바이트로 유지한다. 서버는 실제 형식에 맞는 `Content-Type`과 `Content-Length`, 재검증 가능한 `ETag`, 인증된 브라우저 캐시에 적합한 `Cache-Control: private, max-age=86400`를 반환한다. 파일 ID가 불변이라는 운영 보장이 확인된 경우에만 `immutable`을 추가한다.
- **우선순위:** P1 조건부 성능 개선. 이미지 다운로드 p95/평균 바이트를 계측한 뒤 착수한다.
- **호환성/이행:** query가 없는 기존 요청은 기존 이미지 바이트를 반환한다. 변형 query를 지원하지 않는 서버에서는 클라이언트가 400/404를 받은 뒤 기존 파일 endpoint로 재시도할 수 있어야 한다. 변형 요청도 기존과 동일한 `X-AUTH-TOKEN` 인증 및 사용자/커플 권한 스코프를 유지하며 공개 공유 URL을 만들지 않는다.
- **출하된 프론트 fallback:** 최신 표지는 `fetchPriority="high"`와 비동기 decode, archive 표지는 `loading="lazy"`를 사용한다. 현재 hook은 ID 중복을 제거하고 최대 12개 archive 표지만 요청하며, 다운로드 실패나 표지 없음은 텍스트 fallback으로 남긴다.

## 선택: 부분 소스 상태와 오류 관측성

### O1. 공통 오류 envelope (부분 실패 UX를 위한 선택 사항)

- **현재 제한:** API 명세에는 성공 응답이 중심이고 `/travels`, `/trips`, `/schedule/now`, 파일 조회의 공통 오류 body가 정의되어 있지 않다. 현재 API client는 JSON의 `message`가 있으면 읽고, 없으면 HTTP 상태/본문으로 오류를 만든다.
- **사용자/디자인 영향:** 홈의 부분 실패 판정에는 오류 body가 필요하지 않다. 세 요청이 독립적이므로 여행이 성공하고 일정만 실패하는 상태를 이미 표현할 수 있으며, 현재 화면의 한국어 문구와 재시도 버튼도 유지된다. 따라서 오류 envelope는 사용자 기능의 필수 조건이 아니다.
- **제안 response:** 운영에서 원인 추적·재시도 가능성을 구분해야 할 때만 모든 해당 endpoint의 4xx/5xx에 다음 additive body를 표준화한다.
  ```json
  {
    "code": "SCHEDULE_UNAVAILABLE",
    "message": "Schedule service is temporarily unavailable.",
    "retryable": true,
    "requestId": "req_..."
  }
  ```
  HTTP status는 의미에 맞게 유지하고, 기존 client가 읽는 `message`를 반드시 보존한다. `requestId`는 로그 상관관계용이며 화면에 노출할 필요가 없다.
- **우선순위:** P2 선택 사항. 실제 장애 분석 요구나 재시도 정책 차등화가 생길 때만 도입한다.
- **호환성/이행:** 기존 상태 코드와 `message`를 유지하는 additive 변경이므로 기존 클라이언트와 호환된다. body가 없는 기존 오류도 계속 처리할 수 있어야 한다.
- **출하된 프론트 fallback:** `useHomeTimeline`은 `travels`, `schedules`, `dayOuts`를 각각 `loading/ready/error`로 보관하고 source retry를 제공한다. 전부 실패한 경우에만 전체 재시도, 일부 실패면 성공한 영역을 보존한다.

## 일정·나들이 계약에 대한 범위 확인

`GET /trips`는 나들이 전용 목록이고 홈에서는 여행 연대기와 섞지 않는다. 현재 표시가 개수와 별도 이동 링크뿐이므로 검색 필드나 페이지 메타를 추가할 근거가 없다.

`GET /schedule/now`의 API 설명은 이번 달 일정 조회이며, 프론트는 그 응답에서 현재 시각 이후 최대 3개를 고른다. “다음 일정”을 월 경계를 넘어 반드시 보장해야 한다는 제품 요구나 실제 누락 사례가 확인되기 전에는 새 endpoint를 만들지 않는다. 다음은 그 제품 결정이 내려진 경우에만 검토할 조건부 항목이다.

### O2. 월 경계를 넘는 다음 일정 endpoint (제품 결정 후 조건부)

- **현재 제한:** 현재 계약은 이번 달 배열만 정의하므로 다음 달 이후 일정까지 반환한다는 보장이 없다.
- **사용자/디자인 영향:** 월말에 다음 달 일정만 남은 경우 홈의 보조 영역이 비어 보일 수 있다. 현재 승인된 디자인은 일정 영역을 보조 정보로 두며, 실제 누락 사례나 “항상 다음 일정” 요구는 아직 확인되지 않았다.
- **제안 endpoint/query:** 제품 요구가 확정될 때만 다음 endpoint를 추가한다.

```http
GET /schedule/next?from={urlencoded-ISO-8601}&limit=3
```

- **인증/스코프:** 기존과 동일하게 `X-AUTH-TOKEN: <access-token>`을 요구하고, 토큰이 허용하는 동일한 로그인 사용자/커플 권한 스코프의 일정만 반환한다. 공개 endpoint나 새로운 인증 메커니즘은 만들지 않는다.
- **응답:** 기존 `ScheduleRdo[]`를 유지하고 `from` 이후 일정만 시작 시각 오름차순으로 최대 `limit`개 반환한다.
- **우선순위:** P1 조건부. 제품 요구와 실제 월 경계 누락이 확인될 때만 착수하며, 현재 릴리스의 필수 변경이 아니다.
- **호환성/이행:** 기존 `GET /schedule/now`는 그대로 둔 채 additive endpoint로 도입한다. 새 endpoint를 사용할 수 없거나 인증/요청이 실패하면 기존 `/schedule/now` 결과를 사용하고, 결과가 없으면 현재 빈 상태 문구를 유지한다. 기존 일정 경로·권한을 변경하지 않는다.
- **출하된 프론트 fallback:** `useHomeTimeline`은 `/schedule/now` 결과에서 현재 시각 이후 최대 3개를 선택하고, 실패 시 일정 섹션만 재시도하며, 일정이 없으면 달력으로 이동하는 빈 상태를 표시한다.

## 이행 순서와 비범위

1. 먼저 `/travels` 개수, 응답 바이트, 홈 진입 p95, 표지 바이트/p95를 계측한다. 현재 수치가 없으므로 이 문서의 임계치는 관측 후 조정할 수 있는 운영 가드레일이다.
2. R1 임계치가 먼저 발생하면 `/travels/search`를 additive로 도입하고 `availableYears`를 포함한다. R2는 이미지 계측에서 병목이 확인될 때 독립적으로 도입한다.
3. 오류 envelope는 운영 추적 필요가 있을 때만 O1로 진행한다. 프론트는 각 단계에서 기존 endpoint fallback을 유지한다.

이번 문서에는 여행·나들이 통합 endpoint, 공개 이미지 URL, 외부 공유/내보내기, 상세 페이지 계약 변경, 서버 검색을 현재 릴리스의 필수 조건으로 포함하지 않는다.
