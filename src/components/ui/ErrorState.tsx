import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type ErrorStateProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function ErrorState({
  title,
  description,
  onRetry,
  headingLevel = 3,
}: ErrorStateProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <Card blob className='slcn-error-state'>
      <Heading className='slcn-error-state__title display-type'>
        {title}
      </Heading>
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
