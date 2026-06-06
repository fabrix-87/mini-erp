import CompanyListPage from "@/components/company/company-list-page";
import { requirePermission } from "@/lib/server/auth";
import { getAllSuppliers } from "@/services/server/supplier-service";
import { SupplierQueryInput, supplierQuerySchema } from "@mini-erp/shared";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Gestione Fornitori",
};

interface SuppliersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  await requirePermission("supplier:read");

  const params: SupplierQueryInput = supplierQuerySchema.parse(await searchParams);

  const result = await getAllSuppliers(params);

  if (result.status !== "success" || !result.data) {
    notFound();
  }

  return <CompanyListPage paginatedData={result} companyType="SUPPLIER" searchParams={params} />;
}
