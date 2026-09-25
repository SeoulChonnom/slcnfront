import type { EventInput } from '@fullcalendar/core';

export type CalendarViewMode = 'month' | 'week';

export type CalendarMetaDto = {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  visible: boolean;
  editable: boolean;
  startEditable: boolean;
  durationEditable: boolean;
  sortOrder: number;
};

export type CalendarMeta = CalendarMetaDto;

export type CalendarCreatePayload = {
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  editable: boolean;
  startEditable: boolean;
  durationEditable: boolean;
  sortOrder: number;
};

export type CalendarUpdatePayload = CalendarCreatePayload & {
  id: string;
};

export type ScheduleEventDto = {
  id: string;
  calendarId: string;
  title: string;
  body: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
  recurrenceRule?: string | null;
  occurrenceId?: string | null;
};

export type ScheduleEvent = {
  /** Master schedule id. Every occurrence of a recurring series shares it. */
  id: string;
  calendarId: string;
  title: string;
  body: string;
  start: string;
  /** Exclusive for all-day schedules: a one-day event on 1/1 ends on 1/2. */
  end: string;
  allDay: boolean;
  location: string;
  /** RRULE value-part (e.g. `FREQ=WEEKLY;BYDAY=TU`), or null when not recurring. */
  recurrenceRule: string | null;
  /** `{scheduleId}/{occurrence start}` for an expanded occurrence, else null. */
  occurrenceId: string | null;
};

export type ScheduleMutationPayload = {
  id?: string;
  calendarId: string;
  title: string;
  body: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
};

/**
 * Identifies one rendered schedule. A range query returns every occurrence of
 * a recurring series under the same master `id`, so `id` alone is not unique.
 */
export function getScheduleKey(
  schedule: Pick<ScheduleEvent, 'id' | 'occurrenceId'>
) {
  return schedule.occurrenceId ?? schedule.id;
}

export function isRecurringSchedule(
  schedule: Pick<ScheduleEvent, 'recurrenceRule' | 'occurrenceId'>
) {
  return Boolean(schedule.recurrenceRule || schedule.occurrenceId);
}

export type ScheduleRangeQuery = {
  start: string;
  end: string;
};

export type CalendarEventInput = EventInput & {
  extendedProps: {
    body: string;
    location: string;
    calendarId: string;
    scheduleId: string;
    isRecurring: boolean;
  };
};

export function mapCalendarMetaDto(dto: CalendarMetaDto): CalendarMeta {
  return {
    ...dto,
  };
}

export function mapScheduleEventDto(dto: ScheduleEventDto): ScheduleEvent {
  return {
    id: dto.id,
    calendarId: dto.calendarId,
    title: dto.title,
    body: dto.body,
    start: dto.start,
    end: dto.end,
    allDay: dto.allDay,
    location: dto.location,
    recurrenceRule: dto.recurrenceRule ?? null,
    occurrenceId: dto.occurrenceId ?? null,
  };
}
