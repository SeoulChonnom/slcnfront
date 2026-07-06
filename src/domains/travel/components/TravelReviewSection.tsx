import type { TravelReview } from '../types';

type TravelReviewSectionProps = {
  review: TravelReview | null;
};

type ReviewField = {
  key: keyof TravelReview;
  label: string;
  tone?: 'good' | 'bad';
};

const REVIEW_FIELDS: ReviewField[] = [
  { key: 'goodPoint', label: '좋았던 점', tone: 'good' },
  { key: 'badPoint', label: '아쉬운 점', tone: 'bad' },
  { key: 'revisitPlace', label: '다시 가고 싶은 곳' },
  { key: 'finalReview', label: '최종 후기' },
];

export function TravelReviewSection({ review }: TravelReviewSectionProps) {
  const hasContent =
    review !== null &&
    (review.oneLineSummary ||
      review.goodPoint ||
      review.badPoint ||
      review.revisitPlace ||
      review.finalReview);

  if (!hasContent) {
    return (
      <p className='slcn-travel-detail__empty'>
        아직 여행 후기가 없어요. 여행 수정에서 후기를 남겨보세요.
      </p>
    );
  }

  const filledFields = REVIEW_FIELDS.filter((field) => review[field.key]);

  return (
    <div className='slcn-travel-review'>
      {review.oneLineSummary ? (
        <p className='slcn-travel-review__summary'>{review.oneLineSummary}</p>
      ) : null}

      {filledFields.length > 0 ? (
        <div className='slcn-travel-review__grid'>
          {filledFields.map((field) => (
            <div
              key={field.key}
              className='slcn-travel-review__card'
              data-tone={field.tone}
            >
              <p className='slcn-travel-review__card-label'>{field.label}</p>
              <p className='slcn-travel-review__card-text'>
                {review[field.key]}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
