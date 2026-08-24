import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title='삭제할까요?'
        description='되돌릴 수 없어요.'
        confirmLabel='삭제'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('focuses the cancel option by default, never the confirm action', async () => {
    render(
      <ConfirmDialog
        isOpen
        title='삭제할까요?'
        description='되돌릴 수 없어요.'
        confirmLabel='삭제'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '계속 둘게요' });

    await waitFor(() => {
      expect(document.activeElement).toBe(cancelButton);
    });
  });

  it('calls onCancel, not onConfirm, when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen
        title='삭제할까요?'
        description='되돌릴 수 없어요.'
        confirmLabel='삭제'
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm only when the confirm action is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        isOpen
        title='삭제할까요?'
        description='되돌릴 수 없어요.'
        confirmLabel='삭제'
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('states what is lost in the description, which is the actual guard', () => {
    render(
      <ConfirmDialog
        isOpen
        title='"아영" 캘린더를 삭제할까요?'
        description='이 캘린더에 속한 일정도 모두 함께 사라지고, 되돌릴 수 없어요.'
        confirmLabel='정말 삭제할게요'
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByRole('dialog');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe(
      '이 캘린더에 속한 일정도 모두 함께 사라지고, 되돌릴 수 없어요.'
    );
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: '계속 둘게요' })
    );
  });
});
