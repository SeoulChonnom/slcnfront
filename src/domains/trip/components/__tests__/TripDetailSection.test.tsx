import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import type { FileRef } from '../../types';
import { TripDetailSection } from '../TripDetailSection';

vi.mock('../../hooks/useTripAssetUrl', () => ({
  useTripAssetUrl: (ref: FileRef | null | undefined) => ({
    objectUrl: ref ? `blob:${ref.filename}` : null,
    isPending: false,
  }),
}));

describe('TripDetailSection', () => {
  it('renders a single map without a switcher', () => {
    renderWithProviders(
      <TripDetailSection
        tripDetail={{
          date: '20991231',
          firstMap: { type: 'map', filename: 'map1.png' },
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
          date: '20991231',
          firstMap: { type: 'map', filename: 'map1.png' },
          secondMap: { type: 'map', filename: 'map2.png' },
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
