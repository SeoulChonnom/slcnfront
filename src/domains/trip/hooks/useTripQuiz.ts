import { useRef, useState } from 'react';
import { tripApi } from '../api/trip-api';
import type { TripListItem, TripQuiz, TripQuizFeedback } from '../types';

function shuffleQuizOptions(quiz: TripQuiz): TripQuiz {
  const options = [...quiz.options];

  for (let index = options.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
  }

  return {
    ...quiz,
    options,
  };
}

export function useTripQuiz() {
  const [activeTrip, setActiveTrip] = useState<TripListItem | null>(null);
  const [quiz, setQuiz] = useState<TripQuiz | null>(null);
  const [feedback, setFeedback] = useState<TripQuizFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const requestIdRef = useRef(0);

  async function loadQuiz(trip: TripListItem) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoadingQuiz(true);
    setErrorMessage(null);
    setQuiz(null);

    try {
      const nextQuiz = await tripApi.getTripQuiz(trip.id);

      if (requestIdRef.current !== requestId) {
        return null;
      }

      setQuiz(shuffleQuizOptions(nextQuiz));

      return nextQuiz;
    } catch {
      if (requestIdRef.current !== requestId) {
        return null;
      }

      setErrorMessage('퀴즈를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');

      return null;
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoadingQuiz(false);
      }
    }
  }

  async function openQuiz(trip: TripListItem) {
    setActiveTrip(trip);
    setQuiz(null);
    setFeedback(null);
    await loadQuiz(trip);
  }

  function closeQuiz() {
    requestIdRef.current += 1;
    setActiveTrip(null);
    setQuiz(null);
    setFeedback(null);
    setErrorMessage(null);
    setIsLoadingQuiz(false);
    setIsSubmittingAnswer(false);
  }

  async function retryQuiz() {
    if (!activeTrip) {
      return null;
    }

    setFeedback(null);

    return loadQuiz(activeTrip);
  }

  async function submitAnswer(optionId: string) {
    if (!activeTrip) {
      return null;
    }

    const tripId = activeTrip.id;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSubmittingAnswer(true);
    setErrorMessage(null);

    try {
      const nextFeedback = await tripApi.checkTripQuizAnswer(tripId, optionId);

      if (requestIdRef.current !== requestId) {
        return null;
      }

      setFeedback(nextFeedback);

      return nextFeedback;
    } catch {
      if (requestIdRef.current !== requestId) {
        return null;
      }

      setErrorMessage('답변을 확인하지 못했어요. 잠시 후 다시 시도해주세요.');

      return null;
    } finally {
      if (requestIdRef.current === requestId) {
        setIsSubmittingAnswer(false);
      }
    }
  }

  return {
    activeTrip,
    quiz,
    feedback,
    errorMessage,
    isLoadingQuiz,
    isSubmittingAnswer,
    isOpen: Boolean(activeTrip),
    openQuiz,
    closeQuiz,
    retryQuiz,
    submitAnswer,
  };
}
