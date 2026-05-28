import { getAllCustomersAction } from "@/actions/customer-actions";
import CompanyListPage from "@/components/company/company-list-page";
import { requirePermission } from "@/lib/server/auth";
import { CustomerQueryInput, CustomerSegment, CustomerType, SortOrder } from "@mini-erp/shared";
import { notFound } from "next/navigation";

interface CustomersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; 
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  await requirePermission("customer:read");

  let resolvedParams = await searchParams; 

  if (resolvedParams.type == "all") resolvedParams.type = undefined;
  if (resolvedParams.segment == "all") resolvedParams.segment = undefined;

  const params: CustomerQueryInput = {
    page: Number(resolvedParams.page ?? 1),
    limit: Number(resolvedParams.limit ?? 20),
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
    sortBy: typeof resolvedParams.sortBy === "string" ? resolvedParams.sortBy : "companyName",
    sortOrder: (resolvedParams.sortOrder as SortOrder) || "asc",
    segment: (resolvedParams.segment as CustomerSegment) || undefined,
    type: (resolvedParams.type as CustomerType) || undefined,
  };

  const result = await getAllCustomersAction(params);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <CompanyListPage paginatedData={result.data} companyType="CUSTOMER" searchParams={params} />
  );
}
