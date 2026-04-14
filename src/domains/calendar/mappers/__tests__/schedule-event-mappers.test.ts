import { describe, expect, it } from 'vitest';
import {
  createDraftFromRange,
  mapDraftToSchedulePayload,
  mapScheduleToCalendarEventInput,
} from '../schedule-event-mappers';

describe('schedule-event-mappers', () => {
  it('maps all-day schedules to exclusive fullcalendar end dates', () => {
    const event = mapScheduleToCalendarEventInput(
      {
        id: 'schedule-1',
        calendarId: 'cal-1',
        title: '촬영',
        body: '종일 일정',
        start: '2026-04-14',
        end: '2026-04-14',
        allDay: true,
        location: '서울',
      },
      {
        id: 'cal-1',
        name: '아영',
        backgroundColor: '#fe9fc8',
        borderColor: '#fe9fc8',
        textColor: '#111111',
        visible: true,
        editable: true,
        startEditable: true,
        durationEditable: true,
        defaultSelected: true,
        sortOrder: 1,
      },
    );

    expect(event.start).toBe('2026-04-14');
    expect(event.end).toBe('2026-04-15');
    expect(event.extendedProps.calendarId).toBe('cal-1');
  });

  it('builds inclusive all-day payloads from modal drafts', () => {
    const draft = createDraftFromRange(
      {
        start: new Date(2026, 3, 14),
        end: new Date(2026, 3, 15),
        allDay: true,
      },
      'cal-1',
    );
    const payload = mapDraftToSchedulePayload(
      {
        ...draft,
        title: '종일 기록',
      },
      'schedule-1',
    );

    expect(payload).toEqual({
      id: 'schedule-1',
      calendarId: 'cal-1',
      title: '종일 기록',
      body: '',
      start: '2026-04-14',
      end: '2026-04-14',
      allDay: true,
      location: '',
    });
  });
});
