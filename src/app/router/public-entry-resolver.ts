import {
  DEVICE_PREFIX,
  RESERVED_SHOE_BRAND_SEGMENTS,
  type DeviceType,
} from './route-constants';
import {
  buildDeviceCalendarMonthPath,
  buildDeviceCalendarWeekPath,
  buildDeviceLoginPath,
  buildDeviceNotFoundPath,
  buildDeviceRootPath,
  buildDeviceShoeDetailPath,
  buildDeviceShoesCatalogPath,
  buildDeviceTripDetailPath,
  buildDeviceTripListPath,
  buildDeviceTripRegisterPath,
} from '../../lib/routing/route-builders';

export type MatchMediaLike = (
  query: string,
) => Pick<MediaQueryList, 'matches'> | null;

type ResolvePublicEntryOptions = {
  matchMedia?: MatchMediaLike;
  search?: string;
  hash?: string;
};

function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/';
  }

  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function appendLocationParts(pathname: string, search = '', hash = '') {
  return `${pathname}${search}${hash}`;
}

function isDevicePath(pathname: string) {
  return (
    pathname === DEVICE_PREFIX.main ||
    pathname.startsWith(`${DEVICE_PREFIX.main}/`) ||
    pathname === DEVICE_PREFIX.mobile ||
    pathname.startsWith(`${DEVICE_PREFIX.mobile}/`)
  );
}

function isReservedShoeBrand(brand: string) {
  return RESERVED_SHOE_BRAND_SEGMENTS.includes(brand);
}

export function detectPreferredDevice(
  pathname: string,
  matchMedia?: MatchMediaLike,
): DeviceType {
  if (
    pathname === DEVICE_PREFIX.mobile ||
    pathname.startsWith(`${DEVICE_PREFIX.mobile}/`)
  ) {
    return 'mobile';
  }

  if (
    pathname === DEVICE_PREFIX.main ||
    pathname.startsWith(`${DEVICE_PREFIX.main}/`)
  ) {
    return 'main';
  }

  const media = matchMedia?.('(max-width: 767px)');

  if (media?.matches) {
    return 'mobile';
  }

  return 'main';
}

export function resolvePublicEntryPath(
  pathname: string,
  options: ResolvePublicEntryOptions = {},
) {
  const normalizedPathname = normalizePathname(pathname);
  const device = detectPreferredDevice(normalizedPathname, options.matchMedia);

  if (isDevicePath(normalizedPathname)) {
    return appendLocationParts(
      normalizedPathname,
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname === '/') {
    return appendLocationParts(
      buildDeviceRootPath(device),
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname === '/login') {
    return appendLocationParts(
      buildDeviceLoginPath(device),
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname === '/map/register') {
    return appendLocationParts(
      buildDeviceTripRegisterPath(device),
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname.startsWith('/map/')) {
    const date = normalizedPathname.slice('/map/'.length);

    if (date.length > 0) {
      return appendLocationParts(
        buildDeviceTripDetailPath(device, date),
        options.search,
        options.hash,
      );
    }
  }

  if (normalizedPathname === '/map') {
    return appendLocationParts(
      buildDeviceTripListPath(device),
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname === '/calendar/week') {
    return appendLocationParts(
      buildDeviceCalendarWeekPath(device),
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname === '/calendar') {
    return appendLocationParts(
      buildDeviceCalendarMonthPath(device),
      options.search,
      options.hash,
    );
  }

  if (normalizedPathname === '/shoesRecom') {
    return appendLocationParts(
      buildDeviceShoesCatalogPath(device),
      options.search,
      options.hash,
    );
  }

  const shoeMatch = normalizedPathname.match(/^\/([^/]+)\/([^/]+)$/);

  if (shoeMatch) {
    const [, brand, shoesName] = shoeMatch;

    if (!isReservedShoeBrand(brand)) {
      return appendLocationParts(
        buildDeviceShoeDetailPath(device, brand, shoesName),
        options.search,
        options.hash,
      );
    }
  }

  return appendLocationParts(
    buildDeviceNotFoundPath(device),
    options.search,
    options.hash,
  );
}
