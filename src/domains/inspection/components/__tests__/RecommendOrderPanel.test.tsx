import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecommendOrderPanel } from '@/domains/inspection/components/RecommendOrderPanel';
import { renderWithProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';

const reorderVisitProperties = vi.fn();

vi.mock('@/domains/inspection/api/inspection-api', () => ({
  inspectionApi: {
    reorderVisitProperties: (visitId: string, items: unknown) =>
      reorderVisitProperties(visitId, items),
  },
}));

const candidate = {
  roadAddress: '서울특별시 성동구 용답토방길 135',
  jibunAddress: null,
  buildingName: '트리마제',
  bdMgtSn: 'origin-1',
  zipNo: null,
  coordKey: {
    admCd: '1',
    rnMgtSn: '2',
    udrtYn: '0',
    buldMnnm: '135',
    buldSlno: '0',
  },
};

// Distinctive so a leak into any cache or storage is easy to spot.
const ORIGIN = { latitude: 37.521737, longitude: 127.000123 };

function property(
  id: string,
  complexName: string,
  sortOrder: number,
  latitude: number | null
) {
  return {
    propertyId: id,
    complexName,
    name: null,
    sortOrder,
    location:
      latitude === null
        ? null
        : { bdMgtSn: `bd-${id}`, roadAddress: null, latitude, longitude: 127 },
  };
}

// Screen order A, B, C along a north-going street.
const LINE = [
  property('p-a', '가단지', 0, 37.5),
  property('p-b', '나단지', 1, 37.51),
  property('p-c', '다단지', 2, 37.52),
];

function mockGeo(
  currentLocation: () => Response | Promise<Response> = () =>
    HttpResponse.json(ORIGIN)
) {
  server.use(
    http.get('*/geo/addresses', () =>
      HttpResponse.json({ totalCount: 1, items: [candidate] })
    ),
    http.post('*/geo/current-location', currentLocation)
  );
}

function apiError(status: number, code: string) {
  return HttpResponse.json(
    { title: '오류', status, code, errors: [] },
    { status }
  );
}

async function pickOrigin(
  user: ReturnType<typeof renderWithProviders>['user']
) {
  await user.click(screen.getByRole('button', { name: '추천 순서로 정렬' }));
  await user.type(screen.getByRole('combobox'), '트리마제');
  await user.click(await screen.findByRole('option'));
}

function renderPanel(
  properties = LINE,
  phase: 'PLANNED' | 'REVISING' | 'COMPLETED' = 'PLANNED'
) {
  return renderWithProviders(
    <RecommendOrderPanel
      visitId='visit-1'
      phase={phase}
      properties={properties}
    />
  );
}

beforeEach(() => {
  reorderVisitProperties.mockReset();
  reorderVisitProperties.mockResolvedValue(undefined);
});

describe('RecommendOrderPanel trigger', () => {
  it('is hidden for completed visits', () => {
    renderPanel(LINE, 'COMPLETED');

    expect(
      screen.queryByRole('button', { name: '추천 순서로 정렬' })
    ).toBeNull();
  });

  it('is disabled with a hint when fewer than two stops have a location', () => {
    renderPanel([LINE[0], property('p-x', '무위치', 1, null)]);

    const trigger = screen.getByRole('button', { name: '추천 순서로 정렬' });
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getByText('위치가 있는 매물이 2곳 이상 필요해요')
    ).toBeTruthy();
  });

  it('is available for revising visits', () => {
    renderPanel(LINE, 'REVISING');

    const trigger = screen.getByRole('button', { name: '추천 순서로 정렬' });
    expect((trigger as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('RecommendOrderPanel flow', () => {
  it('previews distances and order, applies a full index list, and undoes it', async () => {
    mockGeo();
    const { user } = renderPanel();
    await pickOrigin(user);

    expect(await screen.findByText(/현재 순서 .+ → 추천/)).toBeTruthy();
    expect(screen.getByText('직선 기준 추정')).toBeTruthy();
    const items = screen
      .getAllByRole('listitem')
      .map((li) => li.textContent ?? '');
    expect(items.map((t) => t.slice(0, 3))).toEqual([
      '다단지',
      '나단지',
      '가단지',
    ]);

    await user.click(screen.getByRole('button', { name: '적용' }));
    await waitFor(() =>
      expect(reorderVisitProperties).toHaveBeenCalledWith('visit-1', [
        { id: 'p-c', sortOrder: 0 },
        { id: 'p-b', sortOrder: 1 },
        { id: 'p-a', sortOrder: 2 },
      ])
    );

    // Undo is offered until the order changes again; the props still hold the
    // old order here, so the applied order no longer matches -> no undo shown.
    expect(screen.queryByRole('button', { name: '되돌리기' })).toBeNull();
  });

  it('offers undo while the applied order is current and restores the old sortOrder values', async () => {
    mockGeo();
    const { user, rerender } = renderPanel();
    await pickOrigin(user);
    await screen.findByText(/현재 순서 .+ → 추천/);
    await user.click(screen.getByRole('button', { name: '적용' }));
    await waitFor(() => expect(reorderVisitProperties).toHaveBeenCalled());

    // The visit query would now return the new order.
    const reordered = [
      { ...LINE[2], sortOrder: 0 },
      { ...LINE[1], sortOrder: 1 },
      { ...LINE[0], sortOrder: 2 },
    ];
    rerender(
      <RecommendOrderPanel
        visitId='visit-1'
        phase='PLANNED'
        properties={reordered}
      />
    );
    const undo = await screen.findByRole('button', { name: '되돌리기' });
    reorderVisitProperties.mockClear();
    await user.click(undo);

    await waitFor(() =>
      expect(reorderVisitProperties).toHaveBeenCalledWith('visit-1', [
        { id: 'p-a', sortOrder: 0 },
        { id: 'p-b', sortOrder: 1 },
        { id: 'p-c', sortOrder: 2 },
      ])
    );
  });

  it('says the current order is already shortest and disables apply', async () => {
    mockGeo(() => HttpResponse.json({ latitude: 37.499, longitude: 127 }));
    const { user } = renderPanel();
    await pickOrigin(user);

    expect(
      await screen.findByText('지금 순서가 이미 가장 짧아요')
    ).toBeTruthy();
    expect(
      (screen.getByRole('button', { name: '적용' }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
  });

  it('notes unlocated properties placed last', async () => {
    mockGeo();
    const { user } = renderPanel([...LINE, property('p-x', '무위치', 3, null)]);
    await pickOrigin(user);

    expect(
      await screen.findByText('위치 미지정 1건은 마지막에 배치됨')
    ).toBeTruthy();
  });

  it('shows an error line when applying fails', async () => {
    mockGeo();
    reorderVisitProperties.mockRejectedValue(new Error('boom'));
    const { user } = renderPanel();
    await pickOrigin(user);
    await screen.findByText(/현재 순서 .+ → 추천/);
    await user.click(screen.getByRole('button', { name: '적용' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/순서를 바꾸지 못했어요/)).toBeTruthy();
  });
});

describe('RecommendOrderPanel lookup errors', () => {
  it('stays on step 1 when the address has no coordinates', async () => {
    mockGeo(() => apiError(400, 'ADDRESS_COORDINATE_NOT_FOUND'));
    const { user } = renderPanel();
    await pickOrigin(user);

    expect(
      await screen.findByText(
        '이 주소는 좌표가 없어요. 가까운 다른 건물을 골라 주세요'
      )
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: '적용' })).toBeNull();
  });

  it('explains a failed lookup (502)', async () => {
    mockGeo(() => apiError(502, 'ADDRESS_LOOKUP_FAILED'));
    const { user } = renderPanel();
    await pickOrigin(user);

    expect(
      await screen.findByText(
        '주소 확인에 실패했어요. 잠시 후 다시 시도해 주세요'
      )
    ).toBeTruthy();
  });

  it('disables the address field when the lookup is unavailable (503)', async () => {
    mockGeo(() => apiError(503, 'ADDRESS_LOOKUP_UNAVAILABLE'));
    const { user } = renderPanel();
    await pickOrigin(user);

    expect(await screen.findByText('지금은 주소를 쓸 수 없어요')).toBeTruthy();
    expect((screen.getByRole('combobox') as HTMLInputElement).disabled).toBe(
      true
    );
  });
});

describe('RecommendOrderPanel privacy', () => {
  it('keeps the current location out of query caches and storage', async () => {
    mockGeo();
    const { user, queryClient } = renderPanel();
    await pickOrigin(user);
    await screen.findByText(/현재 순서 .+ → 추천/);

    const snapshot = JSON.stringify([
      queryClient
        .getQueryCache()
        .getAll()
        .map((q) => q.state.data),
      queryClient
        .getMutationCache()
        .getAll()
        .map((m) => [m.state.data, m.state.variables]),
      { ...window.localStorage },
      { ...window.sessionStorage },
      window.location.href,
    ]);
    expect(snapshot).not.toContain('37.521737');
    expect(snapshot).not.toContain('127.000123');

    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByText(/현재 순서/)).toBeNull();
  });
});
