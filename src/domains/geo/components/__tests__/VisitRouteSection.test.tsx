import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VisitRouteSection } from '@/domains/geo/components/VisitRouteSection';
import { loadKakaoMaps } from '@/domains/geo/map/kakao-loader';
import { renderWithProviders } from '@/test/helpers/render';
import { server } from '@/test/helpers/server';

vi.mock('@/domains/geo/map/kakao-loader', () => ({
  loadKakaoMaps: vi.fn(),
}));

const envState = vi.hoisted(() => ({ key: null as string | null }));
vi.mock('@/lib/env/env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/env/env')>();
  return {
    ...actual,
    getAppEnv: () => ({ ...actual.getAppEnv(), kakaoMapJsKey: envState.key }),
  };
});

function located(id: string, bdMgtSn: string, latitude: number) {
  return {
    propertyId: id,
    title: `단지 ${id}`,
    location: { bdMgtSn, latitude, longitude: 127 },
  };
}

const properties = [
  located('a', 'X', 37.5),
  { propertyId: 'b', title: '단지 b', location: null },
  located('c', 'Y', 37.509),
];

beforeEach(() => {
  vi.mocked(loadKakaoMaps).mockReset();
});

describe('VisitRouteSection without a Kakao key', () => {
  it('never calls the loader and still renders the list fallback', () => {
    envState.key = null;
    renderWithProviders(
      <VisitRouteSection visitId='v1' properties={properties} />
    );

    expect(loadKakaoMaps).not.toHaveBeenCalled();
    expect(screen.queryByRole('region', { name: '방문 순서 지도' })).toBeNull();
    expect(screen.getByText('단지 a')).toBeTruthy();
    expect(screen.getByText('위치 미지정 1건')).toBeTruthy();
    // Numbering keeps the unlocated row's slot: 1 and 3.
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText(/다음까지 .+ · 약 \d+분/)).toBeTruthy();
  });

  it('collapses and expands the body', async () => {
    envState.key = null;
    const { user } = renderWithProviders(
      <VisitRouteSection visitId='v1' properties={properties} />
    );

    const toggle = screen.getByRole('button', { name: '접기' });
    await user.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('단지 a').closest('[hidden]')).not.toBeNull();
  });
});

describe('VisitRouteSection with a key', () => {
  it('asks the loader for the SDK and keeps the list when it fails', async () => {
    envState.key = 'test-key';
    vi.mocked(loadKakaoMaps).mockRejectedValue(new Error('blocked'));
    renderWithProviders(
      <VisitRouteSection visitId='v1' properties={properties} />
    );

    expect(loadKakaoMaps).toHaveBeenCalledWith('test-key');
    expect(await screen.findByText('단지 a')).toBeTruthy();
    expect(screen.queryByRole('region', { name: '방문 순서 지도' })).toBeNull();
  });
});

describe('VisitRouteSection walking route', () => {
  const two = [
    located('a', 'X', 37.5),
    located('b', 'X', 37.5),
    located('c', 'Y', 37.509),
  ];
  const routePayload = {
    totalDistance: 1280,
    totalTime: 960,
    stops: [
      { index: 0, propertyIds: ['a', 'b'], latitude: 37.5, longitude: 127 },
      { index: 1, propertyIds: ['c'], latitude: 37.509, longitude: 127 },
    ],
    legs: [
      {
        fromStopIndex: 0,
        toStopIndex: 1,
        distance: 1280,
        time: 960,
        path: [
          [127, 37.5],
          [127, 37.509],
        ],
      },
    ],
  };

  function mockRoute(status: number, body: Record<string, unknown>) {
    server.use(
      http.post('*/inspection-visits/v1/walking-route', () =>
        HttpResponse.json(body, { status })
      )
    );
  }
  function setup(extra: { isCompleted?: boolean } = {}, props = two) {
    envState.key = null;
    return renderWithProviders(
      <VisitRouteSection visitId='v1' properties={props} {...extra} />
    );
  }

  it('hides the button with fewer than two located stops', () => {
    setup({}, [located('a', 'X', 37.5), located('b', 'X', 37.5)]);
    expect(screen.queryByRole('button', { name: '도보 경로 보기' })).toBeNull();
  });

  it('shows the real route summary and toggles back to straight', async () => {
    mockRoute(200, routePayload);
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: '도보 경로 보기' }));
    expect(await screen.findByText(/실제 도보 약 16분 · 1\.3km/)).toBeTruthy();
    expect(screen.getByText(/다음까지 1\.3km · 약 16분/)).toBeTruthy();
    expect(screen.queryByText(/직선 기준 추정/)).toBeNull();

    await user.click(screen.getByRole('button', { name: '직선으로 보기' }));
    expect(screen.getByText(/직선 기준 추정/)).toBeTruthy();
    expect(screen.queryByText(/실제 도보/)).toBeNull();
  });

  it('shows the pending state while loading', async () => {
    server.use(
      http.post('*/inspection-visits/v1/walking-route', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(routePayload);
      })
    );
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '도보 경로 보기' }));

    const pending = screen.getByRole('button', {
      name: '도보 경로 불러오는 중…',
    });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    await screen.findByText(/실제 도보/);
  });

  it.each([
    [429, 'WALKING_ROUTE_QUOTA_EXCEEDED', '오늘 경로 조회 한도를 넘었습니다'],
    [502, 'WALKING_ROUTE_FAILED', '잠시 후 다시 시도해 주세요'],
  ])('keeps straight lines on %s', async (status, code, message) => {
    mockRoute(status, { title: 'x', status, code });
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '도보 경로 보기' }));

    expect((await screen.findByRole('alert')).textContent).toBe(message);
    expect(screen.getByText(/직선 기준 추정/)).toBeTruthy();
    expect(
      (
        screen.getByRole('button', {
          name: '도보 경로 보기',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(false);
  });

  it('disables the button on 503', async () => {
    mockRoute(503, {
      title: 'x',
      status: 503,
      code: 'WALKING_ROUTE_UNAVAILABLE',
    });
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '도보 경로 보기' }));

    expect((await screen.findByRole('alert')).textContent).toBe(
      '지금은 도보 경로를 볼 수 없어요'
    );
    await waitFor(() =>
      expect(
        (
          screen.getByRole('button', {
            name: '도보 경로 보기',
          }) as HTMLButtonElement
        ).disabled
      ).toBe(true)
    );
    expect(screen.getByText(/직선 기준 추정/)).toBeTruthy();
  });

  it('treats an empty route as a message, not an error', async () => {
    mockRoute(200, { totalDistance: 0, totalTime: 0, stops: [], legs: [] });
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: '도보 경로 보기' }));

    expect(
      await screen.findByText('경로를 그릴 지점이 2곳 이상 필요해요')
    ).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText(/직선 기준 추정/)).toBeTruthy();
  });

  it('shows the recommended-route hint only for completed visits', async () => {
    mockRoute(200, routePayload);
    const hint = '화면 순서대로 걸었을 때의 현재 기준 추천 경로예요';
    const past = setup({ isCompleted: true });
    await past.user.click(
      screen.getByRole('button', { name: '도보 경로 보기' })
    );
    expect(await screen.findByText(hint)).toBeTruthy();
    past.unmount();

    const planned = setup({ isCompleted: false });
    await planned.user.click(
      screen.getByRole('button', { name: '도보 경로 보기' })
    );
    await screen.findByText(/실제 도보/);
    expect(screen.queryByText(hint)).toBeNull();
  });
});
