import type { DeviceType } from '../../app/router/route-constants';
import { LinkButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageSectionHeader } from '../../components/ui/PageSectionHeader';

type PlaceholderAction = {
  label: string;
  to: string;
};

type AppPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  device: DeviceType;
  note?: string;
  actions?: PlaceholderAction[];
};

export function AppPlaceholderPage({
  eyebrow,
  title,
  description,
  device,
  note,
  actions = [],
}: AppPlaceholderPageProps) {
  return (
    <section className="slcn-route-page">
      <Card className="slcn-route-page__card">
        <p className="slcn-route-page__device-chip">{eyebrow}</p>
        <PageSectionHeader title={title} description={description} />
        <div className="slcn-route-page__meta">
          <span className="slcn-route-page__device-chip">{device}</span>
          <p className="slcn-route-page__note">
            {note ?? 'Step 04에서는 shell과 route contract만 먼저 고정합니다.'}
          </p>
        </div>
        {actions.length > 0 ? (
          <div className="slcn-route-page__actions">
            {actions.map((action) => (
              <LinkButton key={action.to} to={action.to} variant="secondary">
                {action.label}
              </LinkButton>
            ))}
          </div>
        ) : null}
      </Card>
    </section>
  );
}
