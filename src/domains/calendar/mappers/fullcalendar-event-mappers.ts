import type { EventApi } from '@fullcalendar/core';
import dayjs from 'dayjs';
import {
  API_DATE_FORMAT,
  API_DATE_TIME_FORMAT,
  toInclusiveAllDayEnd,
} from '../utils/calendar-date';
import type { ScheduleMutationPayload } from '../types';

export function mapEventApiToSchedulePayload(
  event: EventApi
): ScheduleMutationPayload {
  return {
    id: event.id,
    calendarId: String(event.extendedProps['calendarId'] ?? ''),
    title: event.title,
    body: String(event.extendedProps['body'] ?? ''),
    start: event.allDay
      ? dayjs(event.start).format(API_DATE_FORMAT)
      : dayjs(event.start).format(API_DATE_TIME_FORMAT),
    end: event.allDay
      ? (toInclusiveAllDayEnd(event.end ?? event.start) ??
        dayjs(event.start).format(API_DATE_FORMAT))
      : dayjs(event.end ?? event.start).format(API_DATE_TIME_FORMAT),
    allDay: event.allDay,
    location: String(event.extendedProps['location'] ?? ''),
  };
}
