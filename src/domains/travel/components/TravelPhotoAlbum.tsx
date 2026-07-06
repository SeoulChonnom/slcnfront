import { useMemo, useState } from 'react';
import { useTravelAssetUrls } from '../hooks/useTravelAssetUrls';
import type { TravelDay, TravelPhoto, TravelPlace } from '../types';

type TravelPhotoAlbumProps = {
  photos: TravelPhoto[];
  days: TravelDay[];
  places: TravelPlace[];
  onAddPhoto: () => void;
};

type AlbumFilter = 'all' | 'byDay' | 'byPlace';

const FILTER_TABS: { value: AlbumFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'byDay', label: '날짜별' },
  { value: 'byPlace', label: '장소별' },
];

type PhotoGroup = {
  key: string;
  label: string;
  photos: TravelPhoto[];
};

function PhotoGrid({
  photos,
  objectUrls,
}: {
  photos: TravelPhoto[];
  objectUrls: Record<string, string>;
}) {
  return (
    <ul className='slcn-travel-album__grid'>
      {photos.map((photo) => {
        const url = objectUrls[photo.photoFileId];
        return (
          <li
            key={photo.id}
            className='slcn-travel-album__photo slcn-travel-thumb'
            aria-label={photo.caption ?? '여행 사진'}
          >
            {url ? (
              <img
                src={url}
                alt={photo.caption ?? '여행 사진'}
                className='slcn-travel-thumb-img'
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function TravelPhotoAlbum({
  photos,
  days,
  places,
  onAddPhoto,
}: TravelPhotoAlbumProps) {
  const [filter, setFilter] = useState<AlbumFilter>('all');
  const photoObjectUrls = useTravelAssetUrls(photos.map((p) => p.photoFileId));

  const byDayGroups = useMemo<PhotoGroup[]>(() => {
    const groups = days.map((day) => ({
      key: day.id,
      label: `Day ${day.dayNumber} · ${day.displayDate}`,
      photos: photos.filter((photo) => photo.travelDayId === day.id),
    }));
    const unassigned = photos.filter((photo) => photo.travelDayId === null);
    if (unassigned.length > 0) {
      groups.push({
        key: '__no-day',
        label: '날짜 미지정',
        photos: unassigned,
      });
    }
    return groups.filter((group) => group.photos.length > 0);
  }, [days, photos]);

  const byPlaceGroups = useMemo<PhotoGroup[]>(() => {
    const groups = places.map((place) => ({
      key: place.id,
      label: place.name,
      photos: photos.filter((photo) => photo.travelPlaceId === place.id),
    }));
    const unassigned = photos.filter((photo) => photo.travelPlaceId === null);
    if (unassigned.length > 0) {
      groups.push({
        key: '__no-place',
        label: '장소 미지정',
        photos: unassigned,
      });
    }
    return groups.filter((group) => group.photos.length > 0);
  }, [places, photos]);

  return (
    <div className='slcn-travel-album'>
      <div className='slcn-travel-album__toolbar'>
        <div className='slcn-travel-album__tabs' role='tablist'>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type='button'
              role='tab'
              aria-selected={filter === tab.value}
              className='slcn-travel-album__tab'
              data-active={filter === tab.value}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type='button'
          className='slcn-travel-album__add'
          onClick={onAddPhoto}
        >
          <span aria-hidden='true'>+</span> 사진 추가
        </button>
      </div>

      {photos.length === 0 ? (
        <p className='slcn-travel-detail__empty'>아직 사진이 없어요.</p>
      ) : filter === 'all' ? (
        <PhotoGrid photos={photos} objectUrls={photoObjectUrls} />
      ) : (
        <div className='slcn-travel-album__groups'>
          {(filter === 'byDay' ? byDayGroups : byPlaceGroups).map((group) => (
            <section key={group.key} className='slcn-travel-album__group'>
              <h3 className='slcn-travel-album__group-title'>{group.label}</h3>
              <PhotoGrid photos={group.photos} objectUrls={photoObjectUrls} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
