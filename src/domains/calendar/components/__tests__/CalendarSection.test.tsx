import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarSection } from '../CalendarSection';

const {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createCalendar,
  updateCalendar,
  removeCalendar,
} = vi.hoisted(() => ({
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
  createCalendar: vi.fn(),
  updateCalendar: vi.fn(),
  removeCalendar: vi.fn(),
}));

vi.mock('../../hooks/useCalendarEventMutations', () => ({
  useCalendarEventMutations: () => ({
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isSubmitting: false,
  }),
}));

vi.mock('../../hooks/useCalendarMutations', () => ({
  useCalendarMutations: () => ({
    createCalendar,
    updateCalendar,
    deleteCalendar: removeCalendar,
    isSubmitting: false,
  }),
}));

vi.mock('../CalendarMonthView', () => ({
  CalendarMonthView: ({
    events,
    selectable,
    onSelect,
    onDateClick,
    onEventClick,
  }: {
    events: Array<{ id?: string }>;
    selectable?: boolean;
    onSelect: (selection: { start: Date; end: Date; allDay: boolean }) => void;
    onDateClick?: (selection: { date: Date; allDay: boolean }) => void;
    onEventClick: (event: { id: string }) => void;
  }) => (
    <div data-testid="calendar-month-view">
      {selectable ? (
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
      ) : null}
      {onDateClick ? (
        <button
          type="button"
          onClick={() => {
            onDateClick({
              date: new Date(2026, 3, 16, 13, 0, 0),
              allDay: false,
            });
          }}
        >
          quick-create
        </button>
      ) : null}
      {events[0]?.id ? (
        <button
          type="button"
          onClick={() => onEventClick({ id: events[0].id as string })}
        >
          open-event
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock('../CalendarWeekView', () => ({
  CalendarWeekView: () => <div data-testid="calendar-week-view" />,
}));

function createBaseState() {
  return {
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
  };
}

function renderSection(
  overrides?: Partial<ReturnType<typeof createBaseState>>
) {
  const state = {
    ...createBaseState(),
    ...overrides,
  };

  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={['/main/calendar/month?date=2026-04-14']}>
        <CalendarSection device="main" view="month" state={state} />
      </MemoryRouter>
    ),
  };
}

describe('CalendarSection', () => {
  beforeEach(() => {
    createSchedule.mockReset();
    updateSchedule.mockReset();
    deleteSchedule.mockReset();
    createCalendar.mockReset();
    updateCalendar.mockReset();
    removeCalendar.mockReset();
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

  it('creates a schedule from a calendar surface click', async () => {
    createSchedule.mockResolvedValueOnce({
      id: 'schedule-2',
    });

    const { user } = renderSection();

    await user.click(screen.getByRole('button', { name: 'quick-create' }));
    await screen.findByText('일정 만들기');

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '현장 메모' },
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(createSchedule).toHaveBeenCalledWith({
        calendarId: 'cal-1',
        title: '현장 메모',
        body: '',
        start: '2026-04-16T13:00:00+09:00',
        end: '2026-04-16T14:00:00+09:00',
        allDay: false,
        location: '',
      });
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

  it('defaults new schedules to the first editable visible calendar', async () => {
    createSchedule.mockResolvedValueOnce({
      id: 'schedule-2',
    });

    const { user } = renderSection({
      calendars: [
        {
          id: 'cal-1',
          name: '읽기 전용',
          backgroundColor: '#cccccc',
          borderColor: '#cccccc',
          textColor: '#111111',
          visible: true,
          editable: false,
          startEditable: false,
          durationEditable: false,
          defaultSelected: true,
          sortOrder: 1,
        },
        {
          id: 'cal-2',
          name: '편집 가능',
          backgroundColor: '#fe9fc8',
          borderColor: '#fe9fc8',
          textColor: '#111111',
          visible: true,
          editable: true,
          startEditable: true,
          durationEditable: true,
          defaultSelected: false,
          sortOrder: 2,
        },
      ],
      schedules: [],
    });

    await user.click(screen.getByRole('button', { name: '일정 추가' }));
    await screen.findByText('일정 만들기');

    expect(screen.getByDisplayValue('편집 가능')).toBeTruthy();

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '편집 일정' },
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(createSchedule).toHaveBeenCalledWith(
        expect.objectContaining({ calendarId: 'cal-2' })
      );
    });
  });

  it('does not open the edit modal for read-only calendars', async () => {
    const { user } = renderSection({
      calendars: [
        {
          id: 'cal-1',
          name: '읽기 전용',
          backgroundColor: '#cccccc',
          borderColor: '#cccccc',
          textColor: '#111111',
          visible: true,
          editable: false,
          startEditable: false,
          durationEditable: false,
          defaultSelected: true,
          sortOrder: 1,
        },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'open-event' }));

    expect(screen.queryByText('일정 수정')).toBeNull();
  });

  it('disables calendar-surface creation when no visible calendar is editable', () => {
    renderSection({
      calendars: [
        {
          id: 'cal-1',
          name: '읽기 전용',
          backgroundColor: '#cccccc',
          borderColor: '#cccccc',
          textColor: '#111111',
          visible: true,
          editable: false,
          startEditable: false,
          durationEditable: false,
          defaultSelected: true,
          sortOrder: 1,
        },
      ],
      schedules: [],
    });

    expect(screen.queryByRole('button', { name: 'select-range' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'quick-create' })).toBeNull();
  });

  it('keeps the calendar surface visible when calendars exist but schedules are empty', () => {
    renderSection({ schedules: [] });

    expect(screen.queryByText('캘린더가 아직 없어요.')).toBeNull();
    expect(screen.queryByText('표시 중인 캘린더가 없어요.')).toBeNull();
    expect(screen.getByTestId('calendar-month-view')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'select-range' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'quick-create' })).toBeTruthy();
  });

  it('shows the loading state while calendar data is loading', () => {
    renderSection({
      isLoading: true,
      schedules: [],
    });

    expect(
      screen.getAllByText(
        (_, element) =>
          element?.className.includes('slcn-calendar-loading__panel') ?? false
      ).length
    ).toBe(2);
  });

  it('shows the error state when calendar data fails to load', () => {
    renderSection({
      isError: true,
      schedules: [],
    });

    expect(screen.getByText('일정을 불러오지 못했어요.')).toBeTruthy();
  });

  it('keeps the calendar surface visible when there are no calendars', () => {
    renderSection({
      calendars: [],
      schedules: [],
    });

    const createButton = screen.getByRole('button', {
      name: '일정 추가',
    }) as HTMLButtonElement;

    expect(screen.getByText('캘린더가 아직 없어요.')).toBeTruthy();
    expect(screen.getByTestId('calendar-month-view')).toBeTruthy();
    expect(createButton.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'select-range' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'quick-create' })).toBeNull();
  });

  it('keeps the calendar surface visible when all calendars are toggled off', async () => {
    const { user } = renderSection({ schedules: [] });

    await user.click(screen.getByRole('button', { name: '아영' }));

    const createButton = screen.getByRole('button', {
      name: '일정 추가',
    }) as HTMLButtonElement;

    expect(screen.getByText('표시 중인 캘린더가 없어요.')).toBeTruthy();
    expect(screen.getByTestId('calendar-month-view')).toBeTruthy();
    expect(createButton.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'select-range' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'quick-create' })).toBeNull();
  });

  it('shows mutation errors inside the modal', async () => {
    createSchedule.mockRejectedValueOnce(new Error('저장 실패'));

    const { user } = renderSection();

    await user.click(screen.getByRole('button', { name: 'quick-create' }));
    await screen.findByText('일정 만들기');

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '실패 일정' },
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('저장 실패');
    });
    expect(screen.getByText('일정 만들기')).toBeTruthy();
  });

  it('creates and updates calendars from the calendar manager modal', async () => {
    createCalendar.mockResolvedValueOnce({ id: 'cal-2' });
    updateCalendar.mockResolvedValueOnce({ id: 'cal-1' });

    const { user } = renderSection({ schedules: [] });

    await user.click(screen.getByRole('button', { name: '캘린더 관리' }));
    await screen.findByText('캘린더 만들기');

    fireEvent.change(screen.getByRole('textbox', { name: '캘린더 이름' }), {
      target: { value: '새 캘린더' },
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(createCalendar).toHaveBeenCalledWith(
        expect.objectContaining({ name: '새 캘린더' })
      );
    });

    await user.click(screen.getByRole('button', { name: '캘린더 관리' }));
    await user.click(screen.getByRole('button', { name: '아영 수정 가능' }));
    fireEvent.change(screen.getByDisplayValue('아영'), {
      target: { value: '아영 메인' },
    });
    await user.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => {
      expect(updateCalendar).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'cal-1', name: '아영 메인' })
      );
    });
  });
});
