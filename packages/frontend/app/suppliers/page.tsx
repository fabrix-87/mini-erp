import { getAllSuppliersAction } from "@/actions/supplier-actions";
import CompanyListPage from "@/components/company/company-list-page";
import { requirePermission } from "@/lib/server/auth";
import { SortOrder, SupplierQueryInput } from "@mini-erp/shared";
import { notFound } from "next/navigation";

interface SuppliersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  await requirePermission("supplier:read");

  let resolvedParams = await searchParams;
  const minRating = Number(resolvedParams.minRating);
  const validMinRating = minRating >= 1 && minRating <= 5 ? minRating : undefined;
  
  const params: SupplierQueryInput = {
    page: Number(resolvedParams.page ?? 1),
    limit: Number(resolvedParams.limit ?? 20),
    search: typeof resolvedParams.search === "string" ? resolvedParams.search : undefined,
    sortBy: typeof resolvedParams.sortBy === "string" ? resolvedParams.sortBy : "companyName",
    sortOrder: (resolvedParams.sortOrder as SortOrder) || "asc",
    minRating: validMinRating,
  };

  const result = await getAllSuppliersAction(params);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <CompanyListPage paginatedData={result.data} companyType="SUPPLIER" searchParams={params} />
  );
}
