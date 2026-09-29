import type { SubmitEvent } from 'react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  CATEGORY_NAME_MAX_LENGTH,
  questionErrorMessage,
} from '@/domains/inspection/components/questions/question-copy';
import {
  useCreateInspectionQuestionCategory,
  useUpdateInspectionQuestionCategoryStatus,
} from '@/domains/inspection/hooks/inspection-queries';
import type { InspectionQuestionCategory } from '@/domains/inspection/types';
import { findCategoryByName } from '@/domains/inspection/utils/question-categories';
import { AppError } from '@/lib/api/errors';

type CategoryCreateFormProps = {
  categories: InspectionQuestionCategory[];
  onDone: () => void;
};

/**
 * api.md §9 — a category is only a name, so creation stays inline at the
 * end of the list instead of opening a dialog. A name that matches a
 * disabled category is offered back for reactivation, because the server
 * rejects the duplicate without telling us which one it was.
 */
export function CategoryCreateForm({
  categories,
  onDone,
}: CategoryCreateFormProps) {
  const inputId = useId();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revivable, setRevivable] = useState<InspectionQuestionCategory | null>(
    null
  );

  const createMutation = useCreateInspectionQuestionCategory();
  const reviveMutation = useUpdateInspectionQuestionCategoryStatus(
    revivable?.categoryId ?? ''
  );

  function resetMessages() {
    setError(null);
    setRevivable(null);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();
    const trimmed = name.trim();
    if (trimmed === '' || trimmed.length > CATEGORY_NAME_MAX_LENGTH) {
      setError(`분류 이름은 1~${CATEGORY_NAME_MAX_LENGTH}자로 입력해 주세요.`);
      return;
    }
    const clash = findCategoryByName(categories, trimmed);
    if (clash?.enabled) {
      setError(`'${clash.name}' 분류가 이미 있습니다.`);
      return;
    }
    if (clash) {
      setRevivable(clash);
      return;
    }
    try {
      await createMutation.mutateAsync(trimmed);
      onDone();
    } catch (caught) {
      setError(
        (caught instanceof AppError && questionErrorMessage(caught.apiCode)) ||
          '분류를 만들지 못했습니다. 다시 시도해 주세요.'
      );
    }
  }

  async function handleRevive() {
    try {
      await reviveMutation.mutateAsync(true);
      onDone();
    } catch (caught) {
      setError(
        (caught instanceof AppError && questionErrorMessage(caught.apiCode)) ||
          '다시 사용하지 못했습니다. 다시 시도해 주세요.'
      );
    }
  }

  return (
    <form
      className='slcn-inspection-qcat-create'
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
    >
      <label htmlFor={inputId} className='slcn-inspection-qcat-create__label'>
        새 분류
      </label>
      <div className='slcn-inspection-qcat-create__row'>
        <input
          id={inputId}
          className='slcn-inspection-qcat__rename-input'
          placeholder='예: 채광·환기'
          value={name}
          maxLength={CATEGORY_NAME_MAX_LENGTH}
          // biome-ignore lint/a11y/noAutofocus: the form appears only after the admin pressed "+ 분류 추가"
          autoFocus
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            setName(event.target.value);
            resetMessages();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              onDone();
            }
          }}
        />
        <div className='slcn-inspection-qcat__actions'>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={onDone}
            disabled={createMutation.isPending}
          >
            취소
          </Button>
          <Button type='submit' size='sm' loading={createMutation.isPending}>
            분류 만들기
          </Button>
        </div>
      </div>
      <p className='slcn-inspection-qcat-create__hint'>
        목록 맨 뒤에 추가됩니다. 이름은 나중에 바꿀 수 있지만 분류를 지울 수는
        없고, 미사용 처리만 할 수 있습니다.
      </p>
      {error ? (
        <p
          className='slcn-inspection-qcat__note'
          data-kind='error'
          role='alert'
        >
          {error}
        </p>
      ) : null}
      {revivable ? (
        <div className='slcn-inspection-qcat__note' role='status'>
          <span>
            미사용 분류 중에 '{revivable.name}'이 있습니다. 새로 만들지 않고 그
            분류를 다시 사용할까요?
          </span>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={() => void handleRevive()}
            loading={reviveMutation.isPending}
          >
            '{revivable.name}' 다시 사용
          </Button>
        </div>
      ) : null}
    </form>
  );
}
