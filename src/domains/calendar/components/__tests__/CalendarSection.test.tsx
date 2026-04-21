import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarSection } from '../CalendarSection';

const { createSchedule, updateSchedule, deleteSchedule } = vi.hoisted(() => ({
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}));

vi.mock('../../hooks/useCalendarEventMutations', () => ({
  useCalendarEventMutations: () => ({
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isSubmitting: false,
  }),
}));

vi.mock('../CalendarMonthView', () => ({
  CalendarMonthView: ({
    onSelect,
    onEventClick,
  }: {
    onSelect: (selection: { start: Date; end: Date; allDay: boolean }) => void;
    onEventClick: (event: { id: string }) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelect({
            start: new Date(2026, 3, 14, 9, 0, 0),
            end: new Date(2026, 3, 14, 10, 0, 0),
            allDay: false,
          });
        }}
      >
        select-range
      </button>
      <button type="button" onClick={() => onEventClick({ id: 'schedule-1' })}>
        open-event
      </button>
    </div>
  ),
}));

vi.mock('../CalendarWeekView', () => ({
  CalendarWeekView: () => null,
}));

function renderSection() {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={['/main/calendar/month?date=2026-04-14']}>
        <CalendarSection
          device="main"
          view="month"
          state={{
            label: '2026년 4월',
            calendars: [
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
            ],
            schedules: [
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
            ],
            isLoading: false,
            isError: false,
            refetch: vi.fn(),
          }}
        />
      </MemoryRouter>,
    ),
  };
}

describe('CalendarSection', () => {
  beforeEach(() => {
    createSchedule.mockReset();
    updateSchedule.mockReset();
    deleteSchedule.mockReset();
  });

  it('creates a schedule from a selected range and closes on success', async () => {
    createSchedule.mockResolvedValueOnce({
      id: 'schedule-2',
    });

    const { user } = renderSection();

    await user.click(screen.getByRole('button', { name: 'select-range' }));
    await screen.findByRole('button', { name: '저장' });

    const titleInput = screen.getAllByRole('textbox')[0];

    fireEvent.change(titleInput, {
      target: { value: '봄 모임' },
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(createSchedule).toHaveBeenCalledWith({
        calendarId: 'cal-1',
        title: '봄 모임',
        body: '',
        start: '2026-04-14T09:00:00+09:00',
        end: '2026-04-14T10:00:00+09:00',
        allDay: false,
        location: '',
      });
    });
    await waitFor(() => {
      expect(screen.queryByText('일정 만들기')).toBeNull();
    });
  });

  it('opens an existing schedule for edit and deletes it', async () => {
    deleteSchedule.mockResolvedValueOnce(undefined);

    const { user } = renderSection();

    await user.click(screen.getByRole('button', { name: 'open-event' }));
    expect(screen.getByText('일정 수정')).toBeTruthy();
    expect(screen.getByDisplayValue('봄 산책')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(deleteSchedule).toHaveBeenCalledWith('schedule-1');
    });
    await waitFor(() => {
      expect(screen.queryByText('일정 수정')).toBeNull();
    });
  });
});
