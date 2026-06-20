import type { EventApi, EventInput } from '@fullcalendar/core';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

// Each test explicitly selects the day it asserts on, so the default selection
// (which depends on whether the real "today" falls inside the rendered week) is
// never relied upon.
function getDayChip(dayNumber: number) {
  return screen
    .getAllByRole('tab')
    .find((tab) => tab.textContent?.trim().endsWith(String(dayNumber)));
}

describe('CalendarWeekAgendaView', () => {
  it('renders a 7-day strip for the current week with day numbers', () => {
    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(7);
    // Sunday 14 .. Saturday 20
    expect(tabs[0].textContent).toContain('14');
    expect(tabs[6].textContent).toContain('20');
  });

  it('lists only the selected day events sorted by start time', async () => {
    const user = userEvent.setup();

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    const chip = getDayChip(18);
    expect(chip).toBeTruthy();
    await user.click(chip as HTMLElement);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain('부암동 나들이');
    expect(items[1].textContent).toContain('저녁 약속');
    expect(screen.queryByText('다른 날 일정')).toBeNull();
  });

  it('switches the agenda list when a different day chip is tapped', async () => {
    const user = userEvent.setup();

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    await user.click(getDayChip(15) as HTMLElement);

    expect(screen.getByText('다른 날 일정')).toBeTruthy();
    expect(screen.queryByText('부암동 나들이')).toBeNull();
  });

  it('calls onEventClick with the event id when an agenda row is tapped', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn<(event: EventApi) => void>();

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={onEventClick}
      />
    );

    await user.click(getDayChip(18) as HTMLElement);
    await user.click(screen.getByRole('button', { name: /부암동 나들이/ }));

    expect(onEventClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'evt-walk' })
    );
  });

  it('shows an empty hint when the selected day has no events', async () => {
    const user = userEvent.setup();

    render(
      <CalendarWeekAgendaView
        currentDate={currentDate}
        events={events}
        onEventClick={vi.fn()}
      />
    );

    // Tuesday 16th has no events.
    await user.click(getDayChip(16) as HTMLElement);

    expect(screen.getByText('이 날에는 등록된 일정이 없어요.')).toBeTruthy();
  });

  it('renders all-day events without a time label', async () => {
    const user = userEvent.setup();
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

    await user.click(getDayChip(18) as HTMLElement);

    const row = screen.getByRole('button', { name: /연차/ });
    expect(within(row).getByText('종일')).toBeTruthy();
  });
});
