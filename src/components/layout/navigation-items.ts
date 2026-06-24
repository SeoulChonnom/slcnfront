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

export function getDesktopNavigationItems(
  device: DeviceType
): NavigationItem[] {
  return [
    { label: '나들이 기록', to: buildDeviceTripListPath(device) },
    { label: '나들이 일정', to: buildDeviceCalendarMonthPath(device) },
    { label: '신발 추천', to: buildDeviceShoesCatalogPath(device) },
  ];
}

export function getMobileNavigationItems(device: DeviceType): NavigationItem[] {
  return [
    { label: '홈', to: buildDeviceRootPath(device), end: true },
    { label: '기록', to: buildDeviceTripListPath(device) },
    { label: '일정', to: buildDeviceCalendarMonthPath(device) },
    { label: '신발', to: buildDeviceShoesCatalogPath(device) },
  ];
}
