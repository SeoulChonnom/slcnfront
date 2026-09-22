import type { DeviceType } from '@/app/router/route-constants';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceInspectionAreaListPath,
  buildDeviceRootPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTravelListPath,
  buildDeviceTripListPath,
} from '@/lib/routing/route-builders';

export type NavigationIconName =
  | 'home'
  | 'trip'
  | 'travel'
  | 'calendar'
  | 'inspection'
  | 'shoes';

export type NavigationItem = {
  label: string;
  to: string;
  /** Stable key for the icon, so renaming a label never drops its glyph. */
  icon?: NavigationIconName;
  external?: boolean;
  end?: boolean;
};

export function getDesktopHomeNavigationItems(
  device: DeviceType
): NavigationItem[] {
  return [
    { label: '홈', to: buildDeviceRootPath(device), end: true },
    { label: '여행', to: buildDeviceTravelListPath(device) },
    { label: '나들이', to: buildDeviceTripListPath(device) },
    { label: '임장', to: buildDeviceInspectionAreaListPath(device) },
    { label: '달력', to: buildDeviceCalendarMonthPath(device) },
  ];
}

export function getMobileNavigationItems(device: DeviceType): NavigationItem[] {
  return [
    { label: '홈', icon: 'home', to: buildDeviceRootPath(device), end: true },
    { label: '나들이', icon: 'trip', to: buildDeviceTripListPath(device) },
    { label: '여행', icon: 'travel', to: buildDeviceTravelListPath(device) },
    {
      label: '임장',
      icon: 'inspection',
      to: buildDeviceInspectionAreaListPath(device),
    },
    {
      label: '달력',
      icon: 'calendar',
      to: buildDeviceCalendarMonthPath(device),
    },
    { label: '신발', icon: 'shoes', to: buildDeviceShoesCatalogPath(device) },
  ];
}
