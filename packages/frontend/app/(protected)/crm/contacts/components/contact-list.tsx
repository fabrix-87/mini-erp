// components/contact/contact-list.tsx
"use client";

import { useState } from "react";
import {
  useContactMutations,
  useContactExport,
  useContactBulkOperations,
} from "@/hooks/use-contact";
import type {
  ContactSortField,
  ContactQueryInput,
  ContactListApiResponse,
} from "@/types/contact-types";
import ContactBulkActions from "../../../../../components/contact/contact-list/bulk-actions";
import ContactTable from "./contact-table";
import { DataPagination } from "../../../../../components/ui/data-pagination";
import { useUpdateURL } from "@/hooks/use-update-url";
import { useNavigation } from "@/hooks/use-navigation";
import { useTranslations } from "next-intl";
import { BreadcrumbSetter } from "@/components/ui/breadcrumb-setter";
import ContactFilterBar from "./contact-filter-bar";

interface Props {
  data: ContactListApiResponse;
  params: ContactQueryInput;
}

export default function ContactListPage({ data, params }: Props) {
  const { navigateToNew, navigateToEdit, navigateToDetail, getRoute } = useNavigation();
  const updateURL = useUpdateURL(getRoute("contacts"));
  const t = useTranslations();

  // Hook semplice per la lista (si sincronizza con SSR)
  const { data: contacts, pagination } = data;

  // Hook per mutazioni
  const { deleteContact, toggleActive, isPending } = useContactMutations();
  const { exportCSV, exportExcel, isExporting } = useContactExport();
  const { bulkDelete, bulkActivate, bulkDeactivate, isProcessing } = useContactBulkOperations();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Gestisci sort e filters localmente (derivati da params)
  const sort = {
    field: params.sortBy || "firstName",
    order: params.sortOrder || "asc",
  };

  const handleResetFilters = () => {
    updateURL({}, { replace: true, clearAll: true });
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
      <BreadcrumbSetter title={t("crm.contacts.title")} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.contacts")}</h1>
          <p className="text-muted-foreground">{t("crm.contacts.description")}</p>
        </div>
      </div>

      <ContactFilterBar
        filters={params}
        onExport={exportExcel}
        isExporting={isExporting}
        canCreate={true}
        onPendingChange={setIsLoading}
      />

      <ContactBulkActions
        selectedIds={selectedIds}
        onActivate={async () => {
          await bulkActivate(selectedIds);
          setSelectedIds([]);
        }}
        onDeactivate={async () => {
          await bulkDeactivate(selectedIds);
          setSelectedIds([]);
        }}
        onDelete={async () => {
          await bulkDelete(selectedIds);
          setSelectedIds([]);
        }}
        isProcessing={isProcessing}
      />

      <ContactTable
        contacts={contacts}
        loading={isPending || isLoading}
        selectedIds={selectedIds}
        onSelectAll={(checked) => setSelectedIds(checked ? contacts.map((c) => c.id) : [])}
        onSelectOne={(id, checked) => {
          setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
        }}
        onSort={handleSort}
        sort={sort}
        onView={(id) => navigateToDetail("contacts", id)}
        onEdit={(id) => navigateToEdit("contacts", id)}
        onDelete={async (id) => {
          if (confirm("Sei sicuro di voler eliminare questo contatto?")) {
            await deleteContact(id);
          }
        }}
        onToggleActive={async (id, active) => {
          await toggleActive(id, !active);
        }}
      />

      {pagination && pagination.totalPages > 0 && (
        <DataPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={params.limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          itemLabel={t('nav.contacts')}
        />
      )}
    </div>
  );
}
