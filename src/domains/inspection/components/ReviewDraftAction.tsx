import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SparkleIcon } from '@/domains/inspection/components/property-detail/icons';
import type { ReviewSuggestion } from '@/domains/inspection/types';
import { resolveReviewDraftErrorMessage } from '@/domains/inspection/utils/review-draft';

type ReviewDraftActionProps = {
  memo: string;
  /** Any of 한줄평·장점·단점·태그 already filled — asks before replacing. */
  hasExistingReview: boolean;
  /**
   * Screen-specific: flush/save, resolve ids, then call the suggestion API.
   * Throw `ReviewDraftError` (or an `AppError`) for a user-facing reason.
   */
  requestDraft: () => Promise<ReviewSuggestion>;
  onApply: (suggestion: ReviewSuggestion) => void;
  /** Lets the form lock the fields a draft would overwrite while waiting. */
  onBusyChange?: (busy: boolean) => void;
};

type Phase = 'idle' | 'loading' | 'applied';

const STATUS_COPY: Record<Phase, string> = {
  idle: '한줄평·장점·단점·태그를 채워 드려요',
  loading: '메모를 읽고 있어요. 길면 30초쯤 걸려요',
  applied: '초안을 채웠어요. 다듬어서 저장해 주세요',
};

export function ReviewDraftAction({
  memo,
  hasExistingReview,
  requestDraft,
  onApply,
  onBusyChange,
}: ReviewDraftActionProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [hasApplied, setHasApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isLoading = phase === 'loading';

  function handleClick() {
    setErrorMessage(null);

    if (!memo.trim()) {
      setErrorMessage(
        '메모를 먼저 적어 주세요. 메모를 바탕으로 초안을 써 드려요.'
      );

      return;
    }

    if (hasExistingReview) {
      setIsConfirmOpen(true);

      return;
    }

    void runDraft();
  }

  async function runDraft() {
    setIsConfirmOpen(false);
    setErrorMessage(null);
    setPhase('loading');
    onBusyChange?.(true);

    try {
      const suggestion = await requestDraft();

      if (!mountedRef.current) {
        return;
      }

      onApply(suggestion);
      setHasApplied(true);
      setPhase('applied');
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }

      setErrorMessage(resolveReviewDraftErrorMessage(error));
      setPhase('idle');
    } finally {
      if (mountedRef.current) {
        onBusyChange?.(false);
      }
    }
  }

  return (
    <div className='slcn-inspection-review-draft'>
      <div className='slcn-inspection-review-draft__row'>
        <Button
          variant='secondary'
          size='sm'
          loading={isLoading}
          onClick={handleClick}
        >
          <SparkleIcon className='slcn-inspection-review-draft__icon' />
          {isLoading
            ? '초안 쓰는 중'
            : hasApplied
              ? '초안 다시 쓰기'
              : '메모로 초안 쓰기'}
        </Button>
        <p className='slcn-inspection-review-draft__status' aria-live='polite'>
          {STATUS_COPY[phase]}
        </p>
      </div>

      {errorMessage ? (
        <p className='slcn-inspection-review-draft__alert' role='alert'>
          {errorMessage}
        </p>
      ) : null}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title='적어 둔 후기를 초안으로 바꿀까요?'
        description='한줄평·장점·단점·태그에 적어 둔 내용이 AI 초안으로 바뀌어요. 메모는 그대로 남아요.'
        confirmLabel='초안으로 바꾸기'
        cancelLabel='그대로 둘게요'
        confirmVariant='primary'
        onConfirm={() => void runDraft()}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
