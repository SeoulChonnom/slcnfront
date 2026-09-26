import dayjs from 'dayjs';
import {
  type CalendarEventInput,
  type CalendarMeta,
  getScheduleKey,
  isRecurringSchedule,
  type ScheduleEvent,
  type ScheduleMutationPayload,
} from '@/domains/calendar/types';
import {
  API_DATE_FORMAT,
  coerceDateValue,
  coerceTimeValue,
  formatDraftDateTime,
  toExclusiveAllDayEnd,
  toInclusiveAllDayEnd,
} from '@/domains/calendar/utils/calendar-date';

export type CalendarEventDraft = {
  calendarId: string;
  title: string;
  body: string;
  location: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
};

export function createEmptyCalendarEventDraft(
  calendarId: string
): CalendarEventDraft {
  const now = dayjs();
  const end = now.add(1, 'hour');

  return {
    calendarId,
    title: '',
    body: '',
    location: '',
    allDay: false,
    startDate: now.format(API_DATE_FORMAT),
    startTime: now.format('HH:mm'),
    endDate: end.format(API_DATE_FORMAT),
    endTime: end.format('HH:mm'),
  };
}

export function createDraftFromRange(
  selection: {
    start: Date;
    end: Date;
    allDay: boolean;
  },
  calendarId: string
): CalendarEventDraft {
  if (selection.allDay) {
    return {
      calendarId,
      title: '',
      body: '',
      location: '',
      allDay: true,
      startDate: dayjs(selection.start).format(API_DATE_FORMAT),
      startTime: '09:00',
      endDate:
        toInclusiveAllDayEnd(selection.end) ??
        dayjs(selection.start).format(API_DATE_FORMAT),
      endTime: '18:00',
    };
  }

  return {
    calendarId,
    title: '',
    body: '',
    location: '',
    allDay: false,
    startDate: dayjs(selection.start).format(API_DATE_FORMAT),
    startTime: dayjs(selection.start).format('HH:mm'),
    endDate: dayjs(selection.end).format(API_DATE_FORMAT),
    endTime: dayjs(selection.end).format('HH:mm'),
  };
}

export function createDraftFromSchedule(
  event: ScheduleEvent
): CalendarEventDraft {
  return {
    calendarId: event.calendarId,
    title: event.title,
    body: event.body,
    location: event.location,
    allDay: event.allDay,
    startDate: coerceDateValue(event.start),
    startTime: coerceTimeValue(event.start),
    endDate: event.allDay
      ? (toInclusiveAllDayEnd(event.end) ?? coerceDateValue(event.start))
      : coerceDateValue(event.end),
    endTime: coerceTimeValue(event.end),
  };
}

export function validateCalendarEventDraft(draft: CalendarEventDraft) {
  if (!draft.calendarId) {
    return '캘린더를 선택해 주세요.';
  }

  if (!draft.title.trim()) {
    return '제목을 입력해 주세요.';
  }

  const start = formatDraftDateTime(
    draft.startDate,
    draft.startTime,
    draft.allDay
  );
  const end = formatDraftDateTime(draft.endDate, draft.endTime, draft.allDay);
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return '일정 시간을 다시 확인해 주세요.';
  }

  if (draft.allDay) {
    if (endDate.isBefore(startDate, 'day')) {
      return '종일 일정 종료일은 시작일보다 빠를 수 없어요.';
    }

    return null;
  }

  if (!endDate.isAfter(startDate)) {
    return '종료 시각은 시작 시각보다 늦어야 해요.';
  }

  return null;
}

export function mapDraftToSchedulePayload(
  draft: CalendarEventDraft,
  id?: string
): ScheduleMutationPayload {
  const end = formatDraftDateTime(draft.endDate, draft.endTime, draft.allDay);

  return {
    id,
    calendarId: draft.calendarId,
    title: draft.title.trim(),
    body: draft.body.trim(),
    start: formatDraftDateTime(draft.startDate, draft.startTime, draft.allDay),
    // The form holds the inclusive last day; the API wants the day after.
    end: draft.allDay ? toExclusiveAllDayEnd(end) : end,
    allDay: draft.allDay,
    location: draft.location.trim(),
  };
}

export function mapScheduleToCalendarEventInput(
  schedule: ScheduleEvent,
  calendar: CalendarMeta | null
): CalendarEventInput {
  // Dragging an occurrence would PUT its own start as the master's, moving
  // the whole series, so recurring schedules stay put on the grid.
  const isRecurring = isRecurringSchedule(schedule);
  const editable = !isRecurring && (calendar?.editable ?? true);

  return {
    id: getScheduleKey(schedule),
    title: schedule.title,
    start: schedule.start,
    end: schedule.end,
    allDay: schedule.allDay,
    backgroundColor: calendar?.backgroundColor,
    borderColor: calendar?.borderColor,
    textColor: calendar?.textColor,
    editable,
    startEditable: editable && (calendar?.startEditable ?? true),
    durationEditable: editable && (calendar?.durationEditable ?? true),
    extendedProps: {
      body: schedule.body,
      location: schedule.location,
      calendarId: schedule.calendarId,
      scheduleId: schedule.id,
      isRecurring,
    },
  };
}
