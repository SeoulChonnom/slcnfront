import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/utils/cn';

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    tone?: 'default' | 'muted' | 'pink';
    blob?: boolean;
  }
>;

export function Card({
  children,
  className,
  tone = 'default',
  blob = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn('slcn-card', className)}
      data-tone={tone}
      data-blob={blob}
      {...props}
    >
      {children}
    </div>
  );
}
