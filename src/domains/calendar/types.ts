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
  defaultSelected: boolean;
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
  defaultSelected: boolean;
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
};

export type ScheduleEvent = {
  id: string;
  calendarId: string;
  title: string;
  body: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
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

export type ScheduleRangeQuery = {
  start: string;
  end: string;
};

export type CalendarEventInput = EventInput & {
  extendedProps: {
    body: string;
    location: string;
    calendarId: string;
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
  };
}
