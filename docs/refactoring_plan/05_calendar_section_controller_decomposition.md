# Step 05. Calendar Section Controller Decomposition

## 1. 목적

`useCalendarSectionController.ts`에 집중된 navigation, filtering, editor, mutation orchestration 책임을 관심사별로 분해하는 단계다. 이 단계의 목적은 거대한 controller를 한 번에 없애는 것이 아니라, 테스트 가능한 단위와 변경 가능한 경계로 나누는 것이다.

이 단계가 끝나면 Calendar 기능을 수정할 때 “462라인 controller 전체를 이해해야만 한 줄을 바꿀 수 있는 상태”에서 벗어나야 한다.

## 2. 범위

- `useCalendarSectionController.ts` 내부 로직 분해
- pure helper 추출
- editor/navigation/interaction 관심사 분리
- 기존 `CalendarSection` 외부 동작은 최대한 유지

이번 단계에서는 UI contract를 크게 바꾸지 않는다. contract reduction은 Step 06에서 진행한다.

## 3. 참조 소스

- `src/domains/calendar/hooks/useCalendarSectionController.ts`
- `src/domains/calendar/components/CalendarSection.tsx`
- `src/domains/calendar/hooks/useCalendarRangeData.ts`
- `src/domains/calendar/hooks/useCalendarEventMutations.ts`
- `src/domains/calendar/mappers/schedule-event-mappers.ts`
- `src/domains/calendar/mappers/fullcalendar-event-mappers.ts`
- `src/domains/calendar/utils/calendar-date.ts`
- `src/domains/calendar/components/__tests__/CalendarSection.test.tsx`
- `src/domains/calendar/hooks/__tests__/useCalendarEventMutations.test.ts`

## 4. 확정 결정

- 한 번에 hook를 갈아엎지 않는다. pure logic부터 추출한다.
- `CalendarSection`의 현재 동작과 user-visible behavior를 우선 보존한다.
- `useCalendarSectionController`는 최종적으로 facade 역할을 해도 된다.
- drag/drop/resize revert 로직은 분해하더라도 현재 UX 의미를 보존한다.

## 5. 구현 대상

### 5.1 분해 후보 관심사

우선 분해 후보는 아래 순서로 본다.

1. calendar visibility / selected ids 계산
2. date navigation / search param 업데이트
3. editor state open/close/patch/validation
4. event create/update/delete orchestration
5. event click / range select / date click / drag / resize interaction

### 5.2 추천 구조

```text
src/domains/calendar/
  hooks/
    useCalendarSectionController.ts
    internal/
      use-calendar-navigation.ts
      use-calendar-editor.ts
      use-calendar-visibility.ts
      use-calendar-event-interactions.ts
  utils/
    calendar-date.ts
    calendar-controller-helpers.ts
```

실제 경로는 다를 수 있지만, “navigation / editor / visibility / interactions” 경계는 유지한다.

### 5.3 먼저 pure helper로 뽑을 항목

- visible calendar ids 계산
- visible schedule filtering
- event mapping
- `createDisabled` 계산
- mutation error message fallback
- quick-create selection 계산

이 helper들은 hook dependency를 줄이기 위한 첫 단계다.

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    calendar/
      hooks/
        useCalendarSectionController.ts
        internal/
          use-calendar-navigation.ts
          use-calendar-editor.ts
          use-calendar-visibility.ts
          use-calendar-event-interactions.ts
      utils/
        calendar-date.ts
        calendar-controller-helpers.ts
```

## 7. 타입/API/라우트 계약

### 7.1 현 단계 계약

- `CalendarSection`이 사용하는 현재 controller return shape는 가능한 한 유지한다.
- `currentDate`, `events`, `editor`, `onViewChange`, `onEventDrop` 등 핵심 필드명은 이 단계에서 함부로 바꾸지 않는다.
- `useCalendarRangeData`와 mutation hook contract는 보존한다.

### 7.2 interaction 계약

- 드래그/리사이즈 실패 시 revert 규칙은 유지한다.
- editable / startEditable / durationEditable guard는 유지한다.
- editor validation 실패 시 현재와 같은 inline error 흐름을 유지한다.

## 8. 작업 순서

1. controller 내부 로직을 관심사별로 주석 수준에서 먼저 분류한다.
2. pure helper를 먼저 추출하고 테스트를 추가한다.
3. navigation concern을 분리한다.
4. editor concern을 분리한다.
5. event interaction concern을 분리한다.
6. 최종적으로 facade controller가 조합만 담당하도록 정리한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- pure helper 테스트
  - visibility 계산
  - quick create selection
  - createDisabled 계산
- `CalendarSection` 관련 기존 테스트 회귀 확인
- 필요 시 `useCalendarSectionController` hook 수준 테스트 추가

테스트 게이트:

- 기존 `CalendarSection` 사용자 동작 회귀가 있으면 Step 06 진행 금지

## 10. 완료 기준

- `useCalendarSectionController`에서 분리 가능한 관심사가 독립된 helper/hook로 이동했다.
- 외부 behavior는 유지된다.
- editor/navigation/interaction 로직을 각각 독립적으로 읽고 테스트할 수 있다.
- 이후 Step 06 contract reduction을 안전하게 진행할 준비가 된다.

## 11. 리스크 / 보류 항목

- callback dependency와 stale closure 문제가 분해 과정에서 발생할 수 있다.
- `startTransition`, `navigate`, `setSearchParams` 타이밍을 잘못 건드리면 화면 이동 UX가 바뀔 수 있다.

## 12. 후속 단계 연결 메모

- Step 06은 이 단계의 결과를 전제로 한다. 먼저 분해하고, 그다음 contract를 줄인다.
- 분해 중에 return shape를 미리 정리하고 싶어져도 참는다. 지금은 behavior-preserving decomposition이 목표다.

## 13. 코딩 에이전트 가이드

### 권장 역할

- FE 메인

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- 버그 수정과 구조 분해를 동시에 크게 하지 않는다.
- effect 추가보다 pure helper 추출을 먼저 시도한다.
- 테스트 없이 drag/drop/resize 경로를 건드리지 않는다.
