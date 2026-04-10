# Step 03. Design System And Pencil Mapping

## 1. 목적

Pencil 디자인을 React/Tailwind 컴포넌트 시스템으로 번역하는 단계다. 이 단계가 끝나면 구현자는 각 화면을 새로 디자인하지 않고, 정의된 토큰과 공통 컴포넌트만 조합하면 된다.

## 2. 범위

- Pencil 디자인 토큰 추출
- 공통 UI primitive 정의
- 공통 layout component 정의
- PC/Mobile shell 시각 규칙 정리
- 접근성 규칙 고정

## 3. 참조 소스

- `docs/design/design.pen`
- `docs/redesign/*`
- `docs/react_component_plan.md`
- `docs/frontend_component_design.md`

## 4. 확정 결정

- 디자인 방향은 Pencil 기준의 핑크/블랙 중심 브랜딩을 유지한다.
- Tailwind utility로 구현하되, 반복되는 class 조합은 재사용 컴포넌트로 감싼다.
- 공통 UI primitive는 도메인보다 먼저 만든다.
- PC와 Mobile은 토큰은 공유하되 레이아웃과 navigation component는 분리한다.

## 5. 구현 대상

### 5.1 토큰

최소 아래 토큰을 정의한다.

- 색상
  - `--color-brand-pink: #FE9FC8`
  - `--color-ink: #000000`
  - `--color-surface: #FFFFFF`
  - `--color-ink-muted`
  - `--color-border-strong`
  - `--color-success`
  - `--color-error`
  - `--color-warning`
- 타이포
  - display: `Patrick Hand`
  - body: `Plus Jakarta Sans`
  - caption: `Plus Jakarta Sans`
- spacing
  - 4, 8, 12, 16, 20, 24, 32, 40
- radius
  - sm / md / lg / pill / blob-like card
- shadow / border thickness

### 5.2 Pencil reusable component → React 매핑

| Pencil 컴포넌트 | React 컴포넌트 | 위치 |
| --- | --- | --- |
| `cmp/ButtonPrimary` | `components/ui/Button.tsx` | 공통 |
| `cmp/ButtonSecondary` | `components/ui/Button.tsx` variant | 공통 |
| `cmp/TextInput` | `components/ui/TextField.tsx` | 공통 |
| `cmp/UploadDropzone` | `components/ui/FileDropzone.tsx` | 공통 |
| `cmp/QuizUnlockModal` | `components/ui/QuizModal.tsx` | 공통 |
| `cmp/GlobalHeader` | `components/layout/DesktopHeader.tsx` | PC |
| `cmp/GlobalFooter` | `components/layout/Footer.tsx` | 공통 |
| `cmp/MobileTopAppBar` | `components/layout/MobileTopBar.tsx` | Mobile |
| `cmp/MobileBottomNav` | `components/layout/MobileBottomNav.tsx` | Mobile |
| `cmp/CalendarViewToggle` | `components/ui/CalendarViewToggle.tsx` | 캘린더 |

### 5.3 공통 primitive

- `Button`
- `IconButton`
- `TextField`
- `Textarea`
- `RadioGroup`
- `SegmentedControl`
- `Modal`
- `Card`
- `FeatureCard`
- `FileDropzone`
- `PageSectionHeader`
- `EmptyState`
- `ErrorState`
- `Skeleton`

## 6. 파일/폴더 목표 구조

```text
src/
  components/
    layout/
      DesktopHeader.tsx
      Footer.tsx
      MobileBottomNav.tsx
      MobileTopBar.tsx
    ui/
      Button.tsx
      Card.tsx
      EmptyState.tsx
      ErrorState.tsx
      FileDropzone.tsx
      Modal.tsx
      RadioGroup.tsx
      SegmentedControl.tsx
      Skeleton.tsx
      TextField.tsx
  styles/
    tokens.css
    utilities.css
```

## 7. 타입/API/라우트 계약

이 단계에서는 API 계약을 만들지 않는다. 대신 아래 UI 계약을 고정한다.

### 7.1 Button 계약

- variant: `primary | secondary | ghost | danger`
- size: `sm | md | lg`
- link 대응은 지원한다.
- 버튼 합성 패턴은 `asChild`를 쓰지 않고 명시적 `ButtonLink` 또는 `LinkButton` wrapper로 고정한다.

### 7.2 TextField 계약

- label, hint, error, required, disabled, leading/trailing affordance 지원
- 파일 입력과 일반 입력은 분리한다

### 7.3 Modal 계약

- ESC 닫기
- 포커스 트랩
- aria-labelledby / aria-describedby 지원

## 8. 작업 순서

1. Pencil의 reusable component와 top-level screen을 매핑한다.
2. `tokens.css`와 Tailwind theme 확장값을 정의한다.
3. layout component를 먼저 만든다.
4. 공통 UI primitive를 만든다.
5. 로딩/빈/에러 상태용 공통 컴포넌트를 만든다.
6. 접근성 속성과 keyboard interaction 규칙을 테스트한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `Button.test.tsx`
  - variant/disabled/click/aria 검증
- `TextField.test.tsx`
  - label 연결, 에러 메시지, required 상태 검증
- `Modal.test.tsx`
  - 열기/닫기/ESC/포커스 이동 검증
- `MobileBottomNav.test.tsx`
  - 활성 상태와 라벨 노출 검증
- `DesktopHeader.test.tsx`
  - 주요 내비게이션 항목 렌더링 검증

테스트 게이트:

- 공통 primitive 테스트 통과 전 도메인 화면 구현 금지

## 10. 완료 기준

- 구현자가 Pencil을 다시 열지 않아도 공통 UI를 조합할 수 있다.
- PC/Mobile 공통 스타일 언어가 코드 레벨로 정리되어 있다.
- 접근성 규칙이 primitive 수준에서 반영되어 있다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- Tailwind utility가 너무 길어질 수 있다.
  - 해결: 반복 조합은 컴포넌트 내부로 숨긴다.
- blob-like 비정형 카드 형태는 완전 동일 복제가 어려울 수 있다.
  - 해결: 핵심 인상만 유지하고 안정적인 border-radius/shape로 근사한다.
- 폰트 로딩 방식이 불명확하면 초기 렌더와 테스트가 흔들릴 수 있다.
  - 해결: display/body 폰트는 Step 02에서 import 경로까지 고정하고 fallback stack도 같이 선언한다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- 퍼블리셔 메인
- FE는 접근성/재사용성 리뷰 담당

### 권장 스킬

- `frontend-design`

### 권장 MCP / 도구

- Pencil MCP
  - `get_editor_state`
  - `batch_get`
  - 필요 시 `get_screenshot`

### 구현 주의사항

- 도메인 전용 스타일을 이 단계로 끌어오지 않는다.
- primitive는 앞으로 trip/calendar/shoes에서 모두 재사용될 수 있어야 한다.
