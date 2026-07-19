import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import type { FileAsset } from '../../types';
import { TripDetailSection } from '../TripDetailSection';

vi.mock('../../hooks/useTripAssetUrl', () => ({
  useTripAssetUrl: (ref: FileAsset | null | undefined) => ({
    objectUrl: ref ? `blob:${ref.filename}` : null,
    isPending: false,
  }),
}));

function fileAsset(overrides: Partial<FileAsset> = {}): FileAsset {
  return {
    fileId: 'file-1',
    type: 'map',
    originalFilename: 'map.png',
    filename: 'map.png',
    path: '/files/map.png',
    mimeType: 'image/png',
    size: 1024,
    ...overrides,
  };
}

describe('TripDetailSection', () => {
  it('renders a single map without a switcher', () => {
    renderWithProviders(
      <TripDetailSection
        tripDetail={{
          id: 'trip-1',
          date: '20991231',
          type: 'year-end',
          name: '연말 나들이',
          logo: fileAsset({ fileId: 'logo-1', filename: 'logo.png' }),
          firstMap: fileAsset({ fileId: 'map-1', filename: 'map1.png' }),
          secondMap: null,
          nextButtonText: '',
          previousButtonText: '',
          driveUrl: 'https://drive.google.com/x',
        }}
      />
    );

    expect(screen.getByRole('img', { name: '나들이 지도' })).toBeTruthy();
    expect(screen.queryByRole('tab', { name: '첫 번째 지도' })).toBeNull();
    expect(screen.getByRole('button', { name: '드라이브 링크' })).toBeTruthy();
  });

  it('supports multi-map switching and drive CTA', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { user } = renderWithProviders(
      <TripDetailSection
        tripDetail={{
          id: 'trip-1',
          date: '20991231',
          type: 'year-end',
          name: '연말 나들이',
          logo: fileAsset({ fileId: 'logo-1', filename: 'logo.png' }),
          firstMap: fileAsset({ fileId: 'map-1', filename: 'map1.png' }),
          secondMap: fileAsset({ fileId: 'map-2', filename: 'map2.png' }),
          nextButtonText: '1차 경로',
          previousButtonText: '2차 경로',
          driveUrl: 'https://drive.google.com/x',
        }}
      />
    );

    expect(screen.getByRole('tab', { name: '1차 경로' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: '2차 경로' })).toBeTruthy();

    await user.click(screen.getByRole('tab', { name: '2차 경로' }));
    await user.click(screen.getByRole('button', { name: '드라이브 링크' }));

    expect(
      screen.getByRole('img', { name: '나들이 지도' }).getAttribute('src')
    ).toBe('blob:map2.png');
    expect(openSpy).toHaveBeenCalledWith(
      'https://drive.google.com/x',
      '_blank',
      'noopener,noreferrer'
    );
  });
});
