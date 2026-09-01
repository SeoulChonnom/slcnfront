import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  computeNightsDays,
  findDaysWithContent,
  useTravelRegisterForm,
} from '@/domains/travel/hooks/useTravelRegisterForm';

const DRAFT_STORAGE_KEY = 'slcn:travel-register-draft';

function makeImageFile(name: string) {
  return new File(['x'], name, { type: 'image/jpeg' });
}

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
  beforeEach(() => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
  });

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
      // Note: region is NOT validated by validateForm — only title, startDate, endDate, coverPhotoFile
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          defaultValues: {
            title: '제주 여행',
            startDate: '2024-06-08',
            endDate: '2024-06-10',
            coverPhotoFile: makeImageFile('cover.jpg'),
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

    it('register mode (default) errors when coverPhotoFile is missing', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          defaultValues: {
            title: '여행',
            startDate: '2024-06-08',
            endDate: '2024-06-10',
          },
        })
      );

      let isValid = true;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.coverPhotoFile).toBe(
        '대표 사진을 등록해 주세요.'
      );
    });

    it('register mode does not error when coverPhotoFile is set', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          defaultValues: {
            title: '여행',
            startDate: '2024-06-08',
            endDate: '2024-06-10',
            coverPhotoFile: makeImageFile('cover.jpg'),
          },
        })
      );

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.coverPhotoFile).toBeUndefined();
    });

    it('edit mode does not require coverPhotoFile', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          mode: 'edit',
          defaultValues: {
            title: '여행',
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
      expect(result.current.errors.coverPhotoFile).toBeUndefined();
    });
  });

  // ── P0 regression: day content survives date edits ─────────────────────────
  //
  // Reproduced live: typing a place name and memo into Day 3, then clicking
  // the 여행 기간 − button once, erased it instantly because buildDayRows used
  // to regenerate every day row from scratch on any date change.

  describe('day content survives date/duration edits', () => {
    it('P0: places survive a start-date change that keeps the day in range', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });

      const targetDayId = result.current.values.days.find(
        (d) => d.date === '2024-06-09'
      )?.localId as string;

      act(() => {
        result.current.addPlace(targetDayId);
      });
      const placeId = result.current.values.days.find(
        (d) => d.localId === targetDayId
      )?.places[0].localId as string;

      act(() => {
        result.current.updatePlace(targetDayId, placeId, 'name', '경복궁');
        result.current.updatePlace(targetDayId, placeId, 'memo', '아침 산책');
      });

      // Correct a start-date typo by one day earlier — 2024-06-09 stays in range.
      act(() => {
        result.current.updateStartDate('2024-06-07');
      });

      const survivingDay = result.current.values.days.find(
        (d) => d.date === '2024-06-09'
      );
      expect(survivingDay?.localId).toBe(targetDayId);
      expect(survivingDay?.places).toHaveLength(1);
      expect(survivingDay?.places[0]).toMatchObject({
        localId: placeId,
        name: '경복궁',
        memo: '아침 산책',
      });
    });

    it('places survive extending the end date (incrementDuration)', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });

      const lastDayId = result.current.values.days[2].localId;

      act(() => {
        result.current.addPlace(lastDayId);
      });
      const placeId = result.current.values.days[2].places[0].localId;
      act(() => {
        result.current.updatePlace(lastDayId, placeId, 'name', '한강공원');
      });

      act(() => {
        result.current.incrementDuration();
      });

      expect(result.current.values.endDate).toBe('2024-06-11');
      expect(result.current.values.days).toHaveLength(4);
      const survivingDay = result.current.values.days.find(
        (d) => d.date === '2024-06-10'
      );
      expect(survivingDay?.localId).toBe(lastDayId);
      expect(survivingDay?.places[0]).toMatchObject({
        localId: placeId,
        name: '한강공원',
      });
    });

    it('shrinking the range drops the out-of-range day', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });

      const firstDayId = result.current.values.days[0].localId;
      const lastDayId = result.current.values.days[2].localId;

      act(() => {
        result.current.addPlace(firstDayId);
        result.current.addPlace(lastDayId);
      });
      const firstPlaceId = result.current.values.days[0].places[0].localId;
      act(() => {
        result.current.updatePlace(firstDayId, firstPlaceId, 'name', '남산');
      });

      act(() => {
        result.current.decrementDuration();
      });

      expect(result.current.values.endDate).toBe('2024-06-09');
      expect(result.current.values.days).toHaveLength(2);
      // The dropped day (06-10, with its place) is gone entirely.
      expect(
        result.current.values.days.find((d) => d.date === '2024-06-10')
      ).toBeUndefined();
      // The surviving day (06-08) keeps its identity and content.
      const survivingDay = result.current.values.days.find(
        (d) => d.date === '2024-06-08'
      );
      expect(survivingDay?.localId).toBe(firstDayId);
      expect(survivingDay?.places[0]).toMatchObject({
        localId: firstPlaceId,
        name: '남산',
      });
    });
  });

  // ── previewStartDate / previewEndDate / previewDecrementDuration ───────────

  describe('preview* helpers', () => {
    it('previewDecrementDuration returns the day that would be dropped, when it has content', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });
      const lastDayId = result.current.values.days[2].localId;
      act(() => {
        result.current.addPlace(lastDayId);
      });
      const placeId = result.current.values.days[2].places[0].localId;
      act(() => {
        result.current.updatePlace(lastDayId, placeId, 'name', '경복궁');
      });

      const preview = result.current.previewDecrementDuration();
      expect(preview).toHaveLength(1);
      expect(preview[0].localId).toBe(lastDayId);
    });

    it('previewDecrementDuration returns an empty array when the doomed day is empty', () => {
      const { result } = renderHook(() => useTravelRegisterForm());

      act(() => {
        result.current.updateStartDate('2024-06-08');
      });
      act(() => {
        result.current.updateEndDate('2024-06-10');
      });

      expect(result.current.previewDecrementDuration()).toEqual([]);
    });
  });

  // ── findDaysWithContent (pure helper) ───────────────────────────────────────

  describe('findDaysWithContent', () => {
    it('returns only days that are dropped AND hold real content', () => {
      const days = [
        {
          localId: 'day-1',
          date: '2024-06-08',
          dayNumber: 1,
          coverPhotoFile: null,
          places: [
            { localId: 'p1', name: '경복궁', category: '' as const, memo: '' },
          ],
        },
        {
          localId: 'day-2',
          date: '2024-06-09',
          dayNumber: 2,
          coverPhotoFile: null,
          places: [],
        },
        {
          localId: 'day-3',
          date: '2024-06-10',
          dayNumber: 3,
          coverPhotoFile: null,
          places: [
            { localId: 'p2', name: '', category: '' as const, memo: '' },
          ],
        },
      ];

      // Shrinking to [06-08, 06-08] drops day-2 (empty) and day-3 (blank place row only).
      const result = findDaysWithContent(days, '2024-06-08', '2024-06-08');
      expect(result).toEqual([]);
    });

    it('flags a dropped day that has a non-blank place name', () => {
      const days = [
        {
          localId: 'day-1',
          date: '2024-06-08',
          dayNumber: 1,
          coverPhotoFile: null,
          places: [],
        },
        {
          localId: 'day-2',
          date: '2024-06-09',
          dayNumber: 2,
          coverPhotoFile: null,
          places: [
            { localId: 'p1', name: '경복궁', category: '' as const, memo: '' },
          ],
        },
      ];

      const result = findDaysWithContent(days, '2024-06-08', '2024-06-08');
      expect(result).toHaveLength(1);
      expect(result[0].localId).toBe('day-2');
    });

    it('flags a dropped day that has a non-blank memo even with a blank name', () => {
      const days = [
        {
          localId: 'day-1',
          date: '2024-06-08',
          dayNumber: 1,
          coverPhotoFile: null,
          places: [
            {
              localId: 'p1',
              name: '',
              category: '' as const,
              memo: '아직 정하지 않음',
            },
          ],
        },
      ];

      const result = findDaysWithContent(days, '2024-06-09', '2024-06-10');
      expect(result).toHaveLength(1);
      expect(result[0].localId).toBe('day-1');
    });

    it('flags a dropped day that only has a cover photo', () => {
      const days = [
        {
          localId: 'day-1',
          date: '2024-06-08',
          dayNumber: 1,
          coverPhotoFile: makeImageFile('day1.jpg'),
          places: [],
        },
      ];

      const result = findDaysWithContent(days, '2024-06-09', '2024-06-10');
      expect(result).toHaveLength(1);
      expect(result[0].localId).toBe('day-1');
    });

    it('does not flag a day that stays in range even if it has content', () => {
      const days = [
        {
          localId: 'day-1',
          date: '2024-06-08',
          dayNumber: 1,
          coverPhotoFile: null,
          places: [
            { localId: 'p1', name: '경복궁', category: '' as const, memo: '' },
          ],
        },
      ];

      const result = findDaysWithContent(days, '2024-06-08', '2024-06-10');
      expect(result).toEqual([]);
    });
  });

  // ── draft persistence (sessionStorage) ──────────────────────────────────────

  describe('draft persistence', () => {
    it('writes a draft to sessionStorage once the form is no longer pristine, with File objects stripped and names recorded', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({ persistDraft: true })
      );

      act(() => {
        result.current.updateField('title', '제주 여행');
        result.current.updateField(
          'coverPhotoFile',
          makeImageFile('cover.jpg')
        );
      });

      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      expect(raw).not.toBeNull();

      const stored = JSON.parse(raw as string);
      expect(stored.values.title).toBe('제주 여행');
      // coverPhotoFile is a File and cannot survive JSON — it must be absent
      // from the serialized values, with only its name recorded separately.
      expect(stored.values.coverPhotoFile).toBeUndefined();
      expect(stored.fileNames.coverPhotoFile).toBe('cover.jpg');
      expect(JSON.stringify(stored)).not.toContain('"File"');
    });

    it('does not write a draft while the form is still pristine', () => {
      renderHook(() => useTravelRegisterForm({ persistDraft: true }));

      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    });

    it('does not persist a draft at all when persistDraft is not set (edit mode usage)', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({
          mode: 'edit',
          defaultValues: { title: '기존 여행' },
        })
      );

      act(() => {
        result.current.updateField('title', '수정된 제목');
        result.current.updateField('region', '부산');
      });

      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    });

    it('recovers a draft written in a previous session without auto-applying it, then applies it via resumeDraft()', () => {
      const draft = {
        version: 1,
        values: {
          title: '이어서 쓰는 여행',
          region: '제주',
          startDate: '2024-06-08',
          endDate: '2024-06-09',
          tags: [],
          days: [
            {
              localId: 'day-20240608',
              date: '2024-06-08',
              dayNumber: 1,
              places: [],
            },
            {
              localId: 'day-20240609',
              date: '2024-06-09',
              dayNumber: 2,
              places: [],
            },
          ],
        },
        fileNames: {
          coverPhotoFile: 'cover.jpg',
          dayCoverPhotoFiles: { 'day-20240608': 'day1.jpg' },
        },
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

      const { result } = renderHook(() =>
        useTravelRegisterForm({ persistDraft: true })
      );

      // Not auto-applied: values are still pristine, the caller must choose.
      expect(result.current.values.title).toBe('');
      expect(result.current.restoredDraft).toEqual({
        fileNames: {
          coverPhotoFile: 'cover.jpg',
          dayCoverPhotoFiles: { 'day-20240608': 'day1.jpg' },
        },
      });

      act(() => {
        result.current.resumeDraft();
      });

      expect(result.current.values.title).toBe('이어서 쓰는 여행');
      expect(result.current.values.coverPhotoFile).toBeNull();
      expect(result.current.values.days[0].coverPhotoFile).toBeNull();
      expect(result.current.restoredDraft).toBeNull();
    });

    it('discardDraft clears sessionStorage and the pending-draft flag without touching current values', () => {
      const draft = {
        version: 1,
        values: {
          title: '버릴 초안',
          region: '',
          startDate: '',
          endDate: '',
          tags: [],
          days: [],
        },
        fileNames: {},
      };
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));

      const { result } = renderHook(() =>
        useTravelRegisterForm({ persistDraft: true })
      );
      expect(result.current.restoredDraft).not.toBeNull();

      act(() => {
        result.current.discardDraft();
      });

      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
      expect(result.current.restoredDraft).toBeNull();
      expect(result.current.values.title).toBe('');
    });

    it('clearDraft removes the stored draft (for use after a successful save)', () => {
      const { result } = renderHook(() =>
        useTravelRegisterForm({ persistDraft: true })
      );

      act(() => {
        result.current.updateField('title', '저장할 여행');
      });
      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).not.toBeNull();

      act(() => {
        result.current.clearDraft();
      });

      expect(sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull();
    });
  });
});
