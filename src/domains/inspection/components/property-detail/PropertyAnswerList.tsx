import { InterestStars } from '@/domains/inspection/components/InterestStars';
import {
  NoIcon,
  WarnIcon,
  YesIcon,
} from '@/domains/inspection/components/property-detail/icons';
import type { AnswerType, PropertyAnswer } from '@/domains/inspection/types';
import { cn } from '@/lib/utils/cn';

type PropertyAnswerListProps = {
  answers: PropertyAnswer[];
};

const TYPE_LABELS: Partial<Record<AnswerType, string>> = {
  NUMBER: '숫자',
  SINGLE_SELECT: '단일 선택',
  MULTI_SELECT: '다중 선택',
  BOOLEAN: '예/아니오',
  RATING: '별점',
};

/**
 * §5.3 문답 표시 규칙 / fe_implementation_decisions.md §3-⑨ — renders only
 * the snapshot fields (`question`/`answerType`/`choiceOptions`/values).
 * `isCurrentVersion`/`questionEnabled` are read here only to print a badge
 * line, never to change which value field is shown or how.
 */
export function PropertyAnswerList({ answers }: PropertyAnswerListProps) {
  return (
    <div className='slcn-inspection-qa'>
      {answers.map((answer) => (
        <div key={answer.questionId} className='slcn-inspection-qa__item'>
          <div>
            <p className='slcn-inspection-qa__question'>{answer.question}</p>
            <p className='slcn-inspection-qa__flags'>
              <AnswerFlags answer={answer} />
            </p>
          </div>
          <AnswerValue answer={answer} />
        </div>
      ))}
    </div>
  );
}

function AnswerFlags({ answer }: { answer: PropertyAnswer }) {
  const flags: string[] = [answer.required ? '필수' : '선택'];

  const typeLabel = TYPE_LABELS[answer.answerType];
  if (typeLabel) {
    flags.push(typeLabel);
  }

  if (!answer.isCurrentVersion) {
    flags.push(`이 기록은 v${answer.questionVersionNo} 질문 기준`);
  }

  if (!answer.questionEnabled) {
    flags.push('현재 미사용 질문');
  }

  return (
    <>
      {flags.map((flag, index) => (
        <span
          key={flag}
          className='slcn-inspection-qa__flag'
          data-kind={index === 0 && answer.required ? 'required' : undefined}
        >
          {index === 0 ? flag : `· ${flag}`}
        </span>
      ))}
    </>
  );
}

function AnswerValue({ answer }: { answer: PropertyAnswer }) {
  if (!answer.answered) {
    if (answer.required) {
      return (
        <p className='slcn-inspection-qa__answer' data-empty='true'>
          <WarnIcon />
          아직 작성하지 않았습니다
        </p>
      );
    }

    return (
      <p className='slcn-inspection-qa__answer slcn-inspection-qa__answer--muted'>
        응답 없음
      </p>
    );
  }

  switch (answer.answerType) {
    case 'TEXT':
    case 'LONG_TEXT':
      return <p className='slcn-inspection-qa__answer'>{answer.textValue}</p>;
    case 'NUMBER':
      return (
        <p className='slcn-inspection-qa__answer slcn-num'>
          {answer.numberValue}
          {answer.unit ?? ''}
        </p>
      );
    case 'RATING':
      return (
        <p className='slcn-inspection-qa__answer'>
          <InterestStars level={answer.ratingValue} />
        </p>
      );
    case 'BOOLEAN':
      return (
        <p className='slcn-inspection-qa__answer'>
          <span className='slcn-inspection-qa__bool'>
            {answer.booleanValue ? <YesIcon /> : <NoIcon />}
            {answer.booleanValue ? '예' : '아니오'}
          </span>
        </p>
      );
    case 'SINGLE_SELECT':
    case 'MULTI_SELECT': {
      const labels = answer.selectedCodes.map((code) => {
        const choice = answer.choiceOptions.find((c) => c.code === code);
        return choice ? choice.label : code;
      });

      return (
        <p className={cn('slcn-inspection-qa__answer')}>
          {labels.map((label) => (
            <span key={label} className='slcn-inspection-qa__chip'>
              {label}
            </span>
          ))}
        </p>
      );
    }
    default:
      return null;
  }
}
