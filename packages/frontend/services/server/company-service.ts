import { serverApi } from "@/lib/server/api";
import { Company } from "@mini-erp/shared";

export async function getCompanyById(companyId: string): Promise<Company> {
  return serverApi.get<Company>(`/companies/${companyId}`);
}
