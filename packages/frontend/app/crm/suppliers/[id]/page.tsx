import { getSupplierByIdAction } from "@/actions/supplier-actions";
import CompanyDetailPage from "@/components/company-detail";
import { requirePermission } from "@/lib/server/auth";
import { PageIdProps } from "@/types/page-types";
import { notFound } from "next/navigation";

export default async function SupplierDetailPage({ params }: PageIdProps) {
  await requirePermission("supplier:read");

  const { id } = await params;

  const result = await getSupplierByIdAction(parseInt(id));

  if (!result.success || !result.data) notFound();

  return <CompanyDetailPage data={result.data} companyType="SUPPLIER" />;
}
