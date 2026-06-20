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

const draft = {
  name: '새 캘린더',
  backgroundColor: '#fe9fc8',
  borderColor: '#fe9fc8',
  textColor: '#111111',
  editable: true,
  startEditable: true,
  durationEditable: true,
  defaultSelected: true,
  sortOrder: 3,
};

describe('CalendarManageModal', () => {
  it('renders the calendar list with visibility toggles and emits create/edit/toggle actions', () => {
    const onToggleVisibility = vi.fn();
    const onCreateNew = vi.fn();
    const onEditCalendar = vi.fn();

    render(
      <CalendarManageModal
        isOpen
        view='list'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={draft}
        editingCalendarId={null}
        errorMessage={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onToggleVisibility={onToggleVisibility}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCreateNew={onCreateNew}
        onEditCalendar={onEditCalendar}
        onBackToList={vi.fn()}
      />
    );

    expect(screen.getByText('캘린더 관리')).toBeTruthy();

    const ayoungToggle = screen.getByRole('switch', { name: '아영 표시' });
    expect(ayoungToggle.getAttribute('aria-checked')).toBe('true');
    const ilgwonToggle = screen.getByRole('switch', { name: '일권 표시' });
    expect(ilgwonToggle.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(ayoungToggle);
    expect(onToggleVisibility).toHaveBeenCalledWith('cal-1');

    fireEvent.click(screen.getByRole('button', { name: '아영 편집' }));
    expect(onEditCalendar).toHaveBeenCalledWith('cal-1');

    fireEvent.click(screen.getByRole('button', { name: '새 캘린더 추가' }));
    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });

  it('renders the editor form and emits draft changes', () => {
    const onDraftChange = vi.fn();

    render(
      <CalendarManageModal
        isOpen
        view='editor'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={draft}
        editingCalendarId={null}
        errorMessage={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDraftChange={onDraftChange}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCreateNew={vi.fn()}
        onEditCalendar={vi.fn()}
        onBackToList={vi.fn()}
      />
    );

    expect(screen.getByText('캘린더 만들기')).toBeTruthy();

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
        view='editor'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={{ ...draft, name: '아영', sortOrder: 1 }}
        editingCalendarId='cal-1'
        errorMessage='삭제 전 확인'
        isSubmitting={false}
        onClose={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onDelete={onDelete}
        onCreateNew={vi.fn()}
        onEditCalendar={vi.fn()}
        onBackToList={vi.fn()}
      />
    );

    expect(screen.getByText('캘린더 수정')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('삭제 전 확인');

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
