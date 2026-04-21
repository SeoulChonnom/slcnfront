# IA 기반 반응형 와이어프레임(Markdown) 생성

## 역할

너는 시니어 UX 디자이너 + 프론트엔드 아키텍트다.
내가 제공하는 정보구조도(IA: 사이트맵/화면목록/사용자플로우/화면별 카드) 를 기반으로, 제품의 와이어프레임을 Markdown 문서로 작성하라.
이 문서는 이후 UI/UX 개선과 개발 구현의 기준 문서로 사용된다.

## 핵심 원칙(Constraints)

PC / Mobile 화면을 분리해서 제시하라. (반응형 관점에서 레이아웃과 정보 밀도를 다르게)

기존 UI를 참고해도 되지만, 더 좋은 방향이면 완전히 새로 갈아엎어도 된다.

화면은 IA에 있는 라우트/화면을 기준으로 하되, UX 상 필요하면 보조 화면(Empty/Error/Onboarding/설정 등) 을 추가 제안할 수 있다.

결과물은 Markdown 1개 문서로, 개발자가 바로 참고할 수 있도록 구조적으로 작성하라.

“추측”은 최소화하고, IA 근거를 최대한 반영하라. IA에 없는 내용은 “가정”으로 명시하라.

## 입력(Input)

- 정보구조도(IA) 분석 내용: docs/ia_report.md
- 기존 UI 스크린샷/설명: docs/scr/

## 산출물(Output) 문서 형식

0. 문서 헤더

제품/프로젝트명(알 수 없으면 “Unknown”)

작성 목적: IA 기반 와이어프레임

범위: PC/Mobile

## 가정/제약 사항

1. 전체 레이아웃 시스템(PC/Mobile 분리)

1.1 PC 레이아웃

Global Header / Side Navigation / Content / Footer 구성

Grid(예: 12컬럼), 컨테이너 max-width 가정

공통 컴포넌트: 버튼, 입력, 카드, 테이블, 모달, 토스트, 탭 등

상태 UX: Loading / Empty / Error / Permission Denied 기본 패턴

1.2 Mobile 레이아웃

Top App Bar / Bottom Nav(필요 시) / Drawer

스크롤 구조(고정 CTA, sticky header 등)

터치 타겟, 입력 폼 UX(키보드, 포커스) 고려

상태 UX: Loading / Empty / Error 기본 패턴

각 레이아웃은 “왜 이렇게 했는지”를 3~5줄로 설명하라.

2. 네비게이션 & IA 매핑

사이트맵(IA) → 실제 내비게이션(메뉴/탭/바텀네비)로 매핑

메뉴 구조 표:

메뉴명 / 연결 라우트 / PC 위치 / Mobile 위치 / 노출 조건(로그인 등)

3. 화면별 와이어프레임(가장 중요)

IA에 있는 화면(라우트) 전부를 대상으로 아래 템플릿을 사용해 작성하라.

[Screen] 화면명 (Route: /xxx)

목적(Goal): 1문장
주요 사용자 시나리오: 2~4개 bullet
필수 데이터: API/스토어/URL state
핵심 KPI(선택): 전환/완료율 등

3.1 PC Wireframe

레이아웃 스케치(ASCII 와이어프레임) 를 포함하라.

섹션 단위로 구성(예: Summary / Filter / List / Detail / CTA)

컴포넌트 목록(재사용/페이지 전용 구분)

인터랙션(클릭/hover/shortcut/drag 등)

상태 UX(loading/empty/error) 각각의 화면 구성

예시 형식(ASCII):

[Header]
[SideNav] | [Page Title + Primary CTA]
| [Filters: search | dropdown | chips]
| [Content]
| - [List/Table/Card...]
| [Pagination / Infinite scroll]
| [Footer]
3.2 Mobile Wireframe

레이아웃 스케치(ASCII) 포함

정보 밀도 축소, 단계 분리(필요 시)

하단 고정 CTA / 바텀시트 / 풀스크린 모달 등 모바일 패턴 활용

상태 UX(loading/empty/error) 포함

예시:

[Top App Bar: Title + actions]
[Search]
[Filter Chips (horizontal scroll)]
[List Cards]
[Bottom CTA / Bottom Nav]
3.3 행동/전환 설계

Primary CTA 1개, Secondary CTA 1~2개

폼이면 검증/에러 문구/완료 후 이동까지 명시

“뒤로가기/취소” 규칙

3.4 접근성/반응형 주의사항

키보드 탐색, aria, 대비, 포커스

모바일 터치 영역, 스크롤, 입력 UX

4. 사용자 플로우 와이어(PC/Mobile 공통)

IA의 대표 플로우를 가져와 다음을 작성:

플로우 이름

단계별 화면 전환

실패/예외 분기(권한없음, 네트워크 에러, 빈 데이터)

가능하면 Mermaid 다이어그램 포함:

5. 전면 개편 옵션(선택 섹션)

“기존 UI를 일부만 개선하는 안” vs “완전히 갈아엎는 안” 2가지 방향을 제시

각 방향별 장단점, 리스크, 추천 이유

6. 최종 체크리스트

IA의 모든 화면이 와이어프레임에 포함되었는가?

PC/Mobile이 모두 존재하는가?

각 화면에 Loading/Empty/Error가 정의되어 있는가?

CTA/폼 검증/전환이 정의되어 있는가?

## 출력 규칙

결과는 Markdown 파일로 출력하라(설명 문장 포함 가능, JSON 금지).

가능한 IA의 라우트/화면명을 그대로 사용하라.

불확실한 부분은 “가정:”으로 표시하라.
