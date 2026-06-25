import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import {
  buildDeviceTravelDetailPath,
  buildDeviceTravelListPath,
} from '../../../lib/routing/route-builders';
import { useTravelDetail } from '../hooks/useTravelDetail';
import { useCreateTravel, useUpdateTravel } from '../hooks/useTravelMutations';
import {
  type DayFormRow,
  type PlaceFormRow,
  type TravelRegisterFormValues,
  useTravelRegisterForm,
} from '../hooks/useTravelRegisterForm';
import type { TravelDayUdo, TravelDetail, TravelPlaceUdo } from '../types';
import { TravelRegisterForm } from './TravelRegisterForm';

/**
 * Assemble the nested `travelDays` payload (with each day's `places` and
 * `photos`) from the local form state. Photo uploads are not wired yet, so
 * every `photos` array is sent empty rather than inventing `photoFileId`s.
 */
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
        photos: [],
      }));

    return {
      date: day.date,
      sortOrder: dayIndex,
      photos: [],
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

  const form = useTravelRegisterForm({ defaultValues: resolvedInitialValues });

  const createMutation = useCreateTravel();
  const updateMutation = useUpdateTravel(travelId ?? '');

  const isPending = isEdit
    ? updateMutation.isPending
    : createMutation.isPending;

  function handleCancel() {
    navigate(buildDeviceTravelListPath(device));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.validate()) return;

    const { values } = form;
    const travelDays = buildTravelDays(values.days);

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
          photos: [],
          review: {},
        },
        {
          onSuccess: () => {
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
          photos: [],
          review: {},
        },
        {
          onSuccess: (newTravel) => {
            navigate(buildDeviceTravelDetailPath(device, newTravel.travelId));
          },
        }
      );
    }
  }

  const submitError = isEdit ? updateMutation.error : createMutation.error;

  return (
    <>
      {submitError ? (
        <p className='slcn-travel-register-section__submit-error' role='alert'>
          {submitError.message ??
            '저장 중 오류가 발생했어요. 다시 시도해 주세요.'}
        </p>
      ) : null}

      <TravelRegisterForm
        form={form}
        mode={mode}
        isPending={isPending}
        onSubmit={(e) => void handleSubmit(e)}
        onCancel={handleCancel}
      />
    </>
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

  return (
    <section className='slcn-travel-register-section'>
      <div className='slcn-travel-register-section__header'>
        <button
          type='button'
          className='slcn-travel-register-section__back-btn'
          onClick={handleCancel}
        >
          ‹ 돌아가기
        </button>
        <div>
          <h1 className='slcn-travel-register-section__title'>
            {isEdit ? '여행 수정' : '새 여행 기록하기'}
          </h1>
          <p className='slcn-travel-register-section__subtitle'>
            {isEdit
              ? '기본 정보를 수정하면 날짜별 기록 칸이 자동으로 조정돼요.'
              : '기본 정보를 입력하면 날짜별 기록 칸이 자동으로 만들어져요.'}
          </p>
        </div>
      </div>

      {isEdit && isLoading ? (
        <p className='slcn-travel-register-section__loading' aria-live='polite'>
          불러오는 중…
        </p>
      ) : null}

      {isEdit && isError ? (
        <p className='slcn-travel-register-section__load-error' role='alert'>
          여행 정보를 불러오지 못했어요. 다시 시도해 주세요.
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
