import type { DeviceType } from '../../app/router/route-constants';
import { LinkButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageSectionHeader } from '../../components/ui/PageSectionHeader';
import { buildDeviceRootPath } from '../../lib/routing/route-builders';

type NotFoundPageProps = {
  device: DeviceType;
};

export function NotFoundPage({ device }: NotFoundPageProps) {
  return (
    <section className="slcn-route-page">
      <Card className="slcn-route-page__card" tone="muted">
        <PageSectionHeader
          title="페이지를 찾을 수 없어요."
          description="찾으시는 화면이 없어요. SLCN 홈으로 다시 이동해보세요."
        />
        <div className="slcn-route-page__actions">
          <LinkButton to={buildDeviceRootPath(device)}>
            홈으로 돌아가기
          </LinkButton>
        </div>
      </Card>
    </section>
  );
}
