import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { TextField } from '@/components/ui/TextField';
import { QuestionChoiceEditor } from '@/domains/inspection/components/questions/QuestionChoiceEditor';
import {
  ANSWER_TYPE_LABELS,
  answerTypeAllowsUnit,
  answerTypeNeedsChoices,
  CREATABLE_ANSWER_TYPES,
  existingVersionLabels,
  nextVersionLabel,
  questionErrorMessage,
} from '@/domains/inspection/components/questions/question-copy';
import {
  useCreateInspectionQuestion,
  useMoveInspectionQuestionCategory,
  useUpdateInspectionQuestionContent,
  useUpdateInspectionQuestionPolicy,
  useUpdateInspectionQuestionStatus,
} from '@/domains/inspection/hooks/inspection-queries';
import type {
  AnswerType,
  InspectionQuestion,
  InspectionQuestionCategory,
  QuestionChoiceInput,
} from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';

type QuestionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Create: only enabled categories. Edit: every category, so the current
   * one still renders when it has since been disabled.
   */
  categories: InspectionQuestionCategory[];
} & (
  | { mode: 'create'; defaultCategoryId: string | null }
  | { mode: 'edit'; question: InspectionQuestion }
);

const CONFLICT_MESSAGE =
  '질문이 이미 수정되었습니다. 새로고침 후 다시 시도하세요.';
const GENERIC_ERROR_MESSAGE = '저장 중 문제가 생겼습니다. 다시 시도해 주세요.';

function saveErrorMessage(error: unknown) {
  if (error instanceof AppError) {
    const byCode = questionErrorMessage(error.apiCode);
    if (byCode) {
      return byCode;
    }
    if (error.status === 409) {
      return CONFLICT_MESSAGE;
    }
  }
  return GENERIC_ERROR_MESSAGE;
}

function toRequestChoices(choices: QuestionChoiceInput[]) {
  return choices.map((choice, index) => ({
    code: choice.code.trim(),
    label: choice.label.trim(),
    sortOrder: index + 1,
  }));
}

function choicesEqual(a: QuestionChoiceInput[], b: QuestionChoiceInput[]) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every(
    (choice, index) =>
      choice.code.trim() === b[index]?.code.trim() &&
      choice.label.trim() === b[index]?.label.trim()
  );
}

function validateChoices(choices: QuestionChoiceInput[]) {
  if (choices.length === 0) {
    return '선택지를 최소 1개 입력해 주세요.';
  }
  const trimmedCodes = choices.map((choice) => choice.code.trim());
  if (trimmedCodes.some((code) => code === '')) {
    return '모든 선택지에 코드를 입력해 주세요.';
  }
  if (choices.some((choice) => choice.label.trim() === '')) {
    return '모든 선택지에 문구를 입력해 주세요.';
  }
  if (new Set(trimmedCodes).size !== trimmedCodes.length) {
    return '선택지 코드는 이 질문 안에서 서로 달라야 합니다.';
  }
  return null;
}

/**
 * screen_design.md §5.5 — the single modal used both for "질문 추가" and the
 * per-row "수정" action. The two modes share the dialog chrome but diverge
 * on: whether `answerType` can be picked at all (only at creation — api.md
 * §9), and whether a version-bump banner is shown (only when the content
 * PUT would actually fire).
 */
export function QuestionFormModal(props: QuestionFormModalProps) {
  const { isOpen, onClose, categories } = props;
  const isEdit = props.mode === 'edit';
  const question = isEdit ? props.question : null;

  const contentInputId = useId();
  const descriptionInputId = useId();
  const unitInputId = useId();
  const answerTypeInputId = useId();
  const categoryInputId = useId();

  const [categoryId, setCategoryId] = useState(
    question?.categoryId ??
      (props.mode === 'create' ? props.defaultCategoryId : null) ??
      categories[0]?.categoryId ??
      ''
  );
  const [content, setContent] = useState(question?.content ?? '');
  const [description, setDescription] = useState(question?.description ?? '');
  const [answerType, setAnswerType] = useState<AnswerType>(
    question?.answerType ?? 'TEXT'
  );
  const [required, setRequired] = useState(question?.required ?? true);
  const [choices, setChoices] = useState<QuestionChoiceInput[]>(
    question?.choices?.length
      ? question.choices.map((choice) => ({ ...choice }))
      : answerTypeNeedsChoices(question?.answerType ?? 'TEXT')
        ? [{ code: '', label: '', sortOrder: 1 }]
        : []
  );
  const [unit, setUnit] = useState(question?.unit ?? '');
  const [choicesError, setChoicesError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateInspectionQuestion();
  const updateContentMutation = useUpdateInspectionQuestionContent(
    question?.questionId ?? ''
  );
  const updatePolicyMutation = useUpdateInspectionQuestionPolicy(
    question?.questionId ?? ''
  );
  const statusMutation = useUpdateInspectionQuestionStatus(
    question?.questionId ?? ''
  );
  const moveMutation = useMoveInspectionQuestionCategory(
    question?.questionId ?? ''
  );

  const isSaving =
    createMutation.isPending ||
    updateContentMutation.isPending ||
    updatePolicyMutation.isPending ||
    moveMutation.isPending;

  const needsChoices = answerTypeNeedsChoices(answerType);
  const allowsUnit = answerTypeAllowsUnit(answerType);

  const trimmedContent = content.trim();
  const trimmedDescription = description.trim();
  const trimmedUnit = unit.trim();

  const contentChanged = isEdit
    ? trimmedContent !== question?.content ||
      trimmedDescription !== (question?.description ?? '') ||
      (needsChoices && !choicesEqual(choices, question?.choices ?? [])) ||
      (allowsUnit && trimmedUnit !== (question?.unit ?? ''))
    : true;
  const requiredChanged = isEdit ? required !== question?.required : false;
  const categoryChanged = isEdit ? categoryId !== question?.categoryId : false;
  const hasChanges = isEdit
    ? contentChanged || requiredChanged || categoryChanged
    : true;
  const selectedCategory = categories.find(
    (category) => category.categoryId === categoryId
  );
  const selectableCategories = categories.filter(
    (category) =>
      category.enabled || category.categoryId === question?.categoryId
  );

  const saveLabel = !isEdit
    ? '질문 추가'
    : contentChanged
      ? nextVersionLabel(question?.currentVersionNo ?? 1)
      : '저장';

  function handleAnswerTypeChange(next: AnswerType) {
    setAnswerType(next);
    setChoicesError(null);
    if (answerTypeNeedsChoices(next)) {
      setChoices((prev) =>
        prev.length > 0 ? prev : [{ code: '', label: '', sortOrder: 1 }]
      );
    } else {
      setChoices([]);
    }
    if (!answerTypeAllowsUnit(next)) {
      setUnit('');
    }
  }

  function resetAndClose() {
    setFormError(null);
    setContentError(null);
    setChoicesError(null);
    onClose();
  }

  async function handleSubmit() {
    setFormError(null);
    setContentError(null);
    setChoicesError(null);

    if (categoryId === '') {
      setFormError('질문을 넣을 분류를 골라 주세요.');
      return;
    }

    if (trimmedContent === '') {
      setContentError('질문 문장을 입력해 주세요.');
      return;
    }

    if (needsChoices) {
      const choicesValidation = validateChoices(choices);
      if (choicesValidation) {
        setChoicesError(choicesValidation);
        return;
      }
    }

    try {
      if (!isEdit) {
        await createMutation.mutateAsync({
          content: trimmedContent,
          description: trimmedDescription || undefined,
          answerType,
          required,
          // api.md §10: <= 0 is numbered onto the end of the chosen category.
          sortOrder: 0,
          categoryId,
          choices: needsChoices ? toRequestChoices(choices) : undefined,
          unit: allowsUnit && trimmedUnit ? trimmedUnit : undefined,
        });
        resetAndClose();
        return;
      }

      if (contentChanged) {
        await updateContentMutation.mutateAsync({
          content: trimmedContent,
          description: trimmedDescription || undefined,
          choices: needsChoices ? toRequestChoices(choices) : undefined,
          unit: allowsUnit && trimmedUnit ? trimmedUnit : undefined,
        });
      }

      if (requiredChanged) {
        // BE verified behavior: PATCH /policy does NOT treat an omitted
        // `sortOrder` as "keep existing" — it resets it to 0. Always send
        // the question's current sortOrder alongside `required` so a
        // required-only edit can't silently move the row to the front.
        await updatePolicyMutation.mutateAsync({
          required,
          sortOrder: question?.sortOrder,
        });
      }

      // Last, because the move renumbers `sortOrder` to the end of the new
      // category — the policy PATCH above must not write the old slot back.
      if (categoryChanged) {
        await moveMutation.mutateAsync(categoryId);
      }

      resetAndClose();
    } catch (error) {
      setFormError(saveErrorMessage(error));
    }
  }

  async function handleToggleStatus() {
    if (!question) {
      return;
    }
    setFormError(null);
    try {
      await statusMutation.mutateAsync(!question.enabled);
      resetAndClose();
    } catch (error) {
      setFormError(saveErrorMessage(error));
    }
  }

  const title = isEdit ? '질문 수정' : '질문 추가';
  const description2 = isEdit
    ? `현재 v${question?.currentVersionNo ?? 1} · 답변 ${question?.answerCount ?? 0}건이 이 질문을 참조하고 있습니다.`
    : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={title}
      description={description2}
      align='left'
      titleVariant='heading'
      className='slcn-inspection-question-modal'
    >
      <div className='slcn-inspection-question-form'>
        <div className='slcn-field'>
          <label htmlFor={categoryInputId} className='slcn-field__label'>
            <span>분류</span>
            <span aria-hidden='true'> *</span>
          </label>
          <div className='slcn-field__control'>
            <select
              id={categoryInputId}
              className='slcn-field__input'
              value={categoryId}
              required
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {selectableCategories.map((category) => (
                <option
                  key={category.categoryId}
                  value={category.categoryId}
                  disabled={!category.enabled}
                >
                  {category.enabled
                    ? category.name
                    : `${category.name} (미사용)`}
                </option>
              ))}
            </select>
          </div>
          {categoryChanged && selectedCategory ? (
            <p className='slcn-field__message' data-kind='hint'>
              저장하면 &lsquo;{selectedCategory.name}&rsquo; 분류의 맨 뒤로
              옮겨집니다. 옮겨도 버전은 바뀌지 않고, 이미 저장된 매물의 분류
              표시도 그대로입니다.
            </p>
          ) : null}
        </div>

        <TextField
          id={contentInputId}
          label='질문'
          required
          autoFocus
          value={content}
          error={contentError ?? undefined}
          onChange={(event) => {
            setContent(event.target.value);
            if (contentError) {
              setContentError(null);
            }
          }}
        />
        <TextField
          id={descriptionInputId}
          label='설명'
          hint='매물 문답 화면에서 질문 아래에 작게 표시됩니다.'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <div className='slcn-inspection-question-form__row'>
          <div className='slcn-field'>
            <label htmlFor={answerTypeInputId} className='slcn-field__label'>
              타입
            </label>
            <div className='slcn-field__control' data-disabled={isEdit}>
              <select
                id={answerTypeInputId}
                className='slcn-field__input'
                value={answerType}
                disabled={isEdit}
                onChange={(event) =>
                  handleAnswerTypeChange(event.target.value as AnswerType)
                }
              >
                {(isEdit ? [answerType] : CREATABLE_ANSWER_TYPES).map(
                  (type) => (
                    <option key={type} value={type}>
                      {ANSWER_TYPE_LABELS[type]}
                    </option>
                  )
                )}
              </select>
            </div>
            {isEdit ? (
              <p className='slcn-field__message' data-kind='hint'>
                답변이 있는 질문은 타입을 바꿀 수 없습니다.
              </p>
            ) : null}
          </div>

          <RadioGroup
            name='question-required'
            label='필수 여부'
            value={required ? 'true' : 'false'}
            onChange={(value) => setRequired(value === 'true')}
            options={[
              { label: '필수', value: 'true' },
              { label: '선택', value: 'false' },
            ]}
          />
        </div>

        {allowsUnit ? (
          <TextField
            id={unitInputId}
            label='단위'
            hint='숫자 답변 뒤에 붙는 단위입니다. 예: 대, 만원'
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          />
        ) : null}

        {needsChoices ? (
          <QuestionChoiceEditor
            choices={choices}
            onChange={(next) => {
              setChoices(next);
              if (choicesError) {
                setChoicesError(null);
              }
            }}
            error={choicesError ?? undefined}
          />
        ) : null}

        {isEdit && contentChanged ? (
          <div className='slcn-inspection-alert' data-tone='muted'>
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              aria-hidden='true'
            >
              <circle cx='12' cy='12' r='9' />
              <path d='M12 8h.01M11 12h1v5h1' strokeLinecap='round' />
            </svg>
            <span>
              질문 문장을 고치면 <b>v{(question?.currentVersionNo ?? 1) + 1}</b>
              이 새로 생깁니다. 이미 저장된 답변 {question?.answerCount ?? 0}
              건은 각자 답할 때의 문장(
              {existingVersionLabels(question?.currentVersionNo ?? 1)})을 그대로
              보여 줍니다.
            </span>
          </div>
        ) : null}

        {formError ? (
          <p className='slcn-inspection-question-form__error' role='alert'>
            {formError}
          </p>
        ) : null}

        <div className='slcn-inspection-question-form__foot'>
          {isEdit ? (
            <button
              type='button'
              className='slcn-inspection-question-form__disable'
              onClick={() => void handleToggleStatus()}
              disabled={statusMutation.isPending || isSaving}
            >
              {question?.enabled ? '미사용 처리' : '사용 처리'}
            </button>
          ) : (
            <span />
          )}
          <div className='slcn-inspection-question-form__actions'>
            <Button
              type='button'
              variant='secondary'
              onClick={resetAndClose}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type='button'
              onClick={() => void handleSubmit()}
              loading={isSaving}
              disabled={isEdit && !hasChanges}
            >
              {saveLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
