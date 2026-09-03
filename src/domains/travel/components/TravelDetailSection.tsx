import { useNavigate } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { TravelDayList } from '@/domains/travel/components/TravelDayList';
import { TravelImage } from '@/domains/travel/components/TravelImage';
import { TravelPhotoAlbum } from '@/domains/travel/components/TravelPhotoAlbum';
import { TravelReviewSection } from '@/domains/travel/components/TravelReviewSection';
import { TravelTagSection } from '@/domains/travel/components/TravelTagSection';
import type { TravelDetail } from '@/domains/travel/types';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';
import {
  buildDeviceTravelEditPath,
  buildDeviceTravelListPath,
} from '@/lib/routing/route-builders';

type TravelDetailSectionProps = {
  device: DeviceType;
  travel?: TravelDetail;
  isPending?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function TravelDetailSection({
  device,
  travel,
  isPending = false,
  isError = false,
  onRetry,
}: TravelDetailSectionProps) {
  const navigate = useNavigate();

  const heroCoverUrl = buildOptionalAssetImageUrl(travel?.coverPhotoId);

  return (
    <section className='slcn-travel-detail' data-device={device}>
      {/* Back button renders in every state -- loading and error states
          must keep a way out of the page besides the browser's own back
          control. */}
      <div className='slcn-travel-detail__actions'>
        <button
          type='button'
          className='slcn-travel-detail__back'
          onClick={() => navigate(buildDeviceTravelListPath(device))}
        >
          <span aria-hidden='true'>‹</span> 여행 목록
        </button>
        {travel ? (
          <button
            type='button'
            className='slcn-travel-detail__edit'
            onClick={() =>
              navigate(buildDeviceTravelEditPath(device, travel.id))
            }
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
        ) : null}
      </div>

      {isPending ? (
        <Skeleton className='slcn-travel-detail-section__skeleton' />
      ) : isError || !travel ? (
        <ErrorState
          headingLevel={1}
          title='여행을 불러오지 못했어요.'
          onRetry={onRetry}
        />
      ) : (
        <TravelDetailContent travel={travel} heroCoverUrl={heroCoverUrl} />
      )}
    </section>
  );
}

type TravelDetailContentProps = {
  travel: TravelDetail;
  heroCoverUrl: string | null;
};

function TravelDetailContent({
  travel,
  heroCoverUrl,
}: TravelDetailContentProps) {
  return (
    <>
      {/* Hero card: cover image + info block in one white card */}
      <div className='slcn-travel-detail__hero-card'>
        {/* Cover image area */}
        <div className='slcn-travel-detail__hero slcn-travel-hatch'>
          <span className='slcn-travel-detail__nights'>
            {travel.nightsDaysLabel}
          </span>
          <TravelImage
            src={heroCoverUrl}
            alt={travel.title}
            className='slcn-travel-cover-img'
            fetchPriority='high'
            fallback={
              /* Map placeholder icon (shown when no cover photo) */
              <span
                className='slcn-travel-detail__hero-placeholder'
                aria-hidden='true'
              >
                <svg
                  aria-hidden='true'
                  width='48'
                  height='48'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
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
            }
          />
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
        </div>
      </div>

      <div className='slcn-travel-detail__sections'>
        <section className='slcn-travel-detail__section' id='section-days'>
          <h2 className='slcn-travel-detail__section-title'>날짜별 기록</h2>
          <TravelDayList days={travel.travelDays} />
        </section>

        <section className='slcn-travel-detail__section' id='section-album'>
          <h2 className='slcn-travel-detail__section-title'>사진 앨범</h2>
          <TravelPhotoAlbum
            photos={travel.photos}
            days={travel.travelDays}
            places={travel.places}
          />
        </section>

        <section className='slcn-travel-detail__section' id='section-review'>
          <h2 className='slcn-travel-detail__section-title'>여행 후기</h2>
          <TravelReviewSection review={travel.review} />
        </section>

        <section className='slcn-travel-detail__section' id='section-tags'>
          <h2 className='slcn-travel-detail__section-title'>태그</h2>
          <TravelTagSection tags={travel.tags} />
        </section>
      </div>
    </>
  );
}
