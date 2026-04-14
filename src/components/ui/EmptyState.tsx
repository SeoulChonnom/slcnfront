import { LinkButton } from './Button';
import { Card } from './Card';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <Card blob className="slcn-empty-state pink-mesh">
      <p className="slcn-empty-state__icon display-hand">◌</p>
      <h3 className="slcn-empty-state__title display-hand">{title}</h3>
      <p className="slcn-empty-state__description">{description}</p>
      {actionLabel && actionTo ? (
        <div className="slcn-empty-state__action">
          <LinkButton to={actionTo}>{actionLabel}</LinkButton>
        </div>
      ) : null}
    </Card>
  );
}
