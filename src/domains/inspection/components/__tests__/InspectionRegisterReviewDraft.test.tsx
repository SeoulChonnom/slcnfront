import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectionRegisterSection } from '@/domains/inspection/components/InspectionRegisterSection';
import type { InspectionVisitDetail } from '@/domains/inspection/types';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const { getAreaList, createVisit, updateVisit, suggestVisitReview } =
  vi.hoisted(() => ({
    getAreaList: vi.fn(),
    createVisit: vi.fn(),
    updateVisit: vi.fn(),
    suggestVisitReview: vi.fn(),
  }));

vi.mock('@/domains/inspection/api/inspection-api', () => ({
  inspectionApi: {
    getAreaList,
    createVisit,
    updateVisit,
    suggestVisitReview,
    getVisit: vi.fn(),
    getComplexNames: vi.fn(async () => []),
    getTags: vi.fn(async () => []),
  },
}));

vi.mock('@/domains/inspection/api/inspection-files-api', () => ({
  inspectionFilesApi: { uploadInspectionFiles: vi.fn(async () => []) },
}));

const area = {
  areaId: 'area-1',
  name: '성수동',
  description: null,
  visitCount: 0,
  firstVisitedAt: null,
  lastVisitedAt: null,
  totalPropertyCount: 0,
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
};

function detail(): InspectionVisitDetail {
  return {
    visitId: 'visit-9',
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
      visitMissingFields: [],
      draftVisitCount: 0,
    },
  };
}

async function goToStep2(
  user: ReturnType<typeof renderWithMinimalProviders>['user']
) {
  await user.click(await screen.findByRole('button', { name: /성수동/ }));
  await user.click(screen.getByRole('button', { name: '다음' }));
}

describe('register wizard AI draft', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAreaList.mockResolvedValue({
      items: [area],
      totalCount: 1,
      hasNext: false,
      revisitIntentCounts: { total: 1, YES: 0, MAYBE: 0, NO: 0, UNDECIDED: 1 },
      totals: { areaCount: 1, visitCount: 0, propertyCount: 0 },
    });
    createVisit.mockResolvedValue(detail());
    updateVisit.mockResolvedValue(detail());
    suggestVisitReview.mockResolvedValue({
      oneLineReview: '좋다',
      pros: '',
      cons: '',
      tags: [],
    });
  });

  it('explains and does not call anything when the visit date is missing', async () => {
    const { user } = renderWithMinimalProviders(
      <InspectionRegisterSection device='main' />
    );
    await goToStep2(user);

    await user.type(screen.getByLabelText('전체 메모'), '한강뷰');
    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      '방문 날짜와 시각을 먼저 입력해 주세요. 임시저장한 뒤 초안을 만들 수 있어요.'
    );
    expect(createVisit).not.toHaveBeenCalled();
    expect(suggestVisitReview).not.toHaveBeenCalled();
  });

  it('creates the draft visit first, then requests the suggestion with its id', async () => {
    const { user } = renderWithMinimalProviders(
      <InspectionRegisterSection device='main' />
    );
    await goToStep2(user);

    await user.type(screen.getByLabelText(/^임장 일시/), '2026-09-17');
    await user.type(screen.getByLabelText(/^시각/), '1400');
    await user.type(screen.getByLabelText('전체 메모'), '한강뷰');
    await user.click(screen.getByRole('button', { name: '메모로 초안 쓰기' }));

    await waitFor(() =>
      expect(suggestVisitReview).toHaveBeenCalledWith('visit-9', {
        memo: '한강뷰',
      })
    );
    expect(createVisit).toHaveBeenCalledTimes(1);
  });
});
