import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  computeNightsDays,
  useTravelRegisterForm,
} from '../useTravelRegisterForm';

// ── computeNightsDays (exported pure helper) ──────────────────────────────────

describe('computeNightsDays', () => {
  it('returns null when startDate is empty', () => {
    expect(computeNightsDays('', '2024-06-10')).toBeNull();
  });

  it('returns null when endDate is empty', () => {
    expect(computeNightsDays('2024-06-08', '')).toBeNull();
  });

  it('returns null when endDate is before startDate (reversed range)', () => {
    expect(computeNightsDays('2024-06-10', '2024-06-08')).toBeNull();
  });

  it('returns 0 nights and 1 day for a same-day trip', () => {
    expect(computeNightsDays('2024-06-08', '2024-06-08')).toEqual({
      nights: 0,
      days: 1,
    });
  });

  it('returns correct nights and days for a multi-day trip', () => {
    expect(computeNightsDays('2024-06-08', '2024-06-11')).toEqual({
      nights: 3,
      days: 4,
    });
  });
});

// ── useTravelRegisterForm ─────────────────────────────────────────────────────

describe('useTravelRegisterForm', () => {
  // ── initial state ───────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with all fields empty and no errors', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      expect(result.current.values).toEqual({
        title: '',
        region: '',
        startDate: '',
        endDate: '',
        coverPhotoFile: null,
        albumPhotoFiles: [],
        tags: [],
        days: [],
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.tagInput).toBe('');
    });

    it('merges defaultValues over initial values', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          defaultValues: { title: '제주 여행', region: '제주' },
        })
      );

      expect(result.current.values.title).toBe('제주 여행');
      expect(result.current.values.region).toBe('제주');
    });
  });

  // ── updateStartDate / updateEndDate ─────────────────────────────────────────

  describe('updateStartDate / updateEndDate', () => {
    it('rebuilds day rows with correct count, dates, and dayNumbers', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });

      const { days } = result.current.values;
      expect(days).toHaveLength(3);
      expect(days[0]).toMatchObject({ date: '2024-06-08', dayNumber: 1 });
      expect(days[1]).toMatchObject({ date: '2024-06-09', dayNumber: 2 });
      expect(days[2]).toMatchObject({ date: '2024-06-10', dayNumber: 3 });
    });

    it('generates stable localIds derived from the date (day-YYYYMMDD)', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-09');
      });

      expect(result.current.values.days[0].localId).toBe('day-20240608');
      expect(result.current.values.days[1].localId).toBe('day-20240609');
    });

    it('produces an empty days array when the date range is reversed', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-10');
      });
      act(() => {
        result.current.updateEndDate('2024-06-08');
      });

      expect(result.current.values.days).toHaveLength(0);
    });

    it('produces a single day row when startDate equals endDate', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-08');
      });

      expect(result.current.values.days).toHaveLength(1);
      expect(result.current.values.days[0]).toMatchObject({
        date: '2024-06-08',
        dayNumber: 1,
        coverPhotoFile: null,
        places: [],
      });
    });
  });

  // ── incrementDuration / decrementDuration ───────────────────────────────────

  describe('incrementDuration / decrementDuration', () => {
    it('incrementDuration with only startDate sets endDate to startDate+1', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      // endDate is still '' at this point
      act(() => {
        result.current.incrementDuration();
      });

      expect(result.current.values.endDate).toBe('2024-06-09');
      expect(result.current.values.days).toHaveLength(2);
    });

    it('incrementDuration extends endDate by 1 day', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });
      act(() => {
        result.current.incrementDuration();
      });

      expect(result.current.values.endDate).toBe('2024-06-11');
      expect(result.current.values.days).toHaveLength(4);
    });

    it('decrementDuration moves endDate back by 1 day', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });
      act(() => {
        result.current.decrementDuration();
      });

      expect(result.current.values.endDate).toBe('2024-06-09');
      expect(result.current.values.days).toHaveLength(2);
    });

    it('decrementDuration floors at 0 nights and does not go below a day trip', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-08');
      });
      act(() => {
        result.current.decrementDuration();
      });

      // Bug note: floor is correct (returns prev unchanged), endDate stays same-day
      expect(result.current.values.endDate).toBe('2024-06-08');
      expect(result.current.values.days).toHaveLength(1);
    });

    it('incrementDuration is a no-op when startDate is missing', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.incrementDuration();
      });

      expect(result.current.values.endDate).toBe('');
      expect(result.current.values.days).toHaveLength(0);
    });

    it('decrementDuration is a no-op when startDate or endDate is missing', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.decrementDuration();
      });

      expect(result.current.values.endDate).toBe('');
    });
  });

  // ── tag management ──────────────────────────────────────────────────────────

  describe('tag management', () => {
    it('addTag appends a new tag and clears tagInput', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.setTagInput('서울');
      });
      act(() => {
        result.current.addTag();
      });

      expect(result.current.values.tags).toEqual(['서울']);
      expect(result.current.tagInput).toBe('');
    });

    it('addTag strips a leading # from the tag name', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.setTagInput('#제주');
      });
      act(() => {
        result.current.addTag();
      });

      expect(result.current.values.tags).toEqual(['제주']);
    });

    it('addTag rejects a duplicate and still clears tagInput', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({ defaultValues: { tags: ['서울'] } })
      );

      act(() => {
        result.current.setTagInput('서울');
      });
      act(() => {
        result.current.addTag();
      });

      expect(result.current.values.tags).toHaveLength(1);
      expect(result.current.tagInput).toBe('');
    });

    it('addTag is a no-op for blank or whitespace-only input', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.setTagInput('   ');
      });
      act(() => {
        result.current.addTag();
      });

      expect(result.current.values.tags).toHaveLength(0);
    });

    it('removeTag filters the named tag from the list', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({ defaultValues: { tags: ['서울', '제주'] } })
      );

      act(() => {
        result.current.removeTag('서울');
      });

      expect(result.current.values.tags).toEqual(['제주']);
    });
  });

  // ── place management ────────────────────────────────────────────────────────

  // Helper: render the hook and produce exactly one day row.
  function renderWithOneDay() {
    const hook = renderHook(() => useTravelRegisterForm());
    act(() => {
      hook.result.current.updateStartDate('2024-06-08');
    });
    act(() => {
      hook.result.current.updateEndDate('2024-06-08');
    });
    return hook;
  }

  describe('place management', () => {
    it('addPlace appends a blank place row to the correct day', () => {
      const { result } = renderWithOneDay();
      const dayId = result.current.values.days[0].localId;

      act(() => {
        result.current.addPlace(dayId);
      });

      expect(result.current.values.days[0].places).toHaveLength(1);
      expect(result.current.values.days[0].places[0]).toMatchObject({
        name: '',
        category: '',
        memo: '',
      });
    });

    it('removePlace removes only the targeted place and leaves others intact', () => {
      const { result } = renderWithOneDay();
      const dayId = result.current.values.days[0].localId;

      act(() => {
        result.current.addPlace(dayId);
        result.current.addPlace(dayId);
      });

      const firstPlaceId = result.current.values.days[0].places[0].localId;

      act(() => {
        result.current.removePlace(dayId, firstPlaceId);
      });

      expect(result.current.values.days[0].places).toHaveLength(1);
    });

    it('updatePlace updates the specified field on the correct place', () => {
      const { result } = renderWithOneDay();
      const dayId = result.current.values.days[0].localId;

      act(() => {
        result.current.addPlace(dayId);
      });

      const placeId = result.current.values.days[0].places[0].localId;

      act(() => {
        result.current.updatePlace(dayId, placeId, 'name', '경복궁');
      });

      expect(result.current.values.days[0].places[0].name).toBe('경복궁');
    });
  });

  // ── updateDayCoverPhoto ─────────────────────────────────────────────────────

  describe('updateDayCoverPhoto', () => {
    it('sets coverPhotoFile on the matching day', () => {
      const { result } = renderWithOneDay();
      const dayId = result.current.values.days[0].localId;
      const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' });

      act(() => {
        result.current.updateDayCoverPhoto(dayId, file);
      });

      expect(result.current.values.days[0].coverPhotoFile).toBe(file);
    });
  });

  // ── validate() ──────────────────────────────────────────────────────────────

  describe('validate()', () => {
    it('returns false and sets a title error when title is empty', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      let isValid = true;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.title).toBe('제목을 입력해 주세요.');
    });

    it('returns false and sets date errors when both dates are missing', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({ defaultValues: { title: '여행' } })
      );

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.startDate).toBe('시작일을 선택해 주세요.');
      expect(result.current.errors.endDate).toBe('종료일을 선택해 주세요.');
    });

    it('returns false and sets endDate error when endDate is before startDate', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          defaultValues: {
            title: '여행',
            startDate: '2024-06-10',
            endDate: '2024-06-08',
          },
        })
      );

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.endDate).toBe(
        '종료일은 시작일 이후여야 해요.'
      );
    });

    it('returns true and clears all errors when all required fields are valid', () => {
      // Note: region is NOT validated by validateForm — only title, startDate, endDate
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          defaultValues: {
            title: '제주 여행',
            startDate: '2024-06-08',
            endDate: '2024-06-10',
          },
        })
      );

      let isValid = false;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    it('updateField clears the corresponding validation error', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.validate();
      });
      expect(result.current.errors.title).toBeDefined();

      act(() => {
        result.current.updateField('title', '새 여행');
      });

      expect(result.current.errors.title).toBeUndefined();
    });
  });
});
