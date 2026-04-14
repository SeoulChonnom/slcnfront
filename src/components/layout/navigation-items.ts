import type { DeviceType } from '../../app/router/route-constants';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceRootPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTripListPath,
} from '../../lib/routing/route-builders';

export type NavigationItem = {
  label: string;
  to: string;
  external?: boolean;
  end?: boolean;
};

export function getPrimaryNavigationItems(
  device: DeviceType,
): NavigationItem[] {
  return [
    { label: '메인', to: buildDeviceRootPath(device), end: true },
    { label: '나들이', to: buildDeviceTripListPath(device) },
    { label: '달력', to: buildDeviceCalendarMonthPath(device) },
    { label: '신발', to: buildDeviceShoesCatalogPath(device) },
    { label: '필름', to: 'https://www.instagram.com/', external: true },
  ];
}
