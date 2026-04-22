import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import type { TripListItem } from '../../types';
import { TripQuizModal } from '../TripQuizModal';

const trip: TripListItem = {
  id: 'trip-1',
  date: '20991231',
  name: '연말 나들이',
  displayDate: '2099.12.31',
  logoPath: '/logo.png',
  quizTitle: '정답은?',
  quizAnswerIndex: 1,
  quizAnswerTitle: '정답',
  quizAnswerText: '맞았어요.',
  quizErrorTitle: '오답',
  quizErrorText: '다시 골라보세요.',
  quizResponses: [
    { quizIndex: '0', answer: '보기 1' },
    { quizIndex: '1', answer: '보기 2' },
  ],
};

describe('TripQuizModal', () => {
  it('focuses the first answer button in the answer state', async () => {
    render(
      <TripQuizModal
        trip={trip}
        isOpen
        feedback={null}
        onClose={vi.fn()}
        onAnswer={vi.fn()}
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
          trip={trip}
          isOpen
          feedback={feedback}
          onClose={onClose}
          onAnswer={vi.fn()}
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
});
