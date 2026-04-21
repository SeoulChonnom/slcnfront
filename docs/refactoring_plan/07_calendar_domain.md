# Step 07. Calendar Domain

## 1. 목적

기존 TOAST UI 기반 일정 관리 기능을 FullCalendar 기반으로 재구성하면서, 월간/주간 뷰와 CRUD 기능을 모두 유지하는 단계다. 이 단계의 핵심은 라이브러리 교체가 아니라 “기존 일정 기능을 React 친화적으로 안정화”하는 것이다.

## 2. 범위

- `/main/calendar`, `/mobile/calendar`
- `/main/calendar/week`, `/mobile/calendar/week`
- 월간 조회
- 주간 조회
- 일정 생성/수정/삭제
- today / prev / next 이동
- 일정 DTO ↔ FullCalendar adapter

## 3. 참조 소스

- `../old/slcnfront/src/views/calendarPage.vue`
- `../old/slcnfront/src/service/scheduleService.js`
- `../old/slcnfront/src/config/index.js`
- `docs/design/design.pen`
- `docs/api_spec.json`

## 4. 확정 결정

- 캘린더 엔진은 `FullCalendar`
- 사용 패키지는 아래로 고정한다.
  - `@fullcalendar/core`
  - `@fullcalendar/react`
  - `@fullcalendar/daygrid`
  - `@fullcalendar/timegrid`
  - `@fullcalendar/interaction`
- month view와 week view를 모두 지원한다.
- 공개 URL `/calendar`, `/calendar/week`는 유지한다.
- 내부 라우트는 `/main/calendar`, `/mobile/calendar`, `/main/calendar/week`, `/mobile/calendar/week`
- 기존 CRUD 기능은 모두 유지한다.

## 5. 구현 대상

### 5.1 월간 페이지

- month header
- today / prev / next
- day grid
- 이벤트 표시
- 이벤트 생성/수정/삭제

### 5.2 주간 페이지

- week header
- 날짜 범위 표시
- 시간대/요일 보드
- 이벤트 표시
- 모바일에서 터치 가능한 일정 편집 UX

### 5.3 편집 UX

기본 원칙:

- 라이브러리 기본 팝업에 전적으로 의존하지 않는다.
- 앱 디자인과 접근성을 위해 일정 편집 UI는 직접 통제 가능한 modal/drawer로 감싼다.

## 6. 파일/폴더 목표 구조

```text
src/
  domains/
    calendar/
      components/
        CalendarToolbar.tsx
        CalendarEventModal.tsx
        CalendarMonthView.tsx
        CalendarWeekView.tsx
        CalendarShell.tsx
      hooks/
        useCalendarMonth.ts
        useCalendarWeek.ts
        useCalendarEventMutations.ts
      mappers/
        schedule-event-mappers.ts
      utils/
        calendar-date.ts
      __tests__/
  pages/
    main/
      CalendarMonthPage.tsx
      CalendarWeekPage.tsx
    mobile/
      CalendarMonthPage.tsx
      CalendarWeekPage.tsx
```

## 7. 타입/API/라우트 계약

### 7.1 DTO → FullCalendar 모델

정식 adapter를 만든다.

```ts
type ScheduleEventDto = {
  id: string;
  title: string;
  body?: string;
  start: string;
  end: string;
  isAllday?: boolean;
  category?: 'allday' | 'time';
  calendarId?: string;
};

type CalendarEventModel = {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay: boolean;
  extendedProps: {
    body?: string;
    calendarId?: string;
  };
};
```

### 7.2 API 계약

- 월간 조회:
  - 기본 진입 시 현재 월 조회
  - 이동 시 `year`, `month` 기반 조회
- 주간 조회:
  - 별도 주간 조회 API를 만들지 않는다.
  - 주가 단일 월 안에 있으면 해당 월 데이터만 가져와 client-side 필터링한다.
  - 주가 월 경계를 넘으면 시작 월과 종료 월의 데이터를 모두 조회한 뒤 병합/중복 제거 후 필터링한다.
- 생성/수정/삭제는 기존 endpoint 규칙 유지

### 7.3 라우트 계약

- `/main/calendar`
- `/mobile/calendar`
- `/main/calendar/week`
- `/mobile/calendar/week`

공개 `/calendar`, `/calendar/week`는 entry resolver를 통해 위 라우트로 분기한다.

## 8. 작업 순서

1. 일정 DTO 타입과 mapper를 만든다.
2. FullCalendar wrapper 컴포넌트를 만든다.
3. month/week hook을 분리한다.
4. CRUD mutation과 편집 modal을 구현한다.
5. PC 월간 페이지와 Mobile 월간/주간 페이지를 구현한다.
6. toolbar와 view toggle을 연결한다.

## 9. 단계 종료 직후 단위 테스트

필수 테스트:

- `schedule-event-mappers.test.ts`
  - DTO ↔ FullCalendar model 변환 검증
- `useCalendarMonth.test.ts`
  - 월 이동과 조회 파라미터 검증
- `useCalendarWeek.test.ts`
  - 주간 범위 계산과 이벤트 필터링 검증
- `useCalendarEventMutations.test.ts`
  - create/update/delete payload 검증
- `CalendarToolbar.test.tsx`
  - today/prev/next/view switch 검증
- `CalendarMonthPage.test.tsx`
  - month view 렌더링과 상태 표시 검증

테스트 게이트:

- calendar domain 테스트 통과 전 Step 09 진행 금지

## 10. 완료 기준

- 월간/주간 모두 공개 URL 기준으로 접근 가능하다.
- CRUD 기능이 기존 기능 수준으로 동작한다.
- FullCalendar는 wrapper와 mapper 뒤에 숨겨져 있어 향후 교체가 가능하다.
- 단계 전용 단위 테스트가 모두 통과했다.

## 11. 리스크 / 보류 항목

- 주간 조회용 별도 API가 없으면 client filtering이 필요하다.
  - 월 경계 주차는 양쪽 월 데이터를 병합하는 정책으로 고정한다.
- FullCalendar 기본 스타일이 Pencil 스타일과 다를 수 있다.
  - 핵심 상호작용은 wrapper와 custom render로 흡수한다.

## 12. 코딩 에이전트 가이드

### 권장 역할

- FE 메인
- 퍼블리셔는 toolbar/month/week 비주얼 정리

### 권장 스킬

- `vercel-react-best-practices`

### 구현 주의사항

- FullCalendar 인스턴스 API를 화면 컴포넌트에 직접 흩뿌리지 않는다.
- 월간과 주간은 같은 데이터 모델을 공유하고, 페이지 레벨에서만 view를 나눈다.
