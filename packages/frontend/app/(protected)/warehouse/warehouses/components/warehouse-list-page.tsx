"use client";

import {
  CreateWarehouseFormValues,
  EntityPermissions,
  PaginationInfo,
  Warehouse,
  WarehouseListStats,
  WarehouseQueryInput,
} from "@mini-erp/shared";
import { ReactElement, useState } from "react";
import { WarehouseListTable } from "./warehouse-list-table";
import { ActionToolbar } from "@/components/action-toolbar";
import { WarehouseFormSheet } from "./warehouse-form-sheet";
import { toast } from "sonner";
import { createWarehouseAction } from "@/actions/warehouse-actions";
import { useTranslations } from "next-intl";
import { WarehouseFilters } from "./warehouse-filters";
import { WarehouseListStatsBar } from "./warehouse-list-stats-bar";

interface WarehouseListPageProps {
  warehouses: Warehouse[];
  stats: WarehouseListStats;
  pagination: PaginationInfo;
  searchParams: WarehouseQueryInput;
  permissions: EntityPermissions;
}

export function WarehouseListPage({
  warehouses,
  stats,
  pagination,
  searchParams,
  permissions,
}: WarehouseListPageProps): ReactElement {
  const [isLoading, setLoading] = useState(false);
  const t = useTranslations("warehouse");

  const createSubmit = async (data: CreateWarehouseFormValues) => {
    const result = await createWarehouseAction(data);
    if (result.success && result.data) {
      toast.success(t("createSuccess"));
    } else {
      toast.error(result.error ?? t("createError"));
    }
  };

  return (
    <>
      <WarehouseListStatsBar stats={stats} />
      <WarehouseFilters searchParams={searchParams} onPendingChange={setLoading} />
      <ActionToolbar
        ariaLabelKey="warehouse.toolbar.ariaLabel"
        buttons={[
          {
            type: "sheet",
            mode: "custom",
            key: "new-warehouse",
            labelKey: "warehouse.createNewButton",
            renderSheet: ({ open, onOpenChange }) => (
              <WarehouseFormSheet
                onOpenChange={onOpenChange}
                open={open}
                createSubmit={createSubmit}
              />
            ),
          },
        ]}
      />
      <WarehouseListTable
        warehouses={warehouses}
        isLoading={isLoading}
        pagination={pagination}
        permissions={permissions}
        sortField={searchParams.sortBy}
        sortOrder={searchParams.sortOrder}
      />
    </>
  );
}
