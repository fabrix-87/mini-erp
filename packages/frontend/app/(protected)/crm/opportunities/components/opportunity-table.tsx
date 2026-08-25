"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Eye, TrendingUp } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type { OpportunityListItem, OpportunityQueryInput } from "@/types/opportunity-types";
import type {
  EntityPermissions,
  PaginationInfo,
  SalesStage,
  OpportunityStatus,
} from "@mini-erp/shared";
import { formatDateIT } from "@/helpers/date-helper";
import { formatCurrency } from "@/utils/format-currency";
import { useTranslations } from "next-intl";
import { getRoute } from "@/lib/navigation-routes";
import { useUpdateURL } from "@/hooks/use-update-url";
import { useNavigation } from "@/hooks/use-navigation";
import { toast } from "sonner";
import { deleteOpportunityAction } from "@/actions/opportunity-actions";

// ============================================================================
// Types
// ============================================================================

type OpportunitySortField = NonNullable<OpportunityQueryInput["sortBy"]>;

// ============================================================================
// Badges
// ============================================================================

const STATUS_STYLES: Record<OpportunityStatus, string> = {
  OPEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  WON: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  CLOSED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const STAGE_STYLES: Record<SalesStage, string> = {
  LEAD_QUALIFICATION: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  PROSPECTING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  NEEDS_ANALYSIS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  PROPOSAL_SENT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  NEGOTIATION: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  COMMITMENT: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

function OpportunityStatusBadge({ status }: { status: OpportunityStatus }): React.ReactElement {
  const t = useTranslations("crm.opportunities.status");
  return (
    <Badge variant="outline" className={`text-xs font-medium ${STATUS_STYLES[status]}`}>
      {t(status.toLowerCase())}
    </Badge>
  );
}

function OpportunityStageBadge({ stage }: { stage: SalesStage }): React.ReactElement {
  const t = useTranslations("crm.opportunities.stage");
  return (
    <Badge variant="outline" className={`text-xs font-medium ${STAGE_STYLES[stage]}`}>
      {t(stage.toLowerCase())}
    </Badge>
  );
}

// ============================================================================
// Skeleton
// ============================================================================

function OpportunityTableSkeleton(): React.ReactElement {
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

interface OpportunityTableProps {
  data: OpportunityListItem[];
  pagination: PaginationInfo | undefined;
  isLoading: boolean;
  sortOrder: "asc" | "desc";
  sortField: OpportunitySortField;
  permissions: EntityPermissions;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Opportunity list table with sortable columns, inline row actions,
 * delete confirmation dialog and pagination.
 */
export function OpportunityTable({
  data,
  pagination,
  isLoading,
  sortOrder,
  sortField,
  permissions,
}: OpportunityTableProps): React.ReactElement {
  const t = useTranslations("crm.opportunities");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const basePath = useMemo(() => getRoute("opportunities"), []);
  const updateURL = useUpdateURL(basePath);
  const { navigateToDetail, navigateToEdit } = useNavigation();

  const sort: SortState<OpportunitySortField> = {
    field: sortField,
    order: sortOrder ?? "asc",
  };

  const onSortChange = (field: OpportunitySortField): void => {
    const newOrder = sort.field === field && sort.order === "asc" ? "desc" : "asc";
    updateURL({ sortBy: field, sortOrder: newOrder });
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteOpportunityAction(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
    if (result.success) {
      toast.success(t("deleteSuccess"));
    } else {
      toast.error(result.error ?? t("deleteError"));
    }
  };

  if (isLoading) return <OpportunityTableSkeleton />;

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead field="title" sort={sort} onSort={onSortChange}>
                {t("tableFields.opportunity")}
              </SortableTableHead>
              <SortableTableHead field="status" sort={sort} onSort={onSortChange} className="w-32">
                {t("tableFields.status")}
              </SortableTableHead>
              <SortableTableHead field="stage" sort={sort} onSort={onSortChange} className="w-40">
                {t("tableFields.stage")}
              </SortableTableHead>
              <SortableTableHead
                field="estimatedValue"
                sort={sort}
                onSort={onSortChange}
                className="w-36 text-right"
              >
                {t("tableFields.estimatedValue")}
              </SortableTableHead>
              <TableHead className="w-16 text-right">{t("tableFields.probability")}</TableHead>
              <SortableTableHead
                field="expectedCloseDate"
                sort={sort}
                onSort={onSortChange}
                className="w-32"
              >
                {t("tableFields.expectedCloseDate")}
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
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  {t("no_results")}
                </TableCell>
              </TableRow>
            ) : (
              data.map((opp) => (
                <TableRow
                  key={opp.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => navigateToDetail("opportunities", String(opp.id))}
                >
                  {/* Title + customer */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium leading-tight">{opp.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {opp.customerName}
                        {opp.assignedUserName && (
                          <>
                            {" "}
                            · <TrendingUp className="inline h-3 w-3 mr-0.5" />
                            {opp.assignedUserName}
                          </>
                        )}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <OpportunityStatusBadge status={opp.status} />
                  </TableCell>

                  {/* Stage */}
                  <TableCell>
                    <OpportunityStageBadge stage={opp.stage} />
                  </TableCell>

                  {/* Estimated value */}
                  <TableCell className="text-right tabular-nums">
                    {opp.estimatedValue != null ? (
                      formatCurrency(opp.estimatedValue)
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* Probability */}
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={
                        opp.probability >= 70
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : opp.probability >= 40
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-muted-foreground"
                      }
                    >
                      {opp.probability}%
                    </span>
                  </TableCell>

                  {/* Expected close */}
                  <TableCell>
                    {opp.expectedCloseDate ? (
                      <span className="text-xs text-muted-foreground">
                        {formatDateIT(opp.expectedCloseDate)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* Created at */}
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatDateIT(opp.createdAt)}
                    </span>
                  </TableCell>

                  {/* Row actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          aria-label={t("actions.label")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigateToDetail("opportunities", String(opp.id))}
                        >
                          <Eye className="mr-2 h-4 w-4" /> {t("actions.view")}
                        </DropdownMenuItem>
                        {permissions.canUpdate && (
                          <DropdownMenuItem
                            onClick={() => navigateToEdit("opportunities", String(opp.id))}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> {t("actions.edit")}
                          </DropdownMenuItem>
                        )}
                        {permissions.canDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteId(String(opp.id))}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> {t("actions.delete")}
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteDialog.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t("deleteDialog.deleting") : t("deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
