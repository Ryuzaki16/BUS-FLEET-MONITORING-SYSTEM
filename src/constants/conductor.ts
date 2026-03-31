export const COMMON_ROUTES = [
  { from: 'Dasmariñas', to: 'Alabang', fare: 45 },
  { from: 'Dasmariñas', to: 'Zapote', fare: 35 },
  { from: 'Dasmariñas', to: 'Sucat', fare: 40 },
  { from: 'Zapote', to: 'Alabang', fare: 25 },
  { from: 'Sucat', to: 'Alabang', fare: 15 },
] as const;

export const ITEM_CATEGORIES = ['electronics', 'bag', 'clothing', 'documents', 'accessories', 'other'] as const;

export const BOARDING_POINTS = ['Dasmariñas', 'Zapote', 'Sucat'] as const;
export const DESTINATIONS = ['Alabang', 'Sucat', 'Zapote'] as const;

export const GPS_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
} as const;

export const STORAGE_KEYS = {
  CONDUCTOR_BUS: 'conductor_bus',
  GPS_GRANTED: 'conductor_gps_granted',
} as const;

export const GPS_ERROR_CODES = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const;
