# Step 03. Shared Modal Behavior Hardening

## 1. 목적

공통 `Modal` primitive의 키보드/포커스/닫기 동작 계약을 테스트와 구현으로 고정하는 단계다. 이 단계의 목적은 custom modal을 당장 교체하는 것이 아니라, 현재 구현을 장기적으로 유지할 수 있을 만큼 안정화하는 것이다.

이 단계가 끝나면 Modal을 사용하는 feature 구현자는 포커스 복귀, ESC 닫기, Tab loop, backdrop 닫기 같은 기본 동작을 다시 구현하거나 추측하지 않아야 한다.

## 2. 범위

- `src/components/ui/Modal.tsx` 공통 동작 보강
- Modal 관련 테스트 확대
- 실제 consumer 두 곳에서 회귀 확인
  - `CalendarEventModal.tsx`
  - `TripQuizModal.tsx`

이번 단계에서는 modal design을 갈아엎지 않는다. 공통 동작 계약을 안정화하는 것이 우선이다.

## 3. 참조 소스

- `src/components/ui/Modal.tsx`
- `src/components/ui/__tests__/Modal.test.tsx`
- `src/domains/calendar/components/CalendarEventModal.tsx`
- `src/domains/trip/components/TripQuizModal.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/TextField.tsx`

## 4. 확정 결정

- 현재 custom modal을 유지한다.
- 포커스 복귀는 “있으면 좋은 기능”이 아니라 필수 계약으로 본다.
- backdrop close, ESC close, focus trap은 테스트로 보장한다.
- a11y contract가 필요 이상으로 복잡해지기 전까지 외부 modal library로 교체하지 않는다.

## 5. 구현 대상

### 5.1 공통 Modal contract

아래 동작을 보장해야 한다.

1. open 시 첫 focusable element 또는 modal container에 focus 이동
2. Tab / Shift+Tab loop 유지
3. ESC로 닫힘
4. backdrop click으로 닫힘
5. close 시 opener focus 복귀
6. title/description aria 연결 유지

### 5.2 consumer 회귀 포인트

- `CalendarEventModal`
  - form 내부 입력 focus 시작 지점
  - submit 중 닫기/삭제 버튼 상태
- `TripQuizModal`
  - option 선택/닫기 동작
  - success/fail flow 중 포커스 이동

### 5.3 배경 접근 제어

- 현재 단계에서는 최소한의 contract를 보장한다.
- `inert` / background `aria-hidden`은 요구 수준과 브라우저 지원을 검토한 뒤 선택적으로 적용한다.
- 이 단계에서 무리하게 배경 접근 제어까지 확장하지 않아도 된다. 다만 후속 보강 포인트로 문서화한다.

## 6. 파일/폴더 목표 구조

```text
src/
  components/
    ui/
      Modal.tsx
      __tests__/
        Modal.test.tsx
  domains/
    calendar/
      components/
        CalendarEventModal.tsx
    trip/
      components/
        TripQuizModal.tsx
```

## 7. 타입/API/라우트 계약

### 7.1 Modal props 계약

- `isOpen=false`일 때 DOM에 남기지 않는다.
- `title`은 항상 `aria-labelledby`로 연결한다.
- `description`이 있으면 `aria-describedby`로 연결한다.
- `onClose`는 ESC/backdrop/close button 모두에서 동일한 contract로 호출한다.

### 7.2 focus 계약

- opener가 존재하면 close 후 opener로 복귀한다.
- opener가 사라졌다면 안전한 fallback을 사용한다.
- focus trap은 disabled element를 focus 대상으로 삼지 않는다.

## 8. 작업 순서

1. 현재 `Modal.tsx`가 보장하는 동작과 빠진 동작을 명시한다.
2. 기존 Modal 테스트를 확인하고 누락된 포커스/키보드 시나리오를 추가한다.
3. opener focus 복귀 로직을 구현한다.
4. `CalendarEventModal`, `TripQuizModal` consumer 회귀를 확인한다.
5. 필요 시 배경 접근 제어의 후속 TODO를 남긴다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `src/components/ui/__tests__/Modal.test.tsx`
  - open 시 focus 위치 검증
  - Tab / Shift+Tab loop 검증
  - ESC close 검증
  - backdrop close 검증
  - close 후 opener focus restore 검증
- consumer test 보강
  - `CalendarEventModal` 관련 테스트
  - `TripQuizModal` 관련 테스트

테스트 게이트:

- consumer 하나라도 modal 회귀를 일으키면 Step 04 진행 금지

## 10. 완료 기준

- 공통 Modal 동작 계약이 테스트로 고정되어 있다.
- opener focus 복귀가 구현되어 있다.
- Calendar/Trip modal consumer에서 회귀가 없다.
- “나중에 라이브러리로 바꾸자”가 아니라 현재 구현을 신뢰할 근거가 생긴다.

## 11. 리스크 / 보류 항목

- focus 관련 구현은 테스트 환경과 브라우저 환경이 일부 다를 수 있다.
  - 테스트는 최소 contract 중심으로 작성한다.
- nested modal 요구가 생기면 현재 구현만으로는 확장이 어려울 수 있다.
  - 이 경우 별도 후속 티켓으로 분리한다.

## 12. 후속 단계 연결 메모

- Step 05~06 Calendar refactor에서 modal consumer contract를 바꿀 수 있으므로, 이 단계 테스트는 공통 안전망 역할을 한다.
- 향후 modal variant가 늘어도 `Modal.tsx`의 키보드/포커스 contract는 유지해야 한다.

## 13. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- a11y reviewer 보조

### 권장 스킬

- `web-design-guidelines`

### 구현 주의사항

- 현재 custom modal을 과소평가하고 바로 외부 라이브러리로 바꾸지 않는다.
- focus 관련 구현에서 `queueMicrotask`와 ref timing을 신중하게 다룬다.
- 테스트 없이 키보드 동작을 바꾸지 않는다.
