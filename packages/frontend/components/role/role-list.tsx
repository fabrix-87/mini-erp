"use client";

import { RoleQueryInput, RoleSortField, SortOrder } from "@mini-erp/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { DataPagination } from "../ui/data-pagination";
import { BreadcrumbSetter } from "../ui/breadcrumb-setter";
import RoleTable from "./role-list/table";
import RoleToolbar from "./role-list/toolbar";
import DeleteDialog from "../dialog/delete-dialog";
import { useUpdateURL } from "@/hooks/use-update-url";
import { RoleListApiResponse } from "@/types/role-types";
import { deleteRoleAction } from "@/actions/role-actions";
import { toast } from "sonner";
import { useNavigation } from "@/hooks/use-navigation";

interface Props {
  data: RoleListApiResponse;
}

export default function RoleListPage({ data }: Props) {
  const searchParams = useSearchParams();
  const { refresh, navigateToNew, navigateToDetail, navigateToEdit } = useNavigation();

  const { data: roles, pagination, results } = data;
  const [isPending, startTransition] = useTransition();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");

  // Memoizza params per evitare re-render
  const params = useMemo((): RoleQueryInput => {
    return {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") as RoleSortField) || "code",
      sortOrder: (searchParams.get("sortOrder") as SortOrder) || "asc",
    };
  }, [searchParams]);

  // Gestisci sort e filters localmente (derivati da params)
  const sort = {
    field: params.sortBy || "firstName",
    order: params.sortOrder || "asc",
  };

  const updateURL = useUpdateURL("/settings/roles");

  const handleSearch = (searchTerm: string) => {
    updateURL({ search: searchTerm }, { replace: true });
  };

  const handleSort = (field: RoleSortField) => {
    const newOrder = sort.field === field && sort.order === "asc" ? "desc" : "asc";
    updateURL({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    updateURL({ ...newFilters, page: 1 });
  };

  // ── Delete role ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (selectedRoleId !== null) {
      startTransition(async () => {
        setSelectedRoleId(null);
        setShowDeleteDialog(false);
        const result = await deleteRoleAction(selectedRoleId);
        if (result.success) {
          toast.success(`Layout ${selectedRoleName} eliminato`);
          refresh();
        } else {
          toast.error("Errore eliminazione ruolo");
        }
        setSelectedRoleName("");
      });
    } else {
      toast.error("Nessun ruolo selezionato");
      console.error("No role selected");
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbSetter title="Gestione ruoli" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ruoli</h1>
          <p className="text-muted-foreground">Gestisci i ruoli degli utenti</p>
        </div>
      </div>

      <RoleToolbar
        onSearch={handleSearch}
        onNewRole={() => navigateToNew("roles")}
        initialSearch={params.search || ""}
      />

      <RoleTable
        roles={roles}
        onSort={handleSort}
        sort={sort}
        loading={isPending}
        onView={(id) => navigateToDetail("roles", id)}
        onEdit={(id) => navigateToEdit("roles", id)}
        onDelete={async (id, name) => {
          setSelectedRoleId(id);
          setSelectedRoleName(name);
          setShowDeleteDialog(true);
        }}
      />
      {pagination && pagination.totalPages > 1 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={params.limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel="ruoli"
        />
      )}

      {/* ── Delete confirmation ── */}
      <DeleteDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        handleDelete={handleDelete}
        title="Elimina ruolo"
        isDeleting={isPending}
      >
        Sei sicuro di voler eliminare il ruolo <strong>{selectedRoleName}</strong>?
        <br />
        Questa operazione non può essere annullata e rimuoverà il ruolo da tutti gli utenti
        associati.
      </DeleteDialog>
    </div>
  );
}
