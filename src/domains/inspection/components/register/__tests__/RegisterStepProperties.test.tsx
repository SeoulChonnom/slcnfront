import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterStepProperties } from '@/domains/inspection/components/register/RegisterStepProperties';
import { renderWithProviders } from '@/test/helpers/render';

const getVisit = vi.fn();
const reorderVisitProperties = vi.fn();

vi.mock('@/domains/inspection/api/inspection-api', () => ({
  inspectionApi: {
    getVisit: (visitId: string) => getVisit(visitId),
    reorderVisitProperties: (visitId: string, items: unknown) =>
      reorderVisitProperties(visitId, items),
  },
}));

vi.mock('@/domains/inspection/components/AddPropertyForm', () => ({
  AddPropertyForm: () => null,
}));

const emptySummary = {
  unansweredRequiredCount: 0,
  unansweredRequiredQuestions: [],
  missingFields: [],
  draftPropertyCount: 0,
  visitMissingFields: [],
  draftVisitCount: 0,
  plannedVisitCount: 0,
};

function makeProperty(
  id: string,
  complexName: string,
  sortOrder: number,
  overrides: Record<string, unknown> = {}
) {
  return {
    propertyId: id,
    complexName,
    name: null,
    status: 'COMPLETED',
    sortOrder,
    interestLevel: null,
    incompleteSummary: emptySummary,
    location: null,
    ...overrides,
  };
}

function makeVisit(completedAt: string | null, properties: unknown[]) {
  return {
    visitId: 'visit-1',
    area: { areaId: 'area-1', name: '성수동' },
    status: 'DRAFT',
    completedAt,
    properties,
  };
}

function rowOrder() {
  const list = document.querySelector(
    '.slcn-inspection-register-property-list'
  ) as HTMLElement;

  return within(list)
    .getAllByRole('listitem')
    .map((row) => /(트리마제|자이|래미안)/.exec(row.textContent ?? '')?.[1]);
}

beforeEach(() => {
  getVisit.mockReset();
  reorderVisitProperties.mockReset();
});

describe('RegisterStepProperties draft badge', () => {
  it('hides the property "작성 중" badge while the visit is planned', async () => {
    getVisit.mockResolvedValue(
      makeVisit(null, [
        makeProperty('prop-1', '트리마제', 0, {
          status: 'DRAFT',
          incompleteSummary: { ...emptySummary, unansweredRequiredCount: 2 },
        }),
      ])
    );
    renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    expect(await screen.findByText(/트리마제/)).toBeTruthy();
    expect(screen.queryByText('작성 중')).toBeNull();
  });

  it('shows the property "작성 중" badge and reason while the visit is being revised', async () => {
    getVisit.mockResolvedValue(
      makeVisit('2026-09-17T18:30', [
        makeProperty('prop-1', '트리마제', 0, {
          status: 'DRAFT',
          incompleteSummary: { ...emptySummary, unansweredRequiredCount: 2 },
        }),
      ])
    );
    renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    expect(await screen.findByText('작성 중')).toBeTruthy();
    expect(screen.getByText(/필수 문답 2개 남음/)).toBeTruthy();
  });
});

describe('RegisterStepProperties ordering', () => {
  const properties = () => [
    makeProperty('p-a', '트리마제', 2),
    makeProperty('p-b', '자이', 5),
    makeProperty('p-c', '래미안', 9),
  ];

  it('renders the API array order without re-sorting by sortOrder', async () => {
    getVisit.mockResolvedValue(
      makeVisit(null, [
        makeProperty('p-a', '트리마제', 5),
        makeProperty('p-b', '자이', 2),
        makeProperty('p-c', '래미안', 9),
      ])
    );
    renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    await screen.findAllByLabelText('위로 이동');
    expect(rowOrder()).toEqual(['트리마제', '자이', '래미안']);
  });

  it('sends only the two swapped rows with swapped sortOrder values, optimistically', async () => {
    getVisit.mockResolvedValue(makeVisit(null, properties()));
    let release: () => void = () => undefined;
    reorderVisitProperties.mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      })
    );
    const { user } = renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    const down = await screen.findAllByLabelText('아래로 이동');
    await user.click(down[0]);

    expect(reorderVisitProperties).toHaveBeenCalledWith('visit-1', [
      { id: 'p-a', sortOrder: 5 },
      { id: 'p-b', sortOrder: 2 },
    ]);
    // Visible before the request resolves.
    await waitFor(() =>
      expect(rowOrder()).toEqual(['자이', '트리마제', '래미안'])
    );
    release();
  });

  it('rolls back and shows an error line when the request fails', async () => {
    getVisit.mockResolvedValue(makeVisit(null, properties()));
    reorderVisitProperties.mockRejectedValue(new Error('boom'));
    const { user } = renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    const up = await screen.findAllByLabelText('위로 이동');
    await user.click(up[1]);

    expect(await screen.findByRole('alert')).toBeTruthy();
    await waitFor(() =>
      expect(rowOrder()).toEqual(['트리마제', '자이', '래미안'])
    );
  });

  it('falls back to a full index-based request when the two sortOrders tie', async () => {
    getVisit.mockResolvedValue(
      makeVisit(null, [
        makeProperty('p-a', '트리마제', 1),
        makeProperty('p-b', '자이', 1),
        makeProperty('p-c', '래미안', 1),
      ])
    );
    reorderVisitProperties.mockResolvedValue(undefined);
    const { user } = renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    const down = await screen.findAllByLabelText('아래로 이동');
    await user.click(down[0]);

    expect(reorderVisitProperties).toHaveBeenCalledWith('visit-1', [
      { id: 'p-b', sortOrder: 0 },
      { id: 'p-a', sortOrder: 1 },
      { id: 'p-c', sortOrder: 2 },
    ]);
  });

  it('shows the route list with an unlocated count and no map without a Kakao key', async () => {
    getVisit.mockResolvedValue(
      makeVisit(null, [
        makeProperty('p-a', '트리마제', 0, {
          location: {
            bdMgtSn: 'X',
            roadAddress: null,
            latitude: 37.5,
            longitude: 127,
          },
        }),
        makeProperty('p-b', '자이', 1),
      ])
    );
    renderWithProviders(
      <RegisterStepProperties device='main' visitId='visit-1' />
    );

    expect(await screen.findByText('위치 미지정 1건')).toBeTruthy();
    expect(screen.queryByRole('region', { name: '방문 순서 지도' })).toBeNull();
  });
});
