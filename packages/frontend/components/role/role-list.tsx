"use client";

import { useRoleMutations, useRoles } from "@/hooks/use-role";
import { RoleQueryInput, RoleSortField, SortOrder } from "@mini-erp/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DataPagination } from "../ui/data-pagination";
import { BreadcrumbSetter } from "../ui/breadcrumb-setter";
import RoleTable from "./role-list/table";
import { mergeSearchParams } from "@/lib/utils/url";
import RoleToolbar from "./role-list/toolbar";
import DeleteDialog from "../dialog/delete-dialog";

export default function RoleListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number|null>(null);
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

  const { roles, loading, pagination, refetch } = useRoles(params);
  const { deleteRole } = useRoleMutations();

  // Gestisci sort e filters localmente (derivati da params)
  const sort = {
    field: params.sortBy || "firstName",
    order: params.sortOrder || "asc",
  };

  const updateURL = (newParams: Partial<RoleQueryInput>) => {
    const qs = mergeSearchParams(params, newParams);
    router.push(`/settings/roles?${qs}`, { scroll: false });
  };

  const handleSearch = (searchTerm: string) => {
    updateURL({ search: searchTerm, page: 1 });
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
      setIsDeleting(true);
      await deleteRole(selectedRoleId);
      await refetch();
      setSelectedRoleId(null);
      setSelectedRoleName("");
      setShowDeleteDialog(false);
      setIsDeleting(false);
    } else {
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
        onNewRole={() => router.push("/settings/roles/new")}
        initialSearch={params.search || ""}
      />

      <RoleTable
        roles={roles}
        loading={loading}
        onSort={handleSort}
        sort={sort}
        onView={(id) => router.push(`/settings/roles/${id}`)}
        onEdit={(id) => router.push(`/settings/roles/${id}/edit`)}
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
        isDeleting={isDeleting}
      >
        Sei sicuro di voler eliminare il ruolo <strong>{selectedRoleName}</strong>? Questa
        operazione non può essere annullata e rimuoverà il ruolo da tutti gli utenti associati.
      </DeleteDialog>
    </div>
  );
}
