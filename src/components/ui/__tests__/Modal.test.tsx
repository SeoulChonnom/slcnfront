import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('does not render the dialog when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="퀴즈 풀기">
        <button type="button">확인</button>
      </Modal>
    );

    expect(screen.queryByRole('dialog', { name: '퀴즈 풀기' })).toBeNull();
  });

  it('respects an explicit autofocus target before falling back to the close button', async () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="퀴즈 풀기"
        description="정답을 맞춰야 입장할 수 있어요."
      >
        <input aria-label="정답 입력" autoFocus />
        <button type="button">확인</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: '퀴즈 풀기' });
    const answerInput = screen.getByRole('textbox', { name: '정답 입력' });

    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('정답을 맞춰야 입장할 수 있어요.')).toBeTruthy();

    await waitFor(() => {
      expect(document.activeElement).toBe(answerInput);
    });
  });

  it('traps focus in both directions', async () => {
    const user = userEvent.setup();

    render(
      <Modal isOpen onClose={vi.fn()} title="퀴즈 풀기">
        <button type="button">확인</button>
        <button type="button">취소</button>
      </Modal>
    );

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

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(cancelButton);
  });

  it('closes when the close button is clicked and restores body overflow and opener focus', async () => {
    const user = userEvent.setup();

    function ModalHost() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setIsOpen(true)}>
            열기
          </button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="퀴즈 풀기"
          >
            <button type="button">확인</button>
          </Modal>
        </>
      );
    }

    render(<ModalHost />);

    const opener = screen.getByRole('button', { name: '열기' });
    await user.click(opener);

    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByRole('button', { name: '모달 닫기' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: '퀴즈 풀기' })).toBeNull();
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(opener);
    });
  });

  it('closes when the backdrop is pressed', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen onClose={onClose} title="퀴즈 풀기">
        <button type="button">확인</button>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: '퀴즈 풀기' });
    const backdrop = dialog.parentElement;

    expect(backdrop).toBeTruthy();

    fireEvent.mouseDown(backdrop!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when escape is pressed', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen onClose={onClose} title="퀴즈 풀기">
        <button type="button">확인</button>
      </Modal>
    );

    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: '모달 닫기' })
      );
    });

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('falls back to the dialog when no focusable elements remain', async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="퀴즈 풀기">
        <div>내용</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: '퀴즈 풀기' });
    const closeButton = screen.getByRole('button', { name: '모달 닫기' });

    closeButton.setAttribute('disabled', 'true');
    dialog.focus();

    fireEvent.keyDown(dialog, { key: 'Tab' });

    expect(document.activeElement).toBe(dialog);
  });
});
