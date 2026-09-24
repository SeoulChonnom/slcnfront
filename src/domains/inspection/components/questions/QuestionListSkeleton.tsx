import { Skeleton } from '@/components/ui/Skeleton';

/**
 * screen_design.md §6 — loading keeps the real row's grid shape rather than
 * a spinner. `withAnswerCount=true` is a full scan (api.md §9), so this is
 * what the admin screen sits on while it waits.
 */
export function QuestionListSkeleton() {
  return (
    <div aria-hidden='true' className='slcn-inspection-qlist-skeleton'>
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className='slcn-inspection-qrow slcn-inspection-hairline-row'
        >
          <Skeleton className='slcn-inspection-qrow__skel-grab' />
          <div className='slcn-inspection-qrow__main'>
            <Skeleton className='slcn-inspection-qrow__skel-line' />
            <Skeleton className='slcn-inspection-qrow__skel-line--sub' />
          </div>
          <Skeleton className='slcn-inspection-qrow__skel-chip' />
          <Skeleton className='slcn-inspection-qrow__skel-chip' />
          <Skeleton className='slcn-inspection-qrow__skel-chip' />
          <Skeleton className='slcn-inspection-qrow__skel-btn' />
        </div>
      ))}
    </div>
  );
}
