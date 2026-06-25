import {
  DEVICE_PREFIX,
  type DeviceType,
} from '../../app/router/route-constants';

function encodeSegment(value: string) {
  return encodeURIComponent(value);
}

function buildPath(...segments: string[]) {
  const normalized = segments
    .filter(Boolean)
    .map((segment, index) => {
      if (index === 0) {
        return segment === '/' ? '' : segment.replace(/^\/+|\/+$/g, '');
      }

      return segment.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean);

  if (normalized.length === 0) {
    return '/';
  }

  return `/${normalized.join('/')}`;
}

function buildDevicePath(device: DeviceType, ...segments: string[]) {
  return buildPath(DEVICE_PREFIX[device], ...segments);
}

export function buildDeviceRootPath(device: DeviceType) {
  return buildDevicePath(device);
}

export function buildDeviceLoginPath(device: DeviceType) {
  return buildDevicePath(device, 'login');
}

export function buildDeviceTripListPath(device: DeviceType) {
  return buildDevicePath(device, 'map');
}

export function buildDeviceTripRegisterPath(device: DeviceType) {
  return buildDevicePath(device, 'map', 'register');
}

export function buildDeviceTripDetailPath(device: DeviceType, id: string) {
  return buildDevicePath(device, 'map', encodeSegment(id));
}

export function buildDeviceTravelListPath(device: DeviceType) {
  return buildDevicePath(device, 'travel');
}

export function buildDeviceTravelRegisterPath(device: DeviceType) {
  return buildDevicePath(device, 'travel', 'register');
}

export function buildDeviceTravelDetailPath(device: DeviceType, id: string) {
  return buildDevicePath(device, 'travel', encodeSegment(id));
}

export function buildDeviceTravelEditPath(device: DeviceType, id: string) {
  return buildDevicePath(device, 'travel', encodeSegment(id), 'edit');
}

export function buildDeviceCalendarMonthPath(device: DeviceType) {
  return buildDevicePath(device, 'calendar');
}

export function buildDeviceCalendarWeekPath(device: DeviceType) {
  return buildDevicePath(device, 'calendar', 'week');
}

export function buildDeviceShoesCatalogPath(device: DeviceType) {
  return buildDevicePath(device, 'shoesRecom');
}

export function buildDeviceShoeDetailPath(
  device: DeviceType,
  brand: string,
  shoesName: string
) {
  return buildDevicePath(
    device,
    encodeSegment(brand),
    encodeSegment(shoesName)
  );
}

export function buildDeviceNotFoundPath(device: DeviceType) {
  return buildDevicePath(device, '404');
}
