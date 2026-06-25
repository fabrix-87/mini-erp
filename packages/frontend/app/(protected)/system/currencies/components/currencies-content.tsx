"use client";

import { CurrencyListApiResponse } from "@/types/currency-types";
import { Currency, CurrencyQueryInput } from "@mini-erp/shared";
import { CurrenciesTable } from "./currencies-table";
import { DataPagination } from "@/components/ui/data-pagination";
import { CurrenciesFilterBar } from "./currencies-filter-bar";
import { useState } from "react";
import { CurrencyDetailDialog } from "./currency-detail-dialog";
import { toast } from "sonner";
import { getCurrencyByCode } from "@/services/client/currency";
import { useCurrency } from "@/hooks/use-currency";

interface Props {
  queryParams: CurrencyQueryInput;
  currenciesList: CurrencyListApiResponse;
}

export default function CurrenciesContent({ queryParams, currenciesList }: Props) {
  const { data: currencies, pagination } = currenciesList;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const { data: currency, isLoading: isDetailLoading } = useCurrency(selectedCode);

  const onDetailSelected = async (code: string) => {
    setSelectedCode(code);
  };

  return (
    <>
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
        onDetailSelected={onDetailSelected}
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
    </>
  );
}
