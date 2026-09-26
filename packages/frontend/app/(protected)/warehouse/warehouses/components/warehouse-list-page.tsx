"use client";

import {
  EntityPermissions,
  PaginationInfo,
  Warehouse,
  WarehouseQueryInput,
} from "@mini-erp/shared";
import { ReactElement, useState } from "react";
import { WarehouseListTable } from "./warehouse-list-table";

interface WarehouseListPageProps {
  warehouses: Warehouse[];
  pagination: PaginationInfo;
  searchParams: WarehouseQueryInput;
  permissions: EntityPermissions;
}

export function WarehouseListPage({
  warehouses,
  pagination,
  searchParams,
  permissions,
}: WarehouseListPageProps): ReactElement {
  const [isLoading, setLoading] = useState(false);

  return (
    <WarehouseListTable
      warehouses={warehouses}
      isLoading={isLoading}
      pagination={pagination}
      permissions={permissions}
      sortField={searchParams.sortBy}
      sortOrder={searchParams.sortOrder}
    />
  );
}
