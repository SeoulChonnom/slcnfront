import { useEffect, useState } from 'react';
import type { PlaceCategory } from '@/domains/travel/types';

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
  coverPhotoFile?: string;
  /**
   * Set when a day holds a place row that has a memo but no name —
   * buildTravelDays (TravelRegisterSection) drops any place without a name,
   * so submitting silently loses that memo. Names the affected day(s).
   */
  days?: string;
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

/**
 * Rebuild the day list for [startDate, endDate].
 *
 * This MERGES against `previousDays` instead of regenerating from scratch:
 * any date that is still in range keeps its existing row (same localId,
 * places, coverPhotoFile) with only `dayNumber` recomputed. Only dates that
 * fall outside the new range are dropped, and only newly-covered dates get a
 * fresh empty row. Regenerating unconditionally used to silently destroy
 * every place a user had entered whenever they corrected a date typo or
 * used the duration stepper — see findDaysWithContent for the confirmation
 * path around the cases that still genuinely drop content.
 */
function buildDayRows(
  startDate: string,
  endDate: string,
  previousDays: DayFormRow[] = []
): DayFormRow[] {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  )
    return [];

  const previousByDate = new Map(previousDays.map((day) => [day.date, day]));

  const rows: DayFormRow[] = [];
  const current = new Date(start);
  let dayNumber = 1;

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;

    const existing = previousByDate.get(date);

    rows.push(
      existing
        ? { ...existing, dayNumber }
        : {
            localId: `day-${yyyy}${mm}${dd}`,
            date,
            dayNumber,
            coverPhotoFile: null,
            places: [],
          }
    );

    current.setDate(current.getDate() + 1);
    dayNumber++;
  }

  return rows;
}

function dayHasContent(day: DayFormRow): boolean {
  if (day.coverPhotoFile) return true;
  return day.places.some(
    (place) => place.name.trim() !== '' || place.memo.trim() !== ''
  );
}

/**
 * Which of `days` would be dropped by moving to [nextStartDate, nextEndDate],
 * AND actually hold content worth warning about (a place with a name/memo,
 * or a cover photo). Empty day cards are not worth interrupting the user
 * for. Date strings are YYYY-MM-DD, so plain string comparison is date
 * comparison.
 *
 * Pure and side-effect free on purpose: the component calls this to decide
 * whether to show a confirm dialog BEFORE calling updateStartDate /
 * updateEndDate / decrementDuration. Keeping window.confirm out of the hook
 * keeps the hook presentational-agnostic and testable without a DOM.
 */
export function findDaysWithContent(
  days: DayFormRow[],
  nextStartDate: string,
  nextEndDate: string
): DayFormRow[] {
  if (!nextStartDate || !nextEndDate) {
    return days.filter(dayHasContent);
  }

  return days.filter(
    (day) =>
      (day.date < nextStartDate || day.date > nextEndDate) && dayHasContent(day)
  );
}

/**
 * Days that hold a place row with a memo but no name. buildTravelDays
 * (TravelRegisterSection) filters out any place whose name is blank, so a
 * place like this would be dropped from the saved record with no warning —
 * this is what validateForm uses to catch that before submit.
 */
export function findDaysWithNamelessPlaces(days: DayFormRow[]): DayFormRow[] {
  return days.filter((day) =>
    day.places.some(
      (place) => place.name.trim() === '' && place.memo.trim() !== ''
    )
  );
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
  values: TravelRegisterFormValues,
  mode: 'register' | 'edit'
): TravelRegisterFormErrors {
  const errors: TravelRegisterFormErrors = {};

  if (!values.title.trim()) {
    errors.title = '제목을 입력해 주세요.';
  }

  if (!values.region.trim()) {
    errors.region = '지역을 입력해 주세요.';
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

  // The server rejects a save without exactly one cover image. An edit
  // already has one on the existing record, so only demand a fresh pick
  // during registration.
  if (mode === 'register' && !values.coverPhotoFile) {
    errors.coverPhotoFile = '대표 사진을 등록해 주세요.';
  }

  const namelessPlaceDays = findDaysWithNamelessPlaces(values.days);

  if (namelessPlaceDays.length > 0) {
    const list = namelessPlaceDays
      .map((day) => `${day.dayNumber}일차`)
      .join(', ');
    errors.days = `${list}에 메모만 적고 장소명을 비워 둔 곳이 있어요. 장소명을 입력해 주세요.`;
  }

  return errors;
}

// ── Draft persistence (sessionStorage) ─────────────────────────────────────────
//
// Mirrors src/domains/trip/hooks/useTripRegisterForm.ts's draft pattern, with
// one deliberate difference: that hook applies a recovered draft to `values`
// immediately on mount and lets "새로 쓰기" undo it. Here we do NOT auto-apply
// — the component decides between 이어서 쓰기 (resumeDraft) and 새로 쓰기
// (discardDraft) before anything touches the form, so a silent auto-apply
// can't surprise the user the way the day-row bug did.

const DRAFT_STORAGE_KEY = 'slcn:travel-register-draft';
const DRAFT_VERSION = 1;

type TravelRegisterDraftFileNames = {
  coverPhotoFile?: string;
  albumPhotoFiles?: string[];
  /** Keyed by DayFormRow.localId. */
  dayCoverPhotoFiles?: Record<string, string>;
};

type SerializableDayFormRow = Omit<DayFormRow, 'coverPhotoFile'>;

// File objects cannot survive JSON serialization; strip them from what gets
// written to sessionStorage and track their names separately instead.
type SerializableTravelRegisterFormValues = Omit<
  TravelRegisterFormValues,
  'coverPhotoFile' | 'albumPhotoFiles' | 'days'
> & {
  days: SerializableDayFormRow[];
};

type TravelRegisterDraft = {
  version: typeof DRAFT_VERSION;
  values: SerializableTravelRegisterFormValues;
  fileNames: TravelRegisterDraftFileNames;
};

function isDraftShape(value: unknown): value is TravelRegisterDraft {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate.version === DRAFT_VERSION &&
    typeof candidate.values === 'object' &&
    candidate.values !== null &&
    typeof candidate.fileNames === 'object' &&
    candidate.fileNames !== null
  );
}

function readDraft(): TravelRegisterDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isDraftShape(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(draft: TravelRegisterDraft) {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage may be unavailable (e.g. Safari private mode quota) — degrade silently.
  }
}

function clearDraftStorage() {
  try {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function toSerializableValues(
  values: TravelRegisterFormValues
): SerializableTravelRegisterFormValues {
  const {
    coverPhotoFile: _coverPhotoFile,
    albumPhotoFiles: _albumPhotoFiles,
    days,
    ...rest
  } = values;

  return {
    ...rest,
    days: days.map(({ coverPhotoFile: _dayCoverPhotoFile, ...day }) => day),
  };
}

function isValuesPristine(values: TravelRegisterFormValues): boolean {
  return (
    values.title === '' &&
    values.region === '' &&
    values.startDate === '' &&
    values.endDate === '' &&
    values.tags.length === 0 &&
    values.days.length === 0 &&
    values.coverPhotoFile === null &&
    values.albumPhotoFiles.length === 0
  );
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
  /** Defaults to 'register'. Controls cover-photo validation strictness. */
  mode?: 'register' | 'edit';
  /**
   * Opt-in, not inferred from `mode`: draft persistence should only ever run
   * for the register flow, never while editing an existing record, and the
   * caller states that explicitly rather than the hook guessing.
   */
  persistDraft?: boolean;
};

export function useTravelRegisterForm(
  options: UseTravelRegisterFormOptions = {}
) {
  const mode = options.mode ?? 'register';
  const [values, setValues] = useState<TravelRegisterFormValues>(() => ({
    ...initialValues(),
    ...options.defaultValues,
  }));
  const [errors, setErrors] = useState<TravelRegisterFormErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [persistedFileNames, setPersistedFileNames] =
    useState<TravelRegisterDraftFileNames>({});
  const [pendingDraft, setPendingDraft] = useState<TravelRegisterDraft | null>(
    null
  );

  // Recover an abandoned draft once, on mount — but do not apply it. The
  // component shows a 이어서 쓰기 / 새로 쓰기 choice and calls resumeDraft()
  // or discardDraft() based on what the user picks.
  useEffect(() => {
    if (!options.persistDraft) return;

    const draft = readDraft();

    if (!draft) return;

    setPendingDraft(draft);
    // Intentionally runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft whenever values change, unless the form is still
  // pristine. No explicit debounce: the trip wizard this is ported from
  // doesn't debounce either, it just writes on every values change.
  useEffect(() => {
    if (!options.persistDraft) return;
    if (isValuesPristine(values)) return;

    const dayCoverPhotoFiles: Record<string, string> = {};
    for (const day of values.days) {
      const name = day.coverPhotoFile
        ? day.coverPhotoFile.name
        : persistedFileNames.dayCoverPhotoFiles?.[day.localId];
      if (name) {
        dayCoverPhotoFiles[day.localId] = name;
      }
    }

    writeDraft({
      version: DRAFT_VERSION,
      values: toSerializableValues(values),
      fileNames: {
        coverPhotoFile: values.coverPhotoFile
          ? values.coverPhotoFile.name
          : persistedFileNames.coverPhotoFile,
        albumPhotoFiles:
          values.albumPhotoFiles.length > 0
            ? values.albumPhotoFiles.map((file) => file.name)
            : persistedFileNames.albumPhotoFiles,
        dayCoverPhotoFiles,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, persistedFileNames, options.persistDraft]);

  function resumeDraft() {
    if (!pendingDraft) return;

    const draft = pendingDraft;

    setValues((current) => ({
      ...current,
      ...draft.values,
      coverPhotoFile: null,
      albumPhotoFiles: [],
      days: draft.values.days.map((day) => ({ ...day, coverPhotoFile: null })),
    }));
    setPersistedFileNames(draft.fileNames);
    setPendingDraft(null);
  }

  function discardDraft() {
    clearDraftStorage();
    setPendingDraft(null);
  }

  /** Call after a successful save so a stale draft doesn't resurface later. */
  function clearDraft() {
    clearDraftStorage();
  }

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

    // A fresh file pick (or clearing one) supersedes whatever name was
    // recovered from a restored draft — stop showing/persisting the stale note.
    if (key === 'coverPhotoFile') {
      setPersistedFileNames((prev) => {
        if (prev.coverPhotoFile === undefined) return prev;
        const { coverPhotoFile: _drop, ...rest } = prev;
        return rest;
      });
    } else if (key === 'albumPhotoFiles') {
      setPersistedFileNames((prev) => {
        if (prev.albumPhotoFiles === undefined) return prev;
        const { albumPhotoFiles: _drop, ...rest } = prev;
        return rest;
      });
    }
  }

  function updateStartDate(date: string) {
    setValues((prev) => {
      const newDays = buildDayRows(date, prev.endDate, prev.days);
      return { ...prev, startDate: date, days: newDays };
    });
    if (errors.startDate) {
      setErrors((prev) => ({ ...prev, startDate: undefined }));
    }
  }

  function updateEndDate(date: string) {
    setValues((prev) => {
      const newDays = buildDayRows(prev.startDate, date, prev.days);
      return { ...prev, endDate: date, days: newDays };
    });
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: undefined }));
    }
  }

  /** Preview of what updateStartDate(date) would drop, for a confirm prompt. */
  function previewStartDate(date: string): DayFormRow[] {
    return findDaysWithContent(values.days, date, values.endDate);
  }

  /** Preview of what updateEndDate(date) would drop, for a confirm prompt. */
  function previewEndDate(date: string): DayFormRow[] {
    return findDaysWithContent(values.days, values.startDate, date);
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

    setPersistedFileNames((prev) => {
      if (
        !prev.dayCoverPhotoFiles ||
        !(dayLocalId in prev.dayCoverPhotoFiles)
      ) {
        return prev;
      }
      const nextDayFiles = { ...prev.dayCoverPhotoFiles };
      delete nextDayFiles[dayLocalId];
      return { ...prev, dayCoverPhotoFiles: nextDayFiles };
    });
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
      const newDays = buildDayRows(prev.startDate, newEnd, prev.days);
      return { ...prev, endDate: newEnd, days: newDays };
    });
    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: undefined }));
    }
  }

  /**
   * Decrease trip length by one day (move endDate back by 1).
   * Minimum is 당일치기 (startDate === endDate, 0박 1일).
   * The dropped day's content (if any) is what previewDecrementDuration()
   * surfaces so the component can confirm before calling this.
   */
  function decrementDuration() {
    setValues((prev) => {
      if (!prev.startDate || !prev.endDate) return prev;
      const nd = computeNightsDays(prev.startDate, prev.endDate);
      // Do not go below 0 nights (당일치기)
      if (!nd || nd.nights === 0) return prev;
      const newEnd = shiftDate(prev.endDate, -1);
      const newDays = buildDayRows(prev.startDate, newEnd, prev.days);
      return { ...prev, endDate: newEnd, days: newDays };
    });
  }

  /** Preview of what decrementDuration() would drop, for a confirm prompt. */
  function previewDecrementDuration(): DayFormRow[] {
    if (!values.startDate || !values.endDate) return [];
    const nd = computeNightsDays(values.startDate, values.endDate);
    if (!nd || nd.nights === 0) return [];
    const newEnd = shiftDate(values.endDate, -1);
    return findDaysWithContent(values.days, values.startDate, newEnd);
  }

  // ── Validation & submit helpers ───────────────────────────────────────────

  function validate(): boolean {
    const nextErrors = validateForm(values, mode);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const restoredDraft = pendingDraft
    ? { fileNames: pendingDraft.fileNames }
    : null;

  return {
    values,
    errors,
    tagInput,
    setTagInput,
    updateField,
    updateStartDate,
    updateEndDate,
    previewStartDate,
    previewEndDate,
    incrementDuration,
    decrementDuration,
    previewDecrementDuration,
    addTag,
    removeTag,
    addPlace,
    removePlace,
    updatePlace,
    updateDayCoverPhoto,
    validate,
    restoredDraft,
    resumeDraft,
    discardDraft,
    clearDraft,
  };
}

export type UseTravelRegisterFormReturn = ReturnType<
  typeof useTravelRegisterForm
>;
