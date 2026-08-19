import { Button } from './Button';
import { Card } from './Card';

type ErrorStateProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Card blob className='slcn-error-state'>
      <p className='slcn-error-state__icon display-type'>!</p>
      <h3 className='slcn-error-state__title display-type'>{title}</h3>
      {description ? (
        <p className='slcn-error-state__description'>{description}</p>
      ) : null}
      {onRetry ? (
        <div className='slcn-error-state__action'>
          <Button variant='danger' onClick={onRetry}>
            다시 시도
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
