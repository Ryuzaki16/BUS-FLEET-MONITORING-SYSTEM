const normalizeBaseUrl = (value?: string | null) => {
  return value?.trim().replace(/\/+$/, "") ?? "";
};

const getWindowOrigin = () => {
  if (typeof window === "undefined") return "";
  return normalizeBaseUrl(window.location.origin);
};

export const getResolvedPublicBaseUrl = (baseUrlOverride?: string | null) => {
  const override = normalizeBaseUrl(baseUrlOverride);
  if (override) return override;

  const envUrl = normalizeBaseUrl(import.meta.env.VITE_PUBLIC_WEB_URL);
  if (envUrl) return envUrl;

  return getWindowOrigin();
};

export const getPublicBusTrackingUrl = (busId: string, baseUrlOverride?: string | null) => {
  const baseUrl = getResolvedPublicBaseUrl(baseUrlOverride);
  if (!baseUrl) return "";

  return `${baseUrl}/bus/track/${busId}`;
};

export const getBusQrImageUrl = (busId: string, baseUrlOverride?: string | null) => {
  const trackingUrl = getPublicBusTrackingUrl(busId, baseUrlOverride);
  if (!trackingUrl) return "";

  return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(trackingUrl)}`;
};
