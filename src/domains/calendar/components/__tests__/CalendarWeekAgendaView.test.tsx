import type { EventApi, EventInput } from '@fullcalendar/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarWeekAgendaView } from '../CalendarWeekAgendaView';

const currentDate = '2026-06-18';

const events: EventInput[] = [
  {
    id: 'evt-evening',
    title: '저녁 약속',
    start: '2026-06-18T19:00:00+09:00',
    end: '2026-06-18T20:00:00+09:00',
    allDay: false,
    backgroundColor: '#1f9d68',
    borderColor: '#1f9d68',
  },
  {
    id: 'evt-walk',
    title: '부암동 나들이',
    start: '2026-06-18T10:00:00+09:00',
    end: '2026-06-18T11:00:00+09:00',
    allDay: false,
    backgroundColor: '#fe9fc8',
    borderColor: '#fe9fc8',
  },
  {
    id: 'evt-other-day',
    title: '다른 날 일정',
    start: '2026-06-15T10:00:00+09:00',
    end: '2026-06-15T11:00:00+09:00',
    allDay: false,
  },
];

describe('CalendarWeekAgendaView', () => {
  // Pin "today" to Thursday 2026-06-18 so the today-anchor logic is
  // deterministic across environments.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18T09:00:00+09:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a 7-day strip for the current week with day numbers', () => {
    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    const chips = screen.getAllByRole('listitem');
    // Sunday 14 .. Saturday 20
    expect(chips[0].textContent).toContain('14');
    expect(chips[6].textContent).toContain('20');
  });

  it('lists every day of the week that has events, grouped by day heading', () => {
    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    // The week includes both June 15 (other-day) and June 18 (two events).
    expect(screen.getByText('6월 15일 (월) 일정')).toBeTruthy();
    expect(screen.getByText('6월 18일 (목) 일정')).toBeTruthy();

    expect(screen.getByText('다른 날 일정')).toBeTruthy();
    expect(screen.getByText('부암동 나들이')).toBeTruthy();
    expect(screen.getByText('저녁 약속')).toBeTruthy();
  });

  it('sorts events within a day by start time', () => {
    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    const heading = screen.getByText('6월 18일 (목) 일정');
    const daySection = heading.closest(
      '.slcn-calendar-agenda-day'
    ) as HTMLElement;
    const items = within(daySection).getAllByRole('listitem');

    expect(items[0].textContent).toContain('부암동 나들이');
    expect(items[1].textContent).toContain('저녁 약속');
  });

  it('always renders today even when it has no events', () => {
    const noTodayEvents: EventInput[] = [
      {
        id: 'evt-other-day',
        title: '다른 날 일정',
        start: '2026-06-15T10:00:00+09:00',
        end: '2026-06-15T11:00:00+09:00',
        allDay: false,
      },
    ];

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={noTodayEvents}
        onEventClick={vi.fn()}
      />
    );

    // Today (June 18) is still rendered as an anchor with an empty hint.
    expect(screen.getByText('6월 18일 (목) 일정')).toBeTruthy();
    expect(screen.getByText('오늘 등록된 일정이 없어요.')).toBeTruthy();
  });

  it('calls onEventClick with the event id when an agenda row is tapped', () => {
    const onEventClick = vi.fn<(event: EventApi) => void>();

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={onEventClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /부암동 나들이/ }));

    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-walk' })
    );
  });

  it('renders all-day events without a time label', () => {
    const allDayEvents: EventInput[] = [
      {
        id: 'evt-allday',
        title: '연차',
        start: '2026-06-18',
        end: '2026-06-19',
        allDay: true,
        backgroundColor: '#2563eb',
      },
    ];

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={allDayEvents}
        onEventClick={vi.fn()}
      />
    );

    const row = screen.getByRole('button', { name: /연차/ });
    expect(within(row).getByText('종일')).toBeTruthy();
  });
});
