import { useState } from 'react';
import type {
  AreaBucket,
  CompareItem,
  ComplexSummaryItem,
  HouseComplex,
} from '@/domains/house/types';
import { formatEok } from '@/domains/house/utils/format-eok';

export function CandidateList({
  summaries,
  complexes,
  area,
  compareItems,
  selectedId,
  total,
  statsReady,
  pending,
  error,
  truncated,
  fallback,
  onSummary,
  onComplex,
  onAdd,
  onRetry,
}: {
  summaries?: ComplexSummaryItem[];
  complexes?: HouseComplex[];
  area: AreaBucket;
  compareItems: CompareItem[];
  selectedId: string | null;
  total: number;
  statsReady: boolean;
  pending: boolean;
  error: boolean;
  truncated: boolean;
  fallback: boolean;
  onSummary: (item: ComplexSummaryItem) => void;
  onComplex: (item: HouseComplex) => void;
  onAdd: (id: string, area: AreaBucket) => void;
  onRetry: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <aside
      className={`house-candidates${expanded ? ' is-expanded' : ''}`}
      aria-label='후보 리스트'
    >
      <button
        className='house-candidates__grip'
        type='button'
        aria-expanded={expanded}
        aria-controls='house-candidate-list'
        onClick={() => setExpanded(!expanded)}
        aria-label={`후보 리스트 ${expanded ? '접기' : '펼치기'}`}
      >
        <span />
      </button>
      <div className='house-candidates__head'>
        <strong>
          {statsReady
            ? `${total.toLocaleString('ko-KR')}개 후보`
            : '후보 리스트'}
        </strong>
        <span className='house-fine'>
          {summaries ? '관심 지역을 선택해 보세요' : '최근 실거래가 내림차순'}
        </span>
      </div>
      <div id='house-candidate-list' className='house-candidates__body'>
        {error ? (
          <div className='house-map-state' role='alert'>
            <p>후보를 불러오지 못했어요.</p>
            <button type='button' className='house-button' onClick={onRetry}>
              다시 시도
            </button>
          </div>
        ) : pending ? (
          <p className='house-map-state' role='status'>
            후보를 불러오고 있어요.
          </p>
        ) : !statsReady ? (
          <p className='house-map-state' role='status'>
            통계 준비 중이에요
          </p>
        ) : summaries ? (
          <ul className='house-summary-list'>
            {summaries.map((item) => (
              <li key={item.code}>
                <button type='button' onClick={() => onSummary(item)}>
                  <span>
                    {item.name}
                    {item.name !== item.districtName && (
                      <small>{item.districtName}</small>
                    )}
                  </span>
                  <strong>
                    {item.count.toLocaleString('ko-KR')}개{' '}
                    <span aria-hidden='true'>→</span>
                  </strong>
                </button>
              </li>
            ))}
          </ul>
        ) : complexes?.length ? (
          <ul className='house-candidate-list'>
            {complexes.map((item) => {
              const added = compareItems.some(
                (compared) =>
                  compared.complexId === item.complexId &&
                  compared.area === area
              );
              return (
                <li
                  className={
                    selectedId === item.complexId ? 'is-active' : undefined
                  }
                  key={item.complexId}
                >
                  <button
                    type='button'
                    className='house-candidate'
                    onClick={() => onComplex(item)}
                    aria-pressed={selectedId === item.complexId}
                  >
                    <span className='house-candidate__name'>
                      {item.name}
                      <small>
                        {item.districtName} {item.umdName}
                      </small>
                    </span>
                    <span className='house-candidate__price'>
                      {item.recentPrice
                        ? formatEok(item.recentPrice.priceManwon)
                        : '거래 없음'}
                    </span>
                    <span className='house-candidate__meta'>
                      {item.recentPrice
                        ? `최근 ${item.recentPrice.windowMonths}개월 · ${item.recentPrice.sample}건`
                        : '최근 6개월 거래 없음'}{' '}
                      {item.recentPrice && item.recentPrice.sample < 3 && (
                        <span className='house-tag'>표본 적음</span>
                      )}
                      <br />
                      {item.buildYear === null
                        ? '연식 정보 없음'
                        : `${item.buildYear}년 · ${new Date().getFullYear() - item.buildYear}년차`}{' '}
                      ·{' '}
                      {item.households === null
                        ? '세대수 정보 없음'
                        : `${item.households.toLocaleString('ko-KR')}세대`}
                    </span>
                  </button>
                  <button
                    type='button'
                    className='house-button house-candidate__add'
                    onClick={() => onAdd(item.complexId, area)}
                    disabled={added}
                    aria-label={`${item.name} ${added ? '비교함에 담김' : '비교 담기'}`}
                  >
                    {added ? '담김' : '비교 담기'}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='house-map-state'>조건에 맞는 단지가 없어요.</p>
        )}
      </div>
      {statsReady && truncated && (
        <p className='house-candidates__limit'>
          {total.toLocaleString('ko-KR')}개 중 300개 표시 ·{' '}
          {fallback
            ? '예산을 입력하면 후보를 좁힐 수 있어요'
            : '지도를 확대하면 모두 볼 수 있어요'}
        </p>
      )}
    </aside>
  );
}
