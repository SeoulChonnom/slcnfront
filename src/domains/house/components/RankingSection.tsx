import type { KeyboardEvent } from 'react';
import { useRankings } from '@/domains/house/hooks/useRankings';
import type {
  AreaBucket,
  HouseRankingItem,
  RankingType,
} from '@/domains/house/types';
import {
  formatChangeManwon,
  formatChangePct,
  formatEok,
} from '@/domains/house/utils/format-eok';
import './house-compare-rank.css';

type RankingSectionProps = {
  areaBucket: AreaBucket;
  rankingType: RankingType;
  onRankingTypeChange: (type: RankingType) => void;
  statsComputedDate: string | null | undefined;
  onAddCompare: (complexId: string, area: AreaBucket) => void;
  onViewOnMap: (target: {
    complexId: string;
    latitude: number;
    longitude: number;
  }) => void;
};

const tabs: { type: RankingType; label: string }[] = [
  { type: 'LEADER', label: '구별 대장' },
  { type: 'RISE', label: '1년 상승 TOP' },
  { type: 'FALL', label: '1년 하락 TOP' },
  { type: 'VOLUME', label: '거래 활발 TOP' },
];

function RankingValue({
  item,
  type,
}: {
  item: HouseRankingItem;
  type: RankingType;
}) {
  if (item.value === null) return <span>정보 없음</span>;
  if (type === 'LEADER')
    return (
      <>
        <strong>{formatEok(Math.round(item.value))}</strong>
        <span>최근 12개월 평균 · {item.sample}건</span>
      </>
    );
  if (type === 'VOLUME')
    return (
      <>
        <strong>{Math.round(item.value).toLocaleString('ko-KR')}건</strong>
        <span>최근 3개월</span>
      </>
    );
  return (
    <>
      <strong
        className={
          item.value > 0
            ? 'house-change-up'
            : item.value < 0
              ? 'house-change-down'
              : ''
        }
      >
        {item.value > 0 ? '▲ ' : item.value < 0 ? '▼ ' : ''}
        {formatChangePct(item.value)}
      </strong>
      {item.changeManwon !== null ? (
        <span>{formatChangeManwon(item.changeManwon)}</span>
      ) : null}
      <span>표본 {item.sample}건</span>
    </>
  );
}

export function RankingSection({
  areaBucket,
  rankingType,
  onRankingTypeChange,
  statsComputedDate,
  onAddCompare,
  onViewOnMap,
}: RankingSectionProps) {
  const query = useRankings(rankingType, areaBucket);

  function navigateTabs(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft')
      nextIndex = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    onRankingTypeChange(tabs[nextIndex].type);
    document.getElementById(`house-ranking-${tabs[nextIndex].type}`)?.focus();
  }

  return (
    <section
      id='study'
      className='house-section'
      aria-labelledby='house-ranking-heading'
    >
      <div className='house-wrap'>
        <div className='house-section__head'>
          <h2 id='house-ranking-heading' className='house-section__title'>
            공부 레퍼런스
          </h2>
          <p className='house-section__desc'>
            {areaBucket.slice(1)}㎡ 기준 · 상단 평형 토글과 함께 바뀌어요
          </p>
        </div>
        <div
          className='house-ranking-tabs'
          role='tablist'
          aria-label='랭킹 종류'
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.type}
              id={`house-ranking-${tab.type}`}
              type='button'
              role='tab'
              aria-selected={rankingType === tab.type}
              aria-controls='house-ranking-panel'
              tabIndex={rankingType === tab.type ? 0 : -1}
              onClick={() => onRankingTypeChange(tab.type)}
              onKeyDown={(event) => navigateTabs(event, index)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          id='house-ranking-panel'
          role='tabpanel'
          aria-labelledby={`house-ranking-${rankingType}`}
        >
          {rankingType === 'FALL' ? (
            <p className='house-fine house-ranking-guidance'>
              싸 보이는 단지가 저평가인지 저가치인지, 입지·연식·세대수 공통점을
              비교해 보세요.
            </p>
          ) : null}
          {statsComputedDate === null ? (
            <p className='house-ranking-empty' role='status'>
              통계 준비 중이에요
            </p>
          ) : query.isPending ? (
            <p className='house-ranking-empty' role='status'>
              랭킹을 불러오고 있어요.
            </p>
          ) : query.isError ? (
            <div className='house-ranking-empty' role='alert'>
              랭킹을 불러오지 못했어요.{' '}
              <button
                type='button'
                className='house-button'
                onClick={() => void query.refetch()}
              >
                다시 시도
              </button>
            </div>
          ) : query.data.items.length === 0 ? (
            <p className='house-ranking-empty'>조건에 맞는 단지가 없어요.</p>
          ) : (
            <>
              <div className='house-ranking-head' aria-hidden='true'>
                <span>순위</span>
                <span>구</span>
                <span>단지</span>
                <span>연식 · 평형 · 세대수</span>
                <span>값</span>
                <span />
              </div>
              <ol className='house-ranking-list'>
                {query.data.items.map((item) => {
                  const noTrade = item.badge === 'NO_TRADE';
                  const hasLocation =
                    item.complexId !== null &&
                    item.latitude !== null &&
                    item.longitude !== null &&
                    !noTrade;
                  return (
                    <li
                      key={`${item.lawdCd}:${item.complexId ?? 'empty'}`}
                      className={`house-ranking-row${noTrade ? ' house-ranking-row--empty' : ''}`}
                    >
                      <span className='house-ranking-row__number'>
                        {item.rank}
                      </span>
                      <span className='house-ranking-row__district'>
                        {item.districtName}
                      </span>
                      <div className='house-ranking-row__name'>
                        {noTrade ? '최근 12개월 거래 없음' : item.name}
                        {item.badge === 'LOW_SAMPLE' ? (
                          <span className='house-tag'>표본 적음</span>
                        ) : null}
                      </div>
                      <div className='house-ranking-row__meta'>
                        {noTrade ? (
                          '단지 없음'
                        ) : (
                          <>
                            {item.buildYear === null
                              ? '연식 정보 없음'
                              : `${item.buildYear}년`}{' '}
                            ·{' '}
                            {item.avgExclusiveArea === null
                              ? '면적 정보 없음'
                              : `${item.avgExclusiveArea}㎡`}{' '}
                            ·{' '}
                            {item.households === null
                              ? '세대수 정보 없음'
                              : `${item.households.toLocaleString('ko-KR')}세대`}
                          </>
                        )}
                      </div>
                      <div className='house-ranking-row__value'>
                        {noTrade ? (
                          <span>—</span>
                        ) : (
                          <RankingValue item={item} type={rankingType} />
                        )}
                      </div>
                      <div className='house-ranking-row__actions'>
                        <button
                          className='house-button'
                          type='button'
                          disabled={!hasLocation}
                          onClick={() => {
                            if (
                              item.complexId !== null &&
                              item.latitude !== null &&
                              item.longitude !== null
                            )
                              onViewOnMap({
                                complexId: item.complexId,
                                latitude: item.latitude,
                                longitude: item.longitude,
                              });
                          }}
                        >
                          지도에서 위치 보기
                        </button>
                        <button
                          className='house-button'
                          type='button'
                          disabled={noTrade || item.complexId === null}
                          onClick={() => {
                            if (item.complexId !== null)
                              onAddCompare(item.complexId, areaBucket);
                          }}
                        >
                          비교 담기
                        </button>
                        {!hasLocation ? (
                          <span className='house-fine'>위치 정보 없음</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
          <div className='house-ranking-foot'>
            <span>
              집계 기간{' '}
              <strong>
                {statsComputedDate !== null && query.data?.period
                  ? `${query.data.period.from} ~ ${query.data.period.to}`
                  : '정보 없음'}
              </strong>
            </span>
            <span>
              통계 계산일 <strong>{statsComputedDate ?? '통계 준비 중'}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
