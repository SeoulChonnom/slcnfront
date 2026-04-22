import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useTripQuiz } from '../useTripQuiz';

const trip = {
  id: 'trip-1',
  date: '20991231',
  type: 'year-end',
  name: '연말 나들이',
  displayDate: '2099.12.31',
  logoPath: '/logo.png',
};

const { getTripQuiz, checkTripQuizAnswer } = vi.hoisted(() => ({
  getTripQuiz: vi.fn(),
  checkTripQuizAnswer: vi.fn(),
}));

vi.mock('../../api/trip-api', () => ({
  tripApi: {
    getTripQuiz,
    checkTripQuizAnswer,
  },
}));

describe('useTripQuiz', () => {
  beforeEach(() => {
    getTripQuiz.mockReset();
    checkTripQuizAnswer.mockReset();
  });

  it('loads quiz data and returns success feedback for a correct answer', async () => {
    getTripQuiz.mockResolvedValue({
      title: '정답은?',
      options: [
        { id: 'option-1', text: '보기 1', sortOrder: 1 },
        { id: 'option-2', text: '보기 2', sortOrder: 2 },
      ],
    });
    checkTripQuizAnswer.mockResolvedValue({
      isCorrect: true,
      title: '정답',
      description: '맞았어요.',
    });

    const { result } = renderHook(() => useTripQuiz());

    await act(async () => {
      await result.current.openQuiz(trip);
    });

    await waitFor(() => {
      expect(result.current.quiz?.title).toBe('정답은?');
    });

    await act(async () => {
      await result.current.submitAnswer('option-2');
    });

    expect(checkTripQuizAnswer).toHaveBeenCalledWith('trip-1', 'option-2');
    expect(result.current.feedback).toEqual({
      isCorrect: true,
      title: '정답',
      description: '맞았어요.',
    });
  });

  it('returns error feedback and resets on close', async () => {
    getTripQuiz.mockResolvedValue({
      title: '정답은?',
      options: [
        { id: 'option-1', text: '보기 1', sortOrder: 1 },
        { id: 'option-2', text: '보기 2', sortOrder: 2 },
      ],
    });
    checkTripQuizAnswer.mockResolvedValue({
      isCorrect: false,
      title: '오답',
      description: '다시 골라보세요.',
    });

    const { result } = renderHook(() => useTripQuiz());

    await act(async () => {
      await result.current.openQuiz(trip);
    });

    await act(async () => {
      await result.current.submitAnswer('option-1');
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
    expect(result.current.quiz).toBeNull();
    expect(result.current.feedback).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });
});
