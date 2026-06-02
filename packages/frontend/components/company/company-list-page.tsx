"use client";

import { CompanyListTable } from "@/components/company/company-list-table";
import { CustomerQueryInput, SupplierQueryInput } from "@mini-erp/shared";
import { useUpdateURL } from "@/hooks/use-update-url";
import SupplierHeaderListPage from "./company-list/supplier-header";
import CustomerHeaderListPage from "./company-list/customer-header";
import { CustomerListApiResponse } from "@/types/customer-types";
import { SupplierListApiResponse } from "@/types/supplier-types";
import { useCallback, useState } from "react";
import { debounce } from "@/lib/utils";

type CustomerCompanyListPageProps = {
  companyType: "CUSTOMER";
  paginatedData: CustomerListApiResponse;
  searchParams: CustomerQueryInput;
};

type SupplierCompanyListPageProps = {
  companyType: "SUPPLIER";
  paginatedData: SupplierListApiResponse;
  searchParams: SupplierQueryInput;
};

type Props = CustomerCompanyListPageProps | SupplierCompanyListPageProps;

export default function CompanyListPage({ searchParams, paginatedData, companyType }: Props) {
  const updateURL = useUpdateURL(`/${companyType.toLowerCase()}s`);

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handleSort = (sortBy: string, sortOrder: "asc" | "desc") => {
    updateURL({ sortBy, sortOrder });
  };

  // stato locale per l'input di ricerca
  const [searchInputValue, setSearchInputValue] = useState(searchParams.search || "");

  // FUNZIONE BASE CHE AGGIORNA I PARAMETRI REALI (Quella da debouncare)
  const updateSearchParams = (search: string) => {
    updateURL({ search });
  };

  // FUNZIONE DEBOUNCED:
  // Creata una sola volta (grazie a useCallback) e ritarda l'esecuzione di updateSearchParams
  const debouncedSetSearchParams = useCallback(
    debounce(updateSearchParams, 400), // Ritardo di 400ms (regolabile)
    [],
  );

  const handleSearchChange = (search: string) => {
    setSearchInputValue(search); // Aggiorna subito l'input visivo
    debouncedSetSearchParams(search); // Aggiorna i parametri con debounce
  };

  const customerHandleFilterChange = (key: keyof CustomerQueryInput, value: any) => {
    updateURL({ [key]: value, page: 1 });
  };
  const supplierHandleFilterChange = (key: keyof SupplierQueryInput, value: any) => {
    updateURL({ [key]: value, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {companyType == "CUSTOMER" ? (
        <CustomerHeaderListPage
          searchParams={searchParams}
          handleSearchChange={handleSearchChange}
          handleFilterChange={customerHandleFilterChange}
          searchInputValue={searchInputValue}
        />
      ) : (
        <SupplierHeaderListPage
          searchParams={searchParams}
          handleSearchChange={handleSearchChange}
          handleFilterChange={supplierHandleFilterChange}
          searchInputValue={searchInputValue}
        />
      )}

      {/* Table */}
      <CompanyListTable
        data={paginatedData.data}
        type={companyType}
        onSort={handleSort}
        currentPage={paginatedData.pagination?.currentPage || 1}
        totalPages={paginatedData.pagination?.totalPages || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
