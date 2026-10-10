import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectionPropertyEditSection } from '@/domains/inspection/components/InspectionPropertyEditSection';
import { AUTOSAVE_DELAY_MS } from '@/domains/inspection/hooks/useAutosave';
import type {
  PropertyAnswer,
  ViewedPropertyDetail,
} from '@/domains/inspection/types';
import { AppError } from '@/lib/api/errors';
import { renderWithProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';

const useInspectionVisitPropertyMock = vi.fn();
const calls: string[] = [];
const updateMutateAsync = vi.fn();
const answersMutateAsync = vi.fn();
const statusMutateAsync = vi.fn();

function idleMutation(overrides: Record<string, unknown> = {}) {
  return {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
    ...overrides,
  };
}

vi.mock('@/domains/inspection/hooks/inspection-queries', () => ({
  useInspectionVisitProperty: (...args: unknown[]) =>
    useInspectionVisitPropertyMock(...args),
  useUpdateInspectionProperty: () =>
    idleMutation({ mutateAsync: updateMutateAsync }),
  useUpdateInspectionPropertyStatus: () =>
    idleMutation({ mutateAsync: statusMutateAsync }),
  useDeleteInspectionProperty: () => idleMutation(),
  useSaveInspectionPropertyAnswers: () =>
    idleMutation({ mutateAsync: answersMutateAsync }),
  useInspectionComplexNames: () => ({ data: [], isPending: false }),
}));

function answer(overrides: Partial<PropertyAnswer>): PropertyAnswer {
  return {
    questionId: 'q-text',
    questionVersionNo: 1,
    question: '채광 상태는 어떤가?',
    description: null,
    answerType: 'LONG_TEXT',
    required: true,
    sortOrder: 1,
    unit: null,
    answered: false,
    choiceOptions: [],
    textValue: null,
    booleanValue: null,
    numberValue: null,
    ratingValue: null,
    selectedCodes: [],
    isCurrentVersion: true,
    questionEnabled: true,
    categoryId: 'cat-1',
    categoryName: '채광·환기',
    categorySortOrder: 1,
    ...overrides,
  };
}

function property(): ViewedPropertyDetail {
  return {
    propertyId: 'prop-1',
    visitId: 'visit-1',
    areaId: 'area-1',
    areaName: '성수동',
    visitedAt: '2026-09-17T14:00',
    complexName: '검증단지',
    name: '검증매물A',
    memo: null,
    oneLineReview: null,
    pros: null,
    cons: null,
    interestLevel: 3,
    status: 'DRAFT',
    sortOrder: 1,
    tags: [],
    cover: null,
    photos: [],
    answers: [
      answer({}),
      answer({
        questionId: 'q-dir',
        question: '방향은?',
        answerType: 'SINGLE_SELECT',
        required: false,
        sortOrder: 2,
        choiceOptions: [{ code: 'SOUTH', label: '남향', sortOrder: 1 }],
      }),
    ],
    incompleteSummary: {
      unansweredRequiredCount: 1,
      unansweredRequiredQuestions: [],
      missingFields: [],
      draftPropertyCount: 0,
      visitMissingFields: [],
      draftVisitCount: 0,
      plannedVisitCount: 0,
    },
    prevProperty: null,
    nextProperty: null,
    location: null,
  };
}

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid='location'>
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderEdit(route?: string) {
  return renderWithProviders(
    <>
      <InspectionPropertyEditSection
        device='main'
        areaId='area-1'
        visitId='visit-1'
        propertyId='prop-1'
      />
      <LocationProbe />
    </>,
    { route }
  );
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('InspectionPropertyEditSection autosave', () => {
  beforeEach(() => {
    calls.length = 0;
    updateMutateAsync.mockImplementation(async () => {
      calls.push('update');
      return property();
    });
    answersMutateAsync.mockImplementation(async () => {
      calls.push('answers');
    });
    statusMutateAsync.mockImplementation(async () => {
      calls.push('status');
    });
    useInspectionVisitPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not save just because the screen opened', async () => {
    renderEdit();

    expect(screen.getByDisplayValue('검증매물A')).toBeTruthy();
    await wait(AUTOSAVE_DELAY_MS + 300);

    expect(updateMutateAsync).not.toHaveBeenCalled();
    expect(answersMutateAsync).not.toHaveBeenCalled();
  });

  it('saves a field edit once, 2 seconds after typing stops', async () => {
    const { user } = renderEdit();

    await user.type(screen.getByLabelText('한줄평'), '채광 좋음');
    await wait(AUTOSAVE_DELAY_MS - 500);
    expect(updateMutateAsync).not.toHaveBeenCalled();

    await waitFor(
      () =>
        expect(updateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ oneLineReview: '채광 좋음' })
        ),
      { timeout: 1500 }
    );
    expect(updateMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('batches text and choice answers into one request 2 seconds after the last input', async () => {
    const { user } = renderEdit();

    await user.click(screen.getByRole('button', { name: '남향' }));
    await user.type(screen.getByLabelText(/채광 상태는 어떤가/), '밝다');
    await wait(AUTOSAVE_DELAY_MS - 500);
    expect(answersMutateAsync).not.toHaveBeenCalled();

    await waitFor(() => expect(answersMutateAsync).toHaveBeenCalledTimes(1), {
      timeout: 1500,
    });
    expect(answersMutateAsync).toHaveBeenCalledWith(
      expect.arrayContaining([
        { questionId: 'q-dir', selectedCodes: ['SOUTH'] },
        { questionId: 'q-text', textValue: '밝다' },
      ])
    );
  });

  it('sends pending answers before completing instead of waiting out the delay', async () => {
    const { user } = renderEdit();

    await user.type(screen.getByLabelText(/채광 상태는 어떤가/), '밝다');
    await user.click(screen.getByRole('button', { name: '매물 완료' }));

    await waitFor(() => expect(statusMutateAsync).toHaveBeenCalled());
    expect(calls.indexOf('answers')).toBeGreaterThanOrEqual(0);
    expect(calls.indexOf('answers')).toBeLessThan(calls.indexOf('status'));

    await wait(AUTOSAVE_DELAY_MS + 300);
    expect(answersMutateAsync).toHaveBeenCalledTimes(1);
  });

  it('sends a pending edit when the screen is left inside the delay window', async () => {
    const { user, unmount } = renderEdit();

    await user.type(screen.getByLabelText('한줄평'), '떠나기 직전');
    await user.click(screen.getByRole('button', { name: '남향' }));
    unmount();

    expect(updateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ oneLineReview: '떠나기 직전' })
    );
    await waitFor(() =>
      expect(answersMutateAsync).toHaveBeenCalledWith([
        { questionId: 'q-dir', selectedCodes: ['SOUTH'] },
      ])
    );
  });
});

describe('InspectionPropertyEditSection return target', () => {
  beforeEach(() => {
    updateMutateAsync.mockResolvedValue(property());
    statusMutateAsync.mockResolvedValue(undefined);
    useInspectionVisitPropertyMock.mockReturnValue({
      data: property(),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  async function completeProperty(user: ReturnType<typeof renderEdit>['user']) {
    await user.type(screen.getByLabelText(/채광 상태는 어떤가/), '밝다');
    await user.click(screen.getByRole('button', { name: '매물 완료' }));
  }

  it('returns to the register wizard by default', async () => {
    const { user } = renderEdit();

    await completeProperty(user);

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/register?draft=visit-1'
      )
    );
  });

  it('returns to the area detail on the same visit when opened from there', async () => {
    const { user } = renderEdit('/?from=area');

    await completeProperty(user);

    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(
        '/main/inspection/area-1?visit=visit-1'
      )
    );
  });
});

describe('InspectionPropertyEditSection location', () => {
  const savedLocation = {
    bdMgtSn: 'B-SAVED',
    roadAddress: '서울특별시 성동구 용답토방길 135',
    latitude: 37.5,
    longitude: 127.0,
  };
  const candidate = {
    roadAddress: '서울특별시 성동구 새길 1',
    jibunAddress: null,
    buildingName: '새건물',
    bdMgtSn: 'B-NEW',
    zipNo: null,
    coordKey: {
      admCd: '1',
      rnMgtSn: '2',
      udrtYn: '0',
      buldMnnm: '1',
      buldSlno: '0',
    },
  };

  function mockProperty(location: ViewedPropertyDetail['location']) {
    const detail = { ...property(), location };
    useInspectionVisitPropertyMock.mockReturnValue({
      data: detail,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    updateMutateAsync.mockResolvedValue(detail);

    return detail;
  }

  function mockSearch() {
    server.use(
      http.get('*/geo/addresses', () =>
        HttpResponse.json({ totalCount: 1, items: [candidate] })
      )
    );
  }

  function httpError(status: number, apiCode: string) {
    return new AppError({
      code: 'HTTP_ERROR',
      message: `서버: ${apiCode}`,
      status,
      apiCode,
    });
  }

  async function pickCandidate(user: ReturnType<typeof renderEdit>['user']) {
    await user.type(screen.getByLabelText('주소'), '새건물');
    await user.click(await screen.findByRole('option'));
  }

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the saved location in every PUT (location key is always present)', async () => {
    mockProperty(savedLocation);
    const { user } = renderEdit();

    await user.type(screen.getByLabelText('한줄평'), '메모만 수정');
    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });

    expect(updateMutateAsync.mock.calls[0][0].location).toEqual({
      bdMgtSn: 'B-SAVED',
      roadAddress: '서울특별시 성동구 용답토방길 135',
    });
  });

  it('sends location: null explicitly when the property has none', async () => {
    mockProperty(null);
    const { user } = renderEdit();

    await user.type(screen.getByLabelText('한줄평'), '위치 없음');
    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });

    const body = updateMutateAsync.mock.calls[0][0];
    expect('location' in body).toBe(true);
    expect(body.location).toBeNull();
  });

  it('saves a picked address right away, with its coordKey', async () => {
    mockProperty(null);
    mockSearch();
    const { user } = renderEdit();

    await pickCandidate(user);

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1), {
      timeout: 1000,
    });
    expect(updateMutateAsync.mock.calls[0][0].location).toEqual({
      bdMgtSn: 'B-NEW',
      roadAddress: '서울특별시 성동구 새길 1',
      coordKey: candidate.coordKey,
    });
  });

  it('clears the location right away with location: null', async () => {
    mockProperty(savedLocation);
    const { user } = renderEdit();

    await user.click(screen.getByRole('button', { name: '위치 지우기' }));

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(1), {
      timeout: 1000,
    });
    expect(updateMutateAsync.mock.calls[0][0].location).toBeNull();
  });

  it('on a location error reverts to the confirmed location, resends once, and explains', async () => {
    mockProperty(savedLocation);
    mockSearch();
    updateMutateAsync
      .mockRejectedValueOnce(httpError(400, 'ADDRESS_COORDINATE_NOT_FOUND'))
      .mockResolvedValue({ ...property(), location: savedLocation });
    const { user } = renderEdit();

    await user.click(screen.getByRole('button', { name: '변경' }));
    await pickCandidate(user);

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(2));
    expect(updateMutateAsync.mock.calls[0][0].location.bdMgtSn).toBe('B-NEW');
    expect(updateMutateAsync.mock.calls[1][0].location).toEqual({
      bdMgtSn: 'B-SAVED',
      roadAddress: '서울특별시 성동구 용답토방길 135',
    });

    const message = await screen.findByText(/주소는 저장하지 못했습니다/);
    expect(message.textContent).toContain(
      '가까운 다른 건물을 고르거나 위치 없이 두세요'
    );
    // The form shows the confirmed address again.
    expect(screen.getByText('서울특별시 성동구 용답토방길 135')).toBeTruthy();
  });

  it('on 503 resends with the confirmed location and disables the address field', async () => {
    mockProperty(null);
    mockSearch();
    updateMutateAsync
      .mockRejectedValueOnce(httpError(503, 'ADDRESS_LOOKUP_UNAVAILABLE'))
      .mockResolvedValue({ ...property(), location: null });
    const { user } = renderEdit();

    await pickCandidate(user);

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(2));
    expect(updateMutateAsync.mock.calls[1][0].location).toBeNull();
    expect(await screen.findByText(/지금은 주소를 쓸 수 없어요/)).toBeTruthy();
    expect((screen.getByLabelText('주소') as HTMLInputElement).disabled).toBe(
      true
    );
  });

  it('falls back to the normal save error when the resend fails too', async () => {
    mockProperty(null);
    mockSearch();
    updateMutateAsync
      .mockRejectedValueOnce(httpError(502, 'ADDRESS_LOOKUP_FAILED'))
      .mockRejectedValueOnce(httpError(500, 'INTERNAL'));
    const { user } = renderEdit();

    await pickCandidate(user);

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('서버: INTERNAL')).toBeTruthy();
  });
});
