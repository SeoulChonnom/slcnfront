import { Link } from 'react-router-dom';
import type { DeviceType } from '@/app/router/route-constants';
import { ChevronIcon } from '@/domains/inspection/components/property-detail/icons';
import { formatVisitedAtDate } from '@/domains/inspection/utils/inspection-format';
import {
  buildDeviceInspectionAreaDetailPath,
  buildDeviceInspectionAreaListPath,
} from '@/lib/routing/route-builders';

type PropertyBreadcrumbProps = {
  device: DeviceType;
  areaId: string;
  areaName: string;
  visitId: string;
  visitedAt: string;
  propertyLabel: string;
};

/** `임장 › 성수동 › 2026.09.17 임장 › 트리마제 101동 1203호` (screen_design.md §5.3). */
export function PropertyBreadcrumb({
  device,
  areaId,
  areaName,
  visitId,
  visitedAt,
  propertyLabel,
}: PropertyBreadcrumbProps) {
  const areaDetailPath = buildDeviceInspectionAreaDetailPath(device, areaId);
  const visitDetailPath = `${areaDetailPath}?visit=${encodeURIComponent(visitId)}`;

  return (
    <nav className='slcn-inspection-crumb' aria-label='현재 위치'>
      <Link to={buildDeviceInspectionAreaListPath(device)}>임장</Link>
      <ChevronIcon />
      <Link to={areaDetailPath}>{areaName}</Link>
      <ChevronIcon />
      <Link to={visitDetailPath} className='slcn-num'>
        {formatVisitedAtDate(visitedAt)} 임장
      </Link>
      <ChevronIcon />
      <span aria-current='page'>{propertyLabel}</span>
    </nav>
  );
}
