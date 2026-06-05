import { describe, expect, it } from 'vitest';
import {
  buildQuickCreateSelection,
  getCreateDisabled,
  getDefaultEditableCalendarId,
  getMutationErrorMessage,
  getVisibleCalendarIds,
  getVisibleCalendars,
  getVisibleSchedules,
  mapSchedulesToCalendarEvents,
} from '../calendar-controller-helpers';

const calendars = [
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
  {
    id: 'cal-2',
    name: '읽기 전용',
    backgroundColor: '#cccccc',
    borderColor: '#cccccc',
    textColor: '#111111',
    visible: true,
    editable: false,
    startEditable: false,
    durationEditable: false,
    defaultSelected: false,
    sortOrder: 2,
  },
];

describe('calendar-controller-helpers', () => {
  it('returns all calendar ids when no explicit selection exists', () => {
    expect(getVisibleCalendarIds(calendars, null)).toEqual(['cal-1', 'cal-2']);
  });

  it('filters out stale selected ids and visible schedules accordingly', () => {
    const visibleCalendarIds = getVisibleCalendarIds(calendars, [
      'cal-2',
      'missing',
    ]);

    expect(visibleCalendarIds).toEqual(['cal-2']);
    expect(getVisibleCalendars(calendars, visibleCalendarIds)).toHaveLength(1);
    expect(
      getVisibleSchedules(
        [
          {
            id: 'schedule-1',
            calendarId: 'cal-1',
            title: '봄 산책',
            body: '',
            start: '2026-04-14T09:00:00+09:00',
            end: '2026-04-14T10:00:00+09:00',
            allDay: false,
            location: '서울',
          },
          {
            id: 'schedule-2',
            calendarId: 'cal-2',
            title: '읽기 일정',
            body: '',
            start: '2026-04-15T09:00:00+09:00',
            end: '2026-04-15T10:00:00+09:00',
            allDay: false,
            location: '서울',
          },
        ],
        visibleCalendarIds
      )
    ).toEqual([
      {
        id: 'schedule-2',
        calendarId: 'cal-2',
        title: '읽기 일정',
        body: '',
        start: '2026-04-15T09:00:00+09:00',
        end: '2026-04-15T10:00:00+09:00',
        allDay: false,
        location: '서울',
      },
    ]);
  });

  it('keeps calendar surface valid when visible calendars exist but schedules are empty', () => {
    const visibleCalendars = getVisibleCalendars(calendars, ['cal-1']);

    expect(getCreateDisabled(visibleCalendars)).toBe(false);
    expect(getDefaultEditableCalendarId(visibleCalendars)).toBe('cal-1');
    expect(
      mapSchedulesToCalendarEvents([], new Map(calendars.map((c) => [c.id, c])))
    ).toEqual([]);
  });

  it('builds quick create ranges and returns mutation fallback messages', () => {
    const timed = buildQuickCreateSelection(
      new Date(2026, 3, 16, 13, 0, 0),
      false
    );
    const allDay = buildQuickCreateSelection(
      new Date(2026, 3, 16, 13, 0, 0),
      true
    );

    expect(timed.end.getHours()).toBe(14);
    expect(allDay.start.getHours()).toBe(0);
    expect(allDay.end.getDate()).toBe(17);
    expect(getMutationErrorMessage(new Error('실패'), '기본값')).toBe('실패');
    expect(getMutationErrorMessage(new Error('   '), '기본값')).toBe('기본값');
  });
});
