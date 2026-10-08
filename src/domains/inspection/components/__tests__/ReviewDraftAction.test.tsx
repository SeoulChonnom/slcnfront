import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { ReviewDraftAction } from '@/domains/inspection/components/ReviewDraftAction';
import { RegisterStepBasicInfo } from '@/domains/inspection/components/register/RegisterStepBasicInfo';
import type { VisitBasicFormValues } from '@/domains/inspection/hooks/useInspectionRegisterWizard';
import type { ReviewSuggestion } from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';
import { renderWithMinimalProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';

const API = 'http://localhost:8080/api';

const suggestion: ReviewSuggestion = {
  oneLineReview: '조용한 동네',
  pros: '',
  cons: '- 주차 부족',
  tags: ['조용함'],
};

function renderAction(
  props: Partial<React.ComponentProps<typeof ReviewDraftAction>> = {}
) {
  const requestDraft = vi.fn(async () => suggestion);
  const onApply = vi.fn();
  const utils = renderWithMinimalProviders(
    <ReviewDraftAction
      memo='한강이 보인다'
      hasExistingReview={false}
      requestDraft={requestDraft}
      onApply={onApply}
      {...props}
    />
  );

  return { requestDraft, onApply, ...utils };
}

describe('ReviewDraftAction', () => {
  it('does not call the API for a blank memo and shows a notice', async () => {
    const { user, requestDraft } = renderAction({ memo: '   ' });

    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));

    expect(requestDraft).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('asks before replacing an existing review, and skips the call on cancel', async () => {
    const { user, requestDraft, onApply } = renderAction({
      hasExistingReview: true,
    });

    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));
    expect(screen.getByText('적어 둔 후기를 초안으로 바꿀까요?')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '그대로 둘게요' }));
    expect(requestDraft).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));
    await user.click(screen.getByRole('button', { name: '초안으로 바꾸기' }));

    await waitFor(() => expect(onApply).toHaveBeenCalledWith(suggestion));
    expect(screen.getByRole('button', { name: '초안 다시 쓰기' })).toBeTruthy();
  });

  it('shows the server title of a 503', async () => {
    const { user } = renderAction({
      requestDraft: async () => {
        throw new AppError({
          code: 'HTTP_ERROR',
          status: 503,
          apiCode: 'REVIEW_SUGGESTION_UNAVAILABLE',
          message:
            '후기 제안을 지금은 사용할 수 없습니다. 잠시 후 다시 시도하세요.',
        });
      },
    });

    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      '후기 제안을 지금은 사용할 수 없습니다. 잠시 후 다시 시도하세요.'
    );
  });
});

describe('RegisterStepBasicInfo draft apply', () => {
  it('skips empty fields and replaces tags wholesale', async () => {
    const onFieldChange = vi.fn();
    const values: VisitBasicFormValues = {
      visitedAtDate: '',
      visitedAtTime: '',
      revisitIntent: null,
      oneLineReview: '',
      memo: '메모',
      pros: '기존 장점',
      cons: '',
      tags: ['옛태그'],
    };
    const { user } = renderWithMinimalProviders(
      <RegisterStepBasicInfo
        values={values}
        onFieldChange={onFieldChange}
        photos={[]}
        onAddPhotoFiles={() => {}}
        onCaptionChange={() => {}}
        onRemovePhoto={() => {}}
        onReorderPhotos={() => {}}
        photoUploadProgress={null}
        savedAtLabel=''
        errors={{}}
        reviewDraft={{ requestDraft: async () => suggestion }}
      />
    );
    server.use(http.get(`${API}/inspection-tags`, () => HttpResponse.json([])));

    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));
    await user.click(screen.getByRole('button', { name: '초안으로 바꾸기' }));

    await waitFor(() =>
      expect(onFieldChange).toHaveBeenCalledWith('tags', ['조용함'])
    );
    expect(onFieldChange).toHaveBeenCalledWith('oneLineReview', '조용한 동네');
    expect(onFieldChange).toHaveBeenCalledWith('cons', '- 주차 부족');
    expect(onFieldChange).not.toHaveBeenCalledWith('pros', expect.anything());
  });
});
