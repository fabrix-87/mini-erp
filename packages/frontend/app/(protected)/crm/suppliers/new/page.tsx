import CompanyFormPage from "@/components/company-form";
import { requirePermission } from "@/lib/server/auth";

export default async function newCompany() {
  await requirePermission("supplier:create");

  return <CompanyFormPage companyType="SUPPLIER" />;
}
