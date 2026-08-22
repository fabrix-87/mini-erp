"use client";

import { CurrencyListApiResponse } from "@/types/currency-types";
import { CurrencyQueryInput, EntityPermissions } from "@mini-erp/shared";
import { CurrenciesTable } from "./currencies-table";
import { DataPagination } from "@/components/ui/data-pagination";
import { CurrenciesFilterBar } from "./currencies-filter-bar";
import { useState } from "react";
import { CurrencyDetailDialog } from "./currency-detail-dialog";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";

interface Props {
  queryParams: CurrencyQueryInput;
  currenciesList: CurrencyListApiResponse;
  permissions: EntityPermissions;
}

export default function CurrenciesContent({
  queryParams,
  currenciesList,
  permissions,
}: Props) {
  const { data: currencies, pagination } = currenciesList;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const { data: currency, isLoading: isDetailLoading } = useCurrency(selectedCode);

  const t = useTranslations()

  const onDetailSelected = async (code: string) => {
    setSelectedCode(code);
  };
  const onUpdateSelected = async (code: string) => {
    toast.info(`Modifica ${code}`)
    return;
  };
  const onDeleteSelected = async (code: string) => {
    toast.info(`Elimina ${code}`)
    return;
  };


  return (
    <div className="space-y-6">     
      {/* Header */}
      <CurrenciesFilterBar
        onPendingChange={setIsLoading}
        initialActive={queryParams.active}
        initialSearch={queryParams.search}
      />
      {/* Table */}
      <CurrenciesTable
        currencies={currencies}
        isLoading={isLoading}
        permissions={permissions}
        onDetailSelected={onDetailSelected}
        onDeleteSelected={onDeleteSelected}
        onUpdateSelected={onUpdateSelected}
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
      {/* Details dialog */}
      <CurrencyDetailDialog
        currency={currency ?? null}
        open={!!selectedCode}
        onOpenChange={(open) => !open && setSelectedCode(null)}
        isLoading={isDetailLoading}
      />
    </div>
  );
}
