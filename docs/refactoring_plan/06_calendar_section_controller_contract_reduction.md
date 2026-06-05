# Step 06. Calendar Section Controller Contract Reduction

## 1. 목적

Step 05에서 분해된 Calendar controller를 바탕으로, `CalendarSection.tsx`와 하위 컴포넌트가 너무 큰 flat controller contract 하나에 의존하는 구조를 줄이는 단계다. 이 단계의 목적은 UI와 상태 관리 사이의 결합도를 낮추고, 하위 컴포넌트가 필요한 의미 단위만 받도록 만드는 것이다.

이 단계가 끝나면 Calendar UI는 “거대한 controller object의 모든 필드를 아는 구조”가 아니라, navigation / filters / editor / events / status 같은 그룹화된 contract를 통해 더 읽기 쉬운 형태가 되어야 한다.

## 2. 범위

- `CalendarSectionControllerResult` 재설계
- `CalendarSection.tsx` prop fan-out 축소
- `CalendarToolbar`, `CalendarEventModal`, Month/Week view가 필요한 정보만 받도록 정리

이번 단계에서는 새 기능을 넣지 않는다. 구조적 가독성과 결합도 감소가 목적이다.

## 3. 참조 소스

- `docs/refactoring_plan/05_calendar_section_controller_decomposition.md`
- `src/domains/calendar/hooks/useCalendarSectionController.ts`
- `src/domains/calendar/components/CalendarSection.tsx`
- `src/domains/calendar/components/CalendarToolbar.tsx`
- `src/domains/calendar/components/CalendarEventModal.tsx`
- `src/domains/calendar/components/CalendarMonthView.tsx`
- `src/domains/calendar/components/CalendarWeekView.tsx`
- `src/domains/calendar/types.ts`

## 4. 확정 결정

- Step 05가 완료되기 전 이 단계로 넘어오지 않는다.
- contract reduction은 “필드를 줄이는 것”보다 “의미 단위로 묶는 것”을 우선한다.
- 각 하위 컴포넌트는 자신이 사용하지 않는 controller 세부사항을 알 필요가 없어야 한다.
- `CalendarSection`은 orchestration component로 남아도 괜찮지만, flat prop plumbing은 줄여야 한다.

## 5. 구현 대상

### 5.1 목표 contract 그룹

권장 그룹:

- `status`
  - `isLoading`, `isError`, `isSubmitting`
- `navigation`
  - `currentDate`, `label`, `onPrev`, `onToday`, `onNext`, `onViewChange`
- `filters`
  - `calendars`, `visibleCalendarIds`, `createDisabled`, `onToggleCalendar`, `onCreate`
- `events`
  - `events`, `onSelectRange`, `onDateClick`, `onEventClick`, `onEventDrop`, `onEventResize`
- `editor`
  - `isOpen`, `draft`, `event`, `error`, `onClose`, `onDraftChange`, `onSubmit`, `onDelete`

### 5.2 하위 컴포넌트 정리 방향

- `CalendarToolbar`
  - navigation + filters 중심
- `CalendarEventModal`
  - editor 중심
- `CalendarMonthView` / `CalendarWeekView`
  - event interactions 중심
- `CalendarSection`
  - 상태 분기 + 묶음 전달 중심

### 5.3 타입 정리

기존 `CalendarSectionControllerResult`를 단일 거대 타입으로 두기보다 아래처럼 나누는 방향을 우선 검토한다.

```ts
type CalendarStatusModel = ...
type CalendarNavigationModel = ...
type CalendarFiltersModel = ...
type CalendarEventsModel = ...
type CalendarEditorModel = ...
```

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    calendar/
      hooks/
        useCalendarSectionController.ts
      components/
        CalendarSection.tsx
        CalendarToolbar.tsx
        CalendarEventModal.tsx
        CalendarMonthView.tsx
        CalendarWeekView.tsx
      types.ts
```

type 파일을 별도 분리할지 여부는 구현 시 판단하되, grouped contract는 타입 레벨에서 드러나야 한다.

## 7. 타입/API/라우트 계약

### 7.1 section contract 계약

- `CalendarSection`은 grouped controller model만 다룬다.
- child component는 필요한 group만 받는다.
- child component가 controller 내부 private detail을 역으로 요구하지 않게 한다.

### 7.2 behavior 계약

- loading / error / empty / no-visible-calendar 상태 분기는 현재 UX를 유지한다.
- month / week view 전환 동작은 유지한다.
- modal open/close/submit/delete 동작은 유지한다.

## 8. 작업 순서

1. Step 05 결과를 기준으로 현재 controller return shape를 그룹화 설계안으로 정리한다.
2. 타입부터 분리한다.
3. `CalendarToolbar`가 받는 contract를 줄인다.
4. `CalendarEventModal` contract를 editor 중심으로 정리한다.
5. month/week view contract를 event interaction 중심으로 정리한다.
6. `CalendarSection`의 상태 분기 코드를 grouped model 기준으로 정리한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `CalendarSection` 테스트
  - loading / error / empty / filtered-empty / normal state 회귀 검증
- `CalendarToolbar` 테스트
  - navigation + filter interactions 검증
- `CalendarEventModal` 테스트
  - editor contract 회귀 검증

테스트 게이트:

- grouped contract 도입 후 기존 캘린더 UX가 바뀌면 단계 완료로 보지 않는다.

## 10. 완료 기준

- `CalendarSectionControllerResult` 수준의 flat contract 의존이 줄어들었다.
- 하위 컴포넌트가 필요한 의미 단위만 받는다.
- 타입 가독성과 변경 추적성이 좋아졌다.
- 이후 Calendar 기능 추가 시 controller contract 전체를 건드리는 빈도가 줄어든다.

## 11. 리스크 / 보류 항목

- 지나친 그룹화로 오히려 탐색이 어려워질 수 있다.
  - 실제 consumer 기준으로만 그룹을 만든다.
- Step 05가 충분히 끝나지 않았는데 contract reduction을 시작하면 구조가 다시 흔들릴 수 있다.

## 12. 후속 단계 연결 메모

- 이 단계 이후에는 Calendar 관련 신규 기능이나 성능 개선 작업을 더 작은 단위로 나눠서 진행할 수 있어야 한다.
- 향후 FullCalendar 교체/추상화 논의가 생기더라도 grouped contract가 adapter boundary 역할을 할 수 있다.

## 13. 코딩 에이전트 가이드

### 권장 역할

- FE 메인

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- 그룹화 자체가 목적이 되지 않게 한다.
- child component prop을 줄이기 위해 의미를 숨기지 않는다.
- Step 05와 섞어서 진행하지 않는다. 반드시 decomposition 후 reduction 순서를 지킨다.
