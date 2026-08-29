import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { TripCard } from '@/domains/trip/components/TripCard';
import type { TripListItem } from '@/domains/trip/types';
import { renderWithProviders } from '@/test/helpers/render';

const trip = {
  id: 'trip-1',
  date: '20991231',
  type: 'AYO',
  name: '연말 나들이',
  displayDate: '2099.12.31',
  logo: {
    fileId: 'logo-1',
    type: 'logo',
    originalFilename: 'logo.png',
    filename: 'logo.png',
    path: '/files/logo.png',
    mimeType: 'image/png',
    size: 1024,
  },
} satisfies TripListItem;

describe('TripCard', () => {
  it('opens the quiz flow when the CTA is clicked', async () => {
    const onOpenQuiz = vi.fn();
    const { user } = renderWithProviders(
      <TripCard trip={trip} logoUrl='blob:logo' onOpenQuiz={onOpenQuiz} />
    );

    await user.click(screen.getByRole('button', { name: '퀴즈 풀기' }));

    expect(onOpenQuiz).toHaveBeenCalledWith(trip);
  });
});
