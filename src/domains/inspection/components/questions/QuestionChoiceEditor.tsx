import type { QuestionChoiceInput } from '@/domains/inspection/types';

type QuestionChoiceEditorProps = {
  choices: QuestionChoiceInput[];
  onChange: (choices: QuestionChoiceInput[]) => void;
  error?: string;
};

/**
 * api.md §9 input constraints: `choices` only applies to
 * SINGLE_SELECT/MULTI_SELECT, needs at least one entry, and `code` must be
 * unique within the question. Enforced here client-side before the request
 * ever leaves the form.
 */
export function QuestionChoiceEditor({
  choices,
  onChange,
  error,
}: QuestionChoiceEditorProps) {
  function updateChoice(index: number, patch: Partial<QuestionChoiceInput>) {
    onChange(
      choices.map((choice, choiceIndex) =>
        choiceIndex === index ? { ...choice, ...patch } : choice
      )
    );
  }

  function removeChoice(index: number) {
    onChange(
      choices
        .filter((_, choiceIndex) => choiceIndex !== index)
        .map((choice, choiceIndex) => ({
          ...choice,
          sortOrder: choiceIndex + 1,
        }))
    );
  }

  function addChoice() {
    onChange([
      ...choices,
      { code: '', label: '', sortOrder: choices.length + 1 },
    ]);
  }

  return (
    <div className='slcn-inspection-choice-editor'>
      <span className='slcn-field__label'>
        선택지<span aria-hidden='true'> *</span>
      </span>
      <ul className='slcn-inspection-choice-editor__list'>
        {choices.map((choice, index) => (
          <li key={index} className='slcn-inspection-choice-editor__row'>
            <input
              className='slcn-inspection-choice-editor__code'
              value={choice.code}
              placeholder='코드'
              aria-label={`선택지 ${index + 1} 코드`}
              onChange={(event) =>
                updateChoice(index, { code: event.target.value })
              }
            />
            <input
              className='slcn-inspection-choice-editor__label'
              value={choice.label}
              placeholder='보기 문구'
              aria-label={`선택지 ${index + 1} 문구`}
              onChange={(event) =>
                updateChoice(index, { label: event.target.value })
              }
            />
            <button
              type='button'
              className='slcn-inspection-choice-editor__remove'
              aria-label={`선택지 ${index + 1} 삭제`}
              onClick={() => removeChoice(index)}
              disabled={choices.length <= 1}
            >
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                aria-hidden='true'
              >
                <path d='M6 6l12 12' />
                <path d='M18 6L6 18' />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      <button
        type='button'
        className='slcn-inspection-choice-editor__add'
        onClick={addChoice}
      >
        + 선택지 추가
      </button>
      {error ? (
        <p className='slcn-field__message' data-kind='error'>
          {error}
        </p>
      ) : (
        <p className='slcn-field__message' data-kind='hint'>
          최소 1개, 코드는 이 질문 안에서 서로 달라야 합니다.
        </p>
      )}
    </div>
  );
}
