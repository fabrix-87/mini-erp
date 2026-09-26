import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/data-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableTableHead, type SortState } from "@/components/ui/sortable-table-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateIT } from "@/helpers/date-helper";
import { useNavigation } from "@/hooks/use-navigation";
import { useUpdateURL } from "@/hooks/use-update-url";
import { getRoute } from "@/lib/navigation-routes";
import {
  EntityPermissions,
  PaginationInfo,
  UpdateWarehouseFormValues,
  Warehouse,
  WarehouseSortFields,
} from "@mini-erp/shared";
import { Eye, MoreHorizontal, Pencil, ShieldMinus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactElement, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/dialog/delete-dialog";
import { deleteWarehouseAction, updateWarehouseAction } from "@/actions/warehouse-actions";
import { toast } from "sonner";
import { WarehouseFormSheet } from "./warehouse-form-sheet";

interface WarehouseListPageProps {
  warehouses: Warehouse[];
  pagination: PaginationInfo;
  isLoading: boolean;
  sortOrder: "asc" | "desc";
  sortField: WarehouseSortFields;
  permissions: EntityPermissions;
}

export function WarehouseListTable({
  warehouses,
  pagination,
  isLoading,
  sortOrder,
  sortField,
  permissions,
}: WarehouseListPageProps): ReactElement {
  const t = useTranslations("warehouse");
  const tc = useTranslations("common");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const basePath = useMemo(() => getRoute("warehouses"), []);
  const updateURL = useUpdateURL(basePath);
  const { navigateToDetail, navigateToEdit } = useNavigation();

  const sort: SortState<WarehouseSortFields> = {
    field: sortField,
    order: sortOrder ?? "asc",
  };

  const onSortChange = (field: WarehouseSortFields): void => {
    const newOrder = sort.field === field && sort.order === "asc" ? "desc" : "asc";
    updateURL({ sortBy: field, sortOrder: newOrder });
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteWarehouseAction(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    if (result.success) {
      toast.success(t("deleteSuccess"));
    } else {
      toast.error(result.error ?? t("deleteError"));
    }
  };

  const updateSubmit = async (data: UpdateWarehouseFormValues, warehouseId: string) => {
    const result = await updateWarehouseAction(data, warehouseId);
    if (result.success && result.data) {
      toast.success(t("updateSuccess"));
    } else {
      toast.error(result.error ?? t("updateError"));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead field="code" sort={sort} onSort={onSortChange}>
                {t("tableFields.code")}
              </SortableTableHead>
              <SortableTableHead field="name" sort={sort} onSort={onSortChange}>
                {t("tableFields.name")}
              </SortableTableHead>
              <SortableTableHead field="type" sort={sort} onSort={onSortChange}>
                {t("tableFields.type")}
              </SortableTableHead>
              <SortableTableHead field="location" sort={sort} onSort={onSortChange}>
                {t("tableFields.location")}
              </SortableTableHead>
              <SortableTableHead field="createdAt" sort={sort} onSort={onSortChange}>
                {t("tableFields.createdAt")}
              </SortableTableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {t("noResults")}
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((w) => (
                <TableRow
                  key={w.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigateToDetail("warehouses", w.id)}
                >
                  <TableCell>{w.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{w.name}</span>
                      {w.isDefault && (
                        <Badge className="text-xs font-normal">{t("tableFields.default")}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{t(`types.${w.type}`)}</span>
                      {w.supplier && <Badge variant="secondary">{w.supplier.company.companyName}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{w.location}</TableCell>
                  <TableCell>{formatDateIT(w.createdAt)}</TableCell>
                  {/* Row actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label={tc("actions.label")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigateToDetail("warehouses", String(w.id))}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {tc("actions.view")}
                        </DropdownMenuItem>
                        {permissions.canUpdate && (
                          <DropdownMenuItem onClick={() => setSelectedWarehouse(w)}>
                            <Pencil className="mr-2 h-4 w-4" /> {tc("actions.edit")}
                          </DropdownMenuItem>
                        )}
                        {permissions.canUpdate && w.active && !w.isDefault && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => navigateToEdit("warehouses", String(w.id))}
                            >
                              <ShieldMinus className="mr-2 h-4 w-4" /> {tc("actions.disable")}
                            </DropdownMenuItem>
                          </>
                        )}
                        {permissions.canDelete && !w.hasDependencies && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteId(String(w.id))}
                              disabled={w.isDefault}
                              title={w.isDefault ? t("cantDeleteDefault") : t("canDelete")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> {tc("actions.delete")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.itemsPerPage}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel={t("itemLabel")}
        />
      )}

      <WarehouseFormSheet
        open={!!selectedWarehouse}
        onOpenChange={(open) => !open && setSelectedWarehouse(null)}
        warehouse={selectedWarehouse ?? undefined}
        updateSubmit={updateSubmit}
      />

      <DeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("deleteDialog.title")}
        handleDelete={handleDelete}
        isDeleting={isDeleting}
      >
        {t("deleteDialog.description")}
      </DeleteDialog>
    </div>
  );
}
