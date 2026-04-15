import { useState } from 'react';
import type { TripListItem } from '../types';

type TripQuizFeedback = {
  isCorrect: boolean;
  title: string;
  description: string;
};

export function useTripQuiz() {
  const [activeTrip, setActiveTrip] = useState<TripListItem | null>(null);
  const [feedback, setFeedback] = useState<TripQuizFeedback | null>(null);

  function openQuiz(trip: TripListItem) {
    setActiveTrip(trip);
    setFeedback(null);
  }

  function closeQuiz() {
    setActiveTrip(null);
    setFeedback(null);
  }

  function submitAnswer(answerIndex: number) {
    if (!activeTrip) {
      return null;
    }

    const isCorrect = answerIndex === activeTrip.quizAnswerIndex;
    const nextFeedback = {
      isCorrect,
      title: isCorrect ? activeTrip.quizAnswerTitle : activeTrip.quizErrorTitle,
      description: isCorrect
        ? activeTrip.quizAnswerText
        : activeTrip.quizErrorText,
    };

    setFeedback(nextFeedback);

    return nextFeedback;
  }

  return {
    activeTrip,
    feedback,
    isOpen: Boolean(activeTrip),
    openQuiz,
    closeQuiz,
    submitAnswer,
  };
}
