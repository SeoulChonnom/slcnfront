import { useEffect } from 'react';
import { ComparePicker } from '@/domains/house/components/ComparePicker';
import { CompareTable } from '@/domains/house/components/CompareTable';
import { useCompare } from '@/domains/house/hooks/useCompare';
import type { AreaBucket, CompareItem } from '@/domains/house/types';
import './house-compare-rank.css';

type CompareSectionProps = {
  areaBucket: AreaBucket;
  items: CompareItem[];
  onItemsChange: (items: CompareItem[]) => void;
  onNotify: (message: string) => void;
};

export function CompareSection({
  areaBucket,
  items,
  onItemsChange,
  onNotify,
}: CompareSectionProps) {
  const query = useCompare(items);

  useEffect(() => {
    const missingIds = query.data?.missingIds;
    if (!missingIds?.length) return;
    const remaining = items.filter(
      (item) => !missingIds.includes(item.complexId)
    );
    if (remaining.length === items.length) return;
    const removedCount = new Set(
      items
        .filter((item) => missingIds.includes(item.complexId))
        .map((item) => item.complexId)
    ).size;
    onItemsChange(remaining);
    onNotify(`찾을 수 없는 단지 ${removedCount}개를 비교에서 뺐어요`);
  }, [items, query.data?.missingIds, onItemsChange, onNotify]);

  function add(complexId: string) {
    if (
      items.some(
        (item) => item.complexId === complexId && item.area === areaBucket
      )
    ) {
      onNotify('이미 비교함에 있어요');
    } else if (items.length >= 3) {
      onNotify('최대 3개까지 비교할 수 있어요');
    } else {
      onItemsChange([...items, { complexId, area: areaBucket }]);
    }
  }

  function changeArea(index: number, area: AreaBucket) {
    if (items[index].area === area) return;
    if (
      items.some(
        (item, otherIndex) =>
          otherIndex !== index &&
          item.complexId === items[index].complexId &&
          item.area === area
      )
    ) {
      onNotify('이미 비교함에 있어요');
      return;
    }
    onItemsChange(
      items.map((item, currentIndex) =>
        currentIndex === index ? { ...item, area } : item
      )
    );
  }

  return (
    <section
      id='compare'
      className='house-section'
      aria-labelledby='house-compare-heading'
    >
      <div className='house-wrap'>
        <div className='house-section__head'>
          <h2 id='house-compare-heading' className='house-section__title'>
            매물 비교
          </h2>
          <p className='house-section__desc'>
            최대 3개 · 담을 때의 평형으로 고정돼요 · 링크 복사로 공유할 수
            있어요
          </p>
        </div>
        <ComparePicker onSelect={add} />
        <div className='house-tray'>
          <p className='house-tray__lead'>
            비교함 {items.length}/3
            <br />
            같은 단지의 59㎡와 84㎡를 각각 담을 수 있어요.
          </p>
          {items.map((item, index) => {
            const column = query.data?.columns.find(
              (column) =>
                column.complexId === item.complexId && column.area === item.area
            );
            const name = column?.name ?? '단지 정보';
            return (
              <div
                className='house-compare-slot'
                key={`${item.complexId}:${item.area}`}
              >
                <div className='house-compare-slot__top'>
                  <div>
                    <strong>{name}</strong>
                    <span className='house-cell-sub'>
                      {column
                        ? `${column.districtName} ${column.umdName}`
                        : '불러오는 중'}
                    </span>
                  </div>
                  <button
                    className='house-compare-slot__remove'
                    type='button'
                    aria-label={`${name} ${item.area.slice(1)}㎡ 빼기`}
                    onClick={() =>
                      onItemsChange(
                        items.filter(
                          (_, currentIndex) => currentIndex !== index
                        )
                      )
                    }
                  >
                    ×
                  </button>
                </div>
                <div className='house-compare-slot__area'>
                  <span>{item.area.slice(1)}㎡ 고정</span>
                  <fieldset
                    className='house-compare-area'
                    aria-label={`${name} ${item.area.slice(1)}㎡ 열 평형 전환`}
                  >
                    {(['B59', 'B84'] as const).map((area) => (
                      <button
                        key={area}
                        type='button'
                        aria-pressed={item.area === area}
                        onClick={() => changeArea(index, area)}
                      >
                        {area.slice(1)}
                      </button>
                    ))}
                  </fieldset>
                </div>
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, 3 - items.length) }, (_, index) => (
            <div
              className='house-compare-slot house-compare-slot--empty'
              key={`empty-${index}`}
            >
              비교할 단지를 담아 주세요
            </div>
          ))}
        </div>
        {items.length === 0 ? (
          <p className='house-compare-empty'>
            지도나 검색에서 관심 단지를 담으면 9개 지표를 나란히 볼 수 있어요.
          </p>
        ) : query.isError ? (
          <div className='house-compare-empty' role='alert'>
            비교 정보를 불러오지 못했어요.{' '}
            <button
              className='house-button'
              type='button'
              onClick={() => void query.refetch()}
            >
              다시 시도
            </button>
          </div>
        ) : query.isPending ? (
          <p className='house-compare-empty' role='status'>
            비교 정보를 불러오고 있어요.
          </p>
        ) : query.data?.columns.length ? (
          <CompareTable columns={query.data.columns} />
        ) : null}
        <div className='house-change-legend'>
          <span>범례</span>
          <span className='house-change-up'>▲ 상승 파랑</span>
          <span className='house-change-down'>▼ 하락 빨강</span>
          <span className='house-fine'>
            국내 금융 관례(상승 빨강)와 반대예요. 부호와 화살표를 함께
            확인하세요.
          </span>
        </div>
        <p className='house-fine house-compare-note'>
          서울시 정비사업 현황(분기 갱신) 기준
        </p>
        <p className='house-fine house-compare-note'>
          온라인 비교는 손품 단계입니다. 현장 확인 후 매수 준비가 끝난 단계에서
          중개사무소에 연락하세요.
        </p>
      </div>
    </section>
  );
}
