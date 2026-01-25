// components/contact/contact-list.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useContactsList, 
  useContactMutations,
  useContactExport,
  useContactBulkOperations,
} from "@/hooks/use-contact";
import type { ContactSortField, ContactQueryInput } from "@/types/contact";
import ContactToolbar from "./contact-list/toolbar";
import ContactFilters from "./contact-list/filters";
import ContactBulkActions from "./contact-list/bulk-actions";
import ContactTable from "./contact-list/table";
import ContactPagination from "./contact-list/pagination";
import { SortOrder } from "@mini-erp/shared/constants";

export default function ContactListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Memoizza params per evitare re-render
  const params = useMemo((): ContactQueryInput => {
    return {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") as ContactSortField) || "firstName",
      sortOrder: (searchParams.get("sortOrder") as SortOrder) || "asc",
      companyId: searchParams.get("companyId") ? Number(searchParams.get("companyId")) : undefined,
      active: searchParams.get("active") ? searchParams.get("active") === "true" : undefined,
      isPrimaryContact: searchParams.get("isPrimaryContact") ? searchParams.get("isPrimaryContact") === "true" : undefined,
      department: searchParams.get("department") || undefined,
      position: searchParams.get("position") || undefined,
    };
  }, [searchParams]);

  // Hook semplice per la lista (si sincronizza con SSR)
  const { contacts, loading, pagination, refetch } = useContactsList(params);

  // Hook per mutazioni
  const { deleteContact, toggleActive, setPrimary } = useContactMutations();
  const { exportCSV, exportExcel, isExporting } = useContactExport();
  const { bulkDelete, bulkActivate, bulkDeactivate, isProcessing } = useContactBulkOperations();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Gestisci sort e filters localmente (derivati da params)
  const sort = {
    field: params.sortBy || "firstName",
    order: params.sortOrder || "asc",
  };

  const filters = {
    search: params.search,
    companyId: params.companyId,
    active: params.active,
    isPrimaryContact: params.isPrimaryContact,
    department: params.department,
    position: params.position,
  };

  const updateURL = (newParams: Partial<ContactQueryInput>) => {
    const urlParams = new URLSearchParams();
    const merged = { ...params, ...newParams };
    
    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.set(key, String(value));
      }
    });
    
    router.push(`/contacts?${urlParams.toString()}`, { scroll: false });
  };

  const handleSearch = (searchTerm: string) => {
    updateURL({ search: searchTerm, page: 1 });
  };

  const handleSort = (field: ContactSortField) => {
    const newOrder = sort.field === field && sort.order === "asc" ? "desc" : "asc";
    updateURL({ sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    updateURL({ ...newFilters, page: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contatti</h1>
          <p className="text-muted-foreground">
            Gestisci i contatti delle aziende
          </p>
        </div>
      </div>

      <ContactToolbar
        onSearch={handleSearch}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onNewContact={() => router.push("/contacts/new")}
        onExport={exportExcel}
        isExporting={isExporting}
        showFilters={showFilters}
        initialSearch={params.search || ""}
      />

      {showFilters && (
        <ContactFilters filters={filters} onFilterChange={handleFilterChange} />
      )}

      <ContactBulkActions
        selectedIds={selectedIds}
        onActivate={async () => {
          await bulkActivate(selectedIds);
          setSelectedIds([]);
          await refetch();
        }}
        onDeactivate={async () => {
          await bulkDeactivate(selectedIds);
          setSelectedIds([]);
          await refetch();
        }}
        onDelete={async () => {
          await bulkDelete(selectedIds);
          setSelectedIds([]);
          await refetch();
        }}
        isProcessing={isProcessing}
      />

      <ContactTable
        contacts={contacts}
        loading={loading}
        selectedIds={selectedIds}
        onSelectAll={(checked) =>
          setSelectedIds(checked ? contacts.map((c) => c.id) : [])
        }
        onSelectOne={(id, checked) => {
          setSelectedIds((prev) =>
            checked ? [...prev, id] : prev.filter((i) => i !== id)
          );
        }}
        onSort={handleSort}
        sort={sort}
        onView={(id) => router.push(`/contacts/${id}`)}
        onEdit={(id) => router.push(`/contacts/${id}/edit`)}
        onDelete={async (id) => {
          if (confirm("Sei sicuro di voler eliminare questo contatto?")) {
            await deleteContact(id);
            await refetch();
          }
        }}
        onToggleActive={async (id, active) => {
          await toggleActive(id, !active);
          await refetch();
        }}
        onSetPrimary={async (id) => {
          await setPrimary(id);
          await refetch();
        }}
      />

      {pagination && pagination.totalPages > 1 && (
        <ContactPagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
