import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarManageModal } from '../CalendarManageModal';

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
    name: '일권',
    backgroundColor: '#111111',
    borderColor: '#111111',
    textColor: '#ffffff',
    visible: true,
    editable: false,
    startEditable: false,
    durationEditable: false,
    defaultSelected: false,
    sortOrder: 2,
  },
];

describe('CalendarManageModal', () => {
  it('renders existing calendars and emits create/edit/draft actions', () => {
    const onDraftChange = vi.fn();
    const onCreateNew = vi.fn();
    const onEditCalendar = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CalendarManageModal
        isOpen
        calendars={calendars}
        draft={{
          name: '새 캘린더',
          backgroundColor: '#fe9fc8',
          borderColor: '#fe9fc8',
          textColor: '#111111',
          editable: true,
          startEditable: true,
          durationEditable: true,
          defaultSelected: true,
          sortOrder: 3,
        }}
        editingCalendarId={null}
        errorMessage={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onDraftChange={onDraftChange}
        onSubmit={onSubmit}
        onCreateNew={onCreateNew}
        onEditCalendar={onEditCalendar}
      />
    );

    expect(screen.getByText('캘린더 만들기')).toBeTruthy();
    expect(screen.getByRole('button', { name: '새 캘린더' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '아영 수정 가능' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '새 캘린더' }));
    expect(onCreateNew).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: '아영 수정 가능' }));
    expect(onEditCalendar).toHaveBeenCalledWith('cal-1');

    fireEvent.change(screen.getByDisplayValue('새 캘린더'), {
      target: { value: '수정된 캘린더' },
    });
    expect(onDraftChange).toHaveBeenCalledWith({ name: '수정된 캘린더' });
  });

  it('shows delete action in edit mode', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CalendarManageModal
        isOpen
        calendars={calendars}
        draft={{
          name: '아영',
          backgroundColor: '#fe9fc8',
          borderColor: '#fe9fc8',
          textColor: '#111111',
          editable: true,
          startEditable: true,
          durationEditable: true,
          defaultSelected: true,
          sortOrder: 1,
        }}
        editingCalendarId='cal-1'
        errorMessage='삭제 전 확인'
        isSubmitting={false}
        onClose={vi.fn()}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
        onCreateNew={vi.fn()}
        onEditCalendar={vi.fn()}
      />
    );

    expect(screen.getByText('캘린더 수정')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('삭제 전 확인');

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
