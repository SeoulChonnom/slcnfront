import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import type { TripListItem } from '../types';

type TripQuizModalProps = {
  trip: TripListItem | null;
  isOpen: boolean;
  feedback: {
    isCorrect: boolean;
    title: string;
    description: string;
  } | null;
  onClose: () => void;
  onAnswer: (answerIndex: number) => void;
  onConfirmSuccess: () => void;
};

export function TripQuizModal({
  trip,
  isOpen,
  feedback,
  onClose,
  onAnswer,
  onConfirmSuccess,
}: TripQuizModalProps) {
  const answers = trip?.quizResponses ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={feedback ? feedback.title : '나들이 퀴즈'}
      description={feedback ? feedback.description : trip?.quizTitle}
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
      ) : (
        <div className="slcn-trip-quiz-modal__answers">
          {answers.map((answer, index) => (
            <Button
              key={answer.quizIndex}
              variant="secondary"
              fullWidth
              autoFocus={index === 0}
              onClick={() => onAnswer(index)}
            >
              {index + 1}. {answer.answer}
            </Button>
          ))}
        </div>
      )}
    </Modal>
  );
}
