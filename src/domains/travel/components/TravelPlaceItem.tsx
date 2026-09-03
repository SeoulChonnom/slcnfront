import { CategoryIcon } from '@/domains/travel/components/CategoryIcon';
import { TravelImage } from '@/domains/travel/components/TravelImage';
import { CATEGORY_LABELS, type TravelPlace } from '@/domains/travel/types';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';

type TravelPlaceItemProps = {
  place: TravelPlace;
};

export function TravelPlaceItem({ place }: TravelPlaceItemProps) {
  const memo = place.description ?? place.memo;

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
              const url = buildOptionalAssetImageUrl(
                photo.photoFileId,
                'home-thumb'
              );
              return (
                <li
                  key={photo.id}
                  className='slcn-travel-place__photo slcn-travel-thumb'
                  aria-label={photo.caption ?? '장소 사진'}
                >
                  <TravelImage
                    src={url}
                    alt=''
                    className='slcn-travel-thumb-img'
                    loading='lazy'
                  />
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
