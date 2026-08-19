"use client";

import { CompanyListTable } from "@/components/company/company-list-table";
import {
  CustomerQueryInput,
  CustomerStats,
  SupplierQueryInput,
  SupplierStats,
} from "@mini-erp/shared";
import { useUpdateURL } from "@/hooks/use-update-url";
import SupplierHeaderListPage from "./company-list/supplier-header";
import CustomerHeaderListPage from "./company-list/customer-header";
import { CustomerListApiResponse } from "@/types/customer-types";
import { SupplierListApiResponse } from "@/types/supplier-types";
import { useEffect, useState } from "react";
import { useNavigation } from "@/hooks/use-navigation";

type CustomerCompanyListPageProps = {
  companyType: "CUSTOMER";
  paginatedData: CustomerListApiResponse;
  searchParams: CustomerQueryInput;
  stats: CustomerStats;
};

type SupplierCompanyListPageProps = {
  companyType: "SUPPLIER";
  paginatedData: SupplierListApiResponse;
  searchParams: SupplierQueryInput;
  stats: SupplierStats;
};

type Props = CustomerCompanyListPageProps | SupplierCompanyListPageProps;

export default function CompanyListPage({
  searchParams,
  paginatedData,
  companyType,
  stats,
}: Props) {
  const { getRoute } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const updateURL = useUpdateURL(
    companyType == "CUSTOMER" ? getRoute("customers") : getRoute("suppliers"),
  );

  const handleSort = (sortBy: string, sortOrder: "asc" | "desc") => {
    updateURL({ sortBy, sortOrder });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {companyType == "CUSTOMER" ? (
        <CustomerHeaderListPage
          searchParams={searchParams}
          stats={stats}
          onPendingChange={setIsLoading}
        />
      ) : (
        <SupplierHeaderListPage
          searchParams={searchParams}
          onPendingChange={setIsLoading}
          stats={stats}
        />
      )}

      {/* Table */}
      <CompanyListTable
        data={paginatedData.data}
        pagination={paginatedData.pagination}
        type={companyType}
        onSort={handleSort}
        paginationLimit={searchParams.limit}
        isLoading={isLoading}
      />
    </div>
  );
}
