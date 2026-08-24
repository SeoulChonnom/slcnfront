import { CategoryIcon } from '@/domains/travel/components/CategoryIcon';
import { useTravelAssetUrls } from '@/domains/travel/hooks/useTravelAssetUrls';
import { CATEGORY_LABELS, type TravelPlace } from '@/domains/travel/types';

type TravelPlaceItemProps = {
  place: TravelPlace;
};

export function TravelPlaceItem({ place }: TravelPlaceItemProps) {
  const memo = place.description ?? place.memo;
  const photoObjectUrls = useTravelAssetUrls(
    place.photos.map((p) => p.photoFileId)
  );

  return (
    <li className='slcn-travel-place'>
      <span className='slcn-travel-place__icon' aria-hidden='true'>
        <CategoryIcon category={place.category} />
      </span>
      <div className='slcn-travel-place__body'>
        <div className='slcn-travel-place__head'>
          <span className='slcn-travel-place__name'>{place.name}</span>
          <span className='slcn-travel-place__category'>
            {CATEGORY_LABELS[place.category]}
          </span>
        </div>
        {memo ? <p className='slcn-travel-place__memo'>{memo}</p> : null}
        {place.photos.length > 0 ? (
          <ul className='slcn-travel-place__photos'>
            {place.photos.map((photo) => {
              const url = photoObjectUrls[photo.photoFileId];
              return (
                <li
                  key={photo.id}
                  className='slcn-travel-place__photo slcn-travel-thumb'
                  aria-label={photo.caption ?? '장소 사진'}
                >
                  {url ? (
                    <img
                      src={url}
                      alt={photo.caption ?? '장소 사진'}
                      className='slcn-travel-thumb-img'
                      decoding='async'
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
