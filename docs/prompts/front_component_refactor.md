# 컴포넌트 설계 문서(Component Design Doc) 생성 프롬프트

너는 **Senior Frontend Architect**이자 **UI/UX Engineer**야.  
내가 제공하는 **웹 디자인 이미지(스크린샷)** 와 **HTML 파일(또는 HTML 코드)** 을 기반으로, 기존 프로젝트의 UI/UX 개선 결과물을 **React + TypeScript 전환 관점**에서 분석하고, **구현 가능한 컴포넌트 설계 문서**를 **Markdown**으로 작성해줘.

---

## 1) 프로젝트 전환 맥락(반드시 반영)

- 기존: **Vue + JavaScript**
- 신규: **React + TypeScript**
- 라이브러리도 변경 예정(필요 시 추천 가능)
- AI가 자동 생성한 결과물이라 **GNB / Footer / 공통 UI 배치가 화면별로 약간 다를 수 있음**
  - 실제 리팩토링 전에는 GNB, Footer, 로고 등등을 통일할거야.
  - 문서에서는 화면별 편차를 지적하되, 최종적으로는 **통일 가능한 공통 레이아웃/쉘(App Shell) 구조**로 정리해줘.
- 결과 문서는 반드시 **Markdown**으로 작성해줘.
- 구현은 **“React Design Patterns”** 를 잘 만족하도록 설계해줘.
  - 예: Compound Components, Presentational/Container, Custom Hooks, Controlled/Uncontrolled, Render Props(필요 시), Context + Reducer, Polymorphic components(필요 시), Composition 우선 등

---

## 2) 입력 제공 형식(내가 제공할 자료)

아래 제공된 자료들을 “근거”로 분석해줘.

- **(A) 디자인 이미지**: docs/redesign/{PAGE_NAME}/screen.png
- **(B) HTML**: docs/redesign/{PAGE_NAME}/code.html
- **(C) 추가 메모(선택)**: ia_report.md, wireframe.md(임시 wireframe 문서임으로 참고만 최종 디자인은 A,B 문서로 채택)

---

## 3) 출력 문서 요구사항(Markdown 구조 고정)

아래 목차를 **그대로 유지**해서 Markdown 문서를 작성해줘.  
(내용이 없으면 “TBD”로 남기되, 최대한 채워줘)

---

# 0. 문서 메타

- 작성일:
- 대상 프로젝트:
- 작성자(Assistant):
- 전환 범위: Vue+JS → React+TS
- 참고 자료: (이미지 n개 / HTML n개)

# 1. 목표 및 범위

## 1.1 목표(UI/UX + 기술 전환)

## 1.2 비목표(이번 전환에서 하지 않을 것)

## 1.3 전환 가정/제약(예: 일정, 기존 API 유지 여부 등)

# 2. 화면/기능 인벤토리

- 화면 목록(페이지 단위)
- 각 화면의 목적 / 주요 컴포넌트 / 사용자 액션
- 화면 간 네비게이션(간단한 플로우)

> 표로 정리:

- Screen
- Route(예상)
- Primary Actions
- Data Dependencies(예상)
- Notes(레이아웃 불일치 등)

# 3. IA/레이아웃 통합 제안(App Shell)

## 3.1 공통 레이아웃 정책

- GNB 규칙(위치/높이/브레이크포인트)
- Footer 규칙
- Container/Spacing 규칙

## 3.2 화면별 편차 정리 및 통합 방안

- “AI 생성 결과물 편차”를 어떻게 수렴할지 원칙 제시

# 4. 컴포넌트 아키텍처 개요(React Design Patterns 준수)

## 4.1 설계 원칙

- Composition over Inheritance
- 단방향 데이터 흐름
- 상태 최소화/상태 위치 원칙
- 접근성(A11y) 기본 원칙
- 타입 안정성(TypeScript) 원칙

## 4.2 패턴 선택 가이드(본 프로젝트 기준)

- Presentational vs Container: 어디까지 분리할지
- Compound Components: 적용 대상(예: Tabs, Dropdown, Nav, Form Field)
- Custom Hooks: 데이터/상태/이벤트 캡슐화 기준
- Controlled/Uncontrolled: Form/Input 컴포넌트 정책
- Context + Reducer: 전역 UI 상태/세션/테마/토스트 등

# 5. 컴포넌트 분해(핵심 섹션)

## 5.1 컴포넌트 트리(페이지별)

- 각 Screen 별로:
  - Page 컴포넌트
  - Layout/Section 컴포넌트
  - UI 컴포넌트(atomic)
  - 공유 컴포넌트

## 5.2 컴포넌트 카탈로그(표)

각 컴포넌트에 대해 아래 필드를 포함해 표로 작성해줘.

- Component Name
- Responsibility
- Props(타입 포함)
- State(있다면)
- Events/Callbacks
- Variants(디자인 변형)
- Accessibility Notes
- Reusability Level(High/Med/Low)
- Related Pattern(Compound/Hook/Container 등)

## 5.3 “공통 컴포넌트 후보” 식별

- Button, Input, Select, Modal, Toast, Card, Table 등
- 공통화 우선순위와 이유(중복도/변형 난이도/사용 빈도)

# 6. 상태/데이터 설계

## 6.1 상태 분류

- 서버 상태(Server state)
- 클라이언트 UI 상태(UI state)
- 폼 상태(Form state)

## 6.2 상태 관리 전략(추천 포함)

- React Query/SWR 등 서버 상태 관리 도구를 쓸지(추천 가능)
- Context/Reducer vs 외부 상태관리(Zustand/Redux 등) 선택 기준
- 캐싱/동기화/에러 처리/로딩 UX 전략

## 6.3 타입 설계(TypeScript)

- 도메인 타입/DTO 타입 분리 여부
- 공통 타입 폴더 구조 제안
- API 응답 타입/런타임 밸리데이션(zod 등) 제안(선택)

# 7. 라우팅/네비게이션 설계

- Route 구조 제안
- Nested routes 필요 여부
- 인증/권한(있다면) 처리 위치
- Error route / NotFound / Boundary 전략

# 8. 스타일링/디자인 시스템

## 8.1 스타일링 방식 제안

- CSS Modules / styled-components / Tailwind / MUI 등(선택지 + 추천)

## 8.2 토큰/테마

- color / spacing / typography 토큰화
- 다크모드(필요 시)

## 8.3 반응형 정책

- Breakpoints
- 모바일/PC 레이아웃 차이 관리 방식

# 9. 파일/폴더 구조(React + TS 기준)

아래를 포함해 제안해줘.

- features 기반(또는 routes 기반) 구조
- shared(ui/components/hooks/utils) 구조
- assets, styles, types, api 계층

예시 트리:

- src/
  - app/
  - pages(or routes)/
  - features/
  - shared/
  - entities/
  - widgets/
  - api/
  - styles/
  - types/

# 10. 구현 체크리스트 & 단계적 마이그레이션 플랜

- 1단계: 레이아웃 통일(App Shell)
- 2단계: 공통 UI 컴포넌트 구축
- 3단계: 페이지 단위 이관
- 4단계: 상태/데이터 계층 정리
- 5단계: 접근성/성능/테스트 보강

각 단계별:

- Done 정의(Definition of Done)
- 리스크/대응

# 11. 리스크 & 오픈 이슈

- AI 생성 결과물의 불일치로 인한 리스크
- 디자인 시스템 부재 리스크
- 라이브러리 변경 리스크
- 성능/번들 사이즈 리스크 등

# 12. 부록

- 용어 정리
- 참고 링크(필요 시 “React Design Patterns” 관련 개념을 간단히 요약)

---

## 4) 작성 규칙(중요)

- 문서는 “구현 가능한 수준”으로 구체적으로 작성해.
- **추측이 필요한 부분은 반드시 ‘가정(Assumption)’으로 표시**해.
- HTML/이미지에서 발견한 반복 요소를 근거로 **공통 컴포넌트 후보를 적극적으로 추출**해.
- GNB/Footer 같은 공통 레이아웃은 화면별 불일치를 그대로 따르지 말고,
  **통합 정책 + 예외 처리 방식**으로 설계해.
- TypeScript는 `any`를 최대한 피하고, Props/Events 타입을 명시해.
- 접근성(A11y): button role, aria-label, focus ring, keyboard navigation 등 기본 체크를 포함해.

---

## 5) 이제 시작

너는 즉시 위 목차대로 Markdown 설계 문서를 작성해줘.
