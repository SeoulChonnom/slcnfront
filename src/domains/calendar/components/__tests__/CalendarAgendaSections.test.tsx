import type { EventApi, EventInput } from '@fullcalendar/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarAgendaSections } from '../CalendarAgendaSections';

// Whole-month range for June 2026: [2026-06-01, 2026-07-01).
const rangeStart = '2026-06-01';
const rangeEnd = '2026-07-01';

const events: EventInput[] = [
  {
    id: 'evt-early',
    title: '월초 회의',
    start: '2026-06-03T09:00:00+09:00',
    end: '2026-06-03T10:00:00+09:00',
    allDay: false,
    backgroundColor: '#fe9fc8',
  },
  {
    id: 'evt-mid',
    title: '중순 점심',
    start: '2026-06-18T12:00:00+09:00',
    end: '2026-06-18T13:00:00+09:00',
    allDay: false,
    backgroundColor: '#1f9d68',
  },
  {
    id: 'evt-late',
    title: '월말 마감',
    start: '2026-06-28',
    end: '2026-06-29',
    allDay: true,
    backgroundColor: '#2563eb',
  },
  {
    id: 'evt-out-of-range',
    title: '다음 달 일정',
    start: '2026-07-02T10:00:00+09:00',
    end: '2026-07-02T11:00:00+09:00',
    allDay: false,
  },
];

describe('CalendarAgendaSections', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Today is June 18, inside the month range.
    vi.setSystemTime(new Date('2026-06-18T09:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('groups events by day for the whole period, in chronological order', () => {
    render(
      <CalendarAgendaSections
        events={events}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEventClick={vi.fn()}
      />
    );

    const headings = screen
      .getAllByRole('heading', { level: 3 })
      .map((node) => node.textContent);

    expect(headings).toEqual([
      '6월 3일 (수) 일정',
      '6월 18일 (목) 일정',
      '6월 28일 (일) 일정',
    ]);
  });

  it('excludes events outside the period', () => {
    render(
      <CalendarAgendaSections
        events={events}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.queryByText('다음 달 일정')).toBeNull();
  });

  it('renders all-day events as 종일', () => {
    render(
      <CalendarAgendaSections
        events={events}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEventClick={vi.fn()}
      />
    );

    const row = screen.getByRole('button', { name: /월말 마감/ });
    expect(within(row).getByText('종일')).toBeTruthy();
  });

  it('always renders today as an anchor with a hint when it has no events', () => {
    const withoutToday = events.filter((event) => event.id !== 'evt-mid');

    render(
      <CalendarAgendaSections
        events={withoutToday}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText('6월 18일 (목) 일정')).toBeTruthy();
    expect(screen.getByText('오늘 등록된 일정이 없어요.')).toBeTruthy();
  });

  it('does not render today when today is outside the range', () => {
    // July range, today (June 18) is outside it.
    render(
      <CalendarAgendaSections
        events={events}
        rangeStart='2026-07-01'
        rangeEnd='2026-08-01'
        onEventClick={vi.fn()}
      />
    );

    expect(screen.queryByText('6월 18일 (목) 일정')).toBeNull();
    expect(screen.getByText('7월 2일 (목) 일정')).toBeTruthy();
  });

  it('forwards the event id to onEventClick on tap', () => {
    const onEventClick = vi.fn<(event: EventApi) => void>();

    render(
      <CalendarAgendaSections
        events={events}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onEventClick={onEventClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /중순 점심/ }));

    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-mid' })
    );
  });
});
