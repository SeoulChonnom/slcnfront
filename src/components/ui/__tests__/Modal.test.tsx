import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('opens, traps focus, and closes on escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal
        isOpen
        onClose={onClose}
        title="퀴즈 풀기"
        description="정답을 맞춰야 입장할 수 있어요."
      >
        <button type="button">확인</button>
        <button type="button">취소</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: '퀴즈 풀기' });
    const closeButton = screen.getByRole('button', { name: '모달 닫기' });
    const confirmButton = screen.getByRole('button', { name: '확인' });
    const cancelButton = screen.getByRole('button', { name: '취소' });

    await waitFor(() => {
      expect(document.activeElement).toBe(closeButton);
    });

    await user.tab();
    expect(document.activeElement).toBe(confirmButton);

    await user.tab();
    expect(document.activeElement).toBe(cancelButton);

    await user.tab();
    expect(document.activeElement).toBe(closeButton);

    await user.keyboard('{Escape}');

    expect(dialog).toBeTruthy();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
