import { CurrencyListApiResponse } from "@/types/currency-types";
import { CurrencyQueryInput } from "@mini-erp/shared";
import { CurrenciesTable } from "./currencies-table";
import { DataPagination } from "@/components/ui/data-pagination";

interface Props {
  queryParams: CurrencyQueryInput;
  currenciesList: CurrencyListApiResponse;
}

export default function CurrenciesContent({ queryParams, currenciesList }: Props) {
  const { data: currencies, pagination } = currenciesList;
  return (
    <>
      {/* Table */}
      <CurrenciesTable currencies={currencies} isLoading={false} />
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
    </>
  );
}
