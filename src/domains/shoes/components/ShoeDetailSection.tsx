import { LinkButton } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { buildDeviceShoesCatalogPath } from '../../../lib/routing/route-builders';
import type { DeviceType } from '../../../app/router/route-constants';
import { useShoeDetail } from '../hooks/useShoeDetail';
import { getShoeReviewKey } from '../utils/shoes-slug';
import { ShoeDetailHero } from './ShoeDetailHero';
import { ShoeReviewCard } from './ShoeReviewCard';
import { ShoeVideoPanel } from './ShoeVideoPanel';

type ShoeDetailSectionProps = {
  device: DeviceType;
  brandSlug: string | undefined;
  shoesSlug: string | undefined;
};

export function ShoeDetailSection({
  device,
  brandSlug,
  shoesSlug,
}: ShoeDetailSectionProps) {
  const shoeDetailQuery = useShoeDetail(brandSlug, shoesSlug);

  if (shoeDetailQuery.isLoading) {
    return (
      <section className="slcn-shoe-detail-page" aria-label="loading">
        <Card className="slcn-shoe-detail-page__fallback" tone="muted">
          정보를 불러오는 중입니다.
        </Card>
      </section>
    );
  }

  if (!shoeDetailQuery.data) {
    return (
      <section className="slcn-shoe-detail-page">
        <Card className="slcn-shoe-detail-page__fallback" tone="muted">
          <p className="slcn-shoe-detail-page__fallback-eyebrow">Shoes 404</p>
          <h1 className="slcn-shoe-detail-page__fallback-title display-hand">
            존재하지 않는 신발입니다.
          </h1>
          <p className="slcn-shoe-detail-page__fallback-description">
            브랜드 slug 또는 신발 slug가 카탈로그와 맞지 않습니다.
          </p>
          <div className="slcn-shoe-detail-page__fallback-actions">
            <LinkButton to={buildDeviceShoesCatalogPath(device)}>
              신발 추천으로 돌아가기
            </LinkButton>
          </div>
        </Card>
      </section>
    );
  }

  const { brand, shoe } = shoeDetailQuery.data;

  return (
    <section className="slcn-shoe-detail-page">
      <div className="slcn-shoe-detail-page__header">
        <p className="slcn-shoe-detail-page__eyebrow">Shoes Detail</p>
        <LinkButton
          to={buildDeviceShoesCatalogPath(device)}
          variant="ghost"
          size="sm"
        >
          ← 신발 추천으로
        </LinkButton>
      </div>

      <ShoeDetailHero brand={brand} shoe={shoe} />
      <ShoeVideoPanel shoe={shoe} />

      <section className="slcn-shoe-detail-page__reviews">
        <div className="slcn-shoe-detail-page__reviews-header">
          <p className="slcn-shoe-detail-page__reviews-eyebrow">Street Review</p>
          <h2 className="slcn-shoe-detail-page__reviews-title display-hand">
            여러 착용 샷
          </h2>
        </div>
        <div className="slcn-shoe-detail-page__reviews-grid">
          {shoe.reviews.map((review, index) => (
            <ShoeReviewCard
              key={getShoeReviewKey(shoe, index)}
              review={review}
            />
          ))}
        </div>
      </section>
    </section>
  );
}
