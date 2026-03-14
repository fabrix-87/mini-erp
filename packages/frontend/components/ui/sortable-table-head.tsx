// packages/frontend/components/ui/sortable-table-head.tsx
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';

export type SortOrder = 'asc' | 'desc';

export interface SortState<TField extends string> {
  field: TField;
  order: SortOrder;
}

interface SortableTableHeadProps<TField extends string> {
  /** The sort field this header controls */
  field: TField;
  /** Current sort state */
  sort: SortState<TField>;
  /** Callback when header is clicked */
  onSort: (field: TField) => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Generic sortable table header cell.
 * Uses a type parameter for the sort field to preserve type safety
 * across different entity sort enums/types.
 */
export function SortableTableHead<TField extends string>({
  field,
  sort,
  onSort,
  children,
  className,
}: SortableTableHeadProps<TField>) {
  const isActive = sort.field === field;

  return (
    <TableHead
      className={`cursor-pointer select-none hover:bg-muted/50 ${className ?? ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {isActive ? (
          sort.order === 'asc' ? (
            <ArrowUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ArrowDown className="h-3 w-3 text-muted-foreground" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-40" />
        )}
      </div>
    </TableHead>
  );
}
