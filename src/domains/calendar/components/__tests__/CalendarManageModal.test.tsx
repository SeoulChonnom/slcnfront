import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('labels the editing toggles in plain terms and disables the sub-toggles when the parent is off', () => {
    render(
      <CalendarManageModal
        isOpen
        view='editor'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={{
          ...draft,
          editable: false,
          startEditable: false,
          durationEditable: false,
        }}
        editingCalendarId={null}
        errorMessage={null}
        isSubmitting={false}
        onClose={vi.fn()}
        onToggleVisibility={vi.fn()}
        onDraftChange={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCreateNew={vi.fn()}
        onEditCalendar={vi.fn()}
        onBackToList={vi.fn()}
      />
    );

    // Labels describe what the person experiences, not FullCalendar's
    // internal option names.
    const parentToggle = screen.getByLabelText('일정 추가·수정하기');
    expect(parentToggle).toBeTruthy();
    expect(screen.getByLabelText('시작 시간 옮기기')).toBeInstanceOf(
      HTMLInputElement
    );
    expect(screen.getByLabelText('길이 조절하기')).toBeInstanceOf(
      HTMLInputElement
    );

    // The two sub-toggles are conditions of the parent toggle: turning it
    // off disables them, and the UI should reflect that.
    expect(
      (screen.getByLabelText('시작 시간 옮기기') as HTMLInputElement).disabled
    ).toBe(true);
    expect(
      (screen.getByLabelText('길이 조절하기') as HTMLInputElement).disabled
    ).toBe(true);

    // defaultSelected was removed entirely - control and data both -
    // because nothing in the app ever read it.
    expect(screen.queryByLabelText('기본 선택 캘린더')).toBeNull();
    expect(screen.queryByText('기본 선택 캘린더')).toBeNull();
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
    expect(screen.getByRole('button', { name: '삭제' })).toBeTruthy();
  });

  it('requires naming the calendar before it can be deleted, and cancelling leaves it alone', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CalendarManageModal
        isOpen
        view='editor'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={{ ...draft, name: '아영', sortOrder: 1 }}
        editingCalendarId='cal-1'
        errorMessage={null}
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

    await user.click(screen.getByRole('button', { name: '삭제' }));

    const confirmDialog = await screen.findByRole('dialog', {
      name: '"아영" 캘린더를 삭제할까요?',
    });
    // The dialog must say what is lost: deleting a calendar also removes
    // its schedules.
    expect(confirmDialog.textContent).toContain('일정도 모두 함께 사라지고');
    expect(onDelete).not.toHaveBeenCalled();

    // The safe option holds focus, so a stray Enter cannot delete a calendar.
    const cancelButton = screen.getByRole('button', { name: '계속 둘게요' });
    await waitFor(() => {
      expect(document.activeElement).toBe(cancelButton);
    });

    await user.click(cancelButton);
    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('dialog', { name: '"아영" 캘린더를 삭제할까요?' })
    ).toBeNull();
  });

  it('deletes the calendar only after the confirmation is accepted', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CalendarManageModal
        isOpen
        view='editor'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={{ ...draft, name: '아영', sortOrder: 1 }}
        editingCalendarId='cal-1'
        errorMessage={null}
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

    await user.click(screen.getByRole('button', { name: '삭제' }));
    await screen.findByRole('dialog', { name: '"아영" 캘린더를 삭제할까요?' });

    expect(onDelete).not.toHaveBeenCalled();

    const confirmButton = screen.getByRole('button', {
      name: '정말 삭제할게요',
    }) as HTMLButtonElement;

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('cancels the delete confirmation on Escape without deleting', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CalendarManageModal
        isOpen
        view='editor'
        calendars={calendars}
        visibleCalendarIds={['cal-1']}
        draft={{ ...draft, name: '아영', sortOrder: 1 }}
        editingCalendarId='cal-1'
        errorMessage={null}
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

    await user.click(screen.getByRole('button', { name: '삭제' }));
    await screen.findByRole('dialog', { name: '"아영" 캘린더를 삭제할까요?' });

    await user.keyboard('{Escape}');

    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('dialog', { name: '"아영" 캘린더를 삭제할까요?' })
    ).toBeNull();
  });
});
