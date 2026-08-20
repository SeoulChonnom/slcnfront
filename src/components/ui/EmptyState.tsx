import { LinkButton } from './Button';
import { Card } from './Card';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  headingLevel = 3,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <Card blob className='slcn-empty-state'>
      <Heading className='slcn-empty-state__title display-type'>
        {title}
      </Heading>
      {description ? (
        <p className='slcn-empty-state__description'>{description}</p>
      ) : null}
      {actionLabel && actionTo ? (
        <div className='slcn-empty-state__action'>
          <LinkButton to={actionTo}>{actionLabel}</LinkButton>
        </div>
      ) : null}
    </Card>
  );
}
