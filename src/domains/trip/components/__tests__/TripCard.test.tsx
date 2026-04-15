import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { TripCard } from '../TripCard';

vi.mock('../../hooks/useTripAssetUrl', () => ({
  useTripAssetUrl: () => ({
    objectUrl: 'blob:logo',
  }),
}));

const trip = {
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

describe('TripCard', () => {
  it('opens the quiz flow when the CTA is clicked', async () => {
    const onOpenQuiz = vi.fn();
    const { user } = renderWithProviders(
      <TripCard trip={trip} onOpenQuiz={onOpenQuiz} />,
    );

    await user.click(
      screen.getByRole('button', { name: '퀴즈 풀고 나들이 기록 보기' }),
    );

    expect(onOpenQuiz).toHaveBeenCalledWith(trip);
  });
});
