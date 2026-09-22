import { TextField } from '@/components/ui/TextField';
import type {
  PropertyAnswer,
  PropertyAnswerInput,
} from '@/domains/inspection/types';
import { cn } from '@/lib/utils/cn';

type PropertyAnswerFieldsProps = {
  answers: PropertyAnswer[];
  onAnswerChange: (questionId: string, input: PropertyAnswerInput) => void;
};

/**
 * Renders one control per answer type, from the response snapshot only —
 * `isCurrentVersion`/`questionEnabled` are badge-only and never gate what's
 * rendered here (fe_implementation_decisions.md §3-⑨).
 */
export function PropertyAnswerFields({
  answers,
  onAnswerChange,
}: PropertyAnswerFieldsProps) {
  const sorted = [...answers].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className='slcn-inspection-register-answers'>
      {sorted.map((answer) => (
        <div
          key={answer.questionId}
          className='slcn-inspection-register-answer'
        >
          <label
            className='slcn-field__label'
            htmlFor={`answer-${answer.questionId}`}
          >
            <span>{answer.question}</span>
            {answer.required ? <span aria-hidden='true'> *</span> : null}
            {!answer.isCurrentVersion ? (
              <span className='slcn-inspection-register-answer__badge'>
                이전 버전 문항
              </span>
            ) : null}
            {!answer.questionEnabled ? (
              <span className='slcn-inspection-register-answer__badge'>
                비활성 질문
              </span>
            ) : null}
          </label>
          {answer.description ? (
            <p className='slcn-inspection-register-answer__description'>
              {answer.description}
            </p>
          ) : null}

          <AnswerControl answer={answer} onChange={onAnswerChange} />

          {answer.required && !answer.answered ? (
            <p
              className='slcn-inspection-register-answer__warning'
              role='alert'
            >
              이 질문은 꼭 답해야 매물을 완료할 수 있어요.
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AnswerControl({
  answer,
  onChange,
}: {
  answer: PropertyAnswer;
  onChange: (questionId: string, input: PropertyAnswerInput) => void;
}) {
  const id = `answer-${answer.questionId}`;

  switch (answer.answerType) {
    case 'TEXT':
      return (
        <TextField
          id={id}
          value={answer.textValue ?? ''}
          onChange={(event) =>
            onChange(answer.questionId, {
              answerType: 'TEXT',
              value: event.target.value || null,
            })
          }
        />
      );

    case 'LONG_TEXT':
      return (
        <textarea
          id={id}
          className='slcn-field__textarea slcn-inspection-register-textarea'
          value={answer.textValue ?? ''}
          onChange={(event) =>
            onChange(answer.questionId, {
              answerType: 'LONG_TEXT',
              value: event.target.value || null,
            })
          }
        />
      );

    case 'NUMBER':
      return (
        <TextField
          id={id}
          type='number'
          trailing={answer.unit ?? undefined}
          value={answer.numberValue ?? ''}
          onChange={(event) => {
            const raw = event.target.value;

            onChange(answer.questionId, {
              answerType: 'NUMBER',
              value: raw === '' ? null : Number(raw),
            });
          }}
        />
      );

    case 'BOOLEAN':
      return (
        <div
          className='slcn-inspection-register-answer__pill-group'
          role='radiogroup'
          aria-labelledby={id}
        >
          {[
            { label: '예', value: true },
            { label: '아니오', value: false },
          ].map((option) => (
            <button
              key={String(option.value)}
              type='button'
              className={cn(
                'slcn-inspection-register-answer__pill',
                answer.booleanValue === option.value &&
                  'slcn-inspection-register-answer__pill--selected'
              )}
              aria-pressed={answer.booleanValue === option.value}
              onClick={() =>
                onChange(answer.questionId, {
                  answerType: 'BOOLEAN',
                  value: option.value,
                })
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      );

    case 'RATING':
      return (
        <div
          className='slcn-inspection-register-answer__pill-group'
          role='radiogroup'
          aria-labelledby={id}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type='button'
              className={cn(
                'slcn-inspection-register-answer__pill',
                answer.ratingValue === value &&
                  'slcn-inspection-register-answer__pill--selected'
              )}
              aria-pressed={answer.ratingValue === value}
              onClick={() =>
                onChange(answer.questionId, {
                  answerType: 'RATING',
                  value,
                })
              }
            >
              {value}
            </button>
          ))}
        </div>
      );

    case 'SINGLE_SELECT':
      return (
        <div
          className='slcn-inspection-register-answer__pill-group'
          role='radiogroup'
          aria-labelledby={id}
        >
          {answer.choiceOptions.map((choice) => (
            <button
              key={choice.code}
              type='button'
              className={cn(
                'slcn-inspection-register-answer__pill',
                answer.selectedCodes.includes(choice.code) &&
                  'slcn-inspection-register-answer__pill--selected'
              )}
              aria-pressed={answer.selectedCodes.includes(choice.code)}
              onClick={() =>
                onChange(answer.questionId, {
                  answerType: 'SINGLE_SELECT',
                  value: [choice.code],
                })
              }
            >
              {choice.label}
            </button>
          ))}
        </div>
      );

    case 'MULTI_SELECT':
      return (
        <div className='slcn-inspection-register-answer__pill-group'>
          {answer.choiceOptions.map((choice) => {
            const selected = answer.selectedCodes.includes(choice.code);

            return (
              <button
                key={choice.code}
                type='button'
                className={cn(
                  'slcn-inspection-register-answer__pill',
                  selected && 'slcn-inspection-register-answer__pill--selected'
                )}
                aria-pressed={selected}
                onClick={() => {
                  const next = selected
                    ? answer.selectedCodes.filter(
                        (code) => code !== choice.code
                      )
                    : [...answer.selectedCodes, choice.code];

                  onChange(answer.questionId, {
                    answerType: 'MULTI_SELECT',
                    value: next.length > 0 ? next : null,
                  });
                }}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      );

    default:
      return null;
  }
}
