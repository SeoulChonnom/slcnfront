# UI/UX 개선 및 구조 분석 보고서

## 1. 프로젝트 개요

분석 범위는 기존 IA/와이어프레임 문서인 `docs/ia_report.md`, `docs/wireframe.md`, 기존 화면 캡처 `docs/scr`, 현행 Vue 코드(`src/router/index.js`, `src/App.vue`)와, 신규 디자인 소스인 Stitch PC 시안, Pencil 모바일 시안(`docs/design/design.pen`)이다. 기준은 기존 실제 기능이며, 신규 디자인은 이를 시각적으로 재구성한 초안으로 해석했다.

주요 변경 테마는 `연분홍 단색 카드형 UI → 브랜딩 강화된 감성형 카드/에디토리얼 UI`, `단일 로고 헤더 → 상단/하단 내비게이션 체계`, `긴 단일 폼 → 단계형 입력`, `목록/상세/캘린더의 정보 밀도 강화`다. 다만 몇몇 신규 메뉴와 콘텐츠는 현행 기능과 직접 매핑되지 않는다.

## 2. 기존 기능과 신규 디자인의 간극 분석 (Gap Analysis)

| 페이지/컴포넌트 명             | 기존 상태 (IA/이미지/코드)                                                                        | 신규 디자인 (Stitch/Pencil)                                                                            | 수정 필요 사항 및 간략한 핵심 노트                                                                                   |
| :----------------------------- | :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| 로그인 `/login`                | 단순 카드형 로그인, 자동 리프레시 로그인 포함                                                     | 브랜딩 강화, 모바일은 카드형 입력과 더 명확한 위계                                                     | 시각 개선은 수용 가능. 자동 로그인 로직은 유지 필요. 인라인 에러, 비밀번호 토글 추가 여지 있음                       |
| 메인 대시보드 `/`              | 5개 진입 카드: D-day, calendar, map, Choi's Film Art, recom                                       | 카드 비주얼 강화, PC/모바일 모두 상단/하단 nav 도입, 일부 시안은 `New Log`, `MyPage` 등 신규 항목 포함 | 기존 5개 기능 기준으로 정보 재매핑 필요. `MyPage`, `New Log`, `Record`는 현행 라우트와 불일치                        |
| 나들이 목록 `/map`             | 카드 클릭 시 퀴즈 후 상세 진입, 등록 버튼 존재                                                    | 검색바, 상세 설명 카드, 버튼형 CTA, 프로필/즐겨찾기성 아이콘 추가                                      | 검색은 신규 기능. 퀴즈 게이트는 반드시 유지해야 함. 등록 CTA는 PC에서도 명시적으로 살아 있어야 함                    |
| 나들이 등록 `/map/register`    | 실제 입력 필드가 매우 많음: 타입, 로고, 지도1/2, 버튼1/2, 드라이브, 퀴즈 제목/정답/오답 메시지 등 | 3-step form, 업로드 드롭존, 질문/보기 중심으로 단순화                                                  | 디자인이 백엔드 입력 스키마를 덜 담고 있음. 누락 필드(type, map2 label, success/error copy 등) 보완 없이는 기능 손실 |
| 나들이 상세 `/map/:date`       | 지도 이미지, 멀티맵 토글, 드라이브 링크, 고정 비밀번호 안내                                       | 스토리보드형 상세, 히어로 맵, 메타정보, 세그먼트, 하단 CTA                                             | 스토리 표현은 가능하지만 `map1/map2 전환`, `button1/button2`, 드라이브 안내 문구는 유지 설계 필요                    |
| 일정 관리 `/calendar`          | TOAST UI month view CRUD, 월 전환, 폼/상세 팝업                                                   | PC 월간 캘린더 재디자인, 모바일은 월간+주간 화면 분리                                                  | `주간 화면`은 기존에 없는 신규 기능. 추가 라우트/상태 설계 없이 단순 치환 불가                                       |
| 신발 추천 목록 `/shoesRecom`   | 정적 3브랜드 6개 상품, 실제 상품명/가격/이미지 기반                                               | 편집숍형 카탈로그, 일부 상품명/가격/구성이 기존 데이터와 다름                                          | 디자인은 구조 참고용으로만 사용 가능. 실제 구현은 기존 SKU/브랜드 데이터에 맞춰 재배치해야 함                        |
| 신발 상세 `/:brand/:shoesName` | 상품 이미지, 설명, 조건부 영상, 리뷰 이미지 2개+링크                                              | 에디토리얼 상세, 큰 히어로, 영상 박스, 리뷰 카드                                                       | 구성은 적합하나 실제 데이터 매핑 필요. 영상 없음/있음 분기와 리뷰 외부 링크 유지 필요                                |
| 공통 내비게이션                | 현재는 로고 헤더+푸터만 존재                                                                      | PC 글로벌 헤더, 모바일 TopAppBar/BottomNav                                                             | 공통 AppShell 재설계 필요. 단, 신규 메뉴명은 기존 IA에 맞게 정정해야 함                                              |

## 3. 기존 기능과 신규 디자인의 간극 상세 정보

### 3.1 메인/공통 네비게이션

신규 시안의 가장 큰 변화는 내비게이션 체계다. 하지만 실제 라우트는 `/`, `/map`, `/map/:date`, `/shoesRecom`, `/:brand/:shoesName`, `/login`, `/map/register`, `/calendar`뿐이다. 따라서 Stitch/Pencil에 보이는 `MyPage`, `Profile`, `Record`, `Membership`, `Catalog`, `New Log`는 현행 기능 기준으로는 추가 요구사항이거나 플레이스홀더다. 구현 시 메뉴 체계부터 재정의해야 한다.

### 3.2 나들이 도메인

나들이 기능은 목록-퀴즈-상세-등록의 연결성이 핵심이다. 현재 목록 카드는 클릭 즉시 SweetAlert 퀴즈를 띄우고 정답일 때만 상세로 이동한다. 신규 리스트 디자인은 카드 내 설명, 검색, CTA를 강화했지만 퀴즈 진입 규칙이 화면상 약화되어 있다. 또한 등록 화면은 디자인상 단순해졌지만 실제 폼은 멀티맵, 정답/오답 메시지, 버튼 라벨 등 데이터 요구가 많아 UI 단순화와 기능 보존이 충돌한다.

### 3.3 일정 관리

기존은 TOAST UI Calendar에 의존한 월간 CRUD다. 모바일 주간 화면과 커스텀 월간 보드는 시각적으로는 개선되지만, 구현 관점에서는 `month/week view state`, `이벤트 배치 로직`, `기존 팝업 대체 전략`이 추가된다. 단순 스타일 변경이 아니라 캘린더 엔진 선택의 문제로 번진다.

### 3.4 신발 추천 도메인

기존 신발 추천은 사실상 정적 콘텐츠 앱이다. 신규 시안은 매거진형으로 좋아졌지만 상품 데이터가 현재 `src/global/global.js`와 다르다. 즉 레이아웃은 가져올 수 있어도 콘텐츠 소스는 그대로 재사용하기 어렵다. 기존 기능 기준이면 최소한 브랜드 3개, 상품 6개, 조건부 영상, 리뷰 링크 2개 구조는 유지해야 한다.

## 4. 정보 구조(IA) 및 내비게이션 변화

`docs/ia_report.md` 기준 현행 IA는 깊이가 얕고, 메인에서 각 기능으로 직접 진입하는 구조다. 신규 디자인은 이를 `글로벌 탐색형 구조`로 바꾸려 한다는 점에서 방향성은 맞지만, 실제 IA 변경은 다음처럼 구분해서 봐야 한다.

- 유지 가능한 변화: 메인 진입 카드의 정보 보강, 목록 검색 추가, 상세 페이지의 뒤로가기/CTA 명확화, 모바일 BottomNav 도입
- 설계 보류가 필요한 변화: `MyPage/Profile/Membership/Record` 같은 신규 메뉴, `주간 일정` 별도 화면, `New Log` 같은 새 기능 카드
- 사용자 흐름 변화: 기존은 `메인 → 페이지 진입` 중심이고, 신규는 `탭 기반 재탐색` 중심이다
- 상세 페이지에서는 BottomNav를 숨기고 TopAppBar 뒤로가기를 우선하는 현재 Pencil 구조가 더 적합하다
- 최종 권장 IA: `홈 / 나들이 기록 / 일정 / 신발 추천 / Choi's Film Art(외부)` 정도로 정리하는 것이 현행 기능과 가장 잘 맞는다

## 5. React 프레임워크 전환 시 고려사항

공통 컴포넌트로는 `AppShell`, `GlobalHeader`, `MobileTopAppBar`, `BottomNav`, `FeatureCard`, `OutingCard`, `QuizModal`, `StepForm`, `UploadField`, `CalendarShell`, `ShoeCard`, `ShoeDetailSection` 분리가 적절하다. 신규 디자인은 컴포넌트화 친화적이지만, 기능 누락 없이 분해하려면 도메인 단위 설계가 필요하다.

상태 관리는 `auth/session`, `trip list/detail cache`, `registration draft`, `quiz modal flow`, `calendar view + event CRUD`, `shoe static catalog`로 분리하는 편이 낫다. React 전환 시에는 `TanStack Query + route loader 수준의 서버 상태`, `폼은 react-hook-form + zod`, `UI 상태는 local reducer 또는 Zustand` 조합이 적합하다. 특히 나들이 등록은 단계형 폼으로 가면 `임시 저장 상태`, `파일 업로드 상태`, `유효성 검증 스키마`가 복잡해진다.

기술적 난제는 세 가지다.

- 기존 기능과 신규 메뉴 구조 불일치
- 파일 업로드/Blob 이미지/멀티맵 토글처럼 데이터 구조가 UI보다 복잡한 부분
- TOAST UI Calendar를 유지할지, React 친화적인 캘린더로 교체할지 결정 필요

반응형은 단순 breakpoint 전환보다 `PC=글로벌 헤더`, `Mobile=TopAppBar+BottomNav`, `상세/등록=sticky CTA`처럼 레이아웃 패턴 자체가 달라진다. 따라서 하나의 컴포넌트를 CSS만으로 줄이기보다 `shared domain + device-specific presentation` 전략이 유리하다.

## 6. 추가 확인 및 질문 사항

- 신규 디자인의 `MyPage/Profile/Membership/Record/New Log`는 실제 신규 기능인가, 아니면 시각적 플레이스홀더인가?
- `주간 일정`은 실제 릴리즈 범위인가, 아니면 모바일 탐색안인가?
- 나들이 등록에서 `type(A/I)`, `button1/button2`, `quizAnswerTitle/Text`, `quizErrorTitle/Text`를 계속 사용자 입력으로 받을 것인가?
- 나들이 상세의 드라이브 비밀번호 안내(`입사일`)는 계속 노출해야 하는 운영 규칙인가?
- 신발 추천 신규 시안의 상품/가격/이미지는 기존 `global.js` 데이터로 치환하면 되는가, 아니면 콘텐츠도 전면 교체 예정인가?
- 메인의 `Choi's Film Art` 외부 링크는 모바일 BottomNav에 계속 포함해야 하는가?
- 나들이 목록의 검색은 실제 구현 범위인가? 구현한다면 검색 기준은 `날짜`, `장소명`, `설명` 중 무엇인가?

## 참고한 주요 소스

- `docs/ia_report.md`
- `docs/wireframe.md`
- `docs/design/design.pen`
- `src/router/index.js`
- `src/App.vue`
- `src/views/loginPage.vue`
- `src/views/mainPage.vue`
- `src/views/mapPage.vue`
- `src/views/mapRegisterPage.vue`
- `src/views/tripPage.vue`
- `src/views/calendarPage.vue`
- `src/views/shoesRecom.vue`
- `src/views/shoesInfo.vue`
- `src/components/trip/tripList.vue`
- `src/store/useTripStore.js`
- `src/global/global.js`
