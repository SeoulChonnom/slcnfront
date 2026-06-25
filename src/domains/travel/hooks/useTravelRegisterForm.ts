import { useState } from 'react';
import type { PlaceCategory } from '../types';

// ── Local form types ───────────────────────────────────────────────────────────

export type PlaceFormRow = {
  localId: string;
  name: string;
  category: PlaceCategory | '';
  memo: string;
};

export type DayFormRow = {
  localId: string;
  date: string; // YYYY-MM-DD
  dayNumber: number;
  coverPhotoFile: File | null;
  places: PlaceFormRow[];
};

export type TravelRegisterFormValues = {
  title: string;
  region: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  coverPhotoFile: File | null;
  albumPhotoFiles: File[];
  tags: string[];
  days: DayFormRow[];
};

export type TravelRegisterFormErrors = {
  title?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function newPlaceRow(): PlaceFormRow {
  return {
    localId: `place-${Date.now()}-${Math.random()}`,
    name: '',
    category: '',
    memo: '',
  };
}

function buildDayRows(startDate: string, endDate: string): DayFormRow[] {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  )
    return [];

  const rows: DayFormRow[] = [];
  const current = new Date(start);
  let dayNumber = 1;

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');

    rows.push({
      localId: `day-${yyyy}${mm}${dd}`,
      date: `${yyyy}-${mm}-${dd}`,
      dayNumber,
      coverPhotoFile: null,
      places: [],
    });

    current.setDate(current.getDate() + 1);
    dayNumber++;
  }

  return rows;
}

export function computeNightsDays(
  startDate: string,
  endDate: string
): { nights: number; days: number } | null {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  )
    return null;

  const msPerDay = 86_400_000;
  const nights = Math.round((end.getTime() - start.getTime()) / msPerDay);
  const days = nights + 1;

  return { nights, days };
}

/** Add `deltaDays` to `dateStr` (YYYY-MM-DD), returning a new YYYY-MM-DD string. */
function shiftDate(dateStr: string, deltaDays: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + deltaDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function validateForm(
  values: TravelRegisterFormValues
): TravelRegisterFormErrors {
  const errors: TravelRegisterFormErrors = {};

  if (!values.title.trim()) {
    errors.title = '제목을 입력해 주세요.';
  }

  if (!values.startDate) {
    errors.startDate = '시작일을 선택해 주세요.';
  }

  if (!values.endDate) {
    errors.endDate = '종료일을 선택해 주세요.';
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = '종료일은 시작일 이후여야 해요.';
  }

  return errors;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

function initialValues(): TravelRegisterFormValues {
  return {
    title: '',
    region: '',
    startDate: '',
    endDate: '',
    coverPhotoFile: null,
    albumPhotoFiles: [],
    tags: [],
    days: [],
  };
}

type UseTravelRegisterFormOptions = {
  defaultValues?: Partial<TravelRegisterFormValues>;
};

export function useTravelRegisterForm(
  options: UseTravelRegisterFormOptions = {}
) {
  const [values, setValues] = useState<TravelRegisterFormValues>(() => ({
    ...initialValues(),
    ...options.defaultValues,
  }));
  const [errors, setErrors] = useState<TravelRegisterFormErrors>({});
  const [tagInput, setTagInput] = useState('');

  // ── Field updaters ────────────────────────────────────────────────────────

  function updateField<K extends keyof TravelRegisterFormValues>(
    key: K,
    value: TravelRegisterFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof TravelRegisterFormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof TravelRegisterFormErrors];
        return next;
      });
    }
  }

  function updateStartDate(date: string) {
    setValues((prev) => {
      const newDays = buildDayRows(date, prev.endDate);
      return { ...prev, startDate: date, days: newDays };
    });
    if (errors.startDate) {
      setErrors((prev) => ({ ...prev, startDate: undefined }));
    }
  }

  function updateEndDate(date: string) {
    setValues((prev) => {
      const newDays = buildDayRows(prev.startDate, date);
      return { ...prev, endDate: date, days: newDays };
    });
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: undefined }));
    }
  }

  // ── Tag management ────────────────────────────────────────────────────────

  function addTag() {
    const name = tagInput.trim().replace(/^#/, '');
    if (!name) return;
    if (values.tags.includes(name)) {
      setTagInput('');
      return;
    }
    setValues((prev) => ({ ...prev, tags: [...prev.tags, name] }));
    setTagInput('');
  }

  function removeTag(name: string) {
    setValues((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== name),
    }));
  }

  // ── Day / place management ────────────────────────────────────────────────

  function addPlace(dayLocalId: string) {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.localId === dayLocalId
          ? { ...d, places: [...d.places, newPlaceRow()] }
          : d
      ),
    }));
  }

  function removePlace(dayLocalId: string, placeLocalId: string) {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.localId === dayLocalId
          ? {
              ...d,
              places: d.places.filter((p) => p.localId !== placeLocalId),
            }
          : d
      ),
    }));
  }

  function updatePlace(
    dayLocalId: string,
    placeLocalId: string,
    field: keyof Omit<PlaceFormRow, 'localId'>,
    value: string
  ) {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.localId === dayLocalId
          ? {
              ...d,
              places: d.places.map((p) =>
                p.localId === placeLocalId ? { ...p, [field]: value } : p
              ),
            }
          : d
      ),
    }));
  }

  function updateDayCoverPhoto(dayLocalId: string, file: File | null) {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((d) =>
        d.localId === dayLocalId ? { ...d, coverPhotoFile: file } : d
      ),
    }));
  }

  // ── Duration stepper ──────────────────────────────────────────────────────

  /**
   * Increase trip length by one day (extend endDate by +1, or set endDate to
   * startDate+1 when only startDate is set).  Appends a new day card.
   */
  function incrementDuration() {
    setValues((prev) => {
      if (!prev.startDate) return prev;
      const currentEnd = prev.endDate || prev.startDate;
      const newEnd = shiftDate(currentEnd, 1);
      const newDays = buildDayRows(prev.startDate, newEnd);
      return { ...prev, endDate: newEnd, days: newDays };
    });
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: undefined }));
    }
  }

  /**
   * Decrease trip length by one day (move endDate back by 1).
   * Minimum is 당일치기 (startDate === endDate, 0박 1일).
   * The last day card is automatically dropped because buildDayRows rebuilds.
   */
  function decrementDuration() {
    setValues((prev) => {
      if (!prev.startDate || !prev.endDate) return prev;
      const nd = computeNightsDays(prev.startDate, prev.endDate);
      // Do not go below 0 nights (당일치기)
      if (!nd || nd.nights === 0) return prev;
      const newEnd = shiftDate(prev.endDate, -1);
      const newDays = buildDayRows(prev.startDate, newEnd);
      return { ...prev, endDate: newEnd, days: newDays };
    });
  }

  // ── Validation & submit helpers ───────────────────────────────────────────

  function validate(): boolean {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  return {
    values,
    errors,
    tagInput,
    setTagInput,
    updateField,
    updateStartDate,
    updateEndDate,
    incrementDuration,
    decrementDuration,
    addTag,
    removeTag,
    addPlace,
    removePlace,
    updatePlace,
    updateDayCoverPhoto,
    validate,
  };
}

export type UseTravelRegisterFormReturn = ReturnType<
  typeof useTravelRegisterForm
>;
