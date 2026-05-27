import { getSupplierByIdAction } from "@/actions/supplier-actions";
import CompanyForm from "@/components/company-form";
import { requirePermission } from "@/lib/server/auth";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: Props) {
  await requirePermission("supplier:update");

  const { id } = await params;
  const result = await getSupplierByIdAction(parseInt(id));

  if (!result.success || !result.data) notFound();

  return <CompanyForm initialData={result.data} companyType="SUPPLIER" />;
}
