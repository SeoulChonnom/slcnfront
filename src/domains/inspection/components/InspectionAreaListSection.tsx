import type { DeviceType } from '@/app/router/route-constants';
import { LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { AreaListNoResults } from '@/domains/inspection/components/area-list/AreaListNoResults';
import { AreaListRow } from '@/domains/inspection/components/area-list/AreaListRow';
import { AreaListSkeleton } from '@/domains/inspection/components/area-list/AreaListSkeleton';
import {
  DEFAULT_AREA_SORT,
  useAreaListFilters,
} from '@/domains/inspection/components/area-list/area-list-filters';
import { useInspectionAreaList } from '@/domains/inspection/hooks/inspection-queries';
import type { AreaSort, RevisitIntent } from '@/domains/inspection/types';
import { REVISIT_INTENT_META } from '@/domains/inspection/utils/inspection-format';
import { buildDeviceInspectionRegisterPath } from '@/lib/routing/route-builders';

type InspectionAreaListSectionProps = {
  device: DeviceType;
};

const SORT_OPTIONS: { value: AreaSort; label: string }[] = [
  { value: 'RECENT_VISIT', label: '최근 임장순' },
  { value: 'VISIT_COUNT', label: '임장 많은 순' },
  { value: 'TOP_INTEREST', label: '최고 관심도순' },
];

const REVISIT_FILTER_ORDER: RevisitIntent[] = ['YES', 'MAYBE', 'NO'];

export function InspectionAreaListSection({
  device,
}: InspectionAreaListSectionProps) {
  const {
    q,
    queryInput,
    setQueryInput,
    revisit,
    setRevisit,
    clearRevisitFilter,
    sort,
    setSort,
  } = useAreaListFilters();

  const { data, isPending, isError, refetch } = useInspectionAreaList({
    keyword: q || undefined,
    // "미정" has no server-side param (fe_implementation_decisions.md
    // §3-③) — send no revisitIntent and filter the page client-side below.
    revisitIntent: revisit && revisit !== 'UNDECIDED' ? revisit : undefined,
    sort: sort === DEFAULT_AREA_SORT ? undefined : sort,
  });

  const displayedItems =
    revisit === 'UNDECIDED'
      ? (data?.items.filter((area) => !area.latestVisit?.revisitIntent) ?? [])
      : (data?.items ?? []);

  const isArchiveEmpty = data ? data.revisitIntentCounts.total === 0 : false;
  const hasActiveFilter = revisit !== null;

  return (
    <section className='slcn-inspection-area-list' data-device={device}>
      <div className='slcn-inspection-area-list__head'>
        <div className='slcn-inspection-area-list__head-text'>
          <h1 className='slcn-inspection-area-list__title'>임장</h1>
          {data ? (
            <p className='slcn-inspection-area-list__subline'>
              {data.totals.areaCount}개 지역을 {data.totals.visitCount}번
              걸었고, 매물 {data.totals.propertyCount}건을 봤습니다.
            </p>
          ) : null}
        </div>
        <LinkButton
          to={buildDeviceInspectionRegisterPath(device)}
          className='slcn-inspection-area-list__register'
        >
          + 임장 기록하기
        </LinkButton>
      </div>

      {/* Mobile only. The header button is hidden below 833px, so without this
          there is no way to start a record on a phone. Sits above the bottom
          nav, which is fixed at 1rem plus the safe-area inset. */}
      <LinkButton
        to={buildDeviceInspectionRegisterPath(device)}
        className='slcn-inspection-area-list__fab'
        aria-label='임장 기록하기'
      >
        <span aria-hidden='true'>+</span>
      </LinkButton>

      <div className='slcn-inspection-area-list__toolbar'>
        <div className='slcn-inspection-area-list__search'>
          <svg
            className='slcn-inspection-area-list__search-icon'
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            aria-hidden='true'
          >
            <circle cx='11' cy='11' r='7' />
            <path d='M20 20l-3.2-3.2' />
          </svg>
          <label
            className='slcn-visually-hidden'
            htmlFor='inspection-area-search'
          >
            임장 검색
          </label>
          <input
            id='inspection-area-search'
            type='search'
            placeholder='지역, 단지, 매물, 태그로 찾기'
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
          />
        </div>

        <div className='slcn-inspection-area-list__filters'>
          <fieldset className='slcn-inspection-area-list__chip-row'>
            <legend className='slcn-visually-hidden'>재방문 의사 필터</legend>
            <button
              type='button'
              className='slcn-inspection-area-list__filter'
              aria-pressed={revisit === null}
              onClick={clearRevisitFilter}
            >
              전체 {data?.revisitIntentCounts.total ?? 0}
            </button>
            {REVISIT_FILTER_ORDER.map((intent) => (
              <button
                key={intent}
                type='button'
                className='slcn-inspection-area-list__filter'
                aria-pressed={revisit === intent}
                onClick={() => setRevisit(intent)}
              >
                {REVISIT_INTENT_META[intent].label}{' '}
                {data?.revisitIntentCounts[intent] ?? 0}
              </button>
            ))}
            <button
              type='button'
              className='slcn-inspection-area-list__filter'
              aria-pressed={revisit === 'UNDECIDED'}
              onClick={() => setRevisit('UNDECIDED')}
            >
              미정 {data?.revisitIntentCounts.UNDECIDED ?? 0}
            </button>
          </fieldset>

          <label className='slcn-inspection-area-list__sort'>
            <span className='slcn-visually-hidden'>정렬</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as AreaSort)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isPending ? <AreaListSkeleton /> : null}

      {!isPending && isError ? (
        <ErrorState
          headingLevel={2}
          title='임장 목록을 불러오지 못했습니다.'
          description='네트워크 연결을 확인한 뒤 다시 시도해 주세요. 계속 실패하면 잠시 후 열어 보시면 됩니다.'
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isError && data && isArchiveEmpty ? (
        <EmptyState
          headingLevel={2}
          title='아직 임장 기록이 없습니다'
          description='지역을 하나 정해 걸어 보고, 돌아와서 그날의 인상과 본 매물을 남겨 두세요. 매물을 하나도 보지 않은 날도 기록할 수 있습니다.'
          actionLabel='첫 임장 기록하기'
          actionTo={buildDeviceInspectionRegisterPath(device)}
        />
      ) : null}

      {!isPending &&
      !isError &&
      data &&
      !isArchiveEmpty &&
      displayedItems.length === 0 ? (
        <AreaListNoResults
          device={device}
          keyword={q}
          hasRevisitFilter={hasActiveFilter}
          onClearFilters={clearRevisitFilter}
        />
      ) : null}

      {!isPending && !isError && displayedItems.length > 0 ? (
        <div className='slcn-inspection-area-list__list'>
          {displayedItems.map((area) => (
            <AreaListRow key={area.areaId} area={area} device={device} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
