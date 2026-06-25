# 여행(Travel / JOURNEY) 기능 구현 결과

## 1. 개요

새로운 **여행 기록(JOURNEY)** 기능을 추가했다. 이 기능은 `/travels/*` API를 사용하는
**다일정 여행 기록**(여행일 → 장소 → 사진, 태그, 구조화된 후기) 기능으로, 기존
**나들이(MAP)** 기능(`trip` 도메인, `/trip` API, `/main/map`)과는 별개의 독립 기능이다.

> ⚠️ 용어 주의: 코드베이스에는 두 개의 유사 기능이 공존한다.
> - **나들이 / MAP** — 기존 `src/domains/trip`, 라우트 `/main/map`, API `/trip`
> - **여행 / JOURNEY** — 신규 `src/domains/travel`, 라우트 `/main/travel`, API `/travels` ← 이번 작업

디자인 기준(source of truth): `docs/SeoulChonnom_Prototype.html` (Claude Design 프로토타입).
프로토타입은 로그인(id `string` / pw `string`) → "여행 기록" 네비게이션으로 진입하는
인터랙티브 React 프로토타입이다.

## 2. 라우트

| 화면 | Desktop | Mobile |
| --- | --- | --- |
| 여행 리스트 | `/main/travel` | `/mobile/travel` |
| 여행 등록 | `/main/travel/register` | `/mobile/travel/register` |
| 여행 상세 | `/main/travel/:id` | `/mobile/travel/:id` |
| 여행 수정 | `/main/travel/:id/edit` | `/mobile/travel/:id/edit` |

라우팅·네비게이션 연동:
- `route-constants.ts` — `MAIN/MOBILE_ROUTE_PATTERNS`에 4개 라우트 추가, 예약 세그먼트에 `'travel'` 추가
- `route-manifest.tsx` — `RoutePageKey` 4종 + `BASE_PROTECTED_ROUTES` 항목 추가
- `lazy-route-pages.tsx` — main/mobile 8개 페이지 lazy import
- `mobile-routes.tsx` — register/detail/edit는 `detail` 셸 사용(나들이와 동일 패턴)
- `route-builders.ts` — `buildDeviceTravel{List,Register,Detail,Edit}Path`
- `navigation-items.ts` — 데스크탑/모바일 네비에 "여행 기록" 항목 추가
- `HomeHubPage.tsx` — 홈에 JOURNEY 카드/타일 추가

## 3. 아키텍처

기존 `trip` 도메인 패턴을 그대로 미러링했다. (얇은 Page 래퍼 → 도메인 `Section` 컴포넌트,
react-query 훅 + zod 스키마 + DTO→뷰 매퍼, `slcn-` BEM CSS, 공용 `components/ui` 재사용.)

```
src/domains/travel/
  types.ts                     # 뷰모델 타입, PlaceCategory, CATEGORY_LABELS
  api/travel-schemas.ts        # 모든 Travel* DTO zod 스키마 + parse 헬퍼
  api/travel-api.ts            # /travels 전체 엔드포인트 클라이언트
  mappers/travel-mappers.ts    # DTO→뷰 매퍼, 날짜/기간 포맷터
  hooks/                       # useTravelList, useTravelDetail, useTravelMutations, useTravelRegisterForm
  components/
    TravelListSection, TravelCard
    TravelDetailSection, TravelDayList, TravelPlaceItem, TravelPhotoAlbum,
    TravelReviewSection, TravelTagSection, CategoryIcon
    AddPlaceModal, AddPhotoModal
    TravelRegisterSection, TravelRegisterForm, TravelDayEditor
src/pages/{main,mobile}/Travel{List,Register,Detail,Edit}Page.tsx
src/styles/travel-{list,detail,register}.css   # main.tsx에서 import
```

## 4. API 연동 (`/travels`)

응답은 공용 `apiClient`(`src/lib/api/api-client.ts`)로 호출하며 raw JSON을 zod로 검증 후 매핑한다.

장소 카테고리 enum ↔ 라벨: `TOURIST_SPOT`=관광지, `RESTAURANT`=음식점, `CAFE`=카페,
`ACCOMMODATION`=숙소, `SHOPPING`=쇼핑, `TRANSPORT`=이동, `ACTIVITY`=체험, `ETC`=기타.

날짜: API `YYYY-MM-DD` → 화면 `YYYY.MM.DD`(매퍼에서 변환).

| 엔드포인트 | 클라이언트 메서드 | UI 연동 |
| --- | --- | --- |
| `GET /travels` | `getTravelList` | 리스트 |
| `GET /travels/{id}` | `getTravelDetail` | 상세 / 수정 프리필 |
| `POST /travels` | `createTravel` | 등록 |
| `PATCH /travels/{id}` | `updateTravel` | 수정 |
| `DELETE /travels/{id}` | `deleteTravel` | (훅 준비, UI 미연동) |
| `PATCH .../days/{dayId}` | `updateTravelDay` | (훅 준비) |
| `POST .../days/{dayId}/places` | `createTravelPlace` | 장소 추가 모달 |
| `PATCH/DELETE .../places/{placeId}` | `updateTravelPlace`/`deleteTravelPlace` | (훅 준비) |
| `POST /travels/{id}/photos` | `addTravelPhoto` | 사진 추가 모달 |
| `DELETE .../photos/{photoId}` | `deleteTravelPhoto` | (훅 준비) |
| `PUT /travels/{id}/review` | `putTravelReview` | (훅 준비) |
| `POST/DELETE /travels/{id}/tags` | `addTravelTag`/`deleteTravelTag` | 태그 섹션 |

> 일부 변이 훅(삭제·일자수정·장소수정 등)은 API 표면을 완성하기 위해 구현했으나
> 현재 화면 플로우에는 아직 연결되지 않았다. 향후 인라인 편집 도입 시 바로 사용 가능.

## 5. 화면별 디자인 매칭

데스크탑(1440) + 모바일(390) 모두 프로토타입과 픽셀 단위로 대조했다.
참고 캡처: `docs/tmp/proto/` (프로토타입), `docs/tmp/app/` (구현).

- **리스트** — JOURNEY eyebrow, 타이틀/서브타이틀, `+ 새 여행 기록하기`,
  데스크탑 2열·모바일 1열 카드 그리드. 카드: 빗금 플레이스홀더, `N박 M일`·`대표` 배지,
  지역 칩, 날짜 범위, 제목, 한줄 후기, 태그 칩, 구분선, 통계(일/곳/장).
- **상세** — 커버 히어로, 타이틀 블록, 헤더 액션(여행 목록/여행 수정),
  `날짜별 기록`(일자 카드 + 장소 행 + 장소 추가), `사진 앨범`(전체/날짜별/장소별 탭 + 사진 추가),
  `여행 후기`(요약·좋았던 점·아쉬운 점·다시 가고 싶은 곳·최종 후기), `태그`.
- **등록/수정** — 제목·지역·시작/종료일·여행 기간(자동), 대표 사진 드롭존,
  날짜별 기록(일자별 자동 생성), 사진 앨범 드롭존, 태그 입력, 취소/저장하기.
  수정 모드는 상세를 프리필하고 타이틀이 "여행 수정".
- **모달** — `장소 추가`(장소명, 8개 카테고리 칩, 설명, 사진 타일, 취소/장소 저장),
  `사진 추가`(여행 사진에서 선택/새로 업로드 탭, 썸네일 그리드 선택, 안내 배너, 취소/선택한 사진 추가).
  공용 `components/ui/Modal`(role=dialog, focus trap, Esc/백드롭 닫기, 스크롤 락) 사용.

### 시각 비교 방법론
- 프로토타입은 인터랙티브 SPA라 Playwright로 로그인→네비게이션하며 각 화면/모달을 캡처.
- 구현 앱은 실제 백엔드 계정에 여행 데이터가 없어, Playwright 네트워크 인터셉트로
  프로토타입과 동일한 샘플 데이터(경주/부산)를 주입해 캡처(`docs/tmp/app-capture.mjs`, `fixtures.mjs`).
  커버/사진은 의도적으로 빈 값 → 프로토타입과 동일하게 빗금 플레이스홀더로 렌더.
- 인증 토큰이 메모리에 있어 전체 리로드 시 가드 리다이렉트가 발생하므로 SPA 내비게이션으로 캡처.

### 수정 이력 (대조 후 반영)
1. **리스트 2열 그리드 깨짐** — 데스크탑 2열 규칙이 `components-pc.css`에 있었으나
   뒤에 import되는 `travel-list.css`의 단일열 기본값이 덮어써 1열로 표시됨.
   → `travel-list.css`에 `.slcn-shell-desktop` 스코프 규칙으로 이동해 cascade 순서/특이도로 해결,
   `components-pc.css`의 죽은 규칙 제거.
2. **모달 취소 버튼 줄바꿈** — 넓은 기본 버튼에 밀려 "취/소"로 줄바꿈 → 취소 버튼 `flex:0 0 auto; nowrap`,
   기본 버튼 `flex:1`로 정리.
3. **상세 히어로/타이틀 카드화** — 프로토타입은 커버 이미지 + 정보(지역/날짜/제목/한줄/통계)를 하나의
   흰색 라운드 카드로 감쌈. 구현은 분리되어 있어 단일 카드로 통합.
4. **상세 통계 행 추가** — 히어로에 표시되던 태그를 제거하고, 프로토타입과 동일하게
   라벨 통계(날짜 N일 / 장소 N곳 / 사진 N장)로 교체. 장소/사진 수는 상세 데이터에서 계산
   (`travelDays`의 places 합계, `photos.length`). 태그는 태그 섹션에만 표시.
5. **상세 섹션 네비 pill 추가** — 히어로 하단에 `날짜별 기록/사진 앨범/여행 후기/태그` 앵커 pill,
   클릭 시 해당 섹션으로 스무스 스크롤. 히어로 지도 아이콘, 수정 버튼 연필 아이콘도 반영.
6. **등록 폼 정합** — 서브타이틀 문구, `지역`·`대표 사진` 필수 표시(*), 대표 사진 안내문/업로드 아이콘 정정,
   그리고 `여행 기간`에 안내 문구 + `[−] N박 M일 [+]` 스테퍼 추가(증감 시 날짜별 카드 자동 생성/삭제).

## 6. 알려진 편차 / 후속 작업

- **리스트 카드 통계(곳/장)** — 프로토타입은 `9 곳 33 장`을 표시하지만, 리스트 API(`TravelRdo`)에는
  장소/사진 카운트 필드가 없다. 현재 `일`은 `days`로 표시, `곳/장`은 `—`로 표시한다.
  → 백엔드 `TravelRdo`에 `placeCount`/`photoCount` 추가 시 스키마·타입·매퍼·카드에 반영하면 됨.
  (상세 페이지는 `TravelDetailRdo`에 days/places/photos 배열이 모두 있어 실제 수치를 계산해 표시함.)
- **사진 실제 렌더** — 사진은 `photoFileId` 문자열만 보유. 실제 이미지는 `/file` 파일 API 연동이 필요하며
  현재는 프로토타입과 동일하게 플레이스홀더. (나들이 `tripFilesApi` 패턴 재사용 가능.)
- **사진 추가 모달 "새로 업로드" 탭** — 신규 업로드 훅이 없어 placeholder. `여행 사진에서 선택`만 연동.
- 위에 표기한 미연동 변이 훅들(삭제/일자·장소 수정/후기 등)의 화면 연결.

## 6.5. 후속 라운드 (API 재동기화 + 홈/네비 정합)

### API 스펙 변경 반영 (`/travels` 생성/수정 nested化)
- `TravelCdo`(POST)·`TravelUdo`(PUT/PATCH)가 기본 필드뿐 아니라 **전체 nested 구조**를 받도록 변경됨:
  `travelDays:[TravelDayUdo]`(각 day에 `places:[TravelPlaceUdo]` + `photos`), `photos`, `review`.
  `TravelDayUdo`에 `id/date/places/photos` 추가, `TravelPlaceUdo`에 `photos` 추가. 신규 `PUT /travels/{id}`.
- 반영: `travel-schemas.ts`(Cdo/Udo nested zod), `types.ts`, `travel-api.ts`(`putTravel` 추가),
  `useTravelMutations.ts`(`usePutTravel`), `TravelRegisterSection.tsx`(폼 상태 → nested payload 조립 후 제출).
  이제 등록/수정 시 날짜별 장소까지 한 번의 생성/수정 호출로 전송됨(이전엔 로컬 상태에만 보관).
- 테스트 갱신: `travel-api.test.ts`, `travel-schemas.test.ts`.

### 홈/네비게이션 디자인 정합 (프로토타입 100% 대조)
프로토타입(`docs/tmp/proto/J-home.png`, `J-home-mobile.png`)과 앱(`docs/tmp/app/A-home.png`, `M-home.png`)을
동일 뷰포트로 비교해 수정:
- **여행/JOURNEY 아이콘** — 산/물결 아이콘 → 프로토타입의 접힌 지도(lucide map) 아이콘으로 교체(홈 카드 데스크탑/모바일).
- **여행 카드 New 배지** 추가(데스크탑=카드 우상단, 모바일=제목 우측 인라인).
- **여행 카드 설명문** 정정(데스크탑 `1박 이상 여행을 날짜별로 기록해요.`, 모바일 `1박 이상 여행 기록`).
- **모바일 하단 네비 여행 탭 아이콘 누락** → 접힌 지도 아이콘 추가(`MobileBottomNav` NavIcon에 `여행` 케이스 없었음).
- **캘린더 라벨** 프로토타입에 맞춰 `나들이 일정/일정` → `서울 촌놈 달력/달력`(데스크탑 네비·홈 카드·모바일 탭).
  관련 테스트(DesktopHeader/MobileBottomNav) 갱신.

> ⚠️ 백엔드 로그인(`POST /user/login`)이 현재 **500**(`서버 오류가 발생했습니다`)을 반환해 실데이터 캡처가 불가했다.
> UI 정합 비교는 Playwright 네트워크 인터셉트로 인증/`/travels`를 목킹해 수행했다(시각 충실도에는 영향 없음).
> 백엔드 복구 후 실데이터로 재확인 권장. 캘린더 라벨 변경이 의도와 다르면 되돌릴 수 있음.

## 6.6. API 엔드포인트 전면 리네이밍 + 모바일 셸 정합

### 문제의 진짜 원인 (git diff로 확인)
`git show HEAD:docs/api_spec.json` vs 작업본 비교 결과, 여행 nested 변경 외에 **엔드포인트가 단수→복수로 전면 리네이밍**되어 있었다(초기 여행 동기화에서 누락 → 로그인 500의 원인):
- `/user/*` → `/users/*` (로그인 경로가 바뀌어 `/user/login`이 500)
- `/trip*` → `/trips*`, `/calendar*` → `/calendars*`
- 파일 API: `/file` → `/assets/file` (+ `/assets/files`, `/assets/files/{fileId}`)
- 스키마: `FileRefSdo` → `FileAssetRdo`(`fileId,type,originalFilename,filename,path,mimeType,size`);
  `TripCdo`의 `logo/firstMap/secondMap`(객체) → `logoFileId/firstMapFileId/secondMapFileId`(문자열 id);
  `TripDetailRdo`/`TripListRdo`의 logo/map → `FileAssetRdo`.

반영: `auth-api`/`trip-api`/`calendar-api`/`trip-files-api` 경로 변경, `trip-schemas`/`trip` types/mappers의
FileAsset 전환, 업로드 흐름(업로드→fileId 회신→`*FileId` 전송) 수정, 관련 테스트 일괄 갱신. `/travels`는 이미 복수형이라 변경 없음.

> 백엔드 `/users/login`은 이제 경로상 정상 동작(404/500 아님)하나, 문서화된 dev 계정(`string`/`string`)에 대해
> **401**(`인증이 필요합니다`)을 반환한다. 이는 서버측(계정/데이터) 사안이라 사용자 지침대로 넘어가고,
> UI 검증은 Playwright 인증/`/travels` 목킹으로 수행했다.

### 모바일 셸 정합 (프로토타입 대조로 발견)
- **여행 상세/수정/등록의 모바일 헤더가 `신발 상세`로 표기**되던 버그 — 이 화면들이 `DetailMobileShell`(뒤로가기 바)을 쓰면서
  `getDetailMobileTitle`의 `/mobile/` 폴백(`신발 상세`)에 걸렸음.
- 프로토타입은 여행 모바일 화면을 **메인 셸 크롬**(로고+동적 타이틀+아바타 헤더 + 하단 네비)으로 표시한다.
  → `mobile-routes.tsx`에서 `travelDetail/travelEdit/travelRegister`의 `detail` 셸 오버라이드를 제거해 `main` 셸 사용,
  `MainMobileShell.getMainMobileTitle`에 여행 타이틀 추가: 리스트=`여행 기록`, 상세=`여행 상세`, 등록=`새 여행`, 수정=`여행 수정`.
  덤으로 캘린더 모바일 타이틀 `나들이 일정` → `서울 촌놈 달력`(앞서의 라벨 정합과 일치).
- 결과: 모바일 여행 리스트/상세/등록/수정이 모두 동적 헤더 + 하단 네비(여행 탭 활성) 크롬으로 프로토타입과 일치.

### 캡처 방법 (병렬)
디자인(프로토타입) 캡처와 프로젝트 캡처를 **2개의 서브에이전트로 병렬 수행** 후 메인이 비교:
`docs/tmp/cmp/proto/*` (Playwright file://) vs `docs/tmp/cmp/app/*` (playwright-cli, 인증/travels 목킹), 데스크탑·모바일 7화면.

## 6.7. 실데이터 검증 + 모바일 하단바 버그 수정

백엔드 인증 복구 후 dev 계정(`string`/`string`)으로 **실데이터** 기반 검증을 수행했다.

### 수정: 모바일 하단 네비게이션 줄바꿈
- `.slcn-mobile-bottom-nav__list`가 `grid-template-columns: repeat(4, …)`였는데 항목이 5개(홈/기록/여행/달력/신발)라
  `신발`이 둘째 줄로 줄바꿈됨(여행 탭 추가 시 컬럼 수 미반영). → `repeat(5, …)`로 수정해 한 줄에 5개 배치.

### 실데이터 분석 결과
- 홈/리스트/상세가 실데이터(`FE 테스트 부산/제주 2일 여행`)로 정상 렌더, 프로토타입 레이아웃과 일치.
- 상세 통계는 실데이터로 `장소 N곳 / 사진 N장` 실제 수치 표시(상세 RDO에 배열 존재). 리스트는 여전히 `—`(RDO에 카운트 없음).
- 모바일 셸(여행 상세=`여행 상세` 헤더 + 하단 네비) 정상.

### 알려진 한계 (서버측/미구현 — 지침에 따라 스킵)
- **`POST /users/token` 400 (하드 리프레시 시 세션 복원 실패)**: 스펙상 refreshToken을 **쿠키**로 받는데(로그인이
  `Set-Cookie: refreshToken; HttpOnly` 설정), 교차 출처(5173→8080) 요청이라 `credentials:'include'`가 필요하다.
  그러나 백엔드 CORS가 `Access-Control-Allow-Origin: *`(+ `Allow-Credentials` 없음)이라 자격증명 요청이 브라우저에서
  차단됨 → **서버측 CORS 설정(`Allow-Credentials: true` + 특정 Origin) 필요**. SPA 내 이동은 정상(인메모리 토큰).
- ~~여행 사진/대표 이미지가 placeholder로 표시~~ → **해결(아래 6.8)**. 실이미지 패칭 연결 완료.

## 6.8. 여행 이미지 패칭 연결 (대표/사진)

`trip`의 에셋 패칭 패턴을 그대로 미러링해 여행 cover/photo가 실제 이미지를 표시하도록 연결.
- `api/travel-files-api.ts` — `downloadTravelFile(fileId)` → `GET /assets/files/{fileId}` (blob).
- `hooks/useTravelAssetUrls.ts`(배열) / `useTravelAssetUrl.ts`(단건) + `internal/useTravelAssetObjectUrls.ts`
  (fileId 문자열 키, object URL 생성·해제·취소 처리).
- 연결: 리스트 카드 cover(`coverPhotoId`), 상세 히어로(`coverPhotoId`), 사진 앨범(`photoFileId`), 장소 썸네일(`place.photos`).
  object URL이 있으면 `<img object-fit:cover>` 렌더, 없으면 기존 빗금 placeholder 유지.
- 테스트 추가(`useTravelAssetUrls`, `travel-files-api`). `pnpm test` 242 passed.

검증(실데이터): 백엔드 `GET /assets/files/{fileId}`가 200(image/png) 반환 확인. 리스트 cover 2장, 상세 히어로 1 + 앨범 썸네일 4장이
`<img>`로 렌더되고 broken 0. (현재 FE 테스트 파일은 1×1 PNG라 단색으로 보이지만 패칭/렌더 파이프라인은 정상 — 실사진이면 그대로 표시됨.)

## 6.9. 여행 수정 폼 기존 데이터 프리필 수정

수정 진입 시 기본 정보뿐 아니라 날짜별 일정/장소가 보이지 않던 버그 수정.
- **원인 ①**: `TravelRegisterSection`의 `defaultValues`가 `title/region/startDate/endDate/tags`만 넘기고
  `days`를 누락 → 기존 `travelDays[].places[]`가 폼에 채워지지 않음.
- **원인 ②**: `useTravelRegisterForm`이 lazy `useState(() => ...)`로 1회만 초기화 →
  `useTravelDetail`은 비동기라 캐시 미스(예: 수정 URL 직접 진입) 시 빈 값으로 초기화 후 재동기화 안 됨.
- **수정**:
  - `mapDetailToDefaultValues(TravelDetail)`로 전체 일정 매핑(`travelDays → DayFormRow`, `places → PlaceFormRow`,
    category·memo 포함).
  - 내부 `TravelRegisterFormController`를 분리해 상세 로드 완료 후에만 마운트
    (`formReady = !isEdit || Boolean(existingTravel)`), `key={travelId ?? 'new'}`로 여행별 재마운트.
    → lazy `useState`가 항상 실데이터로 초기화됨.
  - 제출 로직은 그대로 유지.

검증(실데이터, SPA 이동 로그인 → 여행 기록 → 카드 → 여행 수정): 제목 `FE 테스트 부산 2일 여행`, 지역 `부산`,
2026.09.05–09.06(1박 2일), Day 1 장소 `대표 장소`(관광지 선택됨), Day 2(빈 날), 태그 `#도시 #FE테스트`가 모두 프리필됨. `pnpm test` 246 passed.

### 추가 수정: 장소 메모/설명 필드 매핑 불일치

수정 폼의 단일 `메모` 칸이 비어 보이던 잔여 버그. 상세 페이지(`TravelPlaceItem`)는 장소 텍스트를
`place.description ?? place.memo`로 표시하는데(테스트 데이터는 `description="FE 확인용 장소"`, `memo=null`),
`mapDetailToDefaultValues`는 `place.memo`만 읽어 빈 값이 됨 → 상세에서 보이던 텍스트가 수정 폼에서 사라짐.
- 수정: `memo: place.description ?? place.memo ?? ''`로 상세 페이지 로직과 동일하게 매핑.
- 저장 round-trip: `buildTravelDays`가 폼 메모를 `memo`로 전송하고 상세는 `description ?? memo`로 읽으므로
  재저장 후에도 동일 텍스트가 표시됨(데이터 유실 없음).
- 검증(실데이터, cold-load): Day 1 메모 칸에 `FE 확인용 장소` 표시 확인.

### 환경 메모

검증 중 dev 서버가 2개(5173 + 며칠 전 기동된 중복 인스턴스) 떠 있어 사용자가 stale HMR 인스턴스를 볼 가능성을
발견 → 단일 인스턴스로 정리. 증상 재현이 안 될 경우 브라우저 하드 리프레시(Cmd+Shift+R) 권장.

## 7. 검증

- `pnpm build` — 통과 (tsc -b + vite build).
- `npx @biomejs/biome check --write src/` — 통과.
- `pnpm test` — 통과 (246 passed; travel 도메인 테스트 포함).
- `pnpm knip` — travel 도메인의 미연동 변이 훅 일부가 "unused export"로 남을 수 있으며,
  이는 의도된 API 표면(향후 인라인 편집용). 신규로 도입한 그 외 export는 테스트로 소비.
