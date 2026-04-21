import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageSectionHeader } from '../../../components/ui/PageSectionHeader';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { TripDetail } from '../types';
import { useTripAssetUrl } from '../hooks/useTripAssetUrl';
import { TripMapSwitcher } from './TripMapSwitcher';

type TripDetailSectionProps = {
  tripDetail: TripDetail;
};

export function TripDetailSection({ tripDetail }: TripDetailSectionProps) {
  const [activeMap, setActiveMap] = useState<'map1' | 'map2'>('map1');
  const map1Asset = useTripAssetUrl(tripDetail.firstMapPath);
  const map2Asset = useTripAssetUrl(tripDetail.secondMapPath);
  const hasSecondMap = Boolean(tripDetail.secondMapPath);
  const activeMapUrl =
    activeMap === 'map1' ? map1Asset.objectUrl : map2Asset.objectUrl;

  return (
    <section className="slcn-trip-detail-section">
      <PageSectionHeader
        title="서울 촌놈 나들이 경로"
        description="사진은 드라이브에서 📷"
      />

      {hasSecondMap ? (
        <TripMapSwitcher
          activeMap={activeMap}
          onChange={setActiveMap}
          button1={tripDetail.nextButtonText}
          button2={tripDetail.previousButtonText}
        />
      ) : null}

      <Card className="slcn-trip-detail-section__map-card">
        {activeMapUrl ? (
          <img
            src={activeMapUrl}
            alt="나들이 지도"
            className="slcn-trip-detail-section__map-image"
          />
        ) : map1Asset.isPending || map2Asset.isPending ? (
          <Skeleton className="slcn-trip-detail-section__map-skeleton" />
        ) : (
          <EmptyState
            title="지도를 불러오지 못했어요."
            description="파일 경로를 다시 확인해주세요."
          />
        )}
      </Card>

      <Card className="slcn-trip-detail-section__drive-card" tone="pink">
        <div>
          <p className="slcn-trip-detail-section__drive-kicker display-hand">
            SLCN Drive
          </p>
          <h3 className="slcn-trip-detail-section__drive-title display-hand">
            사진은 드라이브에서 📷
          </h3>
          <p className="slcn-trip-detail-section__drive-copy">
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
