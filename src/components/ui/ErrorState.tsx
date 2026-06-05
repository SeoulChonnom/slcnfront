import { Button } from './Button';
import { Card } from './Card';

type ErrorStateProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <Card blob className='slcn-error-state'>
      <p className='slcn-error-state__icon display-hand'>!</p>
      <h3 className='slcn-error-state__title display-hand'>{title}</h3>
      <p className='slcn-error-state__description'>{description}</p>
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
