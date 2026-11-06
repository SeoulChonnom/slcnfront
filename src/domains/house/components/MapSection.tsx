import { useEffect, useRef, useState } from 'react';
import { CandidateList } from '@/domains/house/components/CandidateList';
import { ComplexInfoCard } from '@/domains/house/components/ComplexInfoCard';
import { useComplexDetail } from '@/domains/house/hooks/useComplexDetail';
import { useComplexesInBounds } from '@/domains/house/hooks/useComplexesInBounds';
import { useComplexSummary } from '@/domains/house/hooks/useComplexSummary';
import { useHouseMapLayers } from '@/domains/house/hooks/useHouseMapLayers';
import { useKakaoMap } from '@/domains/house/hooks/useKakaoMap';
import type {
  AreaBucket,
  CompareItem,
  ComplexSummaryItem,
  HouseComplex,
  MapPosition,
} from '@/domains/house/types';
import { formatEok } from '@/domains/house/utils/format-eok';
import { getMapQuery } from '@/domains/house/utils/map-bounds';
import { AppError } from '@/lib/api/errors';
import { getAppEnv } from '@/lib/env/env';
import '@/domains/house/components/map.css';

type MapSectionProps = {
  areaBucket: AreaBucket;
  priceRange?: { minPrice: number; maxPrice: number };
  statsComputedDate: string | null | undefined;
  mapPosition: MapPosition;
  onMapPositionChange: (position: MapPosition) => void;
  onAddCompare: (complexId: string, area: AreaBucket) => void;
  compareItems: CompareItem[];
  focusComplex?: {
    complexId: string;
    latitude: number;
    longitude: number;
    requestId: number;
  };
};

export function MapSection({
  areaBucket,
  priceRange,
  statsComputedDate,
  mapPosition,
  onMapPositionChange,
  onAddCompare,
  compareItems,
  focusComplex,
}: MapSectionProps) {
  const key = getAppEnv().kakaoMapJsKey;
  const { containerRef, instance, view, failed } = useKakaoMap(
    key,
    mapPosition,
    onMapPositionChange
  );
  const fallback = !key || failed;
  const statsReady = typeof statsComputedDate === 'string';
  const [district, setDistrict] = useState<ComplexSummaryItem | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const onMove = useRef(onMapPositionChange);
  onMove.current = onMapPositionChange;
  const query =
    !fallback && view
      ? getMapQuery(view.level, view.bounds, areaBucket, priceRange)
      : null;
  const summaryParams = fallback
    ? district
      ? null
      : { groupBy: 'DISTRICT' as const, area: areaBucket, ...priceRange }
    : (query?.summary ?? null);
  const complexesParams = fallback
    ? district
      ? { lawdCd: district.lawdCd, area: areaBucket, ...priceRange }
      : null
    : (query?.complexes ?? null);
  const summary = useComplexSummary(summaryParams);
  const complexes = useComplexesInBounds(complexesParams);
  const detail = useComplexDetail(selectedId, areaBucket);

  useEffect(() => {
    if (!focusComplex) return;
    setSelectedId(focusComplex.complexId);
    onMove.current({
      lat: focusComplex.latitude,
      lng: focusComplex.longitude,
      level: 5,
    });
  }, [focusComplex]);

  useEffect(() => {
    if (
      detail.error instanceof AppError &&
      detail.error.apiCode === 'HOUSE_COMPLEX_NOT_FOUND'
    ) {
      setSelectedId(null);
      setNotice('이 단지의 정보를 찾을 수 없어 카드를 닫았어요.');
    }
  }, [detail.error]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const selectSummary = (item: ComplexSummaryItem) => {
    setSelectedId(null);
    if (fallback) setDistrict(item);
    onMapPositionChange({
      lat: item.centerLat,
      lng: item.centerLng,
      level: summaryParams?.groupBy === 'DISTRICT' ? 7 : 5,
    });
  };
  const selectComplex = (item: HouseComplex) => {
    setSelectedId(item.complexId);
    if (!fallback)
      onMapPositionChange({
        lat: item.latitude,
        lng: item.longitude,
        level: Math.min(mapPosition.level, 5),
      });
  };
  useHouseMapLayers({
    instance,
    summaries: summaryParams ? summary.data?.items : undefined,
    complexes: complexesParams ? complexes.data?.items : undefined,
    selectedId,
    statsReady,
    onSummary: selectSummary,
    onComplex: selectComplex,
  });
  const isSummary = Boolean(summaryParams);
  const activeQuery = isSummary ? summary : complexes;
  const total = isSummary
    ? (summary.data?.items.reduce((sum, item) => sum + item.count, 0) ?? 0)
    : (complexes.data?.total ?? 0);
  const layerName =
    query?.layer === 'COMPLEX'
      ? '단지'
      : query?.layer === 'DONG'
        ? '동 묶음'
        : '구 묶음';
  const detailCard = selectedId ? (
    detail.data ? (
      <ComplexInfoCard
        complex={detail.data}
        area={areaBucket}
        added={compareItems.some(
          (item) => item.complexId === selectedId && item.area === areaBucket
        )}
        onClose={() => setSelectedId(null)}
        onAdd={() => onAddCompare(selectedId, areaBucket)}
      />
    ) : (
      <div className='house-info-card' role='status'>
        <button
          type='button'
          className='house-info-card__close'
          onClick={() => setSelectedId(null)}
          aria-label='정보 카드 닫기'
        >
          ×
        </button>
        <p>
          {detail.isError
            ? '단지 정보를 불러오지 못했어요.'
            : '단지 정보를 불러오고 있어요.'}
        </p>
        {detail.isError && (
          <button
            type='button'
            className='house-button'
            onClick={() => void detail.refetch()}
          >
            다시 시도
          </button>
        )}
      </div>
    )
  ) : null;

  return (
    <section
      id='find'
      className='house-section house-find'
      aria-labelledby='house-find-heading'
    >
      <div className='house-wrap'>
        <h2 id='house-find-heading' className='house-find__title'>
          집 찾기
        </h2>
        <div className='house-map-toolbar'>
          <span className='house-map-filter'>
            {priceRange
              ? `가격 ${formatEok(priceRange.minPrice)} ~ ${formatEok(priceRange.maxPrice)}`
              : '가격 제한 없이 둘러보기'}
            {priceRange && <small>내 예산에서</small>}
          </span>
          <span className='house-tag'>
            {areaBucket === 'B59' ? '59' : '84'}㎡
          </span>
          <span className='house-fine house-map-toolbar__hint'>
            {fallback
              ? '구를 선택해 후보를 찾아보세요'
              : '단지 라벨을 누르면 정보 카드가 열려요'}
          </span>
        </div>
        {!priceRange && (
          <p className='house-fine house-map-budget-hint'>
            예산을 계산하면 살 수 있는 단지만 보여 드려요.
          </p>
        )}
        {fallback && (
          <div className='house-map-fallback'>
            <div>
              <strong>
                {failed
                  ? '지도 대신 목록으로 찾아보세요'
                  : '서울의 관심 지역부터 살펴보세요'}
              </strong>
              <p className='house-fine'>
                구를 고르면 최근 실거래가와 단지 정보를 볼 수 있어요.
              </p>
            </div>
            {district && (
              <button
                type='button'
                className='house-button'
                onClick={() => {
                  setDistrict(null);
                  setSelectedId(null);
                }}
              >
                ← 서울 전체
              </button>
            )}
          </div>
        )}
        <div
          className={`house-find-grid${fallback ? ' house-find-grid--list' : ''}`}
        >
          {!fallback && (
            <section className='house-map' aria-label='서울 아파트 지도'>
              <div ref={containerRef} className='house-map__canvas' />
              {!instance && (
                <p className='house-map-state' role='status'>
                  지도를 불러오고 있어요.
                </p>
              )}
              <div className='house-map__layer'>{layerName}</div>
              <div className='house-map__controls'>
                <button
                  type='button'
                  aria-label='지도 확대'
                  onClick={() =>
                    onMapPositionChange({
                      ...mapPosition,
                      level: Math.max(1, mapPosition.level - 1),
                    })
                  }
                >
                  +
                </button>
                <button
                  type='button'
                  aria-label='지도 축소'
                  onClick={() =>
                    onMapPositionChange({
                      ...mapPosition,
                      level: Math.min(14, mapPosition.level + 1),
                    })
                  }
                >
                  −
                </button>
              </div>
              {detailCard}
              <div className='house-map__legend'>
                <span>
                  <i />
                  최근 실거래가
                </span>
                <span>
                  <i className='is-selected' />
                  선택한 단지
                </span>
                <span>
                  <i className='is-no-trade' />
                  거래 없음
                </span>
              </div>
            </section>
          )}
          <CandidateList
            summaries={isSummary ? summary.data?.items : undefined}
            complexes={complexesParams ? complexes.data?.items : undefined}
            area={areaBucket}
            compareItems={compareItems}
            selectedId={selectedId}
            total={total}
            statsReady={statsReady}
            pending={activeQuery.isPending || statsComputedDate === undefined}
            error={activeQuery.isError}
            truncated={Boolean(complexesParams && complexes.data?.truncated)}
            fallback={fallback}
            onSummary={selectSummary}
            onComplex={selectComplex}
            onAdd={onAddCompare}
            onRetry={() => void activeQuery.refetch()}
          />
          {fallback && detailCard}
        </div>
        {notice && (
          <p className='house-map-notice' role='status'>
            {notice}
          </p>
        )}
      </div>
    </section>
  );
}
