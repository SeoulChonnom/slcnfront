import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarEventModal } from '../CalendarEventModal';

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
];

describe('CalendarEventModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders controlled draft values and emits field changes', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onDraftChange = vi.fn();
    const { rerender } = render(
      <CalendarEventModal
        isOpen
        calendars={calendars}
        draft={{
          calendarId: 'cal-1',
          title: '초기 제목',
          body: '초기 설명',
          location: '초기 장소',
          allDay: false,
          startDate: '2026-04-14',
          startTime: '09:00',
          endDate: '2026-04-14',
          endTime: '10:00',
        }}
        event={null}
        errorMessage="검증 오류"
        isSubmitting={false}
        onClose={onClose}
        onDraftChange={onDraftChange}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('일정 만들기')).toBeTruthy();
    expect(screen.getByDisplayValue('초기 제목')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('검증 오류');

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '수정 제목' },
    });
    expect(onDraftChange).toHaveBeenCalledWith({ title: '수정 제목' });

    rerender(
      <CalendarEventModal
        isOpen
        calendars={calendars}
        draft={{
          calendarId: 'cal-1',
          title: '수정 제목',
          body: '갱신 설명',
          location: '갱신 장소',
          allDay: true,
          startDate: '2026-04-15',
          startTime: '09:00',
          endDate: '2026-04-16',
          endTime: '18:00',
        }}
        event={null}
        errorMessage={null}
        isSubmitting={false}
        onClose={onClose}
        onDraftChange={onDraftChange}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByDisplayValue('수정 제목')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('emits delete requests in edit mode', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(
      <CalendarEventModal
        isOpen
        calendars={calendars}
        draft={{
          calendarId: 'cal-1',
          title: '편집 일정',
          body: '',
          location: '',
          allDay: false,
          startDate: '2026-04-14',
          startTime: '09:00',
          endDate: '2026-04-14',
          endTime: '10:00',
        }}
        event={{
          id: 'schedule-1',
          calendarId: 'cal-1',
          title: '편집 일정',
          body: '',
          location: '',
          start: '2026-04-14T09:00:00+09:00',
          end: '2026-04-14T10:00:00+09:00',
          allDay: false,
        }}
        errorMessage={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText('일정 수정')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
