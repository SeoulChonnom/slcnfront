당신은 SLCN(Seoul Chonnom) 프론트엔드 전체를 새로 시각 설계하는 UI/UX 디자이너입니다.
구현 코드를 작성하지 말고, 첨부한 이미지들을 분석을 먼저 수행하고 그 다음
Desktop 1440px과 Mobile 390px 기준의 전체 페이지 디자인, 디자인 시스템, 공통 컴포넌트 상태, 핵심 사용자 흐름을 생성하세요.

A. 프로젝트 개요

서비스 이름: SLCN / Seoul Chonnom

서비스 목적:
서울 나들이 기록을 사진과 지도 중심으로 저장하고, 나들이 일정을 관리하며, 오래 걷기 좋은 신발 추천을 아카이브하는 개인형 포토 저널 서비스입니다. 생산성 대시보드가 아니라 “조용한 서울 포토 저널”처럼 보여야 합니다.

주요 사용자:

- 인증된 일반 사용자: 나들이 목록 조회, 퀴즈 풀이, 상세 지도 확인, 일정 확인, 신발 추천 탐색
- 관리자(admin): 일반 사용자 기능 + 새 나들이 기록 등록, 일정/캘린더 관리

핵심 시나리오:

1. 로그인한다.
2. 홈에서 나들이 기록, 일정, 신발 추천 중 하나로 이동한다.
3. 나들이 목록에서 검색 후 카드의 퀴즈를 풀고, 정답이면 상세 지도와 드라이브 링크를 본다.
4. 관리자는 나들이 등록 Wizard에서 기본 정보, 지도 파일, 퀴즈 정보를 입력해 기록을 저장한다.
5. 일정 화면에서 월간/주간 일정을 보고, 필터링하고, 일정과 캘린더를 생성/수정/삭제한다.
6. 신발 추천에서 브랜드별 상품을 보고 상세 이미지, 가격, 영상, 착용 후기를 확인한다.

원하는 브랜드 인상:
따뜻하고 개인적이며, 사진과 기록이 주인공인 조용한 에디토리얼 포토 저널. 귀엽고 사적인 톤은 유지하되, 낙서장/스크랩북처럼 산만하거나 장식적인 UI는 피하세요.

B. 전체 디자인 방향

디자인 콘셉트:
“A Quiet Seoul Photo Journal”
사진, 날짜, 장소, 짧은 기억을 잘 정리된 전시/여행책처럼 보여주는 디자인.

시각적 분위기:

- Calm, warm, editorial, content-first
- 인터페이스 장식은 절제하고 콘텐츠와 행동을 명확히 보여줄 것
- 카드가 떠다니는 랜딩 페이지가 아니라 실제 앱 화면으로 설계할 것

색상 원칙:

- Warm Paper: #FFF8F8를 기본 페이지 배경으로 사용
- Seoul Pink: #FE9FC8를 primary action, selection, progress, chip selected에 사용
- Ink: #1B1B1B를 본문/아이콘/강조 텍스트에 사용
- Pure White: #FFFFFF를 카드, 입력, 모달 등 읽기 표면에 사용
- Soft Pink: #FFE8EF, Muted Surface: #F8EEF1을 보조 그룹/empty state에 사용
- 에러: #D64545, 성공: #1F9D68, 경고: #F2A93B
- Seoul Pink 위 텍스트는 흰색이 아니라 Ink 사용
- gradient는 navigation shell 또는 아주 제한된 accent surface에만 사용. 전체 배경을 gradient로 채우지 말 것

타이포그래피:

- Inter/system-ui 기반
- Hero/section heading은 34~56px의 editorial hierarchy
- body는 16~17px, line-height 1.45~1.55
- display text는 과도하게 크지 않게, 모바일에서는 28~34px 중심
- 필기체/Comic Sans/handwriting 느낌 금지
- 숫자/날짜/가격은 tabular number 적용 권장

형태와 깊이:

- 일반 카드는 flat, 1px hairline 또는 surface 차이로 구분
- 일반 버튼/카드에 강한 shadow 금지
- 이미지, floating bar, modal에만 부드러운 shadow 허용
- radius: compact 8px, input 12px, card 18px, featured/modal/empty 24px, button/chip pill
- blob, 불규칙 radius, 회전 카드, sticker, 과도한 emoji 장식 금지

아이콘/이미지:

- 기존 SLCN 로고 이미지가 유일한 브랜드 마크. 새 텍스트 로고를 만들지 말 것
- 신발/나들이/지도 이미지를 실제 콘텐츠로 크게 보여줄 것
- 아이콘은 단독 의미가 명확해야 하며 label 또는 tooltip/aria-label 전제

애니메이션:

- 160~240ms, opacity/transform 중심
- prefers-reduced-motion 고려
- transition: all 금지
- modal/drawer는 자연스럽게 등장하되 입력 방해 금지

피해야 할 디자인:

- 마케팅 랜딩 페이지식 hero
- 장식용 gradient orb/blob
- 두꺼운 검정 테두리, 블록 그림자
- 카드 안의 카드 구조
- 모바일에서 단순 축소한 desktop layout
- 너무 많은 emoji와 장식 기호
- 클릭 가능한 요소가 구분되지 않는 디자인

C. 전체 정보 구조

전체 페이지:

1. Login: /main/login, /mobile/login
2. Home Hub: /main, /mobile
3. Trip List: /main/map, /mobile/map
4. Trip Quiz Modal: Trip List 내부
5. Trip Register Wizard: /main/map/register, /mobile/map/register
6. Trip Detail Map: /main/map/:id, /mobile/map/:id
7. Calendar Month: /main/calendar?date=YYYY-MM-DD, /mobile/calendar?date=YYYY-MM-DD
8. Calendar Week: /main/calendar/week?date=YYYY-MM-DD, /mobile/calendar/week?date=YYYY-MM-DD
9. Calendar Event Modal: Calendar 내부
10. Calendar Manage Modal: Calendar 내부
11. Shoes Catalog: /main/shoesRecom, /mobile/shoesRecom
12. Shoe Detail: /main/:brand/:shoesName, /mobile/:brand/:shoesName
13. Not Found: /main/404, /mobile/404
14. Route Loading
15. Auth Pending

Navigation:

- Desktop global header: logo, Home, 나들이, 달력, 신발, 필름 외부 링크, user/profile action
- Mobile top app bar: logo or back button + current page title
- Mobile bottom nav: Home, 나들이, 달력, 신발, 필름
- Mobile detail pages: Trip Register, Trip Detail, Shoe Detail은 back top bar 중심. 현재 코드는 홈으로 돌아가지만 새 디자인에서는 가능하면 이전 화면/목록으로 돌아가는 UX를 고려

인증:

- 로그인 전: Login만 접근 가능
- 보호 라우트 접근 시 auth pending 후 로그인 redirect
- 로그인 후 redirect query가 있으면 해당 화면으로 복귀

Desktop/Mobile:
현재는 /main과 /mobile 별도 Router로 분리되어 있지만, 새 디자인은 반응형 설계로 통합 가능하게 디자인하세요. 같은 정보 구조를 유지하되 Desktop은 넓은 grid/side-by-side, Mobile은 single-column, sticky bars, bottom sheets, horizontal chips를 사용하세요.

D. 페이지별 디자인 요청

1. Login (/main/login, /mobile/login)
   목적:
   사용자가 SLCN에 인증 후 원래 가려던 페이지 또는 홈으로 이동.

화면 구성:

- Warm Paper 배경
- 중앙 로그인 패널
- SLCN 로고 이미지
- 아이디 입력
- 비밀번호 입력
- 각 입력값 clear icon button
- Login primary button
- 오류 메시지 영역

핵심 컴포넌트:
Logo, Card, TextField, PasswordField, IconButton, Button, Inline Error

표시 데이터:
userName, password, login error message

사용자 행동:
아이디/비밀번호 입력, clear, submit

필요 상태:
기본, 입력 focus, clear disabled/enabled, submit loading, login error, authenticated redirect pending

반응형:
Desktop은 420~480px 폭의 안정적인 로그인 카드. Mobile은 390px에서 full-width에 가까운 카드, 키보드 노출 시 CTA가 가려지지 않게 설계.

시각적 우선순위:
로고 → 입력 필드 → Login CTA → 오류 메시지

주의:
영문 placeholder와 한국어 label 톤을 정리. 오류는 “무엇을 고쳐야 하는지” 알려줄 것.

2. Home Hub (/main, /mobile)
   목적:
   서비스의 주요 도메인으로 빠르게 이동.

화면 구성:
Desktop:

- Header
- 로고와 “서울 촌놈 나들이 기록” 소개 영역
- 6개 destination panel: D-day, Calendar, Map, Shoes, Film, 새 나들이 기록
- Footer

Mobile:

- Top app bar
- hero summary
- D-day / Film compact stats
- 나들이, calendar, shoes action tiles
- bottom nav

핵심 컴포넌트:
Global Header, Logo, Feature Panel, Stat, Action Tile, External Link, Footer/Mobile Bottom Nav

표시 데이터:
D-day count, panel labels, descriptions, external Film link

사용자 행동:
도메인 이동, 외부 필름 링크 열기, 새 나들이 기록으로 이동

필요 상태:
기본, hover/focus/active, 긴 제목, external link 표시

반응형:
Desktop은 3열 grid 또는 editorial dashboard. Mobile은 action list/card stack. 현재 별도 마크업을 하나의 일관된 IA로 재해석.

시각적 우선순위:
SLCN 브랜드 → 주요 도메인 3개(나들이/달력/신발) → D-day/Film → 새 기록

주의:
패널을 장식 카드처럼 만들지 말고 “앱 진입점”으로 명확하게 보이게 할 것. 새 기록은 admin 전용 노출 여부를 디자인에서 구분 가능하게 표시.

3. Trip List (/main/map, /mobile/map)
   목적:
   나들이 기록을 검색하고, 퀴즈를 통해 상세 지도에 접근.

화면 구성:

- Page heading: 서울 촌놈 나들이 기록
- 설명 copy
- 검색 입력: 날짜/나들이 이름/type 검색
- admin일 때 “새 나들이 기록하기”
- trip card list/grid
- 각 카드: 로고 이미지, 날짜, type tag, 이름, “퀴즈” 잠금 badge, 설명, 퀴즈 풀기 버튼
- 하단 copy
- Trip Quiz Modal

핵심 컴포넌트:
Page Header, Search Bar, Admin CTA, Trip Card, Image/Skeleton, Tag/Badge, Button, Empty State, Error State, Quiz Modal

표시 데이터:
Trip id, displayDate, type, name, logo file

사용자 행동:
검색, 새 기록 이동, 퀴즈 열기, 정답 후 상세 이동

필요 상태:
로딩 skeleton, API 오류 + retry, 전체 empty, 검색 결과 없음, 로고 이미지 로딩, card hover/focus, quiz loading/submitting/error/success/failure

반응형:
Desktop은 archive browsing이 가능하도록 2~3열 또는 넓은 single-column editorial feed 중 선택. Mobile은 큰 이미지와 CTA가 보이는 단일열.

시각적 우선순위:
나들이 이름과 이미지 → 날짜/type → 퀴즈 CTA → admin 등록 CTA

주의:
검색 결과 없음과 전체 empty를 시각적으로 구분. 카드 전체가 상세 이동이 아니라 퀴즈 버튼이 주 행동임을 명확히.

4. Trip Quiz Modal
   목적:
   나들이 상세 지도 접근 전 퀴즈를 풀게 함.

화면 구성:

- Modal title: 기본 “나들이 퀴즈” 또는 feedback title
- Description: quiz title or loading copy
- 보기 버튼 목록
- loading text
- error + retry
- feedback success/failure + CTA

핵심 컴포넌트:
Modal, Button List, Status Text, Error Message

표시 데이터:
tripName, quiz title, option id/text, feedback title/description/isCorrect

사용자 행동:
보기 선택, retry, close, success confirm으로 상세 이동

필요 상태:
loading, answer options, submitting disabled, answer check error, correct, incorrect

반응형:
Desktop은 centered modal. Mobile은 bottom sheet 또는 full-width modal, 터치 타깃 44px 이상.

시각적 우선순위:
질문 → 보기 → 결과 CTA

주의:
정답/오답은 색상뿐 아니라 icon/text로 구분. autoFocus가 모바일에서 불편하지 않게 처리.

5. Trip Register Wizard (/main/map/register, /mobile/map/register)
   목적:
   관리자가 나들이 기록을 생성.

화면 구성:

- Page title/description (Desktop)
- Step indicator: 기본 정보, 지도 정보, 퀴즈 정보
- Step 1: type radio(아영/일권), 날짜, 나들이 이름, 로고 파일 업로드
- Step 2: 지도 파일 업로드, 2번 지도 추가/삭제, 지도2 파일, 버튼1/버튼2 label, 드라이브 링크, hint
- Step 3: 퀴즈 제목, 보기 1~4, 정답 radio, 정답 제목/텍스트, 오답 제목/텍스트
- 이전/다음/저장 actions

핵심 컴포넌트:
Wizard Card, Step Progress, RadioGroup, Date Input, TextField, File Dropzone, Inline Error, Button Group

표시 데이터:
type, date, info2, logo, map1, hasSecondMap, map2, button1, button2, drive, quiz fields

사용자 행동:
필드 작성, 파일 선택/드래그, 2번 지도 toggle, step 이동, 저장

필요 상태:
각 필드 validation error, 파일 없음/형식 오류/10MB 초과, step active/completed, submit loading, submit error, success 후 목록 이동

반응형:
Desktop은 form section을 2열로 일부 분할 가능. Mobile은 한 step씩 단일열, progress는 compact top sticky 또는 card 상단에 배치.

시각적 우선순위:
현재 step → 필수 입력 → 오류 → next/save CTA

주의:
긴 form이므로 정보 그룹을 명확히. 파일 업로드는 선택된 파일명과 상태를 눈에 띄게 보여줄 것.

6. Trip Detail (/main/map/:id, /mobile/map/:id)
   목적:
   나들이 지도 이미지와 드라이브 링크 제공.

화면 구성:

- Page title: 서울 촌놈 나들이 경로
- description: 사진은 드라이브에서
- 두 지도 있을 때 map segmented switcher
- 지도 이미지 card
- Drive card: SLCN Drive, 사진은 드라이브에서, 암호: 입사일, 드라이브 링크 button

핵심 컴포넌트:
Page Header, Segmented Control, Image Viewer Card, Empty State, Skeleton, Drive CTA Card

표시 데이터:
firstMap, secondMap, nextButtonText, previousButtonText, driveUrl

사용자 행동:
지도 전환, 드라이브 링크 열기

필요 상태:
API loading, API error, map asset loading, map asset unavailable, single map, two maps

반응형:
Desktop은 지도 이미지를 큰 viewer로. Mobile은 pinch/zoom 또는 tap-to-open affordance를 고려. Drive card는 지도 아래 sticky CTA로도 가능.

시각적 우선순위:
지도 이미지 → map switcher → drive CTA

주의:
지도 이미지가 핵심이므로 과도한 카드 장식 금지. 이미지 없는 상태를 명확히.

7. Calendar Month (/main/calendar, /mobile/calendar)
   목적:
   월간 일정 조회/관리.

화면 구성:

- Calendar toolbar
- Eyebrow: 서울촌놈 나들이 일정
- Title: 현재 월 label
- 이전 / Today / 다음
- 월/주 segmented control
- 일정 추가 button
- 캘린더 필터 label + 관리 button
- calendar filter chips with color swatch
- FullCalendar month grid
- supplemental empty state

핵심 컴포넌트:
Calendar Toolbar, Date Nav, Segmented Control, Calendar Filter Chips, Month Grid, Event Pill, Empty/Error/Loading State

표시 데이터:
currentDate, label, calendars, visibleCalendarIds, schedules mapped to events

사용자 행동:
prev/today/next, 월/주 전환, 필터 toggle, 일정 추가, 날짜 클릭, 범위 선택, 이벤트 클릭, drag/drop, resize

필요 상태:
loading, API error, no calendars, no visible calendars, create disabled, read-only calendar, many events/day, event overflow

반응형:
Desktop은 calendar grid 중심. Mobile 390px은 단순 축소 금지. Compact month grid + 아래 agenda list 또는 day detail bottom sheet로 설계. 필터는 horizontal scroll chips.

시각적 우선순위:
현재 월 → 일정 event → 필터 상태 → 일정 추가

주의:
캘린더 event 색상은 사용자 지정 색상을 쓰되 텍스트 대비를 보장. 월간 event가 많을 때 overflow 상태 필요.

8. Calendar Week (/main/calendar/week, /mobile/calendar/week)
   목적:
   주간 시간대별 일정 조회/관리.

화면 구성:
Month와 동일 toolbar, time grid week view, 07:00~23:00 slots, now indicator, all-day row

핵심 컴포넌트:
Week Time Grid, Event Block, Toolbar, Filter Chips

표시 데이터:
weekly schedules, allDay, start/end, title, calendar color

사용자 행동:
시간 범위 선택, 일정 추가, 이벤트 클릭 수정, drag/drop, resize

필요 상태:
loading, error, empty filters, read-only events, dense overlapping events

반응형:
Desktop은 time grid. Mobile은 horizontal day tabs + selected day agenda 또는 scrollable week timeline 권장.

시각적 우선순위:
현재 주/오늘 → 시간대별 event → 빠른 생성

주의:
터치 환경에서 drag/resize가 어렵기 때문에 mobile은 event tap/edit 중심으로 설계.

9. Calendar Event Modal
   목적:
   일정 생성/수정/삭제.

화면 구성:

- Title: 일정 만들기 또는 일정 수정
- 캘린더 select
- 제목
- 설명 textarea
- 장소
- 종일 일정 checkbox
- 시작일/시작 시각/종료일/종료 시각
- error message
- 삭제(수정 모드), 취소, 저장

핵심 컴포넌트:
Modal/Sheet, Select, TextField, Textarea, Checkbox, Date/Time Inputs, Danger Button, Primary Button

표시 데이터:
calendarId, title, body, location, allDay, startDate/startTime, endDate/endTime

사용자 행동:
입력, 저장, 취소, 삭제

필요 상태:
create, edit, submitting, validation error, API error, delete confirm needed, disabled calendars

반응형:
Desktop centered modal. Mobile bottom sheet/full-screen form. 날짜/시간은 2열이 아니라 한 줄씩 읽기 쉽게.

시각적 우선순위:
제목 → 시간 → 캘린더 → 저장 CTA

주의:
삭제는 즉시 실행하지 말고 confirm 또는 undo flow를 디자인에 포함.

10. Calendar Manage Modal
    목적:
    캘린더 목록과 색상/권한 관리.

화면 구성:

- Modal title: 캘린더 만들기/수정
- 캘린더 목록 library
- 새 캘린더 button
- 캘린더 카드: color swatch, name, 수정 가능/읽기 전용 badge, active state
- Form: 이름, 배경 색상, 테두리 색상, 텍스트 색상, 정렬 순서
- Toggles: 전체 편집 허용, 시작 시간 이동 허용, 기간 변경 허용, 기본 선택 캘린더
- error
- 삭제/닫기/저장

핵심 컴포넌트:
Modal, Calendar List Card, Color Picker, Hex Input, Number Input, Switch/Checkbox, Badge, Button

표시 데이터:
calendar metadata: id, name, backgroundColor, borderColor, textColor, editable, startEditable, durationEditable, defaultSelected, sortOrder

사용자 행동:
새 캘린더 생성, 기존 캘린더 선택, 색상 변경, 권한 toggle, 저장, 삭제

필요 상태:
active selected, read-only badge, disabled dependent toggles, validation error, submit loading, delete confirm

반응형:
Desktop은 library와 form을 2 columns. Mobile은 tabs 또는 stacked sections.

시각적 우선순위:
캘린더 선택 상태 → 색상 preview → 저장/삭제

주의:
색상 선택은 실제 event preview chip을 함께 보여줘야 함.

11. Shoes Catalog (/main/shoesRecom, /mobile/shoesRecom)
    목적:
    브랜드별 신발 추천 탐색.

화면 구성:

- Desktop intro card: SLCN Shoes, 제목, 설명
- Brand navigation chips: 뉴발란스, 나이키, 아식스
- Brand section: brand logo/badge, brand name, description
- Shoe cards: shoe image, brand, name, desc, price, 상세 보기
- Desktop warning card: 가격 기준/구매 주의
- Empty state if catalog empty

핵심 컴포넌트:
Intro Section, Brand Anchor Nav, Brand Header, Shoe Card, Price, Warning Note, Empty State

표시 데이터:
brand name/desc/image, shoe name/desc/price/image

사용자 행동:
브랜드 앵커 이동, shoe detail 이동

필요 상태:
catalog empty, image missing/failure, long product name, hover/focus

반응형:
Desktop 3열 product grid. Mobile 1열 cards + sticky horizontal brand chips.

시각적 우선순위:
신발 이미지 → 상품명 → 가격 → 상세 보기

주의:
제품 이미지를 작게 가두지 말고 inspection 가능하게. 가격은 숫자 가독성 강화.

12. Shoe Detail (/main/:brand/:shoesName, /mobile/:brand/:shoesName)
    목적:
    신발 상세 정보, 영상, 착용 후기 확인.

화면 구성:

- Desktop header: eyebrow + “신발 추천으로 돌아가기”
- Warning: 사진을 클릭하면 링크로 이동합니다
- Hero: shoe image + summary card
- Summary: brand, shoe name, desc, price, facts list
- Optional video panel: video player and/or external video link
- Reviews section: 착용 후기, 여러 착용 샷, review image cards with captions
- Fallback: 존재하지 않는 신발입니다 + 돌아가기

핵심 컴포넌트:
Back Link, Warning Card, Product Hero, Fact List, Video Panel, Review Card, Fallback Card

표시 데이터:
brand, shoe name, desc, price, image, info[], videoLink, videoUrl, videoDesc, reviews[]

사용자 행동:
목록으로 돌아가기, video 재생, 영상 링크 열기, 후기 링크 열기

필요 상태:
valid detail, invalid slug fallback, no video, external image loading/failure, long facts/review caption

반응형:
Desktop image and summary side-by-side. Mobile image first, summary below, video/reviews single column.

시각적 우선순위:
제품 이미지 → 이름/가격 → facts → 영상 → 후기

주의:
외부 후기 링크임을 명확히. 이미지에 width/height 비율을 안정적으로 유지.

13. Not Found (/main/404, /mobile/404)
    목적:
    없는 경로에서 홈으로 복구.

화면 구성:

- Card
- 제목: 페이지를 찾을 수 없어요
- 설명
- 홈으로 돌아가기 button

핵심 컴포넌트:
Error/Empty Card, LinkButton

상태:
기본, hover/focus

반응형:
Desktop centered content. Mobile full-width card.

14. Route Loading / Auth Pending
    목적:
    lazy loading과 session restore 중 사용자에게 상태 제공.

화면 구성:

- Loading card or skeleton
- Auth pending text: 세션을 확인하고 있어요
- aria-live polite 고려

상태:
route loading, session hydrating/restoring

반응형:
짧고 안정적인 placeholder. 화면 흔들림 없이 유지.

E. 공통 컴포넌트 요청

필수 컴포넌트:

1. Button

- variants: primary, secondary, ghost, danger
- sizes: sm, md, lg
- states: default, hover, active, focus-visible, disabled, loading, full-width
- touch target 44px 이상

2. Input / Textarea

- label, required, placeholder, hint, error
- states: default, hover, focus-visible, disabled, invalid, filled
- trailing icon button 지원

3. Select

- calendar selector용
- default, disabled, focus, error

4. Checkbox / Switch

- all-day, calendar permissions용
- label과 control이 하나의 hit target
- disabled dependent state 필요

5. Radio

- trip type, quiz answer
- selected/unselected/error

6. Tabs / Segmented Control

- calendar month/week
- map1/map2
- active/inactive/focus/disabled

7. Card

- default, muted, pink, product, trip, warning, fallback
- 일반 card는 shadow 없이 surface/border로 구분

8. List/Grid

- trip card list, shoe product grid, review grid, calendar library list

9. Badge/Chip

- trip tags, quiz lock, calendar filter, editable/read-only badge, brand nav chip
- active/inactive, color swatch, long text

10. Modal / Drawer / Bottom Sheet

- desktop modal, mobile sheet/full-screen form
- title, description, close, backdrop, focus trap
- destructive confirm state

11. Toast

- 현재 코드에는 없지만 저장/삭제 성공 feedback에 재사용 가치가 높음. 디자인 시스템에는 optional feedback component로 포함.

12. Tooltip

- 아이콘 버튼/색상/외부 링크 설명에 필요한 경우만 사용.

13. Empty State

- no trip, no search results, no calendars, no visible calendars, no shoes
- icon, title, description, optional action

14. Loading State

- route loading, card skeleton, calendar skeleton, image skeleton, button spinner

15. Error State

- API error + retry, form inline error, invalid detail fallback

추가하지 말 것:

- Pagination/Table은 현재 주요 화면에 필요하지 않음. 일정/상품이 크게 늘어나는 future state로만 고려.

F. 반응형 디자인 요청

Desktop 1440px:

- max content width는 1080px standard와 1440px wide visual을 구분
- Header는 56px sticky, translucent Warm Paper
- Home은 도메인 entry grid
- Trip list는 이미지 중심 card grid 또는 editorial feed
- Calendar는 full grid 사용
- Shoes catalog는 3열 product grid
- Detail pages는 image/content side-by-side

Mobile 390px:

- top app bar 56px, bottom nav 64px 내외
- safe-area inset 고려
- main padding 16~20px
- 모든 주요 CTA 44px 이상
- Card/list는 단일열
- Calendar는 desktop grid 단순 축소 금지: compact month + agenda 또는 day sheet로 재구성
- Modal은 bottom sheet 또는 full-screen form
- filter/brand chips는 horizontal scroll
- keyboard가 뜨는 form 화면에서 CTA가 가려지지 않도록 설계

G. 결과물 요청

다음 결과물을 생성하세요:

1. 전체 페이지 디자인
2. Desktop 1440px 버전
3. Mobile 390px 버전
4. 디자인 시스템
5. 컬러 스타일과 타이포그래피 스타일
6. 공통 컴포넌트와 모든 상태
7. Loading / Empty / Error / No Result 화면
8. Calendar event modal, calendar manage modal, trip quiz modal
9. Trip register 3-step wizard
10. 핵심 사용자 흐름: login → home → trip quiz → trip detail, admin trip register, calendar create/edit, shoes catalog → shoe detail
11. 페이지 간 일관된 layout, spacing, navigation rules

최종 디자인은 구현 코드가 아니라 시각 결과물이어야 합니다. 단, 위 라우트와 화면 상태를 빠뜨리지 말고, 실제 앱으로 사용할 수 있는 수준의 상세 화면을 만들어주세요.
