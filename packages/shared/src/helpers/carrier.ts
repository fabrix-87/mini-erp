import { CARRIER_TRACKING_PLACEHOLDER } from "../constants/carrier";

/**
 * Builds the public tracking URL of a shipment.
 *
 * @param template - Carrier.trackingUrlTemplate containing the {trackingNumber} placeholder
 * @param trackingNumber - Document.trackingNumber
 * @returns The resolved URL, or null when template or tracking number are missing
 */
export const buildTrackingUrl = (
  template: string | null | undefined,
  trackingNumber: string | null | undefined,
): string | null => {
  if (!template || !trackingNumber?.trim()) return null;
  return template.replaceAll(
    CARRIER_TRACKING_PLACEHOLDER,
    encodeURIComponent(trackingNumber.trim()),
  );
};
