import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { travelFilesApi } from '@/domains/travel/api/travel-files-api';
import { TravelRegisterForm } from '@/domains/travel/components/TravelRegisterForm';
import { useTravelDetail } from '@/domains/travel/hooks/useTravelDetail';
import {
  useCreateTravel,
  useUpdateTravel,
} from '@/domains/travel/hooks/useTravelMutations';
import {
  type DayFormRow,
  type PlaceFormRow,
  type TravelRegisterFormValues,
  useTravelRegisterForm,
} from '@/domains/travel/hooks/useTravelRegisterForm';
import { buildTravelFileBoxItems } from '@/domains/travel/mappers/travel-payload';
import type {
  TravelDayUdo,
  TravelDetail,
  TravelFileBoxItemCdo,
  TravelPlaceUdo,
} from '@/domains/travel/types';
import {
  buildDeviceTravelDetailPath,
  buildDeviceTravelListPath,
} from '@/lib/routing/route-builders';

type SubmitPhase = 'idle' | 'uploading' | 'saving';

/** Assemble the nested `travelDays` payload (with each day's `places`) from
 * the local form state. Day- and place-level photos are not part of the
 * create/update payload: the server has no target row to attach a day/place
 * photo to at create time, and `TravelDayUdo`/`TravelPlaceUdo` no longer
 * carry a `photos` field. */
function buildTravelDays(
  days: TravelRegisterFormValues['days']
): TravelDayUdo[] {
  return days.map((day, dayIndex) => {
    const places: TravelPlaceUdo[] = day.places
      .filter((place) => place.name.trim().length > 0)
      .map((place, placeIndex) => ({
        name: place.name.trim(),
        category: place.category === '' ? 'ETC' : place.category,
        memo: place.memo.trim() || undefined,
        sortOrder: placeIndex,
      }));

    return {
      date: day.date,
      sortOrder: dayIndex,
      places,
    };
  });
}

/** Map a loaded TravelDetail into form default values (edit mode). */
function mapDetailToDefaultValues(
  travel: TravelDetail
): TravelRegisterFormValues {
  const days: DayFormRow[] = travel.travelDays.map((travelDay) => {
    const places: PlaceFormRow[] = travelDay.places.map((place) => ({
      localId: `place-${place.id}`,
      name: place.name,
      category: place.category,
      // Mirror the detail page (TravelPlaceItem shows `description ?? memo`),
      // so the form's single 메모 field prefills from the same source —
      // otherwise text saved in `description` (with memo null) looks lost when
      // re-editing.
      memo: place.description ?? place.memo ?? '',
    }));

    return {
      localId: `day-${travelDay.id}`,
      date: travelDay.date,
      dayNumber: travelDay.dayNumber,
      coverPhotoFile: null,
      places,
    };
  });

  return {
    title: travel.title,
    region: travel.region,
    startDate: travel.startDate,
    endDate: travel.endDate,
    coverPhotoFile: null,
    albumPhotoFiles: [],
    tags: travel.tags.map((t) => t.name),
    days,
  };
}

function deriveUploadErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return `사진을 올리지 못했어요. ${error.message}`;
  }

  return '사진을 올리지 못했어요. 잠시 뒤 다시 시도해 주세요.';
}

// ── Inner form controller ─────────────────────────────────────────────────────

type TravelRegisterFormControllerProps = {
  device: DeviceType;
  mode: 'register' | 'edit';
  travelId?: string;
  resolvedInitialValues: TravelRegisterFormValues;
};

function TravelRegisterFormController({
  device,
  mode,
  travelId,
  resolvedInitialValues,
}: TravelRegisterFormControllerProps) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const form = useTravelRegisterForm({
    defaultValues: resolvedInitialValues,
    mode,
    persistDraft: mode === 'register',
  });

  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(
    null
  );

  const createMutation = useCreateTravel();
  const updateMutation = useUpdateTravel(travelId ?? '');

  function handleCancel() {
    navigate(buildDeviceTravelListPath(device));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.validate()) return;

    setUploadErrorMessage(null);

    const { values } = form;
    const hasNewCover = Boolean(values.coverPhotoFile);
    const hasNewAlbumFiles = values.albumPhotoFiles.length > 0;

    let files: TravelFileBoxItemCdo[] | undefined;

    if (hasNewCover || hasNewAlbumFiles) {
      setSubmitPhase('uploading');

      try {
        const [coverAsset, albumAssets] = await Promise.all([
          values.coverPhotoFile
            ? travelFilesApi.uploadTravelFile(values.coverPhotoFile)
            : Promise.resolve(null),
          travelFilesApi.uploadTravelFiles(values.albumPhotoFiles),
        ]);

        files = buildTravelFileBoxItems({
          coverFileId: coverAsset?.fileId ?? null,
          albumFileIds: albumAssets.map((asset) => asset.fileId),
        });
      } catch (error) {
        setSubmitPhase('idle');
        setUploadErrorMessage(deriveUploadErrorMessage(error));
        return;
      }
    }
    // In edit mode with no newly picked files, `files` stays undefined so
    // the update payload omits the key entirely rather than sending an
    // empty array that could clear the travel's existing cover/gallery.

    setSubmitPhase('saving');

    const travelDays = buildTravelDays(values.days);

    try {
      if (isEdit && travelId) {
        await updateMutation.mutateAsync(
          {
            title: values.title,
            region: values.region,
            startDate: values.startDate,
            endDate: values.endDate,
            tags: values.tags,
            confirmDeleteDays: true,
            travelDays,
            ...(files ? { files } : {}),
            review: {},
          },
          {
            onSuccess: () => {
              form.clearDraft();
              navigate(buildDeviceTravelDetailPath(device, travelId));
            },
          }
        );
      } else {
        await createMutation.mutateAsync(
          {
            title: values.title,
            region: values.region,
            startDate: values.startDate,
            endDate: values.endDate,
            tags: values.tags,
            travelDays,
            ...(files ? { files } : {}),
            review: {},
          },
          {
            onSuccess: (newTravel) => {
              form.clearDraft();
              navigate(buildDeviceTravelDetailPath(device, newTravel.travelId));
            },
          }
        );
      }
    } catch {
      // Surfaced below via mutation.error; keep the user's input intact.
    } finally {
      setSubmitPhase('idle');
    }
  }

  const mutationError = isEdit ? updateMutation.error : createMutation.error;
  const submitErrorMessage =
    uploadErrorMessage ??
    (mutationError
      ? (mutationError.message ??
        '저장 중 오류가 발생했어요. 다시 시도해 주세요.')
      : null);

  return (
    <TravelRegisterForm
      form={form}
      mode={mode}
      submitPhase={submitPhase}
      submitError={submitErrorMessage}
      onSubmit={(e) => void handleSubmit(e)}
      onCancel={handleCancel}
    />
  );
}

// ── Empty default values for register mode ────────────────────────────────────

const EMPTY_FORM_VALUES: TravelRegisterFormValues = {
  title: '',
  region: '',
  startDate: '',
  endDate: '',
  coverPhotoFile: null,
  albumPhotoFiles: [],
  tags: [],
  days: [],
};

// ── Section wrapper ───────────────────────────────────────────────────────────

type TravelRegisterSectionProps = {
  device: DeviceType;
  mode: 'register' | 'edit';
  travelId?: string;
};

export function TravelRegisterSection({
  device,
  mode,
  travelId,
}: TravelRegisterSectionProps) {
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const {
    data: existingTravel,
    isLoading,
    isError,
  } = useTravelDetail(isEdit ? travelId : undefined);

  function handleCancel() {
    navigate(buildDeviceTravelListPath(device));
  }

  const resolvedInitialValues =
    isEdit && existingTravel
      ? mapDetailToDefaultValues(existingTravel)
      : EMPTY_FORM_VALUES;

  // In edit mode, wait until the detail has loaded before mounting the form so
  // that the lazy useState inside useTravelRegisterForm initialises with real
  // data instead of empty values.
  const formReady = !isEdit || Boolean(existingTravel);

  const title = isEdit ? '여행 수정' : '새 여행 기록하기';
  const subtitle = isEdit
    ? '기본 정보를 수정하면 날짜별 기록 칸이 자동으로 조정돼요.'
    : '기본 정보를 입력하면 날짜별 기록 칸이 자동으로 만들어져요.';

  return (
    <section className='slcn-travel-register-section'>
      {device === 'main' ? (
        <div className='slcn-travel-register-section__header'>
          <button
            type='button'
            className='slcn-travel-register-section__back-btn'
            onClick={handleCancel}
          >
            ‹ 돌아가기
          </button>
          <div>
            <h1 className='slcn-travel-register-section__title'>{title}</h1>
            <p className='slcn-travel-register-section__subtitle'>{subtitle}</p>
          </div>
        </div>
      ) : (
        // The mobile shell (DetailMobileShell) already renders the visible
        // title and back arrow for this route, so repeating them here would
        // show both. A visually-hidden h1 keeps the page's heading structure
        // honest for assistive tech without drawing a second title on screen.
        <div className='slcn-travel-register-section__header'>
          <h1 className='slcn-visually-hidden'>{title}</h1>
          <p className='slcn-travel-register-section__subtitle'>{subtitle}</p>
        </div>
      )}

      {isEdit && isLoading ? (
        <p className='slcn-travel-register-section__loading' aria-live='polite'>
          불러오는 중…
        </p>
      ) : null}

      {isEdit && isError ? (
        <p className='slcn-travel-register-section__load-error' role='alert'>
          여행 정보를 불러오지 못했어요. 여행 목록에서 다시 열어 주세요.
        </p>
      ) : null}

      {formReady ? (
        <TravelRegisterFormController
          key={travelId ?? 'new'}
          device={device}
          mode={mode}
          travelId={travelId}
          resolvedInitialValues={resolvedInitialValues}
        />
      ) : null}
    </section>
  );
}
