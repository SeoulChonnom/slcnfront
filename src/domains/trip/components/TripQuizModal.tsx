import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import type { TripQuiz, TripQuizFeedback } from '../types';

type TripQuizModalProps = {
  tripName?: string;
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

export function TripQuizModal({
  tripName,
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={feedback ? feedback.title : '나들이 퀴즈'}
      description={
        feedback
          ? feedback.description
          : (quiz?.title ?? `${tripName ?? '나들이'} 퀴즈를 확인하고 있어요.`)
      }
    >
      {feedback ? (
        <div className="slcn-trip-quiz-modal__feedback">
          <Button
            fullWidth
            autoFocus
            onClick={feedback.isCorrect ? onConfirmSuccess : onClose}
          >
            {feedback.isCorrect ? '지도 보러가기' : '목록으로 돌아가기'}
          </Button>
        </div>
      ) : errorMessage ? (
        <div className="slcn-trip-quiz-modal__feedback">
          <p role="alert">{errorMessage}</p>
          <Button fullWidth autoFocus onClick={onRetry}>
            다시 시도하기
          </Button>
        </div>
      ) : isLoading ? (
        <div className="slcn-trip-quiz-modal__feedback">
          <p role="status">퀴즈를 불러오는 중…</p>
        </div>
      ) : (
        <div className="slcn-trip-quiz-modal__answers">
          {quiz?.options.map((answer, index) => (
            <Button
              key={answer.id}
              variant="secondary"
              fullWidth
              disabled={isSubmitting}
              autoFocus={index === 0}
              onClick={() => onAnswer(answer.id)}
            >
              {index + 1}. {answer.text}
            </Button>
          ))}
        </div>
      )}
    </Modal>
  );
}
