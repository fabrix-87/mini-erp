"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useContacts,
  useContactMutations,
  useContactExport,
  useContactBulkOperations,
} from "@/hooks/use-contact";
import type { ContactSortField } from "@/types/contact";
import ContactToolbar from "./contact-list/toolbar";
import ContactFilters from "./contact-list/filters";
import ContactBulkActions from "./contact-list/bulk-actions";
import ContactTable from "./contact-list/table";
import ContactPagination from "./contact-list/pagination";

export default function ContactListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    contacts,
    loading,
    pagination,
    filters,
    setFilters,
    sort,
    setSort,
    refetch,
  } = useContacts({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 20,
    search: searchParams.get("search") || undefined,
    sortBy: (searchParams.get("sortBy") as ContactSortField) || "firstName",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
  });

  const { deleteContact, toggleActive, setPrimary } = useContactMutations();
  const { exportCSV, exportExcel, isExporting } = useContactExport();
  const { bulkDelete, bulkActivate, bulkDeactivate, isProcessing } =
    useContactBulkOperations();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const updateURL = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleSort = (field: ContactSortField) => {
    const newOrder =
      sort.field === field && sort.order === "asc" ? "desc" : "asc";
    setSort(field, newOrder);
    updateURL({ ...filters, sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
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
        initialSearch={searchParams.get("search") || ""}
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
