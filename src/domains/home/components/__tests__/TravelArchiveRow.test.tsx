import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TravelArchiveRow } from '@/domains/home/components/TravelArchiveRow';
import type { TravelListItem } from '@/domains/travel/types';
import { renderWithMinimalProviders } from '@/test/helpers/render';

const travel: TravelListItem = {
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
  coverPhotoId: 'cover-1',
  oneLineReview: '정말 좋았다',
  nights: 4,
  days: 5,
  tags: [],
};

describe('TravelArchiveRow', () => {
  it('renders the cover thumbnail once its object url is ready', () => {
    renderWithMinimalProviders(
      <TravelArchiveRow travel={travel} device='main' coverUrl='blob:cover-1' />
    );

    const link = screen.getByRole('link', { name: '제주도 여행 여행 보기' });
    expect(link.classList.contains('slcn-home-archive__link--no-cover')).toBe(
      false
    );
    const image = link.querySelector('img');
    expect(image).not.toBeNull();
    expect(image?.getAttribute('alt')).toBe('');
  });

  it('uses a no-cover modifier and drops the column when there is no cover', () => {
    renderWithMinimalProviders(
      <TravelArchiveRow
        travel={{ ...travel, coverPhotoId: null }}
        device='main'
      />
    );

    const link = screen.getByRole('link', { name: '제주도 여행 여행 보기' });
    expect(link.classList.contains('slcn-home-archive__link--no-cover')).toBe(
      true
    );
    expect(link.querySelector('img')).toBeNull();
    expect(link.querySelector('.slcn-home-archive__thumb')).toBeNull();
  });
});
