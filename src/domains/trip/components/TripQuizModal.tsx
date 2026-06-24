import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import type { TripQuiz, TripQuizFeedback } from '../types';

type TripQuizModalProps = {
  tripName?: string;
  tripDate?: string;
  isOpen: boolean;
  quiz: TripQuiz | null;
  feedback: TripQuizFeedback | null;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onAnswer: (optionId: string) => void;
  onRetry: () => void;
  onConfirmSuccess: () => void;
};

const LockIcon = (
  <svg
    width='14'
    height='14'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden='true'
  >
    <rect x='5' y='11' width='14' height='10' rx='2' />
    <path d='M8 11V7a4 4 0 1 1 8 0v4' />
  </svg>
);

export function TripQuizModal({
  tripName,
  tripDate,
  isOpen,
  quiz,
  feedback,
  isLoading,
  isSubmitting,
  errorMessage,
  onClose,
  onAnswer,
  onRetry,
  onConfirmSuccess,
}: TripQuizModalProps) {
  const subtitle = [tripName ?? '나들이', tripDate].filter(Boolean).join(' · ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='나들이 퀴즈'
      align='left'
      titleVariant='eyebrow'
      titleIcon={LockIcon}
      description={subtitle}
      className='slcn-trip-quiz-modal'
    >
      {feedback ? (
        <div
          className='slcn-trip-quiz-modal__result'
          data-tone={feedback.isCorrect ? 'correct' : 'wrong'}
        >
          <span
            className='slcn-trip-quiz-modal__result-badge'
            aria-hidden='true'
          >
            {feedback.isCorrect ? '✓' : '✕'}
          </span>
          <p className='slcn-trip-quiz-modal__result-title'>{feedback.title}</p>
          <p className='slcn-trip-quiz-modal__result-copy'>
            {feedback.description}
          </p>
          {feedback.isCorrect ? (
            <Button autoFocus onClick={onConfirmSuccess}>
              지도 보러가기
            </Button>
          ) : (
            <Button autoFocus onClick={onClose}>
              목록으로 돌아가기
            </Button>
          )}
        </div>
      ) : errorMessage ? (
        <div className='slcn-trip-quiz-modal__feedback'>
          <p role='alert'>{errorMessage}</p>
          <Button fullWidth autoFocus onClick={onRetry}>
            다시 시도하기
          </Button>
        </div>
      ) : isLoading ? (
        <div className='slcn-trip-quiz-modal__feedback'>
          <p role='status'>퀴즈를 불러오는 중…</p>
        </div>
      ) : (
        <>
          {quiz?.title ? (
            <p className='slcn-trip-quiz-modal__question'>{quiz.title}</p>
          ) : null}
          <div className='slcn-trip-quiz-modal__answers'>
            {quiz?.options.map((answer, index) => (
              <button
                key={answer.id}
                type='button'
                className='slcn-trip-quiz-modal__answer'
                disabled={isSubmitting}
                // biome-ignore lint/a11y/noAutofocus: first answer is focused to keep the keyboard quiz flow accessible
                autoFocus={index === 0}
                onClick={() => onAnswer(answer.id)}
              >
                <span
                  className='slcn-trip-quiz-modal__option-key'
                  aria-hidden='true'
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className='slcn-trip-quiz-modal__answer-text'>
                  {answer.text}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
