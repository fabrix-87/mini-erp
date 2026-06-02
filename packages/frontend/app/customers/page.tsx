import CompanyListPage from "@/components/company/company-list-page";
import { requirePermission } from "@/lib/server/auth";
import { getAllCustomers } from "@/services/server/customer-service";
import { CustomerQueryInput, customerQuerySchema, CustomerSegment, CustomerType, SortOrder } from "@mini-erp/shared";
import { notFound } from "next/navigation";

interface CustomersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  await requirePermission("customer:read");

  const params: CustomerQueryInput = customerQuerySchema.parse(await searchParams);

  const result = await getAllCustomers(params);

  if (result.status !== "success" || !result.data) {
    notFound();
  }

  return (
    <CompanyListPage paginatedData={result} companyType="CUSTOMER" searchParams={params} />
  );
}
