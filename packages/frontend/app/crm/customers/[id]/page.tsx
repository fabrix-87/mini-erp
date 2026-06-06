import { getCustomerByIdAction } from "@/actions/customer-actions";
import CompanyDetailPage from "@/components/company-detail";
import { requirePermission } from "@/lib/server/auth";
import { PageIdProps } from "@/types/page-types";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({ params }: PageIdProps) {
  await requirePermission("customer:read");

  const { id } = await params;

  const result = await getCustomerByIdAction(parseInt(id));

  if (!result.success || !result.data) notFound();

  return <CompanyDetailPage data={result.data} companyType="CUSTOMER" />;
}
