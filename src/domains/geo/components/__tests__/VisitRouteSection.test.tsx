import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VisitRouteSection } from '@/domains/geo/components/VisitRouteSection';
import { loadKakaoMaps } from '@/domains/geo/map/kakao-loader';
import { renderWithProviders } from '@/test/helpers/render';

vi.mock('@/domains/geo/map/kakao-loader', () => ({
  loadKakaoMaps: vi.fn(),
}));

const envState = vi.hoisted(() => ({ key: null as string | null }));
vi.mock('@/lib/env/env', () => ({
  getAppEnv: () => ({ kakaoMapJsKey: envState.key }),
}));

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
    renderWithProviders(<VisitRouteSection properties={properties} />);

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
      <VisitRouteSection properties={properties} />
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
    renderWithProviders(<VisitRouteSection properties={properties} />);

    expect(loadKakaoMaps).toHaveBeenCalledWith('test-key');
    expect(await screen.findByText('단지 a')).toBeTruthy();
    expect(screen.queryByRole('region', { name: '방문 순서 지도' })).toBeNull();
  });
});
