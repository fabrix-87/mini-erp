"use client";

import { DataPagination } from "@/components/data-pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/format-currency";
import { EntityPermissions, PaginationInfo, Product } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

// ============================================================================
// Props
// ============================================================================

interface ProductTableProps {
  data: Product[];
  pagination: PaginationInfo | undefined;
  permissions: EntityPermissions;
}

export function ProductTable({ data, pagination, permissions }: ProductTableProps) {
  const t = useTranslations("catalog.products");

  return (
    <div className="flex flex-col gap-2">
      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("table.reference")}</TableHead>
              <TableHead>{t("table.description")}</TableHead>
              <TableHead>{t("table.status")}</TableHead>
              <TableHead>{t("table.active")}</TableHead>
              <TableHead>{t("table.price")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {t("table.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.reference}</TableCell>
                  <TableCell>TODO: Descrizione in lingua</TableCell>
                  <TableCell>{product.status}</TableCell>
                  <TableCell>
                    <Badge variant={product.active ? "default" : "destructive"}>
                      {product.active ? "Attivo" : "Disattivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      {pagination && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.itemsPerPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel={t("table.paginationLabel")}
        />
      )}
    </div>
  );
}
