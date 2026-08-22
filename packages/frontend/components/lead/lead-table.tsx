// components/leads/lead-table.tsx
"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, MoreHorizontal, Pencil, Trash2, UserCheck, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SortableTableHead, type SortState } from "@/components/ui/sortable-table-head";
import { DataPagination } from "@/components/ui/data-pagination";
import { LeadStatusBadge } from "./lead-status-badge";
import { LeadQualityBadge } from "./lead-quality-badge";
import { LeadSourceBadge } from "./lead-source-badge";
import { LeadScoreDisplay } from "./lead-score-display";
import type { Lead } from "@/types/lead-types";
import type { PaginationInfo } from "@/types/api";
import { formatDateIT } from "@/helpers/date-helper";
import { EntityPermissions } from "@mini-erp/shared";
import { useTranslations } from "next-intl";
import { getRoute } from "@/lib/navigation-routes";
import { useUpdateURL } from "@/hooks/use-update-url";
import { useNavigation } from "@/hooks/use-navigation";

// ============================================================================
// Sort field type — matches leadQuerySchema sortBy enum
// ============================================================================

type LeadSortField =
  | "code"
  | "companyName"
  | "status"
  | "quality"
  | "score"
  | "estimatedValue"
  | "nextFollowUpDate"
  | "createdAt"
  | "lastContactDate";

// ============================================================================
// Loading Skeleton
// ============================================================================

function LeadTableSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ============================================================================
// Props
// ============================================================================

interface LeadTableProps {
  data: Lead[];
  pagination: PaginationInfo | undefined;
  isLoading: boolean;
  sortOrder: "asc" | "desc";
  sortField: LeadSortField;
  permissions: EntityPermissions;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Lead list table with sortable columns, bulk selection,
 * inline row actions (view, edit, delete) and pagination.
 */
export function LeadTable({
  data,
  pagination,
  isLoading,
  sortOrder,
  sortField,
  permissions,
}: LeadTableProps) {
  const t = useTranslations("crm.leads");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const basePath = useMemo(() => getRoute("leads"), [getRoute]);
  const updateURL = useUpdateURL(basePath);
  const { navigateToDetail, navigateToEdit } = useNavigation();

  const sort: SortState<LeadSortField> = {
    field: sortField,
    order: sortOrder || "asc",
  };

  const onSortChange = (field: LeadSortField) => {
    const newOrder = sort.field === field && sort.order === "asc" ? "desc" : "asc";
    updateURL({ sortBy: field, sortOrder: newOrder });
  };

  // ---- Delete handler ----

  const handleDelete = async () => {
    console.log("delete lead");
    return; /*
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteLeadAction(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    if (result.success) {
      toast.success("Lead eliminata");
      clearSelection();
      onRefresh();
    } else {
      toast.error(result.error ?? "Errore durante l'eliminazione");
    }*/
  };

  // ---- Render ----

  if (isLoading) return <LeadTableSkeleton />;

  return (
    <div className="flex flex-col gap-2">
      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select all */}
              <SortableTableHead field="companyName" sort={sort} onSort={onSortChange}>
                {t("tableFields.lead")}
              </SortableTableHead>

              <SortableTableHead field="score" sort={sort} onSort={onSortChange} className="w-24">
                {t("tableFields.score")}
              </SortableTableHead>

              <SortableTableHead field="status" sort={sort} onSort={onSortChange} className="w-36">
                {t("tableFields.status")}
              </SortableTableHead>

              <TableHead>{t("tableFields.contact")}</TableHead>

              <SortableTableHead field="quality" sort={sort} onSort={onSortChange} className="w-24">
                {t("tableFields.quality")}
              </SortableTableHead>

              <TableHead className="w-36">{t("tableFields.source")}</TableHead>

              <SortableTableHead
                field="nextFollowUpDate"
                sort={sort}
                onSort={onSortChange}
                className="w-32"
              >
                {t("tableFields.nextFollowUpDate")}
              </SortableTableHead>

              <SortableTableHead
                field="createdAt"
                sort={sort}
                onSort={onSortChange}
                className="w-28"
              >
                {t("tableFields.createdAt")}
              </SortableTableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  {t("no_results")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigateToDetail("leads", lead.id)}
                >
                  {/* Lead info */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium leading-tight">{lead.companyName}</span>
                      <span className="text-xs text-muted-foreground">
                        {lead.code}
                        {lead.assignedUser?.username && (
                          <>
                            {" "}
                            · <UserCheck className="inline h-3 w-3 mr-0.5" />
                            {lead.assignedUser.username}
                          </>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Score */}
                  <TableCell>
                    <LeadScoreDisplay score={lead.score} showBar />
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>

                  {/* Contatto */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {lead.contactFirstName} {lead.contactLastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="max-w-35 truncate">{lead.contactEmail}</span>
                      </span>
                      {lead.contactPhone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.contactPhone}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Quality */}
                  <TableCell>
                    <LeadQualityBadge quality={lead.quality} />
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <LeadSourceBadge source={lead.source} />
                  </TableCell>

                  {/* Follow-up */}
                  <TableCell>
                    {lead.activities.length > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {formatDateIT(lead.activities[0].scheduledStart)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* Creato */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDateIT(lead.createdAt)}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label="Azioni"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigateToDetail("leads", lead.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizza
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigateToEdit("leads", lead.id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(lead.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Elimina
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
          itemLabel="lead"
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa lead?</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;operazione è irreversibile. Tutti i dati associati verranno rimossi
              definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
