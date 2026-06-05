const DEVICE_TYPES = ['main', 'mobile'] as const;

export type DeviceType = (typeof DEVICE_TYPES)[number];

export const DEVICE_PREFIX = {
  main: '/main',
  mobile: '/mobile',
} as const satisfies Record<DeviceType, string>;

export const RESERVED_SHOE_BRAND_SEGMENTS = [
  'login',
  'map',
  'calendar',
  'shoesRecom',
  'main',
  'mobile',
];

export const MAIN_ROUTE_PATTERNS = {
  root: '/main',
  login: '/main/login',
  tripList: '/main/map',
  tripRegister: '/main/map/register',
  tripDetail: '/main/map/:id',
  calendarMonth: '/main/calendar',
  calendarWeek: '/main/calendar/week',
  shoesCatalog: '/main/shoesRecom',
  shoeDetail: '/main/:brand/:shoesName',
  notFound: '/main/404',
} as const;

export const MOBILE_ROUTE_PATTERNS = {
  root: '/mobile',
  login: '/mobile/login',
  tripList: '/mobile/map',
  tripRegister: '/mobile/map/register',
  tripDetail: '/mobile/map/:id',
  calendarMonth: '/mobile/calendar',
  calendarWeek: '/mobile/calendar/week',
  shoesCatalog: '/mobile/shoesRecom',
  shoeDetail: '/mobile/:brand/:shoesName',
  notFound: '/mobile/404',
} as const;
