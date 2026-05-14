import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { TripCard } from '../TripCard';

const trip = {
  id: 'trip-1',
  date: '20991231',
  type: 'year-end',
  name: '연말 나들이',
  displayDate: '2099.12.31',
  logoPath: '/logo.png',
};

describe('TripCard', () => {
  it('opens the quiz flow when the CTA is clicked', async () => {
    const onOpenQuiz = vi.fn();
    const { user } = renderWithProviders(
      <TripCard trip={trip} logoObjectUrl='blob:logo' onOpenQuiz={onOpenQuiz} />
    );

    await user.click(screen.getByRole('button', { name: '퀴즈 풀기' }));

    expect(onOpenQuiz).toHaveBeenCalledWith(trip);
  });
});
