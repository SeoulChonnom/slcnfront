import type { ReactNode } from 'react';
import { cn } from '../../lib/utils/cn';

type PageSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PageSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: PageSectionHeaderProps) {
  return (
    <div className={cn('slcn-page-section-header', className)}>
      <div>
        {eyebrow ? (
          <p className="slcn-page-section-header__eyebrow display-hand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="slcn-page-section-header__title display-hand">
          {title}
        </h2>
        {description ? (
          <p className="slcn-page-section-header__description">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className="slcn-page-section-header__action">{action}</div>
      ) : null}
    </div>
  );
}
