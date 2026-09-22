import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_ROW_KEYS = [
  'area-skeleton-1',
  'area-skeleton-2',
  'area-skeleton-3',
];

/**
 * screen_design.md §6: loading skeleton must keep the same grid as a real
 * row — no spinner. Reuses `.slcn-inspection-hairline-row` +
 * `.slcn-inspection-area-row` so the skeleton's grid tracks stay identical
 * to `AreaListRow`'s.
 */
export function AreaListSkeleton() {
  return (
    <div
      className='slcn-inspection-area-list__skeleton'
      role='status'
      aria-label='임장 지역 목록을 불러오는 중'
    >
      {SKELETON_ROW_KEYS.map((key) => (
        <div
          key={key}
          className='slcn-inspection-hairline-row slcn-inspection-area-row slcn-inspection-area-row--skeleton'
        >
          <div className='slcn-inspection-area-row__visits'>
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--visits-count' />
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--visits-dots' />
          </div>
          <div className='slcn-inspection-area-row__main'>
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--name' />
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--desc' />
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--quote' />
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--tags' />
          </div>
          <div className='slcn-inspection-area-row__meta'>
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--meta-line' />
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--meta-line' />
          </div>
          <div className='slcn-inspection-area-row__top'>
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--top-label' />
            <Skeleton className='slcn-inspection-skel slcn-inspection-skel--top-name' />
          </div>
        </div>
      ))}
    </div>
  );
}
