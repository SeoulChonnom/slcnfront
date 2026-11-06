import { act, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectionRegisterSection } from '@/domains/inspection/components/InspectionRegisterSection';
import type {
  InspectionAreaListParams,
  InspectionAreaListResult,
  InspectionVisitCdo,
  InspectionVisitDetail,
  InspectionVisitUdo,
} from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const {
  getAreaList,
  createVisit,
  updateVisit,
  getVisit,
  getComplexNames,
  getTags,
  updateVisitStatus,
} = vi.hoisted(() => ({
  updateVisitStatus: vi.fn(),
  getAreaList:
    vi.fn<
      (params: InspectionAreaListParams) => Promise<InspectionAreaListResult>
    >(),
  createVisit:
    vi.fn<(payload: InspectionVisitCdo) => Promise<InspectionVisitDetail>>(),
  updateVisit:
    vi.fn<
      (
        visitId: string,
        payload: InspectionVisitUdo
      ) => Promise<InspectionVisitDetail>
    >(),
  getVisit: vi.fn<(visitId: string) => Promise<InspectionVisitDetail>>(),
  getComplexNames: vi.fn(async () => [] as string[]),
  getTags: vi.fn(async () => []),
}));

vi.mock('@/domains/inspection/api/inspection-api', () => ({
  inspectionApi: {
    getAreaList,
    createVisit,
    updateVisit,
    getVisit,
    getComplexNames,
    getTags,
    updateVisitStatus,
  },
}));

vi.mock(
  '@/domains/inspection/components/register/RegisterStepProperties',
  () => ({ RegisterStepProperties: () => <div>확인 매물 단계</div> })
);

function LocationProbe() {
  const location = useLocation();

  return (
    <div data-testid='location'>{`${location.pathname}${location.search}`}</div>
  );
}

vi.mock('@/domains/inspection/api/inspection-files-api', () => ({
  inspectionFilesApi: {
    uploadInspectionFiles: vi.fn(async () => []),
  },
}));

function areaListResult(): InspectionAreaListResult {
  return {
    items: [
      {
        areaId: 'area-1',
        name: '성수동',
        description: '서울숲 인근',
        visitCount: 2,
        firstVisitedAt: '2026-01-01T10:00',
        lastVisitedAt: '2026-08-01T10:00',
        totalPropertyCount: 3,
        latestVisit: null,
        plannedVisit: null,
        topProperty: null,
        incompleteSummary: {
          unansweredRequiredCount: 0,
          unansweredRequiredQuestions: [],
          missingFields: [],
          draftPropertyCount: 0,
          visitMissingFields: [],
          draftVisitCount: 0,
          plannedVisitCount: 0,
        },
        thumbnails: [],
        totalImageCount: 0,
        matchedProperty: null,
      },
    ],
    totalCount: 1,
    hasNext: false,
    revisitIntentCounts: { total: 1, YES: 0, MAYBE: 0, NO: 0, UNDECIDED: 1 },
    totals: { areaCount: 1, visitCount: 2, propertyCount: 3 },
  };
}

function visitDetail(
  overrides: Partial<InspectionVisitDetail> = {}
): InspectionVisitDetail {
  return {
    visitId: 'visit-1',
    area: { areaId: 'area-1', name: '성수동' },
    visitedAt: '2026-09-17T14:00',
    memo: null,
    revisitIntent: null,
    oneLineReview: null,
    pros: null,
    cons: null,
    status: 'DRAFT',
    completedAt: null,
    tags: [],
    properties: [],
    cover: null,
    photos: [],
    incompleteSummary: {
      unansweredRequiredCount: 0,
      unansweredRequiredQuestions: [],
      missingFields: [],
      draftPropertyCount: 0,
      visitMissingFields: ['revisitIntent'],
      draftVisitCount: 0,
      plannedVisitCount: 0,
    },
    ...overrides,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe('InspectionRegisterSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAreaList.mockResolvedValue(areaListResult());
    createVisit.mockResolvedValue(visitDetail());
    updateVisit.mockResolvedValue(visitDetail());
    getVisit.mockResolvedValue(visitDetail());
  });

  it('disables "다음" until an area is chosen, then advances after picking one', async () => {
    const { user } = renderWithMinimalProviders(
      <InspectionRegisterSection device='main' />
    );

    const nextButton = screen.getByRole('button', { name: '다음' });

    expect(nextButton.hasAttribute('disabled')).toBe(true);
    expect(
      screen.getByText('먼저 지역을 고르거나 새로 만들어 주세요.')
    ).toBeTruthy();

    const areaRow = await screen.findByRole('button', {
      name: /성수동/,
    });

    await user.click(areaRow);

    expect(nextButton.hasAttribute('disabled')).toBe(false);
  });

  it('never calls createVisit before visitedAt is filled in, and calls it once it is', async () => {
    const { user } = renderWithMinimalProviders(
      <InspectionRegisterSection device='main' />
    );

    const areaRow = await screen.findByRole('button', { name: /성수동/ });
    await user.click(areaRow);
    await user.click(screen.getByRole('button', { name: '다음' }));

    // Step 2: still nothing saved.
    expect(screen.getByText('아직 저장되지 않았습니다')).toBeTruthy();
    expect(createVisit).not.toHaveBeenCalled();

    // Fill only the date — still no visitedAt (needs a time too).
    const dateInput = screen.getByLabelText(/^예정일/);
    await user.type(dateInput, '2026-09-17');

    await new Promise((resolve) => setTimeout(resolve, 950));
    expect(createVisit).not.toHaveBeenCalled();

    const timeInput = screen.getByLabelText(/^예정 시각/);
    await user.type(timeInput, '1400');

    await waitFor(() => expect(createVisit).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });

    const [payload] = createVisit.mock.calls[0];

    expect(payload).toMatchObject({
      areaId: 'area-1',
      visitedAt: '2026-09-17T14:00',
    });

    await waitFor(() =>
      expect(screen.queryByText('아직 저장되지 않았습니다')).toBeFalsy()
    );
  });

  async function goToStep2(
    user: ReturnType<typeof renderWithMinimalProviders>['user']
  ) {
    await user.click(await screen.findByRole('button', { name: /성수동/ }));
    await user.click(screen.getByRole('button', { name: '다음' }));
  }

  it('plans a visit with only the date and time, hiding every result field', async () => {
    const { user } = renderWithMinimalProviders(
      <InspectionRegisterSection device='main' />
    );
    await goToStep2(user);

    expect(screen.getByLabelText(/^예정일/)).toBeTruthy();
    expect(screen.getByLabelText('전체 메모')).toBeTruthy();
    expect(
      screen.getByText('다녀온 뒤 임장 수정 화면에서 결과를 쓰고 완료해요')
    ).toBeTruthy();

    expect(screen.queryByText('재방문 의사')).toBeNull();
    expect(screen.queryByLabelText('한줄평')).toBeNull();
    expect(screen.queryByLabelText('장점')).toBeNull();
    expect(screen.queryByLabelText('단점')).toBeNull();
    expect(screen.queryByText('임장 사진')).toBeNull();
    expect(
      screen.queryByRole('button', { name: '메모로 초안 쓰기' })
    ).toBeNull();

    // Blocked until the date and time exist — and only those.
    expect(
      screen.getByRole('button', { name: '다음' }).hasAttribute('disabled')
    ).toBe(true);
    expect(
      screen.getByText('예정일과 시각을 입력해야 다음으로 갈 수 있어요.')
    ).toBeTruthy();

    await user.type(screen.getByLabelText(/^예정일/), '2026-10-12');
    await user.type(screen.getByLabelText(/^예정 시각/), '1400');

    expect(
      screen.getByRole('button', { name: '다음' }).hasAttribute('disabled')
    ).toBe(false);
  });

  it('saves the plan and opens the area detail on that visit without a status change', async () => {
    const { user } = renderWithMinimalProviders(
      <>
        <InspectionRegisterSection device='main' />
        <LocationProbe />
      </>
    );
    await goToStep2(user);

    await user.type(screen.getByLabelText(/^예정일/), '2026-10-12');
    await user.type(screen.getByLabelText(/^예정 시각/), '1400');
    await waitFor(() => expect(createVisit).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    await user.click(screen.getByRole('button', { name: '다음' }));
    await screen.findByText('확인 매물 단계');

    expect(screen.queryByRole('button', { name: '임장 완료' })).toBeNull();

    await user.click(screen.getByRole('button', { name: '계획 저장' }));

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1?visit=visit-1'
      )
    );
    expect(createVisit).toHaveBeenCalledTimes(1);
    expect(updateVisitStatus).not.toHaveBeenCalled();
  });

  it('keeps an edited draft after a failed plan save and navigates only after a successful retry', async () => {
    const route = '/main/inspection/register?draft=visit-1';
    getVisit.mockResolvedValue(visitDetail({ memo: '저장된 메모' }));
    updateVisit.mockRejectedValueOnce(
      new AppError({
        code: 'HTTP_ERROR',
        status: 500,
        message: '계획을 저장하지 못했습니다',
      })
    );
    const { user } = renderWithMinimalProviders(
      <>
        <InspectionRegisterSection device='main' />
        <LocationProbe />
      </>,
      { route }
    );
    await screen.findByText('확인 매물 단계');
    await user.click(screen.getByRole('button', { name: '기본 정보' }));
    await user.clear(screen.getByLabelText('전체 메모'));
    await user.type(screen.getByLabelText('전체 메모'), '보존할 새 메모');
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: '계획 저장' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      '계획을 저장하지 못했습니다'
    );
    expect(screen.getByText('확인 매물 단계').closest('[inert]')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe(route);
    expect(updateVisit).toHaveBeenLastCalledWith(
      'visit-1',
      expect.objectContaining({ memo: '보존할 새 메모' })
    );
    await user.click(screen.getByRole('button', { name: '이전' }));
    expect(
      (screen.getByLabelText('전체 메모') as HTMLTextAreaElement).value
    ).toBe('보존할 새 메모');

    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: '계획 저장' }));
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1?visit=visit-1'
      )
    );
    expect(updateVisit).toHaveBeenCalledTimes(2);
    expect(updateVisit).toHaveBeenLastCalledWith(
      'visit-1',
      expect.objectContaining({ memo: '보존할 새 메모' })
    );
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('waits for an in-flight autosave and saves the latest edits before navigating', async () => {
    const route = '/main/inspection/register?draft=visit-1';
    const autosave = deferred<InspectionVisitDetail>();
    const finalSave = deferred<InspectionVisitDetail>();
    updateVisit
      .mockReturnValueOnce(autosave.promise)
      .mockReturnValueOnce(finalSave.promise);
    const { user } = renderWithMinimalProviders(
      <>
        <InspectionRegisterSection device='main' />
        <LocationProbe />
      </>,
      { route }
    );
    await screen.findByText('확인 매물 단계');
    await user.click(screen.getByRole('button', { name: '기본 정보' }));
    await user.type(screen.getByLabelText('전체 메모'), '자동 저장 중 메모');
    await waitFor(() => expect(updateVisit).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    await user.clear(screen.getByLabelText('전체 메모'));
    await user.type(screen.getByLabelText('전체 메모'), '저장할 최신 메모');
    await user.click(screen.getByRole('button', { name: '다음' }));
    await user.click(screen.getByRole('button', { name: '계획 저장' }));

    expect(updateVisit).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('location').textContent).toBe(route);
    await act(async () => {
      autosave.resolve(visitDetail({ memo: '자동 저장 중 메모' }));
    });
    await waitFor(() => expect(updateVisit).toHaveBeenCalledTimes(2));
    expect(updateVisit).toHaveBeenLastCalledWith(
      'visit-1',
      expect.objectContaining({ memo: '저장할 최신 메모' })
    );
    expect(screen.getByTestId('location').textContent).toBe(route);

    await act(async () => {
      finalSave.resolve(visitDetail({ memo: '저장할 최신 메모' }));
    });
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1?visit=visit-1'
      )
    );
  });

  it('prevents returning to editable fields while the final plan save is pending', async () => {
    const route = '/main/inspection/register?draft=visit-1';
    const finalSave = deferred<InspectionVisitDetail>();
    getVisit.mockResolvedValue(visitDetail({ memo: '저장할 메모' }));
    updateVisit.mockReturnValueOnce(finalSave.promise);
    const { user } = renderWithMinimalProviders(
      <>
        <InspectionRegisterSection device='main' />
        <LocationProbe />
      </>,
      { route }
    );
    await screen.findByText('확인 매물 단계');
    await user.click(screen.getByRole('button', { name: '계획 저장' }));
    await waitFor(() => expect(updateVisit).toHaveBeenCalledTimes(1));

    expect(
      screen.getByText('확인 매물 단계').closest('[inert]')
    ).not.toBeNull();
    for (const button of screen.getAllByRole('button')) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
    await user.click(screen.getByRole('button', { name: '기본 정보' }));
    await user.click(screen.getByRole('button', { name: '이전' }));
    expect(screen.queryByLabelText('전체 메모')).toBeNull();
    expect(screen.getByTestId('location').textContent).toBe(route);

    await act(async () => {
      finalSave.resolve(visitDetail({ memo: '저장할 메모' }));
    });
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1?visit=visit-1'
      )
    );
  });
});
