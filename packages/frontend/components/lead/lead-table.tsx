// components/leads/lead-table.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Mail, Phone, MoreHorizontal, Pencil, Trash2, UserCheck, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
import { LeadBulkToolbar } from "./lead-bulk-toolbar";
import { toast } from "sonner";
import { deleteLeadAction } from "@/actions/lead";
import type { Lead, LeadQueryInput } from "@/types/lead";
import type { ApiResponse, PaginationInfo } from "@/types/api";
import { formatDateIT } from "@/helpers/date-helper";

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
  sort: SortState<LeadSortField>;
  onSortChange: (field: LeadSortField) => void;
  onRefresh: () => void;
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
  sort,
  onSortChange,
  onRefresh,
}: LeadTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---- Selection handlers ----

  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const toggleAll = () => setSelectedIds(allSelected ? [] : data.map((l) => l.id));

  const toggleOne = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  // ---- Delete handler ----

  const handleDelete = async () => {
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
    }
  };

  // ---- Render ----

  if (isLoading) return <LeadTableSkeleton />;

  return (
    <div className="flex flex-col gap-2">
      {/* Bulk toolbar */}
      <LeadBulkToolbar
        selectedIds={selectedIds}
        onClearSelection={clearSelection}
        onSuccess={onRefresh}
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select all */}
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Seleziona tutti"
                />
              </TableHead>

              <SortableTableHead field="companyName" sort={sort} onSort={onSortChange}>
                Lead
              </SortableTableHead>

              <SortableTableHead field="score" sort={sort} onSort={onSortChange} className="w-24">
                Score
              </SortableTableHead>

              <SortableTableHead field="status" sort={sort} onSort={onSortChange} className="w-36">
                Status
              </SortableTableHead>

              <TableHead>Contatto</TableHead>

              <SortableTableHead field="quality" sort={sort} onSort={onSortChange} className="w-24">
                Qualità
              </SortableTableHead>

              <TableHead className="w-36">Fonte</TableHead>

              <SortableTableHead
                field="nextFollowUpDate"
                sort={sort}
                onSort={onSortChange}
                className="w-32"
              >
                Follow-up
              </SortableTableHead>

              <SortableTableHead
                field="createdAt"
                sort={sort}
                onSort={onSortChange}
                className="w-28"
              >
                Creato
              </SortableTableHead>

              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  Nessun lead trovato
                </TableCell>
              </TableRow>
            ) : (
              data.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  data-state={selectedIds.includes(lead.id) ? "selected" : undefined}
                >
                  {/* Checkbox */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(lead.id)}
                      onCheckedChange={() => toggleOne(lead.id)}
                      aria-label={`Seleziona ${lead.companyName}`}
                    />
                  </TableCell>

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
                      {new Date(lead.createdAt).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
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
                        <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizza
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}/edit`)}>
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
