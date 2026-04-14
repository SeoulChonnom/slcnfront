import { Card } from '../../components/ui/Card';

export function RouteLoadingFallback() {
  return (
    <section className="slcn-route-loading" aria-label="route-loading">
      <Card className="slcn-route-loading__card" tone="muted">
        페이지를 불러오는 중입니다.
      </Card>
    </section>
  );
}
