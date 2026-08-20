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

/**
 * The record's lock, drawn open or closed. It is the one mark that carries the
 * quiz outcome, so the shackle position — not a colour — is what changes.
 */
function RecordLock({ isUnlocked }: { isUnlocked: boolean }) {
  return (
    <svg
      className='slcn-trip-quiz-modal__lock'
      data-unlocked={isUnlocked}
      width='26'
      height='26'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path
        className='slcn-trip-quiz-modal__lock-shackle'
        d='M8 11V7a4 4 0 0 1 8 0v4'
      />
      <rect x='4' y='11' width='16' height='11' rx='2.5' />
      <path d='M12 15.75v2.5' />
    </svg>
  );
}

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
  const subtitle = [tripDate, feedback ? null : '맞히면 지도가 열려요']
    .filter(Boolean)
    .join(' · ');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tripName ?? '나들이'}
      align='left'
      titleVariant='heading'
      description={subtitle || undefined}
      className='slcn-trip-quiz-modal'
    >
      {feedback ? (
        <>
          {/* The note is only the message; the way onward sits outside it. */}
          <div
            className='slcn-trip-quiz-modal__note'
            data-state={feedback.isCorrect ? 'unlocked' : 'locked'}
            role='status'
          >
            <div className='slcn-trip-quiz-modal__note-head'>
              <RecordLock isUnlocked={feedback.isCorrect} />
              <span className='slcn-trip-quiz-modal__note-state'>
                {feedback.isCorrect ? '그날 남겨 둔 말' : '아직 잠겨 있어요'}
              </span>
            </div>
            <p className='slcn-trip-quiz-modal__note-title'>{feedback.title}</p>
            <p className='slcn-trip-quiz-modal__note-copy'>
              {feedback.description}
            </p>
          </div>
          <div className='slcn-trip-quiz-modal__note-actions'>
            {feedback.isCorrect ? (
              <Button fullWidth autoFocus onClick={onConfirmSuccess}>
                지도 보러가기
              </Button>
            ) : (
              <>
                <Button fullWidth autoFocus onClick={onRetry}>
                  다시 풀어보기
                </Button>
                <Button variant='secondary' fullWidth onClick={onClose}>
                  목록으로 돌아가기
                </Button>
              </>
            )}
          </div>
        </>
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
                {answer.text}
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
