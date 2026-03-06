# Frontend 리팩토링용 컴포넌트 설계 프롬프트 설계 문서

## 1. 이 문서의 목적

`docs/prompts/front_component_refactor.md`를 실행 가능한 수준으로 정제해, UI/UX 개선 및 Vue/JS → React/TS 전환 작업에서 반복적으로 사용할 수 있는 **프롬프트 템플릿**을 만든다.

- 목적: AI가 생성한 화면 기반 산출물을 검토해도 **실무 구현 가능한 마이그레이션 설계서**를 일관되게 출력
- 사용 대상: 팀 내 프론트엔드 아키텍트, 프론트 개발자, PM/디자인 리뷰어
- 출력 포맷: Markdown 단일 문서

## 2. 프롬프트 역할 정의

**System Role(고정):**

- 너는 Senior Frontend Architect이자 UX/접근성 리뷰어다.
- Vue+JS 레거시 화면을 React+TypeScript 관점으로 재설계할 수 있다.
- 단순 번역이 아니라, **공통 컴포넌트화, 상태 설계, 라우팅/네비게이션 정합성, 접근성**까지 제안한다.

**Goal:**

- 제공된 디자인/HTML 근거를 바탕으로 화면 단위/컴포넌트 단위 구현 설계서를 작성한다.
- AI 생성 결과물의 화면별 UI 편차를 `App Shell` 중심의 통합 정책으로 수렴한다.

## 3. 입력 계약 (Input Contract)

아래 입력이 들어올 때만 실행한다.

- `docs/redesign/{PAGE_NAME}/screen.png` (스크린샷)
- `docs/redesign/{PAGE_NAME}/code.html` (HTML 기준)
- `docs/ia_report.md`, `docs/wireframe.md` (보조 참고; 최상위 근거는 A/B)
- 선택: 현재 라우트 목록, API 문서, 디자인 토큰(없으면 TBD 처리)

### 3.1 우선순위

1. **1순위**: A(스크린샷)와 B(HTML)
2. **2순위**: 기존 IA/기능 흐름
3. **3순위**: 기존 Vue 코드 패턴

## 4. 출력 목표 (Output Objectives)

- 결과는 **구현 가능한** 설계서여야 함.
- 추측이 필요하면 반드시 `가정(Assumption)`으로 명시.
- 공통 컴포넌트 후보는 반복 패턴 추출 기반으로 제시.
- 접근성(A11y) 체크포인트를 컴포넌트/레이아웃 단위로 반영.

## 5. 고정 목차 (원본 유지, 확장만 허용)

아래 12개 섹션은 반드시 유지하고, 필요 시 하위 항목을 추가한다.

- 문서 메타
- 목표 및 범위
- 화면/기능 인벤토리
- IA/레이아웃 통합 제안(App Shell)
- 컴포넌트 아키텍처 개요(React Design Patterns 준수)
- 컴포넌트 분해(핵심 섹션)
- 상태/데이터 설계
- 라우팅/네비게이션 설계
- 스타일링/디자인 시스템
- 파일/폴더 구조(React + TS)
- 구현 체크리스트 & 단계적 마이그레이션 플랜
- 리스크 & 오픈 이슈
- 부록

## 6. 각 섹션 출력 지침

### 6.1 문서 메타

- 작성일, 대상 프로젝트명, 작성자, 전환 범위, 참고 자료 개수
- `TODO` 대신 증거 기반 값이 있으면 채우기, 없으면 `TBD`

### 6.2 화면/기능 인벤토리

- 표 형식 강제(예: Screen/Route/Primary Actions/Data/Notes)
- 각 화면의 네비게이션 진입/이탈을 1줄 이상 기재
- HTML 파일 상 존재 요소, 라우트 추론 근거를 각 행에 짧게 기재

### 6.3 App Shell 통합

- GNB/Footer의 화면별 편차를 나열하고, 통일 규칙 1개 + 예외 규칙 1개 이상 제시
- Breakpoint별 높이/간격/안전영역 고려

### 6.4 컴포넌트 아키텍처

- 다음 패턴을 페이지 성격별로 분기 적용 판단
  - Compound Components
  - Presentational/Container
  - Custom Hooks
  - Controlled/Uncontrolled
  - Context + Reducer
  - (필요 시) Render Props, Polymorphic
- 왜 해당 패턴이 적합한지 “적용 근거” 1문장 이상 필수

### 6.5 컴포넌트 분해

- 페이지별 컴포넌트 트리 + 공유 컴포넌트 후보를 중복도 기준으로 분리
- 공통 컴포넌트 후보는 `우선순위`, `도입 비용`, `기대 효과`를 함께 표기

### 6.6 상태/데이터 설계

- 서버 상태/클라이언트 UI 상태/폼 상태 분리 제안
- 비동기 처리: 로딩/재시도/에러/빈 데이터/부분 업데이트 정책 제시
- DTO/도메인 타입 분리 여부와 타입 네이밍 규칙 제시

### 6.7 라우팅/네비게이션

- Route 설계는 기존 권한/가드/리다이렉트 패턴을 반영
- 에러/404/권한 없음 경로 처리 위치 정의
- 앱 공통 레이아웃 배치: 루트 Layout vs 페이지 Layout 분리

### 6.8 스타일링/디자인 시스템

- 사용 스택 후보를 2개까지 제시하고 최종 1개를 추천
- 색·타입·간격 토큰 테이블(최소 8개 항목) 요구
- 반응형 정책: 모바일/태블릿/PC의 주요 breakpoints 제시

### 6.9 마이그레이션 플랜

각 단계는 다음을 반드시 포함

- Done 기준(Done of Definition)
- 리스크와 완화책
- 검증 포인트(컴포넌트 단위 테스트, 통합 테스트, 시각 회귀 등)

## 7. 강제 출력 규칙

- `any` 사용은 피하고, Props/이벤트/상태 타입을 구체적으로 제시.
- 불가능/근거 없음은 “확인 불가(근거 없음)”로 명시.
- HTML/이미지 근거 기반이 아닌 추정은 `Assumption` 블록으로 분리.
- Markdown 외 형식(표도 가능) 금지, JSON 금지.
- GNB/Footer/로고는 화면마다 다르게 보이더라도 최종 출력에서 **통합 원칙 우선**으로 정리.

## 8. 실행용 프롬프트 템플릿 (복사해 바로 사용)

```text
너는 Senior Frontend Architect이자 UI/UX Engineer다.
다음 입력(스크린샷 + HTML + 보조 메모)을 기반으로 Vue+JS → React+TypeScript 전환 관점의
구현 가능한 컴포넌트 설계 문서를 작성한다.

[입력]
- 디자인 스크린샷: docs/redesign/{PAGE_NAME}/screen.png
- HTML: docs/redesign/{PAGE_NAME}/code.html
- 보조문서: docs/ia_report.md, docs/wireframe.md

[요구사항]
1) 문서 목차는 기존 파일(front_component_refactor.md)의 0~12번 구조를 유지한다.
2) 추측이 필요하면 반드시 "가정(Assumption)"으로 분리한다.
3) 공통 UI(GNB/Footer/로고 등)는 화면별 편차를 정리 후 App Shell 통합 정책으로 정리한다.
4) 각 컴포넌트는 Responsibility, Props 타입, State, 이벤트, Accessibility notes를 작성한다.
5) React Design Patterns 적용 판단을 반드시 포함하고, 타입 안정성(any 금지) 원칙을 따른다.
6) 결과는 구현 가능한 수준으로 작성하고, 단계별 DoD와 리스크 대응까지 포함한다.

[출력 형식]
- Markdown
- 표(컴포넌트 카탈로그/화면 인벤토리) 우선 사용
- 근거가 약한 항목은 TBD/Assumption으로 표시
```

## 9. 산출물 검수 체크리스트

- [ ] 0~12 섹션 존재
- [ ] 화면 인벤토리 표 완성(누락 화면 0개)
- [ ] App Shell 통합 규칙 존재 + 예외 규칙 존재
- [ ] 공통 컴포넌트 후보가 5개 이상 제시됨
- [ ] 타입/접근성/마이그레이션 단계별 DoD가 존재

## 10. 사용 예시

```bash
node scripts/run-doc-prompt.js \
  --prompt docs/prompts/front_component_refactor_prompt_design.md \
  --input docs/redesign/main \
  --out docs/design/main_component_design.md
```

위 예시는 자동화 스크립트 연동 시 프롬프트 텍스트를 읽어 출력물을 생성할 때의 예시이다. (구체 구현은 환경에 맞게 변경)

## 11. 후속 액션 제안

- 기존 `front_component_refactor.md`를 이 템플릿에 맞춰 LLM 호출용 프롬프트로 래핑
- 결과물 정합성을 위해 `docs/redesign` 산출물과 `ia_report.md` 동기화
- 첫 1회 실행 결과를 기준으로 항목별 템플릿 보정(불필요한 항목/누락 항목 정리)
