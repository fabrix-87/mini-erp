"use client";

import { useTransition } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateURL } from "@/hooks/use-update-url"; 

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  /** Label per il conteggio, es. "utenti", "clienti", "prodotti" */
  itemLabel?: string;
  /** Opzioni per il selettore "righe per pagina" */
  pageSizeOptions?: number[];
}

/**
 * Generic pagination component that uses the useUpdateURL hook
 * for state synchronization and navigation.
 */
export function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  hasNextPage,
  hasPrevPage,
  itemLabel = "elementi",
  pageSizeOptions = [10, 20, 50, 100],
}: DataPaginationProps) {
  // Inizializziamo l'hook senza passare un path fisso: userà dinamicamente quello corrente
  const updateURL = useUpdateURL();
  const [isPending, startTransition] = useTransition();

  /**
   * Navigates to the specified page.
   */
  const navigateToPage = (page: number) => {
    startTransition(() => {
      // Passiamo una stringa vuota "" come path per indicare la route corrente
      updateURL("", { page }, { scroll: false });
    });
  };

  /**
   * Changes the page size and resets to the first page.
   */
  const changeLimit = (newLimit: string) => {
    startTransition(() => {
      updateURL(
        "",
        { limit: Number(newLimit) },
        {
          scroll: false,
          resetPage: true, // L'hook si occuperà autonomamente di azzerare la chiave "page"
        },
      );
    });
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="border-t px-4 py-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Info */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Visualizzati <span className="font-medium">{startItem}</span> -{" "}
            <span className="font-medium">{endItem}</span> di{" "}
            <span className="font-medium">{totalItems}</span> {itemLabel}
          </p>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostra:</span>
            <Select value={limit.toString()} onValueChange={changeLimit} disabled={isPending}>
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(1)}
            disabled={!hasPrevPage || isPending}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Prima pagina</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(currentPage - 1)}
            disabled={!hasPrevPage || isPending}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Pagina precedente</span>
          </Button>

          <div className="flex items-center gap-1 text-sm select-none">
            <span className="text-muted-foreground">Pagina</span>
            <span className="font-medium">{currentPage}</span>
            <span className="text-muted-foreground">di</span>
            <span className="font-medium">{totalPages || 1}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(currentPage + 1)}
            disabled={!hasNextPage || isPending}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Pagina successiva</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(totalPages)}
            disabled={!hasNextPage || isPending}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Ultima pagina</span>
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Aggiornamento dati in corso...
        </div>
      )}
    </div>
  );
}
