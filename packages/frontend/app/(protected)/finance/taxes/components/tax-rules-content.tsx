"use client"

import { TaxListApiResponse } from "@/types/tax-types";
import { EntityPermissions, TaxRuleQueryInput } from "@mini-erp/shared";
import { useState } from "react";
import { TaxesFilterBar } from "./tax-rules-filter-bar";
import { DataPagination } from "@/components/ui/data-pagination";
import { TaxRuleTable } from "./tax-rules-table";

/**
 * Serializable tax-rule query values received from a Server Component.
 */
export type TaxRuleClientQueryParams = Omit<
  TaxRuleQueryInput,
  "minRate" | "maxRate"
> & {
  minRate?: string;
  maxRate?: string;
};

export interface TaxesContentProps {
  queryParams: TaxRuleClientQueryParams;
  taxesList: TaxListApiResponse;
  permissions: EntityPermissions;
}

export default function TaxesContent({ queryParams, taxesList, permissions}: TaxesContentProps) {
    const {data: taxes, pagination } = taxesList;
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="space-y-6">                   
          {/* Header */}
          <TaxesFilterBar
            onPendingChange={setIsLoading}
            initialActive={queryParams.active}
            initialSearch={queryParams.search}
            initialMaxRate={queryParams.maxRate || ""}
            initialMinRate={queryParams.minRate || ""}
          />
          {/* Table */}
          <TaxRuleTable
            taxRules={taxes}
            isLoading={isLoading}
            permissions={permissions}
            sortField={queryParams.sortBy}
            sortOrder={queryParams.sortOrder}
            onDetailSelected={() => {}}
            onDeleteSelected={() => {}}
            onUpdateSelected={() => {}}
          />
          {/* Pagination */}
          {pagination && pagination.totalPages > 0 && (
            <DataPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              limit={queryParams.limit}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              itemLabel="Valute"
            />
          )}
        </div>
      );
}