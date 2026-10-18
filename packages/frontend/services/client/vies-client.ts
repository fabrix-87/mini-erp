import { viesapi } from "@/lib/client/vies-api";

/**
 * TODO: Serve abbonamento API
 * @param vatId
 */
export async function getVIESData(vatId: string) {
  try {
    return await viesapi.get("vat/", { params: { vat_number: vatId } });    
  } catch {
    return false;
  }
}
