import { describe, expect, it } from 'vitest';
import type { ScheduleEvent } from '@/domains/calendar/types';
import {
  filterTravelRecords,
  getNearestSchedules,
  getTravelYears,
  sortTravelsNewestFirst,
} from '@/domains/home/retrieval';
import type { TravelListItem } from '@/domains/travel/types';

const travels: TravelListItem[] = [
  {
    id: 'travel-sokcho',
    travelId: 'travel-sokcho',
    title: '속초 2박 3일',
    region: '속초',
    startDate: '2025-08-12',
    endDate: '2025-08-14',
    displayStartDate: '2025.08.12',
    displayEndDate: '2025.08.14',
    dateRangeLabel: '2025.08.12 – 2025.08.14',
    nightsDaysLabel: '2박 3일',
    coverPhotoId: 'cover-sokcho',
    oneLineReview: '바다와 시장 사이를 오래 걸었던 여름 여행.',
    nights: 2,
    days: 3,
    tags: [{ name: '바다' }],
  },
  {
    id: 'travel-busan',
    travelId: 'travel-busan',
    title: '부산, 비 오는 주말',
    region: '부산',
    startDate: '2024-10-04',
    endDate: '2024-10-06',
    displayStartDate: '2024.10.04',
    displayEndDate: '2024.10.06',
    dateRangeLabel: '2024.10.04 – 2024.10.06',
    nightsDaysLabel: '2박 3일',
    coverPhotoId: null,
    oneLineReview: '비가 와서 더 오래 카페에 머물렀다.',
    nights: 2,
    days: 3,
    tags: [{ name: '카페' }],
  },
  {
    id: 'travel-jeju',
    travelId: 'travel-jeju',
    title: '제주 겨울',
    region: '제주',
    startDate: '2023-01-10',
    endDate: '2023-01-13',
    displayStartDate: '2023.01.10',
    displayEndDate: '2023.01.13',
    dateRangeLabel: '2023.01.10 – 2023.01.13',
    nightsDaysLabel: '3박 4일',
    coverPhotoId: 'cover-jeju',
    oneLineReview: '귤밭을 천천히 걸었다.',
    nights: 3,
    days: 4,
    tags: [],
  },
];

describe('home travel retrieval helpers', () => {
  it('sorts every travel newest-first without capping the archive', () => {
    // Catches retaining the incumbent eight-record cap or ascending chronology.
    const olderTravels = Array.from({ length: 9 }, (_, index) => ({
      ...travels[2],
      id: `older-${index}`,
      travelId: `older-${index}`,
      startDate: `201${index}-01-01`,
    }));

    const sorted = sortTravelsNewestFirst([
      ...olderTravels,
      travels[1],
      travels[0],
    ]);

    expect(sorted).toHaveLength(11);
    expect(sorted[0].travelId).toBe('travel-sokcho');
    expect(sorted.at(-1)?.travelId).toBe('older-0');
  });

  it('derives unique travel years in newest-first order', () => {
    // Catches deriving years from only the first page or returning chronological ascending years.
    expect(getTravelYears(travels)).toEqual(['2025', '2024', '2023']);
  });

  it('searches title, region, and one-line review from loaded fields', () => {
    // Catches search wiring that ignores region or review text.
    expect(
      filterTravelRecords(travels, { query: '부산' }).map((item) => item.id)
    ).toEqual(['travel-busan']);
    expect(
      filterTravelRecords(travels, { query: '카페에 머물렀다' }).map(
        (item) => item.id
      )
    ).toEqual(['travel-busan']);
  });

  it('composes year and search filters while preserving newest-first order', () => {
    // Catches applying only one filter or searching the unfiltered source after a year jump.
    const matching = filterTravelRecords(
      [
        travels[0],
        {
          ...travels[0],
          id: 'travel-sokcho-old',
          travelId: 'travel-sokcho-old',
          startDate: '2024-08-12',
        },
      ],
      { year: '2024', query: '속초' }
    );

    expect(matching.map((item) => item.id)).toEqual(['travel-sokcho-old']);
  });

  it('returns an empty list for a zero-result query without mutating source records', () => {
    // Catches using a stale filtered list or treating no results as an error state.
    const result = filterTravelRecords(travels, { query: '도쿄' });

    expect(result).toEqual([]);
    expect(travels).toHaveLength(3);
  });

  it('keeps the nearest future schedules in ascending order and ignores past events', () => {
    // Catches using the API response order or rendering a past schedule as the next plan.
    const schedules: ScheduleEvent[] = [
      {
        id: 'schedule-next-day',
        calendarId: 'calendar-1',
        title: '다음 날 산책',
        body: '',
        start: '2026-08-26T09:00:00+09:00',
        end: '2026-08-26T10:00:00+09:00',
        allDay: false,
        location: '성수',
      },
      {
        id: 'schedule-past',
        calendarId: 'calendar-1',
        title: '지난 약속',
        body: '',
        start: '2026-08-25T08:00:00+09:00',
        end: '2026-08-25T09:00:00+09:00',
        allDay: false,
        location: '집',
      },
      {
        id: 'schedule-today',
        calendarId: 'calendar-1',
        title: '오늘 저녁',
        body: '',
        start: '2026-08-25T18:00:00+09:00',
        end: '2026-08-25T20:00:00+09:00',
        allDay: false,
        location: '을지로',
      },
    ];

    expect(
      getNearestSchedules(
        schedules,
        new Date('2026-08-25T12:00:00+09:00'),
        2
      ).map((schedule) => schedule.id)
    ).toEqual(['schedule-today', 'schedule-next-day']);
  });

  it('keeps today all-day date-only schedules while excluding yesterday and timed past events', () => {
    // Catches comparing an all-day YYYY-MM-DD schedule at midnight to a noon clock.
    const schedules: ScheduleEvent[] = [
      {
        id: 'schedule-today-all-day',
        calendarId: 'calendar-1',
        title: '오늘 하루',
        body: '',
        start: '2026-08-28',
        end: '2026-08-29',
        allDay: true,
        location: '',
      },
      {
        id: 'schedule-yesterday-all-day',
        calendarId: 'calendar-1',
        title: '어제 하루',
        body: '',
        start: '2026-08-27',
        end: '2026-08-28',
        allDay: true,
        location: '',
      },
      {
        id: 'schedule-timed-past',
        calendarId: 'calendar-1',
        title: '지난 오전',
        body: '',
        start: '2026-08-28T10:00:00+09:00',
        end: '2026-08-28T11:00:00+09:00',
        allDay: false,
        location: '',
      },
    ];

    expect(
      getNearestSchedules(
        schedules,
        new Date('2026-08-28T12:00:00+09:00'),
        3
      ).map((schedule) => schedule.id)
    ).toEqual(['schedule-today-all-day']);
  });

  it('sorts all-day before timed events on the same local date before applying the limit', () => {
    // Catches mixing UTC-midnight all-day times with absolute timed timestamps and slicing the all-day record out.
    const schedules: ScheduleEvent[] = [
      {
        id: 'schedule-next-day',
        calendarId: 'calendar-1',
        title: '다음 날',
        body: '',
        start: '2026-08-30T09:00:00+09:00',
        end: '2026-08-30T10:00:00+09:00',
        allDay: false,
        location: '',
      },
      {
        id: 'schedule-tomorrow-timed-late',
        calendarId: 'calendar-1',
        title: '내일 늦게',
        body: '',
        start: '2026-08-28T23:30:00Z',
        end: '2026-08-29T00:30:00Z',
        allDay: false,
        location: '',
      },
      {
        id: 'schedule-tomorrow-all-day',
        calendarId: 'calendar-1',
        title: '내일 하루',
        body: '',
        start: '2026-08-29',
        end: '2026-08-30',
        allDay: true,
        location: '',
      },
      {
        id: 'schedule-tomorrow-timed-early',
        calendarId: 'calendar-1',
        title: '내일 이른 시간',
        body: '',
        start: '2026-08-29T00:30:00+09:00',
        end: '2026-08-29T01:00:00+09:00',
        allDay: false,
        location: '',
      },
      {
        id: 'schedule-tomorrow-timed-middle',
        calendarId: 'calendar-1',
        title: '내일 중간',
        body: '',
        start: '2026-08-29T01:00:00+09:00',
        end: '2026-08-29T02:00:00+09:00',
        allDay: false,
        location: '',
      },
    ];

    expect(
      getNearestSchedules(
        schedules,
        new Date('2026-08-28T12:00:00+09:00'),
        3
      ).map((schedule) => schedule.id)
    ).toEqual([
      'schedule-tomorrow-all-day',
      'schedule-tomorrow-timed-early',
      'schedule-tomorrow-timed-middle',
    ]);
  });
});
