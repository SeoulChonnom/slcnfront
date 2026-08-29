# 이미지 에셋 API — 프론트 연동 검증 결과 및 최적화 계획

- 대상 문서: `docs/image-asset-api.md`
- 검증 대상: `slcnfront` / 브랜치 `redesign/main` (`2c5a4d0`)
- 검증 환경: 로컬 백엔드 `http://localhost:8080/api` **기동 상태에서 실제 호출로 검증**
- 검증일: 2026-08-29

## 1. 요약

**백엔드 계약은 문서대로 정확히 동작한다. 프론트는 그 계약을 하나도 쓰고 있지 않다.**

프론트는 전 화면에서 `variant` 없이 `GET /assets/files/{fileId}` 만 호출한다. 실제 브라우저로 홈에 진입해 측정한 결과 **원본 13건 = 32.01 MiB** 를 그대로 내려받는다. 같은 화면을 문서 권장대로 호출하면 **0.71 MiB** 다.

| 지표 | 실측값 |
| --- | --- |
| 홈 최초 진입 (현재 프론트) | **33,561,194 B = 32.01 MiB** (GET 13건, 쿼리 파라미터 0건) |
| 홈 최초 진입 (문서 권장 적용 시) | **739,764 B = 0.71 MiB** |
| 감축 폭 | **-97.8%** |
| 재방문 (새로고침) | 0 B (13건 전부 디스크 캐시 적중) — 캐시는 이미 정상 동작 |

| # | 검증 항목 | 판정 |
| --- | --- | --- |
| 1 | 경로 `/assets/files/{fileId}`, context path `/api` | ✅ 일치 |
| 2 | 인증 `X-AUTH-TOKEN` (없으면 401) | ✅ 일치 |
| 3 | `cover.fileAssetId` == `cover.file.fileId` | ✅ 실측 일치 |
| 4 | 하위 호환 (배열 응답 · 업로드 계약 · 원본 바이트 동일) | ✅ SHA-256 동일 확인 |
| 5 | `FileAssetRdo` 신규 필드로 인한 파싱 파손 | ✅ 없음 (조용히 버려짐) |
| 6 | variant 결정 규칙 9종 | ✅ 8/9 일치, 1건 문서와 다름 (§4.1) |
| 7 | 응답 헤더 · 304 재검증 | ✅ 문서와 동일 |
| 8 | `/download` 계약 (파일명 · variant 기본값 · ETag) | ✅ 문서와 동일 |
| 9 | 캐시 금지사항 위반 | ✅ 없음 (재방문 0 B 실측) |
| A | 프론트의 `variant` 사용 | ❌ **전혀 미사용 (P0)** |
| B | `width` / `height` / `variants` 활용 | ❌ 스키마에 없음 (P1) |
| C | 목록 · 앨범의 무제한 원본 다운로드 | ❌ (P1) |
| D | `fetchPriority` / `loading="lazy"` 실효성 | ❌ **구조적으로 무력 (P1)** |
| E | 검색 · 필터 입력 시 표지 전량 재요청 | ⚠️ 실측 확인 (P2) |
| F | 이미지 요청마다 CORS preflight 1회 추가 | ⚠️ 실측 확인 (P2) |
| G | `/download` 사용 | ➖ 미구현 (해당 UI 없음) |

## 2. 검증 환경과 데이터

로컬 DB가 비어 있어(`GET /travels` → `[]`) **검증용 데이터를 직접 생성**했다.

- 사진 13장 업로드 (`POST /assets/file?type=travel`) — 3024×4032 JPEG, 건당 약 2.5 MB, 다중 옥타브 노이즈로 축소해도 디테일이 남는 사진 유사 이미지
- 여행 13건 생성 (`POST /travels`, `files[].role=COVER`) — 제목 `검증용 여행 01`~`13`, 지역 `제주`
- 별도로 PNG 1건, 한글 파일명(`제주 바다.jpg`) 1건 업로드

> **정리 필요**: 위 데이터는 로컬 개발 DB에 남아 있다. `DELETE /travels/{travelId}` 로 제거할 수 있다.

## 3. 백엔드 계약 실측

### 3.1 variant 결정 규칙

기준 자산: `제주 해변.jpg`, 원본 2,583,030 B (3024×4032 JPEG).

| 요청 | 문서가 말한 응답 | 실측 status | 실측 Content-Type | 실측 bytes | 판정 |
| --- | --- | --- | --- | --- | --- |
| (파라미터 없음) | 원본 | 200 | `image/jpeg` | 2,583,030 | ✅ |
| `?variant=original` | 원본 | 200 | `image/jpeg` | 2,583,030 | ✅ |
| `?variant=home-thumb` | 320px 축소본 | 200 | `image/webp` | 42,730 | ✅ |
| `?variant=home-feature` | 960px 축소본 | 200 | `image/webp` | 227,270 | ✅ |
| `?variant=nope` (미지원 값) | `home-feature` | 200 | `image/webp` | 227,270 | ✅ |
| `?variant=` (빈 값) | `home-feature` | 200 | `image/jpeg` | 2,583,030 | ⚠️ **원본** |
| `?width=320` | `home-thumb` | 200 | `image/webp` | 42,730 | ✅ |
| `?width=640` | `home-feature` | 200 | `image/webp` | 227,270 | ✅ |
| `?width=1400` | 원본 | 200 | `image/jpeg` | 2,583,030 | ✅ |
| `?format=webp` 단독 | 무시 → 원본 | 200 | `image/jpeg` | 2,583,030 | ✅ |
| `?variant=home-thumb&format=webp` | variant 우선 | 200 | `image/webp` | 42,730 | ✅ |

문서에 없던 동작도 확인했다.

| 요청 | 실측 | 비고 |
| --- | --- | --- |
| `?variant=HOME-THUMB` | `home-thumb` | **대소문자 무시** |
| `?variant=home-thumb%20` | `home-thumb` | 후행 공백 트림 |
| `?variant=home_thumb` | `home-feature` | 미지원 값 규칙대로 폴백 |
| `?width=0` / `?width=-1` | **원본** | 축소본 아님 |
| `?width=abc` | **500** | 400이 아니라 서버 오류 |

`?width=0` → 원본은 실무상 함정이다. 레이아웃 확정 전 엘리먼트 폭(0)을 그대로 넘기면 조용히 원본을 받는다. **`width` 대신 `variant`를 명시적으로 쓸 근거다.**

### 3.2 응답 헤더와 304 재검증

```
$ curl -s -D - -o /dev/null -H "X-AUTH-TOKEN: $T" \
    "http://localhost:8080/api/assets/files/$FID?variant=home-thumb"
HTTP/1.1 200
ETag: "1c9c1906-e5a9-45ee-b701-ecb1c4bcc5fb-home-thumb"
Cache-Control: max-age=86400, private
Content-Type: image/webp
Content-Length: 1738
```

문서의 헤더 예시와 형식이 정확히 같다. 재검증도 동일하다.

| 요청 | 실측 |
| --- | --- |
| `If-None-Match` 일치 | **304**, 본문 0바이트, `ETag`·`Cache-Control` 유지 |
| `If-None-Match` 불일치 | 200 + 전체 본문 |
| 토큰 없음 | **401** |
| 존재하지 않는 `fileId` | **400** (404 아님) |

### 3.3 원본 바이트 동일성

업로드한 원본 파일과 조회 응답의 SHA-256이 일치한다. 문서의 "바이트 단위로 동일함" 주장 그대로다.

```
ee84cdd5...de82c  (no param 응답)
ee84cdd5...de82c  (?variant=original 응답)
ee84cdd5...de82c  (업로드한 원본 파일)
```

### 3.4 `/download`

```
$ curl -s -D - -o /dev/null -H "X-AUTH-TOKEN: $T" \
    "http://localhost:8080/api/assets/files/$FID/download"
Content-Type: image/jpeg
Content-Disposition: attachment; filename="=?UTF-8?Q?=EC=A0=9C=EC=A3=BC_=EB=B0=94=EB=8B=A4.jpg?="; filename*=UTF-8''%EC%A0%9C%EC%A3%BC%20%EB%B0%94%EB%8B%A4.jpg
ETag: "1c9c1906-...-original-download"
```

| 요청 | 실측 결과 | 파일명 |
| --- | --- | --- |
| (`variant` 없음) | 원본 5,962,344 B | `제주 바다.jpg` |
| `?variant=home-thumb` | 축소본 1,738 B (webp) | `제주 바다_home-thumb.webp` |
| `?variant=nope` | **원본** 5,962,344 B | `제주 바다.jpg` |
| `?variant=original` | 원본 | `제주 바다.jpg` |

한글 파일명 RFC 5987 인코딩, `-download` ETag 분리, **"조회는 알 수 없으면 축소본, 저장은 원본"** 규칙 모두 문서대로다.

### 3.5 `FileAssetRdo` 신규 필드

업로드 응답과 `TravelRdo.cover.file` 양쪽에서 확인했다.

```json
{
  "fileId": "a5d15024-e50a-4c1b-af65-8211c0313237",
  "type": "travel", "originalFilename": "제주 해변.jpg",
  "mimeType": "image/jpeg", "size": 2583030,
  "width": 3024, "height": 4032,
  "variants": ["home-feature", "home-thumb"]
}
```

`TravelRdo.cover.fileAssetId` 와 `TravelRdo.cover.file.fileId` 는 **13건 전부 동일**했다. 문서대로 어느 쪽을 써도 된다.

포맷도 확인했다. PNG 원본은 `image/png` 로 나오고 그 축소본은 `image/webp` 다. **같은 자산에서도 원본과 축소본의 포맷이 다르므로, 확장자가 아니라 `Content-Type` 으로 판단하라는 문서 지침이 실제로 필요하다.**

업로드는 JPG/PNG만 허용한다(`JPG, PNG 파일만 업로드 가능합니다.`).

## 4. 프론트 실제 동작 실측 (브라우저)

Playwright(Chromium, DPR 2)로 개발 서버에 로그인해 CDP `Network` 이벤트로 실제 전송량을 측정했다.

### 4.1 홈 최초 진입

| 항목 | 데스크톱 1440px | 모바일 390px |
| --- | --- | --- |
| 이미지 GET 요청 | 13 | 13 |
| **쿼리 파라미터 포함 요청** | **0 / 13** | **0 / 13** |
| Content-Type | `image/jpeg` (전부 원본) | `image/jpeg` (전부 원본) |
| 전송 바이트 | **33,561,194 B (32.01 MiB)** | **33,561,194 B (32.01 MiB)** |
| CORS preflight (OPTIONS) | 13 | 13 |

데스크톱과 모바일이 동일하다. 두 셸이 같은 `HomeHubPage` 를 쓰기 때문이다.

### 4.2 렌더 크기 대비 원본 크기

실제로 화면에 그려지는 크기를 측정했다. DPR 2 기준 필요 폭과 비교한다.

| 화면 / 요소 | 렌더 크기(CSS) | DPR2 필요 폭 | 실제 수신 폭 | 과잉 배수 | 적정 variant |
| --- | --- | --- | --- | --- | --- |
| 홈 대표 표지 (1440px) | 677×338 | 1354 | 3024 | 2.2× | `home-feature`(960) — **약간 부족** |
| 홈 아카이브 썸네일 (1440px) | 104×78 | 208 | 3024 | **14.5×** | `home-thumb`(320) 충분 |
| 홈 대표 표지 (390px) | 358×143 | 716 | 3024 | 4.2× | `home-feature`(960) 충분 |
| 홈 아카이브 썸네일 (390px) | 72×54 | 144 | 3024 | **21.0×** | `home-thumb`(320) 충분 |
| 여행 목록 카드 (1440px) | 586×— | 1172 | 3024 | 2.6× | `home-feature`(960) — 약간 부족 |

**104×78 자리에 3024px 원본을 넣고 있다.** 모바일에서는 21배다.

### 4.3 `loading="lazy"` / `fetchPriority` 는 구조적으로 무력하다

DOM 상에는 힌트가 정상적으로 붙어 있다.

- 홈 대표 표지: `fetchPriority="high"` (`MemoryChronicleFeature.tsx:31`)
- 홈 아카이브 썸네일: `loading="lazy"` (`TravelArchiveRow.tsx:45`)

그런데 **390px 뷰포트에서 화면에 보이는 행이 3개뿐인데도 13건이 전부 즉시 다운로드됐다.** `src` 가 `blob:` URL이라 이미지가 DOM에 붙는 시점에는 이미 다운로드가 끝나 있고, 브라우저 네트워크 스케줄러가 개입할 여지가 없다. 실제 동작은 `useAssetObjectUrls.ts:69` 의 `Promise.allSettled` 로 인한 **전건 즉시 병렬 요청**이다.

여행 목록 카드에는 `loading` 힌트조차 없다(`loading=auto`).

### 4.4 캐시는 이미 정상 동작한다

| 시나리오 | 요청 수 | 전송 바이트 | 결과 |
| --- | --- | --- | --- |
| 재방문 (새로고침) | 13 | **0 B** | 13건 전부 디스크 캐시 적중 |
| 검색어 `여행 01` 입력 (목록 축소) | 1 | 0 B | 재요청 발생, 캐시 적중 |
| 검색어 삭제 (목록 복원) | 13 | 0 B | **전건 재요청**, 캐시 적중 |

두 가지가 동시에 확인된다.

- **프론트는 캐시를 깨고 있지 않다.** `max-age=86400` 이 그대로 먹혀 재방문 전송량이 0 B다. 문서의 "재방문 0 B" 주장이 현재 코드에서도 성립한다.
- **검색·필터 입력마다 표지 전량이 재요청된다.** `HomeHubPage.tsx:90-97` 의 `assetIds` 가 `filteredTravels` 에 의존해, 목록이 바뀌면 `useAssetObjectUrls.ts:97` 의 이펙트가 재실행되고 cleanup(`:92-96`)이 기존 object URL을 전부 revoke한 뒤 다시 받는다. 캐시 덕에 네트워크 비용은 없지만 **blob 재생성과 입력 중 이미지 깜빡임은 남는다.**

### 4.5 이미지 요청마다 CORS preflight 1회

홈 최초 진입에서 `OPTIONS 13건 + GET 13건` 이 관측됐다. `X-AUTH-TOKEN` 커스텀 헤더 때문에 단순 요청이 되지 못한다. 백엔드가 `Access-Control-Max-Age: 6000` 을 주므로 이후 100분간은 캐시되지만, **최초 진입에서는 13번의 추가 왕복이 발생한다.**

### 4.6 이미지 GET은 쿠키 인증이 불가능하다 (구조 제약)

`<img src="/api/assets/files/...">` 로 직접 물릴 수 있는지 확인했다.

```
로그인 쿠키(sessionId, refreshToken)만 전송, X-AUTH-TOKEN 없음
  → status=401
```

**이미지 조회는 `X-AUTH-TOKEN` 헤더가 필수다.** `<img>` 태그는 커스텀 헤더를 보낼 수 없으므로, 현재 계약에서는 fetch + Blob 구조가 **선택이 아니라 강제**다. 4.3의 lazy loading 무력화와 4.5의 preflight는 여기서 파생된 결과이며, 프론트 단독으로는 제거할 수 없다.

## 5. 프론트 코드 상세 판정

### 5.1 통과 항목

| 항목 | 근거 |
| --- | --- |
| 호출 경로 | `travel-files-api.ts:9`, `trip-files-api.ts:16`, `profile-api.ts:64` — 세 곳 모두 `/assets/files/${encodeURIComponent(fileId)}` |
| 인증 헤더 | `api-client.ts:128` 에서 공통 주입 |
| `fileId` 출처 | `travel-mappers.ts:62,76,106,127` → `dto.cover?.fileAssetId` / `trip/types.ts:11-13` → `asset.fileId` |
| 배열 응답 파싱 | `travel-schemas.ts:218`, `trip-schemas.ts:66` — envelope 가정 없음 |
| 업로드 계약 | `POST /assets/file?type=` + FormData(`file`) 그대로 |
| 신규 필드 내성 | zod v4 object는 unknown key strip → 파싱 실패 없음 |
| 캐시 금지사항 | `no-store`/`reload`/`?t=` 없음, fetch `cache` 옵션 미지정(=default) |
| Blob URL 정리 | `useAssetObjectUrls.ts:26-30,85,94` |
| 상세 히어로 = 원본 | `TravelDetailSection.tsx:68` — 문서 권장과 일치 |

### 5.2 A. `variant` 전혀 미사용 — P0

`src/` 전체에 `variant` / `home-feature` / `home-thumb` 문자열이 없다. 3개 다운로드 함수 모두 쿼리를 붙이지 않는다.

### 5.3 B. `width` / `height` / `variants` 미수신 — P1

`travel-schemas.ts:85-90`, `trip-schemas.ts:4-12`, `profile-schemas.ts:4-12` 의 `fileAssetSchema` 에 해당 필드가 없어 파싱 단계에서 버려진다. `aspect-ratio` 레이아웃 예약을 쓸 수 없어 이미지 로드 전후 레이아웃 시프트가 남는다.

지금은 값을 안 쓰므로 구 자산 `width=0` 나눗셈 사고는 없다. **스키마에 추가하는 순간 `width > 0` 가드가 필수다.**

### 5.4 C. 목록 · 앨범의 무제한 원본 다운로드 — P1

홈은 13건 상한이 있지만 아래는 상한이 없다.

| 화면 | 대상 | 코드 |
| --- | --- | --- |
| 여행 목록 | 전체 여행 표지 (전건) | `TravelListSection.tsx:22` |
| 여행 상세 — 사진 앨범 | 여행 사진 전건 | `TravelPhotoAlbum.tsx:69` |
| 여행 상세 — 장소 카드 | 장소 사진 전건 | `TravelPlaceItem.tsx:11` |

여행 목록 진입 시 13건 요청을 실측했다(캐시 적중으로 0 B였으나, 콜드 캐시라면 32 MiB다).

## 6. 문서 · 스펙과 실제가 다른 지점

백엔드에 확인이나 수정이 필요한 항목이다.

| # | 내용 | 영향 |
| --- | --- | --- |
| 1 | **`?variant=` (빈 값) → 원본** — 문서 표는 "오타·미지원 값 → 기본 축소본"으로 읽히지만 빈 값은 원본이 나온다 | 문서 표현 수정 권장. 실제 규칙은 "빈 값 = 미지정 = 원본, 비어있지 않은 미지원 값 = `home-feature`" |
| 2 | **`?width=abc` → 500** | 400이어야 자연스럽다. 프론트가 `width` 를 안 쓰면 무해하나 방어가 필요 |
| 3 | **`?width=0` / 음수 → 원본** | 계산된 폭을 넘길 때의 함정. 문서에 명시 권장 |
| 4 | **없는 `fileId` → 400** (404 아님) | 프론트 에러 분기 시 참고 |
| 5 | **`variant` 대소문자 무시 · 공백 트림** | 문서에 없는 관용 동작 (문제는 아님) |
| 6 | **`docs/api_spec.json` 이 낡았다** | `variant`/`width`/`format` 파라미터 없음, `/download` 경로 없음, `FileAssetRdo` 에 `width`/`height`/`variants` 없음. `TravelCdo` 도 실제 백엔드(`files[]`)와 프론트 스키마(`coverPhotoId`+`photos`)가 다름 |
| 7 | **데스크톱 2× 에서 `home-feature`(960px)가 필요 폭(1354px)에 못 미친다** | 가장 크게 보이는 자리의 화질 저하. 문서의 "다른 축소본 크기가 필요한 경우" 경로로 요청 대상 (예: `home-hero` 1440px) |
| 8 | **이미지 GET의 쿠키 인증 미지원** | §7 2단계 최적화의 전제 조건 |

## 7. 최적화 계획

두 갈래다. **1단계만으로 전송량의 97.8%가 사라진다.** 2단계는 백엔드 협조가 필요하며 preflight·lazy loading·메모리 문제를 함께 해결한다.

### 7.1 목표

| 지표 | 현재 (실측) | 1단계 후 (실측 기반 산출) | 2단계 후 |
| --- | --- | --- | --- |
| 홈 최초 진입 전송량 | 32.01 MiB | **0.71 MiB (-97.8%)** | 0.71 MiB |
| 홈 최초 진입 왕복 | OPTIONS 13 + GET 13 | OPTIONS 13 + GET 13 | GET 3~4 (뷰포트 내) |
| 화면 밖 이미지 다운로드 | 전건 즉시 | 전건 즉시 | 스크롤 시 지연 |
| 검색어 입력 중 재요청 | 전건 | 전건 (캐시 적중) | 없음 |
| Blob 메모리 | 원본 13건 상주 | 축소본 13건 | 없음 |

### 7.2 1단계 — `variant` 적용 (프론트 단독, P0)

**S1-1. variant 타입 정의**

서버가 오타에 4xx를 주지 않으므로(§3.1) **타입이 유일한 방어선**이다. 공용 모듈(`src/lib/api/image-variant.ts` 등)에 둔다.

```ts
export type ImageVariant = 'home-feature' | 'home-thumb' | 'original';
```

`width` 파라미터는 쓰지 않는다. `width=0` → 원본(§3.1), `width=abc` → 500(§6-2)이라 계산값을 넘기는 순간 사고가 난다.

**S1-2. 다운로드 API에 variant 인자 추가**

`travel-files-api.ts` / `trip-files-api.ts` / `profile-api.ts` 세 곳. `original` 은 쿼리를 생략해 URL을 지금과 동일하게 유지한다(이미 채워진 캐시를 버리지 않는다).

```ts
downloadTravelFile(fileId: string, variant: ImageVariant = 'original') {
  return client.get<Blob>({
    path: `/assets/files/${encodeURIComponent(fileId)}`,
    query: variant === 'original' ? undefined : { variant },
    responseType: 'blob',
  });
}
```

**S1-3. 훅 캐시 키에 variant 포함**

`useAssetObjectUrls` 의 키는 현재 `fileId` 단독이다(`travel: getKey: (id) => id`, `trip: fileAssetKey`). 같은 `fileId` 를 서로 다른 variant로 쓰는 화면이 생기면 충돌하므로 키를 `${fileId}@${variant}` 로 바꾼다. 훅 입력을 `string[]` 에서 `{ fileId, variant }[]` 로 올린다.

**S1-4. 호출부 매핑** (§4.2 실측 근거)

| 위치 | 코드 | 적용 variant |
| --- | --- | --- |
| 홈 대표 표지 | `HomeHubPage.tsx:92` | `home-feature` |
| 홈 아카이브 썸네일 | `HomeHubPage.tsx:93` | `home-thumb` |
| 여행 목록 카드 | `TravelListSection.tsx:22` | `home-feature` |
| 나들이 목록 로고 | `TripListSection.tsx:35` | `home-thumb` |
| 사진 앨범 그리드 | `TravelPhotoAlbum.tsx:69` | `home-thumb` |
| 장소 카드 사진 | `TravelPlaceItem.tsx:11` | `home-thumb` |
| 프로필 아바타 | `useProfileImageUrl.ts:8` | `home-thumb` |
| 여행 상세 히어로 | `TravelDetailSection.tsx:68` | (없음 = 원본, 현행 유지) |
| 나들이 상세 지도 | `TripDetailSection.tsx:16-17` | (없음 = 원본, 현행 유지) |

**S1-5. 검증**

`variants: []` 인 구 자산도 오류 없이 원본이 내려오므로(문서 보장) 자산 나이를 구분할 필요는 없다. 단 §8의 미검증 항목이라 배포 전 스테이징에서 구 자산 1건으로 확인한다.

### 7.3 1.5단계 — 크기 힌트와 재요청 억제 (프론트 단독, P1~P2)

**S2-1. `width` / `height` / `variants` 스키마 반영**

세 `fileAssetSchema` 에 추가한다. 구 자산은 `0` 으로 오므로 가드를 반드시 건다.

```ts
width: z.number().int().default(0),
height: z.number().int().default(0),
variants: z.array(z.string()).default([]),
```

```tsx
const hasSizeHint = file.width > 0 && file.height > 0;
<img {...(hasSizeHint && { width: file.width, height: file.height })} />
```

**S2-2. 홈 검색 재요청 제거** (§4.4)

`assetIds` 를 `filteredTravels` 가 아니라 **필터링 이전 목록**에서 만들면 검색어를 쳐도 이펙트가 재실행되지 않는다. 표시 여부는 렌더 단계에서 거른다. 이것이 디바운스보다 근본적이다.

**S2-3. 여행 목록·앨범 상한** (§5.4)

초기 렌더 건수를 제한하고 나머지는 스크롤·페이지네이션으로 미룬다. 2단계를 적용하면 자연히 해결되므로, 2단계가 가능하면 건너뛴다.

### 7.4 2단계 — `<img src>` 직접 사용 (백엔드 협조 필요, P1)

§4.6에서 확인했듯 현재는 `X-AUTH-TOKEN` 헤더 없이 이미지를 못 받아 fetch+Blob이 강제된다. 이 제약이 풀리면 4.3·4.5·4.4의 문제가 한꺼번에 사라진다.

**백엔드에 요청할 것** (택1)

- (a) `GET /assets/files/{fileId}` 에 **쿠키 세션 인증 허용** — 이미 `sessionId` 쿠키가 발급되고 `credentials: 'include'` 로 전송되고 있으므로 백엔드 수용만 필요하다
- (b) 단기 **서명 URL**(`?token=...`) 발급 — 쿠키 정책을 건드리기 어렵다면 대안

**풀린 뒤 프론트 변경**

```tsx
<img
  src={buildAssetUrl(fileId, 'home-thumb')}
  width={file.width > 0 ? file.width : undefined}
  height={file.height > 0 ? file.height : undefined}
  loading="lazy"
  decoding="async"
/>
```

- `useAssetObjectUrls` / `useTravelAssetUrls` / `useTripAssetUrls` / `useProfileImageUrl` 제거
- `loading="lazy"` 가 **실제로** 동작 → 홈 최초 GET이 13건에서 뷰포트 내 3~4건으로 감소
- `fetchPriority="high"` 가 **실제로** 동작
- CORS preflight 소멸 (단순 GET)
- 검색어 입력 시 재요청 소멸 (`src` 가 안 바뀌면 재요청이 없다)
- Blob 메모리·revoke 로직 소멸
- 브라우저 이미지 캐시(디코딩 결과 포함) 활용

**주의**: 저장 기능은 여전히 `fetch` + `X-AUTH-TOKEN` + `/download` 가 필요하다(파일명이 붙어야 함).

### 7.5 3단계 — 백엔드 요청 항목

| 항목 | 근거 |
| --- | --- |
| 데스크톱 2× 용 대형 축소본 (예: `home-hero` 1440px) | §4.2 — `home-feature`(960px)가 필요 폭 1354px에 미달 |
| 구 자산 축소본 일괄 생성 (대상 31건) | 문서 명시. 프론트 코드 변경 없이 이득이 확대된다 |
| `?width=abc` → 400, `?width<=0` 처리 명시 | §6-2, §6-3 |
| `docs/api_spec.json` 갱신 | §6-6 — 스펙이 낡아 `/api-sync` 계열 작업의 신뢰도가 떨어진다 |
| 이미지 GET 쿠키 인증 | §7.4 전제 조건 |

### 7.6 실행 순서 권장

```
S1-1 → S1-2 → S1-3 → S1-4  (1단계, 프론트 단독, -97.8%)
   ↓
S2-1, S2-2                  (크기 힌트 + 재요청 억제)
   ↓
[백엔드] 쿠키 인증 허용
   ↓
S3 (<img src> 전환)         (왕복·메모리·lazy loading 해결)
```

1단계는 백엔드 의존이 없고 되돌리기 쉬우므로 먼저 단독 배포한다. `original` 일 때 URL을 그대로 두면 상세 화면 캐시는 유지된다.

## 8. 검증하지 않은 것

정직하게 남긴다.

| 미검증 항목 | 이유 |
| --- | --- |
| **축소본이 없는 구 자산의 동작** (`variants: []`, `width/height = 0`, `?variant=home-thumb` → 원본 폴백) | 로컬 DB가 비어 있어 구 자산을 만들 수 없었다. 업로드는 JPG/PNG만 받고 항상 축소본을 생성하므로 variant 없는 자산을 인위적으로 만들 수 없다. 문서가 말하는 31건은 백엔드 환경에만 있다 |
| 문서의 원본 측정치(5,072,268 B 사진 / 52.50 MiB) 재현 | 자체 생성한 2.5 MB급 사진 13장으로 대체 측정했다. 감축률(-97.8%)은 유효하나 절대 수치는 사진에 따라 달라진다 |
| 실제 네트워크(원격 백엔드) 지연·대역폭 조건 | 전부 localhost 측정이라 왕복 비용이 과소평가돼 있다. preflight 13회의 실제 체감은 원격에서 더 크다 |
| 나들이(`/trips`) · 프로필 이미지의 브라우저 실측 | 해당 도메인 데이터를 생성하지 않았다. 다만 `useAssetObjectUrls` 를 공유하므로 동작은 여행과 동일하다 |

**검증한 것**: 백엔드 계약 전 항목(§3), 프론트의 실제 요청 URL·전송량·캐시 동작·렌더 크기(§4), 프론트 코드 경로(§5). 모두 이 세션에서 실제 호출과 브라우저 관측으로 확인했다.

## 9. 부록 — 재현 명령

```bash
# 토큰 (유효기간 약 30분)
T=$(curl -s -X POST http://localhost:8080/api/users/login \
      -H 'Content-Type: application/json' \
      -d '{"username":"string","password":"string"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["accessToken"])')

# 표지 fileId 목록
curl -s -H "X-AUTH-TOKEN: $T" http://localhost:8080/api/travels \
  | python3 -c 'import json,sys;[print(t["cover"]["fileAssetId"]) for t in json.load(sys.stdin)]'

# variant별 전송량 비교
for v in "" "?variant=home-feature" "?variant=home-thumb"; do
  echo -n "$v  "
  curl -s -o /dev/null -w 'type=%{content_type} bytes=%{size_download}\n' \
    -H "X-AUTH-TOKEN: $T" "http://localhost:8080/api/assets/files/$FID$v"
done

# 304 재검증
curl -s -D - -o /dev/null -H "X-AUTH-TOKEN: $T" \
  -H "If-None-Match: \"$FID-home-thumb\"" \
  "http://localhost:8080/api/assets/files/$FID?variant=home-thumb" | head -1

# 저장 (파일명 확인)
curl -s -D - -o /dev/null -H "X-AUTH-TOKEN: $T" \
  "http://localhost:8080/api/assets/files/$FID/download" | grep -i content-disposition
```
