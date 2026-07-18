import { notFound } from "next/navigation";
import CompanyForm from "@/components/company-form";
import { requirePermission } from "@/lib/server/auth";
import { getCustomerById } from "@/services/server/customer-service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: Props) {
  await requirePermission("customer:update");

  const { id } = await params;
  const result = await getCustomerById(id);

  if (!result) notFound();

  return <CompanyForm initialData={result} companyType="CUSTOMER" />;
}