import { Card } from '../../../components/ui/Card';
import type { ShoeReview } from '../types';

type ShoeReviewCardProps = {
  review: ShoeReview;
};

export function ShoeReviewCard({ review }: ShoeReviewCardProps) {
  return (
    <a
      href={review.linkUrl}
      target="_blank"
      rel="noreferrer"
      className="slcn-shoe-review-card-link"
    >
      <Card className="slcn-shoe-review-card" tone="default">
        <div className="slcn-shoe-review-card__image-wrap">
          <img
            src={review.imageUrl}
            alt={review.description}
            className="slcn-shoe-review-card__image"
          />
        </div>
        <p className="slcn-shoe-review-card__caption">{review.description}</p>
      </Card>
    </a>
  );
}
