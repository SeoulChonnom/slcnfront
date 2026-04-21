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

export function buildPublicRootPath() {
  return '/';
}

export function buildPublicLoginPath() {
  return '/login';
}

export function buildPublicTripListPath() {
  return '/map';
}

export function buildPublicTripRegisterPath() {
  return '/map/register';
}

export function buildPublicTripDetailPath(date: string) {
  return buildPath('map', encodeSegment(date));
}

export function buildPublicCalendarMonthPath() {
  return '/calendar';
}

export function buildPublicCalendarWeekPath() {
  return '/calendar/week';
}

export function buildPublicShoesCatalogPath() {
  return '/shoesRecom';
}

export function buildPublicShoeDetailPath(brand: string, shoesName: string) {
  return buildPath(encodeSegment(brand), encodeSegment(shoesName));
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

export function buildDeviceTripDetailPath(device: DeviceType, date: string) {
  return buildDevicePath(device, 'map', encodeSegment(date));
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
