import {
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TravelImage } from '@/domains/travel/components/TravelImage';
import type {
  TravelDay,
  TravelPhoto,
  TravelPlace,
} from '@/domains/travel/types';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';

type TravelPhotoAlbumProps = {
  photos: TravelPhoto[];
  days: TravelDay[];
  places: TravelPlace[];
};

type AlbumFilter = 'all' | 'byDay' | 'byPlace';

const FILTER_TABS: { value: AlbumFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'byDay', label: '날짜별' },
  { value: 'byPlace', label: '장소별' },
];

const ALBUM_PANEL_ID = 'travel-album-panel';

function getAlbumTabId(value: AlbumFilter) {
  return `travel-album-tab-${value}`;
}

type PhotoGroup = {
  key: string;
  label: string;
  photos: TravelPhoto[];
};

function PhotoGrid({ photos }: { photos: TravelPhoto[] }) {
  return (
    <ul className='slcn-travel-album__grid'>
      {photos.map((photo) => {
        const url = buildOptionalAssetImageUrl(photo.photoFileId, 'home-thumb');
        return (
          <li
            key={photo.id}
            className='slcn-travel-album__photo slcn-travel-thumb'
            aria-label={photo.caption ?? '여행 사진'}
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
  );
}

export function TravelPhotoAlbum({
  photos,
  days,
  places,
}: TravelPhotoAlbumProps) {
  const [filter, setFilter] = useState<AlbumFilter>('all');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedTabIndex = FILTER_TABS.findIndex((tab) => tab.value === filter);

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const lastIndex = FILTER_TABS.length - 1;
      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = selectedTabIndex === lastIndex ? 0 : selectedTabIndex + 1;
          break;
        case 'ArrowLeft':
          nextIndex = selectedTabIndex === 0 ? lastIndex : selectedTabIndex - 1;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = lastIndex;
          break;
        default:
          return;
      }

      if (nextIndex === null) {
        return;
      }

      event.preventDefault();
      setFilter(FILTER_TABS[nextIndex].value);
      tabRefs.current[nextIndex]?.focus();
    },
    [selectedTabIndex]
  );

  const byDayGroups = useMemo<PhotoGroup[]>(() => {
    const groups = days.map((day) => ({
      key: day.id,
      label: `${day.dayNumber}일차 · ${day.displayDate}`,
      photos: photos.filter((photo) => photo.travelDayId === day.id),
    }));
    const unassigned = photos.filter((photo) => photo.travelDayId === null);
    if (unassigned.length > 0) {
      groups.push({
        key: '__no-day',
        label: '날짜 없는 사진',
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
        label: '장소 없는 사진',
        photos: unassigned,
      });
    }
    return groups.filter((group) => group.photos.length > 0);
  }, [places, photos]);

  // With zero photos there is nothing to filter, so the tablist scaffolding
  // (and the tabpanel's aria-labelledby, which would otherwise point at a
  // tab that no longer exists) is skipped entirely.
  if (photos.length === 0) {
    return (
      <div className='slcn-travel-album'>
        <p className='slcn-travel-detail__empty'>
          아직 사진이 없어요. 여행 수정에서 사진을 올릴 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className='slcn-travel-album'>
      <div className='slcn-travel-album__toolbar'>
        <div
          className='slcn-travel-album__tabs'
          role='tablist'
          onKeyDown={handleTabKeyDown}
        >
          {FILTER_TABS.map((tab, index) => (
            <button
              key={tab.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={getAlbumTabId(tab.value)}
              type='button'
              role='tab'
              aria-selected={filter === tab.value}
              aria-controls={ALBUM_PANEL_ID}
              tabIndex={filter === tab.value ? 0 : -1}
              className='slcn-travel-album__tab'
              data-active={filter === tab.value}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id={ALBUM_PANEL_ID}
        role='tabpanel'
        aria-labelledby={getAlbumTabId(filter)}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabpanel has no focusable content of its own, so the panel itself must be reachable
        tabIndex={0}
      >
        {filter === 'all' ? (
          <PhotoGrid photos={photos} />
        ) : (
          <div className='slcn-travel-album__groups'>
            {(filter === 'byDay' ? byDayGroups : byPlaceGroups).map((group) => (
              <section key={group.key} className='slcn-travel-album__group'>
                <h3 className='slcn-travel-album__group-title'>
                  {group.label}
                </h3>
                <PhotoGrid photos={group.photos} />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
