import { viesapi } from "@/lib/client/vies-api";
import { ViesCompanyData } from "@/types/vies-types";

/**
 * @param vatId
 */
export async function getVIESData(vatId: string): Promise<ViesCompanyData | false> {
  try {
    const res = await viesapi.get<ViesCompanyData>("vat/", { params: { vat_number: vatId } });
    return res.data;
  } catch {
    return false;
  }
}
