import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import logo from '@/assets/img/SLCN.webp';
import { AreaToggle } from '@/domains/house/components/AreaToggle';
import { BudgetSection } from '@/domains/house/components/BudgetSection';
import { CompareSection } from '@/domains/house/components/CompareSection';
import { DataAsOf } from '@/domains/house/components/DataAsOf';
import { Disclaimer } from '@/domains/house/components/Disclaimer';
import { MapSection } from '@/domains/house/components/MapSection';
import { RankingSection } from '@/domains/house/components/RankingSection';
import { useBudgetPolicy } from '@/domains/house/hooks/useBudgetPolicy';
import { useCompareTray } from '@/domains/house/hooks/useCompareTray';
import { useHouseMeta } from '@/domains/house/hooks/useHouseMeta';
import { useHouseUrlState } from '@/domains/house/hooks/useHouseUrlState';
import { serializeCompareParam } from '@/domains/house/utils/compare-param';
import { buildDeviceRootPath } from '@/lib/routing/route-builders';
import '@/domains/house/styles/house.css';

type PriceRange = { minPrice: number; maxPrice: number };
type FocusComplex = {
  complexId: string;
  latitude: number;
  longitude: number;
  requestId: number;
};
const SECTIONS = [
  { id: 'budget', label: '내 예산' },
  { id: 'find', label: '집 찾기' },
  { id: 'compare', label: '매물 비교' },
  { id: 'study', label: '공부 레퍼런스' },
];

export function HouseFinderPage({ device }: { device: DeviceType }) {
  const location = useLocation();
  const url = useHouseUrlState();
  const meta = useHouseMeta();
  const policy = useBudgetPolicy();
  const [activeSection, setActiveSection] = useState('budget');
  const [range, setRange] = useState<PriceRange | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>();
  const [focusComplex, setFocusComplex] = useState<FocusComplex>();
  const [notice, setNotice] = useState<{ message: string; revision: number }>();
  const notify = useCallback((message: string) => {
    setNotice((previous) => ({
      message,
      revision: (previous?.revision ?? 0) + 1,
    }));
  }, []);
  const addCompare = useCompareTray(
    url.compareItems,
    url.setCompareItems,
    notify
  );
  const onRangeChange = useCallback((next: PriceRange | null) => {
    setRange((previous) =>
      previous?.minPrice === next?.minPrice &&
      previous?.maxPrice === next?.maxPrice
        ? previous
        : next
    );
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setPriceRange(range ?? undefined),
      300
    );
    return () => window.clearTimeout(timeout);
  }, [range]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(undefined), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView?.({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  }, []);
  const viewOnMap = useCallback(
    (target: Omit<FocusComplex, 'requestId'>) => {
      url.setMapPosition({
        lat: target.latitude,
        lng: target.longitude,
        level: 5,
      });
      setFocusComplex((previous) => ({
        ...target,
        requestId: (previous?.requestId ?? 0) + 1,
      }));
      scrollToSection('find');
    },
    [url.setMapPosition, scrollToSection]
  );

  async function copyLink() {
    const shared = new URL(location.pathname, window.location.origin);
    shared.searchParams.set('area', url.areaBucket === 'B84' ? '84' : '59');
    const comparison = serializeCompareParam(url.compareItems);
    if (comparison) shared.searchParams.set('cmp', comparison);
    shared.searchParams.set('lat', url.mapPosition.lat.toFixed(5));
    shared.searchParams.set('lng', url.mapPosition.lng.toFixed(5));
    shared.searchParams.set('level', String(url.mapPosition.level));
    shared.searchParams.set('rank', url.rankingType);
    try {
      await navigator.clipboard.writeText(shared.toString());
      notify('링크를 복사했어요. 예산 입력값은 링크에 포함되지 않습니다');
    } catch {
      notify(
        '링크를 복사하지 못했어요. 브라우저의 클립보드 권한을 확인해 주세요'
      );
    }
  }

  const sectionNavigation = (
    <nav className='house-anchor-nav' aria-label='내집찾기 섹션'>
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          type='button'
          aria-current={activeSection === id ? 'location' : undefined}
          onClick={() => scrollToSection(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className={`slcn-house slcn-house--${device}`}>
      <header className='house-header'>
        <div className='house-wrap house-header__bar'>
          <Link
            className='house-brand'
            to={buildDeviceRootPath(device)}
            aria-label='서울 촌놈 홈'
          >
            <img src={logo} alt='SLCN' />
          </Link>
          <h1 className='house-header__title'>내집찾기</h1>
          {device === 'main' && sectionNavigation}
          <div className='house-header__area'>
            <span className='house-header__area-label'>평형</span>
            <AreaToggle value={url.areaBucket} onChange={url.setAreaBucket} />
            <span className='house-fine house-header__area-hint'>
              지도·공부 레퍼런스에 적용
            </span>
          </div>
          <button
            className='house-button house-copy'
            type='button'
            onClick={copyLink}
          >
            <svg viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1' />
            </svg>
            링크 복사
          </button>
        </div>
        <DataAsOf
          dataAsOf={meta.data?.dataAsOf}
          policyAsOf={policy.data?.effectiveFrom}
          policyIsError={policy.isError}
          isError={meta.isError}
          onRetry={() => {
            void meta.refetch();
          }}
        />
      </header>
      {device === 'mobile' && (
        <div className='house-mobile-tabs'>{sectionNavigation}</div>
      )}
      <BudgetSection onRangeChange={onRangeChange} />
      <MapSection
        areaBucket={url.areaBucket}
        priceRange={priceRange}
        statsComputedDate={meta.data?.statsComputedDate}
        mapPosition={url.mapPosition}
        onMapPositionChange={url.setMapPosition}
        onAddCompare={addCompare}
        compareItems={url.compareItems}
        focusComplex={focusComplex}
      />
      <CompareSection
        areaBucket={url.areaBucket}
        items={url.compareItems}
        onItemsChange={url.setCompareItems}
        onNotify={notify}
      />
      <RankingSection
        areaBucket={url.areaBucket}
        rankingType={url.rankingType}
        onRankingTypeChange={url.setRankingType}
        statsComputedDate={meta.data?.statsComputedDate}
        onAddCompare={addCompare}
        onViewOnMap={viewOnMap}
      />
      <Disclaimer />
      <div
        className='house-notice'
        role='status'
        aria-live='polite'
        aria-atomic='true'
      >
        {notice && <p key={notice.revision}>{notice.message}</p>}
      </div>
    </div>
  );
}
