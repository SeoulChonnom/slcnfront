import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { TripMapSwitcher } from '@/domains/trip/components/TripMapSwitcher';
import type { TripDetail } from '@/domains/trip/types';
import { buildOptionalAssetImageUrl } from '@/lib/api/asset-url';

type TripDetailSectionProps = {
  tripDetail: TripDetail;
};

export function TripDetailSection({ tripDetail }: TripDetailSectionProps) {
  const [activeMap, setActiveMap] = useState<'map1' | 'map2'>('map1');
  // The map is the point of this screen, so a failed load has to surface as an
  // error rather than a blank frame. The browser owns the request now, so the
  // only signal is the img's own error event.
  const [failedMapUrl, setFailedMapUrl] = useState<string | null>(null);
  const hasSecondMap = Boolean(tripDetail.secondMap);
  const activeMapAsset =
    activeMap === 'map1' ? tripDetail.firstMap : tripDetail.secondMap;
  const activeMapUrl = buildOptionalAssetImageUrl(activeMapAsset?.fileId);
  const isMapAvailable = activeMapUrl !== null && activeMapUrl !== failedMapUrl;

  return (
    <section className='slcn-trip-detail-section'>
      <h1 className='slcn-trip-detail-section__title'>서울 촌놈 나들이 경로</h1>

      {hasSecondMap ? (
        <TripMapSwitcher
          activeMap={activeMap}
          onChange={setActiveMap}
          button1={tripDetail.nextButtonText}
          button2={tripDetail.previousButtonText}
        />
      ) : null}

      <Card className='slcn-trip-detail-section__map-card'>
        {isMapAvailable ? (
          <img
            src={activeMapUrl}
            alt='나들이 지도'
            className='slcn-trip-detail-section__map-image'
            fetchPriority='high'
            onError={() => setFailedMapUrl(activeMapUrl)}
          />
        ) : (
          <ErrorState
            title='지도를 불러오지 못했어요.'
            description='파일 경로를 다시 확인해 주세요.'
            headingLevel={2}
          />
        )}
      </Card>

      <Card className='slcn-trip-detail-section__drive-card' tone='pink'>
        <div>
          <h3 className='slcn-trip-detail-section__drive-title'>
            사진은 드라이브에서 보기
          </h3>
          <p className='slcn-trip-detail-section__drive-copy'>
            암호 🔒 : 입사일
          </p>
        </div>
        <Button
          onClick={() => {
            window.open(tripDetail.driveUrl, '_blank', 'noopener,noreferrer');
          }}
        >
          드라이브 링크
        </Button>
      </Card>
    </section>
  );
}
