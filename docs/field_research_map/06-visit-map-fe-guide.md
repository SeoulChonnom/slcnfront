# 선택 회차 방문 순서 지도 FE 연동 가이드

> 작성일: 2026-11-15
> 적용 화면: `/main/inspection/{areaId}`, `/mobile/inspection/{areaId}`의 기존 선택 회차 패널
> 기준: `feature/myseoulhouse`, `12c6438a8f5dcc7530484beb17a7d4b53f9e108c`
> 운영 상태: 현재 BE 구현의 운영 배포와 서버 API 키 적용 완료. 운영 담당자 확인을 기준으로 한다.

주소 검색, 매물 위치 저장·조회, 방문 순서 저장, 도보 경로 조회 API가 이미 있다. FE는 기존 임장 상세의 `selectedVisit.properties`로 번호 마커와 직선을 먼저 구현하고, 사용자가 버튼을 누를 때만 기존 도보 경로 API를 호출하면 된다. 새 화면 경로나 신규 BE API는 필요하지 않다.

**가장 먼저 매물 수정 요청에 `location`을 항상 포함해야 한다. 현재 운영 BE는 PUT에서 `location`을 생략하면 저장된 위치를 지운다.** “생략 시 유지”, 선택 토큰, 서버 revision은 현재 API가 제공하지 않는다.

현재 HTTP 계약은 [임장 API 명세](../field_research/api.md) §4·§8-2~8-4를 따른다. 이 문서는 해당 계약을 이번 두 화면에 적용하는 FE 작업 기준이다. 이전 [FE 전달 문서](./05-fe-handoff.md)의 기본 추정 시간·빈 도보 경로 직선 대체·현재 위치 추천 정렬은 이번 작업에 포함하지 않는다.

## 1. 작업 범위와 우선순위

| 단계 | FE 작업 | BE 제공 상태 |
| --- | --- | --- |
| 수정 호환성 | 모든 매물 기본 정보 PUT에서 위치 유지·변경·해제 구분 | 생략·null 모두 해제하는 현 계약에 맞춰야 함 |
| 1차 방문 순서 지도 | 주소 선택 UI, 번호 마커, 방문 순서 직선, 목록 연결 | 주소 검색·좌표 확정·위치 저장·조회·순서 저장 제공 |
| 2차 도보 경로 | 명시적 조회 버튼, 실제 경로선·거리·시간, 응답 폐기·중복 호출 억제 | 기존 도보 경로 POST 제공 |

카카오 JavaScript 키는 FE에 이미 설정되어 있다. FE는 SDK 로딩과 개발·운영 도메인 허용을 확인한다. 서버 키를 FE 환경변수나 번들로 옮기지 않는다. 현재 위치·GPS·위치 권한·추천 순서 정렬·실제 이동 기록은 이번 범위에서 제외한다.

## 2. API와 공통 규칙

아래 경로는 FE API 클라이언트에 전달할 상대 경로다. 배포 공통 base path는 기존 설정을 그대로 사용한다. BE context path는 `/api`이므로 공통 base에 포함되어 있으면 경로에 중복해서 붙이지 않는다.

| 용도 | 메서드·경로 | 성공 응답 |
| --- | --- | --- |
| 지역·선택 회차 | `GET /inspection-areas/{areaId}?visitId={visitId}&includeProperties=true` | 200 지역 상세 |
| 회차 상세 | `GET /inspection-visits/{visitId}` | 200 회차 상세 |
| 매물 단독 상세 | `GET /inspection-properties/{propertyId}` | 200 매물 상세 |
| 회차 내 매물 상세 | `GET /inspection-visits/{visitId}/properties/{propertyId}` | 200 매물 상세 |
| 매물 생성 | `POST /inspection-visits/{visitId}/properties` | 200 매물 상세 |
| 매물 수정 | `PUT /inspection-visits/{visitId}/properties/{propertyId}` | 200 매물 상세 |
| 방문 순서 저장 | `PUT /inspection-visits/{visitId}/properties/order` | 204 본문 없음 |
| 주소 검색 | `GET /geo/addresses?keyword={keyword}&page=1&size=10` | 200 검색 결과 |
| 선택 주소 좌표 미리보기, 선택 사용 | `POST /geo/current-location` | 200 위경도 |
| 도보 경로 조회 | `POST /inspection-visits/{visitId}/walking-route` | 200 경로, 요청 본문 없음 |

성공 응답에 `data` 같은 공통 envelope는 없다. 기존 인증 헤더를 사용하며 `USER` 권한이 필요하다. 서비스는 두 사용자의 공유 데이터 모델이다. 지역 조회에서는 회차의 지역 소속을, 회차 내 매물 조회·수정에서는 매물의 회차 소속을 검증한다.

아래 JSON의 ID·주소·좌표·거리는 구조 설명용 예시이며 실제 검색 결과가 아니다.

## 3. 조회 타입과 지도 데이터 선택

### 3.1 응답 타입

```ts
type PropertyLocation = {
  bdMgtSn: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
};

type PropertyMapFields = {
  propertyId: string;
  inspectionVisitId: string;
  complexName: string;
  name: string | null;
  sortOrder: number;
  location: PropertyLocation | null;
};
```

건물관리번호의 wire 필드 이름은 **`bdMgtSn`**이다. FE 내부에서 `buildingManagementNo`로 매핑할 수 있지만 API에는 `bdMgtSn`으로 보낸다. `name`과 `roadAddress`는 nullable이다. 기존 매물 상세·목록 파서의 `name: string`도 함께 확인한다.

위치는 선택 회차의 `properties[]`, 회차 상세의 `properties[]`, 두 경로의 매물 상세에 같은 형태로 반환된다. 위치가 없으면 `location: null`이다. 주소만 저장되고 좌표가 없는 별도 상태는 제공하지 않는다.

좌표는 행안부 건물 출입구 좌표를 BE가 WGS84(`EPSG:4326`)로 변환한 값이다. `latitude`·`longitude`는 도 단위 double이며 소수 자릿수는 고정하지 않는다. 원본 투영좌표는 FE에 반환하지 않는다.

### 3.2 회차를 섞지 않는 조회

```http
GET /inspection-areas/a1?visitId=v1&includeProperties=true
```

지도에는 **`selectedVisit.inspectionVisitId`와 `selectedVisit.properties`만** 사용한다. 지역 전체 매물 목록이나 다른 회차의 매물을 합치지 않는다.

- `includeProperties` 기본값은 `true`다. `false`면 `selectedVisit` 전체가 `null`이며, 이후 회차 상세 API로 불러온다.
- `visitId`를 생략하면 서버가 기본 회차를 선택한다. 회차 목록의 첫 행을 선택했다고 가정하지 않는다.
- `selectedVisit`이 `null`이면 회차 미선택·없음 상태로 처리하고 이전 회차의 지도·경로를 비운다.
- 요청한 지역에 속하지 않는 `visitId`는 `400 INSPECTION_VISIT_NOT_FOUND`다.

## 4. 주소 검색과 위치 저장

### 4.1 주소 검색

```http
GET /geo/addresses?keyword=예시로%201&page=1&size=10
```

```json
{
  "totalCount": 1,
  "items": [
    {
      "roadAddress": "서울특별시 예시로 1",
      "jibunAddress": "서울특별시 예시동 1",
      "buildingName": "예시 아파트",
      "bdMgtSn": "1111010100100010000000001",
      "zipNo": "03000",
      "coordKey": {
        "admCd": "1111010100",
        "rnMgtSn": "111103100001",
        "udrtYn": "0",
        "buldMnnm": "1",
        "buldSlno": "0"
      }
    }
  ]
}
```

`keyword`는 trim 후 필수, `page`는 1 이상(기본 1), `size`는 1~20(기본 10)이다. 응답에는 `totalCount`와 `items`만 있고 `hasNext`는 없다. 다음 페이지 여부는 `page * size < totalCount`로 계산한다. 공급자가 거절한 검색어는 `INVALID_ADDRESS_KEYWORD`와 `title`로 안내한다.

검색 결과의 `roadAddress`, `jibunAddress`, `buildingName`, `zipNo`는 null을 허용한다. 주소·건물명 검색이며 장소·역 이름 검색은 보장하지 않는다. 검색은 제출 시 호출하거나 debounce를 적용하고 자동 재시도하지 않는다.

```ts
type CoordKey = {
  admCd: string;
  rnMgtSn: string;
  udrtYn: string;
  buldMnnm: string;
  buldSlno: string;
};

type PropertyLocationInput = {
  bdMgtSn: string;
  roadAddress: string | null;
  coordKey?: CoordKey;
};
```

검색 결과를 선택하면 건물관리번호·주소·다섯 `coordKey` 필드를 같은 후보에서 그대로 가져온다. 다른 후보의 필드를 섞거나 ID를 숫자로 변환하지 않는다. 현재 API에는 선택 토큰·만료시각이 없으며 `coordKey`는 주소 식별값이다. 저장 단계에서 좌표를 찾지 못하면 재검색하도록 안내한다.

### 4.2 생성과 다른 건물로 변경

기존 매물 생성·수정 본문에 `location`을 추가한다. 위경도는 보내지 않는다.

```json
{
  "complexName": "예시 아파트",
  "name": "101동",
  "location": {
    "bdMgtSn": "1111010100100010000000001",
    "roadAddress": "서울특별시 예시로 1",
    "coordKey": {
      "admCd": "1111010100",
      "rnMgtSn": "111103100001",
      "udrtYn": "0",
      "buldMnnm": "1",
      "buldSlno": "0"
    }
  }
}
```

예시는 최소 본문이다. 수정에서는 메모·후기 등 기존 편집 필드도 기존 계약대로 함께 전송한다. 위도·경도가 있는 조회 DTO 전체를 저장 DTO로 그대로 전송하지 않는다.

BE는 새 위치이거나 저장된 건물관리번호가 달라지면 좌표를 조회하고, 성공한 위치를 매물에 저장한다. 현재 구현은 `bdMgtSn`·주소와 좌표 조회 키의 일치까지 확정하는 검증은 제공하지 않으므로 FE는 검색 후보를 그대로 전달해야 한다.

성공 응답의 위치는 다음과 같다.

```json
{
  "bdMgtSn": "1111010100100010000000001",
  "roadAddress": "서울특별시 예시로 1",
  "latitude": 37.57,
  "longitude": 126.98
}
```

### 4.3 수정 시 유지와 해제

| 요청 `location` | 현재 운영 동작 | FE 사용 방법 |
| --- | --- | --- |
| 생략 | **위치 삭제** | PUT에서 생략 금지 |
| `null` | 위치 삭제 | 사용자가 명시적으로 해제했거나 원래 위치가 없을 때 |
| 기존 `bdMgtSn` 객체 | 저장된 주소·좌표 유지, 외부 호출 없음 | 위치를 바꾸지 않는 모든 기본 정보 수정 |
| 새 `bdMgtSn`과 `coordKey` 객체 | 좌표 재조회 후 위치 교체 | 새 검색 후보 선택 시 |

기존 위치를 유지하는 요청 필드는 다음과 같다. `coordKey`는 필요 없다.

```json
{
  "location": {
    "bdMgtSn": "1111010100100010000000001",
    "roadAddress": "서울특별시 예시로 1"
  }
}
```

해제 요청은 `"location": null`이다. 같은 `bdMgtSn`이면 다른 주소 문자열을 보내도 저장된 주소·좌표가 유지된다. 위치를 바꾸려면 새 검색 후보를 선택해야 한다.

FE의 수정 입력 타입에는 `location`을 필수 키로 둔다.

```ts
// ExistingEditableFields는 FE에서 이미 사용하는 매물 편집 필드 타입이다.
type UpdateInspectionPropertyInput = ExistingEditableFields & {
  location: PropertyLocationInput | null;
};

function toUnchangedLocationInput(
  location: PropertyLocation | null,
): PropertyLocationInput | null {
  return location === null
    ? null
    : { bdMgtSn: location.bdMgtSn, roadAddress: location.roadAddress };
}
```

위 함수는 상세 조회가 완료된 편집 폼에서 사용한다. 위치 필드를 파서가 버렸거나 아직 상세를 읽지 않은 상태를 `null`로 바꿔 저장하면 안 된다. 편집 초기화 시 조회된 위치를 보존하고, 주소 해제 동작이 있을 때만 `null`로 바꾼다.

이 원칙은 지도 패널 외의 **모든 매물 기본 정보 PUT 경로**에 적용한다. 상태 변경·문답 저장·순서 저장 전용 API는 위치를 변경하지 않는다.

새 주소의 좌표 조회가 실패하면 다른 필드를 포함한 매물 저장 전체가 실패한다. 입력을 폼에 유지하고 오류를 안내한다. 자동으로 `location:null`로 바꿔 재저장하지 않는다. “위치 없이 저장”은 사용자가 선택했을 때만 수행한다. 기존 건물 유지 요청은 외부 호출 없이 처리된다.

### 4.4 선택 주소 좌표 미리보기

저장 전 지도 미리보기가 필요할 때만 사용한다. 이름이 `current-location`이지만 GPS나 브라우저 위치 권한을 사용하지 않는다.

```http
POST /geo/current-location
Content-Type: application/json
```

```json
{
  "coordKey": {
    "admCd": "1111010100",
    "rnMgtSn": "111103100001",
    "udrtYn": "0",
    "buldMnnm": "1",
    "buldSlno": "0"
  }
}
```

```json
{ "latitude": 37.57, "longitude": 126.98 }
```

이 호출은 저장하지 않는다. 매물 저장 시 서버가 다시 확정하므로 미리보기는 선택 사항이고 받은 좌표를 저장 요청에 넣지 않는다.

## 5. 방문 순서와 기본 지도

서버 배열의 순서는 `sortOrder ASC → registeredTime ASC → id ASC`다. `sortOrder` 동률은 허용된다. FE는 받은 배열을 별도로 재정렬하지 않는다.

**표시 번호는 필터링하기 전 전체 `properties` 배열의 index + 1**이다. `sortOrder` 자체나 위치가 있는 매물만 추린 배열의 index를 번호로 사용하지 않는다.

```ts
const numbered = properties.map((property, index) => ({
  ...property,
  number: index + 1,
}));
const located = numbered.filter((property) => property.location !== null);
```

| 전체 목록 | 지도 처리 |
| --- | --- |
| 1번 A, 2번 위치 없음, 3번 B | 번호 1·3 마커, A→B 직선, 목록의 2번 유지 |
| 1번 A, 2번 A, 3번 B | 연속 동일 좌표 A에 1·2 표시, A→B 연결 |
| 1번 A, 2번 위치 없음, 3번 A, 4번 B | 위치 없는 매물 제외 후 A의 1·3 연결, B는 4번 |
| A→B→A | 방문 순서상 세 지점을 유지. 되돌아오는 구간을 제거하지 않음 |
| 위치 0개 | 목록과 주소 등록 안내 표시 |
| 유효 지점 1개 | 마커만 표시, 연결선·도보 요청 없음 |

기본 지도에는 번호 마커와 **방문 순서를 잇는 직선**을 표시한다. 직선을 실제 도보 경로로 표시하거나 임의 보행 속도로 계산한 시간을 API 소요 시간으로 보여주지 않는다. 이번 1차 범위에는 추정 시간이 필요하지 않다.

기본 지점 병합도 도보 API에 맞춰 위치 없는 매물을 제외한 뒤 **연속한 위경도가 완전히 같은 경우**로 한다. 서버는 `bdMgtSn`만으로 병합하지 않는다. 서로 떨어져 있는 동일 좌표 방문을 전역 중복 제거하지 않는다. 겹친 마커의 여러 번호는 목록과 함께 확인할 수 있게 한다.

지도 bounds는 위치가 있는 매물로 계산한다. SDK 로딩·지도 초기화가 실패해도 목록·편집은 유지한다. 위치가 없다는 이유로 매물 생성·완료를 막지 않는다. 출처는 “주소·좌표: 행정안전부”로 표시하고 SDK 로고·저작권 표시를 가리지 않는다.

### 방문 순서 저장

```http
PUT /inspection-visits/v1/properties/order
```

```json
[
  { "propertyId": "p3", "sortOrder": 1 },
  { "propertyId": "p1", "sortOrder": 2 },
  { "propertyId": "p2", "sortOrder": 3 }
]
```

성공은 204, 본문 없음이다. FE는 위치 없는 매물까지 포함한 해당 회차 전체 ID를 중복 없이 보내고 `sortOrder`를 1부터 부여한다. 저장 후 선택 회차 상세를 재조회하고 지도·번호를 갱신한다.

서버는 전달된 항목을 한 트랜잭션에서 갱신한다. 누락 ID는 기존 순서를 유지하며 전체 ID 포함을 강제하지 않는다. 다른 회차 ID는 `400 INVALID_INSPECTION_ORDER`, 중복 ID는 현재 마지막 값이 적용된다. FE는 이 동작에 의존하지 말고 전체 순서와 ID 중복을 검증한다.

## 6. 사용자 요청 시 도보 경로

현재 외부 연동은 **카카오맵 REST 도보 경로**(`dapi.kakao.com/v2/routing/walk`)다. 카카오모빌리티 제휴 API와는 다른 상품이며 FE가 외부 endpoint를 직접 호출하지 않는다. 기존 BE 프록시를 사용한다.

```http
POST /inspection-visits/v1/walking-route
```

요청 본문은 없다. FE가 좌표·순서를 전송하지 않으며 BE가 저장된 회차의 위치·순서로 계산한다. 순서 저장이 진행 중이면 경로 버튼을 비활성화하고, 저장 성공·상세 재조회가 끝난 뒤 요청한다.

```ts
type WalkingRoute = {
  totalDistance: number; // m
  totalTime: number;     // 초
  stops: Array<{
    index: number;      // 0부터 시작하는 경로 지점 번호
    propertyIds: string[];
    latitude: number;
    longitude: number;
  }>;
  legs: Array<{
    fromStopIndex: number;
    toStopIndex: number;
    distance: number;   // m
    time: number;       // 초
    path: Array<[number, number]>; // [longitude, latitude], WGS84
  }>;
};
```

```json
{
  "totalDistance": 450,
  "totalTime": 360,
  "stops": [
    { "index": 0, "propertyIds": ["p1", "p2"], "latitude": 37.57, "longitude": 126.98 },
    { "index": 1, "propertyIds": ["p4"], "latitude": 37.572, "longitude": 126.982 }
  ],
  "legs": [
    {
      "fromStopIndex": 0,
      "toStopIndex": 1,
      "distance": 450,
      "time": 360,
      "path": [[126.98, 37.57], [126.981, 37.571], [126.982, 37.572]]
    }
  ]
}
```

`stop.index`는 표시 번호가 아니다. 요청 시 전체 매물 배열의 `propertyId → index+1` 맵으로 `propertyIds`를 연결한다. 위 응답에서 p3에 위치가 없었다면 마커 번호는 1·2와 4다. 제외 매물 목록은 응답에 없으므로 FE의 전체 목록에서 계산한다.

서버는 위치 없는 매물을 제외하고 연속 동일 좌표를 병합한다. 지점이 7개를 넘으면 끝점을 겹쳐 분할 호출하며 지점을 임의로 누락하지 않는다. 외부 호출 수는 `ceil((지점 수 - 1) / 6)`이다. 하나라도 실패하면 부분 결과 없이 전체 요청이 실패한다.

### 응답 표시 규칙

- 거리·시간은 `totalDistance`, `totalTime`을 단위 변환해 표시한다.
- 좌표 배열은 **[경도, 위도]**다. SDK에는 `new kakao.maps.LatLng(point[1], point[0])`로 넘긴다.
- `legs`는 항상 `stops.length - 1`개라는 보장이 없다. 한 구간이 여러 지점을 잇는 응답도 있으므로 각 `path`를 그대로 그린다.
- 어떤 구간이든 path가 비었거나 유효한 선을 그릴 수 없으면 도보 결과를 표시하지 않고 기본 직선·목록을 유지한다. 직선을 도보 구간으로 바꿔 반환받은 것처럼 표시하지 않는다. 이 경우 도보 합계 거리·시간도 숨긴다.
- 유효 지점이 2개 미만이면 서버는 `{"totalDistance":0,"totalTime":0,"stops":[],"legs":[]}`를 200으로 반환한다. “도보 지점 부족”으로 안내하며 “0m·0분 경로”로 표시하지 않는다. FE에서도 같은 병합 규칙으로 버튼을 비활성화해 불필요한 요청을 줄인다.
- 과거 회차도 “현재 방문 순서로 걸을 때의 추천 경로”다. 실제 걸었던 이동 기록이나 방문 당시 경로로 설명하지 않는다.

### 중복 요청과 오래된 응답

현재 서버는 응답에 `visitId`, revision, 계산 기준 전체 목록을 반환하지 않고 중복 호출도 합치지 않는다. 다음은 FE가 구현해야 할 동작이다.

1. 화면 진입·회차 선택·주소 수정·순서 변경만으로 도보 POST를 자동 호출하지 않는다. 사용자가 버튼을 누를 때만 호출한다.
2. 요청 중 버튼을 잠그고 같은 회차의 진행 중 Promise를 공유한다. API 클라이언트의 POST 자동 재시도, focus·reconnect·mount 재호출을 적용하지 않는다.
3. 요청 시 `visitId`, 전체 배열 순서·ID·sortOrder·위치와 요청 generation을 캡처한다. 완료 시 현재 선택 회차·지도 입력·generation이 모두 같은 경우에만 표시한다. A→B→A 전환도 이전 A 요청을 재사용하지 않는다.
4. 반환된 stops의 매물 ID 순서·좌표가 요청 시 스냅샷에서 예상한 지점과 일치하는지도 확인한다. 맞지 않으면 결과를 버리고 목록을 재조회한다.
5. 회차 전환, 매물 생성·삭제·위치 변경, 순서 변경, 패널 종료 시 진행 중 요청을 취소하고 기존 경로·합계 상태를 비운다. 이미 시작한 서버 외부 호출까지 취소된다고 가정하지 않는다.
6. 도보 응답은 현재 패널의 일시적인 화면 메모리에만 둔다. localStorage·IndexedDB·영속 query cache·응답 본문 로그에 보관하지 않는다. 실패해도 기본 직선과 목록을 유지한다.

이 방식은 FE가 알고 있는 변경과 늦게 도착한 응답을 걸러낸다. 다른 사용자의 동시 수정까지 엄격히 보장하는 서버 revision은 현재 없다. 재조회 결과가 바뀌면 경로를 폐기하며, 서버 수준 보장이 필요하면 별도 BE 보완이 필요하다. 화면 메모리 보관은 구현 방침이며 공급자가 허용한 고정 TTL을 의미하지 않는다.

## 7. 오류 처리

```json
{
  "title": "입력이 올바르지 않습니다.",
  "status": 400,
  "code": "VALIDATION_FAILED",
  "errors": []
}
```

FE는 `code`로 분기하고 `title`은 안내 문구로 사용한다. `title`을 파싱하지 않는다.

| HTTP | 현재 code | FE 처리 |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` | 검색 조건·위치 입력 확인. bdMgtSn 최대 26자, roadAddress 최대 300자(trim 후) |
| 400 | `INVALID_ADDRESS_KEYWORD` | 검색어 수정 안내, 자동 재시도 없음 |
| 400 | `ADDRESS_COORDINATE_NOT_FOUND` | 재검색 또는 사용자가 선택한 경우 위치 없이 저장 |
| 400 | `INSPECTION_VISIT_NOT_FOUND` | 선택 회차 재조회·선택 상태 복구 |
| 400 | `VIEWED_PROPERTY_NOT_FOUND` | 매물 목록 재조회 |
| 400 | `INVALID_INSPECTION_ORDER` | 현재 회차 전체 ID·중복 확인, 목록 재조회 |
| 401 | `UNAUTHORIZED` | 기존 인증 처리 적용 |
| 403 | `ACCESS_ROLE_DENIED` | 접근 불가 안내 |
| 409 | `VIEWED_PROPERTY_CONFLICT` | 최신 상세 재조회 후 다시 편집, 무조건 덮어쓰는 재시도 금지 |
| 429 | `WALKING_ROUTE_QUOTA_EXCEEDED` | 도보 조회 한도 안내, 자동 재시도 없이 기본 직선 유지 |
| 502 | `ADDRESS_LOOKUP_FAILED` | 폼 입력 유지, 저장 실패 안내 |
| 503 | `ADDRESS_LOOKUP_UNAVAILABLE` | 주소 기능 일시 사용 불가 안내, 입력 유지 |
| 502 | `WALKING_ROUTE_FAILED` | 기본 직선·목록 유지, 도보 거리·시간 표시 안 함 |
| 503 | `WALKING_ROUTE_UNAVAILABLE` | 도보 기능 일시 사용 불가 안내, 기본 직선·목록 유지 |

타임아웃과 경로 없음은 현재 별도 오류 코드 없이 각 기능의 502로 묶인다. 주소 공급자 한도 오류도 별도 429 계약이 없다. 키 적용 완료 상태에서도 503은 설정 거절 등을 나타낼 수 있으므로 정상 오류 분기로 처리한다.

## 8. FE 수정 파일과 반영 순서

| FE 파일 | 작업 |
| --- | --- |
| `src/domains/inspection/types.ts` | 조회 위치·주소 검색·저장 입력·도보 응답 타입, nullable name 반영 |
| `src/domains/inspection/api/inspection-schemas.ts` | location을 파싱·보존, name·roadAddress nullable 처리, 주소·경로 스키마 추가 |
| `src/domains/inspection/mappers/inspection-mappers.ts` | 모든 매물 매핑에서 위치 유지, 조회 DTO와 저장 입력 DTO 분리 |
| `src/domains/inspection/api/inspection-api.ts` | 기존 상대 경로 재사용, 주소 GET·도보 POST 추가, 수정 serializer의 location 필수화 |
| `src/domains/inspection/components/area-detail/VisitPanel.tsx` | 선택 회차 기준 지도·번호·직선·도보 버튼·상태 폐기 |
| 모든 매물 기본 정보 편집 호출부 | 주소 UI를 거치지 않는 수정도 기존 위치를 왕복 전송 |
| FE의 `docs/api_spec.json` | 현재 BE의 위치·주소·도보 계약과 nullable 필드 반영 |

먼저 타입·파서·매핑·모든 PUT의 위치 왕복을 반영한 뒤 위치 저장 UI를 활성화한다. 위치 필드가 없는 구버전 FE가 계속 기본 정보 PUT을 수행하면 저장된 위치가 삭제될 수 있다. 열린 구버전 탭을 포함한 배포 전환 시 이 위험을 확인해야 하며, 혼용을 허용하면서 삭제를 완전히 방지하려면 BE의 생략 의미론 변경이 필요하다.

그다음 PC·모바일 공통으로 번호 마커·직선·목록 연결을 완료하고, 도보 조회 버튼을 추가한다. 1차 지도는 도보 API가 실패해도 동작해야 한다. 서버 배포·키 설정·DB 변경은 이번 FE 작업의 선행 신규 작업이 아니다.

## 9. 인수 확인 목록

| 사례 | 기대 결과 |
| --- | --- |
| 기존 위치 없는 매물 | 파싱 성공, 목록 유지, 위치 없음 안내 |
| 새 주소 지정·저장·재조회 | 응답의 저장 좌표로 마커 표시 |
| 메모만 수정 | 같은 bdMgtSn 전송, 위치 유지 |
| 다른 건물 선택 | 새 후보의 coordKey 전달, 저장 성공 후 지도 갱신 |
| 위치 해제 | null 전송, 저장 성공 후 마커 제거 |
| 주소 저장 실패·좌표 없음 | 폼 유지, 기존 지도 유지, 자동 위치 삭제·재저장 없음 |
| 같은 지역의 회차 전환 | 선택 회차 매물만 표시, 이전 도보 응답 무시 |
| 순서 변경 | 위치 없는 매물도 순서 요청에 포함, 204 후 재조회, 번호·선 갱신 |
| A·위치 없음·B | 마커 번호 1·3, 제외 항목은 목록의 2번 유지 |
| A·A·B / A·위치 없음·A·B | 병합한 마커에 전체 목록의 원래 번호 모두 연결 |
| A·B·A | 마지막 A 방문을 제거하지 않음 |
| 유효 지점 0·1개 | 목록 또는 마커만 표시, 도보 호출 없음 |
| 유효 지점 2개 | 클릭 1회에 도보 POST 1회, 실제 path·거리·시간 표시 |
| 7지점 초과 | 서버 분할 결과를 그대로 표시, FE 임의 지점 누락 없음 |
| 연속 클릭·자동 재시도 | 동시에 중복 POST 발생하지 않음 |
| 계산 중 주소·순서 변경 또는 A→B→A 전환 | 기존 요청 취소·generation 변경, 늦은 결과 표시 안 함 |
| 빈 path·잘못된 path / 여러 지점에 걸친 leg | 빈 path는 실패 처리, spanning leg는 받은 선 그대로 표시 |
| 429·502·503·일부 묶음 실패 | 기본 직선·목록 유지, 실제 도보 합계 표시 안 함 |
| 지도 SDK 실패 | 목록·편집 기능 유지 |
| PC·모바일 | 두 기존 경로의 선택 회차 패널에서 같은 계약·번호·폐기 규칙 적용 |

429·타임아웃·일부 묶음 실패·오래된 응답은 FE 모의 응답으로 검증한다. 실제 쿼터 소진이나 장애 유발 호출은 필요하지 않다. 운영 연동 확인은 실제 주소 후보 선택·저장·조회와 소수 지점의 명시적 도보 요청으로 수행한다.
