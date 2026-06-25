import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../../test/helpers/render';
import { TravelCard } from '../TravelCard';

const travel = {
  id: 'travel-1',
  travelId: 'travel-1',
  title: '제주도 여행',
  region: '제주',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  displayStartDate: '2025.06.01',
  displayEndDate: '2025.06.05',
  dateRangeLabel: '2025.06.01 – 2025.06.05',
  nightsDaysLabel: '4박 5일',
  coverPhotoId: null,
  oneLineReview: '정말 좋았다',
  nights: 4,
  days: 5,
  tags: [
    { id: 'tag-1', travelId: 'travel-1', name: '힐링', sortOrder: 0 },
    { id: 'tag-2', travelId: 'travel-1', name: '제주', sortOrder: 1 },
  ],
};

describe('TravelCard', () => {
  it('renders title, region, date range, and nights/days label', () => {
    renderWithProviders(<TravelCard travel={travel} device='main' />);

    expect(screen.getByRole('heading', { name: '제주도 여행' })).toBeTruthy();
    expect(screen.getByText('제주')).toBeTruthy();
    expect(screen.getByText('2025.06.01 – 2025.06.05')).toBeTruthy();
    expect(screen.getByText('4박 5일')).toBeTruthy();
  });

  it('renders the one-line review when present', () => {
    renderWithProviders(<TravelCard travel={travel} device='main' />);

    expect(screen.getByText('정말 좋았다')).toBeTruthy();
  });

  it('does not render one-line review when absent', () => {
    renderWithProviders(
      <TravelCard travel={{ ...travel, oneLineReview: null }} device='main' />
    );

    expect(screen.queryByText('정말 좋았다')).toBeNull();
  });

  it('renders tag chips for each tag', () => {
    renderWithProviders(<TravelCard travel={travel} device='main' />);

    expect(screen.getByText('#힐링')).toBeTruthy();
    expect(screen.getByText('#제주')).toBeTruthy();
  });

  it('renders no tag chips when tags array is empty', () => {
    renderWithProviders(
      <TravelCard travel={{ ...travel, tags: [] }} device='main' />
    );

    expect(screen.queryAllByText(/#힐링|#제주/)).toHaveLength(0);
  });

  it('links to the detail route for the main device', () => {
    renderWithProviders(<TravelCard travel={travel} device='main' />);

    const link = screen.getByRole('link', { name: /제주도 여행/ });
    expect(link.getAttribute('href')).toBe('/main/travel/travel-1');
  });

  it('links to the detail route for the mobile device', () => {
    renderWithProviders(<TravelCard travel={travel} device='mobile' />);

    const link = screen.getByRole('link', { name: /제주도 여행/ });
    expect(link.getAttribute('href')).toBe('/mobile/travel/travel-1');
  });

  it('renders the representative pill when isRepresentative is true', () => {
    renderWithProviders(
      <TravelCard travel={travel} device='main' isRepresentative />
    );

    expect(screen.getByText('대표')).toBeTruthy();
  });

  it('does not render the representative pill by default', () => {
    renderWithProviders(<TravelCard travel={travel} device='main' />);

    expect(screen.queryByText('대표')).toBeNull();
  });
});
