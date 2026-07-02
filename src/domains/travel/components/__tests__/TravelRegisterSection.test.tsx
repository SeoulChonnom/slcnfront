import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithMinimalProviders } from '../../../../test/helpers/render';
import type { TravelDetail } from '../../types';
import { TravelRegisterSection } from '../TravelRegisterSection';

// ── Travel API mock ───────────────────────────────────────────────────────────

const { getTravelDetail, createTravel, updateTravel } = vi.hoisted(() => ({
  getTravelDetail: vi.fn<() => Promise<TravelDetail>>(),
  createTravel: vi.fn(),
  updateTravel: vi.fn(),
}));

vi.mock('../../api/travel-api', () => ({
  travelApi: {
    getTravelDetail,
    createTravel,
    updateTravel,
  },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockTravelDetail: TravelDetail = {
  id: 'item-1',
  travelId: 'travel-1',
  title: 'FE 테스트 부산 2일 여행',
  region: '부산',
  startDate: '2025-06-01',
  endDate: '2025-06-02',
  displayStartDate: '2025.06.01',
  displayEndDate: '2025.06.02',
  dateRangeLabel: '2025.06.01 – 2025.06.02',
  nightsDaysLabel: '1박 2일',
  coverPhotoId: null,
  oneLineReview: null,
  nights: 1,
  days: 2,
  travelDays: [
    {
      id: 'day-1',
      travelId: 'travel-1',
      date: '2025-06-01',
      displayDate: '2025.06.01',
      title: null,
      memo: null,
      coverPhotoId: null,
      dayNumber: 1,
      sortOrder: 0,
      places: [
        {
          id: 'place-1',
          name: 'FE 확인용 장소',
          category: 'TOURIST_SPOT',
          address: null,
          memo: '메모 내용',
          description: null,
          coverPhotoId: null,
          sortOrder: 0,
          photos: [],
        },
      ],
      photos: [],
    },
    {
      id: 'day-2',
      travelId: 'travel-1',
      date: '2025-06-02',
      displayDate: '2025.06.02',
      title: null,
      memo: null,
      coverPhotoId: null,
      dayNumber: 2,
      sortOrder: 1,
      places: [],
      photos: [],
    },
  ],
  places: [],
  photos: [],
  files: [],
  tags: [{ name: '부산여행' }],
  review: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TravelRegisterSection', () => {
  describe('register mode', () => {
    it('renders the form immediately with an empty title field', () => {
      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='register' />
      );

      expect(
        screen.getByRole('heading', { name: '새 여행 기록하기' })
      ).toBeTruthy();

      // The title TextField is the required one; the tag input also shares '예) 봄여행'
      // so we find by label text instead.
      const titleInput = screen.getByRole('textbox', { name: /제목/ });
      expect((titleInput as HTMLInputElement).value).toBe('');
    });
  });

  describe('edit mode', () => {
    it('shows a loading state while the travel detail is being fetched', () => {
      // Never resolves — stays pending
      getTravelDetail.mockReturnValue(new Promise(() => {}));

      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='edit' travelId='travel-1' />
      );

      expect(screen.getByText('불러오는 중…')).toBeTruthy();
    });

    it('prefills title, region, tags and day/place rows after detail loads', async () => {
      getTravelDetail.mockResolvedValue(mockTravelDetail);

      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='edit' travelId='travel-1' />
      );

      // Wait for the form to appear (gated on data load)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /제목/ })).toBeTruthy();
      });

      // Title is prefilled
      const titleInput = screen.getByRole('textbox', { name: /제목/ });
      expect((titleInput as HTMLInputElement).value).toBe(
        'FE 테스트 부산 2일 여행'
      );

      // Region is prefilled
      const regionInput = screen.getByRole('textbox', { name: /지역/ });
      expect((regionInput as HTMLInputElement).value).toBe('부산');

      // Tag chip is rendered
      expect(screen.getByText('#부산여행')).toBeTruthy();

      // Both day cards are shown with their day number labels
      expect(screen.getByText('Day 1')).toBeTruthy();
      expect(screen.getByText('Day 2')).toBeTruthy();

      // The place name for day 1 is prefilled in the place input
      const placeInput = screen.getByDisplayValue('FE 확인용 장소');
      expect(placeInput).toBeTruthy();
    });

    it('shows an error state when the detail fetch fails', async () => {
      getTravelDetail.mockRejectedValue(new Error('network error'));

      renderWithMinimalProviders(
        <TravelRegisterSection device='main' mode='edit' travelId='travel-1' />
      );

      await waitFor(() => {
        expect(
          screen.getByText('여행 정보를 불러오지 못했어요. 다시 시도해 주세요.')
        ).toBeTruthy();
      });
    });
  });
});
