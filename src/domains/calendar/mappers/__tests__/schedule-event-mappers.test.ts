import type { EventApi } from '@fullcalendar/core';
import { describe, expect, it } from 'vitest';
import { mapEventApiToSchedulePayload } from '@/domains/calendar/mappers/fullcalendar-event-mappers';
import {
  createDraftFromRange,
  createDraftFromSchedule,
  mapDraftToSchedulePayload,
  mapScheduleToCalendarEventInput,
} from '@/domains/calendar/mappers/schedule-event-mappers';
import type { CalendarMeta, ScheduleEvent } from '@/domains/calendar/types';

const calendar: CalendarMeta = {
  id: 'cal-1',
  name: '아영',
  backgroundColor: '#fe9fc8',
  borderColor: '#fe9fc8',
  textColor: '#111111',
  visible: true,
  editable: true,
  startEditable: true,
  durationEditable: true,
  sortOrder: 1,
};

/** A one-day all-day schedule on 4/14, in the API's exclusive-end form. */
const oneDaySchedule: ScheduleEvent = {
  id: 'schedule-1',
  calendarId: 'cal-1',
  title: '촬영',
  body: '종일 일정',
  start: '2026-04-14',
  end: '2026-04-15',
  allDay: true,
  location: '서울',
  recurrenceRule: null,
  occurrenceId: null,
};

describe('schedule-event-mappers', () => {
  it('passes the exclusive all-day end straight to fullcalendar', () => {
    const event = mapScheduleToCalendarEventInput(oneDaySchedule, calendar);

    expect(event.start).toBe('2026-04-14');
    expect(event.end).toBe('2026-04-15');
    expect(event.id).toBe('schedule-1');
    expect(event.editable).toBe(true);
    expect(event.extendedProps.calendarId).toBe('cal-1');
    expect(event.extendedProps.scheduleId).toBe('schedule-1');
  });

  it('shows the inclusive last day in the editor form', () => {
    const draft = createDraftFromSchedule(oneDaySchedule);

    expect(draft.startDate).toBe('2026-04-14');
    expect(draft.endDate).toBe('2026-04-14');
  });

  it('sends a one-day all-day draft with an exclusive end', () => {
    const draft = createDraftFromRange(
      {
        start: new Date(2026, 3, 14),
        end: new Date(2026, 3, 15),
        allDay: true,
      },
      'cal-1'
    );
    const payload = mapDraftToSchedulePayload(
      {
        ...draft,
        title: '종일 기록',
      },
      'schedule-1'
    );

    expect(payload).toEqual({
      id: 'schedule-1',
      calendarId: 'cal-1',
      title: '종일 기록',
      body: '',
      start: '2026-04-14',
      end: '2026-04-15',
      allDay: true,
      location: '',
    });
  });

  it('round-trips a multi-day all-day schedule through the editor unchanged', () => {
    const schedule = { ...oneDaySchedule, end: '2026-04-17' };
    const payload = mapDraftToSchedulePayload(
      createDraftFromSchedule(schedule),
      schedule.id
    );

    expect(payload.start).toBe('2026-04-14');
    expect(payload.end).toBe('2026-04-17');
  });

  it('keys recurring occurrences apart and keeps them off the drag path', () => {
    const occurrence: ScheduleEvent = {
      ...oneDaySchedule,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=TU',
      occurrenceId: 'schedule-1/2026-04-14T00:00:00+09:00',
    };
    const event = mapScheduleToCalendarEventInput(occurrence, calendar);

    expect(event.id).toBe('schedule-1/2026-04-14T00:00:00+09:00');
    expect(event.extendedProps.scheduleId).toBe('schedule-1');
    expect(event.extendedProps.isRecurring).toBe(true);
    expect(event.editable).toBe(false);
    expect(event.startEditable).toBe(false);
    expect(event.durationEditable).toBe(false);
  });
});

describe('mapEventApiToSchedulePayload', () => {
  function createEventApi(overrides: Partial<EventApi>): EventApi {
    return {
      id: 'schedule-1',
      title: '촬영',
      allDay: true,
      start: new Date(2026, 3, 14),
      end: new Date(2026, 3, 15),
      extendedProps: {
        body: '',
        location: '',
        calendarId: 'cal-1',
        scheduleId: 'schedule-1',
      },
      ...overrides,
    } as EventApi;
  }

  it('keeps fullcalendar’s exclusive all-day end as the API end', () => {
    const payload = mapEventApiToSchedulePayload(createEventApi({}));

    expect(payload.start).toBe('2026-04-14');
    expect(payload.end).toBe('2026-04-15');
  });

  it('treats a missing all-day end as a one-day event', () => {
    const payload = mapEventApiToSchedulePayload(createEventApi({ end: null }));

    expect(payload.end).toBe('2026-04-15');
  });

  it('sends the master id, not the occurrence key', () => {
    const payload = mapEventApiToSchedulePayload(
      createEventApi({ id: 'schedule-1/2026-04-14T00:00:00+09:00' })
    );

    expect(payload.id).toBe('schedule-1');
  });
});
