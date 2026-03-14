// packages/frontend/components/ui/data-pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
 * Generic pagination component that uses URL search params (page, limit)
 * for navigation. Can be reused across all list sections.
 */
export function DataPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  hasNextPage,
  hasPrevPage,
  itemLabel = 'elementi',
  pageSizeOptions = [10, 20, 50, 100],
}: DataPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * Navigates to the specified page while preserving existing search params.
   */
  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  /**
   * Changes the page size and resets to first page.
   */
  const changeLimit = (newLimit: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit);
    params.delete('page');

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="border-t px-4 py-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Info */}
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Visualizzati <span className="font-medium">{startItem}</span> -{' '}
            <span className="font-medium">{endItem}</span> di{' '}
            <span className="font-medium">{totalItems}</span> {itemLabel}
          </p>

          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostra:</span>
            <Select value={limit.toString()} onValueChange={changeLimit} disabled={isPending}>
              <SelectTrigger className="h-8 w-17.5">
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

          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Pagina</span>
            <span className="font-medium">{currentPage}</span>
            <span className="text-muted-foreground">di</span>
            <span className="font-medium">{totalPages}</span>
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
        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Caricamento...
        </div>
      )}
    </div>
  );
}
