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
  const shoeDetail = useShoeDetail(brandSlug, shoesSlug);

  if (!shoeDetail) {
    return (
      <section className="slcn-shoe-detail-page">
        <Card className="slcn-shoe-detail-page__fallback" tone="muted">
          <p className="slcn-shoe-detail-page__fallback-eyebrow">SLCN Shoes</p>
          <h1 className="slcn-shoe-detail-page__fallback-title display-hand">
            존재하지 않는 신발입니다.
          </h1>
          <p className="slcn-shoe-detail-page__fallback-description">
            찾으시는 신발 정보를 다시 확인해주세요.
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

  const { brand, shoe } = shoeDetail;

  return (
    <section className="slcn-shoe-detail-page">
      {device === 'main' ? (
        <div className="slcn-shoe-detail-page__header">
          <p className="slcn-shoe-detail-page__eyebrow">
            서울 촌놈의 신발 추천 👟
          </p>
          <LinkButton
            to={buildDeviceShoesCatalogPath(device)}
            variant="ghost"
            size="sm"
          >
            신발 추천으로 돌아가기
          </LinkButton>
        </div>
      ) : null}

      <Card className="slcn-shoe-detail-page__warning" tone="muted">
        사진을 클릭하면 링크로 이동합니다
      </Card>

      <ShoeDetailHero brand={brand} shoe={shoe} />
      <ShoeVideoPanel shoe={shoe} />

      <section className="slcn-shoe-detail-page__reviews">
        <div className="slcn-shoe-detail-page__reviews-header">
          <p className="slcn-shoe-detail-page__reviews-eyebrow">착용 후기</p>
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
