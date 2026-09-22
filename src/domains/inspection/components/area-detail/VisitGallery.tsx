import { useState } from 'react';
import { PhotoIcon } from '@/domains/inspection/components/area-detail/icons';
import type { FileBoxItem } from '@/domains/inspection/types';
import { buildAssetImageUrl } from '@/lib/api/asset-url';

type VisitGalleryProps = {
  photos: FileBoxItem[];
};

const INITIAL_VISIBLE_COUNT = 6;

/**
 * §8: captions double as alt text; a photo without one gets `alt=""` so
 * screen readers skip it instead of reading a made-up description.
 * `variant='home-feature'` per fe_implementation_decisions.md §3-⑧ — the
 * signed URL must always carry a variant or it comes back `no-store`.
 */
export function VisitGallery({ photos }: VisitGalleryProps) {
  const [expanded, setExpanded] = useState(false);

  if (photos.length === 0) {
    return null;
  }

  const visible = expanded ? photos : photos.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = photos.length > visible.length;

  return (
    <div className='slcn-inspection-area-detail-gallery-section'>
      <div className='slcn-inspection-area-detail-gallery-section__head'>
        <h2 className='slcn-inspection-area-detail-gallery-section__title'>
          임장 사진
        </h2>
        <span className='slcn-inspection-area-detail-gallery-section__count'>
          {photos.length}장
        </span>
      </div>
      <ul className='slcn-inspection-area-detail-gallery'>
        {visible.map((photo) => (
          <li
            key={photo.id}
            className='slcn-inspection-area-detail-gallery__item'
          >
            <figure>
              <div className='slcn-inspection-area-detail-gallery__frame'>
                <img
                  src={buildAssetImageUrl(photo.fileAssetId, 'home-feature')}
                  alt={photo.caption ?? ''}
                  loading='lazy'
                />
              </div>
              {photo.caption ? <figcaption>{photo.caption}</figcaption> : null}
            </figure>
          </li>
        ))}
      </ul>
      {hasMore ? (
        <button
          type='button'
          className='slcn-inspection-area-detail-gallery__more'
          onClick={() => setExpanded(true)}
        >
          <PhotoIcon /> 사진 {photos.length}장 모두 보기
        </button>
      ) : null}
    </div>
  );
}
