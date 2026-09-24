import type { DeviceType } from '@/app/router/route-constants';
import { Button, LinkButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { buildDeviceInspectionRegisterPath } from '@/lib/routing/route-builders';

type AreaListNoResultsProps = {
  device: DeviceType;
  keyword: string;
  hasRevisitFilter: boolean;
  onClearFilters: () => void;
};

/**
 * screen_design.md §6 "검색 무결과": don't clear the search/filter state for
 * the person, tell them what to clear and name the exact search scope
 * (§7 / fe_implementation_decisions.md §3-⑤: keyword matches 5 fields).
 * Needs two independent actions, so it can't reuse the shared `EmptyState`
 * (single action) — it reuses the same `Card blob` shell that backs it.
 */
export function AreaListNoResults({
  device,
  keyword,
  hasRevisitFilter,
  onClearFilters,
}: AreaListNoResultsProps) {
  return (
    <Card blob className='slcn-empty-state'>
      <h2 className='slcn-empty-state__title display-type'>
        {keyword
          ? `'${keyword}'와 맞는 기록이 없습니다`
          : '맞는 기록이 없습니다'}
      </h2>
      <p className='slcn-empty-state__description'>
        지역명, 지역 설명, 단지명, 매물명, 태그에서 찾았습니다.
        {hasRevisitFilter
          ? ' 재방문 의사 필터를 해제하면 더 넓게 볼 수 있습니다.'
          : ' 다른 검색어로 찾아보세요.'}
      </p>
      <div className='slcn-empty-state__action slcn-inspection-area-list__no-results-actions'>
        {hasRevisitFilter ? (
          <Button variant='secondary' onClick={onClearFilters}>
            필터 해제
          </Button>
        ) : null}
        <LinkButton to={buildDeviceInspectionRegisterPath(device)}>
          {keyword
            ? `'${keyword}' 지역 새로 임장 기록하기`
            : '새로 임장 기록하기'}
        </LinkButton>
      </div>
    </Card>
  );
}
