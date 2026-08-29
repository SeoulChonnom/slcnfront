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
  it('uses a no-cover modifier and removes the thumbnail column when cover is absent', () => {
    const { unmount } = renderWithMinimalProviders(
      <TravelArchiveRow
        travel={travel}
        device='main'
        coverObjectUrl='blob:cover-1'
      />
    );

    const coveredLink = screen.getByRole('link', {
      name: '제주도 여행 여행 보기',
    });
    expect(
      coveredLink.classList.contains('slcn-home-archive__link--no-cover')
    ).toBe(false);
    const coveredImage = coveredLink.querySelector('img');
    expect(coveredImage).not.toBeNull();
    expect(coveredImage?.getAttribute('alt')).toBe('');
    expect(coveredImage?.getAttribute('loading')).toBe('lazy');

    unmount();
    renderWithMinimalProviders(
      <TravelArchiveRow travel={travel} device='main' />
    );

    const noCoverLink = screen.getByRole('link', {
      name: '제주도 여행 여행 보기',
    });
    expect(
      noCoverLink.classList.contains('slcn-home-archive__link--no-cover')
    ).toBe(true);
    expect(noCoverLink.querySelector('img')).toBeNull();
    expect(noCoverLink.querySelector('.slcn-home-archive__thumb')).toBeNull();
  });
});
