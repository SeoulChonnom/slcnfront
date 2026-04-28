import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import type { TripQuiz } from '../../types';
import { TripQuizModal } from '../TripQuizModal';

const quiz: TripQuiz = {
  title: '정답은?',
  options: [
    { id: 'option-1', text: '보기 1' },
    { id: 'option-2', text: '보기 2' },
  ],
};

describe('TripQuizModal', () => {
  it('focuses the first answer button in the answer state', async () => {
    render(
      <TripQuizModal
        tripName="연말 나들이"
        isOpen
        quiz={quiz}
        feedback={null}
        isLoading={false}
        isSubmitting={false}
        errorMessage={null}
        onClose={vi.fn()}
        onAnswer={vi.fn()}
        onRetry={vi.fn()}
        onConfirmSuccess={vi.fn()}
      />
    );

    const firstAnswerButton = screen.getByRole('button', { name: '1. 보기 1' });

    await waitFor(() => {
      expect(document.activeElement).toBe(firstAnswerButton);
    });
  });

  it.each([
    {
      name: 'correct feedback',
      feedback: {
        isCorrect: true,
        title: '정답',
        description: '맞았어요.',
      },
      buttonName: '지도 보러가기',
      expected: 'confirm',
    },
    {
      name: 'incorrect feedback',
      feedback: {
        isCorrect: false,
        title: '오답',
        description: '다시 골라보세요.',
      },
      buttonName: '목록으로 돌아가기',
      expected: 'close',
    },
  ])(
    'focuses the feedback CTA in the $name state',
    async ({ feedback, buttonName, expected }) => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onConfirmSuccess = vi.fn();

      render(
        <TripQuizModal
          tripName="연말 나들이"
          isOpen
          quiz={quiz}
          feedback={feedback}
          isLoading={false}
          isSubmitting={false}
          errorMessage={null}
          onClose={onClose}
          onAnswer={vi.fn()}
          onRetry={vi.fn()}
          onConfirmSuccess={onConfirmSuccess}
        />
      );

      const ctaButton = screen.getByRole('button', { name: buttonName });

      await waitFor(() => {
        expect(document.activeElement).toBe(ctaButton);
      });

      await user.click(ctaButton);

      if (expected === 'confirm') {
        expect(onConfirmSuccess).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
        return;
      }

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirmSuccess).not.toHaveBeenCalled();
    }
  );

  it('shows retry UI when quiz loading fails', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <TripQuizModal
        tripName="연말 나들이"
        isOpen
        quiz={null}
        feedback={null}
        isLoading={false}
        isSubmitting={false}
        errorMessage="퀴즈를 불러오지 못했어요. 잠시 후 다시 시도해주세요."
        onClose={vi.fn()}
        onAnswer={vi.fn()}
        onRetry={onRetry}
        onConfirmSuccess={vi.fn()}
      />
    );

    const retryButton = screen.getByRole('button', { name: '다시 시도하기' });

    await waitFor(() => {
      expect(document.activeElement).toBe(retryButton);
    });

    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
