import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import type { DeviceType } from '../../../app/router/route-constants';
import { useShoeCatalog } from '../hooks/useShoeCatalog';
import { ShoeBrandSection } from './ShoeBrandSection';

type ShoesCatalogSectionProps = {
  device: DeviceType;
};

export function ShoesCatalogSection({ device }: ShoesCatalogSectionProps) {
  const catalogQuery = useShoeCatalog();

  return (
    <section className="slcn-shoes-catalog-page">
      <Card className="slcn-shoes-catalog-page__intro" tone="pink" blob>
        <p className="slcn-shoes-catalog-page__eyebrow">Shoes Recom</p>
        <h1 className="slcn-shoes-catalog-page__title display-hand">
          서울 촌놈의 신발 추천
        </h1>
        <p className="slcn-shoes-catalog-page__description">
          오래 걸어도 편한 모델만 골랐습니다. 서울 촌놈 취향이 많이 들어가 있으니
          취향표로 봐도 됩니다.
        </p>
      </Card>

      {catalogQuery.isLoading ? (
        <div className="slcn-shoes-catalog-page__loading" aria-label="loading">
          <Skeleton className="slcn-shoes-catalog-page__loading-card" />
          <Skeleton className="slcn-shoes-catalog-page__loading-card" />
        </div>
      ) : null}

      {!catalogQuery.isLoading && !catalogQuery.data?.length ? (
        <EmptyState
          title="추천 신발 데이터가 비어 있어요."
          description="정적 카탈로그 정규화 결과를 다시 확인해주세요."
        />
      ) : null}

      {catalogQuery.data?.map((brand) => (
        <ShoeBrandSection
          key={brand.brandId}
          device={device}
          brand={brand}
        />
      ))}

      <Card className="slcn-shoes-catalog-page__warning" tone="muted">
        전체 가격은 정가 기준입니다. 외부 후기 링크는 새 탭으로 열리며, 실제 재고와
        가격은 판매처 기준으로 다시 확인해야 합니다.
      </Card>
    </section>
  );
}
