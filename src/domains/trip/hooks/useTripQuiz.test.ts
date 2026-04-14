import { renderHook, act } from '@testing-library/react';
import { useTripQuiz } from './useTripQuiz';

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

describe('useTripQuiz', () => {
  it('returns success feedback for a correct answer', () => {
    const { result } = renderHook(() => useTripQuiz());

    act(() => {
      result.current.openQuiz(trip);
    });

    act(() => {
      result.current.submitAnswer(1);
    });

    expect(result.current.feedback).toEqual({
      isCorrect: true,
      title: '정답',
      description: '맞았어요.',
    });
  });

  it('returns error feedback and resets on close', () => {
    const { result } = renderHook(() => useTripQuiz());

    act(() => {
      result.current.openQuiz(trip);
    });

    act(() => {
      result.current.submitAnswer(0);
    });

    expect(result.current.feedback).toEqual({
      isCorrect: false,
      title: '오답',
      description: '다시 골라보세요.',
    });

    act(() => {
      result.current.closeQuiz();
    });

    expect(result.current.activeTrip).toBeNull();
    expect(result.current.feedback).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });
});
