import { notFound } from "next/navigation";
import { getCustomerByIdAction } from "@/actions/customer-actions";
import CompanyForm from "@/components/company-form";
import { requirePermission } from "@/lib/server/auth";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: Props) {
  await requirePermission("customer:update");

  const { id } = await params;
  const result = await getCustomerByIdAction(parseInt(id));

  if (!result.success || !result.data) notFound();

  return <CompanyForm initialData={result.data} companyType="CUSTOMER" />;
}