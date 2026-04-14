import { cn } from '../../lib/utils/cn';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn('slcn-skeleton', className)} />;
}
