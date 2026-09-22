import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectionRegisterSection } from '@/domains/inspection/components/InspectionRegisterSection';
import type {
  InspectionAreaListParams,
  InspectionAreaListResult,
  InspectionVisitCdo,
  InspectionVisitDetail,
  InspectionVisitUdo,
} from '@/domains/inspection/types';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const {
  getAreaList,
  createVisit,
  updateVisit,
  getVisit,
  getComplexNames,
  getTags,
} = vi.hoisted(() => ({
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
  },
}));

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
        topProperty: null,
        incompleteSummary: {
          unansweredRequiredCount: 0,
          unansweredRequiredQuestions: [],
          missingFields: [],
          draftPropertyCount: 0,
          visitMissingFields: [],
          draftVisitCount: 0,
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
    },
    ...overrides,
  };
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
    const dateInput = screen.getByLabelText(/^임장 일시/);
    await user.type(dateInput, '2026-09-17');

    await new Promise((resolve) => setTimeout(resolve, 950));
    expect(createVisit).not.toHaveBeenCalled();

    const timeInput = screen.getByLabelText(/^시각/);
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
});
