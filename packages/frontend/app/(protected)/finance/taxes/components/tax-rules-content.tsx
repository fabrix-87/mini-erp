"use client"

import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import { TaxListApiResponse } from "@/types/tax-types";
import { EntityPermissions, TaxRuleQueryInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TaxesFilterBar } from "./tax-rules-filter-bar";
import { DataPagination } from "@/components/ui/data-pagination";
import { TaxRuleTable } from "./tax-rules-table";

export interface TaxesContentProps {
  queryParams: TaxRuleQueryInput;
  taxesList: TaxListApiResponse;
  permissions: EntityPermissions;
}

export default function TaxesContent({ queryParams, taxesList, permissions}: TaxesContentProps) {
    const {data: taxes, pagination } = taxesList;
    const [isLoading, setIsLoading] = useState(false);

    const t = useTranslations()

    return (
        <div className="space-y-6">
          {/* Breadcrumb */}
          <BreadcrumbSetter title={t("nav.taxes")} />
    
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('nav.taxes')}</h1>
              <p className="text-muted-foreground">{t('finance.taxes.description')}</p>
            </div>
          </div>
          
          {/* Header */}
          <TaxesFilterBar
            onPendingChange={setIsLoading}
            initialActive={queryParams.active}
            initialSearch={queryParams.search}
            initialMaxRate={queryParams.maxRate?.toString() || ""}
            initialMinRate={queryParams.minRate?.toString() || ""}
            canCreate={permissions.canCreate}
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