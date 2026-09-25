import type { EventApi } from '@fullcalendar/core';
import dayjs from 'dayjs';
import type { ScheduleMutationPayload } from '@/domains/calendar/types';
import {
  API_DATE_FORMAT,
  API_DATE_TIME_FORMAT,
} from '@/domains/calendar/utils/calendar-date';

export function mapEventApiToSchedulePayload(
  event: EventApi
): ScheduleMutationPayload {
  return {
    // `event.id` is the per-occurrence key; the API wants the master id.
    id: String(event.extendedProps.scheduleId ?? event.id),
    calendarId: String(event.extendedProps.calendarId ?? ''),
    title: event.title,
    body: String(event.extendedProps.body ?? ''),
    start: event.allDay
      ? dayjs(event.start).format(API_DATE_FORMAT)
      : dayjs(event.start).format(API_DATE_TIME_FORMAT),
    // FullCalendar's all-day end is already exclusive, matching the API. It
    // drops `end` for a one-day event, which means "the next day".
    end: event.allDay
      ? dayjs(event.end ?? dayjs(event.start).add(1, 'day')).format(
          API_DATE_FORMAT
        )
      : dayjs(event.end ?? event.start).format(API_DATE_TIME_FORMAT),
    allDay: event.allDay,
    location: String(event.extendedProps.location ?? ''),
  };
}
