import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '../../../app/router/route-constants';
import {
  buildDeviceTravelEditPath,
  buildDeviceTravelListPath,
} from '../../../lib/routing/route-builders';
import { useTravelAssetUrl } from '../hooks/useTravelAssetUrl';
import {
  useAddTravelPhoto,
  useAddTravelTag,
  useCreateTravelPlace,
  useDeleteTravelTag,
} from '../hooks/useTravelMutations';
import type {
  TravelDay,
  TravelDetail,
  TravelPhotoCdo,
  TravelPlaceCdo,
} from '../types';
import { AddPhotoModal } from './AddPhotoModal';
import { AddPlaceModal } from './AddPlaceModal';
import { TravelDayList } from './TravelDayList';
import { TravelPhotoAlbum } from './TravelPhotoAlbum';
import { TravelReviewSection } from './TravelReviewSection';
import { TravelTagSection } from './TravelTagSection';

type TravelDetailSectionProps = {
  device: DeviceType;
  travel: TravelDetail;
};

const NAV_ITEMS = [
  { label: '날짜별 기록', sectionId: 'section-days' },
  { label: '사진 앨범', sectionId: 'section-album' },
  { label: '여행 후기', sectionId: 'section-review' },
  { label: '태그', sectionId: 'section-tags' },
] as const;

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function TravelDetailSection({
  device,
  travel,
}: TravelDetailSectionProps) {
  const navigate = useNavigate();
  const [placeModalDay, setPlaceModalDay] = useState<TravelDay | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const { objectUrl: heroCoverUrl } = useTravelAssetUrl(travel.coverPhotoId);

  const createPlace = useCreateTravelPlace(travel.id);
  const addPhoto = useAddTravelPhoto(travel.id);
  const addTag = useAddTravelTag(travel.id);
  const deleteTag = useDeleteTravelTag(travel.id);

  // Place count: sum of places across all travelDays (or fall back to travel.places)
  const placeCount =
    travel.travelDays.length > 0
      ? travel.travelDays.reduce((sum, day) => sum + day.places.length, 0)
      : travel.places.length;

  // Photo count from travel.photos
  const photoCount = travel.photos.length;

  function handleCreatePlace(args: {
    travelDayId: string;
    payload: TravelPlaceCdo;
  }) {
    createPlace.mutate(
      {
        currentTravel: travel,
        travelDayId: args.travelDayId,
        payload: args.payload,
      },
      { onSuccess: () => setPlaceModalDay(null) }
    );
  }

  function handleAddPhotos(payloads: TravelPhotoCdo[]) {
    if (payloads.length === 0) {
      return;
    }
    addPhoto.mutate(
      { currentTravel: travel, payloads },
      { onSettled: () => setIsPhotoModalOpen(false) }
    );
  }

  return (
    <section className='slcn-travel-detail' data-device={device}>
      <div className='slcn-travel-detail__actions'>
        <button
          type='button'
          className='slcn-travel-detail__back'
          onClick={() => navigate(buildDeviceTravelListPath(device))}
        >
          <span aria-hidden='true'>‹</span> 여행 목록
        </button>
        <button
          type='button'
          className='slcn-travel-detail__edit'
          onClick={() => navigate(buildDeviceTravelEditPath(device, travel.id))}
        >
          <svg
            aria-hidden='true'
            className='slcn-travel-detail__edit-icon'
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.755.445l-3.251.93a.75.75 0 0 1-.927-.928l.93-3.25c.08-.286.235-.547.445-.756l8.608-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.19 6.25 9.75 4.81 3.847 10.714a.252.252 0 0 0-.064.108l-.65 2.274 2.274-.65a.252.252 0 0 0 .108-.064L11.19 6.25Z'
              fill='currentColor'
            />
          </svg>
          여행 수정
        </button>
      </div>

      {/* Hero card: cover image + info block in one white card */}
      <div className='slcn-travel-detail__hero-card'>
        {/* Cover image area */}
        <div className='slcn-travel-detail__hero slcn-travel-hatch'>
          <span className='slcn-travel-detail__nights'>
            {travel.nightsDaysLabel}
          </span>
          {heroCoverUrl ? (
            <img
              src={heroCoverUrl}
              alt={travel.title}
              className='slcn-travel-cover-img'
            />
          ) : (
            /* Map placeholder icon (shown when no cover photo) */
            <span
              className='slcn-travel-detail__hero-placeholder'
              aria-hidden='true'
            >
              <svg
                role='img'
                aria-label='지도'
                width='48'
                height='48'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <title>지도</title>
                <path
                  d='M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3Z'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <line
                  x1='9'
                  y1='3'
                  x2='9'
                  y2='18'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
                <line
                  x1='15'
                  y1='6'
                  x2='15'
                  y2='21'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
            </span>
          )}
        </div>

        {/* Info block */}
        <div className='slcn-travel-detail__title-block'>
          <div className='slcn-travel-detail__meta'>
            <span className='slcn-travel-detail__region'>{travel.region}</span>
            <span className='slcn-travel-detail__dates'>
              {travel.dateRangeLabel}
            </span>
          </div>
          <h1 className='slcn-travel-detail__title'>{travel.title}</h1>
          {travel.oneLineReview ? (
            <p className='slcn-travel-detail__one-line'>
              {travel.oneLineReview}
            </p>
          ) : null}

          {/* Stats row */}
          <div
            className='slcn-travel-detail__stats-divider'
            aria-hidden='true'
          />
          <div className='slcn-travel-detail__stats'>
            <div className='slcn-travel-detail__stat'>
              <span className='slcn-travel-detail__stat-label'>날짜</span>
              <span className='slcn-travel-detail__stat-value'>
                {travel.days}
                <span className='slcn-travel-detail__stat-unit'>일</span>
              </span>
            </div>
            <div className='slcn-travel-detail__stat'>
              <span className='slcn-travel-detail__stat-label'>장소</span>
              <span className='slcn-travel-detail__stat-value'>
                {placeCount}
                <span className='slcn-travel-detail__stat-unit'>곳</span>
              </span>
            </div>
            <div className='slcn-travel-detail__stat'>
              <span className='slcn-travel-detail__stat-label'>사진</span>
              <span className='slcn-travel-detail__stat-value'>
                {photoCount}
                <span className='slcn-travel-detail__stat-unit'>장</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section nav pill row */}
      <nav
        className='slcn-travel-detail__section-nav'
        aria-label='페이지 내 섹션 이동'
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.sectionId}
            type='button'
            className='slcn-travel-detail__section-nav-pill'
            onClick={() => scrollToSection(item.sectionId)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className='slcn-travel-detail__section' id='section-days'>
        <h2 className='slcn-travel-detail__section-title'>날짜별 기록</h2>
        <TravelDayList days={travel.travelDays} onAddPlace={setPlaceModalDay} />
      </section>

      <section className='slcn-travel-detail__section' id='section-album'>
        <h2 className='slcn-travel-detail__section-title'>사진 앨범</h2>
        <TravelPhotoAlbum
          photos={travel.photos}
          days={travel.travelDays}
          places={travel.places}
          onAddPhoto={() => setIsPhotoModalOpen(true)}
        />
      </section>

      <section className='slcn-travel-detail__section' id='section-review'>
        <h2 className='slcn-travel-detail__section-title'>여행 후기</h2>
        <TravelReviewSection review={travel.review} />
      </section>

      <section className='slcn-travel-detail__section' id='section-tags'>
        <h2 className='slcn-travel-detail__section-title'>태그</h2>
        <TravelTagSection
          tags={travel.tags}
          isAdding={addTag.isPending}
          isRemoving={deleteTag.isPending}
          onAddTag={(name) => addTag.mutate({ currentTravel: travel, name })}
          onRemoveTag={(tagId) =>
            deleteTag.mutate({ currentTravel: travel, tagId })
          }
        />
      </section>

      {placeModalDay ? (
        <AddPlaceModal
          isOpen={placeModalDay !== null}
          dayNumber={placeModalDay.dayNumber}
          travelDayId={placeModalDay.id}
          isSubmitting={createPlace.isPending}
          errorMessage={
            createPlace.isError ? '장소를 저장하지 못했어요.' : null
          }
          onClose={() => setPlaceModalDay(null)}
          onSubmit={handleCreatePlace}
        />
      ) : null}

      <AddPhotoModal
        isOpen={isPhotoModalOpen}
        photos={travel.photos}
        isSubmitting={addPhoto.isPending}
        errorMessage={addPhoto.isError ? '사진을 추가하지 못했어요.' : null}
        onClose={() => setIsPhotoModalOpen(false)}
        onSubmit={handleAddPhotos}
      />
    </section>
  );
}
